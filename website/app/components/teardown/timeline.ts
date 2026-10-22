/**
 * Scroll progress (0 → 1) to teardown state. Pure functions so the scene, the
 * captions and the scrubber all agree on where Molty is.
 */

import type { TeardownStageId } from '@/app/teardown'

export interface StageWindow {
  id: TeardownStageId
  /** Progress where this stage starts moving parts. */
  from: number
  /** Progress where every part in it has arrived. */
  to: number
}

/** Gaps between windows hold each finished stage for a beat (and its voice line). */
export const STAGES: readonly StageWindow[] = [
  { id: 'whole', from: 0, to: 0.06 },
  { id: 'legs', from: 0.06, to: 0.24 },
  { id: 'shell', from: 0.28, to: 0.44 },
  { id: 'core', from: 0.48, to: 0.64 },
  { id: 'tray', from: 0.7, to: 0.92 },
]

/** Share of a stage's window spent staggering part starts, first to last. */
const STAGGER = 0.5

const clamp01 = (x: number): number => Math.min(1, Math.max(0, x))

export const easeInOut = (t: number): number => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2)

const smooth = (t: number): number => t * t * (3 - 2 * t)

function windowOf(id: TeardownStageId): StageWindow {
  const stage = STAGES.find((s) => s.id === id)
  if (!stage) throw new Error(`unknown teardown stage "${id}"`)
  return stage
}

/** The stage being shown: the last one that has started. */
export function stageIndexAt(progress: number): number {
  const p = clamp01(progress)
  let index = 0
  STAGES.forEach((stage, i) => {
    if (stage.from <= p) index = i
  })
  return index
}

/** Progress to jump to for a stage: the moment it is complete. */
export function stageTarget(index: number): number {
  if (index <= 0) return 0
  if (index >= STAGES.length - 1) return 1
  return STAGES[index].to
}

/** Eased 0 → 1 for the whole of one stage. */
export function stagePhase(id: TeardownStageId, progress: number): number {
  const { from, to } = windowOf(id)
  return easeInOut(clamp01((progress - from) / (to - from)))
}

/** Eased 0 → 1 for one part, staggered by its `order` among `count` parts in the stage. */
export function partPhase(id: TeardownStageId, order: number, count: number, progress: number): number {
  const { from, to } = windowOf(id)
  const span = to - from
  const start = from + span * STAGGER * Math.min(1, order / Math.max(count - 1, 1))
  return easeInOut(clamp01((progress - start) / (span * (1 - STAGGER))))
}

/** Smoothly interpolates keyframes `[progress, ...values]`, holding the ends. */
function keyframes(progress: number, frames: readonly (readonly number[])[]): number[] {
  const p = clamp01(progress)
  const next = frames.findIndex(([at]) => at > p)
  if (next === -1) return frames.at(-1)!.slice(1)
  if (next === 0) return frames[0].slice(1)
  const a = frames[next - 1]
  const b = frames[next]
  const t = smooth((p - a[0]) / (b[0] - a[0]))
  return a.slice(1).map((v, i) => v + (b[i + 1] - v) * t)
}

/** Turntable angle (radians): a three-quarter view that swings round, then squares up for the tray. */
const TURN = [
  [0, -0.55],
  [0.06, -0.55],
  [0.64, 0.45],
  [0.92, 0],
] as const

export function turnAt(progress: number): number {
  return keyframes(progress, TURN)[0]
}

/** Raise (mm) that keeps parts exploded downward off the mat; zero once they land on the tray. */
const LIFT_MM = { legs: 12, core: 28 }

export function liftAt(progress: number): number {
  const up = LIFT_MM.legs * stagePhase('legs', progress) + LIFT_MM.core * stagePhase('core', progress)
  return up * (1 - stagePhase('tray', progress))
}

export interface CameraPose {
  /** From the look-at point, in scene units (1 = 10 cm). */
  distance: number
  /** Above the mat, radians. */
  elevation: number
  /** Look-at height, scene units. */
  targetY: number
}

const CAMERA = [
  [0, 3.4, 0.3, 0.42],
  [0.06, 3.4, 0.3, 0.42],
  [0.26, 4.3, 0.34, 0.6],
  [0.46, 5.0, 0.36, 0.95],
  [0.64, 5.5, 0.38, 1.05],
  [0.7, 5.5, 0.38, 1.05],
  [0.92, 7.6, 1.2, 0],
] as const

export function cameraAt(progress: number): CameraPose {
  const [distance, elevation, targetY] = keyframes(progress, CAMERA)
  return { distance, elevation, targetY }
}
