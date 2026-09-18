#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Test all NVIDIA models in Orca config to verify they work
.DESCRIPTION
    Iterates through all models in config/models.json and sends a test request
    to each one to validate connectivity and response.
#>

param(
    [string]$ConfigPath = "03_AI_Automation/orca/config/models.json",
    [string]$ApiKey = $env:NVIDIA_API_KEY,
    [switch]$CloudOnly = $false,
    [int]$Timeout = 30
)

if (-not $ApiKey) {
    Write-Error "NVIDIA_API_KEY not set. Set it via: `$env:NVIDIA_API_KEY = 'your-key'"
    exit 1
}

if (-not (Test-Path $ConfigPath)) {
    Write-Error "Config not found: $ConfigPath"
    exit 1
}

# Load config
$config = Get-Content $ConfigPath | ConvertFrom-Json
$models = $config.models

Write-Host "Testing models from: $ConfigPath"
Write-Host "Total models: $($models.Count)`n"

# Filter models
if ($CloudOnly) {
    $models = $models | Where-Object { $_.provider -match "nvidia|openai|anthropic" -and $_.base_url -match "https://" }
    Write-Host "Filtered to cloud-only models: $($models.Count)`n"
}

$results = @()
$successCount = 0
$failCount = 0

foreach ($model in $models) {
    $modelId = $model.id
    $provider = $model.provider
    $modelName = $model.model
    $baseUrl = $model.base_url

    # Skip anthropic and local models for now
    if ($provider -eq "anthropic" -or $baseUrl -match "localhost|127.0.0.1") {
        Write-Host "⊘ $modelId ($provider) - skipped" -ForegroundColor Yellow
        continue
    }

    if ($baseUrl -notmatch "https://integrate.api.nvidia.com") {
        Write-Host "⊘ $modelId - non-NVIDIA endpoint" -ForegroundColor Yellow
        continue
    }

    Write-Host -NoNewline "Testing $modelId... "

    $headers = @{
        "Authorization" = "Bearer $ApiKey"
        "Content-Type" = "application/json"
    }

    $url = "$baseUrl/chat/completions"
    $body = @{
        model = $modelName
        messages = @(
            @{
                role = "user"
                content = "Say 'OK' in one word."
            }
        )
        max_tokens = 10
        temperature = 0.7
    } | ConvertTo-Json

    try {
        $response = Invoke-WebRequest -Uri $url `
            -Headers $headers `
            -Method POST `
            -Body $body `
            -ContentType "application/json" `
            -TimeoutSec $Timeout `
            -ErrorAction Stop

        $content = $response.Content | ConvertFrom-Json
        $tokens = $content.usage.total_tokens

        Write-Host "[OK]" -ForegroundColor Green
        $results += @{
            id = $modelId
            status = "OK"
            tokens = $tokens
            error = $null
        }
        $successCount++

    } catch {
        Write-Host "[FAIL]" -ForegroundColor Red
        $errorMsg = $_.Exception.Message

        $results += @{
            id = $modelId
            status = "FAIL"
            tokens = 0
            error = $errorMsg
        }
        $failCount++
    }
}

Write-Host ""
Write-Host "=== Test Summary ===" -ForegroundColor Cyan
Write-Host "Passed: $successCount/$($successCount + $failCount)" -ForegroundColor Green
if ($failCount -gt 0) {
    Write-Host "Failed: $failCount/$($successCount + $failCount)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Failed models:"
    $results | Where-Object { $_.status -eq "FAIL" } | ForEach-Object {
        Write-Host "  - $($_.id): $($_.error)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Detailed results:"
$results | Format-Table -AutoSize

exit $(if ($failCount -gt 0) { 1 } else { 0 })
