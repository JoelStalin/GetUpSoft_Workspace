$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent $PSScriptRoot
$uprojectPath = Join-Path $projectRoot 'unreal\ElectricBoatDigitalTwin\ElectricBoatDigitalTwin.uproject'
$engineConfigPath = Join-Path $projectRoot 'unreal\ElectricBoatDigitalTwin\Config\DefaultEngine.ini'
$vendorManifestPath = Join-Path $projectRoot 'unreal\vendor-manifest.json'
$highFidelityPath = Join-Path $projectRoot 'unreal\presets\DefaultPhysics.high-fidelity.ini'
$contentMarkerPath = Join-Path $projectRoot 'unreal\ElectricBoatDigitalTwin\Content\.gitkeep'
$epicManifestPath = 'C:\ProgramData\Epic\EpicGamesLauncher\Data\Manifests\9D65BC6B113A438C33AC2F015A0D9BFD.item'
$editorPath = 'C:\Program Files\Epic Games\UE_5.8\Engine\Binaries\Win64\UnrealEditor-Cmd.exe'

$requiredFiles = @($uprojectPath, $engineConfigPath, $vendorManifestPath, $highFidelityPath, $contentMarkerPath, $epicManifestPath, $editorPath)
foreach ($path in $requiredFiles) {
    if (-not (Test-Path -LiteralPath $path)) { throw "Missing required file: $path" }
}

$uproject = Get-Content -Raw -LiteralPath $uprojectPath | ConvertFrom-Json
if ($uproject.EngineAssociation -ne '5.8') { throw 'Unexpected EngineAssociation.' }

$pluginState = @{}
foreach ($plugin in $uproject.Plugins) { $pluginState[$plugin.Name] = [bool]$plugin.Enabled }
foreach ($requiredPlugin in @('Water', 'ChaosVehiclesPlugin', 'ModelingToolsEditorMode')) {
    if (-not $pluginState[$requiredPlugin]) { throw "Required plugin disabled: $requiredPlugin" }
}
if ($pluginState['DLSS']) { throw 'DLSS must remain disabled on the current AMD GPU.' }

$config = Get-Content -Raw -LiteralPath $engineConfigPath
foreach ($requiredSetting in @('DefaultGraphicsRHI=DefaultGraphicsRHI_DX11', 'bSubstepping=True', 'MaxSubstepDeltaTime=0.016666667', 'MaxSubsteps=4')) {
    if (-not $config.Contains($requiredSetting)) { throw "Missing setting: $requiredSetting" }
}
if ($config -match 'SecurityToken=') { throw 'Generated security token must not be stored in project configuration.' }

$epicManifest = Get-Content -Raw -LiteralPath $epicManifestPath | ConvertFrom-Json
if ($epicManifest.bIsIncompleteInstall) { throw 'Epic manifest reports an incomplete install.' }
if ($epicManifest.AppVersionString -notlike '5.8.2-*') { throw 'Unexpected Unreal Engine version.' }

$vendorManifest = Get-Content -Raw -LiteralPath $vendorManifestPath | ConvertFrom-Json
$dlss = $vendorManifest.packages | Where-Object name -like 'NVIDIA DLSS*'
if (-not $dlss.archiveVerified -or $dlss.enabled) { throw 'DLSS archive state is invalid.' }
if (-not (Test-Path -LiteralPath $dlss.downloadedTo)) { throw 'DLSS archive is missing.' }
$actualDlssHash = (Get-FileHash -Algorithm SHA256 -LiteralPath $dlss.downloadedTo).Hash
if ($actualDlssHash -ne $dlss.sha256) { throw 'DLSS archive checksum mismatch.' }

[pscustomobject]@{
    UnrealVersion = $epicManifest.AppVersionString
    EngineComplete = -not $epicManifest.bIsIncompleteInstall
    PluginsEnabled = 'Water, ChaosVehiclesPlugin, ModelingToolsEditorMode'
    DLSS = 'downloaded, checksum verified, disabled'
    Physics = 'substepping 1/60 s, max 4'
    Result = 'PASS'
} | Format-List
