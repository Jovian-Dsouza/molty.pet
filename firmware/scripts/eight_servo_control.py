#!/usr/bin/env python3
"""Set the position of up to eight PCA9685-connected positional servos."""

import argparse
import time

import board
import busio
from adafruit_pca9685 import PCA9685


SERVO_CHANNELS = {
    "r1": 0,
    "r2": 1,
    "l1": 2,
    "l2": 3,
    "r4": 4,
    "r3": 5,
    "l3": 6,
    "l4": 7,
}

SERVO_MIN_US = 500
SERVO_MAX_US = 2400

POSES = {
    "stand": {"r1": 135, "r2": 45, "l1": 45, "l2": 135, "r4": 0, "r3": 180, "l3": 0, "l4": 180},
    "rest": {name: 90 for name in SERVO_CHANNELS},
}

def angle_to_duty_cycle(angle: float, minimum_us: int, maximum_us: int) -> int:
    pulse_us = minimum_us + (angle / 180.0) * (maximum_us - minimum_us)
    return round((pulse_us / 20_000) * 0xFFFF)


def parse_angle(value: str) -> float:
    angle = float(value)
    if not 0 <= angle <= 180:
        raise argparse.ArgumentTypeError("angle must be between 0 and 180")
    return angle


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--pose", choices=POSES, help="Move every servo to the named pose")
    for name, channel in SERVO_CHANNELS.items():
        parser.add_argument(
            f"--{name}", f"--{name.upper()}", dest=name, type=parse_angle,
            help=f"Set {name.upper()} (PCA9685 channel {channel}) to an angle in degrees",
        )
    parser.add_argument("--hold-seconds", type=float, default=1.0,
                        help="Keep PWM enabled after moving (default: 1.0)")
    parser.add_argument("--motor-delay-ms", type=float, default=20.0,
                        help="Delay between servo commands to limit current spikes (default: 20)")
    parser.add_argument("--address", type=lambda value: int(value, 0), default=0x40,
                        help="PCA9685 I2C address (default: 0x40)")
    parser.add_argument("--minimum-us", type=int, default=SERVO_MIN_US,
                        help="Pulse width for 0 degrees (default: 500)")
    parser.add_argument("--maximum-us", type=int, default=SERVO_MAX_US,
                        help="Pulse width for 180 degrees (default: 2400)")
    args = parser.parse_args()

    if args.hold_seconds < 0:
        parser.error("--hold-seconds cannot be negative")
    if args.motor_delay_ms < 0:
        parser.error("--motor-delay-ms cannot be negative")
    if args.minimum_us >= args.maximum_us:
        parser.error("--minimum-us must be less than --maximum-us")
    targets = POSES[args.pose].copy() if args.pose else {}
    targets.update({name: value for name in SERVO_CHANNELS if (value := getattr(args, name)) is not None})
    if not targets:
        parser.error("provide --pose stand, --pose rest, or at least one servo angle flag")
    i2c = busio.I2C(board.SCL, board.SDA)
    pca = PCA9685(i2c, address=args.address)
    pca.frequency = 50

    try:
        target_items = list(targets.items())
        for index, (name, angle) in enumerate(target_items):
            channel = SERVO_CHANNELS[name]
            pca.channels[channel].duty_cycle = angle_to_duty_cycle(
                angle, args.minimum_us, args.maximum_us
            )
            print(f"{name.upper()} channel {channel}: {angle:g} degrees")
            if index < len(target_items) - 1:
                time.sleep(args.motor_delay_ms / 1000)
        time.sleep(args.hold_seconds)
    finally:
        for name in targets:
            pca.channels[SERVO_CHANNELS[name]].duty_cycle = 0
        pca.deinit()


if __name__ == "__main__":
    main()
