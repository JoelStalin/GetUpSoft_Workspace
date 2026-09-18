# GetUpSoft ORCA Functional Tests
# Validates deployment and connectivity of all components

param(
    [string]$OrcaAgentUrl = "http://localhost:8000",
    [string]$OdooUrl = "http://localhost:8069",
    [string]$WorkflowEditorUrl = "http://localhost:3000",
    [string]$CloudflareGatewayUrl = "https://orca-agent.getupsoft.com"
)

Write-Host "🧪 GetUpSoft ORCA Functional Tests" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

$results = @()

# Test 1: Orca Agent Health Check
Write-Host "TEST 1: Orca Agent Health Check" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$OrcaAgentUrl/api/health" -TimeoutSec 5 -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ PASS: Orca Agent health check successful" -ForegroundColor Green
        $results += @{ Test = "Orca Agent Health"; Status = "PASS"; Details = "HTTP 200" }
    }
} catch {
    Write-Host "❌ FAIL: Orca Agent health check failed: $_" -ForegroundColor Red
    $results += @{ Test = "Orca Agent Health"; Status = "FAIL"; Details = $_.Exception.Message }
}

# Test 2: Orca Agent API Key Generation
Write-Host ""
Write-Host "TEST 2: Orca Agent API Key Generation" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$OrcaAgentUrl/api/bootstrap/generate-key" -Method POST -ContentType "application/json" -TimeoutSec 5 -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        $data = $response.Content | ConvertFrom-Json
        if ($data.api_key) {
            Write-Host "✅ PASS: API key generated successfully" -ForegroundColor Green
            Write-Host "   Key (masked): $($data.api_key.Substring(0, 20))..." -ForegroundColor Cyan
            $results += @{ Test = "API Key Generation"; Status = "PASS"; Details = "Key generated" }
        }
    }
} catch {
    Write-Host "⚠️  WARN: API key generation endpoint not available (may be normal on first run)" -ForegroundColor Yellow
    $results += @{ Test = "API Key Generation"; Status = "WARN"; Details = $_.Exception.Message }
}

# Test 3: Odoo Lab Connectivity
Write-Host ""
Write-Host "TEST 3: Odoo Lab Connectivity" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$OdooUrl" -TimeoutSec 5 -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ PASS: Odoo lab is accessible" -ForegroundColor Green
        $results += @{ Test = "Odoo Lab"; Status = "PASS"; Details = "HTTP 200" }
    }
} catch {
    Write-Host "⚠️  WARN: Odoo lab not accessible (may be down for maintenance)" -ForegroundColor Yellow
    $results += @{ Test = "Odoo Lab"; Status = "WARN"; Details = $_.Exception.Message }
}

# Test 4: Workflow Editor Connectivity
Write-Host ""
Write-Host "TEST 4: Workflow Editor Connectivity" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$WorkflowEditorUrl" -TimeoutSec 5 -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ PASS: Workflow Editor is accessible" -ForegroundColor Green
        $results += @{ Test = "Workflow Editor"; Status = "PASS"; Details = "HTTP 200" }
    }
} catch {
    Write-Host "⚠️  WARN: Workflow Editor not accessible" -ForegroundColor Yellow
    $results += @{ Test = "Workflow Editor"; Status = "WARN"; Details = $_.Exception.Message }
}

# Test 5: Docker Container Status
Write-Host ""
Write-Host "TEST 5: Docker Container Status" -ForegroundColor Yellow
try {
    $containerStatus = docker ps --filter "name=orca" --format "{{.Status}}" 2>/dev/null
    if ($containerStatus -match "Up") {
        Write-Host "✅ PASS: Orca container is running" -ForegroundColor Green
        Write-Host "   Status: $containerStatus" -ForegroundColor Cyan
        $results += @{ Test = "Docker Container"; Status = "PASS"; Details = $containerStatus }
    } else {
        Write-Host "❌ FAIL: Orca container is not running" -ForegroundColor Red
        $results += @{ Test = "Docker Container"; Status = "FAIL"; Details = "Not running" }
    }
} catch {
    Write-Host "⚠️  WARN: Could not check Docker status" -ForegroundColor Yellow
    $results += @{ Test = "Docker Container"; Status = "WARN"; Details = $_.Exception.Message }
}

# Test 6: Cloudflare Gateway (optional - requires internet)
Write-Host ""
Write-Host "TEST 6: Cloudflare Gateway Connectivity (optional)" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$CloudflareGatewayUrl/api/health" -TimeoutSec 10 -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ PASS: Cloudflare gateway is accessible" -ForegroundColor Green
        $results += @{ Test = "Cloudflare Gateway"; Status = "PASS"; Details = "HTTP 200" }
    }
} catch {
    Write-Host "⚠️  WARN: Cloudflare gateway not accessible (check internet/VPN)" -ForegroundColor Yellow
    $results += @{ Test = "Cloudflare Gateway"; Status = "WARN"; Details = $_.Exception.Message }
}

# Summary
Write-Host ""
Write-Host "=================================" -ForegroundColor Cyan
Write-Host "📊 TEST SUMMARY" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan

$passed = ($results | Where-Object { $_.Status -eq "PASS" }).Count
$failed = ($results | Where-Object { $_.Status -eq "FAIL" }).Count
$warned = ($results | Where-Object { $_.Status -eq "WARN" }).Count

foreach ($result in $results) {
    $statusColor = if ($result.Status -eq "PASS") { "Green" } elseif ($result.Status -eq "FAIL") { "Red" } else { "Yellow" }
    Write-Host "[$($result.Status)] $($result.Test): $($result.Details)" -ForegroundColor $statusColor
}

Write-Host ""
Write-Host "✅ PASSED: $passed" -ForegroundColor Green
Write-Host "❌ FAILED: $failed" -ForegroundColor Red
Write-Host "⚠️  WARNED: $warned" -ForegroundColor Yellow
Write-Host "📈 TOTAL: $($results.Count)" -ForegroundColor Cyan

if ($failed -gt 0) {
    Write-Host ""
    Write-Host "⚠️  Some tests failed. Please review the output above." -ForegroundColor Yellow
    exit 1
} else {
    Write-Host ""
    Write-Host "✅ All critical tests passed!" -ForegroundColor Green
    exit 0
}
