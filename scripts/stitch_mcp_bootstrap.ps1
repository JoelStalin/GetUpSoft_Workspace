param(
    [string]$WorkspaceRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
)

$ErrorActionPreference = 'Stop'

$configPath = Join-Path $WorkspaceRoot 'mcp-servers.shared.json'
$statusPath = Join-Path $WorkspaceRoot 'task-ledger/stitch-mcp-status.json'
$instructionsPath = Join-Path $WorkspaceRoot 'task-ledger/stitch-mcp-install.md'

$projectId = $env:GOOGLE_CLOUD_PROJECT
$apiKey = $env:GOOGLE_API_KEY

$status = [ordered]@{
    generatedAt = (Get-Date).ToString('o')
    configPath = $configPath
    command = 'npx -y stitch-mcp-auto'
    projectIdPresent = [bool]$projectId
    apiKeyPresent = [bool]$apiKey
    ready = [bool]$projectId
}

if (-not (Test-Path -LiteralPath $configPath)) {
    $status.ready = $false
}

$status | ConvertTo-Json -Depth 4 | Set-Content -LiteralPath $statusPath -Encoding UTF8

$notes = @(
    '# Stitch MCP Install',
    '',
    'Shared workspace config: `mcp-servers.shared.json`',
    '',
    'Current command: `npx -y stitch-mcp-auto`',
    '',
    'Requirements:',
    '- Google Cloud project id in `GOOGLE_CLOUD_PROJECT`',
    '- Google auth / Stitch access configured for the account',
    '',
    'If `ready` is false, set the project id and re-run the bootstrap.'
)

$notes -join "`r`n" | Set-Content -LiteralPath $instructionsPath -Encoding UTF8

Write-Host "Stitch MCP bootstrap complete."
Write-Host ("Ready: " + $status.ready)
Write-Host ("Status: " + $statusPath)
Write-Host ("Instructions: " + $instructionsPath)
