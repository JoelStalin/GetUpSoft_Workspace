import json
from blender_mcp_client import BlenderMCPClient

client = BlenderMCPClient()

code = """
import bpy

bpy.ops.wm.open_mainfile(filepath=r"c:\\Users\\yoeli\\Documents\\GetUpSoft_Workspace\\02_Products\\GetUpSoftBoat\\electric_boat_29ft\\source\\board_original.blend")

tree = []
for o in bpy.data.objects:
    tree.append({
        "name": o.name,
        "type": o.type,
        "parent": o.parent.name if o.parent else None,
        "children": [c.name for c in o.children],
        "location": list(o.location),
        "rotation": list(o.rotation_euler),
        "scale": list(o.scale),
        "dimensions": list(o.dimensions),
        "materials": [m.name for m in o.data.materials if m] if hasattr(o.data, "materials") else []
    })

result = {"hierarchy": tree}
"""

res = client.execute_code(code)
print("Original File Object Hierarchy:\n", json.dumps(res, indent=2))
