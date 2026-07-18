"""Gymnasium environment for the eight-servo Molty quadruped mockup."""

from __future__ import annotations

import math
from pathlib import Path
from typing import Any

import gymnasium as gym
import mujoco
import numpy as np
from gymnasium import spaces


MODEL_PATH = Path(__file__).parent / "models" / "molty_quadruped.xml"

JOINT_NAMES = (
    "front_left_hip_joint",
    "front_left_knee_joint",
    "front_right_hip_joint",
    "front_right_knee_joint",
    "rear_left_hip_joint",
    "rear_left_knee_joint",
    "rear_right_hip_joint",
    "rear_right_knee_joint",
)

DEFAULT_JOINT_POSE = np.array(
    [-0.4, 0.8, -0.4, 0.8, -0.4, 0.8, -0.4, 0.8], dtype=np.float64
)
ACTION_SCALE = 0.8


class MoltyQuadrupedEnv(gym.Env[np.ndarray, np.ndarray]):
    """Command-conditioned forward locomotion with eight servo targets.

    The actor observes local body velocity, orientation relative to gravity,
    IMU angular velocity, joint state, the previous action, and target speed.
    Each action is a normalized offset around the bent-leg standing pose.
    """

    metadata = {"render_modes": [], "render_fps": 50}

    def __init__(self, max_episode_steps: int = 1_000) -> None:
        super().__init__()
        self.model = mujoco.MjModel.from_xml_path(str(MODEL_PATH))
        self.data = mujoco.MjData(self.model)
        self.frame_skip = 10
        self.control_timestep = self.frame_skip * self.model.opt.timestep
        self.max_episode_steps = max_episode_steps

        self._torso_id = self._object_id(mujoco.mjtObj.mjOBJ_BODY, "torso")
        joint_ids = np.array(
            [self._object_id(mujoco.mjtObj.mjOBJ_JOINT, name) for name in JOINT_NAMES]
        )
        self._joint_qpos_addresses = self.model.jnt_qposadr[joint_ids]
        self._joint_dof_addresses = self.model.jnt_dofadr[joint_ids]
        self._velocity_sensor = self._sensor_slice("imu_velocity")
        self._gyro_sensor = self._sensor_slice("imu_gyro")
        self._foot_sensors = tuple(
            self._sensor_slice(name)
            for name in (
                "front_left_foot_contact",
                "front_right_foot_contact",
                "rear_left_foot_contact",
                "rear_right_foot_contact",
            )
        )

        self.action_space = spaces.Box(-1.0, 1.0, shape=(8,), dtype=np.float32)
        observation_low = np.concatenate(
            (
                np.full(3, -5.0),
                np.full(3, -1.0),
                np.full(3, -20.0),
                np.full(8, -3.0),
                np.full(8, -25.0),
                np.full(8, -1.0),
                np.array([0.0]),
            )
        ).astype(np.float32)
        observation_high = np.concatenate(
            (
                np.full(3, 5.0),
                np.full(3, 1.0),
                np.full(3, 20.0),
                np.full(8, 3.0),
                np.full(8, 25.0),
                np.full(8, 1.0),
                np.array([1.0]),
            )
        ).astype(np.float32)
        self.observation_space = spaces.Box(
            observation_low, observation_high, dtype=np.float32
        )

        self.previous_action = np.zeros(8, dtype=np.float64)
        self.target_speed = 0.3
        self.elapsed_steps = 0

    def _object_id(self, object_type: mujoco.mjtObj, name: str) -> int:
        object_id = mujoco.mj_name2id(self.model, object_type, name)
        if object_id < 0:
            raise ValueError(f"MuJoCo object not found: {name}")
        return object_id

    def _sensor_slice(self, name: str) -> slice:
        sensor_id = self._object_id(mujoco.mjtObj.mjOBJ_SENSOR, name)
        start = int(self.model.sensor_adr[sensor_id])
        return slice(start, start + int(self.model.sensor_dim[sensor_id]))

    def action_to_servo_targets(self, action: np.ndarray) -> np.ndarray:
        action = np.asarray(action, dtype=np.float64)
        if action.shape != self.action_space.shape:
            raise ValueError(
                f"Expected action shape {self.action_space.shape}, got {action.shape}"
            )
        normalized_action = np.clip(action, -1.0, 1.0)
        targets = DEFAULT_JOINT_POSE + ACTION_SCALE * normalized_action
        return np.clip(
            targets,
            self.model.actuator_ctrlrange[:, 0],
            self.model.actuator_ctrlrange[:, 1],
        )

    def _observation(self) -> np.ndarray:
        rotation = self.data.xmat[self._torso_id].reshape(3, 3)
        gravity_in_body = rotation.T @ np.array([0.0, 0.0, -1.0])
        joint_position_error = (
            self.data.qpos[self._joint_qpos_addresses] - DEFAULT_JOINT_POSE
        )
        observation = np.concatenate(
            (
                np.clip(self.data.sensordata[self._velocity_sensor], -5.0, 5.0),
                gravity_in_body,
                np.clip(self.data.sensordata[self._gyro_sensor], -20.0, 20.0),
                np.clip(joint_position_error, -3.0, 3.0),
                np.clip(
                    self.data.qvel[self._joint_dof_addresses], -25.0, 25.0
                ),
                self.previous_action,
                np.array([self.target_speed]),
            )
        )
        return observation.astype(np.float32)

    def _is_healthy(self) -> bool:
        torso_height = float(self.data.xpos[self._torso_id, 2])
        upright = float(self.data.xmat[self._torso_id].reshape(3, 3)[2, 2])
        return (
            np.isfinite(self.data.qpos).all()
            and np.isfinite(self.data.qvel).all()
            and torso_height > 0.11
            and upright > 0.3
        )

    def reset(
        self,
        *,
        seed: int | None = None,
        options: dict[str, Any] | None = None,
    ) -> tuple[np.ndarray, dict[str, Any]]:
        super().reset(seed=seed)
        mujoco.mj_resetDataKeyframe(self.model, self.data, 0)
        self.data.qpos[self._joint_qpos_addresses] += self.np_random.uniform(
            -0.025, 0.025, size=8
        )
        self.data.qvel[:] = self.np_random.normal(0.0, 0.01, size=self.model.nv)
        self.data.ctrl[:] = DEFAULT_JOINT_POSE
        self.previous_action.fill(0.0)
        self.elapsed_steps = 0

        requested_speed = None if options is None else options.get("target_speed")
        self.target_speed = float(
            requested_speed
            if requested_speed is not None
            else self.np_random.uniform(0.2, 0.45)
        )
        if not 0.0 <= self.target_speed <= 1.0:
            raise ValueError("target_speed must be between 0.0 and 1.0 m/s")

        mujoco.mj_forward(self.model, self.data)
        return self._observation(), {"target_speed": self.target_speed}

    def step(
        self, action: np.ndarray
    ) -> tuple[np.ndarray, float, bool, bool, dict[str, Any]]:
        clipped_action = np.clip(np.asarray(action, dtype=np.float64), -1.0, 1.0)
        self.data.ctrl[:] = self.action_to_servo_targets(clipped_action)

        for _ in range(self.frame_skip):
            mujoco.mj_step(self.model, self.data)

        self.elapsed_steps += 1
        local_velocity = self.data.sensordata[self._velocity_sensor]
        forward_velocity = float(local_velocity[0])
        lateral_velocity = float(local_velocity[1])
        yaw_rate = float(self.data.sensordata[self._gyro_sensor][2])
        rotation = self.data.xmat[self._torso_id].reshape(3, 3)
        upright = float(rotation[2, 2])

        velocity_tracking = math.exp(
            -((forward_velocity - self.target_speed) / 0.25) ** 2
        )
        action_rate_cost = float(np.mean(np.square(clipped_action - self.previous_action)))
        joint_velocity_cost = float(
            np.mean(np.square(self.data.qvel[self._joint_dof_addresses] / 20.0))
        )
        energy_cost = float(
            np.mean(
                np.abs(
                    self.data.actuator_force
                    * self.data.qvel[self._joint_dof_addresses]
                )
            )
        )
        healthy = self._is_healthy()
        reward_terms = {
            "velocity_tracking": 1.5 * velocity_tracking,
            "upright": 0.3 * max(0.0, upright),
            "alive": 0.1 if healthy else 0.0,
            "action_rate": -0.02 * action_rate_cost,
            "joint_velocity": -0.01 * joint_velocity_cost,
            "energy": -0.002 * energy_cost,
            "lateral_motion": -0.05 * lateral_velocity**2,
            "yaw_motion": -0.02 * yaw_rate**2,
        }
        reward = float(sum(reward_terms.values()))

        self.previous_action[:] = clipped_action
        terminated = not healthy
        truncated = self.elapsed_steps >= self.max_episode_steps
        foot_contacts = np.array(
            [self.data.sensordata[sensor][0] for sensor in self._foot_sensors]
        )
        info = {
            "x_position": float(self.data.xpos[self._torso_id, 0]),
            "forward_velocity": forward_velocity,
            "target_speed": self.target_speed,
            "torso_height": float(self.data.xpos[self._torso_id, 2]),
            "foot_contacts": foot_contacts,
            "reward_terms": reward_terms,
        }
        return self._observation(), reward, terminated, truncated, info

    def close(self) -> None:
        pass


def make_env() -> MoltyQuadrupedEnv:
    """Small factory kept at module scope for vectorized training."""
    return MoltyQuadrupedEnv()
