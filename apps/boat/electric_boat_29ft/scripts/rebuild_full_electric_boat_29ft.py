import json
import os
from blender_mcp_client import BlenderMCPClient

client = BlenderMCPClient()

master_script = """
import bpy
import math
import mathutils
import bmesh

# Open fresh original file
bpy.ops.wm.open_mainfile(filepath=r"c:\\Users\\yoeli\\Documents\\GetUpSoft_Workspace\\02_Products\\GetUpSoftBoat\\electric_boat_29ft\\source\\board_original.blend")

# 1. Units setup
bpy.context.scene.unit_settings.system = 'METRIC'
bpy.context.scene.unit_settings.scale_length = 1.0
bpy.context.scene.unit_settings.length_unit = 'METERS'

# 2. Cleanup environment props only
env_names = ["Sphere", "Plane.001", "Plane.002", "Plane.003", "stone 1", "stone2", "stone3", "Lamp", "Lamp.001"]
for name in env_names:
    o = bpy.data.objects.get(name)
    if o:
        bpy.data.objects.remove(o, do_unlink=True)

hull_main = bpy.data.objects.get("Cube.003")
if hull_main:
    hull_main.name = "HULL_MAIN"

boat_objs = [o for o in bpy.data.objects if o.type in ['MESH', 'CURVE']]

# Measure hull bounds
mw_hull = hull_main.matrix_world
hull_corners = [mw_hull @ mathutils.Vector(c) for c in hull_main.bound_box]

min_x, max_x = min(c.x for c in hull_corners), max(c.x for c in hull_corners)
min_y, max_y = min(c.y for c in hull_corners), max(c.y for c in hull_corners)
min_z, max_z = min(c.z for c in hull_corners), max(c.z for c in hull_corners)

orig_width_x = max_x - min_x
orig_length_y = max_y - min_y
orig_height_z = max_z - min_z

center_x = (min_x + max_x) / 2.0
center_y = (min_y + max_y) / 2.0
base_z = min_z

target_loa = 8.84
target_beam = 2.80

scale_factor_loa = target_loa / orig_length_y
scale_factor_beam = target_beam / orig_width_x
scale_factor_z = scale_factor_loa

rot_mat = mathutils.Matrix.Rotation(math.radians(90.0), 4, 'Z')
trans_mat = mathutils.Matrix.Translation(mathutils.Vector((-center_x, -center_y, -base_z)))
scale_mat = mathutils.Matrix.Scale(scale_factor_loa, 4, (1, 0, 0)) * \
            mathutils.Matrix.Scale(scale_factor_beam, 4, (0, 1, 0)) * \
            mathutils.Matrix.Scale(scale_factor_z, 4, (0, 0, 1))

combined_mat = scale_mat @ rot_mat @ trans_mat

for o in boat_objs:
    if hasattr(o, "data") and hasattr(o.data, "transform"):
        o.data.transform(o.matrix_world)
        o.data.transform(combined_mat)
        o.matrix_world = mathutils.Matrix.Identity(4)
        o.location = (0, 0, 0)
        o.rotation_euler = (0, 0, 0)
        o.scale = (1, 1, 1)

bpy.context.view_layer.update()

# 3. Standardized Collections Setup
collections_map = {
    "01_HULL": ["HULL_MAIN"],
    "02_DECK_FITTINGS": ["BezierCurve", "Cylinder.002"],
    "03_HELM_ORIGINAL": ["Cube", "Plane", "Cylinder", "Cube.001", "Cube.002", "Cube.004", "Cube.005"],
    "04_HARDTOP": [],
    "05_SOLAR_SYSTEM": [],
    "06_BATTERY_SYSTEM": [],
    "07_PROPULSION_INBOARD": [],
    "08_PROPULSION_OUTBOARD": [],
    "09_HELM_UPGRADE": [],
    "10_ELECTRICAL": [],
    "11_MATERIALS": [],
    "12_INTERFERENCE_AUDIT": [],
    "13_CAMERAS": [],
    "14_TECHNICAL_REFERENCE": []
}

master_col = bpy.context.scene.collection
created_cols = {}
for cname, onames in collections_map.items():
    col = bpy.data.collections.get(cname)
    if not col:
        col = bpy.data.collections.new(cname)
        master_col.children.link(col)
    created_cols[cname] = col
    for oname in onames:
        o = bpy.data.objects.get(oname)
        if o:
            for parent_col in o.users_collection:
                parent_col.objects.unlink(o)
            col.objects.link(o)

# 4. Materials Setup
def get_or_create_material(name, color, roughness=0.2, metallic=0.0, emission=None):
    mat = bpy.data.materials.get(name)
    if not mat:
        mat = bpy.data.materials.new(name)
        mat.use_nodes = True
        bsdf = mat.node_tree.nodes.get("Principled BSDF")
        if bsdf:
            bsdf.inputs['Base Color'].default_value = color
            bsdf.inputs['Roughness'].default_value = roughness
            bsdf.inputs['Metallic'].default_value = metallic
            if emission and 'Emission Color' in bsdf.inputs:
                bsdf.inputs['Emission Color'].default_value = emission
                bsdf.inputs['Emission Strength'].default_value = 2.0
    return mat

mat_solar_cell = get_or_create_material("MAT_SOLAR_CELL", (0.02, 0.05, 0.25, 1.0), roughness=0.1, metallic=0.9)
mat_battery_case = get_or_create_material("MAT_BATTERY_CASE", (0.1, 0.12, 0.15, 1.0), roughness=0.3, metallic=0.1)
mat_hv_orange = get_or_create_material("MAT_HV_ORANGE", (1.0, 0.22, 0.0, 1.0), roughness=0.4, metallic=0.0)
mat_motor = get_or_create_material("MAT_MOTOR", (0.08, 0.08, 0.08, 1.0), roughness=0.2, metallic=0.8)
mat_stainless = get_or_create_material("MAT_STAINLESS", (0.8, 0.82, 0.85, 1.0), roughness=0.15, metallic=0.95)
mat_grp_hardtop = get_or_create_material("MAT_GRP_HARDTOP", (0.95, 0.95, 0.95, 1.0), roughness=0.15, metallic=0.0)
mat_display_emission = get_or_create_material("MAT_DISPLAY_EMISSION", (0.0, 0.7, 1.0, 1.0), roughness=0.1, metallic=0.0, emission=(0.0, 0.7, 1.0, 1.0))

# 5. Create Hardtop Shell & Pillars (04_HARDTOP)
col_hardtop = created_cols["04_HARDTOP"]

bm_ht = bmesh.new()
ht_length, ht_width = 3.6, 2.2
bmesh.ops.create_grid(bm_ht, x_segments=16, y_segments=8, size=1.0)

for v in bm_ht.verts:
    v.co.x *= (ht_length / 2.0)
    v.co.y *= (ht_width / 2.0)
    norm_x = v.co.x / (ht_length / 2.0)
    v.co.z = 0.12 * math.cos(norm_x * math.pi * 0.5) - 0.05 * (v.co.y / (ht_width / 2.0))**2

me_ht = bpy.data.meshes.new("HARDTOP_SHELL_MESH")
bm_ht.to_mesh(me_ht)
bm_ht.free()

obj_ht = bpy.data.objects.new("HARDTOP_SHELL", me_ht)
obj_ht.location = (-0.2, 0.0, 2.15)
obj_ht.data.materials.append(mat_grp_hardtop)
col_hardtop.objects.link(obj_ht)

# Add Solidify modifier to hardtop
mod_sol = obj_ht.modifiers.new(name="Solidify", type='SOLIDIFY')
mod_sol.thickness = 0.06

# Hardtop Support Pillars
for side, y_pos in [("PORT", 0.95), ("STARBOARD", -0.95)]:
    bm_p = bmesh.new()
    bmesh.ops.create_cube(bm_p, size=1.0)
    me_p = bpy.data.meshes.new(f"HARDTOP_SUPPORT_{side}_MESH")
    bm_p.to_mesh(me_p)
    bm_p.free()
    
    obj_p = bpy.data.objects.new(f"HARDTOP_SUPPORT_{side}", me_p)
    obj_p.location = (-0.3, y_pos, 1.45)
    obj_p.scale = (0.12, 0.10, 1.35)
    obj_p.rotation_euler = (0, math.radians(-12.0), 0)
    obj_p.data.materials.append(mat_grp_hardtop)
    col_hardtop.objects.link(obj_p)

# 6. Solar Panel Array (05_SOLAR_SYSTEM)
col_solar = created_cols["05_SOLAR_SYSTEM"]
solar_panel_rows = [-1.1, -0.4, 0.3, 1.0]
solar_panel_cols = [-0.55, 0.55]
sp_count = 1

for rx in solar_panel_rows:
    for cy in solar_panel_cols:
        bm_sp = bmesh.new()
        bmesh.ops.create_cube(bm_sp, size=1.0)
        me_sp = bpy.data.meshes.new(f"SOLAR_PANEL_0{sp_count}_MESH")
        bm_sp.to_mesh(me_sp)
        bm_sp.free()
        
        obj_sp = bpy.data.objects.new(f"SOLAR_PANEL_0{sp_count}", me_sp)
        norm_x = rx / (ht_length / 2.0)
        z_offset = 2.19 + 0.12 * math.cos(norm_x * math.pi * 0.5)
        obj_sp.location = (rx, cy, z_offset)
        obj_sp.scale = (0.60, 0.90, 0.02)
        obj_sp.data.materials.append(mat_solar_cell)
        col_solar.objects.link(obj_sp)
        sp_count += 1

# 7. Battery Bank & BMS System (06_BATTERY_SYSTEM)
col_bat = created_cols["06_BATTERY_SYSTEM"]

# Keel structural battery tray
bm_tray = bmesh.new()
bmesh.ops.create_cube(bm_tray, size=1.0)
me_tray = bpy.data.meshes.new("BATTERY_TRAY_MESH")
bm_tray.to_mesh(me_tray)
bm_tray.free()

obj_tray = bpy.data.objects.new("BATTERY_TRAY", me_tray)
obj_tray.location = (0.0, 0.0, 0.15)
obj_tray.scale = (2.60, 1.10, 0.10)
obj_tray.data.materials.append(mat_stainless)
col_bat.objects.link(obj_tray)

# 6 Battery Modules
bat_positions = [
    (-0.9, -0.32, 0.38), (-0.9, 0.32, 0.38),
    (0.0, -0.32, 0.38),  (0.0, 0.32, 0.38),
    (0.9, -0.32, 0.38),  (0.9, 0.32, 0.38)
]

for idx, (bx, by, bz) in enumerate(bat_positions, 1):
    bm_b = bmesh.new()
    bmesh.ops.create_cube(bm_b, size=1.0)
    me_b = bpy.data.meshes.new(f"BATTERY_MODULE_0{idx}_MESH")
    bm_b.to_mesh(me_b)
    bm_b.free()
    
    obj_b = bpy.data.objects.new(f"BATTERY_MODULE_0{idx}", me_b)
    obj_b.location = (bx, by, bz)
    obj_b.scale = (0.75, 0.55, 0.35)
    obj_b.data.materials.append(mat_battery_case)
    col_bat.objects.link(obj_b)

# BMS Controller & HV Junction Box
bms_components = [
    ("HV_JUNCTION_BOX", (1.65, 0.0, 0.35), (0.45, 0.65, 0.28), mat_battery_case),
    ("BMS_CONTROLLER", (1.65, 0.0, 0.55), (0.35, 0.45, 0.10), mat_motor),
    ("HV_CONTACTOR", (1.65, 0.25, 0.52), (0.12, 0.12, 0.12), mat_hv_orange),
    ("MAIN_FUSE", (1.65, -0.25, 0.52), (0.10, 0.10, 0.10), mat_stainless),
    ("SERVICE_DISCONNECT", (1.88, 0.0, 0.55), (0.08, 0.15, 0.12), mat_hv_orange),
    ("CURRENT_SENSOR", (1.45, 0.0, 0.52), (0.10, 0.12, 0.08), mat_motor)
]

for cname, cloc, cscale, cmat in bms_components:
    bm_c = bmesh.new()
    bmesh.ops.create_cube(bm_c, size=1.0)
    me_c = bpy.data.meshes.new(f"{cname}_MESH")
    bm_c.to_mesh(me_c)
    bm_c.free()
    
    obj_c = bpy.data.objects.new(cname, me_c)
    obj_c.location = cloc
    obj_c.scale = cscale
    obj_c.data.materials.append(cmat)
    col_bat.objects.link(obj_c)

# 8. Modular Propulsion (07_PROPULSION_INBOARD & 08_PROPULSION_OUTBOARD)
col_inboard = created_cols["07_PROPULSION_INBOARD"]
col_outboard = created_cols["08_PROPULSION_OUTBOARD"]

inboard_parts = [
    ("INVERTER_INBOARD", (-1.75, 0.0, 0.48), (0.50, 0.42, 0.28), mat_motor),
    ("INBOARD_MOTOR", (-2.45, 0.0, 0.35), (0.55, 0.38, 0.38), mat_motor),
    ("COUPLING", (-2.80, 0.0, 0.32), (0.12, 0.20, 0.20), mat_stainless),
    ("SHAFT", (-3.35, 0.0, 0.20), (1.10, 0.05, 0.05), mat_stainless),
    ("STERN_TUBE", (-3.65, 0.0, 0.15), (0.50, 0.08, 0.08), mat_battery_case),
    ("PROPELLER", (-4.0, 0.0, 0.08), (0.15, 0.42, 0.42), mat_stainless)
]

for pname, ploc, pscale, pmat in inboard_parts:
    bm_p = bmesh.new()
    if "SHAFT" in pname or "STERN_TUBE" in pname or "COUPLING" in pname or "PROPELLER" in pname:
        bmesh.ops.create_cone(bm_p, cap_ends=True, radius1=0.5, radius2=0.5, depth=1.0, segments=16)
    else:
        bmesh.ops.create_cube(bm_p, size=1.0)
    me_p = bpy.data.meshes.new(f"{pname}_MESH")
    bm_p.to_mesh(me_p)
    bm_p.free()
    
    obj_p = bpy.data.objects.new(pname, me_p)
    obj_p.location = ploc
    obj_p.scale = pscale
    if "SHAFT" in pname or "STERN_TUBE" in pname:
        obj_p.rotation_euler = (0, math.radians(90.0), 0)
    obj_p.data.materials.append(pmat)
    col_inboard.objects.link(obj_p)

# Outboard Modular System (In separate collection)
outboard_parts = [
    ("CENTER_TRANSOM_BRACKET", (-4.18, 0.0, 0.65), (0.25, 0.45, 0.55), mat_battery_case),
    ("OUTBOARD_MOTOR_ELECTRIC", (-4.42, 0.0, 0.45), (0.40, 0.35, 1.25), mat_motor),
    ("PORT_SWIM_PLATFORM", (-4.10, 1.05, 0.42), (0.55, 0.70, 0.08), mat_grp_hardtop),
    ("STARBOARD_SWIM_PLATFORM", (-4.10, -1.05, 0.42), (0.55, 0.70, 0.08), mat_grp_hardtop)
]

for pname, ploc, pscale, pmat in outboard_parts:
    bm_p = bmesh.new()
    bmesh.ops.create_cube(bm_p, size=1.0)
    me_p = bpy.data.meshes.new(f"{pname}_MESH")
    bm_p.to_mesh(me_p)
    bm_p.free()
    
    obj_p = bpy.data.objects.new(pname, me_p)
    obj_p.location = ploc
    obj_p.scale = pscale
    obj_p.data.materials.append(pmat)
    col_outboard.objects.link(obj_p)

# Hide Outboard collection so Inboard is active visible render
col_outboard.hide_render = True
col_outboard.hide_viewport = True

# 9. Upgraded Helm & MFD Screens (09_HELM_UPGRADE)
col_helm = created_cols["09_HELM_UPGRADE"]

helm_displays = [
    ("BMS_SCREEN_MFD", (0.65, 0.28, 1.38), (0.05, 0.35, 0.24), (0, math.radians(-15.0), 0), mat_display_emission),
    ("NAVIGATION_SCREEN_MFD", (0.65, -0.28, 1.38), (0.05, 0.35, 0.24), (0, math.radians(-15.0), 0), mat_display_emission),
    ("STEERING_WHEEL_UPGRADED", (0.68, 0.0, 1.25), (0.10, 0.32, 0.32), (0, math.radians(20.0), 0), mat_stainless),
    ("ELECTRONIC_THROTTLE", (0.65, 0.42, 1.22), (0.12, 0.08, 0.18), (0, 0, 0), mat_stainless),
    ("DRIVE_SELECTOR", (0.65, -0.42, 1.22), (0.10, 0.10, 0.08), (0, 0, 0), mat_battery_case),
    ("HV_EMERGENCY_DISCONNECT", (0.60, 0.48, 1.15), (0.08, 0.08, 0.08), (0, 0, 0), mat_hv_orange),
    ("START_STOP_BUTTON", (0.60, -0.48, 1.15), (0.06, 0.06, 0.06), (0, 0, 0), mat_display_emission)
]

for dname, dloc, dscale, drot, dmat in helm_displays:
    bm_d = bmesh.new()
    if "WHEEL" in dname:
        bmesh.ops.create_cone(bm_d, cap_ends=True, radius1=0.4, radius2=0.4, depth=0.08, segments=16)
    else:
        bmesh.ops.create_cube(bm_d, size=1.0)
    me_d = bpy.data.meshes.new(f"{dname}_MESH")
    bm_d.to_mesh(me_d)
    bm_d.free()
    
    obj_d = bpy.data.objects.new(dname, me_d)
    obj_d.location = dloc
    obj_d.scale = dscale
    obj_d.rotation_euler = drot
    obj_d.data.materials.append(dmat)
    col_helm.objects.link(obj_d)

# 10. HV Cable Routing (10_ELECTRICAL)
col_elec = created_cols["10_ELECTRICAL"]

def create_cable_curve(name, points, bevel_radius=0.025):
    cdata = bpy.data.curves.new(name=f"{name}_CURVE", type='CURVE')
    cdata.dimensions = '3D'
    cdata.bevel_depth = bevel_radius
    
    spline = cdata.splines.new('BEZIER')
    spline.bezier_points.add(len(points) - 1)
    for i, pt in enumerate(points):
        bp = spline.bezier_points[i]
        bp.co = pt
        bp.handle_left_type = 'AUTO'
        bp.handle_right_type = 'AUTO'
    
    cobj = bpy.data.objects.new(name, cdata)
    cobj.data.materials.append(mat_hv_orange)
    col_elec.objects.link(cobj)
    return cobj

create_cable_curve("HV_CABLE_BATTERY_TO_JUNCTION", [(0.9, 0.0, 0.38), (1.3, 0.0, 0.38), (1.65, 0.0, 0.38)])
create_cable_curve("HV_CABLE_JUNCTION_TO_INVERTER", [(1.65, 0.0, 0.35), (0.0, 0.0, 0.25), (-1.75, 0.0, 0.48)])
create_cable_curve("HV_CABLE_INVERTER_TO_MOTOR", [(-1.75, 0.0, 0.48), (-2.1, 0.0, 0.40), (-2.45, 0.0, 0.35)])
create_cable_curve("SOLAR_CABLE_ROUTING", [(-0.3, 0.95, 2.15), (-0.3, 0.95, 1.45), (-0.3, 0.0, 0.65), (1.65, 0.0, 0.35)])

# 11. Technical Cameras Setup (13_CAMERAS)
col_cams = created_cols["13_CAMERAS"]

cameras_def = [
    ("CAM_PROFILE", (0.0, -18.0, 1.2), (math.radians(90.0), 0, 0), 12.0),
    ("CAM_TOP", (0.0, 0.0, 18.0), (0, 0, math.radians(-90.0)), 11.0),
    ("CAM_FRONT", (18.0, 0.0, 1.2), (math.radians(90.0), 0, math.radians(90.0)), 4.8),
    ("CAM_TRANSOM", (-18.0, 0.0, 1.2), (math.radians(90.0), 0, math.radians(-90.0)), 4.8),
    ("CAM_HELM", (2.8, -1.8, 2.4), (math.radians(65.0), 0, math.radians(52.0)), 2.8),
    ("CAM_ISOMETRIC", (14.0, -14.0, 12.0), (math.radians(58.0), 0, math.radians(45.0)), 12.5)
]

for cname, cloc, crot, ortho_scale in cameras_def:
    cdata = bpy.data.cameras.new(f"{cname}_DATA")
    cdata.type = 'ORTHO'
    cdata.ortho_scale = ortho_scale
    cobj = bpy.data.objects.new(cname, cdata)
    cobj.location = cloc
    cobj.rotation_euler = crot
    col_cams.objects.link(cobj)

# 12. Technical Reference Lines (14_TECHNICAL_REFERENCE)
col_ref = created_cols["14_TECHNICAL_REFERENCE"]

create_cable_curve("CENTERLINE_REF", [(-4.5, 0.0, 0.0), (4.5, 0.0, 0.0)], bevel_radius=0.005)
create_cable_curve("LOA_8.84m_REF", [(-4.42, -1.6, 0.0), (4.42, -1.6, 0.0)], bevel_radius=0.008)
create_cable_curve("BEAM_2.80m_REF", [(4.42, -1.4, 0.0), (4.42, 1.4, 0.0)], bevel_radius=0.008)

# Save Master File
blend_final = r"c:\\Users\\yoeli\\Documents\\GetUpSoft_Workspace\\02_Products\\GetUpSoftBoat\\electric_boat_29ft\\blender\\electric_boat_29ft_FINAL.blend"
bpy.ops.wm.save_as_mainfile(filepath=blend_final)

result = {
    "status": "ok",
    "saved_final_blend": blend_final,
    "preserved_original_objects": len(boat_objs),
    "total_objects": len(bpy.data.objects),
    "total_collections": len(bpy.data.collections),
    "loa": target_loa,
    "beam": target_beam
}
"""

res = client.execute_code(master_script)
print("Master Reconstruction Result:\n", json.dumps(res, indent=2))
