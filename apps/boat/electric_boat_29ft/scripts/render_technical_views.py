import json
from blender_mcp_client import BlenderMCPClient

client = BlenderMCPClient()

code = """
import bpy
import os

# Open working file
blend_path = r"c:\\Users\\yoeli\\Documents\\GetUpSoft_Workspace\\02_Products\\GetUpSoftBoat\\electric_boat_29ft\\blender\\electric_boat_29ft.blend"
bpy.ops.wm.open_mainfile(filepath=blend_path)

render_dir = r"c:\\Users\\yoeli\\Documents\\GetUpSoft_Workspace\\02_Products\\GetUpSoftBoat\\electric_boat_29ft\\renders\\technical"
os.makedirs(render_dir, exist_ok=True)

scene = bpy.context.scene
scene.render.engine = 'BLENDER_WORKBENCH' if hasattr(bpy.types, 'WORKBENCH') else 'CYCLES'
scene.render.resolution_x = 1920
scene.render.resolution_y = 1080
scene.render.resolution_percentage = 100
scene.render.image_settings.file_format = 'PNG'

# Configure Workbench lighting for clean technical orthographic rendering
if hasattr(scene, 'display'):
    scene.display.shading.light = 'FLAT'
    scene.display.shading.color_type = 'MATERIAL'
    scene.display.shading.show_cavity = True

col_inboard = bpy.data.collections.get("07_PROPULSION_INBOARD")
col_outboard = bpy.data.collections.get("08_PROPULSION_OUTBOARD")

views_spec = [
    ("01_profile.png", "CAM_PROFILE", False),   # Inboard visible
    ("02_top.png", "CAM_TOP", False),           # Inboard visible
    ("03_front.png", "CAM_FRONT", False),       # Inboard visible
    ("04_transom.png", "CAM_TRANSOM", True),    # Outboard visible for transom view
    ("05_helm.png", "CAM_HELM", False),         # Helm close up
    ("06_isometric.png", "CAM_ISOMETRIC", False)# Isometric overview
]

rendered_files = []

for filename, cam_name, show_outboard in views_spec:
    cam_obj = bpy.data.objects.get(cam_name)
    if not cam_obj:
        continue
    scene.camera = cam_obj
    
    # Toggle visibility for Transom view (Outboard vs Inboard)
    if col_inboard and col_outboard:
        col_inboard.hide_render = show_outboard
        col_inboard.hide_viewport = show_outboard
        col_outboard.hide_render = not show_outboard
        col_outboard.hide_viewport = not show_outboard
    
    out_filepath = os.path.join(render_dir, filename)
    scene.render.filepath = out_filepath
    
    # Render view
    bpy.ops.render.render(write_still=True)
    rendered_files.append(out_filepath)

# Reset propulsion visibility to default (Inboard visible)
if col_inboard and col_outboard:
    col_inboard.hide_render = False
    col_inboard.hide_viewport = False
    col_outboard.hide_render = True
    col_outboard.hide_viewport = True

bpy.ops.wm.save_as_mainfile(filepath=blend_path)

result = {
    "rendered_files": rendered_files,
    "count": len(rendered_files),
    "resolution": "1920x1080"
}
"""

res = client.execute_code(code)
print("Technical Renders Generation Result:\n", json.dumps(res, indent=2))
