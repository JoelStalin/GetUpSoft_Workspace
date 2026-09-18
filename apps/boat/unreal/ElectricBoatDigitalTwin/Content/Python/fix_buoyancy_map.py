import unreal

MAP_PATH = "/Game/GetUpSoftBoat/Maps/L_ElectricBoatIntegrated"

unreal.EditorLoadingAndSavingUtils.load_map(MAP_PATH)
boat = next(
    actor for actor in unreal.EditorLevelLibrary.get_all_level_actors()
    if actor.get_actor_label() == "ElectricBoat_29ft_Physics"
)
buoyancy = boat.get_component_by_class(unreal.BuoyancyComponent)
if not buoyancy:
    raise RuntimeError("ElectricBoat_29ft_Physics has no BuoyancyComponent")

hull = boat.get_component_by_class(unreal.StaticMeshComponent)
if not hull:
    raise RuntimeError("ElectricBoat_29ft_Physics has no StaticMeshComponent")

world_com = hull.get_center_of_mass()
local_com = boat.get_actor_transform().inverse_transform_location(world_com)
offset = unreal.Vector(-local_com.x, -local_com.y, -local_com.z)
hull.set_center_of_mass(offset)
boat.modify()
buoyancy.modify()
hull.modify()

if not unreal.EditorLoadingAndSavingUtils.save_dirty_packages(True, True):
    raise RuntimeError("Could not save the corrected integrated map")

unreal.log(
    "GETUPSOFT_BUOYANCY_MAP_FIX_PASS "
    f"original_local_com=({local_com.x:.3f},{local_com.y:.3f},{local_com.z:.3f}) "
    f"offset=({offset.x:.3f},{offset.y:.3f},{offset.z:.3f})"
)
