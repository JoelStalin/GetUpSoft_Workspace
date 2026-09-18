import json
from blender_mcp_client import BlenderMCPClient

client = BlenderMCPClient()

script = """
import bpy
import mathutils

# Open original file
bpy.ops.wm.open_mainfile(filepath=r"c:\\Users\\yoeli\\Documents\\GetUpSoft_Workspace\\02_Products\\GetUpSoftBoat\\electric_boat_29ft\\source\\board_original.blend")

# 1. Configure Metric Units
bpy.context.scene.unit_settings.system = 'METRIC'
bpy.context.scene.unit_settings.scale_length = 1.0
bpy.context.scene.unit_settings.length_unit = 'METERS'

# 2. Remove environment background objects
env_names = ["Sphere", "Plane.001", "Plane.002", "Plane.003", "stone 1", "stone2", "stone3", "Lamp", "Lamp.001"]
for name in env_names:
    o = bpy.data.objects.get(name)
    if o:
        bpy.data.objects.remove(o, do_unlink=True)

# Select all boat objects
boat_objs = [o for o in bpy.data.objects if o.type in ['MESH', 'CURVE', 'CAMERA']]

hull_main = bpy.data.objects.get("Cube.003")
if hull_main:
    hull_main.name = "HULL_MAIN"

# 3. Rotate 90 deg so X is longitudinal, Y is lateral (port/starboard), Z is vertical
for o in boat_objs:
    if o.parent is None:
        o.rotation_euler.z += 1.5707963267948966

bpy.context.view_layer.update()

# Calculate bounds of HULL_MAIN after 90 deg rotation
min_x, max_x = float('inf'), float('-inf')
min_y, max_y = float('inf'), float('-inf')
min_z, max_z = float('inf'), float('-inf')

mw = hull_main.matrix_world
for corner in hull_main.bound_box:
    wc = mw @ mathutils.Vector(corner)
    min_x = min(min_x, wc.x)
    max_x = max(max_x, wc.x)
    min_y = min(min_y, wc.y)
    max_y = max(max_y, wc.y)
    min_z = min(min_z, wc.z)
    max_z = max(max_z, wc.z)

current_loa = max_x - min_x # Should be ~11.67m
current_beam = max_y - min_y # Should be ~2.63m

target_loa = 8.84
target_beam = 2.80

scale_factor_x = target_loa / current_loa
scale_factor_y = target_beam / current_beam
scale_factor_z = scale_factor_x # Preserve vertical aspect ratio

center_x = (min_x + max_x) / 2.0
center_y = (min_y + max_y) / 2.0
base_z = min_z

for o in boat_objs:
    if o.parent is None:
        # Move to center X, center Y=0, base Z=0
        o.location.x = (o.location.x - center_x) * scale_factor_x
        o.location.y = (o.location.y - center_y) * scale_factor_y
        o.location.z = (o.location.z - base_z) * scale_factor_z
        
        # Apply scaling
        o.scale.x *= scale_factor_x
        o.scale.y *= scale_factor_y
        o.scale.z *= scale_factor_z

bpy.context.view_layer.update()

# Verify final dimensions
min_x, max_x = float('inf'), float('-inf')
min_y, max_y = float('inf'), float('-inf')
min_z, max_z = float('inf'), float('-inf')

mw = hull_main.matrix_world
for corner in hull_main.bound_box:
    wc = mw @ mathutils.Vector(corner)
    min_x = min(min_x, wc.x)
    max_x = max(max_x, wc.x)
    min_y = min(min_y, wc.y)
    max_y = max(max_y, wc.y)
    min_z = min(min_z, wc.z)
    max_z = max(max_z, wc.z)

final_loa = max_x - min_x
final_beam = max_y - min_y
final_height = max_z - min_z

bpy.ops.wm.save_as_mainfile(filepath=r"c:\\Users\\yoeli\\Documents\\GetUpSoft_Workspace\\02_Products\\GetUpSoftBoat\\electric_boat_29ft\\blender\\backups\\02_scaled.blend")
bpy.ops.wm.save_as_mainfile(filepath=r"c:\\Users\\yoeli\\Documents\\GetUpSoft_Workspace\\02_Products\\GetUpSoftBoat\\electric_boat_29ft\\blender\\electric_boat_29ft.blend")

result = {
    "target_loa": target_loa,
    "target_beam": target_beam,
    "final_loa": final_loa,
    "final_beam": final_beam,
    "final_height": final_height,
    "centerline": f"Y = {(min_y + max_y)/2.0:.4f} (Aligned to 0.000)",
    "coordinate_system": "X = Longitudinal (Bow/Stern), Y = Port/Starboard, Z = Vertical",
    "saved_backup": "backups/02_scaled.blend"
}
"""

res = client.execute_code(script)
print("Boat Hull Precise Scaling Result:\n", json.dumps(res, indent=2))
