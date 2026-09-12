# Unreal Export Report

- Source: `C:\Users\yoeli\Documents\GetUpSoft_Workspace\02_Products\GetUpSoftBoat\electric_boat_29ft\blender\ElectricBoat_29ft_V0.blend`
- Output: `C:\Users\yoeli\Documents\GetUpSoft_Workspace\02_Products\GetUpSoftBoat\electric_boat_29ft\exports\BOAT_UNREAL_V0.fbx`
- Exported visible mesh/curve objects: 77
- Blender units: METRIC, scale 1.0
- Nominal LOA: 8.84 m / 884.0 cm in Unreal
- BOAT_ROOT present: True
- Axis conversion: Blender forward -Y, up Z; Unreal import must preserve uniform scale.
- Physics, collisions and buoyancy are pending Unreal validation.

## Reimport check

The FBX was imported into a clean Blender 5.2.1 scene. `HULL_MAIN` measured
8.8400002 m long and 2.8000007 m wide, within the V0 tolerances. This verifies
the file export scale before the Unreal import; the final 884 cm check remains
pending inside Unreal Engine.
