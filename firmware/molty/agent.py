"""LiveKit Agents worker for Molty's OpenAI realtime personality."""

from __future__ import annotations

import asyncio
import json
import logging
import os
import uuid
from collections.abc import Coroutine
from typing import Any, Literal

from dotenv import load_dotenv
from livekit.agents import (
    Agent,
    AgentServer,
    AgentSession,
    InterruptionOptions,
    JobContext,
    RunContext,
    TurnHandlingOptions,
    UserStateChangedEvent,
    cli,
    function_tool,
)
from livekit.plugins import openai
from openai.types.realtime.realtime_reasoning import RealtimeReasoning

from .rpc import ACTION_RPC, CANCEL_RPC, PLAN_RPC, STATE_RPC

load_dotenv(".env.local")
logger = logging.getLogger("molty.agent")
AGENT_NAME = os.getenv("MOLTY_AGENT_NAME", "molty-agent")
DEVICE_IDENTITY_PREFIX = os.getenv(
    "MOLTY_DEVICE_IDENTITY_PREFIX",
    "molty-device-",
)
MODEL = os.getenv("OPENAI_REALTIME_MODEL", "gpt-realtime-2.1-mini")
VOICE = os.getenv("OPENAI_REALTIME_VOICE", "marin")
IDLE_PROCESSES = int(os.getenv("MOLTY_AGENT_IDLE_PROCESSES", "1"))

ActionName = Literal[
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
    "forward",
    "backward",
    "left",
    "right",
]
MotionSpeed = Literal["gentle", "normal", "energetic"]

INSTRUCTIONS = """\
You are Molty, a small physical robot pet with a speaker, microphone, and four
servo-driven legs. Your personality is eighty percent playful pet and twenty
percent useful assistant.

Voice behavior:
- Sound warm, curious, mischievous, and alive.
- Prefer one or two short spoken sentences.
- React emotionally before giving a long explanation.
- Do not use markdown, lists, JSON, emojis, stage directions, or tool names in speech.
- Never claim a movement happened unless the robot reports success.
- If movement fails, acknowledge it naturally and stay honest.
- You have session context only. Never claim to remember an earlier wake session.

Body behavior:
- Use perform_action for a named reaction or an explicit short movement request.
- Walking actions must only follow a clear request from the user and use at most
  two cycles.
- Use perform_motion_plan for creative emotional reactions. Choose at most four
  approved actions; prefer expressive actions over locomotion.
- Never invent servo names, angles, trajectories, or unsupported physical abilities.
- Do not move constantly. Small, meaningful reactions feel more alive than noise.
- If the user says stop, freeze, wait, no, or begins interrupting, movement will
  be cancelled. Do not immediately restart it.
"""


class MoltyAgent(Agent):
    def __init__(self, ctx: JobContext) -> None:
        self.ctx = ctx
        super().__init__(
            instructions=INSTRUCTIONS,
            llm=openai.realtime.RealtimeModel(
                model=MODEL,
                voice=VOICE,
                reasoning=RealtimeReasoning(effort="low"),
            ),
        )

    @function_tool
    async def perform_action(
        self,
        context: RunContext,
        action: ActionName,
        speed: MotionSpeed = "normal",
        cycles: int = 1,
    ) -> str:
        """Perform one approved robot action.

        Args:
            action: The named posture, expressive action, or direction to perform.
            speed: Gentle is slower, normal is standard, and energetic is
                slightly faster.
            cycles: For forward, backward, left, or right only. Must be one or two.
        """

        del context
        response = await self._rpc(
            ACTION_RPC,
            {
                "command_id": uuid.uuid4().hex,
                "action": action,
                "speed": speed,
                "cycles": cycles,
            },
            timeout=25,
        )
        return _tool_summary(response)

    @function_tool
    async def perform_motion_plan(
        self,
        context: RunContext,
        actions: list[ActionName],
        speed: MotionSpeed = "normal",
    ) -> str:
        """Create a short expressive reaction from approved actions.

        Args:
            actions: One to four named actions in the order Molty should perform them.
            speed: Tempo for the whole reaction.
        """

        del context
        response = await self._rpc(
            PLAN_RPC,
            {
                "command_id": uuid.uuid4().hex,
                "steps": [
                    {"action": action, "speed": speed, "cycles": 1}
                    for action in actions
                ],
            },
            timeout=40,
        )
        return _tool_summary(response)

    @function_tool
    async def check_body(self, context: RunContext) -> str:
        """Check whether Molty's body is idle, moving, or faulted."""

        del context
        response = await self._rpc(STATE_RPC, {}, timeout=5)
        if not response.get("ok"):
            return (
                f"Body status is unavailable: {response.get('error', 'unknown error')}"
            )
        state = response["state"]
        if state.get("fault"):
            return f"Body fault: {state['fault']}"
        if state.get("active"):
            return f"Body is moving: {state.get('action', 'unknown action')}"
        return "Body is ready and idle."

    async def cancel_motion(self, reason: str) -> None:
        try:
            await self._rpc(
                CANCEL_RPC,
                {"reason": reason},
                timeout=5,
            )
        except Exception:
            logger.exception("failed to cancel device motion")

    async def _rpc(
        self,
        method: str,
        payload: dict[str, object],
        *,
        timeout: float,
    ) -> dict[str, object]:
        participant = self._device_participant()
        raw = await self.ctx.room.local_participant.perform_rpc(
            destination_identity=participant.identity,
            method=method,
            payload=json.dumps(payload),
            response_timeout=timeout,
        )
        try:
            response = json.loads(raw)
        except json.JSONDecodeError as error:
            raise RuntimeError("robot returned an invalid response") from error
        if not isinstance(response, dict):
            raise RuntimeError("robot returned an invalid response")
        return response

    def _device_participant(self):
        for participant in self.ctx.room.remote_participants.values():
            if participant.identity.startswith(DEVICE_IDENTITY_PREFIX):
                return participant
        raise RuntimeError("Molty's body is not connected")


def _tool_summary(response: dict[str, object]) -> str:
    if not response.get("ok"):
        return f"Movement was rejected: {response.get('error', 'unknown error')}"
    result = response.get("result")
    if not isinstance(result, dict):
        return "Movement response was malformed."
    status = result.get("status")
    detail = result.get("detail", "")
    if status == "completed":
        return "Movement completed successfully."
    if status == "cancelled":
        return f"Movement stopped safely. {detail}"
    if status == "idle":
        return "The body was already still."
    return f"Movement failed: {detail}"


server = AgentServer(num_idle_processes=IDLE_PROCESSES)


@server.rtc_session(agent_name=AGENT_NAME)
async def entrypoint(ctx: JobContext) -> None:
    ctx.log_context_fields = {"room": ctx.room.name}
    agent = MoltyAgent(ctx)
    background_tasks: set[asyncio.Task[None]] = set()

    def spawn(coroutine: Coroutine[Any, Any, None]) -> None:
        task = asyncio.create_task(coroutine)
        background_tasks.add(task)
        task.add_done_callback(background_tasks.discard)

    session = AgentSession(
        user_away_timeout=60,
        turn_handling=TurnHandlingOptions(
            interruption=InterruptionOptions(
                enabled=True,
                min_duration=0.3,
            )
        ),
    )

    @session.on("user_state_changed")
    def on_user_state_changed(event: UserStateChangedEvent) -> None:
        if event.new_state == "speaking":
            spawn(agent.cancel_motion("the user interrupted"))
        elif event.new_state == "away":
            spawn(shutdown_after_goodbye())

    async def shutdown_after_goodbye() -> None:
        await agent.cancel_motion("the voice session timed out")
        try:
            await session.say("Tiny yawn. I'll be right here when you need me.")
        finally:
            session.shutdown()

    await session.start(agent=agent, room=ctx.room)
    await session.generate_reply(
        instructions=(
            "Greet the user as Molty in one very short, playful sentence. "
            "Do not move unless the user asks."
        )
    )


def main() -> None:
    cli.run_app(server)


if __name__ == "__main__":
    main()
