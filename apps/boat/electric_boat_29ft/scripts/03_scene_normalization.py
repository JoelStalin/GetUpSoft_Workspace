import json
import os
from blender_mcp_client import BlenderMCPClient

client = BlenderMCPClient()

norm_script = """
import bpy
import math
import mathutils

# Open fresh original file
bpy.ops.wm.open_mainfile(filepath=r"c:\\Users\\yoeli\\Documents\\GetUpSoft_Workspace\\02_Products\\GetUpSoftBoat\\electric_boat_29ft\\source\\board_original.blend")

# 1. Units setup
bpy.context.scene.unit_settings.system = 'METRIC'
bpy.context.scene.unit_settings.scale_length = 1.0
bpy.context.scene.unit_settings.length_unit = 'METERS'

# 2. Collection 00_ORIGINAL_UNUSED
master_col = bpy.context.scene.collection
col_unused = bpy.data.collections.get("00_ORIGINAL_UNUSED")
if not col_unused:
    col_unused = bpy.data.collections.new("00_ORIGINAL_UNUSED")
    master_col.children.link(col_unused)

env_names = ["Sphere", "Plane.001", "Plane.002", "Plane.003", "stone 1", "stone2", "stone3", "Lamp", "Lamp.001"]
for name in env_names:
    o = bpy.data.objects.get(name)
    if o:
        for parent_col in o.users_collection:
            parent_col.objects.unlink(o)
        col_unused.objects.link(o)

col_unused.hide_viewport = True
col_unused.hide_render = True

# Save backup 01_scene_cleaned.blend
bpy.ops.wm.save_as_mainfile(filepath=r"c:\\Users\\yoeli\\Documents\\GetUpSoft_Workspace\\02_Products\\GetUpSoftBoat\\electric_boat_29ft\\blender\\backups\\01_scene_cleaned.blend")

# 3. Orient & Scale Vessel Intact
hull_main = bpy.data.objects.get("Cube.003")
if hull_main:
    hull_main.name = "HULL_MAIN"

boat_objs = [o for o in bpy.data.objects if o.type in ['MESH', 'CURVE'] and o.name not in env_names]

# Bounding box of original HULL_MAIN
mw_hull = hull_main.matrix_world
hull_corners = [mw_hull @ mathutils.Vector(c) for c in hull_main.bound_box]

min_x, max_x = min(c.x for c in hull_corners), max(c.x for c in hull_corners)
min_y, max_y = min(c.y for c in hull_corners), max(c.y for c in hull_corners)
min_z, max_z = min(c.z for c in hull_corners), max(c.z for c in hull_corners)

orig_width_x = max_x - min_x # 2.6296 m
orig_length_y = max_y - min_y # 11.6734 m
orig_height_z = max_z - min_z # 4.2378 m

center_x = (min_x + max_x) / 2.0
center_y = (min_y + max_y) / 2.0
base_z = min_z

target_loa = 8.84
target_beam = 2.80

scale_factor_loa = target_loa / orig_length_y
scale_factor_beam = target_beam / orig_width_x
scale_factor_z = scale_factor_loa

rot_mat = mathutils.Matrix.Rotation(math.radians(90.0), 4, 'Z')
trans_mat = mathutils.Matrix.Translation(mathutils.Vector((-center_x, -center_y, -base_z)))
scale_mat = mathutils.Matrix.Scale(scale_factor_loa, 4, (1, 0, 0)) * \
            mathutils.Matrix.Scale(scale_factor_beam, 4, (0, 1, 0)) * \
            mathutils.Matrix.Scale(scale_factor_z, 4, (0, 0, 1))

combined_mat = scale_mat @ rot_mat @ trans_mat

for o in boat_objs:
    if hasattr(o, "data") and hasattr(o.data, "transform"):
        o.data.transform(o.matrix_world)
        o.data.transform(combined_mat)
        o.matrix_world = mathutils.Matrix.Identity(4)
        o.location = (0, 0, 0)
        o.rotation_euler = (0, 0, 0)
        o.scale = (1, 1, 1)

bpy.context.view_layer.update()

# Measure final world space bounds
mw_final = hull_main.matrix_world
final_coords = [mw_final @ mathutils.Vector(c) for c in hull_main.bound_box]

final_xs = [c.x for c in final_coords]
final_ys = [c.y for c in final_coords]
final_zs = [c.z for c in final_coords]

final_loa = max(final_xs) - min(final_xs)
final_beam = max(final_ys) - min(final_ys)
final_height = max(final_zs) - min(final_zs)
centerline_y = (min(final_ys) + max(final_ys)) / 2.0

# 4. Create DATUMS (00_DATUM)
col_datum = bpy.data.collections.get("00_DATUM")
if not col_datum:
    col_datum = bpy.data.collections.new("00_DATUM")
    master_col.children.link(col_datum)

datum_vessel = bpy.data.objects.new("VESSEL_DATUM", None)
datum_vessel.location = (0, 0, 0)
col_datum.objects.link(datum_vessel)

# Save backup 02_scaled.blend
bpy.ops.wm.save_as_mainfile(filepath=r"c:\\Users\\yoeli\\Documents\\GetUpSoft_Workspace\\02_Products\\GetUpSoftBoat\\electric_boat_29ft\\blender\\backups\\02_scaled.blend")
bpy.ops.wm.save_as_mainfile(filepath=r"c:\\Users\\yoeli\\Documents\\GetUpSoft_Workspace\\02_Products\\GetUpSoftBoat\\electric_boat_29ft\\blender\\electric_boat_29ft_WORK.blend")

result = {
    "orig_loa": orig_length_y,
    "orig_beam": orig_width_x,
    "scale_factor_loa": scale_factor_loa,
    "scale_factor_beam": scale_factor_beam,
    "final_loa": final_loa,
    "final_beam": final_beam,
    "final_height": final_height,
    "centerline_y": centerline_y,
    "vessel_datum_created": True,
    "backup_01": r"blender/backups/01_scene_cleaned.blend",
    "backup_02": r"blender/backups/02_scaled.blend"
}
"""

res = client.execute_code(norm_script)

md_lines = [
    "# Reporte de Dimensiones y Escala (`docs/DIMENSIONS.md`)",
    "",
    "## Resumen de Normalización Geométrica",
    "",
    f"- **LOA Original:** {res['result']['orig_loa']:.4f} m",
    f"- **Beam Original:** {res['result']['orig_beam']:.4f} m",
    f"- **Factor de Escala LOA (Eje X):** {res['result']['scale_factor_loa']:.6f}",
    f"- **Factor de Escala Beam (Eje Y):** {res['result']['scale_factor_beam']:.6f}",
    f"- **LOA Final Alcanzada:** {res['result']['final_loa']:.4f} m (Tolerancia Objetivo: 8.84 ± 0.02 m)",
    f"- **Beam Final Alcanzada:** {res['result']['final_beam']:.4f} m (Tolerancia Objetivo: 2.80 ± 0.05 m)",
    f"- **Altura Final de Casco:** {res['result']['final_height']:.4f} m",
    f"- **Desviación de Línea de Crujía:** Y = {res['result']['centerline_y']:.6f} m",
    "- **Sistema de Coordenadas:** X = Longitudinal (Bow/Stern), Y = Transversal (Port/Starboard), Z = Vertical",
    "- **Punto Nulo Datums (`VESSEL_DATUM`):** `[0.000, 0.000, 0.000]`"
]

dim_file = r"c:\Users\yoeli\Documents\GetUpSoft_Workspace\02_Products\GetUpSoftBoat\electric_boat_29ft\docs\DIMENSIONS.md"
with open(dim_file, "w", encoding="utf-8") as f:
    f.write("\n".join(md_lines))

print(f"Generated {dim_file} successfully.")
