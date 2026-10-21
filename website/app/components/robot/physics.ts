/** Tiny 2D (x/z plane) kinematics for the playground. No physics engine. */

export const ARENA_HALF = 5;
export const BALL_RADIUS = 0.28;

const MAX_SPEED = 2.4;
const ACCEL = 6;
const TURN_RATE = 2.6;
const ROBOT_DRAG = 5;
const BALL_FRICTION = 1.4;
const WALL_RESTITUTION = 0.7;
const KICK = 1.6;

export interface RobotBody {
  x: number;
  z: number;
  /** radians; 0 faces +z */
  heading: number;
  speed: number;
  radius: number;
}

export interface DriveInput {
  /** −1..1 */
  forward: number;
  /** −1..1, positive turns left */
  turn: number;
}

export interface Ball {
  x: number;
  z: number;
  vx: number;
  vz: number;
}

export interface Goal {
  x: number;
  z: number;
  halfWidth: number;
  depth: number;
}

const clampAbs = (v: number, max: number) => Math.max(-max, Math.min(max, v));

export function stepRobot(body: RobotBody, input: DriveInput, dt: number): RobotBody {
  const forward = clampAbs(input.forward, 1);
  const target = forward * MAX_SPEED;
  const rate = forward === 0 ? ROBOT_DRAG : ACCEL;
  const delta = target - body.speed;
  const speed = body.speed + clampAbs(delta, rate * dt);
  const heading = body.heading + clampAbs(input.turn, 1) * TURN_RATE * dt;
  const limit = ARENA_HALF - body.radius;
  return {
    ...body,
    heading,
    speed: Math.abs(speed) < 1e-4 ? 0 : speed,
    x: clampAbs(body.x + Math.sin(heading) * speed * dt, limit),
    z: clampAbs(body.z + Math.cos(heading) * speed * dt, limit),
  };
}

function collide(ball: Ball, robot: RobotBody): Ball {
  const dx = ball.x - robot.x;
  const dz = ball.z - robot.z;
  const dist = Math.hypot(dx, dz) || 1e-6;
  const minDist = robot.radius + BALL_RADIUS;
  if (dist >= minDist) return ball;
  const nx = dx / dist;
  const nz = dz / dist;
  const push = Math.max(Math.abs(robot.speed), 0.4) * KICK;
  return {
    x: robot.x + nx * minDist,
    z: robot.z + nz * minDist,
    vx: ball.vx + nx * push,
    vz: ball.vz + nz * push,
  };
}

function bounceAxis(pos: number, vel: number): [number, number] {
  const limit = ARENA_HALF - BALL_RADIUS;
  if (pos > limit) return [limit, -Math.abs(vel) * WALL_RESTITUTION];
  if (pos < -limit) return [-limit, Math.abs(vel) * WALL_RESTITUTION];
  return [pos, vel];
}

export function stepBall(ball: Ball, robot: RobotBody, dt: number): Ball {
  const hit = collide(ball, robot);
  const damp = Math.max(0, 1 - BALL_FRICTION * dt);
  const vx = hit.vx * damp;
  const vz = hit.vz * damp;
  const [x, bvx] = bounceAxis(hit.x + vx * dt, vx);
  const [z, bvz] = bounceAxis(hit.z + vz * dt, vz);
  return { x, z, vx: bvx, vz: bvz };
}

export function inGoal(ball: Ball, goal: Goal): boolean {
  return (
    Math.abs(ball.x - goal.x) <= goal.halfWidth && Math.abs(ball.z - goal.z) <= goal.depth / 2
  );
}
