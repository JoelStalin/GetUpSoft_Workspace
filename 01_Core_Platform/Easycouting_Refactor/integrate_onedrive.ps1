$ErrorActionPreference = "SilentlyContinue"
$oneDrive = "C:\Users\yoeli\OneDrive\Documents"
$ws = "C:\Users\yoeli\Documents\GetUpSoft_Workspace"
$kc = "$ws\_Knowledge_Center"

Write-Host "Iniciando integración de proyectos desde OneDrive..."

# 1. Asegurar categorías
$core = "$ws\01_Core_Platform"
$odoo = "$ws\02_Odoo_ERP"
$ai = "$ws\03_AI_Automation"
$archive = "$ws\04_Archive_Legacy"
$backups = "$ws\05_Backups"

# --- PROCESAR ODOO ---
$odooProjects = @("odoocontability", "odoo18-docker", "l10n_do_jm", "Attrs", "Iot_OCA_versionado", "iot", "17_DO_ultimo", "17_do", "neo_do_localization", "odoo_Dev", "odoodevp", "jabiyaprod")
foreach ($p in $odooProjects) {
    $path = Join-Path $oneDrive $p
    if (Test-Path $path) {
        Write-Host "Procesando Odoo: $p"
        
        # Extraer Inteligencia antes de mover
        Move-Item -Path "$path\project-memory" -Destination "$kc\Long_Term_Memory\$p" -Force
        Move-Item -Path "$path\.agents" -Destination "$kc\Agents_Skills\$p" -Force
        
        # Buscar "Backlog" (TODOs)
        $todos = Get-ChildItem -Path $path -Recurse -Include "*.py", "*.md", "*.txt" | Select-String "TODO"
        if ($todos) {
            $backlogPath = Join-Path $path "BACKLOG.md"
            "### Backlog Detectado Automaticamente`n" | Out-File $backlogPath
            $todos | ForEach-Object { "$($_.Line) ($($_.FileName):$($_.LineNumber))" | Out-File $backlogPath -Append }
        }

        Move-Item -Path $path -Destination "$odoo\$p" -Force
    }
}

# --- PROCESAR AI / RESEARCH ---
$aiProjects = @("Claude", "printer_proxy", "QR_generetor", "web_qr_generetor", "(Video2Brain) Node.js")
foreach ($p in $aiProjects) {
    $path = Join-Path $oneDrive $p
    if (Test-Path $path) {
        Write-Host "Procesando AI/Tool: $p"
        Move-Item -Path $path -Destination "$ai\$p" -Force
    }
}

# --- PROCESAR BACKUPS Y LEGACY ---
$legacyProjects = @("odoocontability_bk", "odoocontability_bk2", "back_l10", "versionado", "test", "extra", "pytest", "IBM", "SideSync")
foreach ($p in $legacyProjects) {
    $path = Join-Path $oneDrive $p
    if (Test-Path $path) {
        Write-Host "Archivando: $p"
        Move-Item -Path $path -Destination "$backups\onedrive_recovery_$p" -Force
    }
}

# --- LIMPIEZA DE ARCHIVOS SUELTOS EN ONEDRIVE ---
Get-ChildItem -Path $oneDrive -File | ForEach-Object {
    if ($_.Name -like "*.zip" -or $_.Name -like "*.rar") {
        Move-Item -Path $_.FullName -Destination "$backups\archives\" -Force
    }
}

Write-Host "OneDrive organizado e integrado con éxito."
