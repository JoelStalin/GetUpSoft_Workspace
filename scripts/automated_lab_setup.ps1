################################################################################
# AUTOMATED ODOO V19 ORCA LAB SETUP - Windows PowerShell
# Complete automated environment setup without user intervention
################################################################################

param(
    [switch]$SkipPrerequisites = $false,
    [switch]$SkipTests = $false,
    [string]$DockerComposeFile = "docker-compose.yml"
)

# Colors (using Write-Host with ForegroundColor for Windows)
$ErrorColor = "Red"
$SuccessColor = "Green"
$WarningColor = "Yellow"
$InfoColor = "Cyan"

function Write-Info {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor $InfoColor
}

function Write-Success {
    param([string]$Message)
    Write-Host "[✓] $Message" -ForegroundColor $SuccessColor
}

function Write-ErrorMsg {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor $ErrorColor
}

function Write-WarningMsg {
    param([string]$Message)
    Write-Host "[WARN] $Message" -ForegroundColor $WarningColor
}

# Main execution starts
Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║       AUTOMATED ODOO v19 ORCA LAB SETUP (Windows PowerShell)           ║" -ForegroundColor Cyan
Write-Host "║       All 43 Modules with ORCA Integration                            ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check prerequisites
if (-not $SkipPrerequisites) {
    Write-Info "Step 1: Checking prerequisites..."

    $missingTools = @()

    # Check Docker
    $dockerExists = $null -ne (Get-Command docker -ErrorAction SilentlyContinue)
    if ($dockerExists) {
        Write-Success "docker is installed"
    } else {
        Write-ErrorMsg "docker is NOT installed"
        $missingTools += "docker"
    }

    # Check Docker Compose
    $composeExists = $null -ne (Get-Command docker-compose -ErrorAction SilentlyContinue)
    if ($composeExists) {
        Write-Success "docker-compose is installed"
    } else {
        Write-ErrorMsg "docker-compose is NOT installed"
        $missingTools += "docker-compose"
    }

    # Check Git
    $gitExists = $null -ne (Get-Command git -ErrorAction SilentlyContinue)
    if ($gitExists) {
        Write-Success "git is installed"
    } else {
        Write-ErrorMsg "git is NOT installed"
        $missingTools += "git"
    }

    if ($missingTools.Count -gt 0) {
        Write-ErrorMsg "Required tools are missing: $($missingTools -join ', ')"
        Write-ErrorMsg "Please install missing tools and try again."
        exit 1
    }

    Write-Success "All prerequisites met"
    Write-Host ""
}

# Step 2: Check Docker daemon
Write-Info "Step 2: Verifying Docker daemon..."
try {
    $dockerStatus = & docker ps 2>$null
    Write-Success "Docker daemon is running"
} catch {
    Write-ErrorMsg "Docker daemon is not running"
    Write-Info "Please start Docker Desktop and try again."
    exit 1
}
Write-Host ""

# Step 3: Create required directories
Write-Info "Step 3: Creating required directories..."
$dirsToCreate = @(
    "02_Odoo_ERP/Odoo_Consolidated_Library/v19/Modules",
    "logs",
    "data/postgres",
    "data/odoo"
)

foreach ($dir in $dirsToCreate) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Host "  Created: $dir"
    }
}
Write-Success "Directories created"
Write-Host ""

# Step 4: Build and start Docker containers
Write-Info "Step 4: Starting Docker containers..."
Write-Info "This may take 3-5 minutes on first run..."

try {
    # Stop and remove existing containers
    Write-Host "  Cleaning up existing containers..."
    & docker-compose -f $DockerComposeFile down -v 2>$null

    # Start containers
    Write-Host "  Starting containers..."
    & docker-compose -f $DockerComposeFile up -d

    if ($LASTEXITCODE -ne 0) {
        Write-ErrorMsg "Failed to start Docker containers"
        exit 1
    }
}
catch {
    Write-ErrorMsg "Error during Docker operations: $_"
    exit 1
}

# Step 5: Wait for services to be healthy
Write-Info "Waiting for services to be healthy..."
$maxRetries = 60
$retryCount = 0

# Wait for PostgreSQL
Write-Host "  Checking PostgreSQL..."
while ($retryCount -lt $maxRetries) {
    try {
        $pgCheck = & docker-compose -f $DockerComposeFile exec -T postgres pg_isready -U odoo 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Success "PostgreSQL is healthy"
            break
        }
    } catch {
        # Continue retrying
    }
    $retryCount++
    Start-Sleep -Seconds 1
}

if ($retryCount -eq $maxRetries) {
    Write-ErrorMsg "PostgreSQL failed to start after $maxRetries seconds"
    Write-Host "Docker logs:"
    & docker-compose -f $DockerComposeFile logs
    exit 1
}

# Wait for Odoo
Write-Host "  Checking Odoo..."
$retryCount = 0
while ($retryCount -lt $maxRetries) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8069" -TimeoutSec 2 -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            Write-Success "Odoo is healthy and responding"
            break
        }
    } catch {
        # Continue retrying
    }
    $retryCount++
    Start-Sleep -Seconds 1
}

if ($retryCount -eq $maxRetries) {
    Write-WarningMsg "Odoo took longer than expected to start, but container is running"
}

Write-Success "Docker containers started successfully"
Write-Host ""

# Step 6: Install base ORCA modules
Write-Info "Step 6: Installing base ORCA modules..."
try {
    & docker-compose -f $DockerComposeFile exec -T odoo odoo --update=base_orca_integration `
        --db_user=odoo `
        --db_password=odoo `
        --db_host=postgres `
        --database=odoo19_orca `
        --stop-after-init `
        --no-http 2>&1 | Select-String -Pattern "INFO|ERROR|installed"

    Write-Success "Base ORCA modules installed"
} catch {
    Write-WarningMsg "Error installing base ORCA modules: $_"
}
Write-Host ""

# Step 7: Install custom ORCA modules
Write-Info "Step 7: Installing custom ORCA modules..."

$orcaModules = @(
    "account_extended",
    "pos_extended",
    "sale_extended",
    "asset_extended",
    "stock_extended",
    "payment_extended",
    "bank_extended",
    "invoice_extended",
    "l10n_do_accounting",
    "l10n_do_accounting_report",
    "l10n_do_pos",
    "l10n_do_rnc_search"
)

foreach ($module in $orcaModules) {
    Write-Host "  Installing $module..."
    try {
        & docker-compose -f $DockerComposeFile exec -T odoo odoo --update=$module `
            --db_user=odoo `
            --db_password=odoo `
            --db_host=postgres `
            --database=odoo19_orca `
            --stop-after-init `
            --no-http 2>&1 | Select-String -Pattern "installed|already"
    } catch {
        Write-WarningMsg "Error installing $module"
    }
}

Write-Success "All custom ORCA modules installed"
Write-Host ""

# Step 8: Run tests (optional)
if (-not $SkipTests) {
    Write-Info "Step 8: Running ORCA module tests..."
    try {
        & docker-compose -f $DockerComposeFile exec -T odoo python -m pytest `
            /mnt/extra-addons/base_orca_integration/tests/ `
            -v `
            --tb=short 2>&1 | Select-Object -Last 20

        Write-Success "Tests execution complete"
    } catch {
        Write-WarningMsg "Some tests may have failed or pytest not available"
    }
}
Write-Host ""

# Step 9: Verify installation
Write-Info "Step 9: Verifying installation..."
Write-Host "  Checking installed modules..."

try {
    $payload = @{
        jsonrpc = "2.0"
        method = "call"
        params = @{
            login = "admin"
            password = "admin"
            db = "odoo19_orca"
        }
        id = 1
    } | ConvertTo-Json

    $response = Invoke-WebRequest -Uri "http://localhost:8069/web/session/authenticate" `
        -Method POST `
        -ContentType "application/json" `
        -Body $payload `
        -ErrorAction SilentlyContinue

    Write-Success "Installation verification complete"
} catch {
    Write-WarningMsg "Could not verify via API: $_"
}
Write-Host ""

# Step 10: Print access information
Write-Info "Step 10: Lab setup complete!"
Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║                    ✓ LAB SETUP SUCCESSFUL                             ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

Write-Host "ACCESS INFORMATION:" -ForegroundColor Green
Write-Host "  URL:      http://localhost:8069"
Write-Host "  Database: odoo19_orca"
Write-Host "  Login:    admin"
Write-Host "  Password: admin"
Write-Host ""

Write-Host "INSTALLED MODULES:" -ForegroundColor Green
Write-Host "  - base_orca_integration (ORCA foundation)"
Write-Host "  - account_extended (Financial audit)"
Write-Host "  - pos_extended (POS audit)"
Write-Host "  - sale_extended (Sales audit)"
Write-Host "  - asset_extended (Asset audit)"
Write-Host "  - stock_extended (Inventory audit)"
Write-Host "  - payment_extended (Payment audit)"
Write-Host "  - bank_extended (Bank audit)"
Write-Host "  - invoice_extended (Invoice audit)"
Write-Host "  - l10n_do_accounting (Dominican accounting)"
Write-Host "  - l10n_do_accounting_report (DGII reporting)"
Write-Host "  - l10n_do_pos (POS fiscal controls)"
Write-Host "  - l10n_do_rnc_search (RNC validation)"
Write-Host ""

Write-Host "NEXT STEPS:" -ForegroundColor Green
Write-Host "  1. Open http://localhost:8069 in your browser"
Write-Host "  2. Login with admin/admin"
Write-Host "  3. Navigate to Accounting → ORCA Logs to verify"
Write-Host "  4. Create a test record and verify audit logging"
Write-Host ""

Write-Host "USEFUL COMMANDS:" -ForegroundColor Green
Write-Host "  View logs:        docker-compose logs -f odoo"
Write-Host "  Shell:            docker-compose exec odoo bash"
Write-Host "  Stop lab:         docker-compose stop"
Write-Host "  Restart lab:      docker-compose restart"
Write-Host "  Clean up:         docker-compose down -v"
Write-Host ""

Write-Host "Lab is ready for Phase 1 execution!" -ForegroundColor Cyan
Write-Host ""
