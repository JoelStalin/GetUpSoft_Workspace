<#
TASK-2: Verificar / instalar Blender >= 5.1.0
Ejecutar en PowerShell (puede requerir permisos de administrador para instalar).
#>

$ErrorActionPreference = "Stop"
$MinVersion = [version]"5.1.0"
$ProjectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$PortableBlender = Join-Path $ProjectRoot "tools\Blender\blender-5.2.1-windows-x64\blender.exe"
$script:BlenderExecutable = $null

function Log($msg) {
    $ts = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Write-Host "[$ts] $msg"
}

function Get-BlenderVersion {
    try {
        if (Test-Path -LiteralPath $PortableBlender) {
            $script:BlenderExecutable = $PortableBlender
        } else {
            $pathCommand = Get-Command blender -ErrorAction SilentlyContinue
            if (-not $pathCommand) {
                return $null
            }
            $script:BlenderExecutable = $pathCommand.Source
        }

        $output = & $script:BlenderExecutable --version 2>$null
        $versionText = $output -join [Environment]::NewLine
        if ($versionText -match "Blender\s+(\d+\.\d+(\.\d+)?)") {
            return [version]$Matches[1]
        }
    } catch {
        return $null
    }
    return $null
}

Log "Comprobando Blender portable del proyecto y después PATH..."
$currentVersion = Get-BlenderVersion

if ($currentVersion) {
    Log "Blender detectado: versión $currentVersion en $script:BlenderExecutable"
} else {
    Log "Blender no encontrado en PATH."
}

if ($currentVersion -and $currentVersion -ge $MinVersion) {
    Log "AC-2.1 OK: versión $currentVersion cumple el mínimo requerido ($MinVersion)."
} else {
    Log "Se requiere instalar/actualizar Blender a >= $MinVersion."
    Log "Este script NO descarga binarios automáticamente (sin acceso de red verificado aquí)."
    Log "Pasos manuales recomendados:"
    Log "  1. Descargar el instalador oficial desde https://www.blender.org/download/"
    Log "  2. Instalar Blender 5.1+ (o la última versión estable >= 5.1.0)"
    Log "  3. Asegurar que 'blender' esté en el PATH del sistema, o usar la ruta completa al ejecutable"
    Log "  4. Re-ejecutar este script para confirmar AC-2.1"
    exit 1
}

# Verificar arranque en modo background (AC-2.2)
Log "Verificando arranque en modo background..."
try {
    $bgTest = & $script:BlenderExecutable --background --version 2>$null
    if ($LASTEXITCODE -eq 0) {
        Log "AC-2.2 OK: Blender arranca correctamente en modo --background."
    } else {
        Log "AC-2.2 FALLIDO: Blender no arrancó limpiamente en modo background (exit code $LASTEXITCODE)."
        exit 1
    }
} catch {
    Log "AC-2.2 FALLIDO: excepción al probar --background: $_"
    exit 1
}

$logPath = Join-Path $ProjectRoot "electric_boat_29ft\logs\task2_blender_version.txt"
"Blender version: $currentVersion`nExecutable: $script:BlenderExecutable`nFecha: $(Get-Date)`nBackground test: OK" | Out-File $logPath -Encoding utf8
Log "TASK-2 completo. Log guardado en $logPath"
Log "Listo para 'TASK-2 lista para revisión'."
