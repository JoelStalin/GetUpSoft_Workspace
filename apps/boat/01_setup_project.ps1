<#
TASK-1: Setup de directorio del proyecto
Ejecutar en PowerShell desde:
C:\Users\yoeli\Documents\GetUpSoft_Workspace\02_Products\GetUpSoftBoat

Uso:
  .\01_setup_project.ps1 -MotorBoatZip ".\Motor Boat.zip" -McpZip ".\mcp-1.0.0.zip"
#>

param(
    [string]$MotorBoatZip = ".\Motor Boat.zip",
    [string]$McpZip = ".\mcp-1.0.0.zip",
    [string]$ProjectRoot = ".\electric_boat_29ft"
)

$ErrorActionPreference = "Stop"

function Log($msg) {
    $ts = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Write-Host "[$ts] $msg"
}

# --- 1. Crear árbol de directorios ---
$dirs = @(
    "$ProjectRoot\source",
    "$ProjectRoot\source\textures",
    "$ProjectRoot\blender",
    "$ProjectRoot\blender\backups",
    "$ProjectRoot\scripts",
    "$ProjectRoot\renders\technical",
    "$ProjectRoot\renders\presentation",
    "$ProjectRoot\exports",
    "$ProjectRoot\references",
    "$ProjectRoot\mcp",
    "$ProjectRoot\docs",
    "$ProjectRoot\logs"
)

foreach ($d in $dirs) {
    if (-not (Test-Path $d)) {
        New-Item -ItemType Directory -Path $d -Force | Out-Null
        Log "Creado: $d"
    } else {
        Log "Ya existe: $d"
    }
}

# --- 2. Extraer Motor Boat.zip a un directorio temporal ---
$tempExtract = "$ProjectRoot\_temp_extract"
if (Test-Path $tempExtract) { Remove-Item $tempExtract -Recurse -Force }
New-Item -ItemType Directory -Path $tempExtract | Out-Null

if (-not (Test-Path $MotorBoatZip)) {
    Log "ERROR: no se encontró $MotorBoatZip. Abortando TASK-1."
    exit 1
}

Log "Extrayendo $MotorBoatZip ..."
Expand-Archive -Path $MotorBoatZip -DestinationPath $tempExtract -Force

# Buscar board.blend recursivamente dentro del zip extraído
$boardFile = Get-ChildItem -Path $tempExtract -Filter "board.blend" -Recurse | Select-Object -First 1

if (-not $boardFile) {
    Log "ERROR: board.blend no encontrado dentro de Motor Boat.zip. Abortando (AC-1 fallido)."
    exit 1
}

# --- 3. Copiar board.blend -> source/board_original.blend (NUNCA sobrescribir después) ---
$originalPath = "$ProjectRoot\source\board_original.blend"
if (Test-Path $originalPath) {
    Log "ADVERTENCIA: source\board_original.blend ya existe. NO se sobrescribe (regla dura del plan)."
} else {
    Copy-Item $boardFile.FullName -Destination $originalPath
    Log "Copiado: board.blend -> source\board_original.blend"
}

# --- 4. Crear copia de trabajo ---
$workingPath = "$ProjectRoot\blender\electric_boat_29ft.blend"
if (-not (Test-Path $workingPath)) {
    Copy-Item $originalPath -Destination $workingPath
    Log "Copia de trabajo creada: blender\electric_boat_29ft.blend"
} else {
    Log "Copia de trabajo ya existe, no se sobrescribe: $workingPath"
}

# --- 5. Copiar texturas ---
$textureExtensions = @("*.png", "*.jpg", "*.jpeg", "*.hdr", "*.exr", "*.tga")
foreach ($ext in $textureExtensions) {
    Get-ChildItem -Path $tempExtract -Filter $ext -Recurse | ForEach-Object {
        $dest = "$ProjectRoot\source\textures\$($_.Name)"
        if (-not (Test-Path $dest)) {
            Copy-Item $_.FullName -Destination $dest
            Log "Textura copiada: $($_.Name)"
        }
    }
}

# --- 6. Extraer MCP addon ---
if (Test-Path $McpZip) {
    Log "Extrayendo $McpZip -> $ProjectRoot\mcp ..."
    Expand-Archive -Path $McpZip -DestinationPath "$ProjectRoot\mcp" -Force
} else {
    Log "ADVERTENCIA: $McpZip no encontrado. TASK-3 no podrá continuar hasta que exista."
}

# --- 7. Checksum de verificación (AC-1.1) ---
$hashOriginal = Get-FileHash $originalPath -Algorithm SHA256
$hashSource = Get-FileHash $boardFile.FullName -Algorithm SHA256
if ($hashOriginal.Hash -eq $hashSource.Hash) {
    Log "AC-1.1 OK: board_original.blend es idéntico (checksum) al board.blend original."
} else {
    Log "AC-1.1 FALLIDO: checksum no coincide. Revisar copia."
}

# --- 8. Limpieza ---
Remove-Item $tempExtract -Recurse -Force

# --- 9. Log de resumen ---
$summary = @"
TASK-1 SETUP SUMMARY
=====================
Fecha: $(Get-Date)
Project root: $((Resolve-Path $ProjectRoot).Path)
board_original.blend: $originalPath
electric_boat_29ft.blend (working copy): $workingPath
Texturas copiadas: $((Get-ChildItem "$ProjectRoot\source\textures").Count)
MCP extraído: $(Test-Path "$ProjectRoot\mcp\blender_manifest.toml")
Checksum OK: $($hashOriginal.Hash -eq $hashSource.Hash)
"@

$summary | Out-File "$ProjectRoot\logs\task1_setup_summary.txt" -Encoding utf8
Log "Resumen guardado en logs\task1_setup_summary.txt"
Log "TASK-1 completo. Listo para 'TASK-1 lista para revisión'."
