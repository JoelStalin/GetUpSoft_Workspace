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

# 2. Remove background environment objects only (Sphere, Plane.001 water grid, Plane.002, Plane.003, stones)
env_names = ["Sphere", "Plane.001", "Plane.002", "Plane.003", "stone 1", "stone2", "stone3", "Lamp", "Lamp.001"]
for name in env_names:
    o = bpy.data.objects.get(name)
    if o:
        bpy.data.objects.remove(o, do_unlink=True)

# Boat objects forming the complete intact vessel
boat_objs = [o for o in bpy.data.objects if o.type in ['MESH', 'CURVE']]

hull_main = bpy.data.objects.get("Cube.003")

# Calculate overall bounding box of the complete boat assembly in original state
min_x, max_x = float('inf'), float('-inf')
min_y, max_y = float('inf'), float('-inf')
min_z, max_z = float('inf'), float('-inf')

for o in boat_objs:
    mw = o.matrix_world
    if hasattr(o, "bound_box") and o.bound_box:
        for c in o.bound_box:
            wc = mw @ mathutils.Vector(c)
            min_x = min(min_x, wc.x)
            max_x = max(max_x, wc.x)
            min_y = min(min_y, wc.y)
            max_y = max(max_y, wc.y)
            min_z = min(min_z, wc.z)
            max_z = max(max_z, wc.z)

orig_width_x = max_x - min_x # ~2.63m
orig_length_y = max_y - min_y # ~11.67m
orig_height_z = max_z - min_z # ~4.24m

center_x = (min_x + max_x) / 2.0
center_y = (min_y + max_y) / 2.0
base_z = min_z

# Create VESSEL_RIG Empty at original center
rig = bpy.data.objects.new("VESSEL_RIG", None)
rig.location = (center_x, center_y, base_z)
bpy.context.scene.collection.objects.link(rig)

# Parent all boat objects to VESSEL_RIG maintaining world transforms
for o in boat_objs:
    if o.parent is None:
        o.parent = rig
        o.matrix_parent_inverse = rig.matrix_world.inverted()

bpy.context.view_layer.update()

# Now transform ONLY VESSEL_RIG to orient, scale, and center the complete boat intact!
target_loa = 8.84
target_beam = 2.80

scale_loa = target_loa / orig_length_y # ~0.757275
scale_beam = target_beam / orig_width_x # ~1.064786
scale_z = scale_loa

# Rotate rig 90 deg around Z so X = Longitudinal (8.84m), Y = Port/Starboard (2.80m, Y=0), Z = Vertical
rig.location = (0, 0, 0)
rig.rotation_euler.z = math.radians(90.0)
rig.scale = (scale_beam, scale_loa, scale_z)

bpy.context.view_layer.update()

# Measure final world space bounds of complete boat assembly
min_xf, max_xf = float('inf'), float('-inf')
min_yf, max_yf = float('inf'), float('-inf')
min_zf, max_zf = float('inf'), float('-inf')

for o in boat_objs:
    mw = o.matrix_world
    if hasattr(o, "bound_box") and o.bound_box:
        for c in o.bound_box:
            wc = mw @ mathutils.Vector(c)
            min_xf = min(min_xf, wc.x)
            max_xf = max(max_xf, wc.x)
            min_yf = min(min_yf, wc.y)
            max_yf = max(max_yf, wc.y)
            min_zf = min(min_zf, wc.z)
            max_zf = max(max_zf, wc.z)

final_loa = max_xf - min_xf
final_beam = max_yf - min_yf
final_height = max_zf - min_zf

bpy.ops.wm.save_as_mainfile(filepath=r"c:\\Users\\yoeli\\Documents\\GetUpSoft_Workspace\\02_Products\\GetUpSoftBoat\\electric_boat_29ft\\blender\\electric_boat_29ft.blend")

result = {
    "vessel_rig": rig.name,
    "boat_objects_parented": len(boat_objs),
    "final_loa": final_loa,
    "final_beam": final_beam,
    "final_height": final_height,
    "centerline_y": (min_yf + max_yf)/2.0,
    "saved_file": bpy.data.filepath
}
"""

res = client.execute_code(code)
print("Unified Vessel Rig Transformation Result:\n", json.dumps(res, indent=2))
