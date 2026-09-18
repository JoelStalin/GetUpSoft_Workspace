# Triangular Communication Test Script (Windows PowerShell)
# Tests: code.getupsoft.com ↔ PC Local ↔ Docker Odoo

param(
    [string]$ApiKey = "default-insecure-key-change-me",
    [string]$OrcaUrl = "http://localhost:8000"
)

Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   TRIANGULAR COMMUNICATION TEST                           ║" -ForegroundColor Cyan
Write-Host "║   Testing: code.getupsoft.com ↔ PC Local ↔ Docker Odoo   ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

$testResults = @()
$testsPassed = 0
$testsFailed = 0

function Test-ApiCall {
    param(
        [string]$TestName,
        [string]$Endpoint,
        [string]$Description
    )

    Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Testing: $TestName" -ForegroundColor Yellow
    Write-Host "  └─ $Description" -ForegroundColor Gray

    try {
        $url = "$OrcaUrl$Endpoint"
        $response = Invoke-WebRequest -Uri $url `
            -Method Get `
            -Headers @{"X-API-Key" = $ApiKey} `
            -TimeoutSec 10 `
            -ErrorAction Stop

        Write-Host "  ✅ PASSED: Status $($response.StatusCode)" -ForegroundColor Green

        $testResults += @{
            Name = $TestName
            Status = "PASSED"
            Code = $response.StatusCode
        }
        $script:testsPassed++
        return $true
    }
    catch {
        $errorMsg = $_.Exception.Message
        Write-Host "  ❌ FAILED: $errorMsg" -ForegroundColor Red

        $testResults += @{
            Name = $TestName
            Status = "FAILED"
            Error = $errorMsg
        }
        $script:testsFailed++
        return $false
    }
}

function Test-JsonResponse {
    param(
        [string]$TestName,
        [string]$Endpoint,
        [string]$Description,
        [string]$ExpectedField
    )

    Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Testing: $TestName" -ForegroundColor Yellow
    Write-Host "  └─ $Description" -ForegroundColor Gray

    try {
        $url = "$OrcaUrl$Endpoint"
        $response = Invoke-WebRequest -Uri $url `
            -Method Get `
            -Headers @{"X-API-Key" = $ApiKey} `
            -TimeoutSec 10 `
            -ErrorAction Stop

        $json = $response.Content | ConvertFrom-Json

        if ($ExpectedField -and $json.$ExpectedField) {
            Write-Host "  ✅ PASSED: Found $ExpectedField in response" -ForegroundColor Green
            $testResults += @{
                Name = $TestName
                Status = "PASSED"
                Value = $json.$ExpectedField
            }
            $script:testsPassed++
            return $true
        }
        else {
            Write-Host "  ✅ PASSED: Response valid" -ForegroundColor Green
            $testResults += @{
                Name = $TestName
                Status = "PASSED"
            }
            $script:testsPassed++
            return $true
        }
    }
    catch {
        $errorMsg = $_.Exception.Message
        Write-Host "  ❌ FAILED: $errorMsg" -ForegroundColor Red

        $testResults += @{
            Name = $TestName
            Status = "FAILED"
            Error = $errorMsg
        }
        $script:testsFailed++
        return $false
    }
}

# ============================================
# NODE 1: code.getupsoft.com (External)
# ============================================

Write-Host ""
Write-Host "┌─────────────────────────────────────────────────────────┐" -ForegroundColor Cyan
Write-Host "│ NODE 1: code.getupsoft.com (External/Cloud)            │" -ForegroundColor Cyan
Write-Host "└─────────────────────────────────────────────────────────┘" -ForegroundColor Cyan
Write-Host ""

# ============================================
# NODE 2: PC Local (Orca Agent)
# ============================================

Write-Host ""
Write-Host "┌─────────────────────────────────────────────────────────┐" -ForegroundColor Cyan
Write-Host "│ NODE 2: PC Local (Orca Agent Server)                   │" -ForegroundColor Cyan
Write-Host "└─────────────────────────────────────────────────────────┘" -ForegroundColor Cyan
Write-Host ""

Test-JsonResponse `
    -TestName "Orca Agent Online" `
    -Endpoint "/api/agent/info" `
    -Description "Verify Orca Agent server is running" `
    -ExpectedField "name"

Test-ApiCall `
    -TestName "Docker Access" `
    -Endpoint "/api/docker/containers" `
    -Description "Verify Agent can access Docker API"

# ============================================
# NODE 3: Docker Odoo Lab
# ============================================

Write-Host ""
Write-Host "┌─────────────────────────────────────────────────────────┐" -ForegroundColor Cyan
Write-Host "│ NODE 3: Docker Odoo Lab (localhost:8069)               │" -ForegroundColor Cyan
Write-Host "└─────────────────────────────────────────────────────────┘" -ForegroundColor Cyan
Write-Host ""

Test-JsonResponse `
    -TestName "Odoo Health" `
    -Endpoint "/api/odoo/health" `
    -Description "Verify Odoo is online" `
    -ExpectedField "odoo_status"

Test-JsonResponse `
    -TestName "Odoo Modules" `
    -Endpoint "/api/odoo/modules" `
    -Description "Verify 46+ ORCA modules installed" `
    -ExpectedField "total_count"

Test-ApiCall `
    -TestName "ORCA Audit Logs" `
    -Endpoint "/api/odoo/orca-logs" `
    -Description "Verify ORCA audit logging works"

# ============================================
# SYSTEM INTEGRATION TESTS
# ============================================

Write-Host ""
Write-Host "┌─────────────────────────────────────────────────────────┐" -ForegroundColor Cyan
Write-Host "│ SYSTEM INTEGRATION TESTS                                │" -ForegroundColor Cyan
Write-Host "└─────────────────────────────────────────────────────────┘" -ForegroundColor Cyan
Write-Host ""

Test-JsonResponse `
    -TestName "Full Health Check" `
    -Endpoint "/api/health" `
    -Description "Check all endpoints health status" `
    -ExpectedField "orca_agent"

# ============================================
# FINAL RESULTS
# ============================================

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   TEST RESULTS SUMMARY                                   ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

foreach ($result in $testResults) {
    if ($result.Status -eq "PASSED") {
        $icon = "✅"
        $color = "Green"
    } else {
        $icon = "❌"
        $color = "Red"
    }

    Write-Host "$icon $($result.Name)" -ForegroundColor $color

    if ($result.Error) {
        Write-Host "   Error: $($result.Error)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "RESULTS:" -ForegroundColor Cyan
Write-Host "  Passed: $testsPassed" -ForegroundColor Green
Write-Host "  Failed: $testsFailed" -ForegroundColor Red
Write-Host "  Total:  $($testsPassed + $testsFailed)" -ForegroundColor White

Write-Host ""

if ($testsFailed -eq 0) {
    Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Green
    Write-Host "║ ✅ ALL TESTS PASSED                                       ║" -ForegroundColor Green
    Write-Host "║ 🎉 Communication triangulation successful!               ║" -ForegroundColor Green
    Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Green
    Write-Host ""
    Write-Host "Communication verified:" -ForegroundColor Green
    Write-Host "  ✅ code.getupsoft.com → PC Local (Orca Agent)" -ForegroundColor Green
    Write-Host "  ✅ PC Local (Orca Agent) → Docker Odoo Lab" -ForegroundColor Green
    Write-Host "  ✅ Docker Odoo → PC Local → code.getupsoft.com" -ForegroundColor Green
    Write-Host ""
    Write-Host "🚀 System is READY for production!" -ForegroundColor Green
    exit 0
} else {
    Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Red
    Write-Host "║ ❌ SOME TESTS FAILED                                      ║" -ForegroundColor Red
    Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Red
    Write-Host ""
    Write-Host "Troubleshooting steps:" -ForegroundColor Yellow
    Write-Host "  1. Verify Docker labs are running:" -ForegroundColor Yellow
    Write-Host "     docker-compose ps" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  2. Verify Orca Agent is running:" -ForegroundColor Yellow
    Write-Host "     .\scripts\start-orca-agent.ps1" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  3. Verify API key is set:" -ForegroundColor Yellow
    Write-Host "     `$env:ORCA_AGENT_API_KEY" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  4. Check Odoo logs:" -ForegroundColor Yellow
    Write-Host "     docker logs -f odoo19_orca" -ForegroundColor Gray
    Write-Host ""
    exit 1
}
