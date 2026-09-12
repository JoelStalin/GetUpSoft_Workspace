import bpy
import os

render_dir = r"c:\Users\yoeli\Documents\GetUpSoft_Workspace\02_Products\GetUpSoftBoat\electric_boat_29ft\renders\technical"
os.makedirs(render_dir, exist_ok=True)

scene = bpy.context.scene
scene.render.engine = 'BLENDER_WORKBENCH' if hasattr(bpy.types, 'WORKBENCH') else 'CYCLES'
scene.render.resolution_x = 1920
scene.render.resolution_y = 1080
scene.render.resolution_percentage = 100
scene.render.image_settings.file_format = 'PNG'

col_inboard = bpy.data.collections.get("07_PROPULSION_INBOARD")
col_outboard = bpy.data.collections.get("08_PROPULSION_OUTBOARD")

views_spec = [
    ("01_profile.png", "CAM_PROFILE", False),
    ("02_top.png", "CAM_TOP", False),
    ("03_front.png", "CAM_FRONT", False),
    ("04_transom.png", "CAM_TRANSOM", True),
    ("05_helm.png", "CAM_HELM", False),
    ("06_isometric.png", "CAM_ISOMETRIC", False)
]

for filename, cam_name, show_outboard in views_spec:
    cam_obj = bpy.data.objects.get(cam_name)
    if not cam_obj:
        print(f"Camera {cam_name} not found!")
        continue
    scene.camera = cam_obj
    
    if col_inboard and col_outboard:
        col_inboard.hide_render = show_outboard
        col_inboard.hide_viewport = show_outboard
        col_outboard.hide_render = not show_outboard
        col_outboard.hide_viewport = not show_outboard
    
    out_filepath = os.path.join(render_dir, filename)
    scene.render.filepath = out_filepath
    
    print(f"Rendering view {cam_name} -> {out_filepath}")
    bpy.ops.render.render(write_still=True)

# Reset propulsion visibility to default (Inboard visible)
if col_inboard and col_outboard:
    col_inboard.hide_render = False
    col_inboard.hide_viewport = False
    col_outboard.hide_render = True
    col_outboard.hide_viewport = True

print("All 6 technical renders completed successfully.")
