"""Safe emotional body-language profiles for spoken responses."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Literal

EmotionName = Literal[
    "joyful",
    "excited",
    "affectionate",
    "curious",
    "playful",
    "surprised",
    "uncertain",
    "sad",
    "calm",
]
EmotionIntensity = Literal["subtle", "normal", "big"]
EmotionAction = Literal[
    "wave",
    "dance",
    "point",
    "bow",
    "cute",
    "freaky",
    "shake",
    "shrug",
]
EmotionSpeed = Literal["gentle", "normal", "energetic"]


@dataclass(frozen=True, slots=True)
class EmotionMotion:
    actions: tuple[EmotionAction, ...]
    speed: EmotionSpeed


_ACTIONS: dict[
    EmotionName,
    dict[EmotionIntensity, tuple[EmotionAction, ...]],
] = {
    "joyful": {
        "subtle": ("wave",),
        "normal": ("cute",),
        "big": ("dance",),
    },
    "excited": {
        "subtle": ("shake",),
        "normal": ("dance",),
        "big": ("dance", "wave"),
    },
    "affectionate": {
        "subtle": ("bow",),
        "normal": ("cute",),
        "big": ("cute", "bow"),
    },
    "curious": {
        "subtle": ("point",),
        "normal": ("point",),
        "big": ("point", "wave"),
    },
    "playful": {
        "subtle": ("wave",),
        "normal": ("shake",),
        "big": ("dance",),
    },
    "surprised": {
        "subtle": ("shrug",),
        "normal": ("freaky",),
        "big": ("freaky", "shake"),
    },
    "uncertain": {
        "subtle": ("shrug",),
        "normal": ("shrug",),
        "big": ("shrug", "shake"),
    },
    "sad": {
        "subtle": ("bow",),
        "normal": ("bow",),
        "big": ("bow", "shrug"),
    },
    "calm": {
        "subtle": ("bow",),
        "normal": ("wave",),
        "big": ("wave", "bow"),
    },
}

_SPEEDS: dict[EmotionIntensity, EmotionSpeed] = {
    "subtle": "gentle",
    "normal": "normal",
    "big": "energetic",
}


def motion_for_emotion(
    emotion: EmotionName,
    intensity: EmotionIntensity,
) -> EmotionMotion:
    """Return a predefined expressive plan containing no locomotion."""

    return EmotionMotion(
        actions=_ACTIONS[emotion][intensity],
        speed=_SPEEDS[intensity],
    )
