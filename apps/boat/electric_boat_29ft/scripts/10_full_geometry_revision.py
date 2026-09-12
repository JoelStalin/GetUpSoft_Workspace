"""
FASE 1+2+3: Reconstrucción completa del casco panga/lancha
          + Compartimentos interiores
          + Reescalado de componentes al espacio real

Basado en foto de referencia: panga de fondo casi plano, hard chine,
costados verticales, bordo ~0.90 m, LOA=8.84m, Beam=2.80m

Coordenadas: X=LOA (popa=-4.42, proa=+4.42), Y=transversal, Z=vertical
"""

import bpy
import bmesh
import mathutils
import os
import shutil

BASE = r"c:\Users\yoeli\Documents\GetUpSoft_Workspace\02_Products\GetUpSoftBoat\electric_boat_29ft"
FINAL  = os.path.join(BASE, "blender", "electric_boat_29ft_FINAL.blend")
BACKUP = os.path.join(BASE, "blender", "backups", "10_hull_geometry_revision.blend")

# ─── Abrir archivo final ───────────────────────────────────────────────────────
bpy.ops.wm.open_mainfile(filepath=FINAL)

# ─── Backup antes de modificar ────────────────────────────────────────────────
bpy.ops.wm.save_as_mainfile(filepath=BACKUP)
print(f"Backup 10 guardado: {BACKUP}")

sc = bpy.context.scene

# ─── Helper: crear objeto mesh desde vértices y caras ─────────────────────────
def make_mesh_obj(name, verts, faces, collection_name=None, mat=None):
    mesh = bpy.data.meshes.new(name + "_MESH")
    obj  = bpy.data.objects.new(name, mesh)
    bm   = bmesh.new()
    bv   = [bm.verts.new(v) for v in verts]
    bm.verts.ensure_lookup_table()
    for f in faces:
        try:
            bm.faces.new([bv[i] for i in f])
        except Exception:
            pass
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bm.to_mesh(mesh)
    bm.free()
    mesh.update()
    if collection_name:
        col = bpy.data.collections.get(collection_name)
        if col is None:
            col = bpy.data.collections.new(collection_name)
            sc.collection.children.link(col)
        col.objects.link(obj)
    else:
        sc.collection.objects.link(obj)
    if mat:
        obj.data.materials.append(mat)
    return obj

# ─── Helper: tubo de inox entre dos puntos ────────────────────────────────────
def make_tube(name, p1, p2, radius=0.022, segments=12, collection_name=None):
    v1 = mathutils.Vector(p1)
    v2 = mathutils.Vector(p2)
    length = (v2 - v1).length
    direction = (v2 - v1).normalized()

    bpy.ops.mesh.primitive_cylinder_add(
        radius=radius, depth=length, vertices=segments,
        location=((v1 + v2) / 2).to_tuple()
    )
    obj = bpy.context.active_object
    obj.name = name

    # Orient cylinder along tube axis
    z_axis = mathutils.Vector((0, 0, 1))
    rot_quat = z_axis.rotation_difference(direction)
    obj.rotation_mode = 'QUATERNION'
    obj.rotation_quaternion = rot_quat

    if collection_name:
        col = bpy.data.collections.get(collection_name)
        if col is None:
            col = bpy.data.collections.new(collection_name)
            sc.collection.children.link(col)
        # Move from scene root to collection
        if obj.name in sc.collection.objects:
            sc.collection.objects.unlink(obj)
        col.objects.link(obj)

    mat = bpy.data.materials.get("MAT_STAINLESS")
    if mat and len(obj.data.materials) == 0:
        obj.data.materials.append(mat)
    return obj

# ─── Materiales ───────────────────────────────────────────────────────────────
def get_mat(name, base_color, roughness=0.3, metallic=0.0, specular=0.5):
    mat = bpy.data.materials.get(name)
    if mat is None:
        mat = bpy.data.materials.new(name)
        mat.use_nodes = True
        bsdf = mat.node_tree.nodes.get("Principled BSDF")
        if bsdf:
            bsdf.inputs["Base Color"].default_value    = base_color
            bsdf.inputs["Roughness"].default_value     = roughness
            bsdf.inputs["Metallic"].default_value      = metallic
    return mat

mat_white    = get_mat("MAT_GRP_WHITE",   (0.95, 0.96, 0.97, 1.0), roughness=0.12)
mat_blue     = get_mat("MAT_GRP_BLUE",    (0.04, 0.10, 0.30, 1.0), roughness=0.20)
mat_deck     = get_mat("MAT_DECK",        (0.85, 0.83, 0.75, 1.0), roughness=0.60)
mat_glass    = get_mat("MAT_GLASS",       (0.5,  0.7,  0.9,  0.5), roughness=0.05)
mat_comp     = get_mat("MAT_COMPARTMENT", (0.70, 0.80, 0.75, 0.25),roughness=0.8)
mat_inox     = bpy.data.materials.get("MAT_STAINLESS") or get_mat("MAT_STAINLESS", (0.8,0.8,0.8,1.0), roughness=0.15, metallic=0.9)
mat_bat      = bpy.data.materials.get("MAT_BATTERY_CASE") or get_mat("MAT_BATTERY_CASE", (0.1,0.1,0.12,1.0), roughness=0.4)
mat_motor    = bpy.data.materials.get("MAT_MOTOR_METAL") or get_mat("MAT_MOTOR_METAL", (0.3,0.32,0.35,1.0), roughness=0.25, metallic=0.7)

# ─── Mover objetos viejos a colección UNUSED ──────────────────────────────────
unused_col = bpy.data.collections.get("00_ORIGINAL_UNUSED")
if unused_col is None:
    unused_col = bpy.data.collections.new("00_ORIGINAL_UNUSED")
    sc.collection.children.link(unused_col)

old_hull_names = ["HULL_MAIN", "Cube.003", "Cube", "Cube.001", "Cube.002",
                  "Cube.004", "Cube.005", "Plane", "Plane.001", "Plane.002", "Plane.003"]
for name in old_hull_names:
    obj = bpy.data.objects.get(name)
    if obj:
        # unlink from all collections, add to unused
        for col in list(obj.users_collection):
            col.objects.unlink(obj)
        if obj.name not in [o.name for o in unused_col.objects]:
            unused_col.objects.link(obj)
        obj.hide_viewport = True
        obj.hide_render   = True
        print(f"  Moved to UNUSED: {name}")

# ─── Asegurar colecciones destino ─────────────────────────────────────────────
def ensure_col(name):
    col = bpy.data.collections.get(name)
    if col is None:
        col = bpy.data.collections.new(name)
        sc.collection.children.link(col)
    return col

col_hull  = ensure_col("01_HULL")
col_deck  = ensure_col("02_DECK")
col_comp  = ensure_col("02_COMPARTMENTS")
col_cons  = ensure_col("03_CONSOLE")
col_ttop  = ensure_col("04_TTOP")
col_solar = bpy.data.collections.get("05_SOLAR_SYSTEM") or ensure_col("05_SOLAR_SYSTEM")
col_energy= bpy.data.collections.get("06_ENERGY_SYSTEM") or ensure_col("06_ENERGY_SYSTEM")
col_inb   = bpy.data.collections.get("07_PROPULSION_INBOARD") or ensure_col("07_PROPULSION_INBOARD")
col_out   = bpy.data.collections.get("08_PROPULSION_OUTBOARD") or ensure_col("08_PROPULSION_OUTBOARD")

# ══════════════════════════════════════════════════════════════════════════════
# FASE 1 — CASCO PANGA/LANCHA (Hard Chine, Flat Bottom)
# ══════════════════════════════════════════════════════════════════════════════
print("\n=== FASE 1: Construyendo casco panga ===")

# Dimensiones del casco real (de foto + especificaciones)
LOA_HALF   = 4.42   # m (X: -4.42 popa → +4.42 proa)
BEAM_HALF  = 1.40   # m (Y: ±1.40)
BOARD_H    = 0.88   # m altura de bordo (gunwale)
CHINE_Z    = 0.22   # m altura de quilla dura
BOT_HALF   = 0.75   # m ancho de fondo plano en amidships
WATERLINE_Z= 0.18   # m línea de flotación (pintura azul hasta aquí)

# Secciones longitudinales del casco (estaciones de cuadernas)
# Cada sección: (x, beam_half_at_chine, beam_half_at_gunwale, z_bottom, z_chine, z_gunwale)
# La proa se estrecha y eleva el fondo
stations = [
    # x        b_chine  b_gun    z_bot   z_chine  z_gun
    (-4.42,    0.00,    0.40,    0.52,   0.52,    0.88),  # Transom/Popa (casi cerrada)
    (-3.50,    0.80,    1.10,    0.20,   0.30,    0.88),  # Popa-centro
    (-2.00,    1.32,    1.40,    0.05,   0.22,    0.88),  # Amidships popa
    ( 0.00,    1.38,    1.40,    0.00,   0.22,    0.88),  # Amidships (midship)
    ( 1.50,    1.30,    1.40,    0.00,   0.20,    0.88),  # Amidships proa
    ( 3.00,    1.00,    1.25,    0.08,   0.25,    0.88),  # Proa-centro
    ( 4.00,    0.50,    0.75,    0.28,   0.38,    0.88),  # Proa avanzada
    ( 4.42,    0.00,    0.10,    0.55,   0.55,    0.88),  # Roda/Proa (cerrada)
]

# Construir vértices del casco (seccion por sección)
# Cada estación genera: keel center, chine_port, chine_stbd, gun_port, gun_stbd
hull_verts  = []
hull_faces  = []

def add_station_verts(sta):
    x, bc, bg, zb, zc, zg = sta
    # Keel (quilla, Y=0, Z=z_bottom)
    hull_verts.append((x,  0.0,  zb))     # 0: keel
    # Chine port & stbd
    hull_verts.append((x, -bc,   zc))     # 1: chine port
    hull_verts.append((x,  bc,   zc))     # 2: chine stbd
    # Gunwale port & stbd
    hull_verts.append((x, -bg,   zg))     # 3: gun port
    hull_verts.append((x,  bg,   zg))     # 4: gun stbd

n_sta = len(stations)
for sta in stations:
    add_station_verts(sta)

# Faces: para cada par de estaciones adyacentes conectar los 5 puntos
for i in range(n_sta - 1):
    base  = i * 5
    base2 = (i + 1) * 5
    k0, cp0, cs0, gp0, gs0 = base, base+1, base+2, base+3, base+4
    k1, cp1, cs1, gp1, gs1 = base2, base2+1, base2+2, base2+3, base2+4

    # Bottom port (keel → chine port)
    hull_faces.append((k0, cp0, cp1, k1))
    # Bottom stbd (keel → chine stbd)
    hull_faces.append((k0, k1, cs1, cs0))
    # Side port (chine → gunwale port)
    hull_faces.append((cp0, gp0, gp1, cp1))
    # Side stbd (chine → gunwale stbd)
    hull_faces.append((cs0, cs1, gs1, gs0))

# Transom (popa, primera estación)
hull_faces.append((0, 1, 3))   # port side transom
hull_faces.append((0, 4, 2))   # stbd side transom

# Bow (proa, última estación — cerrar punta)
last = (n_sta - 1) * 5
hull_faces.append((last, last+1, last+3))
hull_faces.append((last, last+4, last+2))

# Crear objeto casco
hull_obj = make_mesh_obj("HULL_MAIN", hull_verts, hull_faces,
                         collection_name="01_HULL", mat=mat_white)
# Aplicar smooth shading
for poly in hull_obj.data.polygons:
    poly.use_smooth = True
hull_obj.data.update()

# ── Asignar material bicolor por Z ───────────────────────────────────────────
hull_obj.data.materials.append(mat_blue)  # slot 1
white_idx = 0
blue_idx  = 1

bm_hull = bmesh.new()
bm_hull.from_mesh(hull_obj.data)
waterline = WATERLINE_Z
for face in bm_hull.faces:
    center = face.calc_center_median()
    face.material_index = blue_idx if center.z < waterline else white_idx
bm_hull.to_mesh(hull_obj.data)
bm_hull.free()
hull_obj.data.update()

print(f"  HULL_MAIN creado: {len(hull_verts)} vertices, {len(hull_faces)} caras")

# ══════════════════════════════════════════════════════════════════════════════
# FASE 2 — COMPARTIMENTOS INTERIORES (volúmenes de ingeniería)
# ══════════════════════════════════════════════════════════════════════════════
print("\n=== FASE 2: Compartimentos interiores ===")

def make_box(name, x_min, x_max, y_half, z_min, z_max, col_name, mat):
    """Crea una caja simple de compartimento"""
    verts = [
        (x_min, -y_half, z_min), (x_max, -y_half, z_min),
        (x_max,  y_half, z_min), (x_min,  y_half, z_min),
        (x_min, -y_half, z_max), (x_max, -y_half, z_max),
        (x_max,  y_half, z_max), (x_min,  y_half, z_max),
    ]
    faces = [
        (0,1,2,3),(4,7,6,5),(0,4,5,1),
        (1,5,6,2),(2,6,7,3),(3,7,4,0)
    ]
    obj = make_mesh_obj(name, verts, faces, collection_name=col_name, mat=mat)
    # Make semi-transparent wireframe appearance
    obj.display_type = 'WIRE'
    return obj

# Compartimento A — Bodega de proa
comp_a = make_box("COMP_BOW_LOCKER",
    x_min=2.5, x_max=4.2, y_half=1.10, z_min=0.02, z_max=0.85,
    col_name="02_COMPARTMENTS", mat=mat_comp)

# Compartimento B — Zona de trabajo/pesca
comp_b = make_box("COMP_WORK_AREA",
    x_min=0.8, x_max=2.5, y_half=1.28, z_min=0.02, z_max=0.85,
    col_name="02_COMPARTMENTS", mat=mat_comp)

# Compartimento C — Zona consola/cabina
comp_c = make_box("COMP_CONSOLE_ZONE",
    x_min=-0.3, x_max=0.8, y_half=1.35, z_min=0.02, z_max=0.85,
    col_name="02_COMPARTMENTS", mat=mat_comp)

# Compartimento D — Zona baterías (bajo cubierta de popa)
comp_d = make_box("COMP_BATTERY_ZONE",
    x_min=-3.0, x_max=-0.3, y_half=1.30, z_min=0.02, z_max=0.72,
    col_name="02_COMPARTMENTS", mat=mat_comp)

# Compartimento E — Motor (popa)
comp_e = make_box("COMP_ENGINE_ROOM",
    x_min=-4.20, x_max=-3.0, y_half=1.0, z_min=0.02, z_max=0.72,
    col_name="02_COMPARTMENTS", mat=mat_comp)

print("  Compartimentos A–E creados")

# ══════════════════════════════════════════════════════════════════════════════
# FASE 3 — REESCALAR COMPONENTES AL ESPACIO REAL
# ══════════════════════════════════════════════════════════════════════════════
print("\n=== FASE 3: Reescalando componentes ===")

# ── Baterías: 6 módulos dentro de COMP_D (X=-3.0 a -0.3, Y=±1.30, Z=0.02–0.72)
bat_dims = (0.70, 0.50, 0.32)  # largo, ancho, alto por módulo
bat_gap_x = 0.06
bat_gap_y = 0.05
bat_z = 0.10  # sobre el piso del compartimento

layout = [
    (-2.70, -0.55), (-2.70,  0.55),  # fila trasera
    (-1.85, -0.55), (-1.85,  0.55),  # fila media
    (-1.00, -0.55), (-1.00,  0.55),  # fila delantera
]

for idx, (bx, by) in enumerate(layout):
    old = bpy.data.objects.get(f"BAT_MOD_0{idx+1}")
    if old:
        old.location = (bx, by, bat_z)
        old.scale = (1.0, 1.0, 1.0)
        lx, ly, lz = bat_dims
        old.scale = (lx / old.dimensions.x if old.dimensions.x > 0 else 1,
                     ly / old.dimensions.y if old.dimensions.y > 0 else 1,
                     lz / old.dimensions.z if old.dimensions.z > 0 else 1)
        print(f"  BAT_MOD_0{idx+1} -> ({bx:.2f}, {by:.2f}, {bat_z:.2f})")
    else:
        # Crear batería nueva si no existe
        verts_b = [
            (-bat_dims[0]/2,-bat_dims[1]/2, 0),
            ( bat_dims[0]/2,-bat_dims[1]/2, 0),
            ( bat_dims[0]/2, bat_dims[1]/2, 0),
            (-bat_dims[0]/2, bat_dims[1]/2, 0),
            (-bat_dims[0]/2,-bat_dims[1]/2, bat_dims[2]),
            ( bat_dims[0]/2,-bat_dims[1]/2, bat_dims[2]),
            ( bat_dims[0]/2, bat_dims[1]/2, bat_dims[2]),
            (-bat_dims[0]/2, bat_dims[1]/2, bat_dims[2]),
        ]
        faces_b = [(0,1,2,3),(4,7,6,5),(0,4,5,1),(1,5,6,2),(2,6,7,3),(3,7,4,0)]
        bat_obj = make_mesh_obj(f"BAT_MOD_0{idx+1}", verts_b, faces_b,
                                collection_name="06_ENERGY_SYSTEM", mat=mat_bat)
        bat_obj.location = (bx, by, bat_z)
        print(f"  BAT_MOD_0{idx+1} NUEVO → ({bx:.2f}, {by:.2f}, {bat_z:.2f})")

# ── Battery Tray: bandeja estructural para las 6 baterías
bt = bpy.data.objects.get("BATTERY_TRAY")
if bt:
    bt.location = (-1.85, 0.0, 0.06)
    bt.dimensions = mathutils.Vector((2.60, 1.20, 0.08))
    print("  BATTERY_TRAY reposicionado")

# ── BMS Controller: mamparo entre COMP_D y COMP_E
bms = bpy.data.objects.get("BMS_CONTROLLER")
if bms:
    bms.location = (-3.05, 0.0, 0.45)
    bms.dimensions = mathutils.Vector((0.15, 0.80, 0.60))
    print("  BMS_CONTROLLER → mamparo popa")

# ── Inboard motor: dentro de COMP_E (X=-4.20 a -3.0)
motor = bpy.data.objects.get("INBOARD_MOTOR")
if motor:
    motor.location = (-3.70, 0.0, 0.28)
    motor.dimensions = mathutils.Vector((0.65, 0.48, 0.55))
    print("  INBOARD_MOTOR → COMP_E")

# ── Shaft: desde motor al transom
shaft = bpy.data.objects.get("SHAFT_MAIN")
if shaft:
    shaft.location = (-4.05, 0.0, 0.18)
    shaft.dimensions = mathutils.Vector((0.50, 0.06, 0.06))
    print("  SHAFT_MAIN → transom real")

# ── Propeller
prop = bpy.data.objects.get("PROPELLER")
if prop:
    prop.location = (-4.35, 0.0, 0.10)
    print("  PROPELLER → popa bajo transom")

# ── Outboard motor: centrado en transom
out_motor = bpy.data.objects.get("OUTBOARD_ELECTRIC_MOTOR")
if out_motor:
    out_motor.location = (-4.42, 0.0, 0.55)
    out_motor.dimensions = mathutils.Vector((0.45, 0.38, 0.90))
    print("  OUTBOARD_ELECTRIC_MOTOR → transom")

# ── HV components: dentro de COMP_E
hv_components = {
    "HV_MAIN_FUSE":           (-3.10, -0.35, 0.50),
    "HV_CONTACTOR":           (-3.10,  0.00, 0.50),
    "HV_JUNCTION_BOX":        (-3.10,  0.35, 0.50),
    "HV_EMERGENCY_DISCONNECT":(-3.20,  0.00, 0.65),
    "SERVICE_DISCONNECT":     (-3.15, -0.50, 0.65),
    "INVERTER_INBOARD":       (-3.40,  0.00, 0.45),
}
for hv_name, (hx, hy, hz) in hv_components.items():
    hv_obj = bpy.data.objects.get(hv_name)
    if hv_obj:
        hv_obj.location = (hx, hy, hz)
        print(f"  {hv_name} → ({hx:.2f}, {hy:.2f}, {hz:.2f})")

print("  Fase 3 completa")

# ══════════════════════════════════════════════════════════════════════════════
# FASE 4 — T-TOP DE TUBOS DE ACERO INOXIDABLE (como foto)
# ══════════════════════════════════════════════════════════════════════════════
print("\n=== FASE 4: T-Top de tubos inox ===")

# T-top sobre la zona de consola
# La foto muestra: 4 pilares, 2 rails longitudinales, travesaños
# Consola aprox en X = +0.0 a +0.8 m; T-top se extiende desde X=-0.2 a +1.8
TTOP_X_AFT  = -0.40   # popa del T-top
TTOP_X_FWD  =  1.80   # proa del T-top
TTOP_Y      =  1.15   # semiancho del T-top
TTOP_Z_TOP  =  2.50   # altura del top
TTOP_Z_BOT  =  0.92   # base de los pilares (sobre regala)

# Eliminar T-top viejo si existe
for old_name in ["HARDTOP_SHELL", "HARDTOP_SUPPORT_PORT", "HARDTOP_SUPPORT_STARBOARD",
                 "HARDTOP_SHELL_MESH", "HARDTOP_SUPPORT_PORT_MESH",
                 "HARDTOP_SUPPORT_STARBOARD_MESH"]:
    old_obj = bpy.data.objects.get(old_name)
    if old_obj:
        for col_x in list(old_obj.users_collection):
            col_x.objects.unlink(old_obj)
        unused_col.objects.link(old_obj)
        old_obj.hide_viewport = True
        old_obj.hide_render   = True

# 4 pilares verticales
make_tube("TTOP_POST_FWD_PORT",
    (TTOP_X_FWD, -TTOP_Y, TTOP_Z_BOT), (TTOP_X_FWD, -TTOP_Y, TTOP_Z_TOP),
    radius=0.025, collection_name="04_TTOP")
make_tube("TTOP_POST_FWD_STBD",
    (TTOP_X_FWD,  TTOP_Y, TTOP_Z_BOT), (TTOP_X_FWD,  TTOP_Y, TTOP_Z_TOP),
    radius=0.025, collection_name="04_TTOP")
make_tube("TTOP_POST_AFT_PORT",
    (TTOP_X_AFT, -TTOP_Y, TTOP_Z_BOT), (TTOP_X_AFT, -TTOP_Y, TTOP_Z_TOP),
    radius=0.025, collection_name="04_TTOP")
make_tube("TTOP_POST_AFT_STBD",
    (TTOP_X_AFT,  TTOP_Y, TTOP_Z_BOT), (TTOP_X_AFT,  TTOP_Y, TTOP_Z_TOP),
    radius=0.025, collection_name="04_TTOP")

# 2 rails longitudinales superiores
make_tube("TTOP_RAIL_PORT",
    (TTOP_X_AFT, -TTOP_Y, TTOP_Z_TOP), (TTOP_X_FWD, -TTOP_Y, TTOP_Z_TOP),
    radius=0.025, collection_name="04_TTOP")
make_tube("TTOP_RAIL_STBD",
    (TTOP_X_AFT,  TTOP_Y, TTOP_Z_TOP), (TTOP_X_FWD,  TTOP_Y, TTOP_Z_TOP),
    radius=0.025, collection_name="04_TTOP")

# 2 travesaños superiores (front + aft)
make_tube("TTOP_CROSS_FWD",
    (TTOP_X_FWD, -TTOP_Y, TTOP_Z_TOP), (TTOP_X_FWD,  TTOP_Y, TTOP_Z_TOP),
    radius=0.025, collection_name="04_TTOP")
make_tube("TTOP_CROSS_AFT",
    (TTOP_X_AFT, -TTOP_Y, TTOP_Z_TOP), (TTOP_X_AFT,  TTOP_Y, TTOP_Z_TOP),
    radius=0.025, collection_name="04_TTOP")

# Travesaño central (refuerzo)
x_mid = (TTOP_X_AFT + TTOP_X_FWD) / 2
make_tube("TTOP_CROSS_MID",
    (x_mid, -TTOP_Y, TTOP_Z_TOP), (x_mid,  TTOP_Y, TTOP_Z_TOP),
    radius=0.022, collection_name="04_TTOP")

# Diagonales de refuerzo traseras (como en la foto)
make_tube("TTOP_DIAG_PORT",
    (TTOP_X_AFT, -TTOP_Y, TTOP_Z_TOP), (TTOP_X_AFT - 0.50, -TTOP_Y, TTOP_Z_BOT + 0.30),
    radius=0.020, collection_name="04_TTOP")
make_tube("TTOP_DIAG_STBD",
    (TTOP_X_AFT,  TTOP_Y, TTOP_Z_TOP), (TTOP_X_AFT - 0.50,  TTOP_Y, TTOP_Z_BOT + 0.30),
    radius=0.020, collection_name="04_TTOP")

print("  T-Top: 11 tubos inox creados")

# ══════════════════════════════════════════════════════════════════════════════
# FASE 5 — CABINA/CONSOLA (como foto)
# ══════════════════════════════════════════════════════════════════════════════
print("\n=== FASE 5: Cabina/Consola ===")

# Dimensiones de la cabina (estimadas de la foto)
# X: 0.0 a +1.0 m (longitudinal, en zona consola)
# Y: ±0.65 m (ancho de cabina ~1.30 m)
# Z: 0.88 (cubierta) a +1.65 m (techo con escotilla)
CAB_X_AFT  =  0.00
CAB_X_FWD  =  1.10
CAB_Y      =  0.65
CAB_Z_BOT  =  0.88   # nivel de cubierta
CAB_Z_TOP  =  1.65   # techo de cabina

# Cuerpo principal de la cabina (forma trapezoidal — más ancho abajo)
cab_verts = [
    # Base inferior (nivel cubierta) — más ancha
    (CAB_X_AFT, -CAB_Y,      CAB_Z_BOT),   # 0 port aft
    (CAB_X_FWD, -CAB_Y*0.85, CAB_Z_BOT),   # 1 port fwd
    (CAB_X_FWD,  CAB_Y*0.85, CAB_Z_BOT),   # 2 stbd fwd
    (CAB_X_AFT,  CAB_Y,      CAB_Z_BOT),   # 3 stbd aft
    # Techo — más estrecho
    (CAB_X_AFT, -CAB_Y*0.80, CAB_Z_TOP),   # 4 port aft top
    (CAB_X_FWD, -CAB_Y*0.70, CAB_Z_TOP),   # 5 port fwd top
    (CAB_X_FWD,  CAB_Y*0.70, CAB_Z_TOP),   # 6 stbd fwd top
    (CAB_X_AFT,  CAB_Y*0.80, CAB_Z_TOP),   # 7 stbd aft top
]
cab_faces = [
    (0,1,2,3),   # bottom (invisible, cubierta)
    (4,7,6,5),   # techo
    (0,4,5,1),   # lado port
    (1,5,6,2),   # frente (parabrisas)
    (2,6,7,3),   # lado stbd
    (3,7,4,0),   # pared trasera
]

# Eliminar consola vieja (Cube original)
for old_cons_name in ["Cube", "Cube.003", "Cube.004", "Cube.005"]:
    oc = bpy.data.objects.get(old_cons_name)
    if oc and oc.name not in [o.name for o in unused_col.objects]:
        for c2 in list(oc.users_collection):
            c2.objects.unlink(oc)
        unused_col.objects.link(oc)
        oc.hide_viewport = True

cabin_obj = make_mesh_obj("CONSOLE_BODY", cab_verts, cab_faces,
                           collection_name="03_CONSOLE", mat=mat_white)
for poly in cabin_obj.data.polygons:
    poly.use_smooth = True

# Escotilla circular en el techo (como en la foto)
bpy.ops.mesh.primitive_cylinder_add(
    radius=0.18, depth=0.06, vertices=24,
    location=((CAB_X_AFT + CAB_X_FWD)/2, 0.0, CAB_Z_TOP + 0.03)
)
hatch = bpy.context.active_object
hatch.name = "CONSOLE_CIRCULAR_HATCH"
sc.collection.objects.unlink(hatch)
col_cons.objects.link(hatch)
hatch_mat = get_mat("MAT_HATCH_GRP", (0.75,0.78,0.80,1.0), roughness=0.15)
hatch.data.materials.append(hatch_mat)

# Parabrisas delantero (panel de vidrio)
ws_verts = [
    (CAB_X_FWD, -CAB_Y*0.80, CAB_Z_BOT + 0.10),
    (CAB_X_FWD,  CAB_Y*0.80, CAB_Z_BOT + 0.10),
    (CAB_X_FWD,  CAB_Y*0.65, CAB_Z_TOP - 0.05),
    (CAB_X_FWD, -CAB_Y*0.65, CAB_Z_TOP - 0.05),
]
ws_faces = [(0,1,2,3)]
ws_obj = make_mesh_obj("CONSOLE_WINDSHIELD", ws_verts, ws_faces,
                        collection_name="03_CONSOLE", mat=mat_glass)

# Panel de instrumentos (interior trasero de la cabina)
dash_verts = [
    (CAB_X_AFT + 0.05, -CAB_Y*0.75, CAB_Z_BOT + 0.30),
    (CAB_X_AFT + 0.05,  CAB_Y*0.75, CAB_Z_BOT + 0.30),
    (CAB_X_AFT + 0.05,  CAB_Y*0.75, CAB_Z_BOT + 0.75),
    (CAB_X_AFT + 0.05, -CAB_Y*0.75, CAB_Z_BOT + 0.75),
]
dash_faces = [(0,1,2,3)]
dash_mat = get_mat("MAT_DASH_BLACK", (0.08,0.08,0.10,1.0), roughness=0.3)
dash_obj = make_mesh_obj("CONSOLE_DASHBOARD", dash_verts, dash_faces,
                          collection_name="03_CONSOLE", mat=dash_mat)

print("  Cabina creada: body, windshield, hatch, dashboard")

# ══════════════════════════════════════════════════════════════════════════════
# FASE 6 — CUBIERTA EN CAPAS CON ESCOTILLAS
# ══════════════════════════════════════════════════════════════════════════════
print("\n=== FASE 6: Cubierta en capas ===")

deck_z = 0.88  # nivel de cubierta

# Cubierta de proa (zona de trabajo/ancla)
deck_bow_verts = [
    (1.90, -1.25, deck_z), (4.30, -0.30, deck_z),
    (4.30,  0.30, deck_z), (1.90,  1.25, deck_z),
]
make_mesh_obj("DECK_BOW", deck_bow_verts, [(0,1,2,3)],
              collection_name="02_DECK", mat=mat_deck)

# Cubierta lateral proa-centro
deck_mid_verts = [
    (0.80, -1.35, deck_z), (1.90, -1.25, deck_z),
    (1.90,  1.25, deck_z), (0.80,  1.35, deck_z),
]
make_mesh_obj("DECK_MID", deck_mid_verts, [(0,1,2,3)],
              collection_name="02_DECK", mat=mat_deck)

# Cubierta de popa (sobre baterías y motor)
deck_aft_verts = [
    (-4.20, -0.90, deck_z), (-0.30, -1.30, deck_z),
    (-0.30,  1.30, deck_z), (-4.20,  0.90, deck_z),
]
make_mesh_obj("DECK_AFT", deck_aft_verts, [(0,1,2,3)],
              collection_name="02_DECK", mat=mat_deck)

# Escotilla de baterías (centro de la cubierta de popa)
hatch_bat_verts = [
    (-2.60, -0.55, deck_z + 0.01), (-1.00, -0.55, deck_z + 0.01),
    (-1.00,  0.55, deck_z + 0.01), (-2.60,  0.55, deck_z + 0.01),
]
hatch_bat_mat = get_mat("MAT_HATCH_OPEN", (0.60,0.65,0.70,1.0), roughness=0.4)
make_mesh_obj("DECK_HATCH_BATTERY", hatch_bat_verts, [(0,1,2,3)],
              collection_name="02_DECK", mat=hatch_bat_mat)

# Escotilla motor
hatch_eng_verts = [
    (-4.10, -0.70, deck_z + 0.01), (-3.10, -0.70, deck_z + 0.01),
    (-3.10,  0.70, deck_z + 0.01), (-4.10,  0.70, deck_z + 0.01),
]
make_mesh_obj("DECK_HATCH_ENGINE", hatch_eng_verts, [(0,1,2,3)],
              collection_name="02_DECK", mat=hatch_bat_mat)

# Espejo de popa / transom (panel vertical)
transom_verts = [
    (-4.42, -0.90, 0.0), (-4.42,  0.90, 0.0),
    (-4.42,  0.90, 0.88), (-4.42, -0.90, 0.88),
]
transom_mat = get_mat("MAT_TRANSOM", (0.90,0.92,0.94,1.0), roughness=0.2)
make_mesh_obj("TRANSOM_PANEL", transom_verts, [(0,1,2,3)],
              collection_name="01_HULL", mat=transom_mat)

print("  Cubierta: bow, mid, aft + 2 escotillas + transom")

# ══════════════════════════════════════════════════════════════════════════════
# FASE 7 — RECALCULAR CG CON GEOMETRÍA REAL
# ══════════════════════════════════════════════════════════════════════════════
print("\n=== FASE 7: Centro de Gravedad ===")

components_mass = [
    ("HULL_MAIN",               ( 0.00, 0.0, 0.45),  320.0),  # casco GRP
    ("BAT_MOD_01",              (-2.70,-0.55, 0.10),   82.0),
    ("BAT_MOD_02",              (-2.70, 0.55, 0.10),   82.0),
    ("BAT_MOD_03",              (-1.85,-0.55, 0.10),   82.0),
    ("BAT_MOD_04",              (-1.85, 0.55, 0.10),   82.0),
    ("BAT_MOD_05",              (-1.00,-0.55, 0.10),   82.0),
    ("BAT_MOD_06",              (-1.00, 0.55, 0.10),   82.0),
    ("INBOARD_MOTOR",           (-3.70, 0.0,  0.28),  145.0),
    ("OUTBOARD_ELECTRIC_MOTOR", (-4.42, 0.0,  0.55),   65.0),
    ("CONSOLE_BODY",            ( 0.55, 0.0,  1.25),   60.0),
    ("BMS_CONTROLLER",          (-3.05, 0.0,  0.45),   18.0),
    ("INVERTER_INBOARD",        (-3.40, 0.0,  0.45),   22.0),
    ("PERSON_50_PERCENTILE",    ( 0.35, 0.0,  1.73),   80.0),
]

total_mass = sum(m for _,_,m in components_mass)
cg_x = sum(m*pos[0] for _,pos,m in components_mass) / total_mass
cg_y = sum(m*pos[1] for _,pos,m in components_mass) / total_mass
cg_z = sum(m*pos[2] for _,pos,m in components_mass) / total_mass

print(f"  Masa total: {total_mass:.1f} kg")
print(f"  CG: X={cg_x:.4f}m  Y={cg_y:.4f}m  Z={cg_z:.4f}m")
print(f"  LOA popa=-4.42m, proa=+4.42m")
pct_loa = (cg_x + LOA_HALF) / (2 * LOA_HALF) * 100
print(f"  CG_X posicion: {pct_loa:.1f}% desde popa")

# Guardar en propiedades de escena
sc["CG_X"]       = cg_x
sc["CG_Y"]       = cg_y
sc["CG_Z"]       = cg_z
sc["TOTAL_MASS"]  = total_mass
sc["CG_PCT_LOA"]  = pct_loa

# ══════════════════════════════════════════════════════════════════════════════
# GUARDAR
# ══════════════════════════════════════════════════════════════════════════════
bpy.ops.wm.save_as_mainfile(filepath=FINAL)
print(f"\n=== GUARDADO FINAL: {FINAL} ===")
print("=== FASES 1-7 COMPLETADAS ===")
print(f"  Objetos en escena: {len(bpy.data.objects)}")
print(f"  Colecciones: {len(bpy.data.collections)}")
print(f"  Materiales: {len(bpy.data.materials)}")
