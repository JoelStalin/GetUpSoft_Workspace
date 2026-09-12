import os
import subprocess

blender_exe = r"C:\Program Files\Blender Foundation\Blender 5.2\blender.exe"
blend_file = r"c:\Users\yoeli\Documents\GetUpSoft_Workspace\02_Products\GetUpSoftBoat\electric_boat_29ft\blender\electric_boat_29ft_FINAL.blend"
pres_dir = r"c:\Users\yoeli\Documents\GetUpSoft_Workspace\02_Products\GetUpSoftBoat\electric_boat_29ft\renders\presentation"

os.makedirs(pres_dir, exist_ok=True)

cams = [
    ("CAM_ISOMETRIC_PORT", "08_isometric_port.png"),
    ("CAM_ISOMETRIC_STARBOARD", "09_isometric_starboard.png"),
    ("CAM_BOW_THREEQUARTER", "10_bow_threequarter.png"),
    ("CAM_STERN_THREEQUARTER", "11_stern_threequarter.png")
]

for cam_name, out_name in cams:
    out_path = os.path.join(pres_dir, out_name)
    py_expr = f"""
import bpy
sc = bpy.context.scene
sc.camera = bpy.data.objects.get('{cam_name}')
sc.render.resolution_x = 1920
sc.render.resolution_y = 1080
sc.render.image_settings.file_format = 'PNG'
"""
    cmd = [blender_exe, "--background", blend_file, "--python-expr", py_expr, "--render-output", out_path, "-f", "1"]
    res = subprocess.run(cmd, capture_output=True, text=True)
    print(f"Rendered {out_name}, exit code:", res.returncode)

# Clean up trailing numbers in render file names if any
for f in os.listdir(pres_dir):
    if "0001" in f:
        fp = os.path.join(pres_dir, f)
        new_f = f.replace("0001.png", ".png").replace(".png0001", ".png")
        new_fp = os.path.join(pres_dir, new_f)
        if os.path.exists(new_fp):
            os.remove(fp)
        else:
            os.rename(fp, new_fp)

print("Presentation Renders:", sorted(os.listdir(pres_dir)))
