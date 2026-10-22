import { describe, expect, it } from 'vitest'
import { STAGES, cameraAt, liftAt, partPhase, stageIndexAt, stageTarget, turnAt } from '../timeline'

describe('stageIndexAt', () => {
  it('starts assembled and ends on the tray', () => {
    expect(STAGES[stageIndexAt(0)].id).toBe('whole')
    expect(STAGES[stageIndexAt(1)].id).toBe('tray')
  })

  it('names the stage whose window the progress is in', () => {
    for (const [i, stage] of STAGES.entries()) {
      expect(stageIndexAt((stage.from + stage.to) / 2)).toBe(i)
    }
  })

  it('holds the previous stage in the gap before the next one starts', () => {
    const core = STAGES.findIndex((s) => s.id === 'core')
    expect(stageIndexAt(STAGES[core].to + 0.001)).toBe(core)
  })

  it('clamps progress outside 0..1', () => {
    expect(stageIndexAt(-0.5)).toBe(0)
    expect(stageIndexAt(3)).toBe(STAGES.length - 1)
  })
})

describe('stage windows', () => {
  it('run in order without overlapping', () => {
    for (let i = 1; i < STAGES.length; i++) {
      expect(STAGES[i].from).toBeGreaterThanOrEqual(STAGES[i - 1].to)
      expect(STAGES[i].to).toBeGreaterThan(STAGES[i].from)
    }
    expect(STAGES.at(-1)!.to).toBeLessThanOrEqual(1)
  })

  it('jump targets land where each stage is finished', () => {
    expect(stageTarget(0)).toBe(0)
    for (let i = 1; i < STAGES.length; i++) {
      expect(stageIndexAt(stageTarget(i))).toBe(i)
      expect(partPhase(STAGES[i].id, 1, 1, stageTarget(i))).toBe(1)
    }
  })
})

describe('partPhase', () => {
  const legs = STAGES.find((s) => s.id === 'legs')!

  it('is 0 before the stage and 1 after it', () => {
    expect(partPhase('legs', 0, 4, legs.from - 0.01)).toBe(0)
    expect(partPhase('legs', 3, 4, legs.to + 0.01)).toBe(1)
  })

  it('staggers later parts behind earlier ones', () => {
    const mid = (legs.from + legs.to) / 2
    expect(partPhase('legs', 0, 4, mid)).toBeGreaterThan(partPhase('legs', 3, 4, mid))
  })

  it('never decreases as progress grows', () => {
    let last = 0
    for (let p = 0; p <= 1; p += 0.01) {
      const now = partPhase('core', 2, 5, p)
      expect(now).toBeGreaterThanOrEqual(last)
      last = now
    }
  })
})

describe('turnAt / liftAt / cameraAt', () => {
  it('ends square to the camera with everything on the mat', () => {
    expect(turnAt(1)).toBeCloseTo(0)
    expect(liftAt(1)).toBeCloseTo(0)
    expect(liftAt(0)).toBeCloseTo(0)
  })

  it('lifts the exploded assembly off the mat mid-teardown', () => {
    const core = STAGES.find((s) => s.id === 'core')!
    expect(liftAt(core.to)).toBeGreaterThan(0)
  })

  it('looks down on the tray from higher than on the assembled robot', () => {
    expect(cameraAt(1).elevation).toBeGreaterThan(cameraAt(0).elevation)
    expect(cameraAt(1).distance).toBeGreaterThan(cameraAt(0).distance)
  })

  it('moves the camera continuously', () => {
    for (let p = 0; p < 1; p += 0.01) {
      const a = cameraAt(p)
      const b = cameraAt(p + 0.01)
      expect(Math.abs(a.distance - b.distance)).toBeLessThan(0.3)
      expect(Math.abs(a.elevation - b.elevation)).toBeLessThan(0.1)
    }
  })
})
