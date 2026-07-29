from __future__ import annotations

import pytest

from molty.device import _find_output_device

DEVICES = [
    {"name": "Voice HAT", "max_output_channels": 2},
    {"name": "Loopback: PCM (hw:2,0)", "max_output_channels": 32},
    {"name": "Loopback: PCM (hw:2,1)", "max_output_channels": 32},
    {"name": "Microphone only", "max_output_channels": 0},
]


def test_find_output_device_prefers_an_exact_name() -> None:
    assert _find_output_device(DEVICES, "Loopback: PCM (hw:2,0)") == 1


def test_find_output_device_accepts_a_unique_substring() -> None:
    assert _find_output_device(DEVICES, "hw:2,1") == 2


def test_find_output_device_rejects_an_ambiguous_name() -> None:
    with pytest.raises(ValueError, match="ambiguous"):
        _find_output_device(DEVICES, "Loopback")


def test_find_output_device_reports_available_outputs() -> None:
    with pytest.raises(ValueError, match="Voice HAT"):
        _find_output_device(DEVICES, "Bluetooth")
