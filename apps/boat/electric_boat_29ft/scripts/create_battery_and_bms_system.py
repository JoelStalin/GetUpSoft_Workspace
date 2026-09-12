import json
from blender_mcp_client import BlenderMCPClient

client = BlenderMCPClient()

code = """
import bpy
import bmesh
import mathutils

# Open working file
bpy.ops.wm.open_mainfile(filepath=r"c:\\Users\\yoeli\\Documents\\GetUpSoft_Workspace\\02_Products\\GetUpSoftBoat\\electric_boat_29ft\\blender\\electric_boat_29ft.blend")

col_battery = bpy.data.collections.get("06_BATTERY_SYSTEM")

# Remove old battery/bms objects if re-running
for o in list(col_battery.objects):
    bpy.data.objects.remove(o, do_unlink=True)

mat_case = bpy.data.materials.get("MAT_BATTERY_CASE")
mat_hv = bpy.data.materials.get("MAT_HV_ORANGE")
mat_stainless = bpy.data.materials.get("MAT_STAINLESS")
mat_tech = bpy.data.materials.get("MAT_BLACK_TECH")

# --- 1. BATTERY TRAY (Keel structural tray) ---
me_tray = bpy.data.meshes.new("BATTERY_TRAY_MESH")
bm_t = bmesh.new()

# Tray dimensions: X [-0.8, 1.2] (2.0m long), Y [-0.55, 0.55] (1.1m wide), Z [0.35, 0.42] (0.07m height)
bmesh.ops.create_cube(bm_t, size=1.0)
for v in bm_t.verts:
    v.co.x = v.co.x * 2.0 + 0.2
    v.co.y = v.co.y * 1.10
    v.co.z = (v.co.z + 0.5) * 0.08 + 0.38

bm_t.to_mesh(me_tray)
bm_t.free()

obj_tray = bpy.data.objects.new("BATTERY_TRAY", me_tray)
col_battery.objects.link(obj_tray)
obj_tray.data.materials.append(mat_stainless)

# --- 2. MODULAR BATTERY MODULES (6 MODULES: 3x2 Grid) ---
# 3 rows along X, 2 columns along Y
modules_created = []

for row in range(3):
    for col in range(2):
        mod_idx = row * 2 + col + 1
        mod_name = f"BATTERY_MODULE_{mod_idx:02d}"
        
        me_mod = bpy.data.meshes.new(f"{mod_name}_MESH")
        bm_m = bmesh.new()
        
        # Module size: X=0.55m, Y=0.45m, Z=0.35m
        bmesh.ops.create_cube(bm_m, size=1.0)
        
        center_x = -0.5 + row * 0.65
        center_y = -0.26 + col * 0.52
        center_z = 0.46 + 0.175
        
        for v in bm_m.verts:
            v.co.x = v.co.x * 0.55 + center_x
            v.co.y = v.co.y * 0.45 + center_y
            v.co.z = v.co.z * 0.35 + center_z
        
        bm_m.to_mesh(me_mod)
        bm_m.free()
        
        o_mod = bpy.data.objects.new(mod_name, me_mod)
        col_battery.objects.link(o_mod)
        o_mod.data.materials.append(mat_case)
        o_mod.data.materials.append(mat_hv)
        modules_created.append(mod_name)

# --- 3. BMS & HV JUNCTION BOX COMPARTMENT ---
# Independent technical enclosure forward of tray: X=1.45m, Y=0, Z=0.55m
bms_components = [
    ("HV_JUNCTION_BOX", (1.45, 0.0, 0.55), (0.45, 0.60, 0.28), mat_tech),
    ("BMS_CONTROLLER", (1.45, 0.20, 0.72), (0.20, 0.15, 0.08), mat_case),
    ("HV_CONTACTOR", (1.45, -0.15, 0.72), (0.12, 0.12, 0.10), mat_hv),
    ("MAIN_FUSE", (1.35, 0.0, 0.72), (0.08, 0.18, 0.08), mat_hv),
    ("SERVICE_DISCONNECT", (1.55, 0.0, 0.72), (0.10, 0.10, 0.12), mat_hv),
    ("CURRENT_SENSOR", (1.45, -0.22, 0.55), (0.08, 0.08, 0.06), mat_tech)
]

created_bms = []
for c_name, loc, size, mat in bms_components:
    me_c = bpy.data.meshes.new(f"{c_name}_MESH")
    bm_c = bmesh.new()
    bmesh.ops.create_cube(bm_c, size=1.0)
    
    for v in bm_c.verts:
        v.co.x = v.co.x * size[0] + loc[0]
        v.co.y = v.co.y * size[1] + loc[1]
        v.co.z = v.co.z * size[2] + loc[2]
    
    bm_c.to_mesh(me_c)
    bm_c.free()
    
    o_c = bpy.data.objects.new(c_name, me_c)
    col_battery.objects.link(o_c)
    o_c.data.materials.append(mat)
    created_bms.append(c_name)

bpy.ops.wm.save_as_mainfile(filepath=bpy.data.filepath)

result = {
    "battery_tray": "BATTERY_TRAY",
    "battery_modules": modules_created,
    "bms_components": created_bms,
    "collection": col_battery.name,
    "saved_file": bpy.data.filepath
}
"""

res = client.execute_code(code)
print("Battery Bank and BMS Setup Result:\n", json.dumps(res, indent=2))
