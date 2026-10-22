/**
 * Every node in public/models/molty-parts.glb (scripts/cad/export_parts.py):
 * which stage frees it, and where it goes in the exploded view. CAD space:
 * millimetres, Y up, nose toward −X, left toward +Z.
 */

import { TEARDOWN, type BomCopy, type PartGroup, type TeardownStageId } from '@/app/teardown'
import type { Vec3 } from '../robot/servos'
import type { TrayRow } from './tray'

export const PARTS_MODEL_URL = '/models/molty-parts.glb'

export interface PartSpec {
  node: string
  group: PartGroup
  stage: Exclude<TeardownStageId, 'whole'>
  /** Offset from the assembled position at full explode (mm). Screws instead back out along their axis. */
  explode: Vec3
}

/** How far a screw backs out of its hole, and how many turns that takes. */
export const UNSCREW = { mm: 16, turns: 4 }

const R = Math.SQRT1_2
/** Outward diagonal of each leg, keyed by hip servo. Front legs point to −X. */
const LEGS = [
  { hip: 'l1', knee: 'l3', dir: [-R, 0, R] },
  { hip: 'r1', knee: 'r3', dir: [-R, 0, -R] },
  { hip: 'l2', knee: 'l4', dir: [R, 0, R] },
  { hip: 'r2', knee: 'r4', dir: [R, 0, -R] },
] as const

const out = (dir: Vec3, radial: number, up: number): Vec3 => [dir[0] * radial, up, dir[2] * radial]

/** Order within a stage sets the stagger: earlier entries move first. */
export const PARTS: readonly PartSpec[] = [
  // Legs come off foot first, working in toward the hips.
  ...LEGS.map(({ knee, dir }): PartSpec => ({ node: `foot_${knee}`, group: 'leg', stage: 'legs', explode: out(dir, 74, -4) })),
  ...LEGS.map(({ knee, dir }): PartSpec => ({ node: `servo_${knee}`, group: 'servo', stage: 'legs', explode: out(dir, 50, 4) })),
  ...LEGS.filter(({ knee }) => knee.endsWith('4')).map(
    ({ knee, dir }): PartSpec => ({ node: `horn_${knee}`, group: 'horn', stage: 'legs', explode: out(dir, 36, 8) }),
  ),
  ...LEGS.map(({ hip, dir }): PartSpec => ({ node: `femur_${hip}`, group: 'leg', stage: 'legs', explode: out(dir, 26, 10) })),
  ...LEGS.map(({ hip, dir }): PartSpec => ({ node: `horn_${hip}`, group: 'horn', stage: 'legs', explode: out(dir, 8, 18) })),

  // The Pi rides on top of the cover, so it lifts off first.
  { node: 'pi', group: 'brain', stage: 'shell', explode: [0, 70, 0] },
  { node: 'shell_top', group: 'shell', stage: 'shell', explode: [0, 40, 0] },
  { node: 'oled', group: 'face', stage: 'shell', explode: [-46, 18, 0] },

  ...Array.from({ length: 32 }, (_, i): PartSpec => ({
    node: `screw_${String(i).padStart(2, '0')}`,
    group: 'screw',
    stage: 'core',
    explode: [0, 0, 0],
  })),
  ...LEGS.map(({ hip }): PartSpec => ({ node: `servo_${hip}`, group: 'servo', stage: 'core', explode: [0, 6, hip.startsWith('l') ? 40 : -40] })),
  { node: 'pca', group: 'driver', stage: 'core', explode: [0, 28, 0] },
  { node: 'battery', group: 'power', stage: 'core', explode: [0, -36, 0] },
  { node: 'shell_bottom', group: 'shell', stage: 'core', explode: [0, -60, 0] },
  { node: 'frame', group: 'shell', stage: 'core', explode: [0, 0, 0] },
]

export interface BomEntry extends BomCopy {
  /** Balloon number, in teardown order. */
  item: number
  group: PartGroup
  count: number
  /** Part the callout points at. */
  anchor: string
  /** The callout shows while its anchor's stage is on screen (and on the tray). */
  stage: PartSpec['stage']
  /** Which side of the anchor the label sits on screen. */
  side: 'left' | 'right'
}

const CALLOUTS: readonly { group: PartGroup; anchor: string; side: BomEntry['side'] }[] = [
  { group: 'servo', anchor: 'servo_l3', side: 'left' },
  { group: 'leg', anchor: 'foot_r3', side: 'left' },
  { group: 'horn', anchor: 'horn_r1', side: 'right' },
  { group: 'shell', anchor: 'shell_top', side: 'right' },
  { group: 'face', anchor: 'oled', side: 'left' },
  { group: 'brain', anchor: 'pi', side: 'left' },
  { group: 'driver', anchor: 'pca', side: 'left' },
  { group: 'power', anchor: 'battery', side: 'right' },
  { group: 'screw', anchor: 'screw_04', side: 'right' },
]

function stageOf(node: string): PartSpec['stage'] {
  const part = PARTS.find((p) => p.node === node)
  if (!part) throw new Error(`callout anchor "${node}" is not a part`)
  return part.stage
}

export const BOM: readonly BomEntry[] = CALLOUTS.map(({ group, anchor, side }, i) => ({
  ...TEARDOWN.bom[group],
  item: i + 1,
  group,
  count: PARTS.filter((p) => p.group === group).length,
  anchor,
  stage: stageOf(anchor),
  side,
}))

const nodesOf = (group: PartGroup): string[] => PARTS.filter((p) => p.group === group).map((p) => p.node)

/** Knolling rows, back to front. */
export const TRAY_ROWS: readonly TrayRow[] = [
  { nodes: ['shell_top', 'frame', 'shell_bottom'], gap: 16 },
  { nodes: ['pi', 'pca', 'oled', 'battery'], gap: 16 },
  { nodes: nodesOf('servo'), gap: 9 },
  { nodes: nodesOf('leg'), gap: 10 },
  { nodes: nodesOf('horn'), gap: 9 },
  { nodes: nodesOf('screw'), gap: 3.5 },
]

/** The candidate whose centre is closest to `point`: the part a screw is driven into. */
export function nearestHost(point: Vec3, hosts: readonly { node: string; center: Vec3 }[]): string {
  let best = hosts[0]?.node
  let bestDistance = Infinity
  for (const { node, center } of hosts) {
    const d = (center[0] - point[0]) ** 2 + (center[1] - point[1]) ** 2 + (center[2] - point[2]) ** 2
    if (d < bestDistance) {
      bestDistance = d
      best = node
    }
  }
  if (best === undefined) throw new Error('nearestHost needs at least one candidate')
  return best
}
