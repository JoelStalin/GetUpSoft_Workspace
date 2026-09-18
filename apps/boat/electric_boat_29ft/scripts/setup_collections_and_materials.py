import json
from blender_mcp_client import BlenderMCPClient

client = BlenderMCPClient()

code = """
import bpy

# Open current active working file
bpy.ops.wm.open_mainfile(filepath=r"c:\\Users\\yoeli\\Documents\\GetUpSoft_Workspace\\02_Products\\GetUpSoftBoat\\electric_boat_29ft\\blender\\electric_boat_29ft.blend")

# 1. Define required Collections structure
collection_tree = [
    "00_REFERENCE",
    "01_HULL",
    "02_DECK",
    "03_SUPERSTRUCTURE",
    "04_HARDTOP",
    "05_SOLAR_SYSTEM",
    "06_BATTERY_SYSTEM",
    "07_PROPULSION_INBOARD",
    "08_PROPULSION_OUTBOARD",
    "09_HELM",
    "10_INTERIOR",
    "11_RAILINGS",
    "12_LIGHTING",
    "13_CAMERAS",
    "14_TECHNICAL_REFERENCE"
]

created_cols = {}
scene_collection = bpy.context.scene.collection

for cname in collection_tree:
    col = bpy.data.collections.get(cname)
    if not col:
        col = bpy.data.collections.new(cname)
        scene_collection.children.link(col)
    created_cols[cname] = col.name

# 2. Define and create PBR Materials
materials_spec = {
    "MAT_GRP_WHITE": {"color": (0.95, 0.95, 0.95, 1.0), "roughness": 0.15, "metallic": 0.0},
    "MAT_HULL_MARINE_BLUE": {"color": (0.01, 0.12, 0.35, 1.0), "roughness": 0.20, "metallic": 0.1},
    "MAT_SOLAR_GLASS": {"color": (0.05, 0.10, 0.25, 0.8), "roughness": 0.05, "metallic": 0.9},
    "MAT_SOLAR_CELL": {"color": (0.02, 0.04, 0.12, 1.0), "roughness": 0.1, "metallic": 0.8},
    "MAT_BATTERY_CASE": {"color": (0.1, 0.12, 0.14, 1.0), "roughness": 0.3, "metallic": 0.5},
    "MAT_HV_ORANGE": {"color": (1.0, 0.25, 0.0, 1.0), "roughness": 0.3, "metallic": 0.1},
    "MAT_MOTOR": {"color": (0.15, 0.15, 0.18, 1.0), "roughness": 0.2, "metallic": 0.8},
    "MAT_DISPLAY_GLASS": {"color": (0.01, 0.01, 0.01, 1.0), "roughness": 0.05, "metallic": 0.9},
    "MAT_DISPLAY_EMISSION": {"color": (0.0, 0.6, 1.0, 1.0), "roughness": 0.1, "metallic": 0.0, "emission": (0.0, 0.6, 1.0, 1.0), "emission_strength": 2.5},
    "MAT_STAINLESS": {"color": (0.8, 0.8, 0.82, 1.0), "roughness": 0.1, "metallic": 0.95},
    "MAT_BLACK_TECH": {"color": (0.05, 0.05, 0.06, 1.0), "roughness": 0.4, "metallic": 0.3}
}

created_mats = []
for mname, spec in materials_spec.items():
    mat = bpy.data.materials.get(mname)
    if not mat:
        mat = bpy.data.materials.new(name=mname)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    bsdf = nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = spec["color"]
        bsdf.inputs["Roughness"].default_value = spec["roughness"]
        bsdf.inputs["Metallic"].default_value = spec["metallic"]
        if "emission" in spec and "Emission Color" in bsdf.inputs:
            bsdf.inputs["Emission Color"].default_value = spec["emission"]
            if "Emission Strength" in bsdf.inputs:
                bsdf.inputs["Emission Strength"].default_value = spec["emission_strength"]
    created_mats.append(mat.name)

# Assign HULL_MAIN to 01_HULL collection and apply materials
hull = bpy.data.objects.get("HULL_MAIN")
if hull:
    # Remove from default collections
    for c in list(hull.users_collection):
        c.objects.unlink(hull)
    bpy.data.collections["01_HULL"].objects.link(hull)
    
    # Assign MAT_HULL_MARINE_BLUE and MAT_GRP_WHITE
    hull.data.materials.clear()
    hull.data.materials.append(bpy.data.materials.get("MAT_HULL_MARINE_BLUE"))
    hull.data.materials.append(bpy.data.materials.get("MAT_GRP_WHITE"))

# Organize existing helm/deck objects into appropriate collections
obj_col_map = {
    "Cube": "09_HELM", # Console
    "Cylinder": "09_HELM", # Steering
    "Cube.002": "10_INTERIOR", # Seats
    "Plane": "09_HELM", # Windshield
    "Cube.001": "09_HELM", # Throttle
    "Cube.004": "09_HELM", # Display
    "Cube.005": "09_HELM", # Switch panel
    "Cylinder.001": "07_PROPULSION_INBOARD",
    "Cylinder.002": "11_RAILINGS",
    "BezierCurve": "11_RAILINGS"
}

for obj_name, target_col_name in obj_col_map.items():
    o = bpy.data.objects.get(obj_name)
    if o:
        for c in list(o.users_collection):
            c.objects.unlink(o)
        bpy.data.collections[target_col_name].objects.link(o)

bpy.ops.wm.save_as_mainfile(filepath=bpy.data.filepath)

result = {
    "collections": list(created_cols.keys()),
    "materials": created_mats,
    "saved_file": bpy.data.filepath
}
"""

res = client.execute_code(code)
print("Collections and Materials Setup Result:\n", json.dumps(res, indent=2))
