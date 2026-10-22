'use client'

import { Suspense, useEffect, useMemo, useRef, type RefObject } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Color, Vector3, type AmbientLight, type DirectionalLight, type MeshBasicMaterial, type MeshStandardMaterial } from 'three'
import { SCENARIOS, type LaptopState } from '@/app/scenarios'
import { Molty, type MoltyControl } from '../robot/Molty'
import type { Mood } from '../robot/face'
import { actionAt, phaseAt, type SceneSchedule } from './timeline'
import { createLaptopScreen } from './laptopScreen'
import { LIGHTING } from './lighting'

/** Which scene is playing and when it started, in performance.now() ms. */
export interface StageCue {
  index: number
  startedAt: number
  /** Set while paused, so the scene's clock stops at this instant. */
  pausedAt: number | null
}

interface StageSceneProps {
  cueRef: RefObject<StageCue>
  schedules: readonly SceneSchedule[]
  /** Render every frame; false freezes the scene where it is. */
  active: boolean
  /** Hold the camera still (prefers-reduced-motion). */
  still: boolean
}

/** How quickly lighting eases toward a new time of day (1/s). */
const LIGHT_RATE = 1.8
/** Wide screens leave room on the left for the captions; narrow ones centre on Molty. */
const CAMERA_WIDE = { x: 0.7, y: 1.9, z: 5.4, lookAt: new Vector3(0.1, 0.55, -0.6) }
const CAMERA_TALL = { x: 0.6, y: 2.1, z: 5.6, lookAt: new Vector3(0.2, 0.45, -0.4) }
const SWAY = { amount: 0.25, speed: 0.12 }

function Laptop({ stateRef }: { stateRef: RefObject<LaptopState> }) {
  const screen = useMemo(() => createLaptopScreen(), [])
  useEffect(() => () => screen.dispose(), [screen])
  useFrame(() => screen.show(stateRef.current))

  return (
    <group position={[-2.3, 0, -2.4]} rotation={[0, 0.42, 0]}>
      <mesh position={[0, 0.05, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.2, 0.1, 2.2]} />
        <meshStandardMaterial color="#2b2422" roughness={0.45} metalness={0.4} />
      </mesh>
      <group position={[0, 0.1, -1.1]} rotation={[-0.28, 0, 0]}>
        <mesh position={[0, 1.05, 0]} castShadow>
          <boxGeometry args={[3.2, 2.1, 0.06]} />
          <meshStandardMaterial color="#2b2422" roughness={0.45} metalness={0.4} />
        </mesh>
        <mesh position={[0, 1.05, 0.035]}>
          <planeGeometry args={[3.0, 1.875]} />
          <meshBasicMaterial map={screen.texture} toneMapped={false} />
        </mesh>
      </group>
    </group>
  )
}

function Desk() {
  return (
    <>
      <mesh position={[0, -0.2, -0.5]} receiveShadow>
        <boxGeometry args={[18, 0.4, 9]} />
        <meshStandardMaterial color="#2a1712" roughness={0.85} />
      </mesh>
      {/* mug */}
      <group position={[3.3, 0, -1.3]}>
        <mesh position={[0, 0.48, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.42, 0.38, 0.96, 32]} />
          <meshStandardMaterial color="#e8d9d3" roughness={0.5} />
        </mesh>
        <mesh position={[0.46, 0.5, 0]} castShadow>
          <torusGeometry args={[0.22, 0.06, 12, 24]} />
          <meshStandardMaterial color="#e8d9d3" roughness={0.5} />
        </mesh>
      </group>
      {/* sticky notes */}
      <mesh position={[2.6, 0.02, 0.1]} rotation={[0, 0.35, 0]} receiveShadow>
        <boxGeometry args={[0.7, 0.04, 0.7]} />
        <meshStandardMaterial color="#ff9e95" roughness={0.9} />
      </mesh>
    </>
  )
}

function World({ cueRef, schedules, still }: Omit<StageSceneProps, 'active'>) {
  const control = useRef<MoltyControl>({ action: null, actionStartedAt: 0, gait: null })
  const lastAction = useRef<string | null>(null)
  const mood = useRef<Mood>('happy')
  const laptop = useRef<LaptopState>('review')
  const ambient = useRef<AmbientLight>(null)
  const key = useRef<DirectionalLight>(null)
  const wall = useRef<MeshStandardMaterial>(null)
  const glass = useRef<MeshBasicMaterial>(null)
  const target = useMemo(() => ({ room: new Color(), window: new Color(), key: new Color(), keyPosition: new Vector3() }), [])

  useFrame((state, rawDt) => {
    const { clock, camera, scene, size } = state
    const dt = Math.min(rawDt, 1 / 20)
    const cue = cueRef.current
    const scenario = SCENARIOS[cue.index]
    const schedule = schedules[cue.index]
    const t = (cue.pausedAt ?? performance.now()) - cue.startedAt

    // Body: run whichever action the timeline says is live, from the right offset.
    // Re-anchored whenever the action or the cue changes (a resume shifts startedAt).
    const action = actionAt(schedule, t)
    const actionKey = action ? `${cue.index}:${cue.startedAt}:${action.at}` : null
    if (actionKey !== lastAction.current) {
      lastAction.current = actionKey
      control.current = action
        ? { action: action.name, actionStartedAt: clock.getElapsedTime() - (t - action.at) / 1000, gait: null }
        : { action: null, actionStartedAt: 0, gait: null }
    }
    mood.current = scenario.mood
    laptop.current = phaseAt(schedule, t) === 'you' ? scenario.laptop[0] : scenario.laptop[1]

    // Room: ease toward this scene's time of day.
    const preset = LIGHTING[scenario.light]
    const k = 1 - Math.exp(-dt * LIGHT_RATE)
    target.room.set(preset.room)
    target.window.set(preset.window).multiplyScalar(preset.windowGlow)
    target.key.set(preset.key)
    target.keyPosition.set(...preset.keyPosition)
    if (scene.background instanceof Color) scene.background.lerp(target.room, k)
    if (scene.fog && 'color' in scene.fog) scene.fog.color.lerp(target.room, k)
    wall.current?.color.lerp(target.room, k)
    glass.current?.color.lerp(target.window, k)
    if (key.current) {
      key.current.color.lerp(target.key, k)
      key.current.intensity += (preset.keyIntensity - key.current.intensity) * k
      key.current.position.lerp(target.keyPosition, k)
    }
    if (ambient.current) ambient.current.intensity += (preset.ambient - ambient.current.intensity) * k

    // Camera: pull back on tall screens, drift slightly unless motion is reduced.
    const framing = size.width / size.height < 1.2 ? CAMERA_TALL : CAMERA_WIDE
    const sway = still ? 0 : Math.sin(clock.getElapsedTime() * SWAY.speed) * SWAY.amount
    camera.position.set(framing.x + sway, framing.y, framing.z)
    camera.lookAt(framing.lookAt)
  })

  return (
    <>
      <ambientLight ref={ambient} intensity={0.5} />
      <directionalLight ref={key} position={[-5, 6, 2]} intensity={2.4} castShadow shadow-mapSize={[1024, 1024]} shadow-bias={-0.0004}>
        <orthographicCamera attach="shadow-camera" args={[-6, 6, 6, -6, 0.5, 24]} />
      </directionalLight>
      {/* brand rim light from behind, so the robot separates from the room */}
      <directionalLight position={[3, 2.5, -4]} intensity={0.8} color="#ff5b59" />

      <mesh position={[0, 5, -5]} receiveShadow>
        <planeGeometry args={[40, 16]} />
        <meshStandardMaterial ref={wall} color="#1f110d" roughness={1} />
      </mesh>
      <group position={[3.2, 1.75, -4.95]}>
        <mesh>
          <planeGeometry args={[5.5, 2.2]} />
          <meshBasicMaterial ref={glass} color="#6b5444" toneMapped={false} />
        </mesh>
        <mesh position={[0, 0, 0.02]}>
          <boxGeometry args={[0.1, 2.2, 0.04]} />
          <meshStandardMaterial color="#1a0e0b" />
        </mesh>
        <mesh position={[0, 0, 0.02]}>
          <boxGeometry args={[5.5, 0.1, 0.04]} />
          <meshStandardMaterial color="#1a0e0b" />
        </mesh>
      </group>

      <Desk />
      <Laptop stateRef={laptop} />
      <group position={[0.9, 0, 1.1]} rotation={[0, -0.3, 0]}>
        <Suspense fallback={null}>
          <Molty control={control} mood={mood} />
        </Suspense>
      </group>
    </>
  )
}

export default function StageScene({ active, ...rest }: StageSceneProps) {
  return (
    <Canvas
      shadows
      frameloop={active ? 'always' : 'demand'}
      dpr={[1, 1.75]}
      camera={{ position: [CAMERA_WIDE.x, CAMERA_WIDE.y, CAMERA_WIDE.z], fov: 34 }}
      gl={{ antialias: true }}
      role="img"
      aria-label="Molty on a desk next to a laptop, acting out the scene described in the captions"
    >
      <color attach="background" args={['#1f110d']} />
      <fog attach="fog" args={['#1f110d', 14, 30]} />
      <World {...rest} />
    </Canvas>
  )
}
