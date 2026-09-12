"""
FASE 8 — Script que corre DENTRO de Blender para setup de cámaras + renderizar
"""
import bpy
import mathutils
import subprocess
import os

BASE    = r"c:\Users\yoeli\Documents\GetUpSoft_Workspace\02_Products\GetUpSoftBoat\electric_boat_29ft"
BLEND   = os.path.join(BASE, "blender", "electric_boat_29ft_FINAL.blend")
BLENDER = r"C:\Program Files\Blender Foundation\Blender 5.2\blender.exe"
TECH    = os.path.join(BASE, "renders", "technical")
PRES    = os.path.join(BASE, "renders", "presentation")

sc = bpy.context.scene

# ── Asegurar colección de cámaras ─────────────────────────────────────────────
col14 = bpy.data.collections.get("14_CAMERAS")
if col14 is None:
    col14 = bpy.data.collections.new("14_CAMERAS")
    sc.collection.children.link(col14)

def cam(name, loc, rot_deg, ortho=True, ortho_scale=12.0, fov_lens=35.0):
    cam_data = bpy.data.cameras.get(name)
    if cam_data is None:
        cam_data = bpy.data.cameras.new(name)
    cam_data.type = "ORTHO" if ortho else "PERSP"
    if ortho:
        cam_data.ortho_scale = ortho_scale
    else:
        cam_data.lens = fov_lens
    obj = bpy.data.objects.get(name)
    if obj is None:
        obj = bpy.data.objects.new(name, cam_data)
    obj.location = mathutils.Vector(loc)
    obj.rotation_euler = mathutils.Euler([r * 3.14159265 / 180 for r in rot_deg], 'XYZ')
    # Asegurar que esté en la colección 14_CAMERAS
    for col in list(obj.users_collection):
        col.objects.unlink(obj)
    col14.objects.link(obj)
    return obj

# Cámaras ortográficas (vistas técnicas)
cam("CAM_PROFILE_PORT",    loc=(-0.5, -18, 1.2),  rot_deg=(90,  0,   0),  ortho=True,  ortho_scale=11)
cam("CAM_TOP",             loc=(-0.5,   0, 20),   rot_deg=( 0,  0,   0),  ortho=True,  ortho_scale=12)
cam("CAM_FRONT",           loc=( 7.0,   0,  1.2), rot_deg=(90,  0,  90),  ortho=True,  ortho_scale=6)
cam("CAM_TRANSOM",         loc=(-7.0,   0,  1.2), rot_deg=(90,  0, -90),  ortho=True,  ortho_scale=6)
cam("CAM_CONSOLE",         loc=( 0.8,  -6,  2.5), rot_deg=(70,  0, -10),  ortho=False, fov_lens=35)
cam("CAM_BATTERY_SEC",     loc=(-1.8,  -8,  2.5), rot_deg=(70,  0, -10),  ortho=False, fov_lens=35)

# Cámaras perspectivas (vistas de presentación)
cam("CAM_ISOMETRIC_PORT",  loc=(-2.5, -12,  5.0), rot_deg=(65,  0, -30),  ortho=False, fov_lens=40)
cam("CAM_ISOMETRIC_STARBD",loc=(-2.5,  12,  5.0), rot_deg=(65,  0,  30),  ortho=False, fov_lens=40)
cam("CAM_BOW_3Q",          loc=( 3.5,  -9,  4.0), rot_deg=(65,  0, -30),  ortho=False, fov_lens=35)
cam("CAM_STERN_3Q",        loc=(-6.0,  -8,  3.5), rot_deg=(65,  0, -55),  ortho=False, fov_lens=35)

# Configuración de render
sc.render.engine               = "BLENDER_EEVEE"
sc.render.resolution_x         = 1920
sc.render.resolution_y         = 1080
sc.render.image_settings.file_format = "PNG"

bpy.ops.wm.save_as_mainfile(filepath=BLEND)
print("Cameras configured and file saved")

# ── Renderizar cada vista con subprocess ──────────────────────────────────────
views = [
    ("CAM_PROFILE_PORT",    TECH, "01_profile_revised.png"),
    ("CAM_TOP",             TECH, "02_top_revised.png"),
    ("CAM_FRONT",           TECH, "03_front_revised.png"),
    ("CAM_TRANSOM",         TECH, "04_transom_revised.png"),
    ("CAM_CONSOLE",         TECH, "05_console_detail.png"),
    ("CAM_BATTERY_SEC",     TECH, "06_battery_section_revised.png"),
    ("CAM_ISOMETRIC_PORT",  PRES, "08_isometric_port_revised.png"),
    ("CAM_ISOMETRIC_STARBD",PRES, "09_isometric_starbd_revised.png"),
    ("CAM_BOW_3Q",          PRES, "10_bow_3q_revised.png"),
    ("CAM_STERN_3Q",        PRES, "11_stern_3q_revised.png"),
]

ok_count = 0
for cam_name, out_dir, out_name in views:
    out_path = os.path.join(out_dir, out_name)
    py_expr = (
        f"import bpy; sc=bpy.context.scene; "
        f"cam_obj=bpy.data.objects.get('{cam_name}'); "
        f"sc.camera=cam_obj; "
        "sc.render.resolution_x=1920; sc.render.resolution_y=1080; "
        "sc.render.image_settings.file_format='PNG'"
    )
    cmd = [BLENDER, "--background", BLEND,
           "--python-expr", py_expr,
           "--render-output", out_path, "-f", "1"]
    r = subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8", errors="replace")

    # Fix frame-number suffix
    numbered = out_path.replace(".png", "0001.png")
    if os.path.exists(numbered):
        if os.path.exists(out_path): os.remove(out_path)
        os.rename(numbered, out_path)

    exists = os.path.exists(out_path)
    size   = os.path.getsize(out_path) // 1024 if exists else 0
    status = "OK" if (r.returncode == 0 and exists and size > 2) else "FAILED"
    print(f"[{status}] {cam_name} -> {out_name} ({size} KB)")
    if status == "OK":
        ok_count += 1

print(f"\nRenders completados: {ok_count}/{len(views)}")
