import json
from blender_mcp_client import BlenderMCPClient

client = BlenderMCPClient()

inspect_code = """
import bpy

objs = []
for o in bpy.data.objects:
    if o.type == 'MESH':
        objs.append({
            "name": o.name,
            "dimensions": list(o.dimensions),
            "location": list(o.location),
            "scale": list(o.scale),
            "verts_count": len(o.data.vertices) if o.data else 0
        })

result = {"objects": sorted(objs, key=lambda x: x["dimensions"][0]*x["dimensions"][1]*x["dimensions"][2], reverse=True)}
"""

res = client.execute_code(inspect_code)
print("Mesh Objects Inventory:\n", json.dumps(res, indent=2))
