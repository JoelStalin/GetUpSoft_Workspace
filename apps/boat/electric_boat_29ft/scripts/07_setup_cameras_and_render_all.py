import os
import subprocess

blender_exe = r"C:\Program Files\Blender Foundation\Blender 5.2\blender.exe"
blend_file = r"c:\Users\yoeli\Documents\GetUpSoft_Workspace\02_Products\GetUpSoftBoat\electric_boat_29ft\blender\backups\08_validation.blend"
tech_dir = r"c:\Users\yoeli\Documents\GetUpSoft_Workspace\02_Products\GetUpSoftBoat\electric_boat_29ft\renders\technical"
pres_dir = r"c:\Users\yoeli\Documents\GetUpSoft_Workspace\02_Products\GetUpSoftBoat\electric_boat_29ft\renders\presentation"

os.makedirs(tech_dir, exist_ok=True)
os.makedirs(pres_dir, exist_ok=True)

py_script = f"""
import bpy
import os
import math

sc = bpy.context.scene
sc.render.resolution_x = 1920
sc.render.resolution_y = 1080
sc.render.image_settings.file_format = 'PNG'

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
        cdata = bpy.data.cameras.new(f"{{cname}}_DATA")
        cdata.type = ctype
        if ctype == 'ORTHO':
            cdata.ortho_scale = oscale
        cobj = bpy.data.objects.new(cname, cdata)
        col_cams.objects.link(cobj)
    cobj.location = cloc
    cobj.rotation_euler = crot

col_inboard = bpy.data.collections.get("07_PROPULSION_INBOARD")
col_outboard = bpy.data.collections.get("08_PROPULSION_OUTBOARD")

def set_propulsion(mode):
    if mode == "INBOARD":
        if col_inboard:
            col_inboard.hide_render = False
            col_inboard.hide_viewport = False
        if col_outboard:
            col_outboard.hide_render = True
            col_outboard.hide_viewport = True
    else:
        if col_inboard:
            col_inboard.hide_render = True
            col_inboard.hide_viewport = True
        if col_outboard:
            col_outboard.hide_render = False
            col_outboard.hide_viewport = False

# Render Technical Views
tech_views = [
    ("CAM_PROFILE_PORT", r"{tech_dir}/01_profile_inboard.png", "INBOARD"),
    ("CAM_TOP", r"{tech_dir}/02_top_inboard.png", "INBOARD"),
    ("CAM_FRONT", r"{tech_dir}/03_front.png", "INBOARD"),
    ("CAM_TRANSOM", r"{tech_dir}/04_transom_outboard.png", "OUTBOARD"),
    ("CAM_HELM", r"{tech_dir}/05_helm.png", "INBOARD"),
    ("CAM_PROFILE_PORT", r"{tech_dir}/06_battery_section.png", "INBOARD"),
    ("CAM_PROFILE_PORT", r"{tech_dir}/07_propulsion_section.png", "INBOARD")
]

for cam_name, out_file, prop_mode in tech_views:
    set_propulsion(prop_mode)
    cobj = bpy.data.objects.get(cam_name)
    if cobj:
        sc.camera = cobj
        sc.render.filepath = out_file
        bpy.ops.render.render(write_still=True)

# Render Presentation Views
pres_views = [
    ("CAM_ISOMETRIC_PORT", r"{pres_dir}/08_isometric_port.png", "INBOARD"),
    ("CAM_ISOMETRIC_STARBOARD", r"{pres_dir}/09_isometric_starboard.png", "INBOARD"),
    ("CAM_BOW_THREEQUARTER", r"{pres_dir}/10_bow_threequarter.png", "INBOARD"),
    ("CAM_STERN_THREEQUARTER", r"{pres_dir}/11_stern_threequarter.png", "OUTBOARD")
]

for cam_name, out_file, prop_mode in pres_views:
    set_propulsion(prop_mode)
    cobj = bpy.data.objects.get(cam_name)
    if cobj:
        sc.camera = cobj
        sc.render.filepath = out_file
        bpy.ops.render.render(write_still=True)

# Save backup 09_final.blend and electric_boat_29ft_FINAL.blend
final_backup = r"c:\\Users\\yoeli\\Documents\\GetUpSoft_Workspace\\02_Products\\GetUpSoftBoat\\electric_boat_29ft\\blender\\backups\\09_final.blend"
final_blend = r"c:\\Users\\yoeli\\Documents\\GetUpSoft_Workspace\\02_Products\\GetUpSoftBoat\\electric_boat_29ft\\blender\\electric_boat_29ft_FINAL.blend"

bpy.ops.wm.save_as_mainfile(filepath=final_backup)
bpy.ops.wm.save_as_mainfile(filepath=final_blend)

# Clean up trailing numbers in render file names if any
for dpath in [r"{tech_dir}", r"{pres_dir}"]:
    for f in os.listdir(dpath):
        if "0001" in f:
            fp = os.path.join(dpath, f)
            os.remove(fp)

print("Render all technical & presentation views complete!")
"""

cmd = [blender_exe, "--background", blend_file, "--python-expr", py_script]
res = subprocess.run(cmd, capture_output=True, text=True)
print("Render script exit code:", res.returncode)
