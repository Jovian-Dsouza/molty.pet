from __future__ import annotations

import pytest

from molty.emotion import motion_for_emotion
from molty.motion_catalog import EXPRESSIVE_ACTIONS, LOCOMOTION_ACTIONS

EMOTIONS = (
    "joyful",
    "excited",
    "affectionate",
    "curious",
    "playful",
    "surprised",
    "uncertain",
    "sad",
    "calm",
)
INTENSITIES = ("subtle", "normal", "big")


@pytest.mark.parametrize("emotion", EMOTIONS)
@pytest.mark.parametrize("intensity", INTENSITIES)
def test_emotional_motion_is_expressive_and_never_locomotion(
    emotion: str,
    intensity: str,
) -> None:
    motion = motion_for_emotion(emotion, intensity)

    assert motion.actions
    assert set(motion.actions) <= set(EXPRESSIVE_ACTIONS)
    assert set(motion.actions).isdisjoint(LOCOMOTION_ACTIONS)


def test_emotional_intensity_controls_speed() -> None:
    assert motion_for_emotion("joyful", "subtle").speed == "gentle"
    assert motion_for_emotion("joyful", "normal").speed == "normal"
    assert motion_for_emotion("joyful", "big").speed == "energetic"
