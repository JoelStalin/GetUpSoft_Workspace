import json
from blender_mcp_client import BlenderMCPClient

client = BlenderMCPClient()

code = """
import bpy
import bmesh
import math
import mathutils

# Open working file
bpy.ops.wm.open_mainfile(filepath=r"c:\\Users\\yoeli\\Documents\\GetUpSoft_Workspace\\02_Products\\GetUpSoftBoat\\electric_boat_29ft\\blender\\electric_boat_29ft.blend")

col_cameras = bpy.data.collections.get("13_CAMERAS")
col_tech = bpy.data.collections.get("14_TECHNICAL_REFERENCE")

# Remove old cameras & tech refs
for col in [col_cameras, col_tech]:
    for o in list(col.objects):
        bpy.data.objects.remove(o, do_unlink=True)

# --- 1. CREATE ORTHOGRAPHIC TECHNICAL CAMERAS ---
cameras_spec = [
    ("CAM_PROFILE", (0.0, 10.0, 1.2), (math.radians(90), 0, math.radians(180)), 9.5),
    ("CAM_TOP", (0.0, 0.0, 10.0), (0, 0, math.radians(-90)), 9.5),
    ("CAM_FRONT", (6.0, 0.0, 1.2), (math.radians(90), 0, math.radians(-90)), 3.8),
    ("CAM_TRANSOM", (-6.0, 0.0, 1.2), (math.radians(90), 0, math.radians(90)), 3.8),
    ("CAM_HELM", (1.8, 0.0, 1.9), (math.radians(65), 0, math.radians(90)), 2.2),
    ("CAM_ISOMETRIC", (6.0, -6.0, 5.0), (math.radians(54.736), 0, math.radians(45.0)), 10.0)
]

created_cams = []

for name, loc, rot, ortho_scale in cameras_spec:
    cam_data = bpy.data.cameras.new(name=f"{name}_DATA")
    cam_data.type = 'ORTHO'
    cam_data.ortho_scale = ortho_scale
    cam_data.clip_start = 0.1
    cam_data.clip_end = 100.0
    
    cam_obj = bpy.data.objects.new(name, cam_data)
    cam_obj.location = loc
    cam_obj.rotation_euler = rot
    col_cameras.objects.link(cam_obj)
    created_cams.append(name)

# Set CAM_ISOMETRIC as active camera by default
cam_iso = bpy.data.objects.get("CAM_ISOMETRIC")
if cam_iso:
    bpy.context.scene.camera = cam_iso

# --- 2. CREATE VISUAL CENTERLINE & TECHNICAL REFERENCE DIMENSIONS ---
mat_hv = bpy.data.materials.get("MAT_HV_ORANGE")
mat_stainless = bpy.data.materials.get("MAT_STAINLESS")

# Centerline (Y = 0)
me_cl = bpy.data.meshes.new("CENTERLINE_REF_MESH")
bm_cl = bmesh.new()
bmesh.ops.create_cone(bm_cl, cap_ends=True, cap_tris=False, segments=12, radius1=0.015, radius2=0.015, depth=10.0)
rot_x = mathutils.Matrix.Rotation(math.radians(90.0), 4, 'Y')
bm_cl.transform(rot_x)
bm_cl.to_mesh(me_cl)
bm_cl.free()

o_cl = bpy.data.objects.new("CENTERLINE_REF", me_cl)
col_tech.objects.link(o_cl)
o_cl.data.materials.append(mat_hv)

# LOA Reference Line (8.84m along X)
me_loa = bpy.data.meshes.new("LOA_8.84m_REF_MESH")
bm_loa = bmesh.new()
bmesh.ops.create_cone(bm_loa, cap_ends=True, cap_tris=False, segments=12, radius1=0.01, radius2=0.01, depth=8.84)
bm_loa.transform(rot_x)
bm_loa.to_mesh(me_loa)
bm_loa.free()

o_loa = bpy.data.objects.new("LOA_8.84m_REF", me_loa)
o_loa.location = (0.0, -1.60, 0.05)
col_tech.objects.link(o_loa)
o_loa.data.materials.append(mat_stainless)

# BEAM Reference Line (2.80m along Y)
me_beam = bpy.data.meshes.new("BEAM_2.80m_REF_MESH")
bm_bm = bmesh.new()
bmesh.ops.create_cone(bm_bm, cap_ends=True, cap_tris=False, segments=12, radius1=0.01, radius2=0.01, depth=2.80)
rot_y = mathutils.Matrix.Rotation(math.radians(90.0), 4, 'X')
bm_bm.transform(rot_y)
bm_bm.to_mesh(me_beam)
bm_bm.free()

o_beam = bpy.data.objects.new("BEAM_2.80m_REF", me_beam)
o_beam.location = (4.50, 0.0, 0.05)
col_tech.objects.link(o_beam)
o_beam.data.materials.append(mat_stainless)

bpy.ops.wm.save_as_mainfile(filepath=bpy.data.filepath)

result = {
    "cameras_created": created_cams,
    "active_camera": bpy.context.scene.camera.name,
    "tech_references": ["CENTERLINE_REF", "LOA_8.84m_REF", "BEAM_2.80m_REF"],
    "saved_file": bpy.data.filepath
}
"""

res = client.execute_code(code)
print("Technical Cameras and Reference Setup Result:\n", json.dumps(res, indent=2))
