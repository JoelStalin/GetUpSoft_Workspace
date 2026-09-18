# Unreal preset validation

Validated on 2026-09-10 for `ElectricBoatDigitalTwin`.

## Installed runtime

- Unreal Engine: `5.8.2-56702186+++UE5+Release-5.8-Windows`
- Install path: `C:\Program Files\Epic Games\UE_5.8`
- Epic manifest: `C:\ProgramData\Epic\EpicGamesLauncher\Data\Manifests\9D65BC6B113A438C33AC2F015A0D9BFD.item`
- Manifest state: complete install; prerequisite SHA recorded successfully.

## Project smoke test

The project was launched with `UnrealEditor-Cmd.exe`, `-nullrhi`, and unattended mode. The saved log confirms:

- the engine initialized;
- `Water`, `Buoyancy`, `ChaosVehiclesPlugin`, and `ModelingToolsEditorMode` mounted;
- Map Check completed with 0 errors and 0 warnings;
- the `QUIT` command was accepted;
- no Unreal editor or crash reporter process remained afterward.

The optional profiling DLL messages (`aqProf`, VTune, PIX and Wintab) are expected when those external profiling/input tools are absent and do not represent a project load failure.

## Physics and rendering profiles

The local profile targets the current Radeon Vega 8 system: DirectX 11, scalable graphics, no ray tracing, no Lumen, no Nanite, TSR, and a smoothed 20-30 FPS range. Physics substepping is enabled at 1/60 s with up to four substeps.

`presets/DefaultPhysics.high-fidelity.ini` provides a future 1/120 s, eight-substep profile. Activate it only after profiling on stronger hardware.

## NVIDIA DLSS

The official NVIDIA DLSS 4.5 plugin v8.7.2 archive for UE 5.8 was downloaded and checksum-recorded in `vendor-manifest.json`. It remains disabled because the present GPU is AMD Radeon Vega 8. Enable and install it only on a compatible NVIDIA RTX workstation.

## Engineering limit

This smoke test validates the editor preset and plugin availability. It does not validate naval hydrostatics, hydrodynamics, structural loads, battery safety, or CFD. Those require engineering inputs and dedicated validation in later phases.

## Integrated digital twin

The complete interactive integration is stored in `/Game/GetUpSoftBoat/Maps/L_ElectricBoatIntegrated` and is configured as both the editor startup map and game default map.

Integrated elements:

- combined 29 ft boat mesh with imported materials;
- native `AElectricBoatPawn` physics body;
- eight `UBuoyancyComponent` pontoons distributed along the hull;
- linear and quadratic water drag plus angular damping;
- editable assumed mass of 3,200 kg;
- 18 kN electric thrust and steering torque;
- W/S throttle, A/D steering and mouse camera controls;
- WaterZone, WaterBodyOcean, directional light, sky light, marine fog and overview camera.

The integration automation emitted `GETUPSOFT_BOAT_INTEGRATION_PASS`, and Unreal's content validation processed the generated map, mesh and materials. `Saved/IntegrationReport.json` contains the machine-readable result.

The imported FBX produced an initial local center of mass offset of approximately `(14, 84, 259) cm`. The integrated map stores the inverse center-of-mass correction so Chaos places the mass inside the eight-pontoon footprint. A five-second, 150-frame game run then completed with exit code 0 and no `ensure`, suspended-mass error, or Unreal error. Evidence is recorded in `ElectricBoatDigitalTwin/Saved/Logs/BoatRuntimeValidation.log`.
