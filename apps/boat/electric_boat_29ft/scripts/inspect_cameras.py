import json
from blender_mcp_client import BlenderMCPClient

client = BlenderMCPClient()

code = """
import bpy

bpy.ops.wm.open_mainfile(filepath=r"c:\\Users\\yoeli\\Documents\\GetUpSoft_Workspace\\02_Products\\GetUpSoftBoat\\electric_boat_29ft\\blender\\electric_boat_29ft_FINAL.blend")

cams = [o.name for o in bpy.data.objects if o.type == 'CAMERA']
result = {"cameras_in_final": cams, "all_objects": [o.name for o in bpy.data.objects]}
"""

res = client.execute_code(code)
print("Inspect Cameras Result:\n", json.dumps(res, indent=2))
