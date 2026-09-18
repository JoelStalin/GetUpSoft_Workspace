import os
import subprocess

blender_exe = r"C:\Program Files\Blender Foundation\Blender 5.2\blender.exe"
blend_file = r"c:\Users\yoeli\Documents\GetUpSoft_Workspace\02_Products\GetUpSoftBoat\electric_boat_29ft\blender\electric_boat_29ft_FINAL.blend"
pres_dir = r"c:\Users\yoeli\Documents\GetUpSoft_Workspace\02_Products\GetUpSoftBoat\electric_boat_29ft\renders\presentation"

py_expr = """
import bpy
sc = bpy.context.scene
col_inboard = bpy.data.collections.get('07_PROPULSION_INBOARD')
col_outboard = bpy.data.collections.get('08_PROPULSION_OUTBOARD')

if col_inboard: col_inboard.hide_render = True
if col_outboard: col_outboard.hide_render = False

cobj = bpy.data.objects.get('CAM_STERN_THREEQUARTER')
if not cobj:
    cdata = bpy.data.cameras.new("CAM_STERN_THREEQUARTER_DATA")
    cdata.type = 'PERSP'
    cobj = bpy.data.objects.new("CAM_STERN_THREEQUARTER", cdata)
    sc.collection.objects.link(cobj)
    cobj.location = (-15.0, -8.0, 6.0)
    cobj.rotation_euler = (1.22, 0, 2.09)

sc.camera = cobj
sc.render.resolution_x = 1920
sc.render.resolution_y = 1080
sc.render.image_settings.file_format = 'PNG'
"""

out_path = os.path.join(pres_dir, "11_stern_threequarter.png")
cmd = [blender_exe, "--background", blend_file, "--python-expr", py_expr, "--render-output", out_path, "-f", "1"]
res = subprocess.run(cmd, capture_output=True, text=True)

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

print("Final Presentation Renders List:", sorted(os.listdir(pres_dir)))
