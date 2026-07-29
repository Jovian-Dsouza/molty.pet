"""JSON-only LiveKit RPC boundary for local robot control."""

from __future__ import annotations

import json
from typing import Any

from .executor import MotionExecutor, MotionResult
from .motion_catalog import SPEED_DELAY_SCALE, MotionStep

ACTION_RPC = "robot.action.v1"
PLAN_RPC = "robot.motion.plan.v1"
CANCEL_RPC = "robot.motion.cancel.v1"
STATE_RPC = "robot.state.v1"
MAX_RPC_BYTES = 16_000


class MotionRpcController:
    """Validate untrusted room payloads before they reach the executor."""

    def __init__(
        self,
        executor: MotionExecutor,
        *,
        allowed_caller_prefix: str = "agent-",
    ) -> None:
        self.executor = executor
        self.allowed_caller_prefix = allowed_caller_prefix

    async def action(self, payload: str, caller_identity: str) -> str:
        try:
            self._authorize(caller_identity)
            request = self._parse_payload(payload)
            command_id = self._command_id(request)
            action = request.get("action")
            if not isinstance(action, str):
                raise ValueError("action must be a string")
            speed = self._speed(request.get("speed", "normal"))
            cycles = self._cycles(request.get("cycles", 1))
            result = await self.executor.execute_action(
                command_id=command_id,
                action=action,
                speed=speed,
                cycles=cycles,
            )
            return self._result(result)
        except (TypeError, ValueError) as error:
            return self._error(str(error))

    async def plan(self, payload: str, caller_identity: str) -> str:
        try:
            self._authorize(caller_identity)
            request = self._parse_payload(payload)
            command_id = self._command_id(request)
            raw_steps = request.get("steps")
            if not isinstance(raw_steps, list):
                raise ValueError("steps must be a list")
            steps: list[MotionStep] = []
            for index, raw_step in enumerate(raw_steps):
                if not isinstance(raw_step, dict):
                    raise ValueError(f"step {index} must be an object")
                action = raw_step.get("action")
                if not isinstance(action, str):
                    raise ValueError(f"step {index} action must be a string")
                steps.append(
                    MotionStep(
                        action=action,
                        speed=self._speed(raw_step.get("speed", "normal")),
                        cycles=self._cycles(raw_step.get("cycles", 1)),
                    )
                )
            result = await self.executor.execute_plan(
                command_id=command_id,
                steps=steps,
            )
            return self._result(result)
        except (TypeError, ValueError) as error:
            return self._error(str(error))

    async def cancel(self, payload: str, caller_identity: str) -> str:
        try:
            self._authorize(caller_identity)
            request = self._parse_payload(payload)
            reason = request.get("reason", "voice interruption")
            if not isinstance(reason, str) or len(reason) > 200:
                raise ValueError(
                    "reason must be a string no longer than 200 characters"
                )
            result = await self.executor.cancel(reason=reason)
            return self._result(result)
        except (TypeError, ValueError) as error:
            return self._error(str(error))

    async def state(self, payload: str, caller_identity: str) -> str:
        try:
            self._authorize(caller_identity)
            self._parse_payload(payload)
            return json.dumps({"ok": True, "state": await self.executor.state()})
        except (TypeError, ValueError) as error:
            return self._error(str(error))

    def _authorize(self, caller_identity: str) -> None:
        if not isinstance(caller_identity, str) or not caller_identity.startswith(
            self.allowed_caller_prefix
        ):
            raise ValueError("caller is not authorized to control motion")

    @staticmethod
    def _parse_payload(payload: str) -> dict[str, Any]:
        if not isinstance(payload, str):
            raise TypeError("RPC payload must be text")
        if len(payload.encode("utf-8")) > MAX_RPC_BYTES:
            raise ValueError("RPC payload is too large")
        try:
            parsed = json.loads(payload or "{}")
        except json.JSONDecodeError as error:
            raise ValueError(f"invalid JSON: {error.msg}") from error
        if not isinstance(parsed, dict):
            raise ValueError("RPC payload must be a JSON object")
        return parsed

    @staticmethod
    def _command_id(request: dict[str, Any]) -> str:
        command_id = request.get("command_id")
        if not isinstance(command_id, str) or not 1 <= len(command_id) <= 128:
            raise ValueError("command_id must be a string from 1 to 128 characters")
        return command_id

    @staticmethod
    def _cycles(value: object) -> int:
        if isinstance(value, bool) or not isinstance(value, int):
            raise ValueError("cycles must be an integer")
        return value

    @staticmethod
    def _speed(value: object) -> str:
        if not isinstance(value, str) or value not in SPEED_DELAY_SCALE:
            choices = ", ".join(SPEED_DELAY_SCALE)
            raise ValueError(f"speed must be one of: {choices}")
        return value

    @staticmethod
    def _result(result: MotionResult) -> str:
        return json.dumps(
            {
                "ok": result.status in {"completed", "cancelled", "idle"},
                "result": result.to_dict(),
            }
        )

    @staticmethod
    def _error(message: str) -> str:
        return json.dumps({"ok": False, "error": message})
