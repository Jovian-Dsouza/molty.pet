"""Train a PPO policy on the eight-servo Molty quadruped environment."""

from __future__ import annotations

import argparse
from pathlib import Path

from stable_baselines3 import PPO
from stable_baselines3.common.env_checker import check_env
from stable_baselines3.common.env_util import make_vec_env
from stable_baselines3.common.evaluation import evaluate_policy
from stable_baselines3.common.monitor import Monitor

from quadruped_env import MoltyQuadrupedEnv


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--timesteps", type=int, default=200_000)
    parser.add_argument("--num-envs", type=int, default=4)
    parser.add_argument("--seed", type=int, default=7)
    parser.add_argument("--eval-episodes", type=int, default=3)
    parser.add_argument(
        "--output",
        type=Path,
        default=Path("artifacts/molty_quadruped_ppo"),
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    if args.timesteps <= 0 or args.num_envs <= 0 or args.eval_episodes < 0:
        raise SystemExit("timesteps/num-envs must be positive; eval-episodes cannot be negative")

    validation_env = MoltyQuadrupedEnv()
    check_env(validation_env, warn=True)
    validation_env.close()

    training_env = make_vec_env(
        MoltyQuadrupedEnv, n_envs=args.num_envs, seed=args.seed
    )
    model = PPO(
        "MlpPolicy",
        training_env,
        learning_rate=3e-4,
        n_steps=512,
        batch_size=128,
        n_epochs=10,
        gamma=0.99,
        gae_lambda=0.95,
        clip_range=0.2,
        ent_coef=0.01,
        policy_kwargs={"net_arch": {"pi": [128, 128], "vf": [128, 128]}},
        verbose=1,
        seed=args.seed,
        device="cpu",
    )
    model.learn(total_timesteps=args.timesteps, progress_bar=False)

    args.output.parent.mkdir(parents=True, exist_ok=True)
    model.save(args.output)
    print(f"Saved policy checkpoint to {args.output.with_suffix('.zip')}")

    if args.eval_episodes:
        evaluation_env = Monitor(MoltyQuadrupedEnv())
        mean_reward, reward_std = evaluate_policy(
            model,
            evaluation_env,
            n_eval_episodes=args.eval_episodes,
            deterministic=True,
        )
        evaluation_env.close()
        print(
            f"Evaluation over {args.eval_episodes} episode(s): "
            f"reward={mean_reward:.1f} +/- {reward_std:.1f}"
        )

    training_env.close()


if __name__ == "__main__":
    main()
