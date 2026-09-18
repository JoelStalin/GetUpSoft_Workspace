$ErrorActionPreference = "SilentlyContinue"
$ws = "C:\Users\yoeli\Documents\GetUpSoft_Workspace"
$docs = "C:\Users\yoeli\Documents"
$desktop = "C:\Users\yoeli\Desktop"

# 1. Asegurar categorías específicas para los proyectos mencionados
New-Item -ItemType Directory -Force -Path "$ws\01_Core_Platform\easycount-core"
New-Item -ItemType Directory -Force -Path "$ws\02_Odoo_ERP\Chefalitas"
New-Item -ItemType Directory -Force -Path "$ws\03_AI_Automation\TinderBot"
New-Item -ItemType Directory -Force -Path "$ws\06_E_Commerce_Lux" # Nueva categoría para Galantes

# 2. BÚSQUEDA Y MOVIMIENTO (SIN BORRAR NADA)

# --- EasyCounting (Core) ---
# Si existe la carpeta actual donde estamos, la copiaremos en lugar de moverla para no romper la sesión
if (Test-Path "$docs\Easycouting") {
    Copy-Item -Path "$docs\Easycouting\*" -Destination "$ws\01_Core_Platform\easycount-core" -Recurse -Force
}

# --- Chefalitas (Odoo) ---
Move-Item -Path "$docs\Chefalitas" -Destination "$ws\02_Odoo_ERP\Chefalitas"
Move-Item -Path "$docs\tuto_chefalitas" -Destination "$ws\05_Backups\tuto_chefalitas"

# --- TinderBot (AI) ---
Move-Item -Path "$docs\TinderBot" -Destination "$ws\03_AI_Automation\TinderBot"
Move-Item -Path "$docs\TinderBotJ" -Destination "$ws\03_AI_Automation\TinderBotJ"
Move-Item -Path "$docs\TinderBotz" -Destination "$ws\03_AI_Automation\TinderBotz"

# --- GalantesJewelry (E-Commerce) ---
Move-Item -Path "$docs\Galantesjewelry" -Destination "$ws\06_E_Commerce_Lux\Galantesjewelry"

# --- Barrido General de Documentos y Escritorio ---
$allDocs = Get-ChildItem -Path $docs -Directory
$allDesktop = Get-ChildItem -Path $desktop -Directory

$keywords = @("getup", "odoo", "dgii", "ncf", "bot", "insta", "accounting", "contabilidad", "migra")

foreach ($dir in ($allDocs + $allDesktop)) {
    foreach ($key in $keywords) {
        if ($dir.Name -like "*$key*") {
            # Evitar mover el Workspace dentro de sí mismo
            if ($dir.Name -notlike "*GetUpSoft_Workspace*") {
                Move-Item -Path $dir.FullName -Destination "$ws\05_Backups\consolidated_$(Get-Date -Format 'yyyyMMdd')_$($dir.Name)"
            }
        }
    }
}

Write-Host "Consolidación de proyectos específicos y barrido general completado."
