import { describe, expect, it } from 'vitest'
import { layoutTray, type TrayItem } from '../tray'

const item = (node: string, x: number, y: number, z: number): TrayItem => ({ node, size: [x, y, z] })

describe('layoutTray', () => {
  const rows = [
    { nodes: ['big', 'small'], gap: 10 },
    { nodes: ['s1', 's2', 's3'], gap: 2 },
  ]
  const items = new Map(
    [item('big', 40, 20, 60), item('small', 10, 5, 10), item('s1', 4, 4, 4), item('s2', 4, 4, 4), item('s3', 4, 4, 4)].map((i) => [
      i.node,
      i,
    ]),
  )
  const spots = layoutTray(items, rows, { rowGap: 12, floorY: -30 })

  it('rests every part on the floor', () => {
    expect(spots.get('big')![1]).toBe(-30 + 10)
    expect(spots.get('s1')![1]).toBe(-30 + 2)
  })

  it('lays a row out left to right (CAD +Z) with its gap', () => {
    const big = spots.get('big')!
    const small = spots.get('small')!
    expect(small[2] - 5 - (big[2] + 30)).toBeCloseTo(10)
  })

  it('centres each row', () => {
    const left = spots.get('s1')![2] - 2
    const right = spots.get('s3')![2] + 2
    expect(left + right).toBeCloseTo(0)
  })

  it('puts later rows nearer the viewer (CAD -X) without overlap', () => {
    const backRowFront = spots.get('big')![0] - 20
    const frontRowBack = spots.get('s1')![0] + 2
    expect(backRowFront - frontRowBack).toBeCloseTo(12)
  })

  it('centres the whole tray front to back', () => {
    const back = spots.get('big')![0] + 20
    const front = spots.get('s1')![0] - 2
    expect(back + front).toBeCloseTo(0)
  })

  it('rejects a row naming a part it was not given', () => {
    expect(() => layoutTray(items, [{ nodes: ['ghost'], gap: 1 }], { rowGap: 1, floorY: 0 })).toThrow(/ghost/)
  })
})
