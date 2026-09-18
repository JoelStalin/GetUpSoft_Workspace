import json
from blender_mcp_client import BlenderMCPClient

client = BlenderMCPClient()

inspect_code = """
import bpy
import mathutils

bpy.ops.wm.open_mainfile(filepath=r"c:\\Users\\yoeli\\Documents\\GetUpSoft_Workspace\\02_Products\\GetUpSoftBoat\\electric_boat_29ft\\source\\board_original.blend")

o = bpy.data.objects.get("Cube.003")
mw = o.matrix_world
coords = [mw @ v.co for v in o.data.vertices]

xs = [c.x for c in coords]
ys = [c.y for c in coords]
zs = [c.z for c in coords]

result = {
    "obj_name": o.name,
    "location": list(o.location),
    "rotation": list(o.rotation_euler),
    "scale": list(o.scale),
    "world_bounds": {
        "min_x": min(xs), "max_x": max(xs), "len_x": max(xs) - min(xs),
        "min_y": min(ys), "max_y": max(ys), "len_y": max(ys) - min(ys),
        "min_z": min(zs), "max_z": max(zs), "len_z": max(zs) - min(zs)
    }
}
"""

res = client.execute_code(inspect_code)
print("HULL_MAIN World Bounds in Original File:\n", json.dumps(res, indent=2))
