param(
    [string]$WorkspaceRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
)

$ErrorActionPreference = 'Stop'

$bootstrapPath = Join-Path $WorkspaceRoot 'task-ledger/workspace-bootstrap.json'
$recommendationsPath = Join-Path $WorkspaceRoot 'task-ledger/skill-recommendations.md'
$skillsLockPath = Join-Path $WorkspaceRoot 'skills-lock.json'

if (-not (Test-Path -LiteralPath $bootstrapPath)) {
    & "$PSScriptRoot/workspace_bootstrap.ps1"
}

$bootstrap = Get-Content -LiteralPath $bootstrapPath -Raw | ConvertFrom-Json

Write-Host 'AGENT START BRIEF'
Write-Host ('Workspace: ' + $bootstrap.workspaceRoot)
Write-Host ('Generated: ' + $bootstrap.generatedAt)
Write-Host ('Bootstrap: ' + $bootstrapPath)
Write-Host ('Recommendations: ' + $recommendationsPath)
Write-Host ('Skills lock: ' + $skillsLockPath)
Write-Host ''

if (Test-Path -LiteralPath $recommendationsPath) {
    $head = Get-Content -LiteralPath $recommendationsPath -TotalCount 18
    foreach ($line in $head) {
        Write-Host $line
    }
}
