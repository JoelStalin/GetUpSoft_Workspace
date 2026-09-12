param()

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$repoRoot = Split-Path -Parent $PSScriptRoot
$continueDirectory = Join-Path $env:USERPROFILE '.continue'
$configFile = Join-Path $continueDirectory 'config.yaml'
$codePath = $null
$codeCandidates = @(
    'code',
    "$env:LOCALAPPDATA\Programs\Microsoft VS Code\bin\code.cmd",
    "$env:ProgramFiles\Microsoft VS Code\bin\code.cmd",
    "${env:ProgramFiles(x86)}\Microsoft VS Code\bin\code.cmd"
)
foreach ($candidate in $codeCandidates) {
    if ($candidate -eq 'code') {
        $cmd = Get-Command code -ErrorAction SilentlyContinue
        if ($cmd) { $codePath = $cmd.Source; break }
    }
    elseif (Test-Path $candidate) { $codePath = $candidate; break }
}
if (-not $codePath) { throw 'VS Code CLI not found.' }

function Test-OllamaApi {
    try {
        $tags = Invoke-RestMethod -Method Get -Uri 'http://localhost:11434/api/tags' -TimeoutSec 15
        return $tags
    }
    catch {
        throw "Ollama API not responding at http://localhost:11434/api/tags: $($_.Exception.Message)"
    }
}

function Get-PreferredModel([object]$tags) {
    $models = @($tags.models)
    if (-not $models -or $models.Count -eq 0) { throw 'No models returned by Ollama.' }
    $preferred = $models | Where-Object { $_.name -eq 'llama3:latest' } | Select-Object -First 1
    if ($preferred) { return $preferred.name }
    return $models[0].name
}

New-Item -ItemType Directory -Path $continueDirectory -Force | Out-Null
if (Test-Path $configFile) {
    $timestamp = Get-Date -Format 'yyyyMMdd-HHmmss'
    $backupFile = "$configFile.backup-$timestamp"
    Copy-Item -Path $configFile -Destination $backupFile -Force
    Write-Host "Backed up existing Continue config to $backupFile"
}

$tags = Test-OllamaApi
$modelName = Get-PreferredModel -tags $tags
Write-Host "Selected model: $modelName"

$configContent = @"
name: GetUpSoft Local AI
version: 1.0.0
schema: v1

models:
  - name: Llama 3 Local
    provider: ollama
    model: $modelName
    apiBase: http://localhost:11434
    roles:
      - chat
      - edit
      - apply
    defaultCompletionOptions:
      contextLength: 4096
      maxTokens: 2048
      temperature: 0.2
"@

[System.IO.File]::WriteAllText($configFile, $configContent, [System.Text.UTF8Encoding]::new($false))

$body = @{
    model = $modelName
    prompt = 'Responde exactamente: Ollama funciona correctamente'
    stream = $false
} | ConvertTo-Json

$response = Invoke-RestMethod -Method Post -Uri 'http://localhost:11434/api/generate' -ContentType 'application/json' -Body $body
Write-Host 'Generate test response:'
Write-Host $response.response

$extensions = & $codePath --list-extensions 2>$null
if ($extensions -notcontains 'Continue.continue') {
    & $codePath --install-extension 'Continue.continue' | Out-Null
}

Write-Host "Continue config written to $configFile"
Write-Host "Repository root: $repoRoot"
Write-Host 'Setup completed successfully.'