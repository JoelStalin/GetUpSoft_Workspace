import json
from blender_mcp_client import BlenderMCPClient

client = BlenderMCPClient()

test_script = """
import bpy

# 1. Consultar la escena
scene_name = bpy.context.scene.name

# 2. Listar objetos
obj_names = [o.name for o in bpy.data.objects]

# 3. Consultar transforms
transforms = {o.name: {"location": list(o.location), "rotation": list(o.rotation_euler), "scale": list(o.scale)} for o in bpy.data.objects[:3]}

# 4. Ejecutar operaciones Blender/Python (e.g. create a temp metadata prop or test object)
bpy.context.scene["mcp_test_ping"] = "pong_ok"

# 5. Guardar el .blend
bpy.ops.wm.save_mainfile()

result = {
    "scene_name": scene_name,
    "object_count": len(obj_names),
    "sample_objects": obj_names[:5],
    "sample_transforms": transforms,
    "test_property": bpy.context.scene.get("mcp_test_ping"),
    "saved": True
}
"""

res = client.execute_code(test_script)
print("Phase 3 Verification Result:\n", json.dumps(res, indent=2))
