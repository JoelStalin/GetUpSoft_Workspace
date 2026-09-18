import os
import subprocess

blender_exe = r"C:\Program Files\Blender Foundation\Blender 5.2\blender.exe"
blend_file = r"c:\Users\yoeli\Documents\GetUpSoft_Workspace\02_Products\GetUpSoftBoat\electric_boat_29ft\blender\electric_boat_29ft_FINAL.blend"
pres_dir = r"c:\Users\yoeli\Documents\GetUpSoft_Workspace\02_Products\GetUpSoftBoat\electric_boat_29ft\renders\presentation"

os.makedirs(pres_dir, exist_ok=True)

py_expr = """
import bpy
sc = bpy.context.scene
sc.render.resolution_x = 1920
sc.render.resolution_y = 1080
sc.render.image_settings.file_format = 'PNG'

cobj = bpy.data.objects.get('CAM_ISOMETRIC_PORT')
if not cobj:
    cdata = bpy.data.cameras.new("CAM_ISOMETRIC_PORT_DATA")
    cdata.type = 'PERSP'
    cobj = bpy.data.objects.new("CAM_ISOMETRIC_PORT", cdata)
    sc.collection.objects.link(cobj)
    cobj.location = (14.0, -14.0, 12.0)
    cobj.rotation_euler = (0.98, 0, 0.78)

sc.camera = cobj
"""

out_path = os.path.join(pres_dir, "08_isometric_port.png")
cmd = [blender_exe, "--background", blend_file, "--python-expr", py_expr, "--render-output", out_path, "-f", "1"]
res = subprocess.run(cmd, capture_output=True, text=True)
print("Rendered 08_isometric_port.png exit code:", res.returncode)

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

print("Files in renders/presentation:", sorted(os.listdir(pres_dir)))
