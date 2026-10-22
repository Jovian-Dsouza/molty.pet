/**
 * When things happen inside one stage scene. Pure functions over milliseconds
 * since the scene started, shared by the captions, the audio, and the 3D robot
 * so all three stay in step without talking to each other.
 */

import { ACTIONS, motionDuration, type ActionName } from '../robot/motions'

/** Pause between your request and Molty's reply. */
export const GAP_MS = 450
/** Time for the servos to return to stand after an action's last frame. */
export const SETTLE_MS = 400
/** How long a finished scene stays on screen before the next one. */
export const HOLD_MS = 1800

export interface ClipTiming {
  youMs: number
  moltyMs: number
}

export interface TimedAction {
  name: ActionName
  /** Start, in ms since the scene began. */
  at: number
}

export interface SceneSchedule {
  /** When Molty starts speaking and moving. */
  moltyAt: number
  moltyEndsAt: number
  actions: readonly TimedAction[]
  actionsEndAt: number
  total: number
}

export type Phase = 'you' | 'molty' | 'hold' | 'done'

export function sceneSchedule(scene: { actions: readonly ActionName[] }, timing: ClipTiming): SceneSchedule {
  const moltyAt = timing.youMs > 0 ? timing.youMs + GAP_MS : 0
  let at = moltyAt
  const actions = scene.actions.map((name): TimedAction => {
    const timed = { name, at }
    at += motionDuration(ACTIONS[name]) + SETTLE_MS
    return timed
  })
  const moltyEndsAt = moltyAt + timing.moltyMs
  return {
    moltyAt,
    moltyEndsAt,
    actions,
    actionsEndAt: at,
    total: Math.max(moltyEndsAt, at) + HOLD_MS,
  }
}

export function phaseAt(schedule: SceneSchedule, tMs: number): Phase {
  if (tMs < schedule.moltyAt) return 'you'
  if (tMs < schedule.moltyEndsAt) return 'molty'
  if (tMs < schedule.total) return 'hold'
  return 'done'
}

/** The action running at `tMs`, or null while Molty stands. */
export function actionAt(schedule: SceneSchedule, tMs: number): TimedAction | null {
  if (tMs >= schedule.actionsEndAt) return null
  let current: TimedAction | null = null
  for (const action of schedule.actions) {
    if (action.at <= tMs) current = action
  }
  return current
}
