import json
from blender_mcp_client import BlenderMCPClient

client = BlenderMCPClient()

analyze_orig = """
import bpy
import mathutils

# Open original file
bpy.ops.wm.open_mainfile(filepath=r"c:\\Users\\yoeli\\Documents\\GetUpSoft_Workspace\\02_Products\\GetUpSoftBoat\\electric_boat_29ft\\source\\board_original.blend")

hull_obj = bpy.data.objects.get("Plane.001")
res = {}
if hull_obj:
    res["hull_name"] = hull_obj.name
    res["dimensions"] = list(hull_obj.dimensions)
    res["location"] = list(hull_obj.location)
    res["rotation"] = list(hull_obj.rotation_euler)
    res["scale"] = list(hull_obj.scale)
    
    # World bounding box
    mw = hull_obj.matrix_world
    corners = [mw @ mathutils.Vector(c) for c in hull_obj.bound_box]
    min_x = min(c.x for c in corners)
    max_x = max(c.x for c in corners)
    min_y = min(c.y for c in corners)
    max_y = max(c.y for c in corners)
    min_z = min(c.z for c in corners)
    max_z = max(c.z for c in corners)
    
    res["world_bbox"] = {
        "x": max_x - min_x,
        "y": max_y - min_y,
        "z": max_z - min_z,
        "min": [min_x, min_y, min_z],
        "max": [max_x, max_y, max_z]
    }

# Re-open working file
bpy.ops.wm.open_mainfile(filepath=r"c:\\Users\\yoeli\\Documents\\GetUpSoft_Workspace\\02_Products\\GetUpSoftBoat\\electric_boat_29ft\\blender\\electric_boat_29ft.blend")

result = res
"""

res = client.execute_code(analyze_orig)
print("Original Hull Dimensions:\n", json.dumps(res, indent=2))
