"""Export the current V0 presentation mesh for Unreal Engine."""

from pathlib import Path

import bpy


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "exports" / "BOAT_UNREAL_V0.fbx"
REPORT = ROOT / "documentation" / "Unreal_Export_Report.md"


def collection_render_visible(obj: bpy.types.Object) -> bool:
    return not any(collection.hide_render for collection in obj.users_collection)


def main() -> None:
    bpy.ops.object.select_all(action="DESELECT")
    exported = []
    for obj in bpy.data.objects:
        if obj.type in {"MESH", "CURVE"} and not obj.hide_render and collection_render_visible(obj):
            obj.select_set(True)
            exported.append(obj.name)

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    bpy.ops.export_scene.fbx(
        filepath=str(OUTPUT),
        use_selection=True,
        object_types={"MESH", "OTHER"},
        apply_unit_scale=True,
        apply_scale_options="FBX_SCALE_UNITS",
        axis_forward="-Y",
        axis_up="Z",
        use_mesh_modifiers=True,
        add_leaf_bones=False,
        bake_anim=False,
        path_mode="COPY",
        embed_textures=True,
    )

    root = bpy.data.objects.get("BOAT_ROOT")
    master = bpy.data.objects.get("BOAT_V0_MASTER_PARAMETERS")
    REPORT.parent.mkdir(parents=True, exist_ok=True)
    REPORT.write_text(
        "# Unreal Export Report\n\n"
        f"- Source: `{bpy.data.filepath}`\n"
        f"- Output: `{OUTPUT}`\n"
        f"- Exported visible mesh/curve objects: {len(exported)}\n"
        f"- Blender units: {bpy.context.scene.unit_settings.system}, scale {bpy.context.scene.unit_settings.scale_length}\n"
        f"- Nominal LOA: {master.get('LOA') if master else 'MISSING'} m / "
        f"{(master.get('LOA') * 100) if master and isinstance(master.get('LOA'), (int, float)) else 'MISSING'} cm in Unreal\n"
        f"- BOAT_ROOT present: {root is not None}\n"
        "- Axis conversion: Blender forward -Y, up Z; Unreal import must preserve uniform scale.\n"
        "- Physics, collisions and buoyancy are pending Unreal validation.\n",
        encoding="utf-8",
    )
    print(f"UNREAL_FBX={OUTPUT}")
    print(f"UNREAL_EXPORT_OBJECTS={len(exported)}")
    print(f"UNREAL_FBX_BYTES={OUTPUT.stat().st_size}")


if __name__ == "__main__":
    main()
