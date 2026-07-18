"""Preview walking and jumping sequences on the eight-servo Molty mockup."""

from __future__ import annotations

import argparse
import math
import platform
import time

import mujoco
import numpy as np

from quadruped_env import MoltyQuadrupedEnv


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--headless", action="store_true", help="Run without opening the viewer."
    )
    parser.add_argument(
        "--duration", type=float, default=12.0, help="Headless duration in seconds."
    )
    parser.add_argument(
        "--controller",
        choices=("showcase", "walk", "jump", "stand", "random"),
        default="showcase",
        help="Motion sequence used for the visual check (default: showcase).",
    )
    parser.add_argument("--seed", type=int, default=7)
    return parser.parse_args()


def smoothstep(value: float) -> float:
    value = min(1.0, max(0.0, value))
    return value * value * (3.0 - 2.0 * value)


def interpolate(start: np.ndarray, end: np.ndarray, amount: float) -> np.ndarray:
    return start + (end - start) * smoothstep(amount)


def walk_action(simulation_time: float) -> np.ndarray:
    """A slow four-beat crawl that keeps three feet supporting the torso."""
    action = np.zeros(8, dtype=np.float32)
    cycle = simulation_time / 2.4
    for hip_index, phase_offset in ((0, 0.0), (2, 0.5), (4, 0.75), (6, 0.25)):
        leg_phase = (cycle + phase_offset) % 1.0
        if leg_phase < 0.72:
            stance_progress = smoothstep(leg_phase / 0.72)
            action[hip_index] = -0.32 + 0.64 * stance_progress
            action[hip_index + 1] = -0.10
        elif leg_phase < 0.82:
            lift_progress = smoothstep((leg_phase - 0.72) / 0.10)
            action[hip_index] = 0.32
            action[hip_index + 1] = -0.10 + 0.62 * lift_progress
        elif leg_phase < 0.92:
            swing_progress = smoothstep((leg_phase - 0.82) / 0.10)
            action[hip_index] = 0.32 - 0.64 * swing_progress
            action[hip_index + 1] = 0.52
        else:
            lower_progress = smoothstep((leg_phase - 0.92) / 0.08)
            action[hip_index] = -0.32
            action[hip_index + 1] = 0.52 - 0.62 * lower_progress
    return action


STAND_ACTION = np.zeros(8, dtype=np.float32)
CROUCH_ACTION = np.tile(np.array([-0.31, 0.625], dtype=np.float32), 4)
LAUNCH_ACTION = np.tile(np.array([0.50, -1.0], dtype=np.float32), 4)
TUCK_ACTION = np.tile(np.array([-0.10, 0.65], dtype=np.float32), 4)
LAND_ACTION = np.tile(np.array([0.125, -0.25], dtype=np.float32), 4)


def jump_action(sequence_time: float) -> np.ndarray:
    """Settle, crouch, extend rapidly, absorb the landing, then recover."""
    sequence_time %= 5.0
    if sequence_time < 1.0:
        return STAND_ACTION.copy()
    if sequence_time < 1.7:
        return interpolate(
            STAND_ACTION, CROUCH_ACTION, (sequence_time - 1.0) / 0.7
        )
    if sequence_time < 1.78:
        return interpolate(
            CROUCH_ACTION, LAUNCH_ACTION, (sequence_time - 1.7) / 0.08
        )
    if sequence_time < 1.92:
        return LAUNCH_ACTION.copy()
    if sequence_time < 2.04:
        return interpolate(
            LAUNCH_ACTION, TUCK_ACTION, (sequence_time - 1.92) / 0.12
        )
    if sequence_time < 2.22:
        return TUCK_ACTION.copy()
    if sequence_time < 2.50:
        return interpolate(
            TUCK_ACTION, LAND_ACTION, (sequence_time - 2.22) / 0.28
        )
    if sequence_time < 3.6:
        return interpolate(
            LAND_ACTION, STAND_ACTION, (sequence_time - 2.50) / 1.10
        )
    return STAND_ACTION.copy()


def controller_action(
    controller: str, simulation_time: float, rng: np.random.Generator
) -> np.ndarray:
    if controller == "stand":
        return STAND_ACTION.copy()
    if controller == "random":
        return rng.uniform(-0.5, 0.5, size=8).astype(np.float32)
    if controller == "walk":
        return walk_action(simulation_time)
    if controller == "jump":
        return jump_action(simulation_time)

    showcase_time = simulation_time % 13.0
    if showcase_time < 6.0:
        return walk_action(showcase_time)
    if showcase_time < 7.0:
        return STAND_ACTION.copy()
    return jump_action(showcase_time - 7.0)


def controller_phase(controller: str, simulation_time: float) -> str:
    if controller in {"stand", "random", "walk"}:
        return controller
    sequence_time = simulation_time % 5.0
    if controller == "showcase":
        showcase_time = simulation_time % 13.0
        if showcase_time < 6.0:
            return "walk"
        if showcase_time < 7.0:
            return "settle"
        sequence_time = (showcase_time - 7.0) % 5.0
    if sequence_time < 1.0:
        return "settle"
    if sequence_time < 1.7:
        return "crouch"
    if sequence_time < 1.92:
        return "launch"
    if sequence_time < 2.22:
        return "flight"
    if sequence_time < 2.50:
        return "landing"
    return "recover"


def run_headless(args: argparse.Namespace) -> None:
    env = MoltyQuadrupedEnv()
    rng = np.random.default_rng(args.seed)
    env.reset(seed=args.seed, options={"target_speed": 0.3})
    number_of_steps = math.ceil(args.duration / env.control_timestep)
    log_every = max(1, round(1.0 / env.control_timestep))
    total_reward = 0.0
    episodes = 1
    baseline_height = float(env.data.xpos[env._torso_id, 2])
    maximum_height = baseline_height
    airborne_steps = 0

    print(
        f"Loaded quadruped: {env.model.nu} servos, "
        f"{env.observation_space.shape[0]} observations"
    )
    for step in range(number_of_steps):
        action = controller_action(args.controller, env.data.time, rng)
        _, reward, terminated, truncated, info = env.step(action)
        total_reward += reward
        maximum_height = max(maximum_height, info["torso_height"])
        phase = controller_phase(args.controller, env.data.time)
        if phase in {"launch", "flight", "landing"} and np.sum(
            info["foot_contacts"]
        ) < 0.05:
            airborne_steps += 1
        if (step + 1) % log_every == 0:
            print(
                f"t={env.data.time:5.2f}s  phase={phase:>7}  "
                f"x={info['x_position']:+.3f} m  "
                f"vx={info['forward_velocity']:+.3f} m/s  "
                f"height={info['torso_height']:.3f} m"
            )
        if terminated or truncated:
            episodes += 1
            env.reset(seed=args.seed + episodes, options={"target_speed": 0.3})

    if not np.isfinite(env.data.qpos).all():
        raise RuntimeError("Quadruped simulation produced non-finite state")
    print(
        f"Smoke test passed; {episodes} episode(s), cumulative reward {total_reward:.1f}"
    )
    if args.controller in {"jump", "showcase"}:
        height_gain = maximum_height - baseline_height
        airborne_time = airborne_steps * env.control_timestep
        print(
            f"Jump metrics: height gain={height_gain:.3f} m, "
            f"airborne time={airborne_time:.3f} s"
        )
        if height_gain < 0.02 or airborne_steps < 1:
            raise RuntimeError("Jump sequence did not achieve measurable lift and airtime")
    env.close()


def run_interactive(args: argparse.Namespace) -> None:
    import mujoco.viewer

    env = MoltyQuadrupedEnv()
    env.reset(seed=args.seed, options={"target_speed": 0.3})
    rng = np.random.default_rng(args.seed)

    if platform.system() == "Darwin":

        def control_callback(model: mujoco.MjModel, data: mujoco.MjData) -> None:
            action = controller_action(args.controller, data.time, rng)
            data.ctrl[:] = env.action_to_servo_targets(action)

        mujoco.set_mjcb_control(control_callback)
        try:
            mujoco.viewer.launch(
                env.model, env.data, show_left_ui=False, show_right_ui=False
            )
        finally:
            mujoco.set_mjcb_control(None)
            env.close()
        return

    with mujoco.viewer.launch_passive(
        env.model, env.data, show_left_ui=False, show_right_ui=False
    ) as viewer:
        viewer.cam.lookat[:] = (0.4, 0.0, 0.12)
        viewer.cam.distance = 1.35
        viewer.cam.azimuth = 135
        viewer.cam.elevation = -22
        while viewer.is_running():
            started = time.perf_counter()
            action = controller_action(args.controller, env.data.time, rng)
            env.step(action)
            viewer.sync()
            remaining = env.control_timestep - (time.perf_counter() - started)
            if remaining > 0:
                time.sleep(remaining)
    env.close()


def main() -> None:
    args = parse_args()
    if args.duration <= 0:
        raise SystemExit("--duration must be greater than zero")
    if args.headless:
        run_headless(args)
    else:
        run_interactive(args)


if __name__ == "__main__":
    main()
