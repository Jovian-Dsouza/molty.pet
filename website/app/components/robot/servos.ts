/**
 * Molty's eight servos and the joints they drive, measured from the Sesame
 * STEP assembly (see scripts/cad/export_robot.py). Everything here is in CAD
 * space: millimetres, Y up, nose toward -X, left toward +Z.
 *
 * The CAD model is posed in the firmware STAND pose, so a joint's rotation is
 * simply (servo degrees − stand degrees) × sign.
 */

export const SERVOS = ["l1", "r1", "l2", "r2", "l3", "r3", "l4", "r4"] as const;
export type Servo = (typeof SERVOS)[number];

/** Servo angles in degrees (0–180), keyed like firmware/molty/motion_catalog.py. */
export type ServoPose = Readonly<Record<Servo, number>>;

export type Vec3 = readonly [number, number, number];

export const STAND: ServoPose = { r1: 135, r2: 45, l1: 45, l2: 135, r4: 0, r3: 180, l3: 0, l4: 180 };
export const REST: ServoPose = { r1: 90, r2: 90, l1: 90, l2: 90, r4: 90, r3: 90, l3: 90, l4: 90 };

export type BodyNode = "body" | "femur_l1" | "femur_r1" | "femur_l2" | "femur_r2";

export interface Joint {
  servo: Servo;
  /** GLB node this joint moves. */
  node: string;
  /** GLB node it is attached to. */
  parent: BodyNode;
  pivot: Vec3;
  /** Unit rotation axis. */
  axis: Vec3;
  sign: 1 | -1;
}

/** Midpoint between the four hip axes. */
export const BODY_CENTER: Vec3 = [25.72, 0, 2.38];

const UP: Vec3 = [0, 1, 0];
const R = Math.SQRT1_2;

/** Hips swing each femur about a vertical axis; 90° points the leg straight out sideways. */
export const HIPS: readonly Joint[] = [
  { servo: "l1", node: "femur_l1", parent: "body", pivot: [1.52, 36, 27.78], axis: UP, sign: 1 },
  { servo: "r1", node: "femur_r1", parent: "body", pivot: [1.52, 36, -23.02], axis: UP, sign: 1 },
  { servo: "l2", node: "femur_l2", parent: "body", pivot: [49.92, 36, 27.78], axis: UP, sign: 1 },
  { servo: "r2", node: "femur_r2", parent: "body", pivot: [49.92, 36, -23.02], axis: UP, sign: 1 },
];

/** Knees turn the foot about a horizontal diagonal; lifting swings the foot outward. */
export const KNEES: readonly Joint[] = [
  { servo: "l3", node: "foot_l3", parent: "femur_l1", pivot: [-26.52, 15.42, 51.83], axis: [-R, 0, -R], sign: 1 },
  { servo: "r3", node: "foot_r3", parent: "femur_r1", pivot: [-26.64, 15.42, -46.94], axis: [-R, 0, R], sign: 1 },
  { servo: "l4", node: "foot_l4", parent: "femur_l2", pivot: [68.04, 15.23, 61.75], axis: [-R, 0, R], sign: -1 },
  { servo: "r4", node: "foot_r4", parent: "femur_r2", pivot: [68.04, 15.23, -56.99], axis: [-R, 0, -R], sign: -1 },
];

/** Joint rotation in radians about `joint.axis` for a servo pose. */
export function jointAngle(joint: Joint, pose: ServoPose): number {
  return joint.sign * (pose[joint.servo] - STAND[joint.servo]) * (Math.PI / 180);
}
