import bpy, json, os, mathutils
out = r"C:\Users\yoeli\Documents\GetUpSoft_Workspace\02_Products\GetUpSoftBoat\electric_boat_29ft\logs\blender_5_2_1_independent_validation.json"
result = {
  "blender_version": bpy.app.version_string,
  "file": bpy.data.filepath,
  "objects": len(bpy.data.objects),
  "collections": len(bpy.data.collections),
  "cameras": len([o for o in bpy.data.objects if o.type == 'CAMERA']),
  "materials": len(bpy.data.materials),
  "missing_images": [],
  "required_objects": {},
  "required_collections": {},
}
for img in bpy.data.images:
    if img.source == 'FILE' and img.filepath:
        p = bpy.path.abspath(img.filepath)
        if not os.path.exists(p): result["missing_images"].append({"name": img.name, "path": p})
for name in ["HULL_MAIN", "VESSEL_DATUM", "BATTERY_TRAY", "BMS_ENCLOSURE", "MFD_BMS", "MFD_NAV"]:
    result["required_objects"][name] = name in bpy.data.objects
for name in ["07_PROPULSION_INBOARD", "08_PROPULSION_OUTBOARD", "SOLAR_SYSTEM"]:
    col = bpy.data.collections.get(name)
    result["required_collections"][name] = None if col is None else {"objects": len(col.all_objects), "hide_render": col.hide_render}
hull=bpy.data.objects.get("HULL_MAIN")
if hull and getattr(hull, 'bound_box', None):
    pts=[hull.matrix_world @ mathutils.Vector(c) for c in hull.bound_box]
    result["hull_bounds_m"]={"x":max(p.x for p in pts)-min(p.x for p in pts),"y":max(p.y for p in pts)-min(p.y for p in pts),"z":max(p.z for p in pts)-min(p.z for p in pts),"center_y":(max(p.y for p in pts)+min(p.y for p in pts))/2}
result["solar_panels"] = sorted([o.name for o in bpy.data.objects if o.name.startswith("SOLAR_PANEL_")])
result["battery_modules"] = sorted([o.name for o in bpy.data.objects if o.name.startswith("BATTERY_MODULE_")])
with open(out, 'w', encoding='utf-8') as f: json.dump(result,f,indent=2)
print("VALIDATION_JSON="+json.dumps(result))
