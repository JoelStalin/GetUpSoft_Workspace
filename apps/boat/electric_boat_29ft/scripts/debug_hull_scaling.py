import json
from blender_mcp_client import BlenderMCPClient

client = BlenderMCPClient()

debug_code = """
import bpy
import mathutils

bpy.ops.wm.open_mainfile(filepath=r"c:\\Users\\yoeli\\Documents\\GetUpSoft_Workspace\\02_Products\\GetUpSoftBoat\\electric_boat_29ft\\source\\board_original.blend")

# Remove env
env_names = ["Sphere", "Plane.001", "Plane.002", "Plane.003", "stone 1", "stone2", "stone3", "Lamp", "Lamp.001"]
for name in env_names:
    o = bpy.data.objects.get(name)
    if o:
        bpy.data.objects.remove(o, do_unlink=True)

hull_main = bpy.data.objects.get("Cube.003")
hull_main.name = "HULL_MAIN"

# Rotate 90 deg around Z
for o in bpy.data.objects:
    if o.parent is None:
        o.rotation_euler.z += 1.5707963267948966

bpy.context.view_layer.update()

# Force scene update to get fresh matrix_world
dg = bpy.context.evaluated_depsgraph_get()
hull_eval = hull_main.evaluated_get(dg)
mw = hull_eval.matrix_world

world_corners = [mw @ mathutils.Vector(c) for c in hull_main.bound_box]
xs = [c.x for c in world_corners]
ys = [c.y for c in world_corners]
zs = [c.z for c in world_corners]

current_loa = max(xs) - min(xs)
current_beam = max(ys) - min(ys)
current_height = max(zs) - min(zs)

target_loa = 8.84
target_beam = 2.80

scale_x = target_loa / current_loa
scale_y = target_beam / current_beam
scale_z = scale_x

center_x = (min(xs) + max(xs)) / 2.0
center_y = (min(ys) + max(ys)) / 2.0
min_z_val = min(zs)

for o in bpy.data.objects:
    if o.parent is None:
        o.location.x = (o.location.x - center_x) * scale_x
        o.location.y = (o.location.y - center_y) * scale_y
        o.location.z = (o.location.z - min_z_val) * scale_z
        o.scale.x *= scale_x
        o.scale.y *= scale_y
        o.scale.z *= scale_z

bpy.context.view_layer.update()

dg = bpy.context.evaluated_depsgraph_get()
hull_eval = hull_main.evaluated_get(dg)
mw = hull_eval.matrix_world

world_corners_final = [mw @ mathutils.Vector(c) for c in hull_main.bound_box]
xs_f = [c.x for c in world_corners_final]
ys_f = [c.y for c in world_corners_final]
zs_f = [c.z for c in world_corners_final]

final_loa = max(xs_f) - min(xs_f)
final_beam = max(ys_f) - min(ys_f)
final_height = max(zs_f) - min(zs_f)

bpy.ops.wm.save_as_mainfile(filepath=r"c:\\Users\\yoeli\\Documents\\GetUpSoft_Workspace\\02_Products\\GetUpSoftBoat\\electric_boat_29ft\\blender\\backups\\02_scaled.blend")
bpy.ops.wm.save_as_mainfile(filepath=r"c:\\Users\\yoeli\\Documents\\GetUpSoft_Workspace\\02_Products\\GetUpSoftBoat\\electric_boat_29ft\\blender\\electric_boat_29ft.blend")

result = {
    "current_loa": current_loa,
    "current_beam": current_beam,
    "scale_x": scale_x,
    "scale_y": scale_y,
    "final_loa": final_loa,
    "final_beam": final_beam,
    "final_height": final_height,
    "centerline": f"Y = {(min(ys_f) + max(ys_f))/2.0:.4f}"
}
"""

res = client.execute_code(debug_code)
print("Debug Hull Scaling Result:\n", json.dumps(res, indent=2))
