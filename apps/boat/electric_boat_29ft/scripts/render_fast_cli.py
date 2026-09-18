import os
import subprocess

blender_exe = r"C:\Program Files\Blender Foundation\Blender 5.2\blender.exe"
blend_file = r"c:\Users\yoeli\Documents\GetUpSoft_Workspace\02_Products\GetUpSoftBoat\electric_boat_29ft\blender\electric_boat_29ft.blend"
render_dir = r"c:\Users\yoeli\Documents\GetUpSoft_Workspace\02_Products\GetUpSoftBoat\electric_boat_29ft\renders\technical"

os.makedirs(render_dir, exist_ok=True)

views = [
    ("01_profile.png", "CAM_PROFILE", False),
    ("02_top.png", "CAM_TOP", False),
    ("03_front.png", "CAM_FRONT", False),
    ("04_transom.png", "CAM_TRANSOM", True),
    ("05_helm.png", "CAM_HELM", False),
    ("06_isometric.png", "CAM_ISOMETRIC", False)
]

for filename, camera_name, show_outboard in views:
    out_path = os.path.join(render_dir, filename)
    print(f"Rendering {camera_name} -> {out_path}...")
    
    # Python script to set camera and visibility before rendering
    py_expr = f"""
import bpy
sc = bpy.context.scene
sc.camera = bpy.data.objects.get('{camera_name}')
col_inboard = bpy.data.collections.get('07_PROPULSION_INBOARD')
col_outboard = bpy.data.collections.get('08_PROPULSION_OUTBOARD')
if col_inboard and col_outboard:
    col_inboard.hide_render = {show_outboard}
    col_outboard.hide_render = not {show_outboard}
sc.render.resolution_x = 1920
sc.render.resolution_y = 1080
sc.render.image_settings.file_format = 'PNG'
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
    print(f"Finished {filename}: exit code {res.returncode}")

print("All 6 technical renders finished.")
