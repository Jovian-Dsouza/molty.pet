from __future__ import annotations

import pytest

from molty.motion_catalog import ACTION_NAMES, SERVO_CHANNELS, STAND, get_motion

EXPECTED_FRAME_COUNTS = {
    "stand": 1,
    "rest": 1,
    "wave": 12,
    "dance": 12,
    "swim": 10,
    "point": 2,
    "pushup": 11,
    "bow": 4,
    "cute": 13,
    "freaky": 9,
    "worm": 13,
    "shake": 13,
    "shrug": 4,
    "dead": 2,
    "crab": 13,
    "forward": 9,
    "backward": 8,
    "left": 10,
    "right": 10,
}


@pytest.mark.parametrize("action", ACTION_NAMES)
def test_every_legacy_action_expands_to_valid_servo_frames(action: str) -> None:
    motion = get_motion(action)

    assert motion.name == action
    assert len(motion.frames) == EXPECTED_FRAME_COUNTS[action]
    assert set(motion.frames[0].angles) == set(SERVO_CHANNELS)
    for item in motion.frames:
        assert item.angles
        assert set(item.angles) <= set(SERVO_CHANNELS)
        assert item.hold_ms >= 0
        assert all(0 <= angle <= 180 for angle in item.angles.values())


@pytest.mark.parametrize("action", ("forward", "backward", "left", "right"))
def test_locomotion_cycle_count_expands_only_the_gait(action: str) -> None:
    one_cycle = get_motion(action, cycles=1)
    two_cycles = get_motion(action, cycles=2)

    assert len(two_cycles.frames) > len(one_cycle.frames)
    assert two_cycles.frames[-1].angles == STAND


def test_cycles_are_rejected_for_expressive_actions() -> None:
    with pytest.raises(ValueError, match="only applies to locomotion"):
        get_motion("wave", cycles=2)


def test_unknown_action_is_rejected() -> None:
    with pytest.raises(ValueError, match="unknown action"):
        get_motion("fly")
