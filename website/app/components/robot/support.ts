import type { Vec3 } from "./servos";

/** Radians; beyond this the real robot would have fallen over. */
const MAX_TILT = 0.5;

export interface Tilt {
  /** Rotation about +X (CAD): positive lowers the left (+Z) side. */
  roll: number;
  /** Rotation about +Z (CAD): positive lowers the nose (-X). */
  pitch: number;
}

const clamp = (v: number) => Math.max(-MAX_TILT, Math.min(MAX_TILT, v));

function lowest(points: readonly Vec3[], keep: (p: Vec3) => boolean): Vec3 | null {
  return points.filter(keep).reduce<Vec3 | null>((low, p) => (low === null || p[1] < low[1] ? p : low), null);
}

/**
 * How the body settles onto its supports, from contact points measured with
 * the body level (CAD space). Each side rests on its lowest point, so a single
 * raised paw (tripod) stays level while a raised side tips the robot over.
 */
export function supportTilt(points: readonly Vec3[], center: Vec3): Tilt {
  const [cx, , cz] = center;
  const left = lowest(points, (p) => p[2] > cz);
  const right = lowest(points, (p) => p[2] <= cz);
  const front = lowest(points, (p) => p[0] < cx);
  const back = lowest(points, (p) => p[0] >= cx);

  const roll = left && right && left[2] !== right[2] ? (left[1] - right[1]) / (left[2] - right[2]) : 0;
  const pitch = front && back && front[0] !== back[0] ? (front[1] - back[1]) / (back[0] - front[0]) : 0;
  return { roll: clamp(Math.atan(roll)) || 0, pitch: clamp(Math.atan(pitch)) || 0 };
}
