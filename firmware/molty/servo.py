"""Servo calibration, validation, and PCA9685 driver implementations."""

from __future__ import annotations

import json
import logging
import time
from collections.abc import Mapping
from dataclasses import dataclass
from pathlib import Path
from typing import Protocol

from .motion_catalog import SERVO_ANATOMY, SERVO_CHANNELS

logger = logging.getLogger(__name__)


class CalibrationError(ValueError):
    """Raised when calibration or a requested servo pose is unsafe."""


@dataclass(frozen=True, slots=True)
class ServoCalibration:
    channel: int
    anatomical_joint: str
    minimum_angle: float
    maximum_angle: float
    trim_degrees: float
    inverted: bool
    minimum_us: int
    maximum_us: int

    def validate(self, name: str, angle: float) -> None:
        if isinstance(angle, bool) or not isinstance(angle, (int, float)):
            raise CalibrationError(f"{name} angle must be numeric")
        if not self.minimum_angle <= angle <= self.maximum_angle:
            raise CalibrationError(
                f"{name} angle {angle:g} is outside calibrated range "
                f"{self.minimum_angle:g}..{self.maximum_angle:g}"
            )

    def hardware_angle(self, name: str, angle: float) -> float:
        self.validate(name, angle)
        transformed = 180.0 - angle if self.inverted else float(angle)
        transformed += self.trim_degrees
        if not 0 <= transformed <= 180:
            raise CalibrationError(
                f"{name} calibrated output {transformed:g} is outside 0..180"
            )
        return transformed

    def duty_cycle(self, name: str, angle: float, frequency_hz: int) -> int:
        transformed = self.hardware_angle(name, angle)
        pulse_us = self.minimum_us + (transformed / 180.0) * (
            self.maximum_us - self.minimum_us
        )
        period_us = 1_000_000 / frequency_hz
        return round((pulse_us / period_us) * 0xFFFF)


@dataclass(frozen=True, slots=True)
class RobotCalibration:
    calibrated: bool
    frequency_hz: int
    motor_delay_ms: float
    servos: dict[str, ServoCalibration]

    @classmethod
    def development(cls) -> RobotCalibration:
        """Return the legacy Sesame ranges for dry-run and unit tests only."""

        return cls(
            calibrated=False,
            frequency_hz=50,
            motor_delay_ms=20,
            servos={
                name: ServoCalibration(
                    channel=channel,
                    anatomical_joint=SERVO_ANATOMY[name],
                    minimum_angle=0,
                    maximum_angle=180,
                    trim_degrees=0,
                    inverted=False,
                    minimum_us=500,
                    maximum_us=2400,
                )
                for name, channel in SERVO_CHANNELS.items()
            },
        )

    @classmethod
    def from_file(
        cls,
        path: str | Path,
        *,
        require_calibrated: bool = True,
    ) -> RobotCalibration:
        calibration_path = Path(path)
        try:
            raw = json.loads(calibration_path.read_text(encoding="utf-8"))
        except FileNotFoundError as error:
            raise CalibrationError(
                f"calibration file does not exist: {calibration_path}"
            ) from error
        except json.JSONDecodeError as error:
            raise CalibrationError(
                f"invalid calibration JSON at line {error.lineno}: {error.msg}"
            ) from error

        if not isinstance(raw, dict):
            raise CalibrationError("calibration root must be a JSON object")
        calibrated = raw.get("calibrated")
        if not isinstance(calibrated, bool):
            raise CalibrationError("calibrated must be true or false")
        if require_calibrated and not calibrated:
            raise CalibrationError(
                "hardware mode requires a reviewed calibration with calibrated=true"
            )

        frequency_hz = raw.get("frequency_hz", 50)
        motor_delay_ms = raw.get("motor_delay_ms", 20)
        if (
            isinstance(frequency_hz, bool)
            or not isinstance(frequency_hz, int)
            or not 40 <= frequency_hz <= 60
        ):
            raise CalibrationError("frequency_hz must be an integer from 40 to 60")
        if (
            isinstance(motor_delay_ms, bool)
            or not isinstance(motor_delay_ms, (int, float))
            or not 0 <= motor_delay_ms <= 100
        ):
            raise CalibrationError("motor_delay_ms must be between 0 and 100")

        raw_servos = raw.get("servos")
        if not isinstance(raw_servos, dict):
            raise CalibrationError("servos must be a JSON object")
        if set(raw_servos) != set(SERVO_CHANNELS):
            missing = sorted(set(SERVO_CHANNELS) - set(raw_servos))
            extra = sorted(set(raw_servos) - set(SERVO_CHANNELS))
            raise CalibrationError(
                f"calibration servo set mismatch; missing={missing}, extra={extra}"
            )

        servos: dict[str, ServoCalibration] = {}
        for name, expected_channel in SERVO_CHANNELS.items():
            item = raw_servos[name]
            if not isinstance(item, dict):
                raise CalibrationError(f"{name} calibration must be an object")
            try:
                spec = ServoCalibration(
                    channel=item["channel"],
                    anatomical_joint=item.get("anatomical_joint", SERVO_ANATOMY[name]),
                    minimum_angle=item["minimum_angle"],
                    maximum_angle=item["maximum_angle"],
                    trim_degrees=item.get("trim_degrees", 0),
                    inverted=item.get("inverted", False),
                    minimum_us=item.get("minimum_us", 500),
                    maximum_us=item.get("maximum_us", 2400),
                )
            except KeyError as error:
                raise CalibrationError(
                    f"{name} is missing required field {error.args[0]}"
                ) from error
            _validate_servo_calibration(name, spec, expected_channel)
            servos[name] = spec

        return cls(
            calibrated=calibrated,
            frequency_hz=frequency_hz,
            motor_delay_ms=float(motor_delay_ms),
            servos=servos,
        )

    def validate_angles(self, angles: Mapping[str, float]) -> None:
        if not angles:
            raise CalibrationError("servo frame cannot be empty")
        for name, angle in angles.items():
            try:
                spec = self.servos[name]
            except KeyError as error:
                raise CalibrationError(f"unknown servo: {name}") from error
            spec.validate(name, angle)


def _validate_servo_calibration(
    name: str,
    spec: ServoCalibration,
    expected_channel: int,
) -> None:
    numeric_fields = (
        spec.minimum_angle,
        spec.maximum_angle,
        spec.trim_degrees,
        spec.minimum_us,
        spec.maximum_us,
    )
    if any(
        isinstance(value, bool) or not isinstance(value, (int, float))
        for value in numeric_fields
    ):
        raise CalibrationError(f"{name} calibration contains a non-numeric value")
    if spec.channel != expected_channel:
        raise CalibrationError(
            f"{name} must use Sesame channel {expected_channel}, got {spec.channel}"
        )
    if not isinstance(spec.anatomical_joint, str) or not spec.anatomical_joint.strip():
        raise CalibrationError(f"{name} anatomical_joint must be a string")
    if not 0 <= spec.minimum_angle < spec.maximum_angle <= 180:
        raise CalibrationError(f"{name} angle range must fit within 0..180")
    if not isinstance(spec.inverted, bool):
        raise CalibrationError(f"{name} inverted must be true or false")
    if not 300 <= spec.minimum_us < spec.maximum_us <= 3000:
        raise CalibrationError(f"{name} pulse range must fit within 300..3000 us")


class ServoDriver(Protocol):
    calibration: RobotCalibration

    def open(self) -> None: ...

    def validate_angles(self, angles: Mapping[str, float]) -> None: ...

    def write_angles(self, angles: Mapping[str, float]) -> None: ...

    def release_all(self) -> None: ...

    def close(self) -> None: ...


class DryRunServoDriver:
    """A non-hardware driver used by development, CI, and voice dry runs."""

    def __init__(self, calibration: RobotCalibration | None = None) -> None:
        self.calibration = calibration or RobotCalibration.development()
        self.opened = False
        self.writes: list[dict[str, float]] = []

    def open(self) -> None:
        self.opened = True

    def validate_angles(self, angles: Mapping[str, float]) -> None:
        self.calibration.validate_angles(angles)

    def write_angles(self, angles: Mapping[str, float]) -> None:
        if not self.opened:
            raise RuntimeError("servo driver is not open")
        self.validate_angles(angles)
        pose = dict(angles)
        self.writes.append(pose)
        logger.info("dry-run servo frame: %s", pose)

    def release_all(self) -> None:
        self.opened = False

    def close(self) -> None:
        self.release_all()


class PCA9685ServoDriver:
    """Persistent PCA9685 owner.

    CircuitPython imports stay inside ``open`` so the package and tests remain
    usable on machines that are not Raspberry Pis.
    """

    def __init__(
        self,
        calibration: RobotCalibration,
        *,
        address: int = 0x40,
    ) -> None:
        if not calibration.calibrated:
            raise CalibrationError("PCA9685 driver refuses unreviewed calibration")
        if not 0x03 <= address <= 0x77:
            raise ValueError("I2C address must be between 0x03 and 0x77")
        self.calibration = calibration
        self.address = address
        self._pca: object | None = None

    def open(self) -> None:
        if self._pca is not None:
            return
        try:
            import board
            import busio
            from adafruit_pca9685 import PCA9685
        except ImportError as error:
            raise RuntimeError(
                "Pi hardware packages are missing; install the 'pi' extra"
            ) from error

        i2c = busio.I2C(board.SCL, board.SDA)
        pca = PCA9685(i2c, address=self.address)
        pca.frequency = self.calibration.frequency_hz
        self._pca = pca

    def validate_angles(self, angles: Mapping[str, float]) -> None:
        self.calibration.validate_angles(angles)
        for name, angle in angles.items():
            self.calibration.servos[name].hardware_angle(name, angle)

    def write_angles(self, angles: Mapping[str, float]) -> None:
        if self._pca is None:
            raise RuntimeError("servo driver is not open")
        self.validate_angles(angles)
        items = list(angles.items())
        for index, (name, angle) in enumerate(items):
            spec = self.calibration.servos[name]
            duty_cycle = spec.duty_cycle(
                name,
                angle,
                self.calibration.frequency_hz,
            )
            self._pca.channels[spec.channel].duty_cycle = duty_cycle
            if index < len(items) - 1 and self.calibration.motor_delay_ms:
                time.sleep(self.calibration.motor_delay_ms / 1000)
        logger.info("hardware servo frame: %s", dict(angles))

    def release_all(self) -> None:
        if self._pca is None:
            return
        for channel in SERVO_CHANNELS.values():
            try:
                self._pca.channels[channel].duty_cycle = 0
            except Exception:
                logger.exception("failed to release PCA9685 channel %s", channel)

    def close(self) -> None:
        if self._pca is None:
            return
        self.release_all()
        self._pca.deinit()
        self._pca = None
