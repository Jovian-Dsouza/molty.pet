import { describe, expect, it } from 'vitest'
import { TEARDOWN } from '@/app/teardown'
import { BOM, PARTS, TRAY_ROWS, nearestHost } from '../parts'
import { STAGES } from '../timeline'

describe('PARTS', () => {
  it('lists every node in molty-parts.glb once', () => {
    const nodes = PARTS.map((p) => p.node)
    expect(new Set(nodes).size).toBe(nodes.length)
    expect(nodes).toContain('pi')
    expect(nodes).toContain('pca')
  })

  it('matches the part count Molty says out loud', () => {
    expect(PARTS.length).toBe(TEARDOWN.partCount)
    expect(PARTS.filter((p) => p.group === 'screw')).toHaveLength(32)
    expect(PARTS.filter((p) => p.group === 'servo')).toHaveLength(8)
  })

  it('frees every part in a stage that has a scroll window', () => {
    const ids = new Set(STAGES.map((s) => s.id))
    expect(PARTS.every((p) => ids.has(p.stage))).toBe(true)
  })
})

describe('BOM', () => {
  it('numbers items 1..n in teardown order', () => {
    expect(BOM.map((b) => b.item)).toEqual(BOM.map((_, i) => i + 1))
  })

  it('counts each group from the parts list', () => {
    for (const entry of BOM) {
      expect(entry.count).toBe(PARTS.filter((p) => p.group === entry.group).length)
    }
    expect(BOM.reduce((sum, b) => sum + b.count, 0)).toBe(PARTS.length)
  })

  it('anchors each callout on a part of its own group', () => {
    for (const entry of BOM) {
      expect(PARTS.find((p) => p.node === entry.anchor)?.group).toBe(entry.group)
    }
  })
})

describe('TRAY_ROWS', () => {
  it('places every part exactly once', () => {
    const placed = TRAY_ROWS.flatMap((row) => row.nodes)
    expect(placed.sort()).toEqual(PARTS.map((p) => p.node).sort())
  })
})

describe('nearestHost', () => {
  it('picks the closest candidate centre', () => {
    const hosts = [
      { node: 'a', center: [0, 0, 0] as const },
      { node: 'b', center: [10, 0, 0] as const },
    ]
    expect(nearestHost([8, 1, 0], hosts)).toBe('b')
    expect(nearestHost([1, 1, 0], hosts)).toBe('a')
  })
})
