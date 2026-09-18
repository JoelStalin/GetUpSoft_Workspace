"""
Script: re_render_bicolor_views.py (fixed encoding)
"""
import os
import subprocess
import sys

blender_exe = r"C:\Program Files\Blender Foundation\Blender 5.2\blender.exe"
blend_file  = r"c:\Users\yoeli\Documents\GetUpSoft_Workspace\02_Products\GetUpSoftBoat\electric_boat_29ft\blender\electric_boat_29ft_FINAL.blend"
tech_dir    = r"c:\Users\yoeli\Documents\GetUpSoft_Workspace\02_Products\GetUpSoftBoat\electric_boat_29ft\renders\technical"
pres_dir    = r"c:\Users\yoeli\Documents\GetUpSoft_Workspace\02_Products\GetUpSoftBoat\electric_boat_29ft\renders\presentation"

views = [
    ("CAM_PROFILE_PORT",        tech_dir,  "01_profile_inboard.png"),
    ("CAM_FRONT",               tech_dir,  "03_front.png"),
    ("CAM_TRANSOM",             tech_dir,  "04_transom_outboard.png"),
    ("CAM_ISOMETRIC_PORT",      pres_dir,  "08_isometric_port.png"),
    ("CAM_ISOMETRIC_STARBOARD", pres_dir,  "09_isometric_starboard.png"),
    ("CAM_BOW_THREEQUARTER",    pres_dir,  "10_bow_threequarter.png"),
    ("CAM_STERN_THREEQUARTER",  pres_dir,  "11_stern_threequarter.png"),
]

for cam_name, out_dir, out_name in views:
    out_path = os.path.join(out_dir, out_name)
    py_expr = (
        "import bpy; sc=bpy.context.scene; "
        f"sc.camera=bpy.data.objects.get('{cam_name}'); "
        "sc.render.resolution_x=1920; sc.render.resolution_y=1080; "
        "sc.render.image_settings.file_format='PNG'"
    )
    cmd = [blender_exe, "--background", blend_file,
           "--python-expr", py_expr,
           "--render-output", out_path,
           "-f", "1"]
    res = subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8", errors="replace")
    code = res.returncode

    # Cleanup frame-number suffix if present
    for d in [out_dir]:
        for f in os.listdir(d):
            fp = os.path.join(d, f)
            if f.endswith(".png.png") or "0001" in f:
                clean = f.replace("0001.png", ".png").replace(".png.png", ".png")
                clean_fp = os.path.join(d, clean)
                if os.path.exists(clean_fp):
                    os.remove(fp)
                else:
                    os.rename(fp, clean_fp)

    print(f"[{code}] {cam_name} done")

print()
print("Technical Renders:", sorted(os.listdir(tech_dir)))
print("Presentation Renders:", sorted(os.listdir(pres_dir)))
