import os
import subprocess

blender_exe = r"C:\Program Files\Blender Foundation\Blender 5.2\blender.exe"
blend_file = r"c:\Users\yoeli\Documents\GetUpSoft_Workspace\02_Products\GetUpSoftBoat\electric_boat_29ft\blender\electric_boat_29ft_FINAL.blend"
pres_dir = r"c:\Users\yoeli\Documents\GetUpSoft_Workspace\02_Products\GetUpSoftBoat\electric_boat_29ft\renders\presentation"

cams = [
    ("CAM_BOW_THREEQUARTER", "10_bow_threequarter.png"),
    ("CAM_STERN_THREEQUARTER", "11_stern_threequarter.png")
]

for cam_name, out_name in cams:
    out_path = os.path.join(pres_dir, out_name)
    py_expr = f"""
import bpy
sc = bpy.context.scene
sc.render.resolution_x = 1920
sc.render.resolution_y = 1080
sc.render.image_settings.file_format = 'PNG'

cobj = bpy.data.objects.get('{cam_name}')
if not cobj:
    cdata = bpy.data.cameras.new("{cam_name}_DATA")
    cdata.type = 'PERSP'
    cobj = bpy.data.objects.new("{cam_name}", cdata)
    sc.collection.objects.link(cobj)
    if 'BOW' in '{cam_name}':
        cobj.location = (15.0, -8.0, 6.0)
        cobj.rotation_euler = (1.22, 0, 1.05)
    else:
        cobj.location = (-15.0, -8.0, 6.0)
        cobj.rotation_euler = (1.22, 0, 2.09)

sc.camera = cobj
"""
    cmd = [blender_exe, "--background", blend_file, "--python-expr", py_expr, "--render-output", out_path, "-f", "1"]
    res = subprocess.run(cmd, capture_output=True, text=True)
    print(f"Rendered {out_name}, exit code:", res.returncode)

# Clean up trailing numbers in render file names if any
for f in os.listdir(pres_dir):
    fp = os.path.join(pres_dir, f)
    if "0001" in f:
        new_f = f.replace("0001.png", ".png").replace(".png0001", ".png")
        new_fp = os.path.join(pres_dir, new_f)
        if os.path.exists(new_fp):
            os.remove(fp)
        else:
            os.rename(fp, new_fp)

print("Files in renders/presentation:", sorted(os.listdir(pres_dir)))
