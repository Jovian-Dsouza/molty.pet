"use client";

import { Suspense, useRef, type RefObject } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Grid } from "@react-three/drei";
import type { Group, Mesh } from "three";
import { Molty, type MoltyControl } from "./Molty";
import { ACTIONS, motionDuration, type ActionName, type GaitName } from "./motions";
import type { ServoPose } from "./servos";
import {
  ARENA_HALF,
  BALL_RADIUS,
  inGoal,
  stepBall,
  stepRobot,
  type Ball,
  type DriveInput,
  type Goal,
  type RobotBody,
} from "./physics";

export interface Telemetry {
  servos: ServoPose;
  /** "idle", a gait name, or the running action. */
  mode: string;
  speed: number;
  x: number;
  z: number;
}

export type TrickRequest = ActionName | null;

const GOAL: Goal = { x: 0, z: -ARENA_HALF + 0.5, halfWidth: 1.1, depth: 0.9 };
/** Chase camera: close enough to read the CAD detail, far enough to see the goal. */
const CAMERA_HEIGHT = 4.2;
const CAMERA_DISTANCE = 4.6;
/** Extra time for the servos to settle back to stand after an action's last frame. */
const SETTLE_S = 0.4;
const POKE_ACTION: ActionName = "shake";
const INITIAL_ROBOT: RobotBody = { x: 0, z: 2, heading: Math.PI, speed: 0, radius: 0.6 };

function gaitFor(input: DriveInput): GaitName | null {
  if (input.forward > 0) return "forward";
  if (input.forward < 0) return "backward";
  if (input.turn > 0) return "left";
  if (input.turn < 0) return "right";
  return null;
}
const INITIAL_BALL: Ball = { x: 0.3, z: 0, vx: 0, vz: 0 };

interface SceneProps {
  readInput: () => DriveInput;
  trickRef: RefObject<TrickRequest>;
  onTelemetry: (t: Telemetry) => void;
  onGoal: () => void;
}

function World({ readInput, trickRef, onTelemetry, onGoal }: SceneProps) {
  const robotGroup = useRef<Group>(null);
  const ballMesh = useRef<Mesh>(null);
  const robot = useRef<RobotBody>(INITIAL_ROBOT);
  const ball = useRef<Ball>(INITIAL_BALL);
  const control = useRef<MoltyControl>({ action: null, actionStartedAt: 0, gait: null });
  const actionEndsAt = useRef(0);
  const lastServos = useRef<ServoPose | null>(null);
  useFrame((state, rawDt) => {
    const { camera, size, clock } = state;
    const dt = Math.min(rawDt, 1 / 30);
    const now = clock.getElapsedTime();
    const input = readInput();
    const gait = gaitFor(input);
    const c = control.current;

    if (trickRef.current) {
      const action = trickRef.current;
      trickRef.current = null;
      control.current = { action, actionStartedAt: now, gait: null };
      actionEndsAt.current = now + motionDuration(ACTIONS[action]) / 1000 + SETTLE_S;
    } else if (c.action && (gait || now >= actionEndsAt.current)) {
      // Driving cancels a trick, like the firmware's cancel-to-stand.
      control.current = { action: null, actionStartedAt: 0, gait };
    } else if (!c.action && c.gait !== gait) {
      control.current = { ...c, gait };
    }

    const acting = control.current.action !== null;
    robot.current = stepRobot(robot.current, acting ? { forward: 0, turn: 0 } : input, dt);
    ball.current = stepBall(ball.current, robot.current, dt);

    if (inGoal(ball.current, GOAL)) {
      ball.current = INITIAL_BALL;
      onGoal();
    }

    const r = robot.current;
    robotGroup.current?.position.set(r.x, 0, r.z);
    if (robotGroup.current) robotGroup.current.rotation.y = r.heading;
    ballMesh.current?.position.set(ball.current.x, BALL_RADIUS, ball.current.z);
    if (ballMesh.current) {
      ballMesh.current.rotation.x += ball.current.vz * dt * 3;
      ballMesh.current.rotation.z -= ball.current.vx * dt * 3;
    }

    const far = size.width < size.height ? 1.3 : 1;
    const k = 1 - Math.exp(-dt * 2);
    camera.position.x += (r.x * 0.6 - camera.position.x) * k;
    camera.position.y += (CAMERA_HEIGHT * far - camera.position.y) * k;
    camera.position.z += (CAMERA_DISTANCE * far + r.z * 0.6 - camera.position.z) * k;
    camera.lookAt(r.x * 0.7, 0.15, r.z * 0.6 - 0.8);

    if (lastServos.current) {
      const { action, gait: walking } = control.current;
      onTelemetry({ servos: lastServos.current, mode: action ?? walking ?? "idle", speed: r.speed, x: r.x, z: r.z });
    }
  });

  return (
    <>
      <group ref={robotGroup}>
        <Suspense fallback={null}>
          <Molty
            control={control}
            onPose={(p) => {
              lastServos.current = p;
            }}
            onPoke={() => {
              trickRef.current = POKE_ACTION;
            }}
          />
        </Suspense>
      </group>

      <mesh ref={ballMesh} castShadow>
        <icosahedronGeometry args={[BALL_RADIUS, 1]} />
        <meshStandardMaterial color="#fcf3f2" flatShading roughness={0.4} />
      </mesh>

      {/* goal */}
      <group position={[GOAL.x, 0, GOAL.z]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.003, 0]}>
          <planeGeometry args={[GOAL.halfWidth * 2, GOAL.depth]} />
          <meshBasicMaterial color="#ff9e95" transparent opacity={0.12} />
        </mesh>
        {[-1, 1].map((s) => (
          <mesh key={s} position={[s * GOAL.halfWidth, 0.4, -GOAL.depth / 2]} castShadow>
            <boxGeometry args={[0.06, 0.8, 0.06]} />
            <meshStandardMaterial color="#ff9e95" emissive="#ff9e95" emissiveIntensity={0.4} />
          </mesh>
        ))}
        <mesh position={[0, 0.8, -GOAL.depth / 2]}>
          <boxGeometry args={[GOAL.halfWidth * 2 + 0.06, 0.06, 0.06]} />
          <meshStandardMaterial color="#ff9e95" emissive="#ff9e95" emissiveIntensity={0.4} />
        </mesh>
      </group>

      {/* arena walls */}
      <mesh position={[0, 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[ARENA_HALF * 1.414, ARENA_HALF * 1.43, 4, 1, Math.PI / 4]} />
        <meshBasicMaterial color="#fcf3f2" transparent opacity={0.25} />
      </mesh>
    </>
  );
}

export default function PlaygroundScene(props: SceneProps & { active: boolean }) {
  const { active, ...rest } = props;
  return (
    <Canvas
      shadows
      frameloop={active ? "always" : "never"}
      dpr={[1, 1.5]}
      camera={{ position: [0, CAMERA_HEIGHT, CAMERA_DISTANCE], fov: 42 }}
      gl={{ antialias: true }}
      aria-label="Robot playground: drive Molty and push the ball into the goal"
      role="img"
    >
      <color attach="background" args={["#0b0202"]} />
      <fog attach="fog" args={["#0b0202", 9, 18]} />
      <ambientLight intensity={0.45} />
      <directionalLight position={[4, 8, 3]} intensity={2} castShadow shadow-mapSize={[1024, 1024]}>
        <orthographicCamera attach="shadow-camera" args={[-7, 7, 7, -7, 0.5, 20]} />
      </directionalLight>
      <directionalLight position={[-4, 3, -3]} intensity={0.5} color="#ff5b59" />
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[ARENA_HALF * 2, ARENA_HALF * 2]} />
        <meshStandardMaterial color="#140505" roughness={1} />
      </mesh>
      <Grid
        position={[0, 0.002, 0]}
        args={[ARENA_HALF * 2, ARENA_HALF * 2]}
        cellSize={0.5}
        cellThickness={0.6}
        cellColor="#2e1212"
        sectionSize={2.5}
        sectionThickness={1}
        sectionColor="#ff5b59"
        fadeDistance={20}
      />
      <World {...rest} />
    </Canvas>
  );
}
