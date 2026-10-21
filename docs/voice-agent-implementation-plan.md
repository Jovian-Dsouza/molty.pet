# Molty Voice Agent Implementation Plan

**Status:** Proposed  
**Companion document:** [Voice Agent Technical Design](./voice-agent-technical-design.md)  
**Planning basis:** One Raspberry Pi Zero 2 W prototype and one owner  

## 1. Outcome

Deliver a testable Molty voice experience that:

- wakes locally;
- holds a low-latency OpenAI-powered conversation;
- can be interrupted;
- safely runs predefined movements;
- retains context during the active conversation;
- composes novel reactions from validated motion primitives;
- fails safely when audio, network, cloud, or hardware components fail.

The implementation is intentionally staged so voice can be evaluated before physical movement is connected to the model.

## 2. Confirmed implementation decisions

| Decision | Confirmed choice |
| --- | --- |
| Microphone and speaker | Already operational; enumerate their ALSA identities during implementation |
| Raspberry Pi OS architecture | 64-bit |
| Final wake phrase | “Hey Molty” |
| Active-session idle timeout | 60 seconds |
| Media service | LiveKit Cloud |
| Conversation memory | Current session only; no durable storage |
| Language | English first |
| Sensors | None yet; eight servos only |
| Local spoken stop classifier | Deferred; software voice stop is not safety-rated |
| Physical joint mapping | Inherited from Sesame's official top-down guide |

Sesame joint mapping:

| Logical servo | Channel | Anatomical joint |
| --- | ---: | --- |
| `l1` | 2 | Front-left hip |
| `l3` | 6 | Front-left knee/lower-leg joint |
| `r1` | 0 | Front-right hip |
| `r3` | 5 | Front-right knee/lower-leg joint |
| `l2` | 3 | Rear-left hip |
| `l4` | 7 | Rear-left knee/lower-leg joint |
| `r2` | 1 | Rear-right hip |
| `r4` | 4 | Rear-right knee/lower-leg joint |

The remaining work is physical verification: document the audio device identifiers, verify full duplex, calibrate servo offsets and endpoints, and provide a reliable manual servo-power cut.

## 3. Delivery strategy

Build one vertical slice first:

1. Use the supplied “hey livekit” wake model.
2. Join a LiveKit room from the Pi.
3. Talk to `gpt-realtime-2.1-mini`.
4. Expose one predefined tool: `wave`.
5. Interrupt the agent during speech and movement.
6. Verify follow-up context within the room and context reset after disconnect.

After the slice works, replace the wake phrase, expand the action catalog, and add composition.

This ordering prevents custom wake-word training and motion refactoring from hiding basic audio or connectivity failures.

## 4. Phase 0 — Decisions, inventory, and baselines

**Estimated effort:** 0.5–1.5 engineering days, excluding hardware changes.

### Tasks

- Record Raspberry Pi model, OS version, kernel, Python version, and CPU architecture.
- Record microphone, speaker, sound-card/HAT, I2C, PCA9685, servo model, power supply, and battery details.
- Document whether microphone and speaker are full duplex.
- Document all connected sensors and stop controls.
- Map every logical servo name to:
  - the Sesame-derived physical leg;
  - hip or knee/lower-leg joint;
  - movement direction;
  - current neutral angle.
- Capture current movement videos for regression comparison.
- Measure current action durations.
- Measure idle and active supply voltage if equipment is available.
- Run every existing action with the robot lifted and classify it:
  - safe;
  - needs calibration;
  - unsafe/disabled.
- Create a risk record for commands that use `0°` and `180°`.
- Record the confirmed wake phrase and 60-second session timeout.

### Deliverables

- Hardware inventory.
- Joint map.
- Initial calibration worksheet.
- Approved action subset.
- Recorded answers to the open decisions.

### Exit criteria

- The audio device is known and can record/play simultaneously.
- `wave` and `stand` are approved for the first physical tool test.
- There is a reliable way to remove servo power.
- The Sesame joint map is encoded in calibration and verified against the physical build.

## 5. Phase 1 — Safe, persistent motion foundation

**Estimated effort:** 2–4 engineering days.

### Goal

Convert the current one-shot, blocking movement code into an interruptible local service without changing the visible behavior of approved actions.

### Tasks

#### Calibration

- Define a robot-specific calibration format.
- Add per-servo safe angle limits.
- Add neutral, direction, and trim.
- Add maximum velocity.
- Keep pulse calibration separate from semantic joint angles.
- Refuse startup if required calibration is absent or invalid.

#### Motion representation

- Represent each current action as named keyframes and durations.
- Add action metadata: category, risk, start pose, end pose, nominal duration.
- Preserve a dry-run mode.
- Add deterministic plan seeds.

#### Executor

- Create one persistent PCA9685 owner.
- Track the complete commanded pose.
- Replace long blocking sleeps with cancellable timing.
- Add frame interpolation.
- Add one motion queue with explicit priority.
- Add cancellation and action-specific recovery paths.
- Add command IDs and an idempotency cache.
- Add state reporting.
- Add a fault state that blocks further movement.

#### Existing CLI compatibility

- Keep a CLI path for local testing.
- Route the CLI through the same validator and executor used by voice.
- Do not maintain two independent motion implementations.

### Tests

- Unit-test calibration transforms.
- Unit-test all range and duration checks.
- Dry-run every action.
- Cancel every approved action at multiple frame positions.
- Kill and restart the service during a non-locomotion action.
- Verify duplicate command IDs do not rerun.
- Verify an unknown action is rejected.

### Exit criteria

- `wave` can be started and cancelled from an async test.
- Cancellation reaches the action's validated stable recovery posture without abrupt PWM loss.
- Only one component owns the PCA9685.
- Unsafe actions are unavailable to callers.
- Existing approved motions remain visually equivalent or are intentionally improved.

## 6. Phase 2 — Pi audio and wake-word vertical slice

**Estimated effort:** 2–3 engineering days.

### Goal

Prove the Pi can run local wake detection and then hand the microphone to a LiveKit room without resource or device conflicts.

### Tasks

- Create the separate `voice` Python environment.
- Add LiveKit's wake-word package and audio dependencies.
- Validate inference using the supplied “hey livekit” model.
- Keep wake-word training dependencies out of the local environment; train and
  evaluate “Hey Molty” in the repository's Google Colab notebook.
- Implement the device state machine through `WAKE_LISTENING` and `CONNECTING`.
- Implement microphone handoff:
  - stop wake listener;
  - release ALSA handle;
  - acquire LiveKit capture;
  - reverse the process at session end.
- Add local entry and exit sounds.
- Flush audio around chime playback.
- Enable WebRTC audio processing supported by the client.
- Add bounded connection retries.
- Return to wake mode after failure.
- Record Pi CPU, memory, temperature, and wake latency.

### Tests

- 100 wake/sleep cycles without leaked audio handles.
- Wake during quiet, music, speech, and servo noise.
- Unplug/replug microphone between sessions.
- Start with no speaker.
- Start with no network.
- Repeatedly fail room connection.
- Confirm no cloud audio is sent before wake.

### Exit criteria

- Wake inference is stable on the Pi Zero 2 W.
- The microphone reliably transitions between wake and room modes.
- Device resource usage is within the technical-design targets or recorded with a mitigation.
- Connection failure returns to wake mode without manual restart.

### Contingency

If Python wake inference is too heavy:

- benchmark the Rust wake-word client;
- retain Python for motion control and device orchestration;
- communicate between local processes through a narrow Unix socket or local RPC.

Do not change the cloud architecture solely because the wake implementation language changes.

## 7. Phase 3 — Cloud realtime voice

**Estimated effort:** 1–3 engineering days.

### Goal

Establish a stable voice-only conversation before connecting the model to the body.

### Tasks

- Create a LiveKit Cloud project.
- Create an OpenAI API project/key dedicated to Molty.
- Implement the cloud LiveKit Agents worker.
- Configure the OpenAI Realtime plugin with:
  - model `gpt-realtime-2.1-mini`;
  - low reasoning effort;
  - selected built-in voice;
  - semantic VAD;
  - interruption enabled.
- Implement the Molty persona prompt.
- Keep spoken replies short.
- Add agent and user state telemetry.
- Add idle timeout and graceful goodbye.
- Add OpenAI error and timeout handling.
- Add a model configuration flag for testing full `gpt-realtime-2.1`.
- Add a short-lived room-token service.
- Keep OpenAI and LiveKit server secrets off the Pi.

### Tests

- Natural short conversation.
- Fast back-and-forth turns.
- User pauses mid-sentence.
- User interrupts Molty.
- False interruption from non-speech sound.
- 60-second idle timeout.
- Network loss and reconnect.
- OpenAI rate-limit/error simulation.
- Long user turn.
- Empty turn.

### Exit criteria

- Voice works for a 10-minute session without manual recovery.
- Interruption stops speech consistently.
- The model stays concise and pet-like.
- All provider secrets remain server-side.
- Latency metrics are captured.

### Model evaluation

Run the same scripted scenarios against:

- `gpt-realtime-2.1-mini`, low reasoning;
- `gpt-realtime-2.1`, low reasoning.

Compare:

- first-audio latency;
- instruction following;
- correct tool selection using mocked tools;
- interruption behavior;
- character consistency;
- cost per ten-minute session.

Retain the mini model unless the full model shows a material, measured improvement.

## 8. Phase 4 — Predefined movement tools and interruption

**Estimated effort:** 2–4 engineering days.

### Goal

Let the model safely request trusted actions through LiveKit RPC.

### Tasks

#### Device RPC

- Register `robot.state.v1`.
- Register `motion.execute.v1`.
- Register `motion.cancel.v1`.
- Validate caller identity.
- Validate schema version and payload size.
- Return immediate acknowledgements.
- Publish asynchronous motion status.

#### Agent tools

- Add `get_robot_state`.
- Add `perform_action`.
- Add `cancel_motion`.
- Generate the action enum from the shared approved catalog.
- Serialize motion calls.
- Require explicit user intent for locomotion.
- Require tool acknowledgement before claiming success.

#### Interruption bridge

- Subscribe to confirmed interruption events.
- Send `motion.cancel.v1` with the active command ID.
- Handle cancellation RPC loss by querying state.
- Do not cancel already completed work.
- Record interruption-to-cancel latency.

#### Behavior policy

- Permit small expressive actions during normal replies.
- Limit spontaneous action frequency.
- Do not move on every assistant turn.
- Never spontaneously locomote.
- Avoid actions that produce too much microphone noise during important listening.

### First physical sequence

1. Robot lifted.
2. Agent tool calls a mocked executor.
3. Agent tool calls `wave` in dry-run.
4. Agent tool calls physical `wave`.
5. User interrupts `wave`.
6. Repeat with the robot on the floor.
7. Enable other low-risk expressive actions one at a time.
8. Enable one-cycle `forward` last.

### Tests

- Duplicate tool call.
- Malformed payload.
- Unauthorized caller.
- Unknown action.
- Busy executor.
- Disconnect after acceptance.
- Cancel before start.
- Cancel during each action stage.
- Speech continues after a motion rejection.
- Model attempts locomotion without explicit user instruction.

### Exit criteria

- Predefined actions execute once per accepted command ID.
- Interruption cancels both voice and movement.
- The Pi remains the final authority.
- The model truthfully handles every tool result.
- Locomotion is short, explicit, and disabled when state is unknown.

## 9. Phase 5 — Session-context boundaries

**Estimated effort:** 0.5–1 engineering day.

### Goal

Maintain coherent follow-up conversation within one active room and deliberately forget it when the session ends.

### Tasks

- Start each LiveKit/OpenAI session with a fresh conversation context.
- Preserve user turns, assistant turns, and matched motion tool results during the room.
- Verify LiveKit truncates unheard assistant output after interruption.
- Bound unusually long sessions by truncating older turns.
- Always preserve system instructions and safety constraints.
- Never persist raw audio, full transcripts, summaries, or extracted facts.
- On reconnect into a new room, start a new context.
- Prompt Molty to state honestly that it cannot remember an earlier session.

### Default behavior

- Follow-up references work during the active conversation.
- “Remember that…” is understood only for the current session.
- A goodbye, timeout, disconnect, or restart ends the context.
- A new wake starts a blank conversation.

### Tests

- State a preference and reference it later in the same room.
- Execute a motion, interrupt it, and verify tool history remains coherent.
- Keep a test room open long enough to trigger context truncation.
- Verify system and safety instructions survive truncation.
- End the room and verify a new session does not know the prior preference.
- Simulate a reconnect and verify the agent does not claim retained context.
- Verify normal logs contain neither raw audio nor full transcripts.

### Exit criteria

- Follow-up conversation works within one session.
- Interruption does not leave orphaned tool results.
- Context is absent in a new session.
- No durable conversation store exists.

## 10. Phase 6 — LLM-composed motion

**Estimated effort:** 2–5 engineering days.

### Goal

Allow varied, expressive reactions while keeping the model above the servo-control boundary.

### Tasks

#### Catalog

- Add rich metadata for every approved primitive.
- Add emotion/intent tags such as:
  - greeting;
  - happy;
  - curious;
  - confused;
  - sleepy;
  - celebration;
  - refusal.
- Add allowed speed and intensity ranges.
- Add incompatibility rules.

#### Plan schema

- Implement the bounded multi-step plan schema.
- Enforce maximum steps, duration, repeats, and locomotion.
- Require start/end pose compatibility.
- Add deterministic seed.
- Normalize only within documented tolerances.

#### Composer

- Resolve primitives into complete poses.
- Apply intensity around calibrated neutral values.
- Apply speed scaling.
- Add smooth transitions.
- Respect power/current-change budget.
- Check cancellation every frame.

#### Agent prompt

- Describe the robot body at a semantic level.
- Describe available actions and tags.
- Teach the model when no movement is appropriate.
- Require predefined actions for locomotion.
- Require composed plans to remain short.

### Evaluation set

Prompt Molty to:

- greet someone shyly;
- react excitedly without walking;
- look confused;
- celebrate briefly;
- apologize;
- become sleepy;
- make up a “happy dance”;
- react while already in `rest`;
- react while a higher-priority action is active;
- respond when a requested plan is rejected.

Score:

- schema validity;
- local acceptance rate;
- semantic fit;
- physical smoothness;
- repetition;
- interruption success;
- total duration;
- owner preference.

### Exit criteria

- At least 95% of evaluation plans are structurally valid.
- 100% of executed plans pass local safety validation.
- No plan bypasses the primitive catalog.
- Plans remain varied without becoming noisy or exhausting.
- Cancellation works throughout composed transitions.

## 11. Phase 7 — Hardening and unattended boot

**Estimated effort:** 2–4 engineering days.

### Goal

Make the prototype repeatable enough for regular supervised use.

### Tasks

- Add `systemd` service configuration.
- Add health checks and restart policy.
- Add startup dependency handling for audio, network, and I2C.
- Add bounded exponential reconnect.
- Add structured local logs with rotation.
- Add telemetry counters and latency histograms.
- Add under-voltage and temperature checks where available.
- Add graceful shutdown that cancels motion, closes audio, and leaves the robot stable.
- Add a local status indicator or distinct audio cues:
  - waking;
  - listening;
  - offline;
  - faulted;
  - sleeping.
- Add token rotation/revocation.
- Add a diagnostic command that reveals no secrets.
- Add installation and recovery documentation.
- Run repeated soak tests.

### Soak tests

- Eight hours in wake mode.
- 100 activations.
- One-hour active session.
- 100 predefined actions in varied order.
- 100 interruption events.
- Network flap every few minutes.
- Agent restart during a session.
- Pi service restart.
- Low-disk and high-log-volume simulation.

### Exit criteria

- Molty boots directly into wake mode.
- Failures recover or become clearly visible.
- No secret appears in logs.
- Motion cannot continue indefinitely after room or process failure.
- A forced restart starts a clean session without claiming prior context.

## 12. Phase 8 — Experimental generated keyframes

**Estimated effort:** Separate research milestone.

This phase is intentionally outside the first production test.

### Prerequisites

- Complete anatomical joint map.
- Calibrated limits and direction for every servo.
- Validated velocity limits.
- Stable primitive composer.
- Physical current or position feedback strongly preferred.
- Better alignment between simulation and physical robot.

### Tasks

- Define a stationary keyframe schema.
- Add static feasibility rules.
- Preview in simulation.
- Add lifted-robot approval tooling.
- Add feature flags and per-plan audit logs.
- Require an explicit experimental mode.
- Prevent locomotion keyframes.

### Exit criteria

- Generated keyframes cannot address raw PCA channels.
- Every plan is reproducible.
- Every plan is validated before physical execution.
- The feature defaults to off.

## 13. Cross-cutting work

### 13.1 Configuration

Configuration should cover:

- device identity;
- LiveKit URL and token endpoint;
- audio devices;
- wake model and threshold;
- wake/session timeouts;
- model identifier and voice;
- reasoning effort;
- calibration path;
- approved actions;
- motion limits;
- session-context limits;
- log level;
- diagnostic mode.

Secrets must not live in the normal configuration file.

### 13.2 Versioning

Pin:

- Python version;
- LiveKit Agents minor line;
- LiveKit client;
- LiveKit wake-word package;
- OpenAI SDK;
- Adafruit hardware dependencies.

Record:

- wake model hash;
- motion catalog version;
- calibration version;
- prompt version;
- RPC schema version.

### 13.3 Feature flags

Suggested flags:

- `voice_enabled`
- `motion_tools_enabled`
- `locomotion_enabled`
- `composed_motion_enabled`
- `generated_keyframes_enabled`
- `diagnostic_transcripts_enabled`

The safest configuration must be the default.

## 14. Test matrix

| Layer | Automated | Pi required | Robot required |
| --- | :---: | :---: | :---: |
| Schemas and validators | Yes | No | No |
| Motion compilation | Yes | No | No |
| Dry-run executor | Yes | No | No |
| Session-context lifecycle | Yes | No | No |
| Agent tool selection | Yes | No | No |
| LiveKit contract | Yes | Optional | No |
| Wake inference | Partial | Yes | No |
| Audio handoff | Partial | Yes | No |
| Echo/servo noise | No | Yes | Yes |
| Physical action | No | Yes | Yes |
| Physical cancellation | No | Yes | Yes |
| Locomotion | No | Yes | Yes |
| Long soak | Partial | Yes | Preferably |

## 15. Risk register

| Risk | Likelihood | Impact | Mitigation |
| --- | --- | --- | --- |
| Pi wake inference is too heavy | Medium | High | Benchmark early; use Rust client if needed |
| Echo causes self-interruption | High | High | AEC, volume tuning, mic isolation, real-noise tests |
| Servo noise causes false speech | High | Medium | Confirmed interruption event, filtering, threshold tuning |
| Current actions hit unsafe endpoints | High | High | Per-servo calibration and action approval gate |
| Network interruption leaves robot moving | Medium | High | Local disconnect watchdog and bounded actions |
| Duplicate RPC repeats locomotion | Medium | High | Command IDs and idempotency cache |
| Model selects incorrect action | Medium | Medium | Small tool set, typed enums, local policy |
| Dynamic motion destabilizes robot | Medium | High | Primitive composition first; no raw keyframes |
| Cloud latency harms pet experience | Medium | High | Realtime mini, local wake cue, measure P50/P95 |
| Audio package lacks Pi support | Medium | High | Validate in Phase 2 before cloud work expands |
| Session context leaks into a later wake | Low/Medium | High | New room and fresh model context for every wake session; lifecycle tests |
| Long session context becomes slow or costly | Medium | Medium | Bound context and compact or drop old conversational turns while preserving tool consistency |
| Pi credential is extracted | Low/Medium | High | Device-specific credential, short-lived tokens, revocation |
| Model/provider changes behavior | Medium | Medium | Pin model, prompt version, and evaluation suite |
| LiveKit/OpenAI outage | Medium | Medium | Local graceful fallback and clear offline cue |
| No physical feedback detects servo stall | High | High | Supervision; add current/position sensing later |

## 16. Acceptance scenarios for the first usable release

### Scenario 1: Wake and chat

Given Molty is dormant, when the owner says the wake phrase, Molty acknowledges locally, connects, and answers a simple question without requiring another wake phrase.

### Scenario 2: Predefined action

When the owner says “Wave,” the model calls the tool, the Pi accepts it, Molty waves exactly once, and the model does not falsely claim success if the tool is rejected.

### Scenario 3: Barge-in

While Molty is speaking and dancing, when the owner begins a real interruption, speech stops, movement cancels, Molty reaches a stable posture, and the new user turn is processed.

### Scenario 4: Bounded walking

When the owner explicitly requests one short step forward, Molty executes no more than the configured cycle limit and returns to `stand`.

### Scenario 5: Creative reaction

When asked to “show me how happy you are,” Molty composes an approved short plan from expressive primitives, passes local validation, and executes it.

### Scenario 6: Session context

When the owner says “My favorite color is green,” Molty can use that fact later in the same active session. After “goodbye,” a disconnect, restart, or a new wake session, Molty no longer knows it and does not claim otherwise.

### Scenario 7: Network failure

If Wi-Fi disappears during locomotion, the Pi cancels movement locally, stabilizes, ends the cloud session, and returns to wake mode after connectivity recovers.

### Scenario 8: Unsafe model output

If the model proposes an unknown primitive or out-of-range parameter, the Pi rejects it without movement and the agent responds honestly.

## 17. Definition of done

The initial voice feature is done when:

- The Pi boots unattended into wake-listening mode.
- Wake, room connection, conversation, and sleep form a reliable loop.
- OpenAI Realtime mini is the configured default.
- Voice interruption works.
- Predefined movement is exposed through validated RPC tools.
- Interruption cancels movement safely.
- Locomotion is explicit and bounded.
- Conversation context works within one active room and resets for every new session.
- LLM-composed motion uses only approved primitives.
- Duplicate and malformed commands cannot cause unintended movement.
- Provider secrets remain off the Pi and out of Git.
- Logs contain enough correlation data to debug failures without retaining raw audio.
- Unit, contract, audio, fault, and physical acceptance tests pass.
- Installation, calibration, operation, and recovery are documented.

## 18. Work explicitly deferred

- Hermes integration.
- Cartesia voice evaluation.
- Any durable or automatic memory.
- Multi-user recognition.
- Autonomous navigation.
- Camera input.
- Remote web control.
- General agent tools.
- Reinforcement-learning control on hardware.
- Community-uploaded motion packs.
- Raw generated joint trajectories.
- Federated learning.
