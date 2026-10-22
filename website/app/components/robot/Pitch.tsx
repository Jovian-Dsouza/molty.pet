"use client";

import { ARENA_HALF } from "./physics";

/** Pitch markings, scaled to the 10 m arena: a half pitch with the goal at the far end. */
const LINE_WIDTH = 0.06;
const LINE_Y = 0.004;
const LINE_COLOR = "#f4f6f2";
const TOUCHLINE_X = ARENA_HALF - 0.3;
const HALFWAY_Z = ARENA_HALF - 0.3;
const PENALTY_DEPTH = 2;
const PENALTY_HALF_WIDTH = 2.6;
const GOAL_AREA_DEPTH = 0.7;
const GOAL_AREA_HALF_WIDTH = 1.6;
const PENALTY_SPOT_DISTANCE = 1.4;
const PENALTY_ARC_RADIUS = 1;
const CENTER_CIRCLE_RADIUS = 1.3;
const CORNER_ARC_RADIUS = 0.3;
const STRIPE_COUNT = 10;
const GRASS_LIGHT = "#3f8a3a";
const GRASS_DARK = "#367a33";
const SURROUND = "#2a5a2a";
const BOARD_HEIGHT = 0.18;
const BOARD_COLOR = "#ff5b59";

/** A straight line from (x1, z1) to (x2, z2) painted on the grass. */
function Line({ from, to }: { from: [number, number]; to: [number, number] }) {
  const [x1, z1] = from;
  const [x2, z2] = to;
  const length = Math.hypot(x2 - x1, z2 - z1) + LINE_WIDTH;
  const angle = Math.atan2(z2 - z1, x2 - x1);
  return (
    <mesh position={[(x1 + x2) / 2, LINE_Y, (z1 + z2) / 2]} rotation={[-Math.PI / 2, 0, -angle]} receiveShadow>
      <planeGeometry args={[length, LINE_WIDTH]} />
      <meshStandardMaterial color={LINE_COLOR} roughness={0.9} />
    </mesh>
  );
}

/**
 * An arc around (x, z). Angles follow the ring's own plane: 0 points to +x and
 * positive angles turn towards -z once laid flat.
 */
function Arc({ x, z, radius, start, length }: { x: number; z: number; radius: number; start: number; length: number }) {
  return (
    <mesh position={[x, LINE_Y, z]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <ringGeometry args={[radius - LINE_WIDTH / 2, radius + LINE_WIDTH / 2, 48, 1, start, length]} />
      <meshStandardMaterial color={LINE_COLOR} roughness={0.9} />
    </mesh>
  );
}

function Spot({ x, z }: { x: number; z: number }) {
  return (
    <mesh position={[x, LINE_Y, z]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <circleGeometry args={[LINE_WIDTH * 1.2, 16]} />
      <meshStandardMaterial color={LINE_COLOR} roughness={0.9} />
    </mesh>
  );
}

/** Rectangle open on the goal-line side, reaching `depth` into the field. */
function Box({ goalLineZ, halfWidth, depth }: { goalLineZ: number; halfWidth: number; depth: number }) {
  const front = goalLineZ + depth;
  return (
    <>
      <Line from={[-halfWidth, goalLineZ]} to={[-halfWidth, front]} />
      <Line from={[halfWidth, goalLineZ]} to={[halfWidth, front]} />
      <Line from={[-halfWidth, front]} to={[halfWidth, front]} />
    </>
  );
}

function Grass() {
  const size = ARENA_HALF * 2;
  const band = size / STRIPE_COUNT;
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.002, 0]} receiveShadow>
        <planeGeometry args={[80, 80]} />
        <meshStandardMaterial color={SURROUND} roughness={1} />
      </mesh>
      {Array.from({ length: STRIPE_COUNT }, (_, i) => (
        <mesh
          key={i}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0, -ARENA_HALF + band * (i + 0.5)]}
          receiveShadow
        >
          <planeGeometry args={[size, band]} />
          <meshStandardMaterial color={i % 2 === 0 ? GRASS_LIGHT : GRASS_DARK} roughness={0.95} />
        </mesh>
      ))}
    </>
  );
}

function Boards() {
  const sides: { position: [number, number, number]; size: [number, number, number] }[] = [
    { position: [0, BOARD_HEIGHT / 2, -ARENA_HALF], size: [ARENA_HALF * 2 + 0.08, BOARD_HEIGHT, 0.08] },
    { position: [0, BOARD_HEIGHT / 2, ARENA_HALF], size: [ARENA_HALF * 2 + 0.08, BOARD_HEIGHT, 0.08] },
    { position: [-ARENA_HALF, BOARD_HEIGHT / 2, 0], size: [0.08, BOARD_HEIGHT, ARENA_HALF * 2] },
    { position: [ARENA_HALF, BOARD_HEIGHT / 2, 0], size: [0.08, BOARD_HEIGHT, ARENA_HALF * 2] },
  ];
  return (
    <>
      {sides.map(({ position, size }) => (
        <mesh key={position.join()} position={position} castShadow receiveShadow>
          <boxGeometry args={size} />
          <meshStandardMaterial color={BOARD_COLOR} roughness={0.6} />
        </mesh>
      ))}
    </>
  );
}

/** Grass, white markings and perimeter boards. `goalLineZ` is where the goal mouth sits. */
export function Pitch({ goalLineZ }: { goalLineZ: number }) {
  const spotZ = goalLineZ + PENALTY_SPOT_DISTANCE;
  // The penalty arc only shows where it pokes out past the box.
  const arcCut = Math.asin((goalLineZ + PENALTY_DEPTH - spotZ) / PENALTY_ARC_RADIUS);
  return (
    <>
      <Grass />
      <Boards />

      {/* goal line, touchlines, halfway line */}
      <Line from={[-TOUCHLINE_X, goalLineZ]} to={[TOUCHLINE_X, goalLineZ]} />
      <Line from={[-TOUCHLINE_X, goalLineZ]} to={[-TOUCHLINE_X, HALFWAY_Z]} />
      <Line from={[TOUCHLINE_X, goalLineZ]} to={[TOUCHLINE_X, HALFWAY_Z]} />
      <Line from={[-TOUCHLINE_X, HALFWAY_Z]} to={[TOUCHLINE_X, HALFWAY_Z]} />

      <Box goalLineZ={goalLineZ} halfWidth={PENALTY_HALF_WIDTH} depth={PENALTY_DEPTH} />
      <Box goalLineZ={goalLineZ} halfWidth={GOAL_AREA_HALF_WIDTH} depth={GOAL_AREA_DEPTH} />
      <Spot x={0} z={spotZ} />
      <Arc x={0} z={spotZ} radius={PENALTY_ARC_RADIUS} start={Math.PI + arcCut} length={Math.PI - 2 * arcCut} />

      {/* half of the centre circle, cut by the halfway line */}
      <Arc x={0} z={HALFWAY_Z} radius={CENTER_CIRCLE_RADIUS} start={0} length={Math.PI} />
      <Spot x={0} z={HALFWAY_Z} />

      {/* corner arcs where the goal line meets the touchlines */}
      <Arc x={-TOUCHLINE_X} z={goalLineZ} radius={CORNER_ARC_RADIUS} start={(3 * Math.PI) / 2} length={Math.PI / 2} />
      <Arc x={TOUCHLINE_X} z={goalLineZ} radius={CORNER_ARC_RADIUS} start={Math.PI} length={Math.PI / 2} />
    </>
  );
}
