# ORCA 24/7 Mode Status Checker (PowerShell)
# Verifies all components are ready for continuous operation

$SCRIPT_DIR = Split-Path -Parent $MyInvocation.MyCommand.Path
$ORCA_DIR = Split-Path -Parent $SCRIPT_DIR

# Status tracking
$CHECKS_PASSED = 0
$CHECKS_FAILED = 0
$CHECKS_TOTAL = 0

function Check-Component {
    param(
        [string]$Name,
        [bool]$Condition
    )

    $script:CHECKS_TOTAL += 1

    if ($Condition) {
        Write-Host "✅ $Name" -ForegroundColor Green
        $script:CHECKS_PASSED += 1
    } else {
        Write-Host "❌ $Name" -ForegroundColor Red
        $script:CHECKS_FAILED += 1
    }
}

function Print-Section {
    param([string]$Title)
    Write-Host ""
    Write-Host "═══════════════════════════════════════" -ForegroundColor Blue
    Write-Host $Title -ForegroundColor Blue
    Write-Host "═══════════════════════════════════════" -ForegroundColor Blue
}

# Main checks
Print-Section "🔍 ORCA 24/7 Mode Status Verification"

Write-Host "Checking system configuration..." -ForegroundColor Yellow

# 1. Config file
Check-Component "24-7 Config file exists" $(Test-Path "$SCRIPT_DIR\24-7-config.json")

# 2. Orchestrator script
Check-Component "Orchestrator script exists" $(Test-Path "$SCRIPT_DIR\orchestrator.sh")

# 3. Plugin system
Check-Component "Plugin loader exists" $(Test-Path "$SCRIPT_DIR\plugins\plugin_loader.sh")
Check-Component "Enabled plugins directory" $(Test-Path "$SCRIPT_DIR\plugins\enabled" -PathType Container)

# 4. Enabled plugins
Write-Host ""
Write-Host "Checking enabled plugins..." -ForegroundColor Yellow
$EnabledPlugins = @(Get-ChildItem "$SCRIPT_DIR\plugins\enabled" -Filter "*.sh" -ErrorAction SilentlyContinue)
$EnabledCount = $EnabledPlugins.Count
Check-Component "At least 1 plugin enabled" $($EnabledCount -gt 0)

if ($EnabledCount -gt 0) {
    Write-Host "  Enabled plugins:" -ForegroundColor Cyan
    foreach ($plugin in $EnabledPlugins) {
        Write-Host "    - $($plugin.Name)" -ForegroundColor Cyan
    }
}

# 5. Communication channels
Write-Host ""
Write-Host "Checking communication setup..." -ForegroundColor Yellow
Check-Component "Logs directory" $(Test-Path "$SCRIPT_DIR\logs" -PathType Container)

# 6. Required tools
Write-Host ""
Write-Host "Checking required tools..." -ForegroundColor Yellow
Check-Component "git available" $(Get-Command git -ErrorAction SilentlyContinue)
Check-Component "npm available" $(Get-Command npm -ErrorAction SilentlyContinue)
Check-Component "node available" $(Get-Command node -ErrorAction SilentlyContinue)

# 7. ORCA specific
Write-Host ""
Write-Host "Checking ORCA setup..." -ForegroundColor Yellow
Check-Component "ORCA main directory exists" $(Test-Path $ORCA_DIR)
Check-Component "Workflow editor src exists" $(Test-Path "$ORCA_DIR\src" -PathType Container)

$TestFiles = @(Get-ChildItem $ORCA_DIR -Filter "test-*.js" -ErrorAction SilentlyContinue | Measure-Object).Count
Check-Component "Test files present" $($TestFiles -gt 0)

# 8. Compliance rules
Write-Host ""
Write-Host "Checking compliance rules..." -ForegroundColor Yellow
$ConfigContent = Get-Content "$SCRIPT_DIR\24-7-config.json" -Raw -ErrorAction SilentlyContinue
Check-Component "Automated testing MANDATORY" $($ConfigContent -match '"enforceTesting":\s*true')
Check-Component "Accessibility MANDATORY" $($ConfigContent -match '"enforceAccessibility":\s*true')
Check-Component "Code review MANDATORY" $($ConfigContent -match '"enforceCodeReview":\s*true')

# Print summary
Print-Section "📊 Summary"

$PERCENTAGE = if ($CHECKS_TOTAL -gt 0) { [int]($CHECKS_PASSED * 100 / $CHECKS_TOTAL) } else { 0 }

Write-Host "Total Checks: $CHECKS_TOTAL"
Write-Host "  ✅ Passed: $CHECKS_PASSED" -ForegroundColor Green
if ($CHECKS_FAILED -gt 0) {
    Write-Host "  ❌ Failed: $CHECKS_FAILED" -ForegroundColor Red
} else {
    Write-Host "  ❌ Failed: 0" -ForegroundColor Green
}
Write-Host "Success Rate: ${PERCENTAGE}%"

Write-Host ""
if ($CHECKS_FAILED -eq 0) {
    Write-Host "🎉 All checks passed! ORCA is ready for 24/7 mode." -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "  1. Start orchestrator: .\orchestrator.sh --dry-run" -ForegroundColor Cyan
    Write-Host "  2. Schedule with cron/task scheduler" -ForegroundColor Cyan
    Write-Host "  3. Monitor: tail -f .agents/logs/orchestrator.log" -ForegroundColor Cyan
} else {
    Write-Host "⚠️  Some checks failed. Please review the errors above." -ForegroundColor Red
}

Write-Host ""
Write-Host "📋 Configuration Details:" -ForegroundColor Blue
Write-Host "  Config: $SCRIPT_DIR\24-7-config.json" -ForegroundColor Cyan
Write-Host "  Plugins: $SCRIPT_DIR\plugins" -ForegroundColor Cyan
Write-Host "  Logs: $SCRIPT_DIR\logs" -ForegroundColor Cyan
Write-Host "  Reports: $SCRIPT_DIR\reports" -ForegroundColor Cyan
