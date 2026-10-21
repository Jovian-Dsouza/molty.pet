from __future__ import annotations

import asyncio
from types import SimpleNamespace

import pytest

from molty.device import LiveKitRoomSession, _find_output_device

DEVICES = [
    {"name": "Voice HAT", "max_output_channels": 2},
    {"name": "Loopback: PCM (plughw:2,0)", "max_output_channels": 32},
    {"name": "Loopback: PCM (plughw:2,1)", "max_output_channels": 32},
    {"name": "Microphone only", "max_output_channels": 0},
]


def test_find_output_device_prefers_an_exact_name() -> None:
    assert _find_output_device(DEVICES, "Loopback: PCM (plughw:2,0)") == 1


def test_find_output_device_accepts_a_unique_substring() -> None:
    assert _find_output_device(DEVICES, "hw:2,1") == 2


def test_find_output_device_rejects_an_ambiguous_name() -> None:
    with pytest.raises(ValueError, match="ambiguous"):
        _find_output_device(DEVICES, "Loopback")


def test_find_output_device_reports_available_outputs() -> None:
    with pytest.raises(ValueError, match="Voice HAT"):
        _find_output_device(DEVICES, "Bluetooth")


class FakeMicrophoneTrack:
    def __init__(self) -> None:
        self.muted = False

    def mute(self) -> None:
        self.muted = True

    def unmute(self) -> None:
        self.muted = False


def half_duplex_session(release_seconds: float) -> LiveKitRoomSession:
    session = object.__new__(LiveKitRoomSession)
    session.config = SimpleNamespace(
        half_duplex=True,
        half_duplex_release_seconds=release_seconds,
    )
    session.mic_track = FakeMicrophoneTrack()
    session.agent_speaking = False
    session.mic_release_task = None
    session.background_tasks = set()
    return session


@pytest.mark.asyncio
async def test_half_duplex_pauses_and_restores_microphone() -> None:
    session = half_duplex_session(release_seconds=0)

    session._set_agent_speaking(True)
    assert session.mic_track.muted

    session._set_agent_speaking(False)
    await asyncio.sleep(0.01)
    assert not session.mic_track.muted


@pytest.mark.asyncio
async def test_half_duplex_does_not_release_during_new_speech() -> None:
    session = half_duplex_session(release_seconds=0.1)

    session._set_agent_speaking(True)
    session._set_agent_speaking(False)
    session._set_agent_speaking(True)
    await asyncio.sleep(0)

    assert session.mic_track.muted
    assert session.mic_release_task is None
    assert all(task.done() for task in session.background_tasks)
