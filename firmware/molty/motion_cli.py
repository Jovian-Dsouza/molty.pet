"""Command-line entry point for the new persistent motion executor."""

from __future__ import annotations

import argparse
import asyncio
import json
from pathlib import Path

from .executor import MotionExecutor
from .motion_catalog import ACTION_NAMES, SPEED_DELAY_SCALE
from .servo import DryRunServoDriver, PCA9685ServoDriver, RobotCalibration


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("action", choices=ACTION_NAMES)
    parser.add_argument("--cycles", type=int, default=1)
    parser.add_argument("--speed", choices=SPEED_DELAY_SCALE, default="normal")
    parser.add_argument(
        "--hardware",
        action="store_true",
        help="Write to PCA9685; the default is a safe dry run",
    )
    parser.add_argument(
        "--calibration",
        type=Path,
        default=Path("calibration.json"),
        help="Reviewed calibration file required by --hardware",
    )
    parser.add_argument(
        "--address",
        type=lambda value: int(value, 0),
        default=0x40,
    )
    return parser


async def run(args: argparse.Namespace) -> int:
    if args.hardware:
        calibration = RobotCalibration.from_file(args.calibration)
        driver = PCA9685ServoDriver(calibration, address=args.address)
    else:
        driver = DryRunServoDriver()

    executor = MotionExecutor(driver)
    try:
        result = await executor.execute_action(
            command_id="local-cli",
            action=args.action,
            speed=args.speed,
            cycles=args.cycles,
        )
        print(json.dumps(result.to_dict(), indent=2))
        return 0 if result.status == "completed" else 1
    finally:
        await executor.shutdown()


def main() -> int:
    args = build_parser().parse_args()
    try:
        return asyncio.run(run(args))
    except KeyboardInterrupt:
        return 130


if __name__ == "__main__":
    raise SystemExit(main())
