from __future__ import annotations

import json

import pytest

from molty.motion_catalog import SERVO_ANATOMY, SERVO_CHANNELS
from molty.servo import CalibrationError, RobotCalibration


def calibration_payload(*, calibrated: bool = True) -> dict[str, object]:
    return {
        "calibrated": calibrated,
        "frequency_hz": 50,
        "motor_delay_ms": 20,
        "servos": {
            name: {
                "channel": channel,
                "anatomical_joint": SERVO_ANATOMY[name],
                "minimum_angle": 5,
                "maximum_angle": 175,
                "trim_degrees": 0,
                "inverted": False,
                "minimum_us": 500,
                "maximum_us": 2400,
            }
            for name, channel in SERVO_CHANNELS.items()
        },
    }


def write_calibration(tmp_path, payload: dict[str, object]):
    path = tmp_path / "calibration.json"
    path.write_text(json.dumps(payload), encoding="utf-8")
    return path


def test_hardware_calibration_must_be_marked_reviewed(tmp_path) -> None:
    path = write_calibration(tmp_path, calibration_payload(calibrated=False))

    with pytest.raises(CalibrationError, match="calibrated=true"):
        RobotCalibration.from_file(path)


def test_channel_mapping_must_match_sesame(tmp_path) -> None:
    payload = calibration_payload()
    payload["servos"]["r1"]["channel"] = 7
    path = write_calibration(tmp_path, payload)

    with pytest.raises(CalibrationError, match="must use Sesame channel 0"):
        RobotCalibration.from_file(path)


def test_pose_outside_joint_limit_is_rejected(tmp_path) -> None:
    calibration = RobotCalibration.from_file(
        write_calibration(tmp_path, calibration_payload())
    )

    with pytest.raises(CalibrationError, match="outside calibrated range"):
        calibration.validate_angles({"r1": 180})


def test_inversion_and_trim_are_applied_after_input_validation(tmp_path) -> None:
    payload = calibration_payload()
    payload["servos"]["r1"]["inverted"] = True
    payload["servos"]["r1"]["trim_degrees"] = -2
    calibration = RobotCalibration.from_file(write_calibration(tmp_path, payload))

    assert calibration.servos["r1"].hardware_angle("r1", 50) == 128
