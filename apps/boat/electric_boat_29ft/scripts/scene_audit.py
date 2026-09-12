import json
import os
from blender_mcp_client import BlenderMCPClient

client = BlenderMCPClient()

audit_code = """
import bpy
import mathutils

def get_bbox(obj):
    if not obj.bound_box:
        return None
    world_matrix = obj.matrix_world
    bbox_corners = [world_matrix @ mathutils.Vector(corner) for corner in obj.bound_box]
    min_x = min(c.x for c in bbox_corners)
    max_x = max(c.x for c in bbox_corners)
    min_y = min(c.y for c in bbox_corners)
    max_y = max(c.y for c in bbox_corners)
    min_z = min(c.z for c in bbox_corners)
    max_z = max(c.z for c in bbox_corners)
    return {
        "min": [min_x, min_y, min_z],
        "max": [max_x, max_y, max_z],
        "dimensions": [max_x - min_x, max_y - min_y, max_z - min_z]
    }

collections = [c.name for c in bpy.data.collections]
objects_data = []

for obj in bpy.data.objects:
    obj_info = {
        "name": obj.name,
        "type": obj.type,
        "location": list(obj.location),
        "rotation_euler": list(obj.rotation_euler),
        "scale": list(obj.scale),
        "dimensions": list(obj.dimensions),
        "parent": obj.parent.name if obj.parent else None,
        "children": [child.name for child in obj.children],
        "users_collection": [c.name for c in obj.users_collection],
        "modifiers": [{"name": m.name, "type": m.type} for m in obj.modifiers],
        "materials": [m.name for m in obj.data.materials if m] if hasattr(obj.data, "materials") else [],
        "bbox_world": get_bbox(obj)
    }
    objects_data.append(obj_info)

materials_data = []
for mat in bpy.data.materials:
    textures = []
    if mat.use_nodes and mat.node_tree:
        for node in mat.node_tree.nodes:
            if node.type == 'TEX_IMAGE' and node.image:
                textures.append(node.image.filepath or node.image.name)
    materials_data.append({
        "name": mat.name,
        "textures": textures
    })

cameras = [c.name for c in bpy.data.cameras]
lights = [l.name for l in bpy.data.lights]

result = {
    "collections": collections,
    "objects": objects_data,
    "materials": materials_data,
    "cameras": cameras,
    "lights": lights,
    "unit_settings": {
        "system": bpy.context.scene.unit_settings.system,
        "scale_length": bpy.context.scene.unit_settings.scale_length,
        "length_unit": bpy.context.scene.unit_settings.length_unit
    }
}
"""

res = client.execute_code(audit_code)
audit_data = res.get("result", {})

with open("docs/audit_raw_data.json", "w", encoding="utf-8") as f:
    json.dump(audit_data, f, indent=2)

print(f"Audited {len(audit_data.get('objects', []))} objects, {len(audit_data.get('materials', []))} materials.")
