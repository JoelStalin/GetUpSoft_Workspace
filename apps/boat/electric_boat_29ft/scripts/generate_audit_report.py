import json
import os

with open("docs/audit_raw_data.json", "r", encoding="utf-8") as f:
    data = json.load(f)

objects = data.get("objects", [])
collections = data.get("collections", [])
materials = data.get("materials", [])
unit_settings = data.get("unit_settings", {})

md_lines = []
md_lines.append("# Auditoría del Modelo 3D Original (`board_original.blend`)")
md_lines.append("")
md_lines.append("## 1. Configuración de Unidades")
md_lines.append(f"- **Sistema:** {unit_settings.get('system')}")
md_lines.append(f"- **Escala de Longitud:** {unit_settings.get('scale_length')}")
md_lines.append(f"- **Unidad de Longitud:** {unit_settings.get('length_unit')}")
md_lines.append("")

md_lines.append("## 2. Colecciones de la Escena (`Collections`)")
for c in collections:
    md_lines.append(f"- `{c}`")
md_lines.append("")

md_lines.append("## 3. Inventario Completo de Objetos (`Objects`)")
md_lines.append("| Objeto | Tipo | Colección | Dimensiones (X, Y, Z) | Ubicación (X, Y, Z) | Padres / Hijos | Materiales | Modificadores |")
md_lines.append("|---|---|---|---|---|---|---|---|")

classification = {
    "Hull / Deck / Transom": [],
    "Console / Windshield / Controls": [],
    "Seats / Seating": [],
    "Engine / Propulsion": [],
    "Hardtop / Frame / Roof": [],
    "Railings / Hardware / Accessories": [],
    "Cameras / Lighting / Reference": []
}

for obj in objects:
    name = obj["name"]
    otype = obj["type"]
    cols = ", ".join(obj["users_collection"])
    dims = [round(d, 3) for d in obj["dimensions"]]
    locs = [round(l, 3) for l in obj["location"]]
    parent = obj["parent"] or "None"
    mats = ", ".join(obj["materials"]) if obj["materials"] else "None"
    mods = ", ".join([f"{m['name']}({m['type']})" for m in obj["modifiers"]]) if obj["modifiers"] else "None"
    
    md_lines.append(f"| `{name}` | {otype} | `{cols}` | {dims} | {locs} | P: `{parent}` | `{mats}` | `{mods}` |")
    
    # Classification heuristic
    lname = name.lower()
    if otype in ['CAMERA', 'LIGHT']:
        classification["Cameras / Lighting / Reference"].append(name)
    elif 'hull' in lname or 'board' in lname or 'cube' in lname or 'plane' in lname:
        classification["Hull / Deck / Transom"].append(name)
    elif 'seat' in lname or 'chair' in lname:
        classification["Seats / Seating"].append(name)
    elif 'engine' in lname or 'motor' in lname or 'prop' in lname:
        classification["Engine / Propulsion"].append(name)
    elif 'roof' in lname or 'top' in lname or 'canopy' in lname or 'hard' in lname:
        classification["Hardtop / Frame / Roof"].append(name)
    elif 'console' in lname or 'helm' in lname or 'screen' in lname:
        classification["Console / Windshield / Controls"].append(name)
    else:
        classification["Railings / Hardware / Accessories"].append(name)

md_lines.append("")
md_lines.append("## 4. Clasificación Funcional de Componentes")
for cat, objs in classification.items():
    md_lines.append(f"### {cat}")
    if objs:
        for o in objs:
            md_lines.append(f"- `{o}`")
    else:
        md_lines.append("- *(Ningún objeto asignado explícitamente por nombre)*")
    md_lines.append("")

md_lines.append("## 5. Materiales y Texturas (`Materials & Textures`)")
for mat in materials:
    md_lines.append(f"- **Material:** `{mat['name']}`")
    if mat["textures"]:
        for t in mat["textures"]:
            md_lines.append(f"  - Textura: `{t}`")
    else:
        md_lines.append("  - Textura: *Sin imagen asignada*")

md_lines.append("")
md_lines.append("## 6. Conclusión de Auditoría")
md_lines.append("- Escena original cargada exitosamente mediante Blender MCP.")
md_lines.append(f"- Se identificaron **{len(objects)} objetos**, **{len(collections)} colecciones** y **{len(materials)} materiales**.")
md_lines.append("- Se procede a la normalización de escala (LOA 8.84m, Beam 2.80m) y alineación del sistema de coordenadas (X=Longitudinal, Y=Crujía/Transversal, Z=Vertical).")

with open("docs/original_scene_audit.md", "w", encoding="utf-8") as f:
    f.write("\n".join(md_lines))

print("Generated docs/original_scene_audit.md successfully.")
