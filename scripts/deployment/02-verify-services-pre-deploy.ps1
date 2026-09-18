# Service Verification Script (PRE-DEPLOYMENT)
# Purpose: Document which services are responding before deployment
# Status: READ-ONLY - No changes made

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "PRE-DEPLOYMENT SERVICE HEALTH CHECK" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
Write-Host "Timestamp: $timestamp"
Write-Host ""

# 1. Check local services
Write-Host "📋 Local Services Status:" -ForegroundColor Yellow
Get-Service | Where-Object {$_.Status -eq 'Running'} | Select-Object Name, Status, DisplayName | Format-Table

# 2. Check network ports
Write-Host ""
Write-Host "🔌 Network Ports (localhost):" -ForegroundColor Yellow
@(80, 443, 3000, 5000, 8080, 5432, 3306) | ForEach-Object {
    $port = $_
    try {
        $result = Test-NetConnection -ComputerName localhost -Port $port -WarningAction SilentlyContinue
        $status = if ($result.TcpTestSucceeded) { "✅ OPEN" } else { "❌ CLOSED" }
        Write-Host "Port $port : $status"
    } catch {
        Write-Host "Port $port : ⚠️  Unknown"
    }
}

# 3. Check common endpoints
Write-Host ""
Write-Host "🌐 Common Endpoints:" -ForegroundColor Yellow
$endpoints = @(
    "http://localhost:3000",
    "http://localhost:5000",
    "http://localhost:8080",
    "http://localhost/orca"
)

$endpoints | ForEach-Object {
    try {
        $response = Invoke-WebRequest -Uri $_ -TimeoutSec 2 -ErrorAction Stop
        Write-Host "$_ : ✅ $($response.StatusCode)" 
    } catch {
        Write-Host "$_ : ❌ $($_.Exception.Message)"
    }
}

# 4. Save report
Write-Host ""
Write-Host "💾 Saving report..." -ForegroundColor Green
$report = @{
    Timestamp = $timestamp
    LocalServices = Get-Service | Where-Object {$_.Status -eq 'Running'} | Select-Object Name, DisplayName
    NetworkStatus = "See manual check above"
}

$report | ConvertTo-Json | Out-File ".\deployment-pre-check-$($timestamp.Replace(' ', '_')).json"
Write-Host "✅ Report saved"
