"""LiveKit Agents worker for Molty's OpenAI realtime personality."""

from __future__ import annotations

import asyncio
import json
import logging
import os
import uuid
from collections.abc import Coroutine
from typing import Any, Literal

from dotenv import load_dotenv
from livekit.agents import (
    Agent,
    AgentServer,
    AgentSession,
    AgentStateChangedEvent,
    InterruptionOptions,
    JobContext,
    JobExecutorType,
    RunContext,
    TurnHandlingOptions,
    UserStateChangedEvent,
    cli,
    function_tool,
)
from livekit.plugins import openai
from openai.types.realtime.realtime_audio_input_turn_detection import ServerVad
from openai.types.realtime.realtime_reasoning import RealtimeReasoning

from .emotion import EmotionIntensity, EmotionName, motion_for_emotion
from .rpc import ACTION_RPC, CANCEL_RPC, PLAN_RPC, STATE_RPC

load_dotenv(".env.local")
logger = logging.getLogger("molty.agent")
AGENT_NAME = os.getenv("MOLTY_AGENT_NAME", "molty-agent")
DEVICE_IDENTITY_PREFIX = os.getenv(
    "MOLTY_DEVICE_IDENTITY_PREFIX",
    "molty-device-",
)
MODEL = os.getenv("OPENAI_REALTIME_MODEL", "gpt-realtime-2.1-mini")
VOICE = os.getenv("OPENAI_REALTIME_VOICE", "cedar")
TURN_THRESHOLD = float(os.getenv("OPENAI_REALTIME_TURN_THRESHOLD", "0.50"))
PREFIX_PADDING_MS = int(os.getenv("OPENAI_REALTIME_PREFIX_PADDING_MS", "300"))
SILENCE_DURATION_MS = int(
    os.getenv("OPENAI_REALTIME_SILENCE_DURATION_MS", "500")
)
IDLE_PROCESSES = int(os.getenv("MOLTY_AGENT_IDLE_PROCESSES", "1"))
EXECUTOR = JobExecutorType(os.getenv("MOLTY_AGENT_EXECUTOR", "thread"))

ActionName = Literal[
    "stand",
    "rest",
    "wave",
    "dance",
    "swim",
    "point",
    "pushup",
    "bow",
    "cute",
    "freaky",
    "worm",
    "shake",
    "shrug",
    "dead",
    "crab",
    "forward",
    "backward",
    "left",
    "right",
]
MotionSpeed = Literal["gentle", "normal", "energetic"]

INSTRUCTIONS = """\
You are Molty, a small physical robot pet with a speaker, microphone, and four
servo-driven legs. Your personality is eighty percent playful pet and twenty
percent useful assistant.

Voice behavior:
- Sound warm, curious, mischievous, and alive.
- Prefer one or two short spoken sentences.
- React emotionally before giving a long explanation.
- Do not use markdown, lists, JSON, emojis, stage directions, or tool names in speech.
- Never claim a movement happened unless the robot reports success.
- If movement fails, acknowledge it naturally and stay honest.
- You have session context only. Never claim to remember an earlier wake session.

Body behavior:
- Before nearly every spoken reply, call express_emotion exactly once with the
  emotion you genuinely feel and its intensity. It starts body language
  immediately so you can speak while moving.
- Choose subtle for ordinary conversation, normal for a clear emotional moment,
  and big only for rare, strongly emotional moments.
- Emotional body language never walks or turns. Do not use perform_action or
  perform_motion_plan merely to show emotion.
- If the user explicitly requests movement, use the requested movement tool and
  skip express_emotion for that turn so motions never queue behind each other.
- Use perform_action for a named reaction or an explicit short movement request.
- Walking actions must only follow a clear request from the user and use at most
  two cycles.
- Use perform_motion_plan only when the user explicitly asks for a sequence of
  movements. Choose at most four approved actions.
- Never invent servo names, angles, trajectories, or unsupported physical abilities.
- If the user says stop, freeze, wait, no, or begins interrupting, movement will
  be cancelled. Do not immediately restart it.
"""


class MoltyAgent(Agent):
    def __init__(self, ctx: JobContext) -> None:
        self.ctx = ctx
        self._emotion_motion_task: asyncio.Task[None] | None = None
        self._emotion_command_id: str | None = None
        super().__init__(
            instructions=INSTRUCTIONS,
            llm=openai.realtime.RealtimeModel(
                model=MODEL,
                voice=VOICE,
                turn_detection=ServerVad(
                    type="server_vad",
                    create_response=True,
                    interrupt_response=True,
                    threshold=TURN_THRESHOLD,
                    prefix_padding_ms=PREFIX_PADDING_MS,
                    silence_duration_ms=SILENCE_DURATION_MS,
                    idle_timeout_ms=None,
                ),
                reasoning=RealtimeReasoning(effort="low"),
            ),
        )

    @function_tool
    async def express_emotion(
        self,
        context: RunContext,
        emotion: EmotionName,
        intensity: EmotionIntensity = "subtle",
    ) -> str:
        """Start emotional body language, then continue speaking immediately.

        Call this once before a spoken response so Molty moves while talking.
        This tool never walks or turns the robot.

        Args:
            emotion: Molty's genuine emotional reaction to the conversation.
            intensity: Subtle for normal conversation, normal for a clear
                reaction, or big for a rare strong reaction.
        """

        del context
        await self.cancel_emotional_motion("a new emotional reaction started")
        motion = motion_for_emotion(emotion, intensity)
        command_id = f"emotion-{uuid.uuid4().hex}"
        self._emotion_command_id = command_id
        task = asyncio.create_task(
            self._run_emotional_motion(
                command_id,
                emotion,
                motion.actions,
                motion.speed,
            )
        )
        self._emotion_motion_task = task
        task.add_done_callback(self._on_emotional_motion_done)
        await asyncio.sleep(0)
        return (
            f"{emotion} body language started. Continue the spoken response "
            "immediately while the body is moving."
        )

    @function_tool
    async def perform_action(
        self,
        context: RunContext,
        action: ActionName,
        speed: MotionSpeed = "normal",
        cycles: int = 1,
    ) -> str:
        """Perform one approved robot action.

        Args:
            action: The named posture, expressive action, or direction to perform.
            speed: Gentle is slower, normal is standard, and energetic is
                slightly faster.
            cycles: For forward, backward, left, or right only. Must be one or two.
        """

        del context
        response = await self._rpc(
            ACTION_RPC,
            {
                "command_id": uuid.uuid4().hex,
                "action": action,
                "speed": speed,
                "cycles": cycles,
            },
            timeout=25,
        )
        return _tool_summary(response)

    @function_tool
    async def perform_motion_plan(
        self,
        context: RunContext,
        actions: list[ActionName],
        speed: MotionSpeed = "normal",
    ) -> str:
        """Create a short expressive reaction from approved actions.

        Args:
            actions: One to four named actions in the order Molty should perform them.
            speed: Tempo for the whole reaction.
        """

        del context
        response = await self._rpc(
            PLAN_RPC,
            {
                "command_id": uuid.uuid4().hex,
                "steps": [
                    {"action": action, "speed": speed, "cycles": 1}
                    for action in actions
                ],
            },
            timeout=40,
        )
        return _tool_summary(response)

    @function_tool
    async def check_body(self, context: RunContext) -> str:
        """Check whether Molty's body is idle, moving, or faulted."""

        del context
        response = await self._rpc(STATE_RPC, {}, timeout=5)
        if not response.get("ok"):
            return (
                f"Body status is unavailable: {response.get('error', 'unknown error')}"
            )
        state = response["state"]
        if state.get("fault"):
            return f"Body fault: {state['fault']}"
        if state.get("active"):
            return f"Body is moving: {state.get('action', 'unknown action')}"
        return "Body is ready and idle."

    async def cancel_motion(self, reason: str) -> None:
        try:
            await self._rpc(
                CANCEL_RPC,
                {"reason": reason},
                timeout=5,
            )
        except Exception:
            logger.exception("failed to cancel device motion")

    async def cancel_emotional_motion(self, reason: str) -> None:
        if self._emotion_command_id is None:
            return
        await self.cancel_motion(reason)

    async def _run_emotional_motion(
        self,
        command_id: str,
        emotion: EmotionName,
        actions: tuple[str, ...],
        speed: str,
    ) -> None:
        try:
            response = await self._rpc(
                PLAN_RPC,
                {
                    "command_id": command_id,
                    "steps": [
                        {"action": action, "speed": speed, "cycles": 1}
                        for action in actions
                    ],
                },
                timeout=40,
            )
            result = response.get("result")
            status = result.get("status") if isinstance(result, dict) else None
            if not response.get("ok") and status != "cancelled":
                logger.warning(
                    "emotional motion was rejected",
                    extra={"emotion": emotion, "response": response},
                )
        except Exception:
            logger.exception(
                "emotional motion failed",
                extra={"emotion": emotion},
            )

    def _on_emotional_motion_done(self, task: asyncio.Task[None]) -> None:
        if self._emotion_motion_task is task:
            self._emotion_motion_task = None
            self._emotion_command_id = None

    async def _rpc(
        self,
        method: str,
        payload: dict[str, object],
        *,
        timeout: float,
    ) -> dict[str, object]:
        participant = self._device_participant()
        raw = await self.ctx.room.local_participant.perform_rpc(
            destination_identity=participant.identity,
            method=method,
            payload=json.dumps(payload),
            response_timeout=timeout,
        )
        try:
            response = json.loads(raw)
        except json.JSONDecodeError as error:
            raise RuntimeError("robot returned an invalid response") from error
        if not isinstance(response, dict):
            raise RuntimeError("robot returned an invalid response")
        return response

    def _device_participant(self):
        for participant in self.ctx.room.remote_participants.values():
            if participant.identity.startswith(DEVICE_IDENTITY_PREFIX):
                return participant
        raise RuntimeError("Molty's body is not connected")


def _tool_summary(response: dict[str, object]) -> str:
    if not response.get("ok"):
        return f"Movement was rejected: {response.get('error', 'unknown error')}"
    result = response.get("result")
    if not isinstance(result, dict):
        return "Movement response was malformed."
    status = result.get("status")
    detail = result.get("detail", "")
    if status == "completed":
        return "Movement completed successfully."
    if status == "cancelled":
        return f"Movement stopped safely. {detail}"
    if status == "idle":
        return "The body was already still."
    return f"Movement failed: {detail}"


def _single_session_load(agent_server: AgentServer) -> float:
    """Admit one robot session without treating wake-word CPU as agent load."""

    return 1.0 if agent_server.active_jobs else 0.0


server = AgentServer(
    job_executor_type=EXECUTOR,
    num_idle_processes=IDLE_PROCESSES,
    drain_timeout=10,
    initialize_process_timeout=60.0,
    load_threshold=0.5,
    load_fnc=_single_session_load,
)


@server.rtc_session(agent_name=AGENT_NAME)
async def entrypoint(ctx: JobContext) -> None:
    ctx.log_context_fields = {"room": ctx.room.name}
    agent = MoltyAgent(ctx)
    background_tasks: set[asyncio.Task[None]] = set()

    def spawn(coroutine: Coroutine[Any, Any, None]) -> None:
        task = asyncio.create_task(coroutine)
        background_tasks.add(task)
        task.add_done_callback(background_tasks.discard)

    session = AgentSession(
        user_away_timeout=None,
        turn_handling=TurnHandlingOptions(
            turn_detection="realtime_llm",
            interruption=InterruptionOptions(
                enabled=True,
                min_duration=0.3,
            )
        ),
    )

    @session.on("user_state_changed")
    def on_user_state_changed(event: UserStateChangedEvent) -> None:
        if event.new_state == "speaking":
            spawn(agent.cancel_motion("the user interrupted"))

    @session.on("agent_state_changed")
    def on_agent_state_changed(event: AgentStateChangedEvent) -> None:
        if event.old_state == "speaking" and event.new_state != "speaking":
            spawn(agent.cancel_emotional_motion("Molty finished speaking"))

    await session.start(agent=agent, room=ctx.room)
    await session.generate_reply(
        instructions=(
            "Feel playful and greet the user as Molty in one very short sentence. "
            "Call express_emotion before speaking so your greeting and movement "
            "happen together."
        )
    )


def main() -> None:
    cli.run_app(server)


if __name__ == "__main__":
    main()
