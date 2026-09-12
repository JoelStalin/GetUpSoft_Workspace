"""
TASK-5: Auditoria completa de la escena original.
Ejecutar DENTRO de Blender (via MCP exec-python, o directamente:
  blender --background electric_boat_29ft/blender/electric_boat_29ft.blend --python scene_audit.py
)

Genera un inventario completo y lo escribe en:
  electric_boat_29ft/docs/original_scene_audit.md

No asume nombres: identifica candidatos a Hull/Deck/Console/etc. por
heurísticas de dimensiones y bounding box, y los marca como "candidato"
para revisión humana -- nunca los da por confirmados automáticamente.
"""

import bpy
import os
import mathutils

OUTPUT_PATH = os.path.join("electric_boat_29ft", "docs", "original_scene_audit.md")


def get_world_bbox(obj):
    """Bounding box del objeto en coordenadas de mundo."""
    coords = [obj.matrix_world @ mathutils.Vector(corner) for corner in obj.bound_box]
    xs = [c.x for c in coords]
    ys = [c.y for c in coords]
    zs = [c.z for c in coords]
    return {
        "min": (min(xs), min(ys), min(zs)),
        "max": (max(xs), max(ys), max(zs)),
        "dims": (max(xs) - min(xs), max(ys) - min(ys), max(zs) - min(zs)),
    }


def classify_candidate(obj, bbox):
    """Heuristica simple para sugerir un rol. Solo sugerencia, no verdad absoluta."""
    name = obj.name.lower()
    dx, dy, dz = bbox["dims"]

    hints = []
    if "hull" in name or "casco" in name:
        hints.append("Hull (por nombre)")
    if "deck" in name or "cubierta" in name:
        hints.append("Deck (por nombre)")
    if "console" in name or "consola" in name:
        hints.append("Console (por nombre)")
    if "seat" in name or "asiento" in name:
        hints.append("Seats (por nombre)")
    if "wind" in name or "parabrisas" in name:
        hints.append("Windshield (por nombre)")
    if "transom" in name or "espejo" in name:
        hints.append("Transom (por nombre)")
    if "engine" in name or "motor" in name:
        hints.append("Existing engine (por nombre)")
    if "rail" in name or "baranda" in name:
        hints.append("Railings (por nombre)")
    if "top" in name or "techo" in name:
        hints.append("Hardtop (por nombre)")

    # Heuristica geometrica: el objeto mas largo y mas ancho suele ser el hull
    if dx > 3.0 and dy > 0.5 and dz < dx * 0.6:
        hints.append("Posible Hull (por proporciones largo/ancho/alto)")

    return hints if hints else ["Sin clasificar - requiere revision manual"]


def audit_scene():
    lines = []
    lines.append("# Auditoria del Modelo Original - board.blend")
    lines.append("")
    lines.append(f"Archivo: {bpy.data.filepath}")
    lines.append(f"Generado por: scene_audit.py (TASK-5)")
    lines.append("")

    # --- Collections ---
    lines.append("## Collections")
    lines.append("")
    for coll in bpy.data.collections:
        lines.append(f"- **{coll.name}**: {len(coll.objects)} objeto(s)")
    lines.append("")

    # --- Objects detallado ---
    lines.append("## Objetos (detalle completo)")
    lines.append("")
    lines.append("| Nombre | Tipo | Dimensiones (X,Y,Z) m | Origin (X,Y,Z) | Parent | Modifiers | Candidatos a rol |")
    lines.append("|---|---|---|---|---|---|---|")

    for obj in bpy.data.objects:
        if obj.type == 'MESH':
            bbox = get_world_bbox(obj)
            dims_str = f"{bbox['dims'][0]:.3f}, {bbox['dims'][1]:.3f}, {bbox['dims'][2]:.3f}"
        else:
            dims_str = "N/A"

        origin_str = f"{obj.location.x:.3f}, {obj.location.y:.3f}, {obj.location.z:.3f}"
        parent_str = obj.parent.name if obj.parent else "-"
        modifiers_str = ", ".join([m.type for m in obj.modifiers]) if hasattr(obj, "modifiers") and obj.modifiers else "-"

        if obj.type == 'MESH':
            bbox = get_world_bbox(obj)
            candidates = classify_candidate(obj, bbox)
        else:
            candidates = [f"({obj.type}, no aplica clasificacion de casco)"]

        lines.append(
            f"| {obj.name} | {obj.type} | {dims_str} | {origin_str} | {parent_str} | {modifiers_str} | {'; '.join(candidates)} |"
        )

    lines.append("")

    # --- Materials ---
    lines.append("## Materials")
    lines.append("")
    for mat in bpy.data.materials:
        users = mat.users
        lines.append(f"- **{mat.name}** (usado por {users} objeto(s))")
    lines.append("")

    # --- Textures / Images ---
    lines.append("## Textures / Images")
    lines.append("")
    for img in bpy.data.images:
        missing = " ⚠️ MISSING" if not img.filepath or not os.path.exists(bpy.path.abspath(img.filepath)) else ""
        lines.append(f"- **{img.name}**: `{img.filepath}`{missing}")
    lines.append("")

    # --- Cameras ---
    lines.append("## Cameras")
    lines.append("")
    cams = [o for o in bpy.data.objects if o.type == 'CAMERA']
    if cams:
        for cam in cams:
            lines.append(f"- {cam.name} @ {tuple(round(c, 3) for c in cam.location)}")
    else:
        lines.append("- Ninguna camara encontrada en el archivo original.")
    lines.append("")

    # --- Lights ---
    lines.append("## Lights")
    lines.append("")
    lights = [o for o in bpy.data.objects if o.type == 'LIGHT']
    if lights:
        for light in lights:
            lines.append(f"- {light.name} ({light.data.type}) @ {tuple(round(c, 3) for c in light.location)}")
    else:
        lines.append("- Ninguna luz encontrada en el archivo original.")
    lines.append("")

    # --- Resumen de dimensiones globales (candidato a LOA/Beam) ---
    lines.append("## Resumen de Dimensiones Globales")
    lines.append("")
    all_mesh = [o for o in bpy.data.objects if o.type == 'MESH']
    if all_mesh:
        all_min = [999999.0, 999999.0, 999999.0]
        all_max = [-999999.0, -999999.0, -999999.0]
        for obj in all_mesh:
            bbox = get_world_bbox(obj)
            for i in range(3):
                all_min[i] = min(all_min[i], bbox["min"][i])
                all_max[i] = max(all_max[i], bbox["max"][i])
        total_dims = [all_max[i] - all_min[i] for i in range(3)]
        lines.append(f"- Bounding box global (todos los meshes): X={total_dims[0]:.3f}m, Y={total_dims[1]:.3f}m, Z={total_dims[2]:.3f}m")
        lines.append(f"- **NOTA**: esto es una referencia previa al escalado (TASK-6). No asumir que X ya es LOA sin confirmar orientacion del modelo.")
    lines.append("")

    lines.append("## Advertencias / Anomalias")
    lines.append("")
    anomalies = []
    for obj in bpy.data.objects:
        if obj.type == 'MESH' and obj.data is None:
            anomalies.append(f"- {obj.name}: objeto MESH sin mesh data asociada")
    if bpy.data.filepath == "":
        anomalies.append("- El archivo no ha sido guardado (filepath vacio)")
    if anomalies:
        lines.extend(anomalies)
    else:
        lines.append("- Ninguna anomalia detectada en esta pasada automatica.")
    lines.append("")

    return "\n".join(lines)


def main():
    report = audit_scene()
    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        f.write(report)
    print(f"[scene_audit.py] Reporte escrito en: {OUTPUT_PATH}")
    print(f"[scene_audit.py] Total objetos: {len(bpy.data.objects)}")
    print(f"[scene_audit.py] Total collections: {len(bpy.data.collections)}")


if __name__ == "__main__":
    main()
