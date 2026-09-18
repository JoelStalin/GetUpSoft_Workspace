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

col_inboard = bpy.data.collections.get("07_PROPULSION_INBOARD")
col_outboard = bpy.data.collections.get("08_PROPULSION_OUTBOARD")

# Clear existing objects in propulsion collections if re-running
for col in [col_inboard, col_outboard]:
    for o in list(col.objects):
        bpy.data.objects.remove(o, do_unlink=True)

mat_motor = bpy.data.materials.get("MAT_MOTOR")
mat_stainless = bpy.data.materials.get("MAT_STAINLESS")
mat_hv = bpy.data.materials.get("MAT_HV_ORANGE")
mat_grp = bpy.data.materials.get("MAT_GRP_WHITE")
mat_tech = bpy.data.materials.get("MAT_BLACK_TECH")

# --- 7A. INBOARD PROPULSION ARCHITECTURE ---
# 1. Inverter
me_inv = bpy.data.meshes.new("INVERTER_INBOARD_MESH")
bm_inv = bmesh.new()
bmesh.ops.create_cube(bm_inv, size=1.0)
for v in bm_inv.verts:
    v.co.x = v.co.x * 0.40 + (-1.4)
    v.co.y = v.co.y * 0.45
    v.co.z = v.co.z * 0.25 + 0.65
bm_inv.to_mesh(me_inv)
bm_inv.free()
o_inv = bpy.data.objects.new("INVERTER_INBOARD", me_inv)
col_inboard.objects.link(o_inv)
o_inv.data.materials.append(mat_hv)

# 2. Electric Motor (Centred at Y = 0 behind battery bank, X = -2.1m)
me_mot = bpy.data.meshes.new("INBOARD_MOTOR_MESH")
bm_mot = bmesh.new()
bmesh.ops.create_cone(bm_mot, cap_ends=True, cap_tris=False, segments=24, radius1=0.22, radius2=0.22, depth=0.65)
# Rotate cylinder along X axis
rot_x = mathutils.Matrix.Rotation(math.radians(90.0), 4, 'Y')
bm_mot.transform(rot_x)
for v in bm_mot.verts:
    v.co.x += -2.1
    v.co.z += 0.50
bm_mot.to_mesh(me_mot)
bm_mot.free()
o_mot = bpy.data.objects.new("INBOARD_MOTOR", me_mot)
col_inboard.objects.link(o_mot)
o_mot.data.materials.append(mat_motor)

# 3. Flexible Shaft Coupling
me_coup = bpy.data.meshes.new("COUPLING_MESH")
bm_coup = bmesh.new()
bmesh.ops.create_cone(bm_coup, cap_ends=True, cap_tris=False, segments=16, radius1=0.12, radius2=0.12, depth=0.15)
bm_coup.transform(rot_x)
for v in bm_coup.verts:
    v.co.x += -2.50
    v.co.z += 0.47
bm_coup.to_mesh(me_coup)
bm_coup.free()
o_coup = bpy.data.objects.new("COUPLING", me_coup)
col_inboard.objects.link(o_coup)
o_coup.data.materials.append(mat_stainless)

# 4. Propeller Shaft (X from -2.55 to -4.10)
me_shaft = bpy.data.meshes.new("SHAFT_MESH")
bm_shaft = bmesh.new()
bmesh.ops.create_cone(bm_shaft, cap_ends=True, cap_tris=False, segments=16, radius1=0.03, radius2=0.03, depth=1.60)
bm_shaft.transform(rot_x)
for v in bm_shaft.verts:
    v.co.x += -3.35
    v.co.z += 0.35
bm_shaft.to_mesh(me_shaft)
bm_shaft.free()
o_shaft = bpy.data.objects.new("SHAFT", me_shaft)
col_inboard.objects.link(o_shaft)
o_shaft.data.materials.append(mat_stainless)

# 5. Stern Tube & Hull Seal
me_tube = bpy.data.meshes.new("STERN_TUBE_MESH")
bm_tube = bmesh.new()
bmesh.ops.create_cone(bm_tube, cap_ends=True, cap_tris=False, segments=16, radius1=0.07, radius2=0.07, depth=0.60)
bm_tube.transform(rot_x)
for v in bm_tube.verts:
    v.co.x += -3.60
    v.co.z += 0.35
bm_tube.to_mesh(me_tube)
bm_tube.free()
o_tube = bpy.data.objects.new("STERN_TUBE", me_tube)
col_inboard.objects.link(o_tube)
o_tube.data.materials.append(mat_tech)

# 6. Propeller (4-blade bronze / stainless at stern)
me_prop = bpy.data.meshes.new("PROPELLER_MESH")
bm_prop = bmesh.new()
bmesh.ops.create_cone(bm_prop, cap_ends=True, cap_tris=False, segments=16, radius1=0.08, radius2=0.05, depth=0.18)
bm_prop.transform(rot_x)
# Add 4 blades
for b in range(4):
    angle = b * (math.pi / 2.0)
    rot_b = mathutils.Matrix.Rotation(angle, 4, 'X')
    bm_b = bmesh.new()
    bmesh.ops.create_cube(bm_b, size=1.0)
    for v in bm_b.verts:
        v.co.x = v.co.x * 0.02
        v.co.y = v.co.y * 0.22 + 0.12
        v.co.z = v.co.z * 0.05
    bm_b.transform(rot_b)
    for v in bm_b.verts:
        bm_prop.verts.new(v.co)
    bm_b.free()

for v in bm_prop.verts:
    v.co.x += -4.15
    v.co.z += 0.30
bm_prop.to_mesh(me_prop)
bm_prop.free()
o_prop = bpy.data.objects.new("PROPELLER", me_prop)
col_inboard.objects.link(o_prop)
o_prop.data.materials.append(mat_stainless)


# --- 7B. OUTBOARD PROPULSION ARCHITECTURE ---
# 1. Transom Bracket
me_brak = bpy.data.meshes.new("CENTER_TRANSOM_BRACKET_MESH")
bm_brak = bmesh.new()
bmesh.ops.create_cube(bm_brak, size=1.0)
for v in bm_brak.verts:
    v.co.x = v.co.x * 0.35 + (-4.25)
    v.co.y = v.co.y * 0.45
    v.co.z = v.co.z * 0.40 + 0.60
bm_brak.to_mesh(me_brak)
bm_brak.free()
o_brak = bpy.data.objects.new("CENTER_TRANSOM_BRACKET", me_brak)
col_outboard.objects.link(o_brak)
o_brak.data.materials.append(mat_stainless)

# 2. Electric Outboard Motor Pod & Cowling
me_out = bpy.data.meshes.new("OUTBOARD_MOTOR_ELECTRIC_MESH")
bm_out = bmesh.new()
# Cowling
bmesh.ops.create_cube(bm_out, size=1.0)
for v in bm_out.verts:
    v.co.x = v.co.x * 0.50 + (-4.65)
    v.co.y = v.co.y * 0.35
    v.co.z = v.co.z * 0.65 + 0.90
# Leg / Lower unit
bm_leg = bmesh.new()
bmesh.ops.create_cube(bm_leg, size=1.0)
for v in bm_leg.verts:
    v.co.x = v.co.x * 0.20 + (-4.65)
    v.co.y = v.co.y * 0.12
    v.co.z = v.co.z * 0.70 + 0.25
for v in bm_leg.verts:
    bm_out.verts.new(v.co)
bm_leg.free()
bm_out.to_mesh(me_out)
bm_out.free()

o_out = bpy.data.objects.new("OUTBOARD_MOTOR_ELECTRIC", me_out)
col_outboard.objects.link(o_out)
o_out.data.materials.append(mat_motor)
o_out.data.materials.append(mat_tech)

# 3. Port & Starboard Swim Platforms
def create_swim_platform(name, side_y):
    me = bpy.data.meshes.new(f"{name}_MESH")
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)
    for v in bm.verts:
        v.co.x = v.co.x * 0.65 + (-4.45)
        v.co.y = v.co.y * 0.55 + side_y
        v.co.z = v.co.z * 0.08 + 0.65
    bm.to_mesh(me)
    bm.free()
    o = bpy.data.objects.new(name, me)
    col_outboard.objects.link(o)
    o.data.materials.append(mat_grp)
    return o

create_swim_platform("PORT_SWIM_PLATFORM", 0.90)
create_swim_platform("STARBOARD_SWIM_PLATFORM", -0.90)

# Set Inboard visible by default, Outboard hidden for main render
col_outboard.hide_viewport = True
col_outboard.hide_render = True
col_inboard.hide_viewport = False
col_inboard.hide_render = False

bpy.ops.wm.save_as_mainfile(filepath=bpy.data.filepath)

result = {
    "inboard_collection": col_inboard.name,
    "inboard_objects": [o.name for o in col_inboard.objects],
    "outboard_collection": col_outboard.name,
    "outboard_objects": [o.name for o in col_outboard.objects],
    "default_visible": "INBOARD",
    "saved_file": bpy.data.filepath
}
"""

res = client.execute_code(code)
print("Modular Propulsion Setup Result:\n", json.dumps(res, indent=2))
