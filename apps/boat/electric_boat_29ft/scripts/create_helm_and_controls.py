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

col_helm = bpy.data.collections.get("09_HELM")

# Remove old helm objects
for o in list(col_helm.objects):
    bpy.data.objects.remove(o, do_unlink=True)

mat_grp = bpy.data.materials.get("MAT_GRP_WHITE")
mat_tech = bpy.data.materials.get("MAT_BLACK_TECH")
mat_emiss = bpy.data.materials.get("MAT_DISPLAY_EMISSION")
mat_glass = bpy.data.materials.get("MAT_DISPLAY_GLASS")
mat_stainless = bpy.data.materials.get("MAT_STAINLESS")
mat_hv = bpy.data.materials.get("MAT_HV_ORANGE")

# --- 1. HELM CONSOLE (Ergonomic Centred Body) ---
me_con = bpy.data.meshes.new("HELM_CONSOLE_MESH")
bm_con = bmesh.new()
bmesh.ops.create_cube(bm_con, size=1.0)
for v in bm_con.verts:
    # Size: X=0.75m, Y=1.10m, Z=0.95m
    v.co.x = v.co.x * 0.75 + 0.35
    v.co.y = v.co.y * 1.10
    v.co.z = v.co.z * 0.95 + 1.25
bm_con.to_mesh(me_con)
bm_con.free()

o_con = bpy.data.objects.new("HELM_CONSOLE", me_con)
col_helm.objects.link(o_con)
o_con.data.materials.append(mat_grp)

# --- 2. DUAL MFD SCREENS (PHYSICALLY SEPARATE) ---
# Central MFD: BMS Screen (X=0.55m, Y=-0.25m, Z=1.65m)
me_mfd1 = bpy.data.meshes.new("BMS_SCREEN_MFD_MESH")
bm_mfd1 = bmesh.new()
bmesh.ops.create_cube(bm_mfd1, size=1.0)
for v in bm_mfd1.verts:
    v.co.x = v.co.x * 0.04 + 0.58
    v.co.y = v.co.y * 0.42 + (-0.26)
    v.co.z = v.co.z * 0.26 + 1.68
bm_mfd1.to_mesh(me_mfd1)
bm_mfd1.free()

o_mfd1 = bpy.data.objects.new("BMS_SCREEN_MFD", me_mfd1)
col_helm.objects.link(o_mfd1)
o_mfd1.data.materials.append(mat_emiss)
o_mfd1.data.materials.append(mat_tech)

# Secondary MFD: Navigation Screen (X=0.55m, Y=+0.25m, Z=1.65m)
me_mfd2 = bpy.data.meshes.new("NAVIGATION_SCREEN_MFD_MESH")
bm_mfd2 = bmesh.new()
bmesh.ops.create_cube(bm_mfd2, size=1.0)
for v in bm_mfd2.verts:
    v.co.x = v.co.x * 0.04 + 0.58
    v.co.y = v.co.y * 0.42 + 0.26
    v.co.z = v.co.z * 0.26 + 1.68
bm_mfd2.to_mesh(me_mfd2)
bm_mfd2.free()

o_mfd2 = bpy.data.objects.new("NAVIGATION_SCREEN_MFD", me_mfd2)
col_helm.objects.link(o_mfd2)
o_mfd2.data.materials.append(mat_emiss)
o_mfd2.data.materials.append(mat_tech)

# --- 3. CONTROLS ---
# Steering Wheel
me_sw = bpy.data.meshes.new("STEERING_WHEEL_MESH")
bm_sw = bmesh.new()
bmesh.ops.create_cone(bm_sw, cap_ends=True, cap_tris=False, segments=24, radius1=0.18, radius2=0.18, depth=0.04)
rot_sw = mathutils.Matrix.Rotation(math.radians(70.0), 4, 'Y')
bm_sw.transform(rot_sw)
for v in bm_sw.verts:
    v.co.x += 0.18
    v.co.y += -0.25
    v.co.z += 1.42
bm_sw.to_mesh(me_sw)
bm_sw.free()

o_sw = bpy.data.objects.new("STEERING_WHEEL", me_sw)
col_helm.objects.link(o_sw)
o_sw.data.materials.append(mat_stainless)

# Electronic Throttle
me_th = bpy.data.meshes.new("ELECTRONIC_THROTTLE_MESH")
bm_th = bmesh.new()
bmesh.ops.create_cube(bm_th, size=1.0)
for v in bm_th.verts:
    v.co.x = v.co.x * 0.15 + 0.35
    v.co.y = v.co.y * 0.10 + 0.32
    v.co.z = v.co.z * 0.20 + 1.48
bm_th.to_mesh(me_th)
bm_th.free()

o_th = bpy.data.objects.new("ELECTRONIC_THROTTLE", me_th)
col_helm.objects.link(o_th)
o_th.data.materials.append(mat_stainless)
o_th.data.materials.append(mat_tech)

# Drive Selector (ECO / CRUISE / SPORT)
me_ds = bpy.data.meshes.new("DRIVE_SELECTOR_MESH")
bm_ds = bmesh.new()
bmesh.ops.create_cone(bm_ds, cap_ends=True, cap_tris=False, segments=12, radius1=0.04, radius2=0.04, depth=0.05)
for v in bm_ds.verts:
    v.co.x += 0.38
    v.co.y += 0.15
    v.co.z += 1.42
bm_ds.to_mesh(me_ds)
bm_ds.free()

o_ds = bpy.data.objects.new("DRIVE_SELECTOR", me_ds)
col_helm.objects.link(o_ds)
o_ds.data.materials.append(mat_tech)

# HV Master / Emergency Disconnect
me_em = bpy.data.meshes.new("HV_EMERGENCY_DISCONNECT_MESH")
bm_em = bmesh.new()
bmesh.ops.create_cone(bm_em, cap_ends=True, cap_tris=False, segments=16, radius1=0.05, radius2=0.05, depth=0.06)
for v in bm_em.verts:
    v.co.x += 0.38
    v.co.y += 0.05
    v.co.z += 1.42
bm_em.to_mesh(me_em)
bm_em.free()

o_em = bpy.data.objects.new("HV_EMERGENCY_DISCONNECT", me_em)
col_helm.objects.link(o_em)
o_em.data.materials.append(mat_hv)

# Start / Stop Button
me_ss = bpy.data.meshes.new("START_STOP_BUTTON_MESH")
bm_ss = bmesh.new()
bmesh.ops.create_cone(bm_ss, cap_ends=True, cap_tris=False, segments=12, radius1=0.03, radius2=0.03, depth=0.03)
for v in bm_ss.verts:
    v.co.x += 0.38
    v.co.y += -0.05
    v.co.z += 1.42
bm_ss.to_mesh(me_ss)
bm_ss.free()

o_ss = bpy.data.objects.new("START_STOP_BUTTON", me_ss)
col_helm.objects.link(o_ss)
o_ss.data.materials.append(mat_stainless)

bpy.ops.wm.save_as_mainfile(filepath=bpy.data.filepath)

result = {
    "helm_console": o_con.name,
    "dual_mfds": [o_mfd1.name, o_mfd2.name],
    "controls": [o_sw.name, o_th.name, o_ds.name, o_em.name, o_ss.name],
    "collection": col_helm.name,
    "saved_file": bpy.data.filepath
}
"""

res = client.execute_code(code)
print("Helm Console, MFDs and Controls Setup Result:\n", json.dumps(res, indent=2))
