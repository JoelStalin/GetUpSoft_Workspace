import json
from blender_mcp_client import BlenderMCPClient

client = BlenderMCPClient()

code = """
import bpy

bpy.ops.wm.open_mainfile(filepath=r"c:\\Users\\yoeli\\Documents\\GetUpSoft_Workspace\\02_Products\\GetUpSoftBoat\\electric_boat_29ft\\source\\board_original.blend")

report = []
for o in bpy.data.objects:
    if o.type == 'MESH':
        me = o.data
        report.append({
            "name": o.name,
            "verts": len(me.vertices),
            "polys": len(me.polygons),
            "materials": [m.name for m in me.materials if m],
            "bounding_box_local": [list(b) for b in o.bound_box]
        })

result = {"mesh_report": report}
"""

res = client.execute_code(code)
print("Mesh Detailed Report:\n", json.dumps(res, indent=2))
