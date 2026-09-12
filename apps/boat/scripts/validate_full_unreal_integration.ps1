$ErrorActionPreference = 'Stop'

$project = Join-Path (Split-Path -Parent $PSScriptRoot) 'unreal\ElectricBoatDigitalTwin'
$required = @(
    (Join-Path $project 'Binaries\Win64\UnrealEditor-ElectricBoatDigitalTwin.dll'),
    (Join-Path $project 'Content\GetUpSoftBoat\Models\SM_ElectricBoat.uasset'),
    (Join-Path $project 'Content\GetUpSoftBoat\Maps\L_ElectricBoatIntegrated.umap'),
    (Join-Path $project 'Saved\IntegrationReport.json'),
    (Join-Path $project 'Source\ElectricBoatDigitalTwin\ElectricBoatPawn.cpp')
)
foreach ($path in $required) {
    if (-not (Test-Path -LiteralPath $path)) { throw "Missing integration artifact: $path" }
    if ((Get-Item -LiteralPath $path).Length -eq 0) { throw "Empty integration artifact: $path" }
}

$report = Get-Content -Raw -LiteralPath (Join-Path $project 'Saved\IntegrationReport.json') | ConvertFrom-Json
if ($report.result -ne 'PASS') { throw 'Integration report is not PASS.' }
if ($report.physics.buoyancy_pontoons -ne 8) { throw 'Expected eight buoyancy pontoons.' }
if (-not $report.physics.simulate_physics) { throw 'Rigid-body physics is not enabled.' }

$config = Get-Content -Raw -LiteralPath (Join-Path $project 'Config\DefaultEngine.ini')
if (-not $config.Contains('GameDefaultMap=/Game/GetUpSoftBoat/Maps/L_ElectricBoatIntegrated')) { throw 'Integrated map is not the game default.' }

$source = Get-Content -Raw -LiteralPath (Join-Path $project 'Source\ElectricBoatDigitalTwin\ElectricBoatPawn.cpp')
foreach ($signal in @('UBuoyancyComponent', 'AddForceAtLocation', 'AddTorqueInRadians', 'SetMassOverrideInKg')) {
    if (-not $source.Contains($signal)) { throw "Missing gameplay implementation: $signal" }
}

[pscustomobject]@{
    Result = 'PASS'
    Map = $report.map
    Mesh = $report.mesh
    BuoyancyPontoons = $report.physics.buoyancy_pontoons
    AssumedMassKg = $report.physics.assumed_mass_kg
    Controls = $report.physics.controls
} | Format-List
