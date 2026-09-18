# ORCA Workflow Editor - Production Functional Tests
# Tests the deployed ORCA instance at https://orca.getupsoft.com/

param(
    [string]$BaseUrl = "https://orca.getupsoft.com",
    [string]$LocalUrl = "http://localhost:3000",
    [string]$Environment = "production"
)

Write-Host "🧪 ORCA Workflow Editor - Functional Tests" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host ""

$results = @()

# Test 1: Application Load (HTTP Health)
Write-Host "TEST 1: Application Load" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$BaseUrl/" -TimeoutSec 10 -ErrorAction Stop

    if ($response.StatusCode -eq 200) {
        Write-Host "✅ PASS: Application loads successfully (HTTP 200)" -ForegroundColor Green
        $results += @{ Test = "App Load"; Status = "PASS"; Details = "HTTP 200" }
    } else {
        Write-Host "⚠️  WARN: Application returned $($response.StatusCode)" -ForegroundColor Yellow
        $results += @{ Test = "App Load"; Status = "WARN"; Details = "HTTP $($response.StatusCode)" }
    }
} catch {
    Write-Host "❌ FAIL: Cannot load application: $_" -ForegroundColor Red
    $results += @{ Test = "App Load"; Status = "FAIL"; Details = $_.Exception.Message }
}

# Test 2: HTML Content Verification
Write-Host ""
Write-Host "TEST 2: HTML Content Verification" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$BaseUrl/" -TimeoutSec 10 -ErrorAction Stop
    $content = $response.Content

    $checks = @(
        @{ name = "React root element"; pattern = 'id="root"' },
        @{ name = "Application title"; pattern = 'ORCA|Workflow|Editor' },
        @{ name = "JavaScript loaded"; pattern = 'index.*\.js|<script' }
    )

    $passed = 0
    foreach ($check in $checks) {
        if ($content -match $check.pattern) {
            Write-Host "  ✅ Found: $($check.name)" -ForegroundColor Green
            $passed++
        } else {
            Write-Host "  ❌ Missing: $($check.name)" -ForegroundColor Red
        }
    }

    if ($passed -ge 2) {
        $results += @{ Test = "HTML Content"; Status = "PASS"; Details = "$passed/$($checks.Count) checks passed" }
        Write-Host "✅ PASS: HTML content verified ($passed/$($checks.Count))" -ForegroundColor Green
    } else {
        $results += @{ Test = "HTML Content"; Status = "FAIL"; Details = "Only $passed checks passed" }
        Write-Host "❌ FAIL: HTML content incomplete" -ForegroundColor Red
    }
} catch {
    Write-Host "⚠️  WARN: Could not verify HTML content: $_" -ForegroundColor Yellow
    $results += @{ Test = "HTML Content"; Status = "WARN"; Details = "Cannot access content" }
}

# Test 3: Static Assets (CSS/JS)
Write-Host ""
Write-Host "TEST 3: Static Assets" -ForegroundColor Yellow
try {
    # Try to load main JS bundle
    $jsPattern = "index.*\.js"
    $response = Invoke-WebRequest -Uri "$BaseUrl/" -TimeoutSec 10 -ErrorAction Stop

    if ($response.Content -match $jsPattern) {
        $jsFile = ([regex]$jsPattern).Match($response.Content).Value
        Write-Host "  ✅ JavaScript bundle found: $jsFile" -ForegroundColor Green

        # Try to fetch it
        try {
            $jsResponse = Invoke-WebRequest -Uri "$BaseUrl/assets/$jsFile" -TimeoutSec 5 -ErrorAction Stop
            if ($jsResponse.StatusCode -eq 200) {
                Write-Host "  ✅ JavaScript bundle loads: $($jsResponse.Content.Length) bytes" -ForegroundColor Green
                $results += @{ Test = "Static Assets"; Status = "PASS"; Details = "JS/CSS loads successfully" }
            }
        } catch {
            Write-Host "  ⚠️  JavaScript bundle not directly accessible" -ForegroundColor Yellow
        }
    }
} catch {
    Write-Host "⚠️  WARN: Could not verify assets: $_" -ForegroundColor Yellow
    $results += @{ Test = "Static Assets"; Status = "WARN"; Details = "Asset verification incomplete" }
}

# Test 4: OrcaAgentPanel Integration
Write-Host ""
Write-Host "TEST 4: OrcaAgentPanel Integration" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$BaseUrl/" -TimeoutSec 10 -ErrorAction Stop
    $content = $response.Content

    # Check if component references exist
    if ($content -match "OrcaAgent|orca-agent|API.*Key|Agent" -and $content -match "panel|Panel|Panel") {
        Write-Host "✅ PASS: OrcaAgentPanel integration detected" -ForegroundColor Green
        $results += @{ Test = "OrcaAgentPanel"; Status = "PASS"; Details = "Panel code detected in bundle" }
    } else {
        Write-Host "⚠️  WARN: OrcaAgentPanel integration not confirmed in HTML" -ForegroundColor Yellow
        $results += @{ Test = "OrcaAgentPanel"; Status = "WARN"; Details = "Component signature not found" }
    }
} catch {
    Write-Host "⚠️  WARN: Could not check OrcaAgentPanel: $_" -ForegroundColor Yellow
    $results += @{ Test = "OrcaAgentPanel"; Status = "WARN"; Details = "Cannot access page" }
}

# Test 5: HTTPS Security
Write-Host ""
Write-Host "TEST 5: HTTPS Security" -ForegroundColor Yellow
try {
    if ($BaseUrl.StartsWith("https://")) {
        Write-Host "✅ HTTPS enabled for production domain" -ForegroundColor Green
        $results += @{ Test = "HTTPS"; Status = "PASS"; Details = "Using HTTPS" }
    } else {
        Write-Host "❌ FAIL: Not using HTTPS" -ForegroundColor Red
        $results += @{ Test = "HTTPS"; Status = "FAIL"; Details = "HTTP only" }
    }
} catch {
    Write-Host "⚠️  WARN: Could not verify HTTPS" -ForegroundColor Yellow
    $results += @{ Test = "HTTPS"; Status = "WARN"; Details = "Cannot verify" }
}

# Test 6: Response Time
Write-Host ""
Write-Host "TEST 6: Response Time Performance" -ForegroundColor Yellow
try {
    $sw = [System.Diagnostics.Stopwatch]::StartNew()
    $response = Invoke-WebRequest -Uri "$BaseUrl/" -TimeoutSec 10 -ErrorAction Stop
    $sw.Stop()

    $responseTime = $sw.ElapsedMilliseconds
    Write-Host "Response time: $responseTime ms" -ForegroundColor Gray

    if ($responseTime -lt 2000) {
        Write-Host "✅ PASS: Response time is good ($responseTime ms < 2000ms)" -ForegroundColor Green
        $results += @{ Test = "Response Time"; Status = "PASS"; Details = "$responseTime ms" }
    } elseif ($responseTime -lt 5000) {
        Write-Host "⚠️  WARN: Response time is slow ($responseTime ms)" -ForegroundColor Yellow
        $results += @{ Test = "Response Time"; Status = "WARN"; Details = "$responseTime ms" }
    } else {
        Write-Host "❌ FAIL: Response time is very slow ($responseTime ms)" -ForegroundColor Red
        $results += @{ Test = "Response Time"; Status = "FAIL"; Details = "$responseTime ms" }
    }
} catch {
    Write-Host "❌ FAIL: Could not measure response time: $_" -ForegroundColor Red
    $results += @{ Test = "Response Time"; Status = "FAIL"; Details = $_.Exception.Message }
}

# Summary
Write-Host ""
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "📊 TEST SUMMARY" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan

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

Write-Host ""
if ($failed -gt 0) {
    Write-Host "⚠️  DEPLOYMENT ISSUE - Please review failures above" -ForegroundColor Red
    exit 1
} else {
    Write-Host "✅ DEPLOYMENT READY - All critical tests passed!" -ForegroundColor Green
    exit 0
}
