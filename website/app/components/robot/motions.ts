/**
 * Molty's motion catalog, ported frame-for-frame from
 * firmware/molty/motion_catalog.py (itself from Sesame's sesame_actions.py).
 * A frame sends partial servo targets, then holds; the servos slew toward
 * those targets at their physical speed. Pure functions only.
 */

import { REST, SERVOS, STAND, type Servo, type ServoPose } from "./servos";

export interface MotionFrame {
  targets: Partial<ServoPose>;
  holdMs: number;
}

export type Frames = readonly MotionFrame[];

/** MG90S at 5 V: roughly 0.1 s per 60°. */
export const SERVO_DEG_PER_S = 600;

const f = (targets: Partial<ServoPose>, holdMs = 0): MotionFrame => ({ targets, holdMs });
const repeat = (frames: MotionFrame[], count: number): MotionFrame[] =>
  Array.from({ length: count }, () => frames).flat();

export const ACTIONS = {
  wave: [
    f(STAND, 200),
    f({ r4: 80, l3: 180, l2: 90, r1: 100 }, 200),
    f({ l3: 180 }, 300),
    ...repeat([f({ l3: 180 }, 300), f({ l3: 100 }, 300)], 4),
    f(STAND),
  ],
  dance: [
    f({ r1: 90, r2: 90, l1: 90, l2: 90, r4: 160, r3: 160, l3: 10, l4: 10 }, 300),
    ...repeat(
      [f({ r4: 115, r3: 115, l3: 10, l4: 10 }, 300), f({ r4: 160, r3: 160, l3: 65, l4: 65 }, 300)],
      5,
    ),
    f(STAND),
  ],
  swim: [
    f(REST),
    ...repeat([f({ r1: 135, r2: 45, l1: 45, l2: 135 }, 400), f({ r1: 90, r2: 90, l1: 90, l2: 90 }, 400)], 4),
    f(STAND),
  ],
  point: [f({ l2: 90, r1: 135, r2: 100, l4: 180, l1: 25, l3: 145, r4: 80, r3: 170 }, 2000), f(STAND)],
  pushup: [
    f(STAND, 200),
    f({ l1: 0, r1: 180, l3: 90, r3: 90 }, 500),
    ...repeat([f({ l3: 0, r3: 180 }, 600), f({ l3: 90, r3: 90 }, 500)], 4),
    f(STAND),
  ],
  bow: [
    f(STAND, 200),
    f({ l1: 0, r1: 180, l3: 0, r3: 180, l2: 180, r2: 0, r4: 0, l4: 180 }, 600),
    f({ l3: 90, r3: 90 }, 3000),
    f(STAND),
  ],
  cute: [
    f(STAND, 200),
    f({ l2: 160, r2: 20, r4: 180, l4: 0, l1: 0, r1: 180, l3: 180, r3: 0 }, 200),
    ...repeat([f({ r4: 180, l4: 45 }, 300), f({ r4: 135, l4: 0 }, 300)], 5),
    f(STAND),
  ],
  freaky: [
    f(STAND, 200),
    f({ l1: 0, r1: 180, l2: 180, r2: 0, r4: 90, r3: 0 }, 200),
    ...repeat([f({ r3: 25 }, 400), f({ r3: 0 }, 400)], 3),
    f(STAND),
  ],
  worm: [
    f(STAND, 200),
    f({ r1: 180, r2: 0, l1: 0, l2: 180, r4: 90, r3: 90, l3: 90, l4: 90 }, 200),
    ...repeat(
      [f({ r3: 45, l3: 135, r4: 45, l4: 135 }, 300), f({ r3: 135, l3: 45, r4: 135, l4: 45 }, 300)],
      5,
    ),
    f(STAND),
  ],
  shake: [
    f(STAND, 200),
    f({ r1: 135, l1: 45, l3: 90, r3: 90, l2: 90, r2: 90 }, 200),
    ...repeat([f({ r4: 45, l4: 135 }, 300), f({ r4: 0, l4: 180 }, 300)], 5),
    f(STAND),
  ],
  shrug: [
    f(STAND, 200),
    f({ r3: 90, r4: 90, l3: 90, l4: 90 }, 1000),
    f({ r3: 0, r4: 180, l3: 180, l4: 0 }, 1500),
    f(STAND),
  ],
  dead: [f(STAND, 200), f({ r3: 90, r4: 90, l3: 90, l4: 90 })],
  crab: [
    f(STAND, 200),
    f({ r1: 90, r2: 90, l1: 90, l2: 90, r4: 0, r3: 180, l3: 45, l4: 135 }),
    ...repeat(
      [f({ r4: 45, r3: 135, l3: 0, l4: 180 }, 300), f({ r4: 0, r3: 180, l3: 45, l4: 135 }, 300)],
      5,
    ),
    f(STAND),
  ],
} satisfies Record<string, Frames>;

export type ActionName = keyof typeof ACTIONS;

export const GAITS = ["forward", "backward", "left", "right"] as const;
export type GaitName = (typeof GAITS)[number];

/** The repeating part of each locomotion gait (the firmware loops it `cycles` times). */
export function gaitCycle(name: GaitName, frameDelayMs: number): Frames {
  const d = frameDelayMs;
  switch (name) {
    case "forward":
      return [
        f({ r3: 135, l3: 0 }, d),
        f({ l4: 135, l2: 90, r4: 0, r1: 180 }, d),
        f({ r2: 45, l1: 90 }, d),
        f({ r4: 45, l4: 180 }, d),
        f({ r3: 180, l3: 45, r2: 90, l1: 0 }, d),
        f({ l2: 135, r1: 90 }, d),
      ];
    case "backward":
      return [
        f({ r3: 135, l3: 0 }, d),
        f({ l4: 135, l2: 135, r4: 0, r1: 90 }, d),
        f({ r2: 90, l1: 0 }, d),
        f({ r4: 45, l4: 180 }, d),
        f({ r3: 180, l3: 45, r2: 45, l1: 90 }, d),
        f({ l2: 90, r1: 180 }, d),
      ];
    case "left":
      return [
        f({ r3: 135, l4: 135 }, d),
        f({ r1: 180, l2: 180 }, d),
        f({ r3: 180, l4: 180 }, d),
        f({ r1: 135, l2: 135 }, d),
        f({ r4: 45, l3: 45 }, d),
        f({ r2: 90, l1: 90 }, d),
        f({ r4: 0, l3: 0 }, d),
        f({ r2: 45, l1: 45 }, d),
      ];
    case "right":
      return [
        f({ r4: 45, l3: 45 }, d),
        f({ r2: 0, l1: 0 }, d),
        f({ r4: 0, l3: 0 }, d),
        f({ r2: 45, l1: 45 }, d),
        f({ r3: 135, l4: 135 }, d),
        f({ r1: 90, l2: 90 }, d),
        f({ r3: 180, l4: 180 }, d),
        f({ r1: 135, l2: 135 }, d),
      ];
  }
}

export function motionDuration(frames: Frames): number {
  return frames.reduce((sum, frame) => sum + frame.holdMs, 0);
}

/** Target pose `tMs` into a one-shot motion: every frame sent by then, applied in order. */
export function poseAt(frames: Frames, tMs: number, start: ServoPose): ServoPose {
  let at = 0;
  let pose = start;
  for (const frame of frames) {
    if (at > tMs) break;
    pose = { ...pose, ...frame.targets };
    at += frame.holdMs;
  }
  return pose;
}

/** Target pose `tMs` into a looping cycle, after it has settled into its steady state. */
export function loopPoseAt(cycle: Frames, tMs: number, start: ServoPose): ServoPose {
  const period = motionDuration(cycle);
  const settled = poseAt(cycle, period, start);
  return poseAt(cycle, ((tMs % period) + period) % period, settled);
}

/** Moves each servo toward its target, at most `degPerS` per second. */
export function slewToward(current: ServoPose, target: ServoPose, dtMs: number, degPerS = SERVO_DEG_PER_S): ServoPose {
  const step = (degPerS * dtMs) / 1000;
  const next = { ...current } as Record<Servo, number>;
  for (const servo of SERVOS) {
    const delta = target[servo] - current[servo];
    next[servo] = Math.abs(delta) <= step ? target[servo] : current[servo] + Math.sign(delta) * step;
  }
  return next;
}
