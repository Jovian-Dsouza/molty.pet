import { describe, expect, it } from 'vitest'
import { ACTIONS, motionDuration } from '../../robot/motions'
import { GAP_MS, HOLD_MS, SETTLE_MS, actionAt, phaseAt, sceneSchedule } from '../timeline'

const wave = motionDuration(ACTIONS.wave) + SETTLE_MS
const dance = motionDuration(ACTIONS.dance) + SETTLE_MS

describe('sceneSchedule', () => {
  it('starts Molty after your line and a short gap', () => {
    const s = sceneSchedule({ actions: ['wave'] }, { youMs: 2000, moltyMs: 3000 })
    expect(s.moltyAt).toBe(2000 + GAP_MS)
  })

  it('starts Molty immediately when it speaks up on its own', () => {
    const s = sceneSchedule({ actions: ['wave'] }, { youMs: 0, moltyMs: 3000 })
    expect(s.moltyAt).toBe(0)
  })

  it('plays actions back to back from the moment Molty replies', () => {
    const s = sceneSchedule({ actions: ['dance', 'wave'] }, { youMs: 0, moltyMs: 1000 })
    expect(s.actions).toEqual([
      { name: 'dance', at: 0 },
      { name: 'wave', at: dance },
    ])
  })

  it('lasts until both the speech and the motion finish, then holds', () => {
    const shortLine = sceneSchedule({ actions: ['wave'] }, { youMs: 1000, moltyMs: 500 })
    expect(shortLine.total).toBe(1000 + GAP_MS + wave + HOLD_MS)

    const longLine = sceneSchedule({ actions: ['wave'] }, { youMs: 1000, moltyMs: 9000 })
    expect(longLine.total).toBe(1000 + GAP_MS + 9000 + HOLD_MS)
  })
})

describe('phaseAt', () => {
  const s = sceneSchedule({ actions: ['wave'] }, { youMs: 2000, moltyMs: 3000 })

  it('walks through you → molty → hold → done', () => {
    expect(phaseAt(s, 0)).toBe('you')
    expect(phaseAt(s, s.moltyAt - 1)).toBe('you')
    expect(phaseAt(s, s.moltyAt)).toBe('molty')
    expect(phaseAt(s, s.moltyAt + 3000)).toBe('hold')
    expect(phaseAt(s, s.total)).toBe('done')
  })

  it('skips straight to molty when there is no request', () => {
    const solo = sceneSchedule({ actions: ['wave'] }, { youMs: 0, moltyMs: 3000 })
    expect(phaseAt(solo, 0)).toBe('molty')
  })
})

describe('actionAt', () => {
  const s = sceneSchedule({ actions: ['dance', 'wave'] }, { youMs: 1000, moltyMs: 2000 })

  it('is idle before Molty replies', () => {
    expect(actionAt(s, 0)).toBeNull()
  })

  it('returns the action running at that moment', () => {
    expect(actionAt(s, s.moltyAt)).toEqual({ name: 'dance', at: s.moltyAt })
    expect(actionAt(s, s.moltyAt + dance)).toEqual({ name: 'wave', at: s.moltyAt + dance })
  })

  it('is idle once every action has finished', () => {
    expect(actionAt(s, s.moltyAt + dance + wave)).toBeNull()
  })
})
