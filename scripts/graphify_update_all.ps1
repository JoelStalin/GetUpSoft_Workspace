# scripts/graphify_update_all.ps1
# GetUpSoft Workspace — Regenerate ALL knowledge graphs
# Run before starting a work session to keep graphs fresh for all agents.

param(
    [switch]$Force  # Pass -Force to rebuild from scratch instead of incremental update
)

$workspace = Split-Path -Parent $PSScriptRoot
$ErrorActionPreference = "Continue"

function Update-Graph {
    param([string]$Path, [string]$Label)
    Write-Host "`n[graphify] Updating: $Label" -ForegroundColor Cyan
    Push-Location $Path
    if ($Force) {
        graphify . --exclude node_modules --exclude .next --exclude .git --exclude .venv --exclude __pycache__ --exclude temp_venv --exclude .mypy_cache --exclude .ruff_cache
    } else {
        if (Test-Path "graphify-out/graph.json") {
            graphify update .
        } else {
            graphify . --code-only --exclude node_modules --exclude .next --exclude .git --exclude .venv --exclude __pycache__ --exclude temp_venv --exclude .mypy_cache --exclude .ruff_cache
        }
    }
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  [OK] $Label" -ForegroundColor Green
    } else {
        Write-Host "  [WARN] $Label failed (exit $LASTEXITCODE)" -ForegroundColor Yellow
    }
    Pop-Location
}

Write-Host "🪨 + 🕸️  GetUpSoft — Graphify Update All" -ForegroundColor Magenta
Write-Host "Workspace: $workspace"

# Sub-projects with their own graphs
$subProjects = @(
    @{ Path = "$workspace\01_Core_Platform";                   Label = "01_Core_Platform" },
    @{ Path = "$workspace\02_Odoo_ERP";                        Label = "02_Odoo_ERP" },
    @{ Path = "$workspace\03_AI_Automation";                   Label = "03_AI_Automation" },
    @{ Path = "$workspace\04_Workers";                         Label = "04_Workers" },
    @{ Path = "$workspace\06_E_Commerce_Lux\Galantesjewelry";  Label = "Galantesjewelry" },
    @{ Path = "$workspace\07_Libraries_Tools";                 Label = "07_Libraries_Tools" },
    @{ Path = "$workspace\08_Research_Labs";                   Label = "08_Research_Labs" },
    @{ Path = "$workspace\apps";                               Label = "apps" }
)

foreach ($proj in $subProjects) {
    if (Test-Path $proj.Path) {
        Update-Graph -Path $proj.Path -Label $proj.Label
    } else {
        Write-Host "  [SKIP] $($proj.Label) — path not found" -ForegroundColor DarkGray
    }
}

Write-Host "`n✅ All graphs updated. Agents can now use graphify-out/graph.json in each project." -ForegroundColor Green
