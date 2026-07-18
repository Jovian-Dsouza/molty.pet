# Molty MuJoCo reinforcement-learning simulation

This directory contains a reference-inspired mockup of the physical Molty
robot. It has four legs with two position-controlled hobby servos per leg:
one hip and one knee, for eight actuated joints in total.

The dimensions, masses, and servo limits are intentionally approximate. The
mockup provides a working reinforcement-learning environment while the final
Fusion 360 URDF and measured hardware parameters are being prepared.

## Setup

From this directory:

```bash
uv sync
```

The project uses Python 3.12, MuJoCo, Gymnasium, and Stable-Baselines3.

## Preview the eight-servo robot

Open the interactive MuJoCo viewer. The default showcase walks for six
seconds, settles, performs a jump sequence, and recovers for the next cycle:

```bash
uv run python quadruped_demo.py
```

Run either motion on its own:

```bash
uv run python quadruped_demo.py --controller walk
uv run python quadruped_demo.py --controller jump
uv run python quadruped_demo.py --controller stand
uv run python quadruped_demo.py --controller random
```

Close the viewer window to stop the simulation.

Run the same validation without a window:

```bash
uv run python quadruped_demo.py --headless --controller showcase --duration 12
```

The headless jump modes report achieved torso-height gain and measured
airborne time. The mock model uses a 0.90 N m servo-force limit to make the
jump possible; this is optimistic for SG90-class hobby servos and must be
replaced with measured hardware torque before sim-to-real work.

## Train a PPO policy

Start a four-environment PPO training run:

```bash
uv run python train_quadruped.py --timesteps 200000 --num-envs 4
```

The checkpoint is saved to `artifacts/molty_quadruped_ppo.zip`. The artifacts
directory is ignored by Git because policy checkpoints are generated outputs.

For a quick training-pipeline smoke test:

```bash
uv run python train_quadruped.py \
  --timesteps 512 \
  --num-envs 1 \
  --eval-episodes 1 \
  --output artifacts/smoke_policy
```

The 512-step run only verifies the learning loop; it is not long enough to
produce a useful walking policy.

## RL interface

The policy controls an eight-element action vector. Each value is in
`[-1, 1]` and becomes an offset around the bent-leg standing pose for one
servo target.

The 34-element observation contains:

- Local body velocity
- Gravity direction in the torso frame
- IMU angular velocity
- Eight joint-position errors
- Eight joint velocities
- Previous eight-element action
- Commanded forward speed

The reward emphasizes commanded-speed tracking and upright posture, with
penalties for abrupt actions, excessive joint velocity, energy usage, lateral
motion, and unintended turning. An episode ends when the torso falls too low,
tips over, or reaches its time limit.

## Main files

- `models/molty_quadruped.xml` — eight-servo quadruped, sensors, actuators, and arena.
- `quadruped_env.py` — Gymnasium environment, observations, actions, and reward.
- `quadruped_demo.py` — interactive and headless model preview.
- `train_quadruped.py` — Stable-Baselines3 PPO training and evaluation.
- `models/toy_rover.xml` and `demo.py` — the earlier two-wheel MuJoCo toy example.
