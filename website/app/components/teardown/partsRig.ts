import { Box3, EdgesGeometry, Group, LineBasicMaterial, LineSegments, Mesh, Quaternion, Vector3, type Object3D } from 'three'
import { BODY_CENTER, type Vec3 } from '../robot/servos'
import { createOledScreen, type OledScreen } from '../robot/oledScreen'
import { PARTS, TRAY_ROWS, UNSCREW, nearestHost, type PartSpec } from './parts'
import { layoutTray, type TrayItem } from './tray'
import { liftAt, partPhase, turnAt } from './timeline'

/** Scene units per millimetre (1 unit = 10 cm), as in Molty.tsx. */
export const SCALE = 0.01
/** The mat: the lowest point of the feet in the CAD stand pose (mm). */
const MAT_Y = -31.8
/** How high a part arcs on its way to the tray (mm). */
const HOP_MM = 28
/** Feature lines show creases sharper than this (degrees). */
const EDGE_ANGLE = 32

interface RigPart {
  spec: PartSpec
  /** Sits at the part's assembled centre; moved and turned every frame. */
  pivot: Group
  center: Vector3
  explode: Vector3
  /** Screws ride with the part they are driven into until they back out. */
  host: RigPart | null
  /** Screws: head-out unit axis from the GLB extras. */
  axis: Vector3 | null
  tray: Vector3
  order: number
  count: number
  trayOrder: number
}

export interface PartsRig {
  /** Add to the scene; turns about the body centre over the mat. */
  root: Group
  pivots: ReadonlyMap<string, Group>
  edges: LineBasicMaterial
  screen: OledScreen
  /** Poses every part for a scroll progress (0 → 1). */
  pose: (progress: number) => void
  dispose: () => void
}

function measure(object: Object3D): Box3 {
  const box = new Box3()
  object.traverse((o) => {
    if (!(o instanceof Mesh)) return
    o.geometry.computeBoundingBox()
    if (o.geometry.boundingBox) box.union(o.geometry.boundingBox)
  })
  return box
}

function readAxis(node: Object3D): Vector3 | null {
  const axis: unknown = node.userData.axis
  if (!Array.isArray(axis) || axis.length !== 3 || !axis.every((n) => typeof n === 'number')) return null
  return new Vector3(axis[0], axis[1], axis[2]).normalize()
}

/** Splits the loose-parts GLB into pivots, measures them, and plans the tray. */
export function buildPartsRig(scene: Group): PartsRig {
  const root = new Group()
  root.scale.setScalar(SCALE)
  const lift = new Group()
  root.add(lift)

  const edges = new LineBasicMaterial({ color: '#ff9e95', transparent: true, opacity: 0, depthWrite: false })
  const edgeGeometries: EdgesGeometry[] = []
  const screen = createOledScreen()
  const trayItems = new Map<string, TrayItem>()

  const parts = PARTS.map((spec): RigPart => {
    const node = scene.getObjectByName(spec.node)
    if (!node) throw new Error(`molty-parts.glb is missing node "${spec.node}"`)
    const copy = node.clone(true)
    copy.traverse((o) => {
      if (!(o instanceof Mesh)) return
      o.geometry.computeVertexNormals()
      if (spec.group === 'screw') return
      const geometry = new EdgesGeometry(o.geometry, EDGE_ANGLE)
      edgeGeometries.push(geometry)
      o.add(new LineSegments(geometry, edges))
    })
    const box = measure(copy)
    const center = box.getCenter(new Vector3())
    const size = box.getSize(new Vector3())
    trayItems.set(spec.node, { node: spec.node, size: [size.x, size.y, size.z] })

    const holder = new Group()
    holder.position.copy(center).negate()
    holder.add(copy)
    if (spec.node === 'oled') holder.add(screen.mesh)
    const pivot = new Group()
    pivot.name = spec.node
    pivot.position.copy(center)
    pivot.add(holder)
    lift.add(pivot)

    const sameStage = PARTS.filter((p) => p.stage === spec.stage)
    return {
      spec,
      pivot,
      center,
      explode: new Vector3(...spec.explode),
      host: null,
      axis: spec.group === 'screw' ? readAxis(node) : null,
      tray: new Vector3(),
      order: sameStage.indexOf(spec),
      count: sameStage.length,
      trayOrder: 0,
    }
  })

  const byNode = new Map(parts.map((p) => [p.spec.node, p]))
  const hosts = parts
    .filter((p) => p.spec.group !== 'screw')
    .map((p) => ({ node: p.spec.node, center: [p.center.x, p.center.y, p.center.z] as Vec3 }))
  for (const part of parts) {
    if (part.spec.group === 'screw') part.host = byNode.get(nearestHost([part.center.x, part.center.y, part.center.z], hosts)) ?? null
  }

  // Tray spots are centred under the body centre, which the root turns about.
  const spots = layoutTray(trayItems, TRAY_ROWS, { rowGap: 14, floorY: MAT_Y })
  const trayOrder = TRAY_ROWS.flatMap((row) => row.nodes)
  for (const part of parts) {
    const [x, y, z] = spots.get(part.spec.node)!
    part.tray.set(x + BODY_CENTER[0], y, z + BODY_CENTER[2])
    part.trayOrder = trayOrder.indexOf(part.spec.node)
  }

  const exploded = new Vector3()
  const spin = new Quaternion()
  const pose = (progress: number) => {
    root.rotation.y = Math.PI / 2 + turnAt(progress) // CAD nose (−X) faces the camera (+Z)
    lift.position.set(-BODY_CENTER[0], -MAT_Y + liftAt(progress), -BODY_CENTER[2])

    for (const part of parts) {
      const e = partPhase(part.spec.stage, part.order, part.count, progress)
      const t = partPhase('tray', part.trayOrder, trayOrder.length, progress)
      exploded.copy(part.center)
      if (part.axis && part.host) {
        const carried = partPhase(part.host.spec.stage, part.host.order, part.host.count, progress)
        exploded.addScaledVector(part.host.explode, carried).addScaledVector(part.axis, UNSCREW.mm * e)
        part.pivot.quaternion.copy(spin.setFromAxisAngle(part.axis, e * UNSCREW.turns * Math.PI * 2))
      } else {
        exploded.addScaledVector(part.explode, e)
      }
      part.pivot.position.lerpVectors(exploded, part.tray, t)
      part.pivot.position.y += Math.sin(Math.PI * t) * HOP_MM
    }
  }

  return {
    root,
    pivots: new Map(parts.map((p) => [p.spec.node, p.pivot])),
    edges,
    screen,
    pose,
    dispose: () => {
      edges.dispose()
      for (const g of edgeGeometries) g.dispose()
      screen.dispose()
    },
  }
}
