import json
import os
from blender_mcp_client import BlenderMCPClient

client = BlenderMCPClient()

render_code = """
import bpy
import os
import math

bpy.ops.wm.open_mainfile(filepath=r"c:\\Users\\yoeli\\Documents\\GetUpSoft_Workspace\\02_Products\\GetUpSoftBoat\\electric_boat_29ft\\blender\\backups\\08_validation.blend")

sc = bpy.context.scene
sc.render.resolution_x = 1920
sc.render.resolution_y = 1080
sc.render.image_settings.file_format = 'PNG'

col_inboard = bpy.data.collections.get('07_PROPULSION_INBOARD')
col_outboard = bpy.data.collections.get('08_PROPULSION_OUTBOARD')

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

tech_dir = r"c:\\Users\\yoeli\\Documents\\GetUpSoft_Workspace\\02_Products\\GetUpSoftBoat\\electric_boat_29ft\\renders\\technical"
pres_dir = r"c:\\Users\\yoeli\\Documents\\GetUpSoft_Workspace\\02_Products\\GetUpSoftBoat\\electric_boat_29ft\\renders\\presentation"

os.makedirs(tech_dir, exist_ok=True)
os.makedirs(pres_dir, exist_ok=True)

# Technical Views
set_propulsion("INBOARD")
sc.camera = bpy.data.objects.get("CAM_PROFILE_PORT")
sc.render.filepath = os.path.join(tech_dir, "01_profile_inboard.png")
bpy.ops.render.render(write_still=True)

sc.camera = bpy.data.objects.get("CAM_TOP")
sc.render.filepath = os.path.join(tech_dir, "02_top_inboard.png")
bpy.ops.render.render(write_still=True)

sc.camera = bpy.data.objects.get("CAM_FRONT")
sc.render.filepath = os.path.join(tech_dir, "03_front.png")
bpy.ops.render.render(write_still=True)

set_propulsion("OUTBOARD")
sc.camera = bpy.data.objects.get("CAM_TRANSOM")
sc.render.filepath = os.path.join(tech_dir, "04_transom_outboard.png")
bpy.ops.render.render(write_still=True)

set_propulsion("INBOARD")
sc.camera = bpy.data.objects.get("CAM_HELM")
sc.render.filepath = os.path.join(tech_dir, "05_helm.png")
bpy.ops.render.render(write_still=True)

sc.camera = bpy.data.objects.get("CAM_PROFILE_PORT")
sc.render.filepath = os.path.join(tech_dir, "06_battery_section.png")
bpy.ops.render.render(write_still=True)

sc.render.filepath = os.path.join(tech_dir, "07_propulsion_section.png")
bpy.ops.render.render(write_still=True)

# Presentation Views
sc.camera = bpy.data.objects.get("CAM_ISOMETRIC_PORT")
sc.render.filepath = os.path.join(pres_dir, "08_isometric_port.png")
bpy.ops.render.render(write_still=True)

sc.camera = bpy.data.objects.get("CAM_ISOMETRIC_STARBOARD")
sc.render.filepath = os.path.join(pres_dir, "09_isometric_starboard.png")
bpy.ops.render.render(write_still=True)

sc.camera = bpy.data.objects.get("CAM_BOW_THREEQUARTER")
sc.render.filepath = os.path.join(pres_dir, "10_bow_threequarter.png")
bpy.ops.render.render(write_still=True)

set_propulsion("OUTBOARD")
sc.camera = bpy.data.objects.get("CAM_STERN_THREEQUARTER")
sc.render.filepath = os.path.join(pres_dir, "11_stern_threequarter.png")
bpy.ops.render.render(write_still=True)

# Save backup 09_final.blend and electric_boat_29ft_FINAL.blend
final_backup = r"c:\\Users\\yoeli\\Documents\\GetUpSoft_Workspace\\02_Products\\GetUpSoftBoat\\electric_boat_29ft\\blender\\backups\\09_final.blend"
final_blend = r"c:\\Users\\yoeli\\Documents\\GetUpSoft_Workspace\\02_Products\\GetUpSoftBoat\\electric_boat_29ft\\blender\\electric_boat_29ft_FINAL.blend"

bpy.ops.wm.save_as_mainfile(filepath=final_backup)
bpy.ops.wm.save_as_mainfile(filepath=final_blend)

result = {
    "tech_renders": sorted(os.listdir(tech_dir)),
    "pres_renders": sorted(os.listdir(pres_dir)),
    "saved_final_blend": final_blend
}
"""

res = client.execute_code(render_code)
print("Render Direct Output:\n", json.dumps(res, indent=2))
