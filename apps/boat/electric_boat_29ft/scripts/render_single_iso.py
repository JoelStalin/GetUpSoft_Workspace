import os
import subprocess

blender_exe = r"C:\Program Files\Blender Foundation\Blender 5.2\blender.exe"
blend_file = r"c:\Users\yoeli\Documents\GetUpSoft_Workspace\02_Products\GetUpSoftBoat\electric_boat_29ft\blender\electric_boat_29ft.blend"
render_dir = r"c:\Users\yoeli\Documents\GetUpSoft_Workspace\02_Products\GetUpSoftBoat\electric_boat_29ft\renders\technical"

py_expr = """
import bpy
sc = bpy.context.scene
sc.camera = bpy.data.objects.get('CAM_ISOMETRIC')
sc.render.resolution_x = 1920
sc.render.resolution_y = 1080
sc.render.image_settings.file_format = 'PNG'
"""

out_path = os.path.join(render_dir, "06_isometric.png")
cmd = [
    blender_exe,
    "--background",
    blend_file,
    "--python-expr", py_expr,
    "--render-output", out_path,
    "-f", "1"
]

res = subprocess.run(cmd, capture_output=True, text=True)
print("Rendered 06_isometric.png, exit code:", res.returncode)

# Clean up any trailing numbers like 01_profile.png0001.png
for f in os.listdir(render_dir):
    fp = os.path.join(render_dir, f)
    if "png0001" in f:
        os.remove(fp)
    elif f.endswith("0001.png"):
        new_name = f.replace("0001.png", ".png")
        new_fp = os.path.join(render_dir, new_name)
        if os.path.exists(new_fp):
            os.remove(fp)
        else:
            os.rename(fp, new_fp)

print("Final files in renders/technical:", sorted(os.listdir(render_dir)))
