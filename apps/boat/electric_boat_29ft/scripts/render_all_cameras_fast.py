import os
import subprocess

blender_exe = r"C:\Program Files\Blender Foundation\Blender 5.2\blender.exe"
blend_file = r"c:\Users\yoeli\Documents\GetUpSoft_Workspace\02_Products\GetUpSoftBoat\electric_boat_29ft\blender\backups\08_validation.blend"
tech_dir = r"c:\Users\yoeli\Documents\GetUpSoft_Workspace\02_Products\GetUpSoftBoat\electric_boat_29ft\renders\technical"
pres_dir = r"c:\Users\yoeli\Documents\GetUpSoft_Workspace\02_Products\GetUpSoftBoat\electric_boat_29ft\renders\presentation"

os.makedirs(tech_dir, exist_ok=True)
os.makedirs(pres_dir, exist_ok=True)

# List of all camera renders
renders = [
    ("CAM_PROFILE_PORT", os.path.join(tech_dir, "01_profile_inboard.png"), "INBOARD"),
    ("CAM_TOP", os.path.join(tech_dir, "02_top_inboard.png"), "INBOARD"),
    ("CAM_FRONT", os.path.join(tech_dir, "03_front.png"), "INBOARD"),
    ("CAM_TRANSOM", os.path.join(tech_dir, "04_transom_outboard.png"), "OUTBOARD"),
    ("CAM_HELM", os.path.join(tech_dir, "05_helm.png"), "INBOARD"),
    ("CAM_PROFILE_PORT", os.path.join(tech_dir, "06_battery_section.png"), "INBOARD"),
    ("CAM_PROFILE_PORT", os.path.join(tech_dir, "07_propulsion_section.png"), "INBOARD"),
    ("CAM_ISOMETRIC_PORT", os.path.join(pres_dir, "08_isometric_port.png"), "INBOARD"),
    ("CAM_ISOMETRIC_STARBOARD", os.path.join(pres_dir, "09_isometric_starboard.png"), "INBOARD"),
    ("CAM_BOW_THREEQUARTER", os.path.join(pres_dir, "10_bow_threequarter.png"), "INBOARD"),
    ("CAM_STERN_THREEQUARTER", os.path.join(pres_dir, "11_stern_threequarter.png"), "OUTBOARD")
]

for cam_name, out_path, prop_mode in renders:
    py_expr = f"""
import bpy
sc = bpy.context.scene
sc.render.resolution_x = 1920
sc.render.resolution_y = 1080
sc.render.image_settings.file_format = 'PNG'

col_inboard = bpy.data.collections.get('07_PROPULSION_INBOARD')
col_outboard = bpy.data.collections.get('08_PROPULSION_OUTBOARD')

if '{prop_mode}' == 'INBOARD':
    if col_inboard: col_inboard.hide_render = False
    if col_outboard: col_outboard.hide_render = True
else:
    if col_inboard: col_inboard.hide_render = True
    if col_outboard: col_outboard.hide_render = False

cobj = bpy.data.objects.get('{cam_name}')
if cobj:
    sc.camera = cobj
"""
    cmd = [
        blender_exe,
        "--background",
        blend_file,
        "--python-expr", py_expr,
        "--render-output", out_path,
        "-f", "1"
    ]
    res = subprocess.run(cmd, capture_output=True, text=True)
    print(f"Rendered {os.path.basename(out_path)}, exit code:", res.returncode)

# Clean up trailing numbers in render file names if any
for dpath in [tech_dir, pres_dir]:
    for f in os.listdir(dpath):
        if "0001" in f:
            fp = os.path.join(dpath, f)
            new_f = f.replace("0001.png", ".png").replace(".png0001", ".png")
            new_fp = os.path.join(dpath, new_f)
            if os.path.exists(new_fp):
                os.remove(fp)
            else:
                os.rename(fp, new_fp)

print("Final Technical Renders:", sorted(os.listdir(tech_dir)))
print("Final Presentation Renders:", sorted(os.listdir(pres_dir)))
