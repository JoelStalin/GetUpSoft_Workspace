$ErrorActionPreference = "SilentlyContinue"
$downloads = "C:\Users\yoeli\Downloads"
$ws = "C:\Users\yoeli\Documents\GetUpSoft_Workspace"
$masterPrompts = "$ws\_Knowledge_Center\Master_Prompts"
$changeMemory = "$ws\_Knowledge_Center\Long_Term_Memory\_Change_History"

# Crear carpetas si no existen
New-Item -ItemType Directory -Force -Path $masterPrompts
New-Item -ItemType Directory -Force -Path $changeMemory

# Listado de archivos a rescatar (basado en el escaneo anterior)
$files = Get-ChildItem -Path $downloads -File | Where-Object { $_.Name -like "*prompt*" -or $_.Extension -eq ".md" -or $_.Name -like "*instruccion*" }

Write-Host "Iniciando rescate de $($files.Count) archivos desde Descargas..."

foreach ($file in $files) {
    # Clasificación automática basada en el nombre
    $category = "General"
    if ($file.Name -like "*dgii*" -or $file.Name -like "*ecf*") { $category = "DGII_EasyCount" }
    elseif ($file.Name -like "*odoo*") { $category = "Odoo_ERP" }
    elseif ($file.Name -like "*galante*") { $category = "Galantes_Lux" }
    elseif ($file.Name -like "*aihub*" -or $file.Name -like "*orchestra*") { $category = "AI_Automation" }
    elseif ($file.Name -like "*getupnet*") { $category = "GetUpNet" }

    $destFolder = Join-Path $masterPrompts $category
    if (!(Test-Path $destFolder)) { New-Item -ItemType Directory -Force -Path $destFolder }

    # Mover archivo al Master_Prompts
    $destPath = Join-Path $destFolder $file.Name
    Move-Item -Path $file.FullName -Destination $destPath -Force
    
    # Crear registro en memoria de cambios
    $logEntry = @"
Fecha: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
Archivo Original: $($file.Name)
Categoría Asignada: $category
Acción: Recuperado de Descargas y Centralizado.
Estado: Pendiente de Revisión Técnica.
-----------------------------------
"@
    $logFile = Join-Path $changeMemory "prompt_recovery_log.txt"
    $logEntry | Out-File -FilePath $logFile -Append -Encoding utf8

    Write-Host "✅ Recuperado: $($file.Name) -> [$category]"
}

Write-Host "`nRescate de Descargas finalizado. Todos los prompts están en el Knowledge Center."
