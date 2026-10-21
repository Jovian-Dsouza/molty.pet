import { describe, expect, it } from "vitest";
import { BODY_CENTER, HIPS, KNEES, REST, SERVOS, STAND, jointAngle, type Joint, type ServoPose, type Vec3 } from "../servos";

/** Rodrigues rotation — the same right-hand rule three.js uses for axis-angle. */
function rotate(v: Vec3, axis: Vec3, angle: number): Vec3 {
  const [kx, ky, kz] = axis;
  const [x, y, z] = v;
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  const dot = kx * x + ky * y + kz * z;
  const cross: Vec3 = [ky * z - kz * y, kz * x - kx * z, kx * y - ky * x];
  return [
    x * c + cross[0] * s + kx * dot * (1 - c),
    y * c + cross[1] * s + ky * dot * (1 - c),
    z * c + cross[2] * s + kz * dot * (1 - c),
  ];
}

const pose = (overrides: Partial<ServoPose>): ServoPose => ({ ...STAND, ...overrides });

/** Horizontal direction the leg points at stand (CAD: nose toward -X, left toward +Z). */
const outward = (hip: Joint): Vec3 => {
  const [px, , pz] = hip.pivot;
  const [cx, , cz] = BODY_CENTER;
  return [Math.sign(px - cx), 0, Math.sign(pz - cz)];
};

const legDirection = (hip: Joint, p: ServoPose) => rotate(outward(hip), hip.axis, jointAngle(hip, p));

describe("servo pose tables", () => {
  it("covers all eight servos with firmware stand and rest angles", () => {
    expect(Object.keys(STAND).sort()).toEqual([...SERVOS].sort());
    expect(STAND).toMatchObject({ r1: 135, r2: 45, l1: 45, l2: 135, r3: 180, l3: 0, r4: 0, l4: 180 });
    expect(Object.values(REST)).toEqual(Array(8).fill(90));
  });

  it("matches the CAD pose at stand: every joint angle is zero", () => {
    for (const joint of [...HIPS, ...KNEES]) expect(jointAngle(joint, STAND)).toBeCloseTo(0);
  });
});

describe("hip kinematics", () => {
  it("points every leg straight out sideways at 90° (crab)", () => {
    const crab = pose({ l1: 90, r1: 90, l2: 90, r2: 90 });
    for (const hip of HIPS) {
      const [x, , z] = legDirection(hip, crab);
      expect(Math.abs(x)).toBeLessThan(1e-9);
      expect(Math.sign(z)).toBe(outward(hip)[2]);
    }
  });

  it("points front legs forward and rear legs back in a bow", () => {
    const bow = pose({ l1: 0, r1: 180, l2: 180, r2: 0 });
    for (const hip of HIPS) {
      const [x, , z] = legDirection(hip, bow);
      expect(Math.abs(z)).toBeLessThan(1e-9);
      expect(Math.sign(x)).toBe(outward(hip)[0]);
    }
  });
});

describe("knee kinematics", () => {
  const LIFTED: Partial<ServoPose> = { l3: 30, r3: 150, r4: 30, l4: 150 };

  it.each(KNEES.map((k) => [k.servo, k] as const))("lifts the %s foot outward", (_name, knee) => {
    const foot: Vec3 = [0, -30, 0]; // foot hangs straight down from the pivot at stand
    const [x, y, z] = rotate(foot, knee.axis, jointAngle(knee, pose(LIFTED)));
    const hip = HIPS.find((h) => h.node === knee.parent)!;
    const [ox, , oz] = outward(hip);
    expect(x * ox + z * oz).toBeGreaterThan(10); // moved away from the body
    expect(y).toBeGreaterThan(-30); // and up
  });

  it("holds the foot horizontal at 90° (rest / belly down)", () => {
    for (const knee of KNEES) {
      const [, y] = rotate([0, -30, 0], knee.axis, jointAngle(knee, REST));
      expect(Math.abs(y)).toBeLessThan(1e-9);
    }
  });
});
