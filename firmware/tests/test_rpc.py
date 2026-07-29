from __future__ import annotations

import json

import pytest

from molty.executor import MotionExecutor
from molty.rpc import MotionRpcController
from molty.servo import DryRunServoDriver


def parse(response: str) -> dict[str, object]:
    return json.loads(response)


@pytest.mark.asyncio
async def test_action_rpc_runs_an_approved_motion() -> None:
    driver = DryRunServoDriver()
    controller = MotionRpcController(
        MotionExecutor(driver, time_scale=0),
    )

    response = parse(
        await controller.action(
            json.dumps(
                {
                    "command_id": "rpc-wave",
                    "action": "wave",
                    "speed": "normal",
                    "cycles": 1,
                }
            ),
            "agent-test",
        )
    )

    assert response["ok"] is True
    assert response["result"]["status"] == "completed"


@pytest.mark.asyncio
async def test_rpc_rejects_non_agent_callers() -> None:
    controller = MotionRpcController(
        MotionExecutor(DryRunServoDriver(), time_scale=0),
    )

    response = parse(
        await controller.action(
            '{"command_id":"x","action":"wave"}',
            "random-room-user",
        )
    )

    assert response["ok"] is False
    assert "not authorized" in response["error"]


@pytest.mark.asyncio
async def test_rpc_rejects_raw_or_unknown_motion() -> None:
    controller = MotionRpcController(
        MotionExecutor(DryRunServoDriver(), time_scale=0),
    )

    response = parse(
        await controller.action(
            '{"command_id":"x","action":"set_servo","angle":90}',
            "agent-test",
        )
    )

    assert response["ok"] is False
    assert "unknown action" in response["error"]


@pytest.mark.asyncio
async def test_rpc_rejects_boolean_cycle_value() -> None:
    controller = MotionRpcController(
        MotionExecutor(DryRunServoDriver(), time_scale=0),
    )

    response = parse(
        await controller.action(
            '{"command_id":"x","action":"forward","cycles":true}',
            "agent-test",
        )
    )

    assert response["ok"] is False
    assert "integer" in response["error"]
