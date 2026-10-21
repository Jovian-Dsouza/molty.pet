"""Export the Sesame/Molty CAD assembly as a rigged, web-sized GLB.

Reads the upstream Sesame STEP assembly (Apache-2.0,
https://github.com/dorianborian/sesame-robot), groups its occurrences into the
nine rigid bodies that move together (body, 4 femurs, 4 feet), tessellates each
one coarsely, and writes `public/models/molty.glb` with one named node per body
and one primitive per material. Geometry stays in CAD coordinates (millimetres,
Y up, nose toward -X, left toward +Z); `app/components/robot/rig.ts` holds the
matching joint pivots and does the conversion to scene space.

The 0.96" SSD1306 OLED (128 x 64) sits in the top cover's front window; the
face drawn on it lives in `app/components/robot/face.ts`.

Run with an interpreter that has `cadgen` (see the CAD skill requirements):

    python scripts/cad/export_robot.py [path/to/Sesame-ESP32-v122.step]
"""

from __future__ import annotations

import json
import struct
import sys
from pathlib import Path

import build123d as bd
import numpy as np
from cadgen import read_scene

HERE = Path(__file__).resolve().parent
DEFAULT_STEP = HERE.parents[3] / "sesame-robot/hardware/cad/Sesame-ESP32-v122.step"
OUT = HERE.parents[1] / "public/models/molty.glb"

# Chord tolerance in mm and angular tolerance in rad. Coarse on purpose: the
# whole robot renders ~150 px tall, and the file ships to every visitor.
TOLERANCE_MM = 0.6
ANGULAR_TOLERANCE = 0.9

# Vendor servo models carry gears, screws and lettering; only the outer case
# reads at this size. Applied to servo cases only, never to printed parts.
SERVO_MIN_SOLID_MM3 = 100.0
SERVO_MIN_FACE_MM2 = 3.0

TOP_COVER = "#o1.57"

# STEP occurrence refs (Sesame-ESP32-v122) grouped by rigid body and material.
# Hip servo cases sit in the body; each horn turns with the femur it drives.
# Knee servo cases ride in the foot (as on the real robot); their horns bolt to the femur.
BODIES: dict[str, dict[str, list[str]]] = {
    "body": {
        "printed": ["#o1.53", "#o1.54", TOP_COVER],  # bottom cover, internal frame, top cover
        "servo": ["#o1.1.1", "#o1.2.1", "#o1.3.1", "#o1.4.1"],
        "oled": ["#o1.11.1"],  # display PCB
        "glass": ["#o1.11.4", "#o1.11.9"],  # front panel + screen border
    },
    "femur_l1": {"printed": ["#o1.12"], "horn": ["#o1.1.2"]},
    "femur_r1": {"printed": ["#o1.16"], "horn": ["#o1.2.2"]},
    "femur_r2": {"printed": ["#o1.5"], "horn": ["#o1.3.2", "#o1.7.2"]},
    "femur_l2": {"printed": ["#o1.8"], "horn": ["#o1.4.2", "#o1.10.2"]},
    "foot_l3": {"printed": ["#o1.13"], "servo": ["#o1.14"]},
    "foot_r3": {"printed": ["#o1.17"], "servo": ["#o1.15"]},
    "foot_r4": {"printed": ["#o1.6"], "servo": ["#o1.7.1"]},
    "foot_l4": {"printed": ["#o1.9"], "servo": ["#o1.10.1"]},
}

MATERIALS = {
    "printed": ([0.86, 0.11, 0.07, 1.0], 0.0, 0.62),  # red PLA
    "servo": ([0.16, 0.11, 0.09, 1.0], 0.0, 0.35),  # smoky brown servo case
    "horn": ([0.92, 0.91, 0.88, 1.0], 0.0, 0.5),  # white servo horns
    "oled": ([0.05, 0.12, 0.3, 1.0], 0.0, 0.5),  # blue OLED module PCB
    "glass": ([0.015, 0.015, 0.02, 1.0], 0.0, 0.12),  # unlit OLED glass
}


def open_window(cover: bd.Shape) -> bd.Shape:
    """The top cover without its 1.4 mm screen-window insert, so the OLED shows
    through the front opening as on Molty (the insert is a separate small solid)."""
    return max(cover.solids(), key=lambda solid: solid.volume)


def load(scene, ref: str) -> bd.Shape:
    shape = scene.resolve(ref).shape()
    return open_window(shape) if ref == TOP_COVER else shape


def outer_faces(shape: bd.Shape) -> list[bd.Face]:
    """Faces of a vendor servo worth drawing: big solids, non-trivial faces."""
    solids = [s for s in shape.solids() if s.volume >= SERVO_MIN_SOLID_MM3]
    return [f for s in solids for f in s.faces() if f.area >= SERVO_MIN_FACE_MM2]


def tessellate(shapes: list[bd.Shape], simplify: bool = False) -> tuple[np.ndarray, np.ndarray]:
    positions: list[np.ndarray] = []
    indices: list[np.ndarray] = []
    offset = 0
    pieces = [f for s in shapes for f in outer_faces(s)] if simplify else shapes
    for piece in pieces:
        verts, tris = piece.tessellate(TOLERANCE_MM, ANGULAR_TOLERANCE)
        if not tris:
            continue
        positions.append(np.array([[v.X, v.Y, v.Z] for v in verts], dtype=np.float32))
        indices.append(np.array(tris, dtype=np.uint32) + offset)
        offset += len(verts)
    if not positions:
        raise ValueError("group produced no triangles")
    return np.concatenate(positions), np.concatenate(indices).ravel()


class GlbWriter:
    """Minimal glTF 2.0 binary writer: positions + indices, named nodes."""

    def __init__(self) -> None:
        self.buffer = bytearray()
        self.gltf: dict = {
            "asset": {"version": "2.0", "generator": "molty export_robot.py"},
            "scene": 0,
            "scenes": [{"nodes": []}],
            "nodes": [],
            "meshes": [],
            "materials": [],
            "accessors": [],
            "bufferViews": [],
            "buffers": [],
        }
        self.material_index: dict[str, int] = {}
        for name, (color, metal, rough) in MATERIALS.items():
            self.material_index[name] = len(self.gltf["materials"])
            self.gltf["materials"].append(
                {
                    "name": name,
                    "pbrMetallicRoughness": {
                        "baseColorFactor": color,
                        "metallicFactor": metal,
                        "roughnessFactor": rough,
                    },
                }
            )

    def _view(self, data: bytes, target: int) -> int:
        while len(self.buffer) % 4:
            self.buffer.append(0)
        self.gltf["bufferViews"].append(
            {"buffer": 0, "byteOffset": len(self.buffer), "byteLength": len(data), "target": target}
        )
        self.buffer.extend(data)
        return len(self.gltf["bufferViews"]) - 1

    def _accessor(self, **fields) -> int:
        self.gltf["accessors"].append(fields)
        return len(self.gltf["accessors"]) - 1

    def add_node(self, name: str, groups: dict[str, tuple[np.ndarray, np.ndarray]]) -> None:
        primitives = []
        for material, (pos, idx) in groups.items():
            small = pos.shape[0] < 65536
            idx_data = idx.astype(np.uint16 if small else np.uint32)
            pos_view = self._view(pos.tobytes(), 34962)
            idx_view = self._view(idx_data.tobytes(), 34963)
            pos_acc = self._accessor(
                bufferView=pos_view,
                componentType=5126,
                count=int(pos.shape[0]),
                type="VEC3",
                min=pos.min(axis=0).tolist(),
                max=pos.max(axis=0).tolist(),
            )
            idx_acc = self._accessor(
                bufferView=idx_view,
                componentType=5123 if small else 5125,
                count=int(idx.size),
                type="SCALAR",
            )
            primitives.append(
                {
                    "attributes": {"POSITION": pos_acc},
                    "indices": idx_acc,
                    "material": self.material_index[material],
                }
            )
        self.gltf["meshes"].append({"name": name, "primitives": primitives})
        self.gltf["nodes"].append({"name": name, "mesh": len(self.gltf["meshes"]) - 1})
        self.gltf["scenes"][0]["nodes"].append(len(self.gltf["nodes"]) - 1)

    def write(self, path: Path) -> int:
        while len(self.buffer) % 4:
            self.buffer.append(0)
        self.gltf["buffers"] = [{"byteLength": len(self.buffer)}]
        js = json.dumps(self.gltf, separators=(",", ":")).encode()
        js += b" " * (-len(js) % 4)
        total = 12 + 8 + len(js) + 8 + len(self.buffer)
        path.parent.mkdir(parents=True, exist_ok=True)
        with path.open("wb") as f:
            f.write(struct.pack("<III", 0x46546C67, 2, total))
            f.write(struct.pack("<II", len(js), 0x4E4F534A) + js)
            f.write(struct.pack("<II", len(self.buffer), 0x004E4942) + bytes(self.buffer))
        return total


def main() -> None:
    step_path = Path(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_STEP
    if not step_path.is_file():
        raise SystemExit(f"STEP not found: {step_path}")
    scene = read_scene(step_path)
    writer = GlbWriter()
    for body, materials in BODIES.items():
        groups = {
            material: tessellate([load(scene, ref) for ref in refs], simplify=material == "servo")
            for material, refs in materials.items()
        }
        triangles = sum(idx.size // 3 for _, idx in groups.values())
        print(f"{body:10} {triangles:7d} triangles")
        writer.add_node(body, groups)
    size = writer.write(OUT)
    print(f"wrote {OUT} ({size / 1024:.0f} KiB)")


if __name__ == "__main__":
    main()
