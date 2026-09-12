import os
import subprocess
from blender_mcp_client import BlenderMCPClient

client = BlenderMCPClient()

code = """
import bpy
import mathutils

bpy.ops.wm.open_mainfile(filepath=r"c:\\Users\\yoeli\\Documents\\GetUpSoft_Workspace\\02_Products\\GetUpSoftBoat\\electric_boat_29ft\\source\\board_original.blend")

report = []
for o in bpy.data.objects:
    if o.type == 'MESH':
        me = o.data
        mats = [m.name for m in me.materials if m]
        mw = o.matrix_world
        coords = [mw @ v.co for v in me.vertices]
        xs = [c.x for c in coords]
        ys = [c.y for c in coords]
        zs = [c.z for c in coords]
        report.append({
            "name": o.name,
            "verts": len(me.vertices),
            "polys": len(me.polygons),
            "materials": mats,
            "bounds": {
                "min": [min(xs), min(ys), min(zs)],
                "max": [max(xs), max(ys), max(zs)],
                "dims": [max(xs)-min(xs), max(ys)-min(ys), max(zs)-min(zs)]
            }
        })

result = {"objects": report}
"""

res = client.execute_code(code)
print("Original File Objects Analysis:\n", res)
