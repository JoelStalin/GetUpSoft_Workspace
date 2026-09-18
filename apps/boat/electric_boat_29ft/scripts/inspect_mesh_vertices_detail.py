import json
from blender_mcp_client import BlenderMCPClient

client = BlenderMCPClient()

code = """
import bpy
import mathutils

bpy.ops.wm.open_mainfile(filepath=r"c:\\Users\\yoeli\\Documents\\GetUpSoft_Workspace\\02_Products\\GetUpSoftBoat\\electric_boat_29ft\\source\\board_original.blend")

obj = bpy.data.objects.get("Plane.001")
res = {}
if obj and obj.data:
    mw = obj.matrix_world
    # Inspect vertices in world space
    coords = [mw @ v.co for v in obj.data.vertices]
    xs = [c.x for c in coords]
    ys = [c.y for c in coords]
    zs = [c.z for c in coords]
    
    res = {
        "total_verts": len(coords),
        "min_x": min(xs), "max_x": max(xs), "len_x": max(xs) - min(xs),
        "min_y": min(ys), "max_y": max(ys), "len_y": max(ys) - min(ys),
        "min_z": min(zs), "max_z": max(zs), "len_z": max(zs) - min(zs)
    }

result = res
"""

res = client.execute_code(code)
print("Plane.001 Mesh Vertices Bounds:\n", json.dumps(res, indent=2))
