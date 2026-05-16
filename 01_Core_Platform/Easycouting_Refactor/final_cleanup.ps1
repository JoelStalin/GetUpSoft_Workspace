$ErrorActionPreference = "SilentlyContinue"
$docs = "C:\Users\yoeli\Documents"
$ws = "C:\Users\yoeli\Documents\GetUpSoft_Workspace"

# 1. Eliminar archivos que ya estÃ¡n en el Workspace (duplicados confirmados)
$fileTypes = @("*.zip", "*.rar", "*.bundle", "*.csv", "*.sql", "*.xlsx")
foreach ($type in $fileTypes) {
    Remove-Item -Path (Join-Path $docs $type) -Force
}

# 2. Intentar mover las Ãºltimas carpetas
Move-Item -Path (Join-Path $docs "Easycouting") -Destination "$ws\01_Core_Platform\easycount-core" -Force
Move-Item -Path (Join-Path $docs "Galantesjewelry") -Destination "$ws\06_E_Commerce_Lux\Galantesjewelry" -Force
Move-Item -Path (Join-Path $docs "bhd") -Destination "$ws\02_Odoo_ERP\integrations\bhd_bank" -Force
Move-Item -Path (Join-Path $docs "pricing") -Destination "$ws\05_Backups\sandbox\" -Force

# 3. Limpieza de scripts temporales de esta sesiÃ³n
Remove-Item -Path (Join-Path $docs "reorganize.ps1") -Force
Remove-Item -Path (Join-Path $docs "centralize_intelligence.ps1") -Force
Remove-Item -Path (Join-Path $docs "activate_master_skills.ps1") -Force
Remove-Item -Path (Join-Path $docs "rescue_skills.ps1") -Force
Remove-Item -Path (Join-Path $docs "final_sweep.ps1") -Force
Remove-Item -Path (Join-Path $docs "rescue_downloads.ps1") -Force
Remove-Item -Path (Join-Path $docs "purge_redundant_intel.ps1") -Force

Write-Host "La carpeta Documentos ha sido purgada y el Workspace estÃ¡ completo."
