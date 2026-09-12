import json
from blender_mcp_client import BlenderMCPClient

client = BlenderMCPClient()

code = """
import bpy
import mathutils

# Open working file
bpy.ops.wm.open_mainfile(filepath=r"c:\\Users\\yoeli\\Documents\\GetUpSoft_Workspace\\02_Products\\GetUpSoftBoat\\electric_boat_29ft\\blender\\electric_boat_29ft.blend")

col_battery = bpy.data.collections.get("06_BATTERY_SYSTEM")
mat_hv = bpy.data.materials.get("MAT_HV_ORANGE")

# Remove existing cabling objects if re-running
for o in list(bpy.data.objects):
    if o.name.startswith("HV_CABLE_") or o.name.startswith("SOLAR_CABLE_"):
        bpy.data.objects.remove(o, do_unlink=True)

def create_cable_curve(name, points, bevel_radius=0.015):
    curve_data = bpy.data.curves.new(name=f"{name}_CURVE", type='CURVE')
    curve_data.dimensions = '3D'
    curve_data.bevel_depth = bevel_radius
    curve_data.bevel_resolution = 4
    
    spline = curve_data.splines.new('BEZIER')
    spline.bezier_points.add(len(points) - 1)
    
    for idx, pt in enumerate(points):
        bp = spline.bezier_points[idx]
        bp.co = pt
        bp.handle_left_type = 'AUTO'
        bp.handle_right_type = 'AUTO'
    
    obj = bpy.data.objects.new(name, curve_data)
    col_battery.objects.link(obj)
    obj.data.materials.append(mat_hv)
    return obj.name

cables_created = []

# 1. Battery Modules -> HV Junction Box Cable
cables_created.append(create_cable_curve("HV_CABLE_BATTERY_TO_JUNCTION", [
    mathutils.Vector((0.2, 0.0, 0.50)),
    mathutils.Vector((0.8, 0.0, 0.50)),
    mathutils.Vector((1.3, 0.0, 0.55))
]))

# 2. HV Junction Box -> Inverter Cable
cables_created.append(create_cable_curve("HV_CABLE_JUNCTION_TO_INVERTER", [
    mathutils.Vector((1.3, -0.1, 0.55)),
    mathutils.Vector((0.0, -0.3, 0.48)),
    mathutils.Vector((-1.0, -0.3, 0.52)),
    mathutils.Vector((-1.4, -0.1, 0.65))
]))

# 3. Inverter -> Inboard Motor Cable
cables_created.append(create_cable_curve("HV_CABLE_INVERTER_TO_MOTOR", [
    mathutils.Vector((-1.4, 0.0, 0.65)),
    mathutils.Vector((-1.8, 0.0, 0.55)),
    mathutils.Vector((-2.0, 0.0, 0.52))
]))

# 4. Solar Canopy -> Pillar -> Battery/DC Bus Cable
cables_created.append(create_cable_curve("SOLAR_CABLE_ROUTING", [
    mathutils.Vector((0.0, 0.85, 2.25)), # Hardtop
    mathutils.Vector((0.2, 0.88, 1.50)), # Inside Port Pillar
    mathutils.Vector((0.4, 0.85, 0.90)), # Gunwale deck entry
    mathutils.Vector((0.8, 0.20, 0.55))  # Junction box entry
], bevel_radius=0.012))

bpy.ops.wm.save_as_mainfile(filepath=bpy.data.filepath)

result = {
    "cables_created": cables_created,
    "collection": col_battery.name,
    "saved_file": bpy.data.filepath
}
"""

res = client.execute_code(code)
print("HV Cabling Routing Result:\n", json.dumps(res, indent=2))
