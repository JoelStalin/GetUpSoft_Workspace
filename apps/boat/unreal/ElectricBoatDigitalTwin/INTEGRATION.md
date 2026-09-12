# Electric Boat digital twin

Open `ElectricBoatDigitalTwin.uproject`. Unreal loads `L_ElectricBoatIntegrated` automatically.

## Controls

- `W`: forward thrust
- `S`: reverse thrust
- `A` / `D`: steering
- Mouse: orbit the follow camera

## Integrated systems

`AElectricBoatPawn` owns the imported static mesh, a Chaos rigid body, eight Water-plugin buoyancy pontoons, a spring-arm camera, electric thrust and steering torque. The map provides a WaterZone and WaterBodyOcean plus basic marine lighting.

The placed boat also stores a center-of-mass correction derived from the imported mesh. This keeps the calculated mass within the pontoon footprint and prevents the Water plugin's sprung-mass calculation error during play.

## Parameters requiring engineering calibration

The present 3,200 kg mass, 18 kN thrust, pontoon radii/locations, drag coefficients and steering torque are explicit initial assumptions. Replace them with measured displacement, longitudinal/vertical CG, motor/propulsor curves and hydrostatic/CFD results before using the simulation for design decisions.
