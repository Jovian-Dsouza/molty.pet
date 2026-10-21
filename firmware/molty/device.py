"""Raspberry Pi wake-word, audio, and motion participant for Molty."""

from __future__ import annotations

import argparse
import asyncio
import json
import logging
import math
import os
import sys
import urllib.request
import uuid
from collections.abc import Coroutine
from dataclasses import dataclass, replace
from pathlib import Path
from typing import Any

from .executor import MotionExecutor
from .rpc import ACTION_RPC, CANCEL_RPC, PLAN_RPC, STATE_RPC, MotionRpcController
from .servo import DryRunServoDriver, PCA9685ServoDriver, RobotCalibration

logger = logging.getLogger("molty.device")
SAMPLE_RATE = 48_000
CHANNELS = 1
AGENT_STATE_ATTRIBUTE = "lk.agent.state"


def _env_bool(name: str, default: bool = False) -> bool:
    value = os.getenv(name)
    if value is None:
        return default
    normalized = value.strip().lower()
    if normalized in {"1", "true", "yes", "on"}:
        return True
    if normalized in {"0", "false", "no", "off"}:
        return False
    raise ValueError(f"{name} must be true or false")


def _env_int(name: str) -> int | None:
    value = os.getenv(name)
    if value is None or not value.strip():
        return None
    parsed = int(value)
    if parsed < 0:
        raise ValueError(f"{name} cannot be negative")
    return parsed


@dataclass(frozen=True, slots=True)
class DeviceConfig:
    livekit_url: str | None
    livekit_api_key: str | None
    livekit_api_secret: str | None
    token_endpoint: str | None
    token_endpoint_bearer: str | None
    device_id: str
    agent_name: str
    agent_identity_prefix: str
    wake_model: Path | None
    wake_threshold: float
    wake_debounce_seconds: float
    skip_wakeword: bool
    once: bool
    hardware: bool
    calibration_path: Path
    i2c_address: int
    input_device: int | None
    output_device: int | None
    output_device_name: str | None
    agent_join_timeout_seconds: float
    status_tones: bool
    half_duplex: bool
    half_duplex_release_seconds: float

    @classmethod
    def from_env(cls) -> DeviceConfig:
        model = os.getenv("MOLTY_WAKEWORD_MODEL")
        return cls(
            livekit_url=os.getenv("LIVEKIT_URL"),
            livekit_api_key=os.getenv("LIVEKIT_API_KEY"),
            livekit_api_secret=os.getenv("LIVEKIT_API_SECRET"),
            token_endpoint=os.getenv("MOLTY_TOKEN_ENDPOINT"),
            token_endpoint_bearer=os.getenv("MOLTY_TOKEN_ENDPOINT_BEARER"),
            device_id=os.getenv("MOLTY_DEVICE_ID", "prototype"),
            agent_name=os.getenv("MOLTY_AGENT_NAME", "molty-agent"),
            agent_identity_prefix=os.getenv("MOLTY_AGENT_IDENTITY_PREFIX", "agent-"),
            wake_model=Path(model) if model else None,
            wake_threshold=float(os.getenv("MOLTY_WAKE_THRESHOLD", "0.5")),
            wake_debounce_seconds=float(
                os.getenv("MOLTY_WAKE_DEBOUNCE_SECONDS", "1.5")
            ),
            skip_wakeword=_env_bool("MOLTY_SKIP_WAKEWORD"),
            once=_env_bool("MOLTY_ONCE"),
            hardware=_env_bool("MOLTY_HARDWARE"),
            calibration_path=Path(os.getenv("MOLTY_CALIBRATION", "calibration.json")),
            i2c_address=int(os.getenv("MOLTY_I2C_ADDRESS", "0x40"), 0),
            input_device=_env_int("MOLTY_AUDIO_INPUT_DEVICE"),
            output_device=_env_int("MOLTY_AUDIO_OUTPUT_DEVICE"),
            output_device_name=os.getenv("MOLTY_AUDIO_OUTPUT_DEVICE_NAME"),
            agent_join_timeout_seconds=float(
                os.getenv("MOLTY_AGENT_JOIN_TIMEOUT_SECONDS", "20")
            ),
            status_tones=_env_bool(
                "MOLTY_STATUS_TONES",
                default=sys.platform.startswith("linux"),
            ),
            half_duplex=_env_bool("MOLTY_HALF_DUPLEX"),
            half_duplex_release_seconds=float(
                os.getenv("MOLTY_HALF_DUPLEX_RELEASE_MS", "350")
            )
            / 1000,
        )

    def validate(self) -> None:
        if not self.livekit_url and not self.token_endpoint:
            raise ValueError("set LIVEKIT_URL or configure MOLTY_TOKEN_ENDPOINT")
        has_local_credentials = bool(
            self.livekit_url and self.livekit_api_key and self.livekit_api_secret
        )
        if not self.token_endpoint and not has_local_credentials:
            raise ValueError(
                "development auth requires LIVEKIT_URL, LIVEKIT_API_KEY, "
                "and LIVEKIT_API_SECRET"
            )
        if not self.device_id or len(self.device_id) > 64:
            raise ValueError("MOLTY_DEVICE_ID must contain 1 to 64 characters")
        if not 0 < self.wake_threshold <= 1:
            raise ValueError(
                "MOLTY_WAKE_THRESHOLD must be greater than 0 and at most 1"
            )
        if self.wake_debounce_seconds < 0:
            raise ValueError("MOLTY_WAKE_DEBOUNCE_SECONDS cannot be negative")
        if self.agent_join_timeout_seconds <= 0:
            raise ValueError("MOLTY_AGENT_JOIN_TIMEOUT_SECONDS must be positive")
        if self.output_device_name is not None and not self.output_device_name.strip():
            raise ValueError("MOLTY_AUDIO_OUTPUT_DEVICE_NAME cannot be blank")
        if self.half_duplex_release_seconds < 0:
            raise ValueError("MOLTY_HALF_DUPLEX_RELEASE_MS cannot be negative")
        if not self.skip_wakeword:
            if self.wake_model is None:
                raise ValueError(
                    "set MOLTY_WAKEWORD_MODEL or use --skip-wakeword for a direct test"
                )
            if not self.wake_model.is_file():
                raise ValueError(f"wake model does not exist: {self.wake_model}")


def _find_output_device(
    devices: list[dict[str, Any]],
    configured_name: str,
) -> int:
    """Find one output device by exact name, then by a unique substring."""

    wanted = configured_name.strip().casefold()
    outputs = [
        (index, str(device.get("name", "")))
        for index, device in enumerate(devices)
        if int(device.get("max_output_channels", 0)) > 0
    ]
    exact = [index for index, name in outputs if name.casefold() == wanted]
    matches = exact or [index for index, name in outputs if wanted in name.casefold()]
    if len(matches) == 1:
        return matches[0]

    available = ", ".join(f"{index}: {name}" for index, name in outputs) or "none"
    if not matches:
        raise ValueError(
            f"audio output {configured_name!r} was not found; available: {available}"
        )
    raise ValueError(
        f"audio output {configured_name!r} is ambiguous; available: {available}"
    )


def _resolve_output_device(config: DeviceConfig) -> int | None:
    if config.output_device_name is None:
        return config.output_device

    import sounddevice as sd

    output_device = _find_output_device(
        list(sd.query_devices()),
        config.output_device_name,
    )
    logger.info(
        "selected audio output %d by name %s",
        output_device,
        config.output_device_name,
    )
    return output_device


@dataclass(frozen=True, slots=True)
class RoomCredentials:
    url: str
    token: str
    room_name: str


class RoomCredentialProvider:
    def __init__(self, config: DeviceConfig) -> None:
        self.config = config

    async def create(self, requested_room: str) -> RoomCredentials:
        if self.config.token_endpoint:
            return await asyncio.to_thread(
                self._from_endpoint,
                requested_room,
            )
        return self._development_credentials(requested_room)

    def _from_endpoint(self, requested_room: str) -> RoomCredentials:
        body = json.dumps(
            {
                "room_name": requested_room,
                "identity": f"molty-device-{self.config.device_id}",
                "device_id": self.config.device_id,
                "agent_name": self.config.agent_name,
            }
        ).encode("utf-8")
        headers = {"Content-Type": "application/json"}
        if self.config.token_endpoint_bearer:
            headers["Authorization"] = f"Bearer {self.config.token_endpoint_bearer}"
        request = urllib.request.Request(
            self.config.token_endpoint,
            data=body,
            headers=headers,
            method="POST",
        )
        with urllib.request.urlopen(request, timeout=10) as response:
            payload = json.loads(response.read())
        if not isinstance(payload, dict):
            raise ValueError("token endpoint response must be a JSON object")
        url = payload.get("url", self.config.livekit_url)
        token = payload.get("token")
        room_name = payload.get("room_name", requested_room)
        if not all(
            isinstance(value, str) and value for value in (url, token, room_name)
        ):
            raise ValueError(
                "token endpoint response requires non-empty url, token, and room_name"
            )
        return RoomCredentials(url, token, room_name)

    def _development_credentials(self, room_name: str) -> RoomCredentials:
        from livekit import api
        from livekit.api import RoomAgentDispatch, RoomConfiguration

        assert self.config.livekit_url is not None
        assert self.config.livekit_api_key is not None
        assert self.config.livekit_api_secret is not None
        token = (
            api.AccessToken(
                self.config.livekit_api_key,
                self.config.livekit_api_secret,
            )
            .with_identity(f"molty-device-{self.config.device_id}")
            .with_name(f"Molty {self.config.device_id}")
            .with_grants(api.VideoGrants(room_join=True, room=room_name))
            .with_room_config(
                RoomConfiguration(
                    agents=[RoomAgentDispatch(agent_name=self.config.agent_name)],
                )
            )
            .to_jwt()
        )
        return RoomCredentials(self.config.livekit_url, token, room_name)


class LiveKitRoomSession:
    """Own bidirectional audio and robot RPCs for one wake session."""

    def __init__(
        self,
        config: DeviceConfig,
        credentials: RoomCredentials,
        rpc_controller: MotionRpcController,
    ) -> None:
        from livekit import rtc

        self.config = config
        self.credentials = credentials
        self.rpc_controller = rpc_controller
        self.room = rtc.Room()
        self.stop_event = asyncio.Event()
        self.agent_joined = asyncio.Event()
        self.background_tasks: set[asyncio.Task[Any]] = set()
        self.devices = rtc.MediaDevices(
            input_sample_rate=SAMPLE_RATE,
            output_sample_rate=SAMPLE_RATE,
            num_channels=CHANNELS,
        )
        self.mic: Any = None
        self.mic_track: Any = None
        self.player: Any = None
        self.agent_speaking = False
        self.mic_release_task: asyncio.Task[Any] | None = None

    async def __aenter__(self) -> LiveKitRoomSession:
        from livekit import rtc

        self.mic = self.devices.open_input(
            enable_aec=True,
            noise_suppression=True,
            high_pass_filter=True,
            auto_gain_control=True,
            input_device=self.config.input_device,
        )
        self.player = self.devices.open_output(output_device=self.config.output_device)

        @self.room.on("track_subscribed")
        def on_track_subscribed(
            track: Any, _publication: Any, participant: Any
        ) -> None:
            if track.kind == rtc.TrackKind.KIND_AUDIO:
                logger.info("playing agent audio from %s", participant.identity)
                self.agent_joined.set()
                self._spawn(self.player.add_track(track))

        @self.room.on("track_unsubscribed")
        def on_track_unsubscribed(
            track: Any,
            _publication: Any,
            _participant: Any,
        ) -> None:
            if self.player is not None:
                self._spawn(self.player.remove_track(track))

        @self.room.on("participant_connected")
        def on_participant_connected(participant: Any) -> None:
            if participant.identity.startswith(self.config.agent_identity_prefix):
                self.agent_joined.set()
                self._set_agent_speaking(
                    participant.attributes.get(AGENT_STATE_ATTRIBUTE) == "speaking"
                )

        @self.room.on("participant_attributes_changed")
        def on_participant_attributes_changed(
            changed_attributes: dict[str, str],
            participant: Any,
        ) -> None:
            if (
                participant.identity.startswith(self.config.agent_identity_prefix)
                and AGENT_STATE_ATTRIBUTE in changed_attributes
            ):
                self._set_agent_speaking(
                    changed_attributes[AGENT_STATE_ATTRIBUTE] == "speaking"
                )

        @self.room.on("participant_disconnected")
        def on_participant_disconnected(participant: Any) -> None:
            if participant.identity.startswith(self.config.agent_identity_prefix):
                logger.info("agent left the room")
                self.stop_event.set()

        @self.room.on("disconnected")
        def on_disconnected(*_args: Any) -> None:
            self.stop_event.set()

        async def read_agent_events(reader: Any, _identity: str) -> None:
            async for chunk in reader:
                try:
                    event = json.loads(chunk)
                except (TypeError, json.JSONDecodeError):
                    continue
                if (
                    event.get("type") == "user_state_changed"
                    and event.get("new_state") == "away"
                ):
                    self.stop_event.set()

        self.room.register_text_stream_handler(
            "lk.agent.events",
            lambda reader, identity: asyncio.create_task(
                read_agent_events(reader, identity)
            ),
        )
        await self.room.connect(self.credentials.url, self.credentials.token)
        logger.info("connected to LiveKit room %s", self.room.name)
        self._register_rpcs()
        self.mic_track = rtc.LocalAudioTrack.create_audio_track(
            "microphone",
            self.mic.source,
        )
        options = rtc.TrackPublishOptions(source=rtc.TrackSource.SOURCE_MICROPHONE)
        await self.room.local_participant.publish_track(self.mic_track, options)
        await self.player.start()

        for participant in self.room.remote_participants.values():
            if participant.identity.startswith(self.config.agent_identity_prefix):
                self.agent_joined.set()
                self._set_agent_speaking(
                    participant.attributes.get(AGENT_STATE_ATTRIBUTE) == "speaking"
                )
                break
        return self

    async def run(self) -> None:
        await asyncio.wait_for(
            self.agent_joined.wait(),
            timeout=self.config.agent_join_timeout_seconds,
        )
        await self.stop_event.wait()

    async def __aexit__(self, _exc_type: Any, _exc: Any, _tb: Any) -> None:
        await self.rpc_controller.executor.cancel(reason="voice session ended")
        if self.mic_release_task is not None:
            self.mic_release_task.cancel()
        if self.background_tasks:
            await asyncio.gather(
                *self.background_tasks,
                return_exceptions=True,
            )
        if self.player is not None:
            await self.player.aclose()
        if self.mic is not None:
            await self.mic.aclose()
        await self.room.disconnect()

    def _spawn(self, coroutine: Coroutine[Any, Any, Any]) -> None:
        task = asyncio.create_task(coroutine)
        self.background_tasks.add(task)
        task.add_done_callback(self.background_tasks.discard)

    def _set_agent_speaking(self, speaking: bool) -> None:
        self.agent_speaking = speaking
        if not self.config.half_duplex or self.mic_track is None:
            return

        if speaking:
            if self.mic_release_task is not None:
                self.mic_release_task.cancel()
                self.mic_release_task = None
            if not self.mic_track.muted:
                self.mic_track.mute()
                logger.info("microphone paused while Molty is speaking")
            return

        if not self.mic_track.muted:
            return
        if self.mic_release_task is not None and not self.mic_release_task.done():
            return

        task = asyncio.create_task(self._release_microphone())
        self.mic_release_task = task
        self.background_tasks.add(task)
        task.add_done_callback(self._on_mic_release_done)

    async def _release_microphone(self) -> None:
        await asyncio.sleep(self.config.half_duplex_release_seconds)
        if not self.agent_speaking and self.mic_track is not None:
            self.mic_track.unmute()
            logger.info("microphone resumed after Molty finished speaking")

    def _on_mic_release_done(self, task: asyncio.Task[Any]) -> None:
        self.background_tasks.discard(task)
        if self.mic_release_task is task:
            self.mic_release_task = None

    def _register_rpcs(self) -> None:
        participant = self.room.local_participant

        @participant.register_rpc_method(ACTION_RPC)
        async def action(data: Any) -> str:
            return await self.rpc_controller.action(
                data.payload,
                data.caller_identity,
            )

        @participant.register_rpc_method(PLAN_RPC)
        async def plan(data: Any) -> str:
            return await self.rpc_controller.plan(
                data.payload,
                data.caller_identity,
            )

        @participant.register_rpc_method(CANCEL_RPC)
        async def cancel(data: Any) -> str:
            return await self.rpc_controller.cancel(
                data.payload,
                data.caller_identity,
            )

        @participant.register_rpc_method(STATE_RPC)
        async def state(data: Any) -> str:
            return await self.rpc_controller.state(
                data.payload,
                data.caller_identity,
            )


async def wait_for_wakeword(config: DeviceConfig) -> None:
    if config.skip_wakeword:
        return
    from livekit.wakeword import WakeWordListener, WakeWordModel

    assert config.wake_model is not None
    model = WakeWordModel(models=[config.wake_model])
    logger.info("listening for wake word with %s", config.wake_model)
    async with WakeWordListener(
        model,
        threshold=config.wake_threshold,
        debounce=config.wake_debounce_seconds,
    ) as listener:
        detection = await listener.wait_for_detection()
    logger.info(
        "wake word detected: %s confidence=%.3f",
        detection.name,
        detection.confidence,
    )


async def play_tone(
    *,
    frequency: float,
    output_device: int | None,
    duration: float = 0.12,
) -> None:
    try:
        import numpy as np
        import sounddevice as sd

        samples = np.arange(int(SAMPLE_RATE * duration))
        wave = (0.12 * np.sin(2 * math.pi * frequency * samples / SAMPLE_RATE)).astype(
            np.float32
        )
        await asyncio.to_thread(
            sd.play,
            wave,
            SAMPLE_RATE,
            device=output_device,
            blocking=True,
        )
    except Exception:
        logger.exception("could not play status tone")


async def run_device(config: DeviceConfig) -> None:
    config.validate()
    config = replace(config, output_device=_resolve_output_device(config))
    if config.hardware:
        calibration = RobotCalibration.from_file(config.calibration_path)
        driver = PCA9685ServoDriver(
            calibration,
            address=config.i2c_address,
        )
    else:
        driver = DryRunServoDriver()

    executor = MotionExecutor(driver)
    controller = MotionRpcController(
        executor,
        allowed_caller_prefix=config.agent_identity_prefix,
    )
    credentials = RoomCredentialProvider(config)

    try:
        while True:
            await wait_for_wakeword(config)
            if config.status_tones:
                await play_tone(
                    frequency=880,
                    output_device=config.output_device,
                )
            room_name = f"molty-{config.device_id}-{uuid.uuid4().hex[:10]}"
            room_credentials = await credentials.create(room_name)
            try:
                async with LiveKitRoomSession(
                    config,
                    room_credentials,
                    controller,
                ) as session:
                    await session.run()
            except Exception:
                logger.exception("voice session failed")
            if config.status_tones:
                await play_tone(
                    frequency=440,
                    output_device=config.output_device,
                )
            if config.once or config.skip_wakeword:
                break
    finally:
        await executor.shutdown()


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--once", action="store_true")
    parser.add_argument(
        "--skip-wakeword",
        action="store_true",
        help="Connect immediately for one development session",
    )
    parser.add_argument("--wake-model", type=Path)
    mode = parser.add_mutually_exclusive_group()
    mode.add_argument("--hardware", action="store_true")
    mode.add_argument("--dry-run", action="store_true")
    parser.add_argument("--calibration", type=Path)
    return parser


def main() -> int:
    try:
        from dotenv import load_dotenv

        load_dotenv(".env.local")
        config = DeviceConfig.from_env()
        args = build_parser().parse_args()
        config = replace(
            config,
            once=config.once or args.once or args.skip_wakeword,
            skip_wakeword=config.skip_wakeword or args.skip_wakeword,
            wake_model=args.wake_model or config.wake_model,
            hardware=(config.hardware or args.hardware) and not args.dry_run,
            calibration_path=args.calibration or config.calibration_path,
        )
        logging.basicConfig(
            level=os.getenv("LOG_LEVEL", "INFO"),
            format="%(asctime)s %(levelname)s %(name)s: %(message)s",
        )
        asyncio.run(run_device(config))
        return 0
    except KeyboardInterrupt:
        return 130
    except Exception as error:
        logger.error("%s", error)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
