"use client";

import { useEffect, useMemo, useRef, type RefObject } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { Box3, Group, Matrix4, Mesh, Vector3, type Object3D } from "three";
import { HIPS, KNEES, BODY_CENTER, STAND, jointAngle, type Joint, type ServoPose, type Vec3 } from "./servos";
import { ACTIONS, gaitCycle, loopPoseAt, poseAt, slewToward, type ActionName, type GaitName } from "./motions";
import { supportTilt, type Tilt } from "./support";

export const MOLTY_MODEL_URL = "/models/molty.glb";

/** Scene units per millimetre (1 unit = 10 cm). */
const SCALE = 0.01;
const GAIT_FRAME_MS = 90;
/** How quickly the body settles onto a new support (1/s). */
const TILT_RATE = 10;

export interface MoltyControl {
  /** A one-shot firmware action, or null. Takes priority over `gait`. */
  action: ActionName | null;
  /** Clock time (s) the action started. */
  actionStartedAt: number;
  /** A looping locomotion gait, or null to stand. */
  gait: GaitName | null;
}

interface MoltyProps {
  control: RefObject<MoltyControl>;
  onPose?: (pose: ServoPose) => void;
  onPoke?: () => void;
}

interface Rig {
  root: Group;
  /** Raised or lowered every frame so the lowest point rests on the floor. */
  ground: Group;
  /** Rolls and pitches the body onto its supports, about the body centre. */
  tilt: Group;
  pivots: { joint: Joint; group: Group }[];
  /** Bounding-box corners of each foot and the body, for ground contact. */
  contacts: { object: Object3D; points: Vector3[] }[];
}

/** Bounding-box corners in `part`'s own frame (GLB primitives carry no local transform). */
function localCorners(part: Object3D): Vector3[] {
  const box = new Box3();
  part.traverse((o) => {
    if (!(o instanceof Mesh)) return;
    o.geometry.computeBoundingBox();
    if (o.geometry.boundingBox) box.union(o.geometry.boundingBox);
  });
  const { min, max } = box;
  return [0, 1, 2, 3, 4, 5, 6, 7].map(
    (i) => new Vector3(i & 1 ? max.x : min.x, i & 2 ? max.y : min.y, i & 4 ? max.z : min.z),
  );
}

/** Rebuilds the flat CAD export into body → hip pivot → knee pivot groups. */
function buildRig(scene: Group): Rig {
  const take = (name: string): Object3D => {
    const node = scene.getObjectByName(name);
    if (!node) throw new Error(`molty.glb is missing node "${name}"`);
    const copy = node.clone(true);
    copy.traverse((o) => {
      if (o instanceof Mesh) {
        o.geometry.computeVertexNormals();
        o.castShadow = true;
        o.receiveShadow = true;
      }
    });
    return copy;
  };

  const root = new Group();
  root.rotation.y = Math.PI / 2; // CAD nose (-X) faces scene +Z
  root.scale.setScalar(SCALE);
  const ground = new Group();
  const tilt = new Group();
  const lift = new Group();
  lift.position.set(-BODY_CENTER[0], 0, -BODY_CENTER[2]);
  root.add(ground);
  ground.add(tilt);
  tilt.add(lift);

  const body = take("body");
  lift.add(body);
  const parents = new Map<string, { group: Group; origin: Vector3 }>([
    ["body", { group: lift, origin: new Vector3() }],
  ]);
  const pivots: Rig["pivots"] = [];
  const contacts: Rig["contacts"] = [];

  for (const joint of [...HIPS, ...KNEES]) {
    const parent = parents.get(joint.parent);
    if (!parent) throw new Error(`joint ${joint.servo} has no parent ${joint.parent}`);
    const pivot = new Vector3(...joint.pivot);
    const group = new Group();
    group.position.copy(pivot).sub(parent.origin);
    const part = take(joint.node);
    part.position.copy(pivot).negate();
    group.add(part);
    parent.group.add(group);
    parents.set(joint.node, { group, origin: pivot });
    pivots.push({ joint, group });
    if (joint.node.startsWith("foot")) contacts.push({ object: part, points: localCorners(part) });
  }
  contacts.push({ object: body, points: localCorners(body) });
  return { root, ground, tilt, pivots, contacts };
}

function targetPose(c: MoltyControl, now: number): ServoPose {
  if (c.action) return poseAt(ACTIONS[c.action], (now - c.actionStartedAt) * 1000, STAND);
  if (c.gait) return loopPoseAt(gaitCycle(c.gait, GAIT_FRAME_MS), now * 1000, STAND);
  return STAND;
}

const scratch = new Vector3();
const toBody = new Matrix4();

/** Contact points relative to the body centre, measured with the body level. */
function levelContacts(rig: Rig): Vec3[] {
  rig.tilt.rotation.set(0, 0, 0);
  rig.ground.position.y = 0;
  rig.root.updateMatrixWorld(true);
  toBody.copy(rig.tilt.matrixWorld).invert();
  return rig.contacts.flatMap(({ object, points }) =>
    points.map((p): Vec3 => {
      const v = scratch.copy(p).applyMatrix4(object.matrixWorld).applyMatrix4(toBody);
      return [v.x, v.y, v.z];
    }),
  );
}

/** World height of the lowest contact point. */
function lowestPoint(rig: Rig): number {
  rig.root.updateMatrixWorld(true);
  let lowest = Infinity;
  for (const { object, points } of rig.contacts) {
    for (const p of points) lowest = Math.min(lowest, scratch.copy(p).applyMatrix4(object.matrixWorld).y);
  }
  return lowest;
}

export function Molty({ control, onPose, onPoke }: MoltyProps) {
  const { scene } = useGLTF(MOLTY_MODEL_URL);
  const rig = useMemo(() => buildRig(scene), [scene]);
  // The frame loop mutates three.js objects every frame; reach them through a ref.
  const rigRef = useRef(rig);
  useEffect(() => {
    rigRef.current = rig;
  }, [rig]);
  const servos = useRef<ServoPose>(STAND);
  const tilt = useRef<Tilt>({ roll: 0, pitch: 0 });
  const wobble = useRef({ amp: 0, t: 0 });

  useFrame(({ clock }, dt) => {
    const rig = rigRef.current;
    const now = clock.getElapsedTime();
    servos.current = slewToward(servos.current, targetPose(control.current, now), Math.min(dt, 0.05) * 1000);
    for (const { joint, group } of rig.pivots) {
      group.quaternion.setFromAxisAngle(scratch.set(...joint.axis), jointAngle(joint, servos.current));
    }

    // Settle onto whichever feet (or belly) are lowest, then drop to the floor.
    const target = supportTilt(levelContacts(rig), [0, 0, 0]);
    const k = 1 - Math.exp(-dt * TILT_RATE);
    tilt.current = {
      roll: tilt.current.roll + (target.roll - tilt.current.roll) * k,
      pitch: tilt.current.pitch + (target.pitch - tilt.current.pitch) * k,
    };
    rig.tilt.rotation.set(tilt.current.roll, 0, tilt.current.pitch);
    const parentY = rig.root.parent?.getWorldPosition(scratch).y ?? 0;
    rig.ground.position.y = -(lowestPoint(rig) - parentY) / SCALE;

    const w = wobble.current;
    w.t += dt;
    w.amp *= Math.max(0, 1 - dt * 3);
    rig.root.rotation.z = Math.sin(w.t * 22) * w.amp;
    onPose?.(servos.current);
  });

  const poke = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    wobble.current = { amp: 0.12, t: 0 };
    onPoke?.();
  };

  return <primitive object={rig.root} onPointerDown={poke} />;
}
