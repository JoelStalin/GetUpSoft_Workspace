import os
import subprocess

blender_exe = r"C:\Program Files\Blender Foundation\Blender 5.2\blender.exe"
orig_file = r"c:\Users\yoeli\Documents\GetUpSoft_Workspace\02_Products\GetUpSoftBoat\electric_boat_29ft\source\board_original.blend"
preview_dir = r"c:\Users\yoeli\Documents\GetUpSoft_Workspace\02_Products\GetUpSoftBoat\electric_boat_29ft\references"

os.makedirs(preview_dir, exist_ok=True)

py_script = f"""
import bpy
import os

sc = bpy.context.scene
sc.render.resolution_x = 1280
sc.render.resolution_y = 720

# Create camera for previewing original model
cam_data = bpy.data.cameras.new("PREVIEW_CAM_DATA")
cam_obj = bpy.data.objects.new("PREVIEW_CAM", cam_data)
sc.collection.objects.link(cam_obj)
sc.camera = cam_obj

# View 1: Isometric preview of original
cam_obj.location = (15, 15, 12)
cam_obj.rotation_euler = (0.95, 0, 2.35)
sc.render.filepath = r"{os.path.join(preview_dir, 'orig_iso.png')}"
bpy.ops.render.render(write_still=True)

# View 2: Side profile of original
cam_obj.location = (25, 0, 2)
cam_obj.rotation_euler = (1.57, 0, 1.57)
sc.render.filepath = r"{os.path.join(preview_dir, 'orig_side.png')}"
bpy.ops.render.render(write_still=True)
"""

cmd = [blender_exe, "--background", orig_file, "--python-expr", py_script]
res = subprocess.run(cmd, capture_output=True, text=True)
print("Rendered original model preview screenshots:", res.returncode)
