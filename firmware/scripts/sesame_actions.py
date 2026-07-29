#!/home/pi/.venv/bin/python
"""Run Sesame robot poses and movement actions through its PCA9685 controller."""

from __future__ import annotations

import argparse
import os
import sys
import time
from collections.abc import Mapping


# The Pi keeps its CircuitPython hardware packages in this virtual environment.
# Re-exec there as well when invoked explicitly with `python3 sesame_actions.py`.
VENV_PYTHON = "/home/pi/.venv/bin/python"
if os.path.exists(VENV_PYTHON) and os.path.realpath(sys.executable) != os.path.realpath(VENV_PYTHON):
    os.execv(VENV_PYTHON, [VENV_PYTHON, *sys.argv])

import board
import busio
from adafruit_pca9685 import PCA9685

from eight_servo_control import (
    SERVO_CHANNELS,
    SERVO_MAX_US,
    SERVO_MIN_US,
    angle_to_duty_cycle,
)


STAND = {
    "r1": 135,
    "r2": 45,
    "l1": 45,
    "l2": 135,
    "r4": 0,
    "r3": 180,
    "l3": 0,
    "l4": 180,
}
REST = {name: 90 for name in SERVO_CHANNELS}

POSE_ACTIONS = (
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
)
MOVEMENT_ACTIONS = ("forward", "backward", "left", "right")
ACTIONS = POSE_ACTIONS + MOVEMENT_ACTIONS


class ServoController:
    """Write calibrated servo angles, or print them without touching hardware."""

    def __init__(
        self,
        *,
        address: int,
        minimum_us: int,
        maximum_us: int,
        motor_delay_ms: float,
        dry_run: bool,
    ) -> None:
        self.minimum_us = minimum_us
        self.maximum_us = maximum_us
        self.motor_delay_s = motor_delay_ms / 1000.0
        self.dry_run = dry_run
        self.pca: PCA9685 | None = None

        if not dry_run:
            i2c = busio.I2C(board.SCL, board.SDA)
            self.pca = PCA9685(i2c, address=address)
            self.pca.frequency = 50

    def set_angles(self, angles: Mapping[str, float]) -> None:
        items = list(angles.items())
        for index, (name, angle) in enumerate(items):
            if name not in SERVO_CHANNELS:
                raise ValueError(f"unknown servo: {name}")
            if not 0 <= angle <= 180:
                raise ValueError(f"{name.upper()} angle must be between 0 and 180: {angle}")

            channel = SERVO_CHANNELS[name]
            if self.dry_run:
                print(f"  {name.upper()} channel {channel} -> {angle:g} degrees")
            else:
                assert self.pca is not None
                self.pca.channels[channel].duty_cycle = angle_to_duty_cycle(
                    angle, self.minimum_us, self.maximum_us
                )

            if index < len(items) - 1 and self.motor_delay_s:
                if self.dry_run:
                    print(f"  wait {self.motor_delay_s * 1000:g} ms (motor delay)")
                else:
                    time.sleep(self.motor_delay_s)

    def disable_all(self) -> None:
        if self.pca is None:
            return
        for channel in SERVO_CHANNELS.values():
            try:
                self.pca.channels[channel].duty_cycle = 0
            except Exception:
                pass

    def close(self) -> None:
        if self.pca is None:
            return
        self.disable_all()
        self.pca.deinit()
        self.pca = None


class ActionRunner:
    """Python port of firmware/movement-sequences.h."""

    def __init__(
        self,
        controller: ServoController,
        *,
        cycles: int,
        frame_delay_ms: float,
    ) -> None:
        self.controller = controller
        self.cycles = cycles
        self.frame_delay_ms = frame_delay_ms

    def wait(self, milliseconds: float) -> None:
        if milliseconds <= 0:
            return
        if self.controller.dry_run:
            print(f"  wait {milliseconds:g} ms")
        else:
            time.sleep(milliseconds / 1000.0)

    def frame(self, angles: Mapping[str, float], delay_ms: float | None = None) -> None:
        self.controller.set_angles(angles)
        if delay_ms is not None:
            self.wait(delay_ms)

    def stand(self) -> None:
        self.frame(STAND)

    def rest(self) -> None:
        self.frame(REST)

    def wave(self) -> None:
        self.stand()
        self.wait(200)
        self.frame({"r4": 80, "l3": 180, "l2": 90, "r1": 100})
        self.wait(200)
        self.frame({"l3": 180}, 300)
        for _ in range(4):
            self.frame({"l3": 180}, 300)
            self.frame({"l3": 100}, 300)
        self.stand()

    def dance(self) -> None:
        self.frame(
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
        for _ in range(5):
            self.frame({"r4": 115, "r3": 115, "l3": 10, "l4": 10}, 300)
            self.frame({"r4": 160, "r3": 160, "l3": 65, "l4": 65}, 300)
        self.stand()

    def swim(self) -> None:
        self.rest()
        for _ in range(4):
            self.frame({"r1": 135, "r2": 45, "l1": 45, "l2": 135}, 400)
            self.frame({"r1": 90, "r2": 90, "l1": 90, "l2": 90}, 400)
        self.stand()

    def point(self) -> None:
        self.frame(
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
        )
        self.stand()

    def pushup(self) -> None:
        self.stand()
        self.wait(200)
        self.frame({"l1": 0, "r1": 180, "l3": 90, "r3": 90}, 500)
        for _ in range(4):
            self.frame({"l3": 0, "r3": 180}, 600)
            self.frame({"l3": 90, "r3": 90}, 500)
        self.stand()

    def bow(self) -> None:
        self.stand()
        self.wait(200)
        self.frame(
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
        )
        self.frame({"l3": 90, "r3": 90}, 3000)
        self.stand()

    def cute(self) -> None:
        self.stand()
        self.wait(200)
        self.frame(
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
        )
        for _ in range(5):
            self.frame({"r4": 180, "l4": 45}, 300)
            self.frame({"r4": 135, "l4": 0}, 300)
        self.stand()

    def freaky(self) -> None:
        self.stand()
        self.wait(200)
        self.frame({"l1": 0, "r1": 180, "l2": 180, "r2": 0, "r4": 90, "r3": 0}, 200)
        for _ in range(3):
            self.frame({"r3": 25}, 400)
            self.frame({"r3": 0}, 400)
        self.stand()

    def worm(self) -> None:
        self.stand()
        self.wait(200)
        self.frame(
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
        )
        for _ in range(5):
            self.frame({"r3": 45, "l3": 135, "r4": 45, "l4": 135}, 300)
            self.frame({"r3": 135, "l3": 45, "r4": 135, "l4": 45}, 300)
        self.stand()

    def shake(self) -> None:
        self.stand()
        self.wait(200)
        self.frame({"r1": 135, "l1": 45, "l3": 90, "r3": 90, "l2": 90, "r2": 90}, 200)
        for _ in range(5):
            self.frame({"r4": 45, "l4": 135}, 300)
            self.frame({"r4": 0, "l4": 180}, 300)
        self.stand()

    def shrug(self) -> None:
        self.stand()
        self.wait(200)
        self.frame({"r3": 90, "r4": 90, "l3": 90, "l4": 90}, 1000)
        self.frame({"r3": 0, "r4": 180, "l3": 180, "l4": 0}, 1500)
        self.stand()

    def dead(self) -> None:
        self.stand()
        self.wait(200)
        self.frame({"r3": 90, "r4": 90, "l3": 90, "l4": 90})

    def crab(self) -> None:
        self.stand()
        self.wait(200)
        self.frame(
            {"r1": 90, "r2": 90, "l1": 90, "l2": 90, "r4": 0, "r3": 180, "l3": 45, "l4": 135}
        )
        for _ in range(5):
            self.frame({"r4": 45, "r3": 135, "l3": 0, "l4": 180}, 300)
            self.frame({"r4": 0, "r3": 180, "l3": 45, "l4": 135}, 300)
        self.stand()

    def prepare_to_move(self) -> None:
        # Unlike the always-on firmware, each CLI invocation starts with PWM off.
        # Establish a complete known posture before sending partial gait frames.
        self.stand()
        self.wait(200)

    def forward(self) -> None:
        self.prepare_to_move()
        self.frame({"r3": 135, "l3": 45, "r2": 100, "l1": 25}, self.frame_delay_ms)
        for _ in range(self.cycles):
            self.frame({"r3": 135, "l3": 0}, self.frame_delay_ms)
            self.frame({"l4": 135, "l2": 90, "r4": 0, "r1": 180}, self.frame_delay_ms)
            self.frame({"r2": 45, "l1": 90}, self.frame_delay_ms)
            self.frame({"r4": 45, "l4": 180}, self.frame_delay_ms)
            self.frame({"r3": 180, "l3": 45, "r2": 90, "l1": 0}, self.frame_delay_ms)
            self.frame({"l2": 135, "r1": 90}, self.frame_delay_ms)
        self.stand()

    def backward(self) -> None:
        self.prepare_to_move()
        self.wait(self.frame_delay_ms)
        for _ in range(self.cycles):
            self.frame({"r3": 135, "l3": 0}, self.frame_delay_ms)
            self.frame({"l4": 135, "l2": 135, "r4": 0, "r1": 90}, self.frame_delay_ms)
            self.frame({"r2": 90, "l1": 0}, self.frame_delay_ms)
            self.frame({"r4": 45, "l4": 180}, self.frame_delay_ms)
            self.frame({"r3": 180, "l3": 45, "r2": 45, "l1": 90}, self.frame_delay_ms)
            self.frame({"l2": 90, "r1": 180}, self.frame_delay_ms)
        self.stand()

    def left(self) -> None:
        self.prepare_to_move()
        for _ in range(self.cycles):
            self.frame({"r3": 135, "l4": 135}, self.frame_delay_ms)
            self.frame({"r1": 180, "l2": 180}, self.frame_delay_ms)
            self.frame({"r3": 180, "l4": 180}, self.frame_delay_ms)
            self.frame({"r1": 135, "l2": 135}, self.frame_delay_ms)
            self.frame({"r4": 45, "l3": 45}, self.frame_delay_ms)
            self.frame({"r2": 90, "l1": 90}, self.frame_delay_ms)
            self.frame({"r4": 0, "l3": 0}, self.frame_delay_ms)
            self.frame({"r2": 45, "l1": 45}, self.frame_delay_ms)
        self.stand()

    def right(self) -> None:
        self.prepare_to_move()
        for _ in range(self.cycles):
            self.frame({"r4": 45, "l3": 45}, self.frame_delay_ms)
            self.frame({"r2": 0, "l1": 0}, self.frame_delay_ms)
            self.frame({"r4": 0, "l3": 0}, self.frame_delay_ms)
            self.frame({"r2": 45, "l1": 45}, self.frame_delay_ms)
            self.frame({"r3": 135, "l4": 135}, self.frame_delay_ms)
            self.frame({"r1": 90, "l2": 90}, self.frame_delay_ms)
            self.frame({"r3": 180, "l4": 180}, self.frame_delay_ms)
            self.frame({"r1": 135, "l2": 135}, self.frame_delay_ms)
        self.stand()

    def run(self, action: str) -> None:
        print(f"Action: {action}")
        getattr(self, action)()


def positive_int(value: str) -> int:
    parsed = int(value)
    if parsed <= 0:
        raise argparse.ArgumentTypeError("must be greater than zero")
    return parsed


def nonnegative_float(value: str) -> float:
    parsed = float(value)
    if parsed < 0:
        raise argparse.ArgumentTypeError("cannot be negative")
    return parsed


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("action", nargs="?", choices=ACTIONS, help="Action to perform")
    parser.add_argument("--cycles", type=positive_int, default=10, help="Gait cycles (default: 10)")
    parser.add_argument(
        "--frame-delay-ms",
        type=nonnegative_float,
        default=100.0,
        help="Delay between gait frames (default: 100)",
    )
    parser.add_argument(
        "--motor-delay-ms",
        type=nonnegative_float,
        default=20.0,
        help="Delay between servo writes (default: 20)",
    )
    parser.add_argument(
        "--hold-seconds",
        type=nonnegative_float,
        default=1.0,
        help="Hold the final pose before releasing PWM (default: 1.0)",
    )
    parser.add_argument(
        "--address",
        type=lambda value: int(value, 0),
        default=0x40,
        help="PCA9685 I2C address (default: 0x40)",
    )
    parser.add_argument("--minimum-us", type=int, default=SERVO_MIN_US)
    parser.add_argument("--maximum-us", type=int, default=SERVO_MAX_US)
    parser.add_argument("--list-actions", action="store_true", help="List actions and exit")
    parser.add_argument("--dry-run", action="store_true", help="Print commands without using hardware")
    return parser


def main() -> int:
    parser = build_parser()
    args = parser.parse_args()

    if args.list_actions:
        print("Poses: " + ", ".join(POSE_ACTIONS))
        print("Movement: " + ", ".join(MOVEMENT_ACTIONS))
        return 0
    if args.action is None:
        parser.error("provide an action or use --list-actions")
    if args.minimum_us >= args.maximum_us:
        parser.error("--minimum-us must be less than --maximum-us")

    controller: ServoController | None = None
    interrupted = False
    try:
        controller = ServoController(
            address=args.address,
            minimum_us=args.minimum_us,
            maximum_us=args.maximum_us,
            motor_delay_ms=args.motor_delay_ms,
            dry_run=args.dry_run,
        )
        runner = ActionRunner(controller, cycles=args.cycles, frame_delay_ms=args.frame_delay_ms)
        runner.run(args.action)
        if args.hold_seconds:
            if args.dry_run:
                print(f"Hold final pose for {args.hold_seconds:g} seconds")
            else:
                time.sleep(args.hold_seconds)
    except KeyboardInterrupt:
        interrupted = True
        print("\nInterrupted: returning to Stand before releasing PWM", file=sys.stderr)
        if controller is not None:
            try:
                controller.set_angles(STAND)
                if not args.dry_run and args.hold_seconds:
                    time.sleep(args.hold_seconds)
            except Exception as error:
                print(f"Could not return to Stand: {error}", file=sys.stderr)
    except Exception as error:
        print(f"Error: {error}", file=sys.stderr)
        return 1
    finally:
        if controller is not None:
            controller.close()

    if not args.dry_run:
        print("PWM released on all servo channels")
    return 130 if interrupted else 0


if __name__ == "__main__":
    raise SystemExit(main())
