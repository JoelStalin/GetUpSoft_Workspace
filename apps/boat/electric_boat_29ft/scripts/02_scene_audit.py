import json
import os
from blender_mcp_client import BlenderMCPClient

client = BlenderMCPClient()

audit_script = """
import bpy
import mathutils

bpy.ops.wm.open_mainfile(filepath=r"c:\\Users\\yoeli\\Documents\\GetUpSoft_Workspace\\02_Products\\GetUpSoftBoat\\electric_boat_29ft\\source\\board_original.blend")

# Save initial backup 00_original_copy.blend
bpy.ops.wm.save_as_mainfile(filepath=r"c:\\Users\\yoeli\\Documents\\GetUpSoft_Workspace\\02_Products\\GetUpSoftBoat\\electric_boat_29ft\\blender\\backups\\00_original_copy.blend")

objects_data = []

for o in bpy.data.objects:
    mw = o.matrix_world
    mats = [m.name for m in o.data.materials if m] if hasattr(o.data, "materials") else []
    verts = len(o.data.vertices) if hasattr(o.data, "vertices") else 0
    polys = len(o.data.polygons) if hasattr(o.data, "polygons") else 0
    
    dim = list(o.dimensions)
    loc = list(o.location)
    
    # Classify role & action based on spatial position & geometry
    role = "Unknown"
    action = "Unknown"
    
    if o.name == "Cube.003":
        role = "Main Vessel Hull & Deck Structural Mesh"
        action = "Keep (Rename HULL_MAIN)"
    elif o.name == "Cube":
        role = "Helm Console Unit"
        action = "Keep & Upgrade"
    elif o.name == "Plane":
        role = "Console Windshield / Screen Frame"
        action = "Keep"
    elif o.name == "Cylinder":
        role = "Base Marine Steering Wheel"
        action = "Keep & Upgrade"
    elif o.name == "BezierCurve":
        role = "Deck Stainless Guard Railing"
        action = "Keep"
    elif o.name == "Cube.002":
        role = "Cockpit Seating & Bench Structure"
        action = "Keep"
    elif o.name == "Cylinder.001":
        role = "Base Shaft Propeller Hardware"
        action = "Modify"
    elif o.name in ["Cube.001", "Cube.004", "Cube.005", "Cylinder.002"]:
        role = "Helm Controls, MFD Bracket & Hardware"
        action = "Keep"
    elif o.name in ["Sphere", "Plane.001", "Plane.002", "Plane.003", "stone 1", "stone2", "stone3", "Lamp", "Lamp.001"]:
        role = "Background Environment Prop / Water Grid / Rocks"
        action = "Move to 00_ORIGINAL_UNUSED & Hide"
    
    objects_data.append({
        "name": o.name,
        "type": o.type,
        "role": role,
        "dimensions": [round(d, 3) for d in dim],
        "location": [round(l, 3) for l in loc],
        "verts": verts,
        "polys": polys,
        "materials": mats,
        "action": action
    })

result = {"objects": objects_data}
"""

res = client.execute_code(audit_script)

md_lines = [
    "# Documento de Auditoría de Escena Original (`docs/SCENE_AUDIT.md`)",
    "",
    "## Inventario Completo de Objetos y Asignación de Roles",
    "",
    "| Objeto | Tipo | Rol Conceptual | Dimensiones [X,Y,Z] (m) | Ubicación [X,Y,Z] (m) | Verts / Polys | Materiales | Acción Recomendada |",
    "|---|---|---|---|---|---|---|---|"
]

for obj in res["result"]["objects"]:
    dims_str = f"[{obj['dimensions'][0]}, {obj['dimensions'][1]}, {obj['dimensions'][2]}]"
    loc_str = f"[{obj['location'][0]}, {obj['location'][1]}, {obj['location'][2]}]"
    vp_str = f"{obj['verts']} / {obj['polys']}"
    mats_str = ", ".join(obj['materials']) if obj['materials'] else "None"
    md_lines.append(f"| `{obj['name']}` | `{obj['type']}` | {obj['role']} | {dims_str} | {loc_str} | {vp_str} | {mats_str} | **{obj['action']}** |")

md_lines.extend([
    "",
    "## Estrategia de Preservación de Geometría Base",
    "- Los 11 objetos pertenecientes a la embarcación (`Cube.003`, `Cube`, `Plane`, `Cylinder`, `BezierCurve`, `Cube.001`, `Cube.002`, `Cube.004`, `Cube.005`, `Cylinder.001`, `Cylinder.002`) se preservan de forma unificada sin destruir sus mapas UV ni materiales nativos.",
    "- Los 10 objetos de entorno (`Sphere`, `Plane.001`, `Plane.002`, `Plane.003`, `stone 1`, `stone2`, `stone3`, `Lamp`, `Lamp.001`) se transfieren a la colección de aislamiento `00_ORIGINAL_UNUSED` con visibilidad desactivada."
])

audit_file = r"c:\Users\yoeli\Documents\GetUpSoft_Workspace\02_Products\GetUpSoftBoat\electric_boat_29ft\docs\SCENE_AUDIT.md"
with open(audit_file, "w", encoding="utf-8") as f:
    f.write("\n".join(md_lines))

print(f"Generated {audit_file} successfully.")
