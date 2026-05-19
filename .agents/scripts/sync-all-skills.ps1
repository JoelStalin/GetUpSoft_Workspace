#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Sincroniza todas las skills desde ~/.codex/skills al directorio del proyecto
.DESCRIPTION
    Copia o actualiza todas las skills disponibles para asegurar que el proyecto
    tenga todas las skills preinstaladas y listas para usar.
#>

param(
    [string]$ProjectRoot = (Get-Location),
    [switch]$Force
)

$UserSkillsDir = Join-Path $env:USERPROFILE ".codex\skills"
$ProjectSkillsDir = Join-Path $ProjectRoot ".agents\skills"

if (-not (Test-Path $UserSkillsDir)) {
    Write-Error "No user skills found at: $UserSkillsDir"
    exit 1
}

if (-not (Test-Path $ProjectSkillsDir)) {
    Write-Host "Creating project skills directory..."
    New-Item -ItemType Directory -Path $ProjectSkillsDir -Force | Out-Null
}

$userSkills = Get-ChildItem -Path $UserSkillsDir -Directory | Select-Object -ExpandProperty Name
$projectSkills = Get-ChildItem -Path $ProjectSkillsDir -Directory | Select-Object -ExpandProperty Name

$synced = 0
$skipped = 0

foreach ($skill in $userSkills) {
    $srcPath = Join-Path $UserSkillsDir $skill
    $destPath = Join-Path $ProjectSkillsDir $skill

    if ($skill -eq ".system") {
        continue
    }

    if (Test-Path $destPath) {
        if ($Force) {
            Write-Host "Updating $skill..."
            Remove-Item -Path $destPath -Recurse -Force
            Copy-Item -Path $srcPath -Destination $destPath -Recurse -Force
            $synced++
        } else {
            $skipped++
        }
    } else {
        Write-Host "Installing $skill..."
        Copy-Item -Path $srcPath -Destination $destPath -Recurse -Force
        $synced++
    }
}

$totalProjectSkills = (Get-ChildItem -Path $ProjectSkillsDir -Directory | Measure-Object).Count
Write-Host ""
Write-Host "✓ Sync complete:"
Write-Host "  Synced: $synced"
Write-Host "  Skipped: $skipped"
Write-Host "  Total skills in project: $totalProjectSkills"
