# GetUpSoft Orca Agent Startup Script (Windows PowerShell)
# Enables Orca Agent to access local Docker, Odoo, and Labs

param(
    [string]$ApiKey = "default-insecure-key-change-me"
)

Write-Host "=================================" -ForegroundColor Cyan
Write-Host "🤖 GetUpSoft Orca Agent Launcher" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

# Check if Python is installed
Write-Host "Checking Python installation..." -ForegroundColor Yellow
$pythonPath = Get-Command python.exe -ErrorAction SilentlyContinue
if (-not $pythonPath) {
    Write-Host "❌ Python not found! Install Python 3.8+ and add to PATH" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Python found: $($pythonPath.Source)" -ForegroundColor Green

# Check required packages
Write-Host ""
Write-Host "Checking Python packages..." -ForegroundColor Yellow
$requiredPackages = @("flask", "docker", "requests")
foreach ($package in $requiredPackages) {
    $installed = pip show $package 2>$null
    if ($installed) {
        Write-Host "  ✅ $package" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $package not found, installing..." -ForegroundColor Yellow
        pip install $package -q
        Write-Host "  ✅ $package installed" -ForegroundColor Green
    }
}

# Set API Key
Write-Host ""
Write-Host "Setting API Key..." -ForegroundColor Yellow

if ($ApiKey -eq "default-insecure-key-change-me") {
    $ApiKey = Read-Host "Enter a strong API key (or press Enter for default)"
    if ($ApiKey -eq "") {
        $ApiKey = "orca-api-key-$(Get-Random -Minimum 100000 -Maximum 999999)"
        Write-Host "⚠️  Generated random key: $ApiKey" -ForegroundColor Yellow
    }
}

# Save API key to environment
$env:ORCA_AGENT_API_KEY = $ApiKey
Write-Host "✅ API Key set: $($ApiKey.Substring(0, 10))..." -ForegroundColor Green

# Check Docker
Write-Host ""
Write-Host "Checking Docker..." -ForegroundColor Yellow
$dockerPath = Get-Command docker.exe -ErrorAction SilentlyContinue
if (-not $dockerPath) {
    Write-Host "❌ Docker not found! Install Docker Desktop" -ForegroundColor Yellow
} else {
    Write-Host "✅ Docker found: $($dockerPath.Source)" -ForegroundColor Green

    # Check Docker daemon
    $dockerPs = docker ps 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Docker daemon running" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Docker daemon not responding - start Docker Desktop" -ForegroundColor Yellow
    }
}

# Check labs
Write-Host ""
Write-Host "Checking lab endpoints..." -ForegroundColor Yellow

$labs = @{
    "Odoo v19" = "http://localhost:8069"
    "n8n" = "http://localhost:5678"
    "Workflow Editor" = "http://localhost:3000"
}

foreach ($lab in $labs.GetEnumerator()) {
    $response = curl.exe -s -I $lab.Value -o $null -w "%{http_code}"
    if ($response -eq "200" -or $response -eq "302") {
        Write-Host "  ✅ $($lab.Name): Online" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $($lab.Name): Offline ($response)" -ForegroundColor Yellow
    }
}

# Start server
Write-Host ""
Write-Host "Starting Orca Agent server..." -ForegroundColor Yellow
Write-Host "Location: http://localhost:8000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Example request:" -ForegroundColor Gray
Write-Host "  curl -H 'X-API-Key: $($ApiKey)' http://localhost:8000/api/health" -ForegroundColor Gray
Write-Host ""
Write-Host "Press Ctrl+C to stop" -ForegroundColor Yellow
Write-Host ""

# Run the server
python scripts\orca-agent-server.py

# Cleanup
Write-Host ""
Write-Host "Orca Agent stopped" -ForegroundColor Yellow
