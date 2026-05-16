$ErrorActionPreference = "SilentlyContinue"
$ws = "C:\Users\yoeli\Documents\GetUpSoft_Workspace"

# Lista de carpetas redundantes de inteligencia a eliminar en subproyectos
# (Ya han sido migradas al _Knowledge_Center en pasos anteriores)
$redundancies = @(".agents", "project-memory", ".ai_context")

Write-Host "Iniciando limpieza de redundancias de inteligencia..."

# Obtener todos los subdirectorios del Workspace (excluyendo el Knowledge Center mismo)
$projects = Get-ChildItem -Path $ws -Directory | Where-Object { $_.Name -ne "_Knowledge_Center" }

foreach ($project in $projects) {
    Write-Host "Procesando proyecto: $($project.Name)"
    
    foreach ($folderName in $redundancies) {
        $targetPath = Join-Path $project.FullName $folderName
        if (Test-Path $targetPath) {
            Write-Host "  -> Eliminando redundancia: $folderName"
            Remove-Item -Path $targetPath -Recurse -Force
        }
    }

    # Búsqueda profunda de archivos SKILL.md o similares dentro del proyecto
    Get-ChildItem -Path $project.FullName -Recurse -Filter "SKILL.md" | Remove-Item -Force
    Get-ChildItem -Path $project.FullName -Recurse -Filter "PROJECT_MEMORY.md" | Remove-Item -Force
}

# Caso especial: Galantesjewelry (está un nivel más profundo)
$lux = Join-Path $ws "06_E_Commerce_Lux\Galantesjewelry"
if (Test-Path $lux) {
    Write-Host "Procesando proyecto Lux: Galantesjewelry"
    Remove-Item -Path (Join-Path $lux ".agents") -Recurse -Force
    Remove-Item -Path (Join-Path $lux "project-memory") -Recurse -Force
    Remove-Item -Path (Join-Path $lux ".ai_context") -Recurse -Force
}

Write-Host "Limpieza completada. El Workspace ahora es 'Code-Only' con Inteligencia Centralizada."
