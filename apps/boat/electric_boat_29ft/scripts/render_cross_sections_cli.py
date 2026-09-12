import os
import subprocess

blender_exe = r"C:\Program Files\Blender Foundation\Blender 5.2\blender.exe"
blend_file = r"c:\Users\yoeli\Documents\GetUpSoft_Workspace\02_Products\GetUpSoftBoat\electric_boat_29ft\blender\backups\03_proxy_layout.blend"
val_dir = r"c:\Users\yoeli\Documents\GetUpSoft_Workspace\02_Products\GetUpSoftBoat\electric_boat_29ft\renders\validation"

os.makedirs(val_dir, exist_ok=True)

py_script = f"""
import bpy
import os
import math

sc = bpy.context.scene
sc.render.resolution_x = 1280
sc.render.resolution_y = 720

cam_data = bpy.data.cameras.new("VAL_CAM_DATA")
cam_data.type = 'ORTHO'
cam_data.ortho_scale = 5.0
cam_obj = bpy.data.objects.new("VAL_CAM", cam_data)
sc.collection.objects.link(cam_obj)
sc.camera = cam_obj

percentages = [20, 35, 50, 65, 80]
for p in percentages:
    out_path = r"{val_dir}" + f"/cross_section_{{p}}.png"
    if not os.path.exists(out_path):
        x_pos = -4.42 + (8.84 * (p / 100.0))
        cam_obj.location = (x_pos + 4.0, 0, 1.0)
        cam_obj.rotation_euler = (0, math.radians(90.0), math.radians(90.0))
        sc.render.filepath = out_path
        bpy.ops.render.render(write_still=True)
"""

cmd = [blender_exe, "--background", blend_file, "--python-expr", py_script]
res = subprocess.run(cmd, capture_output=True, text=True)
print("Rendered cross sections CLI exit code:", res.returncode)
print("Files in renders/validation:", sorted(os.listdir(val_dir)))
