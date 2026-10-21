from __future__ import annotations

import asyncio

import pytest

from molty.executor import MotionExecutor
from molty.motion_catalog import STAND, MotionStep
from molty.servo import DryRunServoDriver


@pytest.mark.asyncio
async def test_action_executes_and_duplicate_command_is_not_replayed() -> None:
    driver = DryRunServoDriver()
    executor = MotionExecutor(driver, time_scale=0)

    first = await executor.execute_action(
        command_id="same-command",
        action="wave",
    )
    write_count = len(driver.writes)
    duplicate = await executor.execute_action(
        command_id="same-command",
        action="wave",
    )

    assert first.status == "completed"
    assert duplicate == first
    assert len(driver.writes) == write_count
    await executor.shutdown()


@pytest.mark.asyncio
async def test_interruption_cancels_motion_and_recovers_to_stand() -> None:
    driver = DryRunServoDriver()
    executor = MotionExecutor(driver, time_scale=0.03)
    task = asyncio.create_task(
        executor.execute_action(
            command_id="cancel-me",
            action="bow",
        )
    )

    while not (await executor.state())["active"]:
        await asyncio.sleep(0)
    cancelled = await executor.cancel(reason="user interrupted")
    result = await task

    assert cancelled.status == "cancelled"
    assert result.status == "cancelled"
    assert driver.writes[-1] == STAND
    assert (await executor.state())["pose"] == STAND
    await executor.shutdown()


@pytest.mark.asyncio
async def test_plan_is_limited_to_four_steps() -> None:
    executor = MotionExecutor(DryRunServoDriver(), time_scale=0)

    with pytest.raises(ValueError, match="at most 4"):
        await executor.execute_plan(
            command_id="too-long",
            steps=[MotionStep("wave")] * 5,
        )


@pytest.mark.asyncio
async def test_combined_locomotion_is_bounded() -> None:
    executor = MotionExecutor(DryRunServoDriver(), time_scale=0)

    with pytest.raises(ValueError, match="combined locomotion"):
        await executor.execute_plan(
            command_id="walk-too-far",
            steps=[
                MotionStep("forward", cycles=2),
                MotionStep("left", cycles=1),
            ],
        )
