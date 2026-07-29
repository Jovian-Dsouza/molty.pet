# Molty hardware and voice runtime

This directory now contains two paths:

- `eight_servo_control.py` and `sesame_actions.py`: the original direct
  hardware scripts.
- `molty/`: the persistent, cancellable motion runtime and LiveKit/OpenAI voice
  vertical slice.

The new voice model can select named actions or compose up to four named
actions. It cannot send servo channels or angles. The Raspberry Pi validates
and executes every frame.

## What is implemented

- All Sesame action keyframes from `sesame_actions.py`.
- Exact R1–R4/L1–L4 PCA9685 channel and anatomical mapping.
- Persistent PCA9685 ownership.
- Per-servo calibration, limits, trim, inversion, and pulse ranges.
- Serial execution, command idempotency, bounded locomotion, and fault state.
- Cancellation that returns to `stand`.
- LiveKit room audio with echo cancellation, noise suppression, and gain
  control.
- Local wake-word listener.
- OpenAI `gpt-realtime-2.1-mini` agent with short pet-like responses.
- Named action, composed action-plan, cancel, and body-state RPCs.
- Session context that disappears when the room ends.

## Safety default

The new runtime is dry-run by default. Hardware mode refuses to start unless
the calibration file contains `"calibrated": true`.

`calibration.example.json` preserves the old script's broad zero-to-one-eighty
degree input range as a worksheet. It is not a claim that those endpoints are
mechanically safe. Copy it, measure each joint, narrow the limits, then mark it
reviewed.

## Install

Use Python 3.11 or newer on the 64-bit Raspberry Pi OS.

On the Pi:

```bash
sudo apt update
sudo apt install -y portaudio19-dev libsndfile1
cd hardware
uv sync --extra device --extra pi
```

On the machine that runs the cloud agent:

```bash
cd hardware
uv sync --extra agent
```

The agent can run on a laptop for the first test; OpenAI inference and LiveKit
media are still cloud-hosted.

## Configure

```bash
cd hardware
cp .env.example .env.local
```

Fill in the LiveKit project values on both machines and `OPENAI_API_KEY` on the
agent machine. For this first development test, the Pi can use the LiveKit API
key and secret to create its own room token.

Do not use that arrangement for an unattended robot. Configure
`MOLTY_TOKEN_ENDPOINT` afterward so the Pi receives a short-lived room token
without storing the LiveKit API secret.

## Test motion without servos

```bash
cd hardware
uv run molty-motion wave
uv run molty-motion forward --cycles 1
```

These commands expand and validate every frame but do not touch PCA9685.

## Calibrate and test one physical action

```bash
cd hardware
cp calibration.example.json calibration.json
```

Edit every joint's angle and pulse limits. Only after lifted-robot testing,
change `calibrated` to `true`, then run:

```bash
uv run molty-motion stand --hardware --calibration calibration.json
uv run molty-motion wave --hardware --calibration calibration.json
```

Keep a manual servo-power disconnect within reach.

## Test voice immediately, without a wake word

Start the agent:

```bash
cd hardware
uv run --extra agent molty-agent dev
```

On the Pi, connect one session immediately. Leave off `--hardware` for the
first conversation:

```bash
cd hardware
uv run --extra device molty-device --skip-wakeword --dry-run
```

Ask Molty to wave. The Pi log should show the frames while no servo moves.
Interrupt Molty while it is speaking or performing a motion; the motion RPC
should be cancelled.

After calibration:

```bash
uv run --extra device --extra pi molty-device \
  --skip-wakeword \
  --hardware \
  --calibration calibration.json
```

## Test the wake loop

The repository does not pretend that LiveKit's supplied test model recognizes
"Hey Molty." Download the pinned test model:

```bash
cd hardware
uv run molty-test-wake-model
```

It listens for **"Hey LiveKit"**:

```bash
uv run --extra device molty-device --dry-run
```

Set `MOLTY_WAKEWORD_MODEL` to a trained `hey_molty.onnx` when that model is
ready. The same runtime will use it without code changes.

### Train “Hey Molty”

Training is intentionally a workstation job rather than a Pi job. The
production-oriented configuration is in `wakeword/hey_molty.yaml` and includes
phonetically similar negatives such as “hey molly,” “hey moldy,” and “hey
multi.”

Following LiveKit WakeWord's current training workflow:

```bash
uv tool install "livekit-wakeword[train,eval,export]"
cd hardware/wakeword
livekit-wakeword setup --config hey_molty.yaml
livekit-wakeword run hey_molty.yaml
```

Evaluate the false-positive rate with real Molty servo and speaker noise before
copying the exported ONNX model to the Pi. Start at the evaluator's recommended
threshold instead of assuming `0.5`.

## Run tests

```bash
cd hardware
uv sync
uv run pytest
uv run ruff check .
```
