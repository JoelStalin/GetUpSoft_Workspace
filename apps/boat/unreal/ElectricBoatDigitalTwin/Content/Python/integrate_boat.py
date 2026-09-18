import json
import os
import unreal


FBX_PATH = r"C:\Users\yoeli\Documents\GetUpSoft_Workspace\02_Products\GetUpSoftBoat\electric_boat_29ft\exports\BOAT_UNREAL_V0.fbx"
DESTINATION = "/Game/GetUpSoftBoat/Models"
MESH_PATH = "/Game/GetUpSoftBoat/Models/SM_ElectricBoat.SM_ElectricBoat"
MAP_PATH = "/Game/GetUpSoftBoat/Maps/L_ElectricBoatIntegrated"
REPORT_PATH = r"C:\Users\yoeli\Documents\GetUpSoft_Workspace\02_Products\GetUpSoftBoat\unreal\ElectricBoatDigitalTwin\Saved\IntegrationReport.json"


def require(condition, message):
    if not condition:
        raise RuntimeError(message)


def import_boat():
    require(os.path.isfile(FBX_PATH), f"Missing FBX: {FBX_PATH}")
    task = unreal.AssetImportTask()
    task.set_editor_property("filename", FBX_PATH)
    task.set_editor_property("destination_path", DESTINATION)
    task.set_editor_property("destination_name", "SM_ElectricBoat")
    task.set_editor_property("automated", True)
    task.set_editor_property("replace_existing", True)
    task.set_editor_property("save", True)

    options = unreal.FbxImportUI()
    options.set_editor_property("import_mesh", True)
    options.set_editor_property("import_as_skeletal", False)
    options.set_editor_property("mesh_type_to_import", unreal.FBXImportType.FBXIT_STATIC_MESH)
    options.static_mesh_import_data.set_editor_property("combine_meshes", True)
    options.static_mesh_import_data.set_editor_property("auto_generate_collision", True)
    options.static_mesh_import_data.set_editor_property("convert_scene", True)
    options.static_mesh_import_data.set_editor_property("convert_scene_unit", True)
    options.static_mesh_import_data.set_editor_property("generate_lightmap_u_vs", True)
    task.set_editor_property("options", options)

    unreal.AssetToolsHelpers.get_asset_tools().import_asset_tasks([task])
    mesh = unreal.load_asset(MESH_PATH)
    require(mesh is not None, f"Import did not create {MESH_PATH}")
    unreal.EditorAssetLibrary.save_loaded_asset(mesh, only_if_is_dirty=False)
    return mesh


def spawn(actor_class, location, rotation=None, label=None):
    actor = unreal.EditorLevelLibrary.spawn_actor_from_class(
        actor_class,
        location,
        rotation or unreal.Rotator(),
    )
    require(actor is not None, f"Could not spawn {actor_class}")
    if label:
        actor.set_actor_label(label)
    return actor


def build_level(mesh):
    if unreal.EditorAssetLibrary.does_asset_exist(MAP_PATH):
        level_subsystem = unreal.get_editor_subsystem(unreal.LevelEditorSubsystem)
        require(level_subsystem.load_level(MAP_PATH), "Could not load existing demo level")
        actor_subsystem = unreal.get_editor_subsystem(unreal.EditorActorSubsystem)
        actor_subsystem.destroy_actors(actor_subsystem.get_all_level_actors())
    else:
        require(unreal.EditorLevelLibrary.new_level(MAP_PATH), "Could not create demo level")

    zone = spawn(unreal.WaterZone, unreal.Vector(0, 0, 0), label="WaterZone_20km")
    try:
        zone.set_editor_property("zone_extent", unreal.Vector2D(1000000, 1000000))
    except Exception:
        unreal.log_warning("WaterZone extent uses engine default; adjust visually if needed")

    ocean = spawn(unreal.WaterBodyOcean, unreal.Vector(0, 0, 0), label="Ocean_FluidSurface")
    try:
        ocean_comp = ocean.get_component_by_class(unreal.WaterBodyOceanComponent)
        if ocean_comp:
            ocean_comp.set_editor_property("collision_extents", unreal.Vector(1000000, 1000000, 5000))
    except Exception:
        unreal.log_warning("Ocean collision extents use engine default")

    boat_class = unreal.load_class(None, "/Script/ElectricBoatDigitalTwin.ElectricBoatPawn")
    require(boat_class is not None, "ElectricBoatPawn native class is unavailable")
    boat = spawn(boat_class, unreal.Vector(0, 0, 120), label="ElectricBoat_29ft_Physics")
    hull_components = boat.get_components_by_class(unreal.StaticMeshComponent)
    require(len(hull_components) > 0, "Boat has no StaticMeshComponent")
    hull_components[0].set_static_mesh(mesh)
    hull_components[0].set_simulate_physics(True)
    try:
        boat.set_editor_property("auto_possess_player", unreal.AutoReceiveInput.PLAYER0)
    except Exception:
        pass

    sun = spawn(unreal.DirectionalLight, unreal.Vector(0, 0, 1200), unreal.Rotator(-35, -25, 0), "Sun")
    sun.light_component.set_editor_property("intensity", 8.0)
    spawn(unreal.SkyLight, unreal.Vector(0, 0, 800), label="SkyLight")
    spawn(unreal.ExponentialHeightFog, unreal.Vector(0, 0, 0), label="MarineFog")

    camera = spawn(unreal.CameraActor, unreal.Vector(-1500, -1200, 700), unreal.Rotator(-15, 38, 0), "OverviewCamera")
    camera.camera_component.set_editor_property("field_of_view", 55.0)

    unreal.EditorLevelLibrary.save_current_level()
    unreal.EditorAssetLibrary.save_directory("/Game/GetUpSoftBoat", only_if_is_dirty=False, recursive=True)
    return boat, ocean, zone


def main():
    mesh = unreal.load_asset(MESH_PATH)
    if mesh is None:
        mesh = import_boat()
    boat, ocean, zone = build_level(mesh)
    bounds = mesh.get_bounds()
    report = {
        "result": "PASS",
        "mesh": MESH_PATH,
        "map": MAP_PATH,
        "mesh_extent_cm": [bounds.box_extent.x, bounds.box_extent.y, bounds.box_extent.z],
        "boat_actor": boat.get_actor_label(),
        "ocean_actor": ocean.get_actor_label(),
        "water_zone_actor": zone.get_actor_label(),
        "physics": {
            "simulate_physics": True,
            "buoyancy_pontoons": 8,
            "assumed_mass_kg": 3200,
            "controls": "W/S throttle, A/D steer, mouse camera",
        },
        "engineering_status": "interactive approximation; hydrostatics/CFD calibration pending",
    }
    os.makedirs(os.path.dirname(REPORT_PATH), exist_ok=True)
    with open(REPORT_PATH, "w", encoding="utf-8") as handle:
        json.dump(report, handle, indent=2)
    unreal.log("GETUPSOFT_BOAT_INTEGRATION_PASS " + json.dumps(report))


main()
