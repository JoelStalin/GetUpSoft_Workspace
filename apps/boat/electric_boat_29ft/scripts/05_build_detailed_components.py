import json
import os
from blender_mcp_client import BlenderMCPClient

client = BlenderMCPClient()

code = """
import bpy
import os
import math
import mathutils
import bmesh

# Open 03_proxy_layout.blend
bpy.ops.wm.open_mainfile(filepath=r"c:\\Users\\yoeli\\Documents\\GetUpSoft_Workspace\\02_Products\\GetUpSoftBoat\\electric_boat_29ft\\blender\\backups\\03_proxy_layout.blend")

master_col = bpy.context.scene.collection

# Collections Mapping
collections_def = {
    "01_HULL": ["HULL_MAIN"],
    "02_DECK": ["BezierCurve", "Cylinder.002"],
    "03_CONSOLE": ["Cube", "Plane", "Cylinder", "Cube.001", "Cube.002", "Cube.004", "Cube.005"],
    "04_HARDTOP": [],
    "05_SOLAR_SYSTEM": [],
    "06_ENERGY_SYSTEM": [],
    "07_PROPULSION_INBOARD": [],
    "08_PROPULSION_OUTBOARD": [],
    "09_HELM_SYSTEM": [],
    "10_SEATING": [],
    "11_RAILINGS": [],
    "12_ACCESSORIES": [],
    "13_LIGHTING": [],
    "14_CAMERAS": [],
    "15_TECHNICAL": []
}

created_cols = {}
for cname, onames in collections_def.items():
    col = bpy.data.collections.get(cname)
    if not col:
        col = bpy.data.collections.new(cname)
        master_col.children.link(col)
    created_cols[cname] = col
    for oname in onames:
        o = bpy.data.objects.get(oname)
        if o:
            for pcol in o.users_collection:
                pcol.objects.unlink(o)
            col.objects.link(o)

# PBR Materials Setup
def get_or_create_mat(name, color, roughness=0.2, metallic=0.0, emission=None):
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

mat_grp_white = get_or_create_mat("MAT_GRP_WHITE", (0.95, 0.95, 0.95, 1.0), roughness=0.15, metallic=0.0)
mat_grp_blue = get_or_create_mat("MAT_GRP_BLUE", (0.02, 0.15, 0.45, 1.0), roughness=0.15, metallic=0.0)
mat_solar_glass = get_or_create_mat("MAT_SOLAR_GLASS", (0.05, 0.1, 0.2, 0.8), roughness=0.05, metallic=0.9)
mat_solar_cell = get_or_create_mat("MAT_SOLAR_CELL", (0.02, 0.05, 0.25, 1.0), roughness=0.1, metallic=0.9)
mat_solar_frame = get_or_create_mat("MAT_SOLAR_FRAME", (0.1, 0.1, 0.1, 1.0), roughness=0.3, metallic=0.8)
mat_battery_case = get_or_create_mat("MAT_BATTERY_CASE", (0.1, 0.12, 0.15, 1.0), roughness=0.3, metallic=0.1)
mat_hv_orange = get_or_create_mat("MAT_HV_ORANGE", (1.0, 0.22, 0.0, 1.0), roughness=0.4, metallic=0.0)
mat_motor_metal = get_or_create_mat("MAT_MOTOR_METAL", (0.08, 0.08, 0.08, 1.0), roughness=0.2, metallic=0.8)
mat_stainless = get_or_create_mat("MAT_STAINLESS", (0.8, 0.82, 0.85, 1.0), roughness=0.15, metallic=0.95)
mat_display_emission = get_or_create_mat("MAT_DISPLAY_EMISSION", (0.0, 0.7, 1.0, 1.0), roughness=0.1, metallic=0.0, emission=(0.0, 0.7, 1.0, 1.0))

# --- PHASE 4: SUPERSTRUCTURE (04_HARDTOP & 05_SOLAR_SYSTEM) ---
col_ht = created_cols["04_HARDTOP"]
col_solar = created_cols["05_SOLAR_SYSTEM"]

# Hardtop Airfoil Canopy Shell
bm_ht = bmesh.new()
ht_length, ht_width = 3.60, 2.20
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
obj_ht.location = (-0.20, 0.0, 2.15)
obj_ht.data.materials.append(mat_grp_white)
col_ht.objects.link(obj_ht)

mod_sol = obj_ht.modifiers.new(name="Solidify", type='SOLIDIFY')
mod_sol.thickness = 0.06

# Hardtop Structural GRP A-Frame Supports
for side, y_pos in [("PORT", 0.95), ("STARBOARD", -0.95)]:
    bm_p = bmesh.new()
    bmesh.ops.create_cube(bm_p, size=1.0)
    me_p = bpy.data.meshes.new(f"HARDTOP_SUPPORT_{side}_MESH")
    bm_p.to_mesh(me_p)
    bm_p.free()
    
    obj_p = bpy.data.objects.new(f"HARDTOP_SUPPORT_{side}", me_p)
    obj_p.location = (-0.30, y_pos, 1.45)
    obj_p.scale = (0.12, 0.10, 1.35)
    obj_p.rotation_euler = (0, math.radians(-12.0), 0)
    obj_p.data.materials.append(mat_grp_white)
    col_ht.objects.link(obj_p)

# Solar Panel Array (8 Modules)
solar_panel_rows = [-1.10, -0.40, 0.30, 1.00]
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

# Save backup 04_superstructure.blend
bpy.ops.wm.save_as_mainfile(filepath=r"c:\\Users\\yoeli\\Documents\\GetUpSoft_Workspace\\02_Products\\GetUpSoftBoat\\electric_boat_29ft\\blender\\backups\\04_superstructure.blend")

# --- PHASE 5: ENERGY SYSTEM (06_ENERGY_SYSTEM) ---
col_energy = created_cols["06_ENERGY_SYSTEM"]

# Keel Structural Battery Tray
bm_tray = bmesh.new()
bmesh.ops.create_cube(bm_tray, size=1.0)
me_tray = bpy.data.meshes.new("BATTERY_TRAY_MESH")
bm_tray.to_mesh(me_tray)
bm_tray.free()

obj_tray = bpy.data.objects.new("BATTERY_TRAY", me_tray)
obj_tray.location = (0.0, 0.0, 0.15)
obj_tray.scale = (2.60, 1.10, 0.10)
obj_tray.data.materials.append(mat_stainless)
col_energy.objects.link(obj_tray)

# 6 Battery Modules
bat_positions = [
    (-0.90, -0.32, 0.38), (-0.90, 0.32, 0.38),
    (0.00, -0.32, 0.38),  (0.00, 0.32, 0.38),
    (0.90, -0.32, 0.38),  (0.90, 0.32, 0.38)
]

for idx, (bx, by, bz) in enumerate(bat_positions, 1):
    bm_b = bmesh.new()
    bmesh.ops.create_cube(bm_b, size=1.0)
    me_b = bpy.data.meshes.new(f"BAT_MOD_0{idx}_MESH")
    bm_b.to_mesh(me_b)
    bm_b.free()
    
    obj_b = bpy.data.objects.new(f"BAT_MOD_0{idx}", me_b)
    obj_b.location = (bx, by, bz)
    obj_b.scale = (0.75, 0.55, 0.35)
    obj_b.data.materials.append(mat_battery_case)
    col_energy.objects.link(obj_b)

# BMS & HV Enclosure Components
bms_components = [
    ("HV_JUNCTION_BOX", (1.65, 0.0, 0.35), (0.45, 0.65, 0.28), mat_battery_case),
    ("BMS_CONTROLLER", (1.65, 0.0, 0.55), (0.35, 0.45, 0.10), mat_motor_metal),
    ("HV_CONTACTOR", (1.65, 0.25, 0.52), (0.12, 0.12, 0.12), mat_hv_orange),
    ("HV_MAIN_FUSE", (1.65, -0.25, 0.52), (0.10, 0.10, 0.10), mat_stainless),
    ("SERVICE_DISCONNECT", (1.88, 0.0, 0.55), (0.08, 0.15, 0.12), mat_hv_orange),
    ("CURRENT_SENSOR", (1.45, 0.0, 0.52), (0.10, 0.12, 0.08), mat_motor_metal)
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
    col_energy.objects.link(obj_c)

# HV Cable Routing Bezier Curves
def create_cable(name, points, bevel=0.025):
    cdata = bpy.data.curves.new(name=f"{name}_CURVE", type='CURVE')
    cdata.dimensions = '3D'
    cdata.bevel_depth = bevel
    
    spline = cdata.splines.new('BEZIER')
    spline.bezier_points.add(len(points) - 1)
    for i, pt in enumerate(points):
        bp = spline.bezier_points[i]
        bp.co = pt
        bp.handle_left_type = 'AUTO'
        bp.handle_right_type = 'AUTO'
    
    cobj = bpy.data.objects.new(name, cdata)
    cobj.data.materials.append(mat_hv_orange)
    col_energy.objects.link(cobj)
    return cobj

create_cable("HV_CABLE_BATTERY_TO_JUNCTION", [(0.90, 0.0, 0.38), (1.30, 0.0, 0.38), (1.65, 0.0, 0.38)])
create_cable("HV_CABLE_JUNCTION_TO_INVERTER", [(1.65, 0.0, 0.35), (0.00, 0.0, 0.25), (-1.75, 0.0, 0.48)])
create_cable("HV_CABLE_INVERTER_TO_MOTOR", [(-1.75, 0.0, 0.48), (-2.10, 0.0, 0.40), (-2.45, 0.0, 0.35)])
create_cable("SOLAR_CABLE_ROUTING", [(-0.30, 0.95, 2.15), (-0.30, 0.95, 1.45), (-0.30, 0.0, 0.65), (1.65, 0.0, 0.35)])

# Save backup 05_energy_system.blend
bpy.ops.wm.save_as_mainfile(filepath=r"c:\\Users\\yoeli\\Documents\\GetUpSoft_Workspace\\02_Products\\GetUpSoftBoat\\electric_boat_29ft\\blender\\backups\\05_energy_system.blend")

# --- PHASE 6: PROPULSION (07_PROPULSION_INBOARD & 08_PROPULSION_OUTBOARD) ---
col_inboard = created_cols["07_PROPULSION_INBOARD"]
col_outboard = created_cols["08_PROPULSION_OUTBOARD"]

inboard_parts = [
    ("INVERTER_INBOARD", (-1.75, 0.0, 0.48), (0.50, 0.42, 0.28), mat_motor_metal),
    ("INBOARD_MOTOR", (-2.45, 0.0, 0.35), (0.55, 0.38, 0.38), mat_motor_metal),
    ("COUPLING", (-2.80, 0.0, 0.32), (0.12, 0.20, 0.20), mat_stainless),
    ("SHAFT_MAIN", (-3.35, 0.0, 0.20), (1.10, 0.05, 0.05), mat_stainless),
    ("STERN_TUBE", (-3.65, 0.0, 0.15), (0.50, 0.08, 0.08), mat_battery_case),
    ("PROPELLER", (-4.00, 0.0, 0.08), (0.15, 0.42, 0.42), mat_stainless)
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

# Outboard Modular System
outboard_parts = [
    ("OUTBOARD_CENTER_BRACKET", (-4.18, 0.0, 0.65), (0.25, 0.45, 0.55), mat_battery_case),
    ("OUTBOARD_ELECTRIC_MOTOR", (-4.42, 0.0, 0.45), (0.40, 0.35, 1.25), mat_motor_metal),
    ("SWIM_PLATFORM_PORT", (-4.10, 1.05, 0.42), (0.55, 0.70, 0.08), mat_grp_white),
    ("SWIM_PLATFORM_STARBOARD", (-4.10, -1.05, 0.42), (0.55, 0.70, 0.08), mat_grp_white)
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

# Hide Outboard collection initially so Inboard is active visible render
col_outboard.hide_render = True
col_outboard.hide_viewport = True

# Save backup 06_propulsion.blend
bpy.ops.wm.save_as_mainfile(filepath=r"c:\\Users\\yoeli\\Documents\\GetUpSoft_Workspace\\02_Products\\GetUpSoftBoat\\electric_boat_29ft\\blender\\backups\\06_propulsion.blend")

# --- PHASE 7: HELM SYSTEM (09_HELM_SYSTEM) ---
col_helm = created_cols["09_HELM_SYSTEM"]

helm_displays = [
    ("MFD_BMS", (0.65, 0.28, 1.38), (0.05, 0.35, 0.24), (0, math.radians(-15.0), 0), mat_display_emission),
    ("MFD_NAV", (0.65, -0.28, 1.38), (0.05, 0.35, 0.24), (0, math.radians(-15.0), 0), mat_display_emission),
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

# Save backup 07_helm.blend
bpy.ops.wm.save_as_mainfile(filepath=r"c:\\Users\\yoeli\\Documents\\GetUpSoft_Workspace\\02_Products\\GetUpSoftBoat\\electric_boat_29ft\\blender\\backups\\07_helm.blend")

result = {
    "superstructure_backup": r"blender/backups/04_superstructure.blend",
    "energy_system_backup": r"blender/backups/05_energy_system.blend",
    "propulsion_backup": r"blender/backups/06_propulsion.blend",
    "helm_backup": r"blender/backups/07_helm.blend",
    "total_objects": len(bpy.data.objects),
    "total_collections": len(bpy.data.collections)
}
"""

res = client.execute_code(code)
print("Detailed Components Construction Result:\n", json.dumps(res, indent=2))
