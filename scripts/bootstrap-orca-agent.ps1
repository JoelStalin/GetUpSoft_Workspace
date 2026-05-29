# GetUpSoft Orca Agent Bootstrap Script
# Initializes agent with root credentials and generates API key

param(
    [string]$RootPassword = ""
)

Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   🤖 GetUpSoft Orca Agent Bootstrap                       ║" -ForegroundColor Cyan
Write-Host "║   Initial Configuration & Setup                           ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Ensure .claude directory exists
$claudeDir = ".\.claude"
if (-not (Test-Path $claudeDir)) {
    New-Item -ItemType Directory -Path $claudeDir -Force | Out-Null
    Write-Host "✅ Created .claude directory" -ForegroundColor Green
}

# Check if already configured
$configPath = "$claudeDir\orca-agent-config.json"

if (Test-Path $configPath) {
    Write-Host ""
    Write-Host "ℹ️  Orca Agent is already configured" -ForegroundColor Yellow
    Write-Host ""

    # Show current config
    try {
        $config = Get-Content $configPath | ConvertFrom-Json
        Write-Host "Configuration details:" -ForegroundColor Cyan
        Write-Host "  Created: $($config.created_at)" -ForegroundColor Gray
        Write-Host "  Root User: $($config.root_user)" -ForegroundColor Gray
        Write-Host "  API Key: $($config.api_key.Substring(0, 10))..." -ForegroundColor Gray
        Write-Host ""
    } catch {
        Write-Host "Could not read configuration file" -ForegroundColor Yellow
    }

    $reconfigure = Read-Host "Do you want to reconfigure? (y/n)"
    if ($reconfigure -ne 'y' -and $reconfigure -ne 'Y') {
        Write-Host ""
        Write-Host "To start Orca Agent, run:" -ForegroundColor Cyan
        Write-Host "  .\scripts\start-orca-agent.ps1" -ForegroundColor Gray
        Write-Host ""
        exit 0
    }

    Remove-Item $configPath -Force
    Write-Host "✅ Configuration reset" -ForegroundColor Green
    Write-Host ""
}

# Get root password
Write-Host "Step 1: Set Root Password" -ForegroundColor Cyan
Write-Host "────────────────────────────────────────" -ForegroundColor Gray

if (-not $RootPassword) {
    Write-Host "Enter a strong password for the root user:" -ForegroundColor White
    Write-Host "  • Minimum 8 characters" -ForegroundColor Gray
    Write-Host "  • Mix of uppercase, lowercase, numbers, symbols" -ForegroundColor Gray
    Write-Host ""

    $attempts = 0
    while ($attempts -lt 3) {
        $secure1 = Read-Host "Root Password" -AsSecureString
        $secure2 = Read-Host "Confirm Password" -AsSecureString

        $pass1 = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto(
            [System.Runtime.InteropServices.Marshal]::SecureStringToCoTaskMemUnicode($secure1)
        )
        $pass2 = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto(
            [System.Runtime.InteropServices.Marshal]::SecureStringToCoTaskMemUnicode($secure2)
        )

        if ($pass1 -eq $pass2 -and $pass1.Length -ge 8) {
            $RootPassword = $pass1
            break
        } else {
            $attempts++
            if ($pass1.Length -lt 8) {
                Write-Host "❌ Password too short (min 8 characters)" -ForegroundColor Red
            } else {
                Write-Host "❌ Passwords don't match" -ForegroundColor Red
            }

            if ($attempts -lt 3) {
                Write-Host "Try again ($attempts/3)" -ForegroundColor Yellow
            }
        }
    }

    if ($attempts -eq 3) {
        Write-Host "❌ Bootstrap failed: Too many attempts" -ForegroundColor Red
        exit 1
    }
}

# Hash password (simple hash for security)
$hash = [System.Security.Cryptography.SHA256]::Create()
$bytes = [System.Text.Encoding]::UTF8.GetBytes($RootPassword)
$hashBytes = $hash.ComputeHash($bytes)
$passwordHash = [Convert]::ToBase64String($hashBytes)

# Generate API key
Write-Host ""
Write-Host "Step 2: Generate API Key" -ForegroundColor Cyan
Write-Host "────────────────────────────────────────" -ForegroundColor Gray

$random = Get-Random -Minimum 100000000 -Maximum 999999999
$ApiKey = "orca-agent-key-$random"

Write-Host "✅ API Key generated" -ForegroundColor Green

# Create configuration object
Write-Host ""
Write-Host "Step 3: Save Configuration" -ForegroundColor Cyan
Write-Host "────────────────────────────────────────" -ForegroundColor Gray

$config = @{
    bootstrapped = $true
    version = "1.0.0"
    root_user = "root"
    password_hash = $passwordHash
    api_key = $ApiKey
    created_at = (Get-Date).ToString("o")
    modified_at = (Get-Date).ToString("o")
}

# Save configuration
try {
    $config | ConvertTo-Json | Set-Content $configPath
    Write-Host "✅ Configuration saved to: $configPath" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to save configuration: $_" -ForegroundColor Red
    exit 1
}

# Success
Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║   ✅ Bootstrap Complete!                                  ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

Write-Host "Your API Key:" -ForegroundColor Cyan
Write-Host ""
Write-Host "  $ApiKey" -ForegroundColor Yellow
Write-Host ""
Write-Host "⚠️  Save this API Key! You'll need it to:" -ForegroundColor Yellow
Write-Host "  • Authenticate with Orca Agent" -ForegroundColor Gray
Write-Host "  • Access from code.getupsoft.com" -ForegroundColor Gray
Write-Host "  • Configure ORCA dashboard" -ForegroundColor Gray
Write-Host ""

Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Set environment variable:" -ForegroundColor White
Write-Host "   `$env:ORCA_AGENT_API_KEY = '$ApiKey'" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Start Orca Agent Server:" -ForegroundColor White
Write-Host "   .\scripts\start-orca-agent.ps1" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Start Docker Labs:" -ForegroundColor White
Write-Host "   docker-compose up -d" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Run Triangular Tests:" -ForegroundColor White
Write-Host "   python scripts/test-triangular-communication.py '$ApiKey'" -ForegroundColor Gray
Write-Host ""
Write-Host "5. Open ORCA Dashboard:" -ForegroundColor White
Write-Host "   http://localhost:3000" -ForegroundColor Gray
Write-Host ""

Write-Host "Questions? Check:" -ForegroundColor Cyan
Write-Host "  • ORCA_AGENT_BOOTSTRAP_UI.md" -ForegroundColor Gray
Write-Host "  • ORCA_AGENT_LOCAL_ACCESS.md" -ForegroundColor Gray
Write-Host ""
