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
- OpenAI `gpt-realtime-2.1-mini` agent with Cedar voice and short pet-like
  responses.
- Normal server VAD with a `0.50` threshold, `300 ms` prefix padding, and
  `500 ms` silence detection.
- No automatic idle timeout; the active room keeps its session context.
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
cd firmware
uv sync --extra agent --extra device --extra pi
```

OpenAI still performs model inference in the cloud. The Pi hosts the LiveKit
agent worker and robot device client. To host the worker on another machine
instead:

```bash
cd firmware
uv sync --extra agent
```

The agent can run on a laptop for the first test; model inference and LiveKit
media are still cloud-hosted in either layout.

## Configure

```bash
cd firmware
cp .env.example .env.local
```

Fill in the LiveKit project values on both machines and `OPENAI_API_KEY` on the
agent machine. For this first development test, the Pi can use the LiveKit API
key and secret to create its own room token.

The checked-in defaults match the current voice configuration: Cedar,
`gpt-realtime-2.1-mini`, normal server VAD at `0.50`, `300 ms` prefix padding,
`500 ms` silence duration, and no idle timeout. The VAD values can be adjusted
with the `OPENAI_REALTIME_TURN_*`, `OPENAI_REALTIME_PREFIX_PADDING_MS`, and
`OPENAI_REALTIME_SILENCE_DURATION_MS` environment variables.

Keep `PA_ALSA_PLUGHW=1` on Raspberry Pi audio cards that expose only a fixed
hardware rate, including Google Voice HAT. This lets the 16 kHz wake listener
use ALSA's resampling layer while the LiveKit session continues at 48 kHz.

On a Pi Zero 2 W using Wi-Fi and a Bluetooth speaker at the same time, disable
Wi-Fi power saving and install the Bluetooth audio services:

```bash
nmcli connection modify "$(nmcli -g GENERAL.CONNECTION device show wlan0)" \
  802-11-wireless.powersave 2
sudo mkdir -p /etc/systemd/system/bluealsa.service.d
sudo cp systemd/bluealsa.override.conf \
  /etc/systemd/system/bluealsa.service.d/molty.conf
sudo cp systemd/molty-asound.conf /etc/asound.conf
sudo cp systemd/molty-snd-aloop.conf /etc/modules-load.d/molty-audio.conf
sudo cp systemd/molty-snd-aloop-options.conf \
  /etc/modprobe.d/molty-audio.conf
sudo cp systemd/molty-audio-bridge.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now molty-audio-bridge.service
```

The loopback bridge keeps LiveKit's playback/AEC path intact while forwarding
audio to BlueALSA. Set `MOLTY_AUDIO_OUTPUT_DEVICE_NAME` to
`Loopback: PCM (plughw:2,0)` when `PA_ALSA_PLUGHW=1`; name selection is
preferred over a PortAudio index. Update the speaker MAC in
`systemd/molty-asound.conf` when pairing a different speaker.
The checked-in bridge uses adaptive ALSA clock synchronization and a small
buffer to prevent drift-induced gaps without adding enough latency to confuse
echo cancellation.

Do not use the development credential arrangement for an unattended robot. Configure
`MOLTY_TOKEN_ENDPOINT` afterward so the Pi receives a short-lived room token
without storing the LiveKit API secret.

## Test motion without servos

```bash
cd firmware
uv run molty-motion wave
uv run molty-motion forward --cycles 1
```

These commands expand and validate every frame but do not touch PCA9685.

## Calibrate and test one physical action

```bash
cd firmware
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
cd firmware
uv run --extra agent molty-agent dev
```

On the Pi, use production mode. Molty keeps one job executor warm by default.
The worker admits one robot session at a time and does not
mistake the wake-word listener's CPU use for model load:

```bash
uv run --no-dev molty-agent start
```

`MOLTY_AGENT_EXECUTOR=thread` avoids duplicating the Python runtime for this
single-user robot. Use `process` only on a machine with more memory when process
isolation is worth the overhead.

To run both processes after every Pi reboot:

```bash
sudo cp systemd/molty-agent.service systemd/molty-device.service \
  /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now molty-agent.service molty-device.service
```

The checked-in device service uses hardware mode and requires a device-local
`calibration.json`. That file is intentionally gitignored. Use `--dry-run`
manually for tests that must not move the robot.

On the Pi, connect one session immediately. Leave off `--hardware` for the
first conversation:

```bash
cd firmware
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
cd firmware
uv run molty-test-wake-model
```

It listens for **"Hey LiveKit"**:

```bash
uv run --extra device molty-device --dry-run
```

Set `MOLTY_WAKEWORD_MODEL` to a trained `hey_molty.onnx` when that model is
ready. The same runtime will use it without code changes.

### Train “Hey Molty” in Google Colab

Wake-word training is Colab-only for Molty. The Mac and Raspberry Pi install
only the listener needed to run the exported ONNX model.

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/Jovian-Dsouza/molty.pet/blob/main/firmware/wakeword/train_hey_molty_colab.ipynb)

The project notebook follows LiveKit WakeWord's current pipeline and includes
phonetically similar negatives such as “hey molly,” “hey moldy,” and “hey
multi.” In Colab:

1. Select a T4 GPU runtime.
2. Run all cells.
3. Download the generated `hey_molty_colab_bundle.zip`.
4. Extract `hey_molty.onnx` into `firmware/models/`.
5. Copy the two values from `molty-wakeword.env` into `.env.local`.

The bundle also includes the false-positive metrics and DET plot. Test the
recommended threshold with real Molty servo and speaker noise before deploying
it to the Pi.

## Run tests

```bash
cd firmware
uv sync
uv run pytest
uv run ruff check .
```
