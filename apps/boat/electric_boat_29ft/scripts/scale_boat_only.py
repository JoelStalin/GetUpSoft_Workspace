import json
from blender_mcp_client import BlenderMCPClient

client = BlenderMCPClient()

scale_code = """
import bpy
import mathutils

# Open original blend file
bpy.ops.wm.open_mainfile(filepath=r"c:\\Users\\yoeli\\Documents\\GetUpSoft_Workspace\\02_Products\\GetUpSoftBoat\\electric_boat_29ft\\source\\board_original.blend")

# 1. Set Units to Metric / Meters
bpy.context.scene.unit_settings.system = 'METRIC'
bpy.context.scene.unit_settings.scale_length = 1.0
bpy.context.scene.unit_settings.length_unit = 'METERS'

# Environment objects to remove or ignore during boat scaling
env_names = ["Sphere", "Plane.002", "Plane.003", "stone 1", "stone2", "stone3"]
for name in env_names:
    o = bpy.data.objects.get(name)
    if o:
        bpy.data.objects.remove(o, do_unlink=True)

# Select all boat objects
boat_objs = [o for o in bpy.data.objects if o.type in ['MESH', 'CURVE']]

# Calculate initial boat bounding box
min_x, max_x = float('inf'), float('-inf')
min_y, max_y = float('inf'), float('-inf')
min_z, max_z = float('inf'), float('-inf')

for o in boat_objs:
    mw = o.matrix_world
    if hasattr(o, "bound_box") and o.bound_box:
        for corner in o.bound_box:
            w_corner = mw @ mathutils.Vector(corner)
            min_x = min(min_x, w_corner.x)
            max_x = max(max_x, w_corner.x)
            min_y = min(min_y, w_corner.y)
            max_y = max(max_y, w_corner.y)
            min_z = min(min_z, w_corner.z)
            max_z = max(max_z, w_corner.z)

init_dim_x = max_x - min_x
init_dim_y = max_y - min_y
init_dim_z = max_z - min_z

# Determine orientation: Y is longitudinal in original model
# Rotate boat objects 90 degrees around Z so X = longitudinal, Y = lateral (port/starboard), Z = vertical
for o in boat_objs:
    if o.parent is None:
        o.rotation_euler.z += 1.5707963267948966

bpy.context.view_layer.update()

# Recalculate bounding box after rotation
min_x, max_x = float('inf'), float('-inf')
min_y, max_y = float('inf'), float('-inf')
min_z, max_z = float('inf'), float('-inf')

for o in boat_objs:
    mw = o.matrix_world
    if hasattr(o, "bound_box") and o.bound_box:
        for corner in o.bound_box:
            w_corner = mw @ mathutils.Vector(corner)
            min_x = min(min_x, w_corner.x)
            max_x = max(max_x, w_corner.x)
            min_y = min(min_y, w_corner.y)
            max_y = max(max_y, w_corner.y)
            min_z = min(min_z, w_corner.z)
            max_z = max(max_z, w_corner.z)

dim_x_after_rot = max_x - min_x # Longitudinal (LOA)
dim_y_after_rot = max_y - min_y # Lateral (Beam)

target_loa = 8.84
scale_factor = target_loa / dim_x_after_rot

# Center laterally on Y = 0 and position keel base at Z = 0
center_y = (min_y + max_y) / 2.0
center_x = (min_x + max_x) / 2.0

for o in boat_objs:
    if o.parent is None:
        o.location.x = (o.location.x - center_x) * scale_factor
        o.location.y = (o.location.y - center_y) * scale_factor
        o.location.z = (o.location.z - min_z) * scale_factor
        o.scale *= scale_factor

bpy.context.view_layer.update()

# Recalculate final dimensions after scaling
min_x, max_x = float('inf'), float('-inf')
min_y, max_y = float('inf'), float('-inf')
min_z, max_z = float('inf'), float('-inf')

for o in boat_objs:
    mw = o.matrix_world
    if hasattr(o, "bound_box") and o.bound_box:
        for corner in o.bound_box:
            w_corner = mw @ mathutils.Vector(corner)
            min_x = min(min_x, w_corner.x)
            max_x = max(max_x, w_corner.x)
            min_y = min(min_y, w_corner.y)
            max_y = max(max_y, w_corner.y)
            min_z = min(min_z, w_corner.z)
            max_z = max(max_z, w_corner.z)

final_loa = max_x - min_x
final_beam = max_y - min_y
final_height = max_z - min_z

# Save backup
bpy.ops.wm.save_as_mainfile(filepath=r"c:\\Users\\yoeli\\Documents\\GetUpSoft_Workspace\\02_Products\\GetUpSoftBoat\\electric_boat_29ft\\blender\\backups\\02_scaled.blend")

# Save working file
bpy.ops.wm.save_as_mainfile(filepath=r"c:\\Users\\yoeli\\Documents\\GetUpSoft_Workspace\\02_Products\\GetUpSoftBoat\\electric_boat_29ft\\blender\\electric_boat_29ft.blend")

result = {
    "target_loa": target_loa,
    "target_beam": 2.80,
    "scale_factor": scale_factor,
    "final_loa": final_loa,
    "final_beam": final_beam,
    "final_height": final_height,
    "coordinate_system": "X=longitudinal, Y=port/starboard, Z=vertical",
    "centerline": "Y = 0.000",
    "saved_files": [
        "blender/backups/02_scaled.blend",
        "blender/electric_boat_29ft.blend"
    ]
}
"""

res = client.execute_code(scale_code)
print("Boat Scaling Verification:\n", json.dumps(res, indent=2))
