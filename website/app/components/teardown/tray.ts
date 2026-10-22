/**
 * Knolling: where each part lands on the mat once Molty is fully apart.
 * CAD space (mm, Y up). Rows run left to right along +Z and stack from the
 * back (+X) toward the viewer (−X), the way the camera sees the robot's nose.
 */

import type { Vec3 } from '../robot/servos'

export interface TrayItem {
  node: string
  /** Bounding-box size in CAD space. */
  size: Vec3
}

export interface TrayRow {
  nodes: readonly string[]
  /** Space between neighbours in this row (mm). */
  gap: number
}

export interface TrayOptions {
  /** Space between rows (mm). */
  rowGap: number
  /** Height of the mat (mm). */
  floorY: number
}

/** Bounding-box centre for each part, with the tray centred on the origin in X and Z. */
export function layoutTray(items: ReadonlyMap<string, TrayItem>, rows: readonly TrayRow[], options: TrayOptions): Map<string, Vec3> {
  const sized = rows.map((row) => {
    const parts = row.nodes.map((node) => {
      const item = items.get(node)
      if (!item) throw new Error(`tray row names "${node}", which has no measured size`)
      return item
    })
    const width = parts.reduce((sum, p) => sum + p.size[2], 0) + row.gap * (parts.length - 1)
    const depth = Math.max(...parts.map((p) => p.size[0]))
    return { parts, gap: row.gap, width, depth }
  })

  const total = sized.reduce((sum, r) => sum + r.depth, 0) + options.rowGap * (sized.length - 1)
  const spots = new Map<string, Vec3>()
  let back = total / 2
  for (const row of sized) {
    const x = back - row.depth / 2
    let left = -row.width / 2
    for (const part of row.parts) {
      spots.set(part.node, [x, options.floorY + part.size[1] / 2, left + part.size[2] / 2])
      left += part.size[2] + row.gap
    }
    back -= row.depth + options.rowGap
  }
  return spots
}
