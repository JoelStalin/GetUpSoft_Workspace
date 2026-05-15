param(
    [string]$SourceRoot = "$env:USERPROFILE\.codex\skills",
    [string]$TargetRoot = (Join-Path $PSScriptRoot "..\.agents\skills")
)

$sourcePath = [System.IO.Path]::GetFullPath($SourceRoot)
$targetPath = [System.IO.Path]::GetFullPath($TargetRoot)

if (-not (Test-Path $sourcePath)) {
    throw "Source skills path not found: $sourcePath"
}

New-Item -ItemType Directory -Force -Path $targetPath | Out-Null

$copied = 0
Get-ChildItem -Path $sourcePath -Directory | Where-Object { $_.Name -ne ".system" } | ForEach-Object {
    $skillPath = Join-Path $_.FullName "SKILL.md"
    if (-not (Test-Path $skillPath)) {
        return
    }

    $destination = Join-Path $targetPath $_.Name
    Copy-Item -Path $_.FullName -Destination $destination -Recurse -Force
    $copied++
}

Write-Host "Synced $copied skills from $sourcePath to $targetPath"
