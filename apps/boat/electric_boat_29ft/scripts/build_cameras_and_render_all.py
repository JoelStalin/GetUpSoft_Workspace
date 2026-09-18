import json
import os
from blender_mcp_client import BlenderMCPClient

client = BlenderMCPClient()

code = """
import bpy
import os
import math

bpy.ops.wm.open_mainfile(filepath=r"c:\\Users\\yoeli\\Documents\\GetUpSoft_Workspace\\02_Products\\GetUpSoftBoat\\electric_boat_29ft\\blender\\electric_boat_29ft_FINAL.blend")

sc = bpy.context.scene
sc.render.resolution_x = 1920
sc.render.resolution_y = 1080
sc.render.image_settings.file_format = 'PNG'

# Collection 14_CAMERAS
col_cams = bpy.data.collections.get("14_CAMERAS")
if not col_cams:
    col_cams = bpy.data.collections.new("14_CAMERAS")
    sc.collection.children.link(col_cams)

cameras_def = [
    ("CAM_PROFILE_PORT", (0.0, -18.0, 1.2), (math.radians(90.0), 0, 0), 'ORTHO', 12.0),
    ("CAM_PROFILE_STARBOARD", (0.0, 18.0, 1.2), (math.radians(90.0), 0, math.radians(180.0)), 'ORTHO', 12.0),
    ("CAM_TOP", (0.0, 0.0, 18.0), (0, 0, math.radians(-90.0)), 'ORTHO', 11.0),
    ("CAM_FRONT", (18.0, 0.0, 1.2), (math.radians(90.0), 0, math.radians(90.0)), 'ORTHO', 4.8),
    ("CAM_TRANSOM", (-18.0, 0.0, 1.2), (math.radians(90.0), 0, math.radians(-90.0)), 'ORTHO', 4.8),
    ("CAM_HELM", (2.8, -1.8, 2.4), (math.radians(65.0), 0, math.radians(52.0)), 'PERSP', 0.0),
    ("CAM_ISOMETRIC_PORT", (14.0, -14.0, 12.0), (math.radians(58.0), 0, math.radians(45.0)), 'PERSP', 0.0),
    ("CAM_ISOMETRIC_STARBOARD", (14.0, 14.0, 12.0), (math.radians(58.0), 0, math.radians(135.0)), 'PERSP', 0.0),
    ("CAM_BOW_THREEQUARTER", (15.0, -8.0, 6.0), (math.radians(70.0), 0, math.radians(60.0)), 'PERSP', 0.0),
    ("CAM_STERN_THREEQUARTER", (-15.0, -8.0, 6.0), (math.radians(70.0), 0, math.radians(120.0)), 'PERSP', 0.0)
]

for cname, cloc, crot, ctype, oscale in cameras_def:
    cobj = bpy.data.objects.get(cname)
    if not cobj:
        cdata = bpy.data.cameras.new(f"{cname}_DATA")
        cdata.type = ctype
        if ctype == 'ORTHO':
            cdata.ortho_scale = oscale
        cobj = bpy.data.objects.new(cname, cdata)
        col_cams.objects.link(cobj)
    cobj.location = cloc
    cobj.rotation_euler = crot

# Save file with cameras linked
final_blend = r"c:\\Users\\yoeli\\Documents\\GetUpSoft_Workspace\\02_Products\\GetUpSoftBoat\\electric_boat_29ft\\blender\\electric_boat_29ft_FINAL.blend"
bpy.ops.wm.save_as_mainfile(filepath=final_blend)

result = {
    "cameras_created": [c[0] for c in cameras_def],
    "total_cameras": len([o for o in bpy.data.objects if o.type == 'CAMERA']),
    "saved_final_blend": final_blend
}
"""

res = client.execute_code(code)
print("Build Cameras Result:\n", json.dumps(res, indent=2))
