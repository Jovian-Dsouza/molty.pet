"use client";

import { Suspense, useRef, type RefObject } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import type { Group, Mesh } from "three";
import { Molty, type MoltyControl } from "./Molty";
import { Pitch } from "./Pitch";
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
/** The goal mouth faces the field; the scoring zone is the space inside the net. */
const GOAL_LINE_Z = GOAL.z + GOAL.depth / 2;
const GOAL_HEIGHT = 0.8;
const POST = 0.06;
const SKY = "#9fc4e0";
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

      {/* goal: white frame at the goal line, net running back to the scoring zone's far edge */}
      <group position={[GOAL.x, 0, GOAL_LINE_Z]}>
        {[-1, 1].map((side) => (
          <mesh key={side} position={[side * GOAL.halfWidth, GOAL_HEIGHT / 2, 0]} castShadow>
            <boxGeometry args={[POST, GOAL_HEIGHT, POST]} />
            <meshStandardMaterial color="#ffffff" roughness={0.4} />
          </mesh>
        ))}
        <mesh position={[0, GOAL_HEIGHT, 0]} castShadow>
          <boxGeometry args={[GOAL.halfWidth * 2 + POST, POST, POST]} />
          <meshStandardMaterial color="#ffffff" roughness={0.4} />
        </mesh>
        <mesh position={[0, GOAL_HEIGHT / 2, -GOAL.depth]}>
          <boxGeometry args={[GOAL.halfWidth * 2, GOAL_HEIGHT, 0.01, 22, 8, 1]} />
          <meshBasicMaterial color="#ffffff" wireframe transparent opacity={0.35} />
        </mesh>
        <mesh position={[0, GOAL_HEIGHT, -GOAL.depth / 2]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[GOAL.halfWidth * 2, GOAL.depth, 22, 9]} />
          <meshBasicMaterial color="#ffffff" wireframe transparent opacity={0.35} />
        </mesh>
        {[-1, 1].map((side) => (
          <mesh
            key={side}
            position={[side * GOAL.halfWidth, GOAL_HEIGHT / 2, -GOAL.depth / 2]}
            rotation={[0, Math.PI / 2, 0]}
          >
            <planeGeometry args={[GOAL.depth, GOAL_HEIGHT, 9, 8]} />
            <meshBasicMaterial color="#ffffff" wireframe transparent opacity={0.35} />
          </mesh>
        ))}
      </group>
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
      <color attach="background" args={[SKY]} />
      <fog attach="fog" args={[SKY, 14, 30]} />
      <hemisphereLight args={["#e8f3ff", "#2f5a2a", 1.1]} />
      <directionalLight
        position={[5, 10, 4]}
        intensity={2.6}
        color="#fff6e8"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0005}
      >
        <orthographicCamera attach="shadow-camera" args={[-7, 7, 7, -7, 0.5, 25]} />
      </directionalLight>
      <directionalLight position={[-5, 6, -4]} intensity={0.6} color="#dbe8ff" />
      <Pitch goalLineZ={GOAL_LINE_Z} />
      <World {...rest} />
    </Canvas>
  );
}
