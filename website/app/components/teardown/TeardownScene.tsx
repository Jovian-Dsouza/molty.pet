'use client'

import { Suspense, useEffect, useMemo, useRef, type RefObject } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { ContactShadows, Environment, Grid, Html, Lightformer, useGLTF } from '@react-three/drei'
import { PerspectiveCamera, Vector3, type Group } from 'three'
import type { Mood } from '../robot/face'
import { BOM, PARTS_MODEL_URL, type BomEntry } from './parts'
import { buildPartsRig, SCALE, type PartsRig } from './partsRig'
import { STAGES, cameraAt, stagePhase } from './timeline'

/** Mat colour; matches `--teardown-mat` so the canvas edge disappears. */
const MAT = '#140606'
/** How quickly the scene catches up with the scroll position (1/s). */
const FOLLOW_RATE = 7
/** Subjects sit right of centre on wide screens, leaving the left for copy, */
const WIDE_SHIFT = 0.14
/** and a little high, clear of the caption and scrubber along the bottom. */
const LIFT_SHIFT = 0.06
const LIFT_SHIFT_PORTRAIT = 0.14
/** How much further the camera backs off per unit the screen is taller than wide. */
const PORTRAIT_BACKOFF = 1.9
const BLINK_EVERY_S = 3.4
const BLINK_S = 0.13
const IDLE_SWAY = { amount: 0.05, speed: 0.35 }

const MOODS: Record<(typeof STAGES)[number]['id'], Mood> = {
  whole: 'happy',
  legs: 'focus',
  shell: 'focus',
  core: 'unsure',
  tray: 'sleepy',
}

interface TeardownSceneProps {
  /** Scroll progress, 0 → 1, written outside React. */
  progressRef: RefObject<number>
  stageIndex: number
  /** Render every frame; false freezes the canvas. */
  active: boolean
  /** Hold the camera and idle sway still (prefers-reduced-motion). */
  still: boolean
}

/** Room a label needs beside its anchor, leader included (px); short of it, the label flips to the roomier side. */
const LABEL_ROOM = { wide: 260, narrow: 190 }

function Callout({ entry, rig, visible, compact }: { entry: BomEntry; rig: PartsRig; visible: boolean; compact: boolean }) {
  const anchor = useRef<Group>(null)
  const label = useRef<HTMLDivElement>(null)
  const screen = useMemo(() => new Vector3(), [])
  const pivot = rig.pivots.get(entry.anchor)
  useFrame(({ camera, size }) => {
    if (!pivot || !anchor.current) return
    pivot.getWorldPosition(anchor.current.position)
    const x = (screen.copy(anchor.current.position).project(camera).x + 1) * 0.5 * size.width
    const room = { left: x, right: size.width - x }
    const need = size.width < 640 ? LABEL_ROOM.narrow : LABEL_ROOM.wide
    const other = entry.side === 'right' ? 'left' : 'right'
    const side = room[entry.side] >= need || room[entry.side] >= room[other] ? entry.side : other
    if (label.current && label.current.dataset.side !== side) label.current.dataset.side = side
  })
  return (
    <group ref={anchor}>
      <Html zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}>
        <div ref={label} className="callout" data-side={entry.side} data-visible={visible} data-compact={compact} aria-hidden="true">
          <span className="callout-dot" />
          <svg className="callout-leader" viewBox="0 0 64 40" preserveAspectRatio="none">
            <polyline points="0,40 26,6 64,6" />
          </svg>
          <span className="callout-label">
            <span className="balloon">{entry.item}</span>
            <span className="callout-text">
              <span className="callout-name">{entry.name}</span>
              <span className="callout-job">{entry.job}</span>
              <span className="callout-spec">
                {entry.spec}
                {entry.count > 1 && ` × ${entry.count}`}
              </span>
            </span>
          </span>
        </div>
      </Html>
    </group>
  )
}

function Teardown({ progressRef, stageIndex, still }: Omit<TeardownSceneProps, 'active'>) {
  const { scene } = useGLTF(PARTS_MODEL_URL)
  const rig = useMemo(() => buildPartsRig(scene), [scene])
  // The frame loop mutates three.js objects every frame; reach them through a ref.
  const rigRef = useRef(rig)
  useEffect(() => {
    rigRef.current = rig
    return () => rig.dispose()
  }, [rig])
  /** Progress on screen, easing toward the scroll position; null until the first frame. */
  const shown = useRef<number | null>(null)
  const framed = useRef('')
  const target = useMemo(() => new Vector3(), [])

  useFrame(({ clock, camera, size }, rawDt) => {
    const rig = rigRef.current
    const dt = Math.min(rawDt, 1 / 20)
    const goal = progressRef.current
    const from = shown.current ?? goal
    const p = from + (goal - from) * (1 - Math.exp(-dt * FOLLOW_RATE))
    shown.current = p
    rig.pose(p)

    const t = clock.getElapsedTime()
    if (!still) rig.root.rotation.y += Math.sin(t * IDLE_SWAY.speed) * IDLE_SWAY.amount * (1 - stagePhase('tray', p))
    rig.edges.opacity = 0.5 * stagePhase('legs', p) * (1 - 0.5 * stagePhase('tray', p))
    rig.screen.show(t % BLINK_EVERY_S < BLINK_S ? 'blink' : 'open', MOODS[STAGES[stageIndex].id])

    // Frame the subject off-centre on wide screens, leaving the left for copy.
    const aspect = size.width / size.height
    const key = `${size.width}x${size.height}`
    if (framed.current !== key && camera instanceof PerspectiveCamera) {
      framed.current = key
      const shift = aspect > 1.25 ? -size.width * WIDE_SHIFT : 0
      const lift = size.height * (aspect < 1 ? LIFT_SHIFT_PORTRAIT : LIFT_SHIFT)
      camera.setViewOffset(size.width, size.height, shift, lift, size.width, size.height)
    }

    // Portrait screens back off further to fit the robot's (and the tray's) width.
    const pose = cameraAt(p)
    const distance = pose.distance * (aspect < 1 ? 1 + (1 - aspect) * PORTRAIT_BACKOFF : 1)
    target.set(0, pose.targetY, 0)
    camera.position.set(0, target.y + Math.sin(pose.elevation) * distance, Math.cos(pose.elevation) * distance)
    camera.lookAt(target)
  })

  const stage = STAGES[stageIndex].id
  return (
    <>
      <primitive object={rig.root} />
      {BOM.map((entry) => (
        <Callout key={entry.item} entry={entry} rig={rig} visible={stage === 'tray' || entry.stage === stage} compact={stage === 'tray'} />
      ))}
    </>
  )
}

function Lights() {
  return (
    <>
      <ambientLight intensity={0.35} />
      <directionalLight position={[-3, 6, 4]} intensity={2.2} color="#fff1ea" />
      <directionalLight position={[4, 2.5, 3]} intensity={0.55} color="#ffd9cf" />
      {/* brand rim from behind, so red parts separate from the mat */}
      <directionalLight position={[0, 3, -5]} intensity={1.6} color="#ff5b59" />
      <Environment resolution={128} frames={1}>
        <Lightformer form="rect" intensity={2.4} position={[0, 5, 1]} scale={[8, 2, 1]} rotation-x={Math.PI / 2} />
        <Lightformer form="rect" intensity={1.2} position={[-5, 2, 2]} scale={[3, 4, 1]} rotation-y={Math.PI / 2} />
        <Lightformer form="rect" intensity={1.4} color="#ff5b59" position={[5, 1, -3]} scale={[3, 2, 1]} rotation-y={-Math.PI / 2} />
      </Environment>
    </>
  )
}

export default function TeardownScene({ active, ...rest }: TeardownSceneProps) {
  return (
    <Canvas
      frameloop={active ? 'always' : 'never'}
      dpr={[1, 1.75]}
      camera={{ position: [0, 1.2, 3.1], fov: 30, near: 0.05, far: 40 }}
      gl={{ antialias: true }}
      role="img"
      aria-label="Molty's 3D model coming apart into its parts as you scroll, then laid out on a cutting mat"
    >
      <color attach="background" args={[MAT]} />
      <fog attach="fog" args={[MAT, 12, 34]} />
      <Lights />
      {/* A true-scale cutting mat: 10 mm cells, 50 mm sections. */}
      <Grid
        position={[0, 0.0005, 0]}
        infiniteGrid
        cellSize={10 * SCALE}
        cellThickness={0.6}
        cellColor="#3d1512"
        sectionSize={50 * SCALE}
        sectionThickness={1}
        sectionColor="#6a211c"
        fadeDistance={10}
        fadeStrength={1.6}
      />
      <ContactShadows position={[0, 0.001, 0]} scale={7} resolution={512} blur={2.4} far={2} opacity={0.6} frames={Infinity} />
      <Suspense fallback={null}>
        <Teardown {...rest} />
      </Suspense>
    </Canvas>
  )
}
