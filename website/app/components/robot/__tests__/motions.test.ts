import { describe, expect, it } from "vitest";
import { STAND, SERVOS, type ServoPose } from "../servos";
import { ACTIONS, GAITS, gaitCycle, loopPoseAt, motionDuration, poseAt, slewToward } from "../motions";

describe("motion catalog", () => {
  it.each(Object.entries(ACTIONS))("%s only uses valid servos and angles", (_name, frames) => {
    for (const frame of frames) {
      for (const [servo, deg] of Object.entries(frame.targets)) {
        expect(SERVOS).toContain(servo);
        expect(deg).toBeGreaterThanOrEqual(0);
        expect(deg).toBeLessThanOrEqual(180);
      }
    }
  });

  it("ports the firmware wave timing", () => {
    // 200 stand + 200 lift + 300 + 4 × (300 + 300) waves, then stand.
    expect(motionDuration(ACTIONS.wave)).toBe(3100);
  });

  it.each(Object.keys(ACTIONS).filter((n) => n !== "dead"))("%s ends back at stand", (name) => {
    const frames = ACTIONS[name as keyof typeof ACTIONS];
    expect(poseAt(frames, motionDuration(frames) + 1, STAND)).toEqual(STAND);
  });

  it("raises the front-left paw during the wave", () => {
    expect(poseAt(ACTIONS.wave, 450, STAND).l3).toBe(180);
    expect(poseAt(ACTIONS.wave, 1050, STAND).l3).toBe(100);
  });
});

describe("gait cycles", () => {
  it.each(GAITS)("%s loops back to the same pose every cycle", (name) => {
    const cycle = gaitCycle(name, 100);
    const period = motionDuration(cycle);
    expect(period).toBe(cycle.length * 100);
    for (const t of [0, 130, 470]) {
      expect(loopPoseAt(cycle, t + period, STAND)).toEqual(loopPoseAt(cycle, t, STAND));
    }
  });
});

describe("slewToward", () => {
  const from: ServoPose = STAND;
  const to: ServoPose = { ...STAND, l3: 90 };

  it("moves no faster than the servo rate", () => {
    const next = slewToward(from, to, 100, 300); // 300°/s for 100 ms = 30°
    expect(next.l3).toBe(30);
    expect(next.r1).toBe(STAND.r1);
  });

  it("lands exactly on the target and does not mutate inputs", () => {
    const next = slewToward(from, to, 1000, 300);
    expect(next).toEqual(to);
    expect(from.l3).toBe(0);
  });
});
