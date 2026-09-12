import json
from blender_mcp_client import BlenderMCPClient

client = BlenderMCPClient()

code = """
import bpy
import math
import mathutils

# Open fresh original model
bpy.ops.wm.open_mainfile(filepath=r"c:\\Users\\yoeli\\Documents\\GetUpSoft_Workspace\\02_Products\\GetUpSoftBoat\\electric_boat_29ft\\source\\board_original.blend")

# 1. Metric / Meters
bpy.context.scene.unit_settings.system = 'METRIC'
bpy.context.scene.unit_settings.scale_length = 1.0
bpy.context.scene.unit_settings.length_unit = 'METERS'

# 2. Remove background environment objects only
env_names = ["Sphere", "Plane.001", "Plane.002", "Plane.003", "stone 1", "stone2", "stone3", "Lamp", "Lamp.001"]
for name in env_names:
    o = bpy.data.objects.get(name)
    if o:
        bpy.data.objects.remove(o, do_unlink=True)

hull_main = bpy.data.objects.get("Cube.003")
if hull_main:
    hull_main.name = "HULL_MAIN"

boat_objs = [o for o in bpy.data.objects if o.type in ['MESH', 'CURVE']]

# Calculate hull bounds
mw_hull = hull_main.matrix_world
hull_corners = [mw_hull @ mathutils.Vector(c) for c in hull_main.bound_box]

min_x = min(c.x for c in hull_corners)
max_x = max(c.x for c in hull_corners)
min_y = min(c.y for c in hull_corners)
max_y = max(c.y for c in hull_corners)
min_z = min(c.z for c in hull_corners)
max_z = max(c.z for c in hull_corners)

orig_width_x = max_x - min_x # 2.6296 m
orig_length_y = max_y - min_y # 11.6734 m
orig_height_z = max_z - min_z # 4.2378 m

center_x = (min_x + max_x) / 2.0
center_y = (min_y + max_y) / 2.0
base_z = min_z

target_loa = 8.84 # along new X axis
target_beam = 2.80 # along new Y axis

scale_factor_loa = target_loa / orig_length_y # ~0.757275
scale_factor_beam = target_beam / orig_width_x # ~1.064786
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

# Measure final world space bounds of HULL_MAIN
mw_final = hull_main.matrix_world
final_coords = [mw_final @ mathutils.Vector(c) for c in hull_main.bound_box]

final_xs = [c.x for c in final_coords]
final_ys = [c.y for c in final_coords]
final_zs = [c.z for c in final_coords]

final_loa = max(final_xs) - min(final_xs)
final_beam = max(final_ys) - min(final_ys)
final_height = max(final_zs) - min(final_zs)
centerline_y = (min(final_ys) + max(final_ys)) / 2.0

bpy.ops.wm.save_as_mainfile(filepath=r"c:\\Users\\yoeli\\Documents\\GetUpSoft_Workspace\\02_Products\\GetUpSoftBoat\\electric_boat_29ft\\blender\\electric_boat_29ft.blend")

result = {
    "boat_objects_preserved": [o.name for o in boat_objs],
    "final_loa": final_loa,
    "final_beam": final_beam,
    "final_height": final_height,
    "centerline_y": centerline_y,
    "saved_file": bpy.data.filepath
}
"""

res = client.execute_code(code)
print("Unified Boat Preserved Assembly Result:\n", json.dumps(res, indent=2))
