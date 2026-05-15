param(
    [switch]$SkipSkillSync,
    [switch]$SkipRecommendations
)

$ErrorActionPreference = 'Stop'
$workspaceRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$summary = [ordered]@{
    workspaceRoot = $workspaceRoot
    generatedAt = (Get-Date).ToString('o')
    skillSync = $false
    recommendations = $false
}

if (-not $SkipSkillSync) {
    & "$PSScriptRoot/sync_shared_skills.ps1"
    $summary.skillSync = $true
}

if (-not $SkipRecommendations) {
    & "$PSScriptRoot/project_skill_recommendations.ps1"
    $summary.recommendations = $true
}

& "$PSScriptRoot/stitch_mcp_bootstrap.ps1"
$summary.stitchMcp = $true

$ledgerDir = Join-Path $workspaceRoot 'task-ledger'
if (-not (Test-Path -LiteralPath $ledgerDir)) {
    New-Item -ItemType Directory -Path $ledgerDir | Out-Null
}

$summaryPath = Join-Path $ledgerDir 'workspace-bootstrap.json'
$summary | ConvertTo-Json -Depth 4 | Set-Content -LiteralPath $summaryPath -Encoding UTF8

Write-Host "Workspace bootstrap complete."
Write-Host "Summary: $summaryPath"
