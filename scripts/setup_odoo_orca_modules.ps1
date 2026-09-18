# Setup Odoo ORCA Modules - Windows PowerShell Version
# Purpose: Copy/symlink v19 ORCA modules to Odoo addons directory
# Usage: .\setup_odoo_orca_modules.ps1 -Action copy

param(
    [string]$Action = "copy",
    [string]$OdooConf = "C:\Odoo\config\odoo.conf"
)

# Configuration
$RepoModules = "C:\Users\yoeli\Documents\GetUpSoft_Workspace\02_Odoo_ERP\Odoo_Consolidated_Library\v19\Modules"
$Modules = @(
    "base_orca_integration",
    "account_extended",
    "asset_extended",
    "bank_extended",
    "invoice_extended",
    "l10n_do_accounting",
    "l10n_do_accounting_report",
    "l10n_do_pos",
    "l10n_do_rnc_search",
    "payment_extended",
    "pos_extended",
    "sale_extended",
    "stock_extended"
)

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "Odoo ORCA Modules Setup (Windows)" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Repository modules path: $RepoModules" -ForegroundColor Yellow
Write-Host "Action: $Action" -ForegroundColor Yellow
Write-Host ""

# Function to detect Odoo
function Detect-Odoo {
    Write-Host "🔍 Detecting Odoo installation..." -ForegroundColor Yellow

    # Check if odoo-bin exists
    $OdooBin = where.exe odoo-bin 2>$null
    if ($OdooBin) {
        Write-Host "✅ odoo-bin found: $OdooBin" -ForegroundColor Green
    }
    else {
        Write-Host "⚠️  odoo-bin not found in PATH" -ForegroundColor Yellow
    }

    # Try to detect addons path
    $AddonsPath = $null

    # Check common Windows paths
    $CommonPaths = @(
        "C:\Odoo\addons",
        "C:\Odoo19\addons",
        "C:\Program Files\Odoo\addons",
        "C:\Program Files\Odoo 19\addons"
    )

    foreach ($path in $CommonPaths) {
        if (Test-Path $path) {
            Write-Host "✅ Found addons directory: $path" -ForegroundColor Green
            return $path
        }
    }

    Write-Host "❌ Could not detect addons path automatically" -ForegroundColor Red
    Write-Host "Please specify your Odoo addons directory path"
    return $null
}

# Function to copy modules
function Copy-Modules {
    param($AddonsPath)

    if (-not (Test-Path $RepoModules)) {
        Write-Host "❌ Repository modules not found at: $RepoModules" -ForegroundColor Red
        return $false
    }

    Write-Host ""
    Write-Host "📋 Copying modules to: $AddonsPath" -ForegroundColor Yellow
    Write-Host ""

    $copied = 0
    foreach ($module in $Modules) {
        $src = Join-Path $RepoModules $module
        $dst = Join-Path $AddonsPath $module

        if (-not (Test-Path $src)) {
            Write-Host "❌ Module not found: $module" -ForegroundColor Red
            continue
        }

        if (Test-Path $dst) {
            Write-Host "⚠️  Module already exists: $module (backing up)" -ForegroundColor Yellow
            $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
            Rename-Item -Path $dst -NewName "$module.backup.$timestamp" -Force
        }

        Copy-Item -Path $src -Destination $dst -Recurse -Force
        Write-Host "✅ Copied: $module" -ForegroundColor Green
        $copied++
    }

    Write-Host ""
    Write-Host "✅ Copied $copied modules successfully" -ForegroundColor Green
    return $true
}

# Function to create symlinks
function Create-Symlinks {
    param($AddonsPath)

    if (-not (Test-Path $RepoModules)) {
        Write-Host "❌ Repository modules not found at: $RepoModules" -ForegroundColor Red
        return $false
    }

    Write-Host ""
    Write-Host "🔗 Creating symlinks in: $AddonsPath" -ForegroundColor Yellow
    Write-Host ""

    $linked = 0
    foreach ($module in $Modules) {
        $src = Join-Path $RepoModules $module
        $dst = Join-Path $AddonsPath $module

        if (-not (Test-Path $src)) {
            Write-Host "❌ Module not found: $module" -ForegroundColor Red
            continue
        }

        if (Test-Path $dst) {
            Write-Host "⚠️  Path already exists: $module" -ForegroundColor Yellow
            continue
        }

        # Create symlink (requires admin)
        try {
            New-Item -ItemType SymbolicLink -Path $dst -Target $src -Force | Out-Null
            Write-Host "✅ Symlinked: $module" -ForegroundColor Green
            $linked++
        }
        catch {
            Write-Host "❌ Failed to create symlink for $module (may require admin)" -ForegroundColor Red
        }
    }

    Write-Host ""
    Write-Host "✅ Created $linked symlinks" -ForegroundColor Green
    return $true
}

# Main logic
$AddonsPath = Detect-Odoo

if (-not $AddonsPath) {
    Write-Host ""
    Write-Host "Please provide your Odoo addons path:"
    Write-Host ".\setup_odoo_orca_modules.ps1 -Action copy -OdooConf 'C:\Your\Odoo\Path\addons'"
    exit 1
}

switch ($Action.ToLower()) {
    "copy" {
        Copy-Modules -AddonsPath $AddonsPath
    }
    "symlink" {
        Create-Symlinks -AddonsPath $AddonsPath
    }
    default {
        Write-Host "Usage: .\setup_odoo_orca_modules.ps1 -Action [copy|symlink]"
        exit 1
    }
}

Write-Host ""
Write-Host "✅ Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Restart Odoo service"
Write-Host "2. Open http://localhost:8069"
Write-Host "3. Go to Modules and search for 'orca'"
Write-Host "4. All 13 modules should appear"
Write-Host ""
