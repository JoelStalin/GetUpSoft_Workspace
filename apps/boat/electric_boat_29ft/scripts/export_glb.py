import json
from blender_mcp_client import BlenderMCPClient

client = BlenderMCPClient()

code = """
import bpy

glb_path = r"c:\\Users\\yoeli\\Documents\\GetUpSoft_Workspace\\02_Products\\GetUpSoftBoat\\electric_boat_29ft\\exports\\electric_boat_29ft.glb"
success = False

# Try glTF export operators
try:
    if hasattr(bpy.ops.export_scene, "gltf"):
        bpy.ops.export_scene.gltf(filepath=glb_path, export_format='GLB')
        success = True
    elif hasattr(bpy.ops.wm, "gltf_export"):
        bpy.ops.wm.gltf_export(filepath=glb_path, export_format='GLB')
        success = True
    else:
        # Enable gltf addon if present
        bpy.ops.preferences.addon_enable(module="io_scene_gltf2")
        bpy.ops.export_scene.gltf(filepath=glb_path, export_format='GLB')
        success = True
except Exception as e:
    print(f"GLB export note: {e}")

result = {"glb_exported": success, "path": glb_path}
"""

res = client.execute_code(code)
print("GLB Export Result:\n", json.dumps(res, indent=2))
