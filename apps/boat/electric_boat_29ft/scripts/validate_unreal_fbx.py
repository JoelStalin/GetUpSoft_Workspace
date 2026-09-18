"""Reimport the Unreal FBX and verify its hull dimensions in Blender units."""

import json
from pathlib import Path

import bpy
from mathutils import Vector


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "exports" / "BOAT_UNREAL_V0.fbx"
OUTPUT = ROOT / "logs" / "unreal_fbx_reimport_validation.json"


bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.context.scene.unit_settings.system = "METRIC"
bpy.context.scene.unit_settings.scale_length = 1.0
bpy.ops.import_scene.fbx(filepath=str(SOURCE), use_custom_normals=True)

hull = bpy.data.objects.get("HULL_MAIN")
if hull is None:
    candidates = [obj for obj in bpy.data.objects if obj.type == "MESH" and "HULL_MAIN" in obj.name.upper()]
    if len(candidates) == 1:
        hull = candidates[0]
    else:
        imported_meshes = sorted(obj.name for obj in bpy.data.objects if obj.type == "MESH")
        raise RuntimeError(f"FBX reimport did not contain an unambiguous HULL_MAIN: {imported_meshes}")

points = [hull.matrix_world @ Vector(corner) for corner in hull.bound_box]
dims = {
    "loa_m": max(p.x for p in points) - min(p.x for p in points),
    "beam_m": max(p.y for p in points) - min(p.y for p in points),
    "height_m": max(p.z for p in points) - min(p.z for p in points),
}
result = {
    "source": str(SOURCE),
    "objects": len(bpy.data.objects),
    "hull_dimensions": dims,
    "loa_pass": abs(dims["loa_m"] - 8.84) <= 0.02,
    "beam_pass": abs(dims["beam_m"] - 2.80) <= 0.05,
}
OUTPUT.write_text(json.dumps(result, indent=2), encoding="utf-8")
if not result["loa_pass"] or not result["beam_pass"]:
    raise RuntimeError(f"FBX scale validation failed: {result}")
print("UNREAL_FBX_REIMPORT_VALIDATION=" + json.dumps(result))
