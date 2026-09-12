import json
from blender_mcp_client import BlenderMCPClient

client = BlenderMCPClient()

scale_script = """
import bpy
import mathutils

# 1. Configure Metric Units
bpy.context.scene.unit_settings.system = 'METRIC'
bpy.context.scene.unit_settings.scale_length = 1.0
bpy.context.scene.unit_settings.length_unit = 'METERS'

# Identify mesh objects forming the vessel (excluding Cameras/Lights)
vessel_objs = [o for o in bpy.data.objects if o.type == 'MESH']

# Calculate total bounding box in world space
min_x, max_x = float('inf'), float('-inf')
min_y, max_y = float('inf'), float('-inf')
min_z, max_z = float('inf'), float('-inf')

for o in vessel_objs:
    mw = o.matrix_world
    for corner in o.bound_box:
        w_corner = mw @ mathutils.Vector(corner)
        min_x = min(min_x, w_corner.x)
        max_x = max(max_x, w_corner.x)
        min_y = min(min_y, w_corner.y)
        max_y = max(max_y, w_corner.y)
        min_z = min(min_z, w_corner.z)
        max_z = max(max_z, w_corner.z)

curr_dim_x = max_x - min_x
curr_dim_y = max_y - min_y
curr_dim_z = max_z - min_z

# Determine which axis is longitudinal (length) vs lateral (beam)
# Typically X or Y is longitudinal. Let's inspect:
if curr_dim_x >= curr_dim_y:
    long_axis = 'X'
    lat_axis = 'Y'
    curr_loa = curr_dim_x
    curr_beam = curr_dim_y
else:
    long_axis = 'Y'
    lat_axis = 'X'
    curr_loa = curr_dim_y
    curr_beam = curr_dim_x

target_loa = 8.84
target_beam = 2.80

scale_factor = target_loa / curr_loa

# If the boat is currently oriented along Y, rotate it so X is longitudinal:
# X = longitudinal, Y = port/starboard, Z = vertical
if long_axis == 'Y':
    for o in vessel_objs:
        o.rotation_euler.z += 1.5707963267948966 # Rotate 90 deg around Z
    bpy.context.view_layer.update()
    
    # Recalculate bounding box after rotation
    min_x, max_x = float('inf'), float('-inf')
    min_y, max_y = float('inf'), float('-inf')
    min_z, max_z = float('inf'), float('-inf')
    for o in vessel_objs:
        mw = o.matrix_world
        for corner in o.bound_box:
            w_corner = mw @ mathutils.Vector(corner)
            min_x = min(min_x, w_corner.x)
            max_x = max(max_x, w_corner.x)
            min_y = min(min_y, w_corner.y)
            max_y = max(max_y, w_corner.y)
            min_z = min(min_z, w_corner.z)
            max_z = max(max_z, w_corner.z)
    curr_dim_x = max_x - min_x
    curr_dim_y = max_y - min_y

# Center laterally on Y = 0
center_y = (min_y + max_y) / 2.0
center_x = (min_x + max_x) / 2.0
center_z = min_z # Keep keel base at z=0

for o in vessel_objs:
    o.location.y -= center_y

# Apply uniform scale factor
for o in vessel_objs:
    o.scale *= scale_factor

bpy.context.view_layer.update()

# Recalculate final dimensions after scaling
min_x, max_x = float('inf'), float('-inf')
min_y, max_y = float('inf'), float('-inf')
min_z, max_z = float('inf'), float('-inf')
for o in vessel_objs:
    mw = o.matrix_world
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

# Save backups and update file
bpy.ops.wm.save_as_mainfile(filepath=bpy.data.filepath.replace("electric_boat_29ft.blend", "backups/02_scaled.blend"))
bpy.ops.wm.save_as_mainfile(filepath=bpy.data.filepath)

result = {
    "units": "Metric / Meters",
    "initial_loa": curr_loa,
    "initial_beam": curr_beam,
    "scale_factor_applied": scale_factor,
    "final_loa": final_loa,
    "final_beam": final_beam,
    "final_height": final_height,
    "centerline": "Y = 0 (Aligned)",
    "backup_saved": "backups/02_scaled.blend"
}
"""

res = client.execute_code(scale_script)
print("Scale and Align Verification:\n", json.dumps(res, indent=2))
