import json
from blender_mcp_client import BlenderMCPClient

client = BlenderMCPClient()

inspect_verts = """
import bpy
import mathutils

bpy.ops.wm.open_mainfile(filepath=r"c:\\Users\\yoeli\\Documents\\GetUpSoft_Workspace\\02_Products\\GetUpSoftBoat\\electric_boat_29ft\\source\\board_original.blend")

# List all objects and their parent/child structures
objs_info = []
for o in bpy.data.objects:
    objs_info.append({
        "name": o.name,
        "type": o.type,
        "parent": o.parent.name if o.parent else None,
        "dims": list(o.dimensions),
        "loc": list(o.location),
        "rot": list(o.rotation_euler),
        "scale": list(o.scale)
    })

result = {"objects": objs_info}
"""

res = client.execute_code(inspect_verts)
print("Original Objects Hierarchy:\n", json.dumps(res, indent=2))
