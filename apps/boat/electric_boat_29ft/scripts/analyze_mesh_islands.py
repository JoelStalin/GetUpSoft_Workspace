import json
from blender_mcp_client import BlenderMCPClient

client = BlenderMCPClient()

islands_code = """
import bpy
import bmesh
import mathutils

bpy.ops.wm.open_mainfile(filepath=r"c:\\Users\\yoeli\\Documents\\GetUpSoft_Workspace\\02_Products\\GetUpSoftBoat\\electric_boat_29ft\\source\\board_original.blend")

obj = bpy.data.objects.get("Plane.001")
res_islands = []

if obj and obj.type == 'MESH':
    bm = bmesh.new()
    bm.from_mesh(obj.data)
    bm.transform(obj.matrix_world)
    
    # Find connected components (islands)
    visited = set()
    islands = []
    
    for v in bm.verts:
        if v in visited:
            continue
        island_verts = []
        queue = [v]
        visited.add(v)
        while queue:
            curr = queue.pop()
            island_verts.append(curr)
            for edge in curr.link_edges:
                other = edge.other_vert(curr)
                if other not in visited:
                    visited.add(other)
                    queue.append(other)
        islands.append(island_verts)
    
    for idx, isl in enumerate(islands):
        coords = [v.co for v in isl]
        xs = [c.x for c in coords]
        ys = [c.y for c in coords]
        zs = [c.z for c in coords]
        res_islands.append({
            "island_index": idx,
            "vert_count": len(isl),
            "min_x": min(xs), "max_x": max(xs), "len_x": max(xs) - min(xs),
            "min_y": min(ys), "max_y": max(ys), "len_y": max(ys) - min(ys),
            "min_z": min(zs), "max_z": max(zs), "len_z": max(zs) - min(zs)
        })
    
    bm.free()

result = {"islands": sorted(res_islands, key=lambda x: x["vert_count"], reverse=True)}
"""

res = client.execute_code(islands_code)
print("Plane.001 Mesh Islands:\n", json.dumps(res, indent=2))
