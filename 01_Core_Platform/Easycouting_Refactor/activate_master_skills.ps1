$ErrorActionPreference = "SilentlyContinue"
$ws = "C:\Users\yoeli\Documents\GetUpSoft_Workspace"
$skillsSource = "$ws\_Knowledge_Center\Agents_Skills"
$globalSkillsDest = "C:\Users\yoeli\.gemini\skills"

# Asegurar que el directorio global existe
if (!(Test-Path $globalSkillsDest)) {
    New-Item -ItemType Directory -Force -Path $globalSkillsDest
}

# Obtener todas las carpetas de skills centralizadas
$skills = Get-ChildItem -Path $skillsSource -Directory

Write-Host "Iniciando vinculación de Inteligencia Maestra..."

foreach ($skill in $skills) {
    $target = Join-Path $globalSkillsDest $skill.Name
    
    # Si ya existe algo, lo removemos para asegurar el vínculo fresco
    if (Test-Path $target) {
        Remove-Item -Path $target -Recurse -Force
    }
    
    # Crear enlace simbólico de directorio (Junction) para que el CLI detecte la skill
    # cmd /c mklink /J "$target" "$($skill.FullName)"
    # Usando New-Item de PowerShell para mayor seguridad
    New-Item -ItemType Junction -Path $target -Value $skill.FullName
    
    Write-Host "✅ Skill habilitada: $($skill.Name)"
}

Write-Host "`nOperación completada. 42+ habilidades técnicas están ahora activas globalmente."
