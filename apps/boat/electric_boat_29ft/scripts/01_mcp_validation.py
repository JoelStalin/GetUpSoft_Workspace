import json
import os
from blender_mcp_client import BlenderMCPClient

client = BlenderMCPClient()

test_script = """
import bpy
import os

# 1. Version
ver = ".".join(str(x) for x in bpy.app.version)

# 2. Active Scene
sc_name = bpy.context.scene.name

# 3. Collections
cols = [c.name for c in bpy.data.collections]

# 4. Objects
objs = [o.name for o in bpy.data.objects]

# 5. Dimensions & Transform of first object if exists
dim_info = {}
if bpy.data.objects:
    o = bpy.data.objects[0]
    dim_info = {
        "name": o.name,
        "dimensions": list(o.dimensions),
        "location": list(o.location)
    }

# 6. Create temporary test cube
bpy.ops.mesh.primitive_cube_add(size=2.0, location=(0, 0, 0))
cube = bpy.context.active_object
cube.name = "MCP_TEST_CUBE"
cube_created = "MCP_TEST_CUBE" in bpy.data.objects

# 7. Delete temporary test cube
bpy.data.objects.remove(cube, do_unlink=True)
cube_deleted = "MCP_TEST_CUBE" not in bpy.data.objects

# 8. Save file
save_path = r"c:\\Users\\yoeli\\Documents\\GetUpSoft_Workspace\\02_Products\\GetUpSoftBoat\\electric_boat_29ft\\blender\\backups\\00_mcp_test.blend"
bpy.ops.wm.save_as_mainfile(filepath=save_path)
file_saved = os.path.exists(save_path)

result = {
    "blender_version": ver,
    "active_scene": sc_name,
    "collections_count": len(cols),
    "objects_count": len(objs),
    "queried_object": dim_info,
    "test_cube_created": cube_created,
    "test_cube_deleted": cube_deleted,
    "file_saved": file_saved,
    "mcp_status": "VERIFIED" if (cube_created and cube_deleted and file_saved) else "FAILED"
}
"""

res = client.execute_code(test_script)

val_file = r"c:\Users\yoeli\Documents\GetUpSoft_Workspace\02_Products\GetUpSoftBoat\electric_boat_29ft\logs\mcp_validation.txt"
with open(val_file, "w", encoding="utf-8") as f:
    f.write(json.dumps(res, indent=2))

print("MCP Validation Result:\n", json.dumps(res, indent=2))
