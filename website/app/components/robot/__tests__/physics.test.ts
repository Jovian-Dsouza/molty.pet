import { describe, expect, it } from "vitest";
import {
  ARENA_HALF,
  BALL_RADIUS,
  inGoal,
  stepBall,
  stepRobot,
  type Ball,
  type RobotBody,
} from "../physics";

const robot = (over: Partial<RobotBody> = {}): RobotBody => ({
  x: 0,
  z: 0,
  heading: 0,
  speed: 0,
  radius: 0.5,
  ...over,
});

describe("stepRobot", () => {
  it("moves forward along its heading", () => {
    const r = stepRobot(robot(), { forward: 1, turn: 0 }, 0.5);
    expect(r.speed).toBeGreaterThan(0);
    // heading 0 faces +z
    expect(r.z).toBeGreaterThan(0);
    expect(r.x).toBeCloseTo(0, 6);
  });

  it("turns in place", () => {
    const r = stepRobot(robot(), { forward: 0, turn: 1 }, 0.5);
    expect(r.heading).not.toBe(0);
    expect(r.x).toBeCloseTo(0, 6);
  });

  it("stays inside the arena", () => {
    let r = robot();
    for (let i = 0; i < 400; i++) r = stepRobot(r, { forward: 1, turn: 0 }, 0.05);
    expect(r.z).toBeLessThanOrEqual(ARENA_HALF - r.radius + 1e-9);
  });

  it("does not mutate the input", () => {
    const r0 = robot();
    stepRobot(r0, { forward: 1, turn: 1 }, 0.1);
    expect(r0).toEqual(robot());
  });

  it("decelerates to rest without input", () => {
    let r = robot({ speed: 1 });
    for (let i = 0; i < 100; i++) r = stepRobot(r, { forward: 0, turn: 0 }, 0.05);
    expect(r.speed).toBeCloseTo(0, 3);
  });
});

describe("stepBall", () => {
  const ball = (over: Partial<Ball> = {}): Ball => ({ x: 0, z: 0, vx: 0, vz: 0, ...over });

  it("is pushed out of the robot and kicked away on contact", () => {
    const b = stepBall(ball({ z: 0.6 }), robot({ speed: 1 }), 0.016);
    const dist = Math.hypot(b.x, b.z);
    expect(dist).toBeGreaterThanOrEqual(0.5 + BALL_RADIUS - 1e-6);
    expect(b.vz).toBeGreaterThan(0);
  });

  it("slows down from friction", () => {
    const b = stepBall(ball({ x: 3, vx: 2 }), robot(), 0.1);
    expect(Math.abs(b.vx)).toBeLessThan(2);
  });

  it("bounces off arena walls", () => {
    const b = stepBall(ball({ x: ARENA_HALF - 0.01, vx: 3, z: 3 }), robot(), 0.05);
    expect(b.vx).toBeLessThan(0);
    expect(b.x).toBeLessThanOrEqual(ARENA_HALF - BALL_RADIUS + 1e-9);
  });

  it("bounces off the negative walls", () => {
    const b = stepBall(ball({ x: -3, z: -ARENA_HALF + 0.01, vz: -3 }), robot(), 0.05);
    expect(b.vz).toBeGreaterThan(0);
  });

  it("does not mutate the input", () => {
    const b0 = ball({ z: 0.6 });
    stepBall(b0, robot({ speed: 1 }), 0.016);
    expect(b0).toEqual(ball({ z: 0.6 }));
  });
});

describe("inGoal", () => {
  const goal = { x: 0, z: -4, halfWidth: 1, depth: 0.8 };
  it("detects a ball inside the goal box", () => {
    expect(inGoal({ x: 0.2, z: -4.1, vx: 0, vz: 0 }, goal)).toBe(true);
  });
  it("rejects a ball outside", () => {
    expect(inGoal({ x: 2, z: -4, vx: 0, vz: 0 }, goal)).toBe(false);
    expect(inGoal({ x: 0, z: 0, vx: 0, vz: 0 }, goal)).toBe(false);
  });
});
