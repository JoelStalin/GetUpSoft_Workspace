import json
from blender_mcp_client import BlenderMCPClient

client = BlenderMCPClient()

code = """
import bpy

bpy.ops.wm.open_mainfile(filepath=r"c:\\Users\\yoeli\\Documents\\GetUpSoft_Workspace\\02_Products\\GetUpSoftBoat\\electric_boat_29ft\\source\\board_original.blend")

summary = []
for o in bpy.data.objects:
    mats = [m.name for m in o.data.materials if m] if hasattr(o.data, 'materials') else []
    summary.append({
        "name": o.name,
        "type": o.type,
        "dims": [round(d, 3) for d in o.dimensions],
        "loc": [round(l, 3) for l in o.location],
        "rot": [round(r, 3) for r in o.rotation_euler],
        "scale": [round(s, 3) for s in o.scale],
        "verts": len(o.data.vertices) if hasattr(o.data, 'vertices') else 0,
        "materials": mats
    })

result = {"objects": summary}
"""

res = client.execute_code(code)
print("Complete Object List in Original Scene:\n", json.dumps(res, indent=2))
