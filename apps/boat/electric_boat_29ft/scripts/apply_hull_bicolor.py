"""
Script: apply_hull_bicolor.py
Objetivo: Aplicar material bicolor al casco (blanco superior / azul marino inferior)
          sin dañar UVs ni topología original del board.blend.
          
Estrategia:
  - Añadir MAT_GRP_WHITE y MAT_GRP_BLUE al objeto HULL_MAIN
  - Asignar faces por posición Z del centroide:
    * Z > waterline_z  → MAT_GRP_WHITE (Gelcoat blanco)
    * Z <= waterline_z → MAT_GRP_BLUE  (Azul marino)
  - Waterline determinada como ~15% de la altura total del casco
"""

import bpy
import bmesh
import mathutils

FINAL_BLEND = r"c:\Users\yoeli\Documents\GetUpSoft_Workspace\02_Products\GetUpSoftBoat\electric_boat_29ft\blender\electric_boat_29ft_FINAL.blend"

# ── 1. Abrir FINAL.blend ──────────────────────────────────────────────────────
bpy.ops.wm.open_mainfile(filepath=FINAL_BLEND)

sc = bpy.context.scene

# ── 2. Localizar el objeto del casco ─────────────────────────────────────────
hull_candidates = ["HULL_MAIN", "Cube.003", "Hull", "hull"]
hull_obj = None
for name in hull_candidates:
    obj = bpy.data.objects.get(name)
    if obj and obj.type == 'MESH':
        hull_obj = obj
        break

# Si no encontramos por nombre, buscar el mesh más grande
if hull_obj is None:
    biggest = None
    biggest_vol = 0
    for obj in bpy.data.objects:
        if obj.type == 'MESH':
            bb = obj.bound_box
            mw = obj.matrix_world
            corners = [mw @ mathutils.Vector(c) for c in bb]
            dx = max(c.x for c in corners) - min(c.x for c in corners)
            dy = max(c.y for c in corners) - min(c.y for c in corners)
            dz = max(c.z for c in corners) - min(c.z for c in corners)
            vol = dx * dy * dz
            if vol > biggest_vol:
                biggest_vol = vol
                biggest = obj
    hull_obj = biggest

if hull_obj is None:
    raise RuntimeError("No se encontró objeto de casco válido.")

print(f"Objeto de casco seleccionado: {hull_obj.name}")

# ── 3. Determinar waterline Z ─────────────────────────────────────────────────
mw = hull_obj.matrix_world
corners = [mw @ mathutils.Vector(c) for c in hull_obj.bound_box]
z_min = min(c.z for c in corners)
z_max = max(c.z for c in corners)
hull_height = z_max - z_min

# Waterline al 20% de la altura total desde la quilla
# (cubre fondo y bajo casco en azul marino)
waterline_z = z_min + hull_height * 0.20
print(f"Hull Z range: [{z_min:.3f} → {z_max:.3f}], Waterline Z = {waterline_z:.3f}")

# ── 4. Crear / obtener materiales ─────────────────────────────────────────────
def get_or_create_material(name, color_rgba):
    mat = bpy.data.materials.get(name)
    if mat is None:
        mat = bpy.data.materials.new(name=name)
        mat.use_nodes = True
        bsdf = mat.node_tree.nodes.get("Principled BSDF")
        if bsdf:
            bsdf.inputs["Base Color"].default_value = color_rgba
            bsdf.inputs["Specular IOR Level"].default_value = 0.5
            bsdf.inputs["Roughness"].default_value = 0.15
    return mat

# Blanco gelcoat marino premium
mat_white = get_or_create_material("MAT_GRP_WHITE", (0.95, 0.96, 0.97, 1.0))
# Azul marino profundo (Navy Blue)  
mat_blue  = get_or_create_material("MAT_GRP_BLUE",  (0.04, 0.10, 0.30, 1.0))

# ── 5. Añadir ambos slots de material al hull si no existen ───────────────────
# Preservar materiales existentes del casco
existing_mats = [slot.material for slot in hull_obj.material_slots]

white_idx = None
blue_idx  = None

for i, mat in enumerate(existing_mats):
    if mat and mat.name == "MAT_GRP_WHITE":
        white_idx = i
    if mat and mat.name == "MAT_GRP_BLUE":
        blue_idx = i

# Añadir MAT_GRP_WHITE si no está
if white_idx is None:
    hull_obj.data.materials.append(mat_white)
    white_idx = len(hull_obj.material_slots) - 1

# Añadir MAT_GRP_BLUE si no está
if blue_idx is None:
    hull_obj.data.materials.append(mat_blue)
    blue_idx = len(hull_obj.material_slots) - 1

print(f"Slot MAT_GRP_WHITE = {white_idx}")
print(f"Slot MAT_GRP_BLUE  = {blue_idx}")

# ── 6. Asignar material por cara usando bmesh ──────────────────────────────────
bpy.context.view_layer.objects.active = hull_obj
bpy.ops.object.mode_set(mode='EDIT')

bm = bmesh.from_edit_mesh(hull_obj.data)
bm.faces.ensure_lookup_table()

assigned_white = 0
assigned_blue  = 0

for face in bm.faces:
    # Calcular centroide de la cara en espacio mundo
    face_center_local = face.calc_center_median()
    face_center_world = mw @ face_center_local
    
    if face_center_world.z > waterline_z:
        face.material_index = white_idx
        assigned_white += 1
    else:
        face.material_index = blue_idx
        assigned_blue += 1

bmesh.update_edit_mesh(hull_obj.data)
bpy.ops.object.mode_set(mode='OBJECT')

print(f"Caras asignadas → Blanco: {assigned_white} | Azul: {assigned_blue}")

# ── 7. Guardar FINAL.blend ────────────────────────────────────────────────────
bpy.ops.wm.save_as_mainfile(filepath=FINAL_BLEND)
print(f"✅ Bicolor hull aplicado y guardado: {FINAL_BLEND}")
print(f"   Waterline Z = {waterline_z:.4f} m")
print(f"   Hull height = {hull_height:.4f} m")
print(f"   Caras blancas: {assigned_white}")
print(f"   Caras azules:  {assigned_blue}")
