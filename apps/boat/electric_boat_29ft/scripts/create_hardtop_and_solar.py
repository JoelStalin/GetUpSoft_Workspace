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

# Remove existing hardtop objects if re-running
for o_name in ["HARDTOP_SHELL", "HARDTOP_SUPPORT_PORT", "HARDTOP_SUPPORT_STARBOARD"]:
    old_o = bpy.data.objects.get(o_name)
    if old_o:
        bpy.data.objects.remove(old_o, do_unlink=True)

# Remove old solar modules
for o in list(bpy.data.objects):
    if o.name.startswith("SOLAR_PANEL_"):
        bpy.data.objects.remove(o, do_unlink=True)

mat_grp = bpy.data.materials.get("MAT_GRP_WHITE")
mat_glass = bpy.data.materials.get("MAT_SOLAR_GLASS")
mat_cell = bpy.data.materials.get("MAT_SOLAR_CELL")
mat_tech = bpy.data.materials.get("MAT_BLACK_TECH")

col_hardtop = bpy.data.collections.get("04_HARDTOP")
col_solar = bpy.data.collections.get("05_SOLAR_SYSTEM")

# --- 1. BUILD AERODYNAMIC AIRFOIL HARDTOP SHELL ---
me_ht = bpy.data.meshes.new("HARDTOP_SHELL_MESH")
bm_ht = bmesh.new()

x_samples = 24
y_samples = 12

def airfoil_z(norm_x, norm_y):
    thickness = 0.18 * (0.296 * math.sqrt(max(0.001, norm_x)) - 0.126 * norm_x - 0.35 * (norm_x**2) + 0.284 * (norm_x**3) - 0.101 * (norm_x**4))
    transverse_arch = -0.05 * (norm_y**2)
    return thickness, transverse_arch

vert_grid_top = []
vert_grid_bot = []

for i in range(x_samples + 1):
    nx = i / x_samples
    x = -2.2 + nx * 4.7
    row_top = []
    row_bot = []
    for j in range(y_samples + 1):
        ny = (j / y_samples) * 2.0 - 1.0
        y = ny * 1.2
        thick, arch = airfoil_z(nx, ny)
        z_base = 2.25 + arch + (nx * 0.08)
        v_top = bm_ht.verts.new((x, y, z_base + thick/2.0))
        v_bot = bm_ht.verts.new((x, y, z_base - thick/2.0))
        row_top.append(v_top)
        row_bot.append(v_bot)
    vert_grid_top.append(row_top)
    vert_grid_bot.append(row_bot)

for i in range(x_samples):
    for j in range(y_samples):
        v1 = vert_grid_top[i][j]
        v2 = vert_grid_top[i+1][j]
        v3 = vert_grid_top[i+1][j+1]
        v4 = vert_grid_top[i][j+1]
        bm_ht.faces.new((v1, v4, v3, v2))
        
        b1 = vert_grid_bot[i][j]
        b2 = vert_grid_bot[i+1][j]
        b3 = vert_grid_bot[i+1][j+1]
        b4 = vert_grid_bot[i][j+1]
        bm_ht.faces.new((b1, b2, b3, b4))

for j in range(y_samples):
    bm_ht.faces.new((vert_grid_top[0][j], vert_grid_top[0][j+1], vert_grid_bot[0][j+1], vert_grid_bot[0][j]))
    bm_ht.faces.new((vert_grid_top[x_samples][j], vert_grid_bot[x_samples][j], vert_grid_bot[x_samples][j+1], vert_grid_top[x_samples][j+1]))

for i in range(x_samples):
    bm_ht.faces.new((vert_grid_top[i][0], vert_grid_bot[i][0], vert_grid_bot[i+1][0], vert_grid_top[i+1][0]))
    bm_ht.faces.new((vert_grid_top[i][y_samples], vert_grid_top[i+1][y_samples], vert_grid_bot[i+1][y_samples], vert_grid_bot[i][y_samples]))

bm_ht.to_mesh(me_ht)
bm_ht.free()

obj_ht = bpy.data.objects.new("HARDTOP_SHELL", me_ht)
col_hardtop.objects.link(obj_ht)
obj_ht.data.materials.append(mat_grp)

# --- 2. BUILD WIDE GRP A-FRAME PILLARS ---
def create_pillar(name, side_y):
    me = bpy.data.meshes.new(f"{name}_MESH")
    bm = bmesh.new()
    
    x_deck_min, x_deck_max = -0.5, 0.8
    x_top_min, x_top_max = -0.2, 0.5
    y_deck = side_y * 0.95
    y_top = side_y * 0.85
    width_y = 0.15 * (1 if side_y > 0 else -1)
    
    v1 = bm.verts.new((x_deck_min, y_deck, 0.85))
    v2 = bm.verts.new((x_deck_max, y_deck, 0.85))
    v3 = bm.verts.new((x_top_max, y_top, 2.25))
    v4 = bm.verts.new((x_top_min, y_top, 2.25))
    
    v5 = bm.verts.new((x_deck_min, y_deck + width_y, 0.85))
    v6 = bm.verts.new((x_deck_max, y_deck + width_y, 0.85))
    v7 = bm.verts.new((x_top_max, y_top + width_y*0.7, 2.25))
    v8 = bm.verts.new((x_top_min, y_top + width_y*0.7, 2.25))
    
    bm.faces.new((v1, v2, v3, v4))
    bm.faces.new((v5, v8, v7, v6))
    bm.faces.new((v1, v4, v8, v5))
    bm.faces.new((v2, v6, v7, v3))
    bm.faces.new((v1, v5, v6, v2))
    bm.faces.new((v4, v3, v7, v8))
    
    bm.to_mesh(me)
    bm.free()
    
    o = bpy.data.objects.new(name, me)
    col_hardtop.objects.link(o)
    o.data.materials.append(mat_grp)
    return o

create_pillar("HARDTOP_SUPPORT_PORT", 0.95)
create_pillar("HARDTOP_SUPPORT_STARBOARD", -0.95)

# --- 3. BUILD INTEGRATED SOLAR ARRAY (8 PANELS) ---
rows = 4
cols = 2

panel_idx = 1
for r in range(rows):
    for c in range(cols):
        x_min = -1.8 + r * 1.05
        x_max = x_min + 0.95
        y_min = -1.0 + c * 1.05
        y_max = y_min + 0.95
        
        me_p = bpy.data.meshes.new(f"SOLAR_PANEL_{panel_idx:02d}_MESH")
        bm_p = bmesh.new()
        
        def get_top_z(px, py):
            nx = (px - (-2.2)) / 4.7
            ny = py / 1.2
            thick, arch = airfoil_z(nx, ny)
            return 2.25 + arch + (nx * 0.08) + thick/2.0 + 0.01
        
        z1 = get_top_z(x_min, y_min)
        z2 = get_top_z(x_max, y_min)
        z3 = get_top_z(x_max, y_max)
        z4 = get_top_z(x_min, y_max)
        
        pv1 = bm_p.verts.new((x_min, y_min, z1))
        pv2 = bm_p.verts.new((x_max, y_min, z2))
        pv3 = bm_p.verts.new((x_max, y_max, z3))
        pv4 = bm_p.verts.new((x_min, y_max, z4))
        
        f = bm_p.faces.new((pv1, pv2, pv3, pv4))
        
        # Solidify panel face by extruding down by 0.02m
        ext = bmesh.ops.extrude_face_region(bm_p, geom=[f])
        verts_ext = [e for e in ext["geom"] if isinstance(e, bmesh.types.BMVert)]
        for v in verts_ext:
            v.co.z -= 0.02
        
        bm_p.to_mesh(me_p)
        bm_p.free()
        
        p_obj = bpy.data.objects.new(f"SOLAR_PANEL_{panel_idx:02d}", me_p)
        col_solar.objects.link(p_obj)
        p_obj.data.materials.append(mat_cell)
        p_obj.data.materials.append(mat_glass)
        
        panel_idx += 1

bpy.ops.wm.save_as_mainfile(filepath=bpy.data.filepath)

result = {
    "hardtop_shell": "HARDTOP_SHELL",
    "pillars": ["HARDTOP_SUPPORT_PORT", "HARDTOP_SUPPORT_STARBOARD"],
    "solar_panels_count": 8,
    "solar_collection": col_solar.name,
    "saved_file": bpy.data.filepath
}
"""

res = client.execute_code(code)
print("Hardtop and Solar Array Setup Result:\n", json.dumps(res, indent=2))
