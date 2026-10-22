"""Export Molty as loose parts for the teardown section.

Same STEP and coordinates as export_robot.py (millimetres, Y up, nose toward
-X, left toward +Z), but one GLB node per physical part instead of per rigid
body: covers, frame, servos, horns, legs, display, battery and every screw.

Molty swaps the Sesame ESP32 board and rocker switch for a Raspberry Pi Zero
2 W on its back and a PCA9685 servo driver inside, so those two boards are
modelled here to their published sizes instead of read from the STEP.

    python scripts/cad/export_parts.py [path/to/Sesame-ESP32-v122.step]

Writes public/models/molty-parts.glb. Node names must match
app/components/teardown/parts.ts.
"""

from __future__ import annotations

import sys
from pathlib import Path

import build123d as bd
from cadgen import read_scene
from OCP.BRepAdaptor import BRepAdaptor_Surface
from OCP.GeomAbs import GeomAbs_Cylinder

from export_robot import DEFAULT_STEP, MATERIALS, TOP_COVER, GlbWriter, load, tessellate

OUT = Path(__file__).resolve().parents[2] / "public/models/molty-parts.glb"

PART_MATERIALS = {
    **MATERIALS,
    "pcb_green": ([0.04, 0.3, 0.17, 1.0], 0.0, 0.55),  # Raspberry Pi solder mask
    "pcb_blue": ([0.05, 0.13, 0.45, 1.0], 0.0, 0.55),  # PCA9685 breakout
    "metal": ([0.78, 0.78, 0.8, 1.0], 1.0, 0.32),  # screws, ports, header pins
    "black": ([0.025, 0.025, 0.03, 1.0], 0.0, 0.45),  # headers, chips, heatsink
    "cell": ([0.11, 0.14, 0.18, 1.0], 0.0, 0.4),  # battery shrink wrap
}

# Leg and servo node names follow the servo channel they belong to (servos.ts).
STEP_PARTS: dict[str, dict[str, list[str]]] = {
    "shell_top": {"printed": [TOP_COVER]},
    "frame": {"printed": ["#o1.54"]},
    "shell_bottom": {"printed": ["#o1.53"]},
    "oled": {"oled": ["#o1.11.1"], "glass": ["#o1.11.4", "#o1.11.9"]},
    "battery": {"cell": ["#o1.56"]},
    "servo_l1": {"servo": ["#o1.1.1"]},
    "servo_r1": {"servo": ["#o1.2.1"]},
    "servo_r2": {"servo": ["#o1.3.1"]},
    "servo_l2": {"servo": ["#o1.4.1"]},
    "servo_l3": {"servo": ["#o1.14"]},
    "servo_r3": {"servo": ["#o1.15"]},
    "servo_r4": {"servo": ["#o1.7.1"]},
    "servo_l4": {"servo": ["#o1.10.1"]},
    "horn_l1": {"horn": ["#o1.1.2"]},
    "horn_r1": {"horn": ["#o1.2.2"]},
    "horn_r2": {"horn": ["#o1.3.2"]},
    "horn_l2": {"horn": ["#o1.4.2"]},
    "horn_r4": {"horn": ["#o1.7.2"]},
    "horn_l4": {"horn": ["#o1.10.2"]},
    "femur_l1": {"printed": ["#o1.12"]},
    "femur_r1": {"printed": ["#o1.16"]},
    "femur_r2": {"printed": ["#o1.5"]},
    "femur_l2": {"printed": ["#o1.8"]},
    "foot_l3": {"printed": ["#o1.13"]},
    "foot_r3": {"printed": ["#o1.17"]},
    "foot_r4": {"printed": ["#o1.6"]},
    "foot_l4": {"printed": ["#o1.9"]},
}
# #o1.20–#o1.35 flat-head screws, #o1.36–#o1.51 pan-head screws.
SCREW_REFS = [f"#o1.{i}" for i in range(20, 52)]

# Boards sit centred over the hips, long side along the body (CAD X).
BOARD_CENTER_X = 26.0
BOARD_CENTER_Z = 2.4
PI_BOTTOM_Y = 61.5  # on standoffs just above the top cover (max Y 60.2)
PCA_BOTTOM_Y = 23.0  # in the bay the Sesame ESP32 board used
PCB_MM = 1.4
PITCH = 2.54


def box(x: float, y: float, z: float, at: tuple[float, float, float]) -> bd.Shape:
    """An axis-aligned box whose minimum corner is `at`."""
    return bd.Pos(at[0] + x / 2, at[1] + y / 2, at[2] + z / 2) * bd.Box(x, y, z)


def pcb(length: float, width: float, bottom: float, holes: float) -> bd.Shape:
    x0 = BOARD_CENTER_X - length / 2
    z0 = BOARD_CENTER_Z - width / 2
    board = box(length, PCB_MM, width, (x0, bottom, z0))
    board = bd.fillet(board.edges().filter_by(bd.Axis.Y), radius=3.0)
    for dx in (holes, length - holes):
        for dz in (holes, width - holes):
            board -= bd.Pos(x0 + dx, bottom + PCB_MM / 2, z0 + dz) * bd.Rot(90, 0, 0) * bd.Cylinder(1.375, PCB_MM * 2)
    return board


def pi_zero() -> dict[str, list[bd.Shape]]:
    """Raspberry Pi Zero 2 W: 65 × 30 mm, 2×20 header, heatsink on the SoC."""
    length, width = 65.0, 30.0
    x0 = BOARD_CENTER_X - length / 2
    z0 = BOARD_CENTER_Z - width / 2
    top = PI_BOTTOM_Y + PCB_MM
    header_x0 = x0 + (length - 20 * PITCH) / 2
    header_z0 = z0 + width - 1.0 - 2 * PITCH
    pins = [
        box(0.64, 6.0, 0.64, (header_x0 + PITCH * (i + 0.5) - 0.32, top, header_z0 + PITCH * (j + 0.5) - 0.32))
        for i in range(20)
        for j in range(2)
    ]
    fins = [box(14.0, 6.0, 1.0, (x0 + 25.0, top + 1.2, z0 + 7.0 + k * 3.25)) for k in range(5)]
    return {
        "pcb_green": [pcb(length, width, PI_BOTTOM_Y, 3.5)],
        "black": [box(20 * PITCH, 2.5, 2 * PITCH, (header_x0, top, header_z0)), box(14.0, 1.2, 14.0, (x0 + 25.0, top, z0 + 7.0)), *fins],
        "metal": [
            *pins,
            box(11.2, 3.4, 7.6, (x0 + 6.0, top, z0)),  # mini HDMI
            box(8.0, 2.6, 5.6, (x0 + 38.5, top, z0)),  # micro USB, data
            box(8.0, 2.6, 5.6, (x0 + 51.0, top, z0)),  # micro USB, power
            box(11.5, 1.3, 12.0, (x0 - 1.5, top, z0 + 9.0)),  # microSD
        ],
    }


def pca9685() -> dict[str, list[bd.Shape]]:
    """16-channel PCA9685 breakout: 62.5 × 25.4 mm, servo headers in banks of four."""
    length, width = 62.5, 25.4
    x0 = BOARD_CENTER_X - length / 2
    z0 = BOARD_CENTER_Z - width / 2
    top = PCA_BOTTOM_Y + PCB_MM
    banks = [box(4 * PITCH, 8.5, 3 * PITCH, (x0 + 8.0 + b * 12.0, top, z0 + 1.0)) for b in range(4)]
    return {
        "pcb_blue": [pcb(length, width, PCA_BOTTOM_Y, 3.0), box(7.6, 4.0, 10.0, (x0 + 27.5, top, z0 + 14.0))],
        "black": [
            *banks,
            box(7.8, 1.2, 4.4, (x0 + 29.0, top, z0 + 16.0)),  # the PCA9685 chip
            box(2.5, 2.5, 6 * PITCH, (x0 + 1.5, top, z0 + 5.0)),  # input header
            box(2.5, 2.5, 6 * PITCH, (x0 + length - 4.0, top, z0 + 5.0)),  # chain header
        ],
    }


def screw_axis(shape: bd.Shape) -> bd.Vector:
    """Axis of the screw's cylinders, weighted by area (the threads are many tiny faces)."""
    total = bd.Vector(0, 0, 0)
    reference: bd.Vector | None = None
    for face in shape.faces():
        surface = BRepAdaptor_Surface(face.wrapped)
        if surface.GetType() != GeomAbs_Cylinder:
            continue
        d = surface.Cylinder().Axis().Direction()
        axis = bd.Vector(d.X(), d.Y(), d.Z())
        reference = reference or axis
        total += axis * (face.area if axis.dot(reference) > 0 else -face.area)
    if reference is None:
        raise ValueError("screw has no cylindrical faces")
    return total.normalized()


def screw(shape: bd.Shape) -> tuple[bd.Shape, list[float]]:
    """A clean head-and-shank stand-in at the screw's real size, and its head-out axis.

    The vendor models carry thread geometry: thousands of triangles for a 4 mm part.
    """
    axis = screw_axis(shape)
    points = [v.to_tuple() for v in shape.vertices()]
    center = shape.bounding_box().center()
    along = [bd.Vector(p).sub(center).dot(axis) for p in points]
    lo, hi = min(along), max(along)

    def radius_near(end: float) -> float:
        near = [bd.Vector(p) for p, a in zip(points, along) if abs(a - end) < (hi - lo) * 0.25]
        return max((((p - center) - axis * (p - center).dot(axis)).length for p in near), default=0.0)

    if radius_near(lo) > radius_near(hi):
        axis, lo, hi = -axis, -hi, -lo
    head_r = max(radius_near(lo), radius_near(hi))
    head_h = min(1.3, (hi - lo) * 0.35)
    shank = bd.Pos(0, 0, lo + (hi - lo - head_h) / 2) * bd.Cylinder(1.0, hi - lo - head_h)
    head = bd.Pos(0, 0, hi - head_h / 2) * bd.Cylinder(head_r, head_h)
    proxy = bd.Location(bd.Plane(origin=center, z_dir=axis)) * (shank + head)
    return proxy, [round(c, 4) for c in axis.to_tuple()]


def main() -> None:
    step_path = Path(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_STEP
    if not step_path.is_file():
        raise SystemExit(f"STEP not found: {step_path}")
    scene = read_scene(step_path)
    writer = GlbWriter(PART_MATERIALS)

    def add(name: str, groups: dict[str, list[bd.Shape]], simplify: set[str] = frozenset()) -> None:
        meshes = {material: tessellate(shapes, simplify=material in simplify) for material, shapes in groups.items()}
        triangles = sum(idx.size // 3 for _, idx in meshes.values())
        print(f"{name:13} {triangles:7d} triangles")
        writer.add_node(name, meshes)

    for name, materials in STEP_PARTS.items():
        add(name, {m: [load(scene, ref) for ref in refs] for m, refs in materials.items()}, simplify={"servo"})
    add("pi", pi_zero())
    add("pca", pca9685())
    for i, ref in enumerate(SCREW_REFS):
        proxy, axis = screw(load(scene, ref))
        add(f"screw_{i:02d}", {"metal": [proxy]})
        writer.gltf["nodes"][-1]["extras"] = {"axis": axis}  # three.js reads this as userData.axis

    size = writer.write(OUT)
    print(f"wrote {OUT} ({size / 1024:.0f} KiB)")


if __name__ == "__main__":
    main()
