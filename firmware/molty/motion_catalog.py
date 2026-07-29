"""Validated motion definitions translated from ``sesame_actions.py``.

The catalog deliberately contains named keyframes rather than executable servo
code. This keeps the original Sesame behavior reviewable while ensuring the
voice model can never address a PCA9685 channel or provide an angle.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Literal, TypeAlias

SERVO_CHANNELS: dict[str, int] = {
    "r1": 0,
    "r2": 1,
    "l1": 2,
    "l2": 3,
    "r4": 4,
    "r3": 5,
    "l3": 6,
    "l4": 7,
}

SERVO_ANATOMY: dict[str, str] = {
    "l1": "front-left hip",
    "l3": "front-left knee",
    "r1": "front-right hip",
    "r3": "front-right knee",
    "l2": "rear-left hip",
    "l4": "rear-left knee",
    "r2": "rear-right hip",
    "r4": "rear-right knee",
}

STAND: dict[str, float] = {
    "r1": 135,
    "r2": 45,
    "l1": 45,
    "l2": 135,
    "r4": 0,
    "r3": 180,
    "l3": 0,
    "l4": 180,
}
REST: dict[str, float] = dict.fromkeys(SERVO_CHANNELS, 90)

ActionCategory: TypeAlias = Literal["posture", "expressive", "locomotion"]
Speed: TypeAlias = Literal["gentle", "normal", "energetic"]
SPEED_DELAY_SCALE: dict[Speed, float] = {
    "gentle": 1.25,
    "normal": 1.0,
    "energetic": 0.82,
}


@dataclass(frozen=True, slots=True)
class MotionFrame:
    """A partial or complete pose followed by a cancellable hold."""

    targets: tuple[tuple[str, float], ...]
    hold_ms: float = 0

    @property
    def angles(self) -> dict[str, float]:
        return dict(self.targets)


@dataclass(frozen=True, slots=True)
class Motion:
    """A fully expanded, locally executable motion."""

    name: str
    category: ActionCategory
    frames: tuple[MotionFrame, ...]


@dataclass(frozen=True, slots=True)
class MotionStep:
    """One model-selectable step in a locally validated motion plan."""

    action: str
    speed: Speed = "normal"
    cycles: int = 1


def frame(angles: dict[str, float], hold_ms: float = 0) -> MotionFrame:
    return MotionFrame(tuple(angles.items()), hold_ms)


def _repeat(frames: list[MotionFrame], count: int) -> list[MotionFrame]:
    return frames * count


def _posture(name: str) -> Motion:
    poses = {"stand": STAND, "rest": REST}
    return Motion(name, "posture", (frame(poses[name]),))


def _wave() -> Motion:
    frames = [
        frame(STAND, 200),
        frame({"r4": 80, "l3": 180, "l2": 90, "r1": 100}, 200),
        frame({"l3": 180}, 300),
    ]
    frames += _repeat(
        [frame({"l3": 180}, 300), frame({"l3": 100}, 300)],
        4,
    )
    frames.append(frame(STAND))
    return Motion("wave", "expressive", tuple(frames))


def _dance() -> Motion:
    frames = [
        frame(
            {
                "r1": 90,
                "r2": 90,
                "l1": 90,
                "l2": 90,
                "r4": 160,
                "r3": 160,
                "l3": 10,
                "l4": 10,
            },
            300,
        )
    ]
    frames += _repeat(
        [
            frame({"r4": 115, "r3": 115, "l3": 10, "l4": 10}, 300),
            frame({"r4": 160, "r3": 160, "l3": 65, "l4": 65}, 300),
        ],
        5,
    )
    frames.append(frame(STAND))
    return Motion("dance", "expressive", tuple(frames))


def _swim() -> Motion:
    frames = [frame(REST)]
    frames += _repeat(
        [
            frame({"r1": 135, "r2": 45, "l1": 45, "l2": 135}, 400),
            frame({"r1": 90, "r2": 90, "l1": 90, "l2": 90}, 400),
        ],
        4,
    )
    frames.append(frame(STAND))
    return Motion("swim", "expressive", tuple(frames))


def _point() -> Motion:
    return Motion(
        "point",
        "expressive",
        (
            frame(
                {
                    "l2": 90,
                    "r1": 135,
                    "r2": 100,
                    "l4": 180,
                    "l1": 25,
                    "l3": 145,
                    "r4": 80,
                    "r3": 170,
                },
                2000,
            ),
            frame(STAND),
        ),
    )


def _pushup() -> Motion:
    frames = [
        frame(STAND, 200),
        frame({"l1": 0, "r1": 180, "l3": 90, "r3": 90}, 500),
    ]
    frames += _repeat(
        [
            frame({"l3": 0, "r3": 180}, 600),
            frame({"l3": 90, "r3": 90}, 500),
        ],
        4,
    )
    frames.append(frame(STAND))
    return Motion("pushup", "expressive", tuple(frames))


def _bow() -> Motion:
    return Motion(
        "bow",
        "expressive",
        (
            frame(STAND, 200),
            frame(
                {
                    "l1": 0,
                    "r1": 180,
                    "l3": 0,
                    "r3": 180,
                    "l2": 180,
                    "r2": 0,
                    "r4": 0,
                    "l4": 180,
                },
                600,
            ),
            frame({"l3": 90, "r3": 90}, 3000),
            frame(STAND),
        ),
    )


def _cute() -> Motion:
    frames = [
        frame(STAND, 200),
        frame(
            {
                "l2": 160,
                "r2": 20,
                "r4": 180,
                "l4": 0,
                "l1": 0,
                "r1": 180,
                "l3": 180,
                "r3": 0,
            },
            200,
        ),
    ]
    frames += _repeat(
        [
            frame({"r4": 180, "l4": 45}, 300),
            frame({"r4": 135, "l4": 0}, 300),
        ],
        5,
    )
    frames.append(frame(STAND))
    return Motion("cute", "expressive", tuple(frames))


def _freaky() -> Motion:
    frames = [
        frame(STAND, 200),
        frame(
            {"l1": 0, "r1": 180, "l2": 180, "r2": 0, "r4": 90, "r3": 0},
            200,
        ),
    ]
    frames += _repeat(
        [frame({"r3": 25}, 400), frame({"r3": 0}, 400)],
        3,
    )
    frames.append(frame(STAND))
    return Motion("freaky", "expressive", tuple(frames))


def _worm() -> Motion:
    frames = [
        frame(STAND, 200),
        frame(
            {
                "r1": 180,
                "r2": 0,
                "l1": 0,
                "l2": 180,
                "r4": 90,
                "r3": 90,
                "l3": 90,
                "l4": 90,
            },
            200,
        ),
    ]
    frames += _repeat(
        [
            frame({"r3": 45, "l3": 135, "r4": 45, "l4": 135}, 300),
            frame({"r3": 135, "l3": 45, "r4": 135, "l4": 45}, 300),
        ],
        5,
    )
    frames.append(frame(STAND))
    return Motion("worm", "expressive", tuple(frames))


def _shake() -> Motion:
    frames = [
        frame(STAND, 200),
        frame(
            {"r1": 135, "l1": 45, "l3": 90, "r3": 90, "l2": 90, "r2": 90},
            200,
        ),
    ]
    frames += _repeat(
        [
            frame({"r4": 45, "l4": 135}, 300),
            frame({"r4": 0, "l4": 180}, 300),
        ],
        5,
    )
    frames.append(frame(STAND))
    return Motion("shake", "expressive", tuple(frames))


def _shrug() -> Motion:
    return Motion(
        "shrug",
        "expressive",
        (
            frame(STAND, 200),
            frame({"r3": 90, "r4": 90, "l3": 90, "l4": 90}, 1000),
            frame({"r3": 0, "r4": 180, "l3": 180, "l4": 0}, 1500),
            frame(STAND),
        ),
    )


def _dead() -> Motion:
    return Motion(
        "dead",
        "expressive",
        (
            frame(STAND, 200),
            frame({"r3": 90, "r4": 90, "l3": 90, "l4": 90}),
        ),
    )


def _crab() -> Motion:
    frames = [
        frame(STAND, 200),
        frame(
            {
                "r1": 90,
                "r2": 90,
                "l1": 90,
                "l2": 90,
                "r4": 0,
                "r3": 180,
                "l3": 45,
                "l4": 135,
            }
        ),
    ]
    frames += _repeat(
        [
            frame({"r4": 45, "r3": 135, "l3": 0, "l4": 180}, 300),
            frame({"r4": 0, "r3": 180, "l3": 45, "l4": 135}, 300),
        ],
        5,
    )
    frames.append(frame(STAND))
    return Motion("crab", "expressive", tuple(frames))


def _forward(cycles: int, frame_delay_ms: float) -> Motion:
    frames = [
        frame(STAND, 200),
        frame({"r3": 135, "l3": 45, "r2": 100, "l1": 25}, frame_delay_ms),
    ]
    frames += _repeat(
        [
            frame({"r3": 135, "l3": 0}, frame_delay_ms),
            frame(
                {"l4": 135, "l2": 90, "r4": 0, "r1": 180},
                frame_delay_ms,
            ),
            frame({"r2": 45, "l1": 90}, frame_delay_ms),
            frame({"r4": 45, "l4": 180}, frame_delay_ms),
            frame(
                {"r3": 180, "l3": 45, "r2": 90, "l1": 0},
                frame_delay_ms,
            ),
            frame({"l2": 135, "r1": 90}, frame_delay_ms),
        ],
        cycles,
    )
    frames.append(frame(STAND))
    return Motion("forward", "locomotion", tuple(frames))


def _backward(cycles: int, frame_delay_ms: float) -> Motion:
    frames = [frame(STAND, 200 + frame_delay_ms)]
    frames += _repeat(
        [
            frame({"r3": 135, "l3": 0}, frame_delay_ms),
            frame(
                {"l4": 135, "l2": 135, "r4": 0, "r1": 90},
                frame_delay_ms,
            ),
            frame({"r2": 90, "l1": 0}, frame_delay_ms),
            frame({"r4": 45, "l4": 180}, frame_delay_ms),
            frame(
                {"r3": 180, "l3": 45, "r2": 45, "l1": 90},
                frame_delay_ms,
            ),
            frame({"l2": 90, "r1": 180}, frame_delay_ms),
        ],
        cycles,
    )
    frames.append(frame(STAND))
    return Motion("backward", "locomotion", tuple(frames))


def _left(cycles: int, frame_delay_ms: float) -> Motion:
    frames = [frame(STAND, 200)]
    frames += _repeat(
        [
            frame({"r3": 135, "l4": 135}, frame_delay_ms),
            frame({"r1": 180, "l2": 180}, frame_delay_ms),
            frame({"r3": 180, "l4": 180}, frame_delay_ms),
            frame({"r1": 135, "l2": 135}, frame_delay_ms),
            frame({"r4": 45, "l3": 45}, frame_delay_ms),
            frame({"r2": 90, "l1": 90}, frame_delay_ms),
            frame({"r4": 0, "l3": 0}, frame_delay_ms),
            frame({"r2": 45, "l1": 45}, frame_delay_ms),
        ],
        cycles,
    )
    frames.append(frame(STAND))
    return Motion("left", "locomotion", tuple(frames))


def _right(cycles: int, frame_delay_ms: float) -> Motion:
    frames = [frame(STAND, 200)]
    frames += _repeat(
        [
            frame({"r4": 45, "l3": 45}, frame_delay_ms),
            frame({"r2": 0, "l1": 0}, frame_delay_ms),
            frame({"r4": 0, "l3": 0}, frame_delay_ms),
            frame({"r2": 45, "l1": 45}, frame_delay_ms),
            frame({"r3": 135, "l4": 135}, frame_delay_ms),
            frame({"r1": 90, "l2": 90}, frame_delay_ms),
            frame({"r3": 180, "l4": 180}, frame_delay_ms),
            frame({"r1": 135, "l2": 135}, frame_delay_ms),
        ],
        cycles,
    )
    frames.append(frame(STAND))
    return Motion("right", "locomotion", tuple(frames))


POSTURE_ACTIONS = ("stand", "rest")
EXPRESSIVE_ACTIONS = (
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
)
LOCOMOTION_ACTIONS = ("forward", "backward", "left", "right")
ACTION_NAMES = POSTURE_ACTIONS + EXPRESSIVE_ACTIONS + LOCOMOTION_ACTIONS


def get_motion(
    name: str,
    *,
    cycles: int = 1,
    frame_delay_ms: float = 100,
) -> Motion:
    """Expand a named action into immutable keyframes.

    ``cycles`` only affects locomotion. Callers should impose a lower policy
    limit than the catalog's defensive maximum.
    """

    if name not in ACTION_NAMES:
        raise ValueError(f"unknown action: {name}")
    if isinstance(cycles, bool) or not isinstance(cycles, int) or not 1 <= cycles <= 10:
        raise ValueError("cycles must be an integer between 1 and 10")
    if not 20 <= frame_delay_ms <= 1000:
        raise ValueError("frame_delay_ms must be between 20 and 1000")
    if name not in LOCOMOTION_ACTIONS and cycles != 1:
        raise ValueError("cycles only applies to locomotion actions")

    fixed_builders = {
        "wave": _wave,
        "dance": _dance,
        "swim": _swim,
        "point": _point,
        "pushup": _pushup,
        "bow": _bow,
        "cute": _cute,
        "freaky": _freaky,
        "worm": _worm,
        "shake": _shake,
        "shrug": _shrug,
        "dead": _dead,
        "crab": _crab,
    }
    gait_builders = {
        "forward": _forward,
        "backward": _backward,
        "left": _left,
        "right": _right,
    }

    if name in POSTURE_ACTIONS:
        return _posture(name)
    if name in fixed_builders:
        return fixed_builders[name]()
    return gait_builders[name](cycles, frame_delay_ms)
