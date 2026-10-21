import { describe, expect, it } from "vitest";
import { supportTilt } from "../support";
import type { Vec3 } from "../servos";

const CENTER: Vec3 = [0, 0, 0];
// Feet at the four corners (front = -x, left = +z), y = height of the lowest point.
const feet = (fl: number, fr: number, bl: number, br: number): Vec3[] => [
  [-50, fl, 50],
  [-50, fr, -50],
  [50, bl, 50],
  [50, br, -50],
];

describe("supportTilt", () => {
  it("stays level when all four feet are down", () => {
    expect(supportTilt(feet(-30, -30, -30, -30), CENTER)).toEqual({ roll: 0, pitch: 0 });
  });

  it("stays level on a tripod (one paw raised, as in the wave)", () => {
    const { roll, pitch } = supportTilt(feet(0, -30, -30, -30), CENTER);
    expect(roll).toBeCloseTo(0);
    expect(pitch).toBeCloseTo(0);
  });

  it("rolls toward the left when both left feet are raised", () => {
    const { roll, pitch } = supportTilt(feet(-10, -30, -10, -30), CENTER);
    // After rotating by `roll` about +X (y' = y·cos − z·sin), both supports are level.
    const left = -10 * Math.cos(roll) - 50 * Math.sin(roll);
    const right = -30 * Math.cos(roll) + 50 * Math.sin(roll);
    expect(left).toBeCloseTo(right);
    expect(roll).toBeGreaterThan(0);
    expect(pitch).toBeCloseTo(0);
  });

  it("pitches nose-down when both front feet are raised", () => {
    const { roll, pitch } = supportTilt(feet(-10, -10, -30, -30), CENTER);
    // Rotating by `pitch` about +Z: y' = x·sin + y·cos.
    const front = -50 * Math.sin(pitch) - 10 * Math.cos(pitch);
    const back = 50 * Math.sin(pitch) - 30 * Math.cos(pitch);
    expect(pitch).toBeGreaterThan(0);
    expect(front).toBeCloseTo(back);
    expect(roll).toBeCloseTo(0);
  });

  it("clamps extreme tilts", () => {
    const { roll } = supportTilt(feet(500, -30, 500, -30), CENTER);
    expect(Math.abs(roll)).toBeLessThanOrEqual(0.5);
  });
});
