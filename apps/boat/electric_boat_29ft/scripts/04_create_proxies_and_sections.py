import json
import os
from blender_mcp_client import BlenderMCPClient

client = BlenderMCPClient()

proxy_script = """
import bpy
import os
import math
import mathutils
import bmesh

# Open 02_scaled.blend
bpy.ops.wm.open_mainfile(filepath=r"c:\\Users\\yoeli\\Documents\\GetUpSoft_Workspace\\02_Products\\GetUpSoftBoat\\electric_boat_29ft\\blender\\backups\\02_scaled.blend")

master_col = bpy.context.scene.collection

# 1. 00_DATUM
col_datum = bpy.data.collections.get("00_DATUM")
if not col_datum:
    col_datum = bpy.data.collections.new("00_DATUM")
    master_col.children.link(col_datum)

datums = [
    ("DATUM_CENTERLINE", (0, 0, 0), (0, 0, 0)),
    ("DATUM_WATERLINE_REFERENCE", (0, 0, 0.45), (0, 0, 0)),
    ("DATUM_DECK_REFERENCE", (0, 0, 0.85), (0, 0, 0)),
    ("DATUM_TRANSOM_PLANE", (-4.42, 0, 0), (0, 0, 0)),
    ("DATUM_BOW_LIMIT", (4.42, 0, 0), (0, 0, 0)),
    ("DATUM_STERN_LIMIT", (-4.42, 0, 0), (0, 0, 0))
]

for dname, dloc, drot in datums:
    dobj = bpy.data.objects.get(dname)
    if not dobj:
        dobj = bpy.data.objects.new(dname, None)
        col_datum.objects.link(dobj)
    dobj.location = dloc
    dobj.rotation_euler = drot

# 2. 00_ENGINEERING_PROXIES
col_proxy = bpy.data.collections.get("00_ENGINEERING_PROXIES")
if not col_proxy:
    col_proxy = bpy.data.collections.new("00_ENGINEERING_PROXIES")
    master_col.children.link(col_proxy)

# Translucent Proxy Material
mat_proxy = bpy.data.materials.get("MAT_PROXY_TRANSLUCENT")
if not mat_proxy:
    mat_proxy = bpy.data.materials.new("MAT_PROXY_TRANSLUCENT")
    mat_proxy.use_nodes = True
    bsdf = mat_proxy.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs['Base Color'].default_value = (0.0, 0.6, 0.9, 0.4)
        bsdf.inputs['Roughness'].default_value = 0.1

proxies_def = [
    ("PROXY_BATTERY_ENVELOPE", (0.0, 0.0, 0.38), (2.80, 1.20, 0.45)),
    ("PROXY_BMS_ENVELOPE", (1.65, 0.0, 0.45), (0.50, 0.70, 0.35)),
    ("PROXY_INVERTER_ENVELOPE", (-1.75, 0.0, 0.48), (0.55, 0.45, 0.30)),
    ("PROXY_INBOARD_MOTOR", (-2.45, 0.0, 0.35), (0.60, 0.40, 0.40)),
    ("PROXY_SHAFT_CORRIDOR", (-3.35, 0.0, 0.20), (1.15, 0.12, 0.12)),
    ("PROXY_OUTBOARD_CLEARANCE", (-4.42, 0.0, 0.45), (0.50, 0.40, 1.30)),
    ("PROXY_HELM_OPERATOR", (0.35, 0.0, 1.70), (0.60, 0.60, 1.75)),
    ("PROXY_HARDTOP", (-0.20, 0.0, 2.15), (3.60, 2.20, 0.10)),
    ("PROXY_SOLAR_AREA", (-0.20, 0.0, 2.20), (3.40, 2.00, 0.04))
]

for pname, ploc, pscale in proxies_def:
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)
    me = bpy.data.meshes.new(f"{pname}_MESH")
    bm.to_mesh(me)
    bm.free()
    
    pobj = bpy.data.objects.new(pname, me)
    pobj.location = ploc
    pobj.scale = pscale
    pobj.data.materials.append(mat_proxy)
    col_proxy.objects.link(pobj)

# 3. PERSON_50_PERCENTILE (1.75m Ergonomic Reference)
bm_h = bmesh.new()
bmesh.ops.create_cube(bm_h, size=1.0)
me_h = bpy.data.meshes.new("PERSON_50_PERCENTILE_MESH")
bm_h.to_mesh(me_h)
bm_h.free()

obj_h = bpy.data.objects.new("PERSON_50_PERCENTILE", me_h)
obj_h.location = (0.35, 0.0, 1.725)
obj_h.scale = (0.35, 0.45, 1.75)
col_proxy.objects.link(obj_h)

# Save backup 03_proxy_layout.blend
bpy.ops.wm.save_as_mainfile(filepath=r"c:\\Users\\yoeli\\Documents\\GetUpSoft_Workspace\\02_Products\\GetUpSoftBoat\\electric_boat_29ft\\blender\\backups\\03_proxy_layout.blend")

# 4. Generate Validation Cross Section Screenshots at 20%, 35%, 50%, 65%, 80% LOA
val_dir = r"c:\\Users\\yoeli\\Documents\\GetUpSoft_Workspace\\02_Products\\GetUpSoftBoat\\electric_boat_29ft\\renders\\validation"
os.makedirs(val_dir, exist_ok=True)

sc = bpy.context.scene
sc.render.resolution_x = 1280
sc.render.resolution_y = 720

cam_data = bpy.data.cameras.new("VAL_CAM_DATA")
cam_data.type = 'ORTHO'
cam_data.ortho_scale = 5.0
cam_obj = bpy.data.objects.new("VAL_CAM", cam_data)
master_col.objects.link(cam_obj)
sc.camera = cam_obj

# LOA is 8.84m, from X = -4.42 to +4.42
percentages = [20, 35, 50, 65, 80]
for p in percentages:
    x_pos = -4.42 + (8.84 * (p / 100.0))
    cam_obj.location = (x_pos + 4.0, 0, 1.0)
    cam_obj.rotation_euler = (0, math.radians(90.0), math.radians(90.0))
    sc.render.filepath = os.path.join(val_dir, f"cross_section_{p}.png")
    bpy.ops.render.render(write_still=True)

bpy.data.objects.remove(cam_obj, do_unlink=True)
bpy.data.cameras.remove(cam_data, do_unlink=True)

result = {
    "datums_created": len(datums),
    "proxies_created": len(proxies_def),
    "human_ref_created": True,
    "cross_sections_rendered": [f"cross_section_{p}.png" for p in percentages],
    "backup_03": r"blender/backups/03_proxy_layout.blend"
}
"""

res = client.execute_code(proxy_script)
print("Proxy Layout & Cross Sections Result:\n", json.dumps(res, indent=2))
