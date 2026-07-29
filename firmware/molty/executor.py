"""Single-owner, cancellable execution of the Sesame motion catalog."""

from __future__ import annotations

import asyncio
from collections import OrderedDict
from collections.abc import Sequence
from dataclasses import asdict, dataclass
from typing import Any, Literal

from .motion_catalog import (
    LOCOMOTION_ACTIONS,
    SPEED_DELAY_SCALE,
    STAND,
    MotionFrame,
    MotionStep,
    Speed,
    get_motion,
)
from .servo import ServoDriver

MotionStatus = Literal["completed", "cancelled", "rejected", "failed", "idle"]


@dataclass(frozen=True, slots=True)
class MotionResult:
    command_id: str
    status: MotionStatus
    action: str
    detail: str

    def to_dict(self) -> dict[str, str]:
        return asdict(self)


class MotionCancelledError(Exception):
    """Internal control-flow exception for a requested motion cancellation."""


class MotionExecutor:
    """Serializes all body access and recovers to stand on interruption."""

    def __init__(
        self,
        driver: ServoDriver,
        *,
        max_plan_steps: int = 4,
        max_locomotion_cycles: int = 2,
        frame_delay_ms: float = 100,
        idempotency_cache_size: int = 128,
        time_scale: float = 1.0,
    ) -> None:
        if time_scale < 0:
            raise ValueError("time_scale cannot be negative")
        self.driver = driver
        self.max_plan_steps = max_plan_steps
        self.max_locomotion_cycles = max_locomotion_cycles
        self.frame_delay_ms = frame_delay_ms
        self.idempotency_cache_size = idempotency_cache_size
        self.time_scale = time_scale

        self._lock = asyncio.Lock()
        self._cancel_event = asyncio.Event()
        self._active_done = asyncio.Event()
        self._active_done.set()
        self._active_command_id: str | None = None
        self._active_action: str | None = None
        self._pose: dict[str, float] = {}
        self._fault: str | None = None
        self._opened = False
        self._results: OrderedDict[str, MotionResult] = OrderedDict()

    async def open(self) -> None:
        if self._opened:
            return
        await asyncio.to_thread(self.driver.open)
        self._opened = True

    async def execute_action(
        self,
        *,
        command_id: str,
        action: str,
        speed: Speed = "normal",
        cycles: int = 1,
    ) -> MotionResult:
        return await self.execute_plan(
            command_id=command_id,
            steps=(MotionStep(action=action, speed=speed, cycles=cycles),),
        )

    async def execute_plan(
        self,
        *,
        command_id: str,
        steps: Sequence[MotionStep],
    ) -> MotionResult:
        self._validate_command_id(command_id)
        normalized = tuple(steps)
        self._validate_plan(normalized)

        cached = self._results.get(command_id)
        if cached is not None:
            return cached
        if self._fault is not None:
            return MotionResult(command_id, "rejected", "plan", self._fault)

        await self.open()
        async with self._lock:
            cached = self._results.get(command_id)
            if cached is not None:
                return cached
            if self._fault is not None:
                return MotionResult(command_id, "rejected", "plan", self._fault)

            self._active_command_id = command_id
            self._active_action = (
                normalized[0].action if len(normalized) == 1 else "plan"
            )
            self._active_done.clear()
            self._cancel_event.clear()

            try:
                for step in normalized:
                    motion = get_motion(
                        step.action,
                        cycles=step.cycles,
                        frame_delay_ms=self.frame_delay_ms,
                    )
                    for item in motion.frames:
                        await self._execute_frame(item, step.speed)
                result = MotionResult(
                    command_id,
                    "completed",
                    self._active_action,
                    "motion completed",
                )
            except MotionCancelledError:
                result = await self._recover_from_cancel(command_id)
            except Exception as error:
                self._fault = f"motion fault: {error}"
                try:
                    await asyncio.to_thread(self.driver.release_all)
                finally:
                    result = MotionResult(
                        command_id,
                        "failed",
                        self._active_action or "plan",
                        self._fault,
                    )
            finally:
                self._active_command_id = None
                self._active_action = None
                self._active_done.set()

            self._remember_result(result)
            return result

    async def cancel(self, *, reason: str = "requested") -> MotionResult:
        command_id = self._active_command_id
        action = self._active_action
        if command_id is None:
            return MotionResult("", "idle", "", "no motion is active")

        self._cancel_event.set()
        try:
            await asyncio.wait_for(self._active_done.wait(), timeout=3)
        except TimeoutError:
            self._fault = f"motion cancellation timed out: {reason}"
            await asyncio.to_thread(self.driver.release_all)
            return MotionResult(
                command_id,
                "failed",
                action or "",
                self._fault,
            )
        return self._results.get(
            command_id,
            MotionResult(command_id, "cancelled", action or "", reason),
        )

    async def state(self) -> dict[str, Any]:
        return {
            "opened": self._opened,
            "active": self._active_command_id is not None,
            "command_id": self._active_command_id,
            "action": self._active_action,
            "pose": dict(self._pose),
            "fault": self._fault,
        }

    async def clear_fault(self) -> None:
        if self._active_command_id is not None:
            raise RuntimeError("cannot clear a fault while motion is active")
        self._fault = None

    async def shutdown(self) -> None:
        await self.cancel(reason="device shutdown")
        if self._opened:
            await asyncio.to_thread(self.driver.close)
            self._opened = False

    async def _execute_frame(self, item: MotionFrame, speed: Speed) -> None:
        if self._cancel_event.is_set():
            raise MotionCancelledError
        angles = item.angles
        self.driver.validate_angles(angles)
        await asyncio.to_thread(self.driver.write_angles, angles)
        self._pose.update(angles)
        if self._cancel_event.is_set():
            raise MotionCancelledError
        delay_seconds = item.hold_ms * SPEED_DELAY_SCALE[speed] * self.time_scale / 1000
        if delay_seconds <= 0:
            return
        try:
            await asyncio.wait_for(self._cancel_event.wait(), timeout=delay_seconds)
        except TimeoutError:
            return
        raise MotionCancelledError

    async def _recover_from_cancel(self, command_id: str) -> MotionResult:
        action = self._active_action or "plan"
        try:
            self.driver.validate_angles(STAND)
            await asyncio.to_thread(self.driver.write_angles, STAND)
            self._pose = dict(STAND)
            return MotionResult(
                command_id,
                "cancelled",
                action,
                "motion cancelled and recovered to stand",
            )
        except Exception as error:
            self._fault = f"cancel recovery failed: {error}"
            await asyncio.to_thread(self.driver.release_all)
            return MotionResult(
                command_id,
                "failed",
                action,
                self._fault,
            )

    def _validate_plan(self, steps: tuple[MotionStep, ...]) -> None:
        if not steps:
            raise ValueError("motion plan must contain at least one step")
        if len(steps) > self.max_plan_steps:
            raise ValueError(
                f"motion plan may contain at most {self.max_plan_steps} steps"
            )

        locomotion_cycles = 0
        for step in steps:
            if step.speed not in SPEED_DELAY_SCALE:
                raise ValueError(f"unknown speed: {step.speed}")
            motion = get_motion(
                step.action,
                cycles=step.cycles,
                frame_delay_ms=self.frame_delay_ms,
            )
            for item in motion.frames:
                self.driver.validate_angles(item.angles)
            if step.action in LOCOMOTION_ACTIONS:
                if step.cycles > self.max_locomotion_cycles:
                    raise ValueError(
                        f"locomotion is limited to {self.max_locomotion_cycles} cycles"
                    )
                locomotion_cycles += step.cycles

        if locomotion_cycles > self.max_locomotion_cycles:
            raise ValueError("combined locomotion exceeds the per-command cycle limit")

    def _remember_result(self, result: MotionResult) -> None:
        self._results[result.command_id] = result
        self._results.move_to_end(result.command_id)
        while len(self._results) > self.idempotency_cache_size:
            self._results.popitem(last=False)

    @staticmethod
    def _validate_command_id(command_id: str) -> None:
        if not isinstance(command_id, str) or not 1 <= len(command_id) <= 128:
            raise ValueError("command_id must be a string from 1 to 128 characters")
