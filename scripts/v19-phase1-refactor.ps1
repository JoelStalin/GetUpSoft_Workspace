# V19 Phase 1 Module Refactoring Script
# Refactors core financial modules with ORCA audit logging
# Modules: account, account_accountant, account_payment, account_reports
#
# Usage: .\scripts\v19-phase1-refactor.ps1 -Action setup
#        .\scripts\v19-phase1-refactor.ps1 -Action refactor
#        .\scripts\v19-phase1-refactor.ps1 -Action test
#        .\scripts\v19-phase1-refactor.ps1 -Action all

param(
    [ValidateSet('setup', 'refactor', 'test', 'all', 'info')]
    [string]$Action = 'info',
    [string]$OdooPath = 'C:\Odoo',
    [string]$WorkspacePath = 'C:\Users\yoeli\Documents\GetUpSoft_Workspace',
    [switch]$Verbose = $false
)

$ErrorActionPreference = 'Continue'
$VerbosePreference = if ($Verbose) { 'Continue' } else { 'SilentlyContinue' }

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "V19 Phase 1 Module Refactoring Orchestrator" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

# Phase 1 Modules
$Phase1Modules = @(
    @{
        id       = 'OO-F-401'
        name     = 'account'
        hours    = 4
        models   = @('account.move', 'account.journal', 'account.account', 'account.analytic')
        tests    = 8
        description = 'Chart of accounts, journal entries, moves'
    },
    @{
        id       = 'OO-F-402'
        name     = 'account_accountant'
        hours    = 3
        models   = @('account.move.line', 'account.tax', 'account.bank')
        tests    = 6
        description = 'Advanced accounting, tax computation'
    },
    @{
        id       = 'OO-F-403'
        name     = 'account_payment'
        hours    = 3.5
        models   = @('account.payment', 'account.payment.method')
        tests    = 6
        description = 'Payment processing, method tracking'
    },
    @{
        id       = 'OO-F-404'
        name     = 'account_reports'
        hours    = 2.5
        models   = @('report.*', 'account.report.*')
        tests    = 5
        description = 'Financial reports, DGII compliance'
    }
)

function Show-Info {
    Write-Host "📋 V19 Phase 1: Core Financial Modules" -ForegroundColor Green
    Write-Host ""
    Write-Host "Modules to Refactor:" -ForegroundColor Yellow

    $Phase1Modules | ForEach-Object {
        Write-Host "  [$($_.id)] $($_.name) - $($_.hours)h"
        Write-Host "    Models: $($_.models -join ', ')"
        Write-Host "    Tests: $($_.tests) test cases"
        Write-Host "    Desc: $($_.description)"
        Write-Host ""
    }

    Write-Host "📊 Phase 1 Summary:" -ForegroundColor Cyan
    $totalHours = ($Phase1Modules | Measure-Object -Property hours -Sum).Sum
    $totalTests = ($Phase1Modules | Measure-Object -Property tests -Sum).Sum
    Write-Host "  Total Time: $totalHours hours"
    Write-Host "  Total Tests: $totalTests test cases"
    Write-Host "  Estimated Duration: 1-2 sessions"
    Write-Host ""

    Write-Host "✅ Requirements:" -ForegroundColor Yellow
    Write-Host "  1. Odoo 19 development environment running"
    Write-Host "  2. base_orca_integration module installed"
    Write-Host "  3. Database access (read/write)"
    Write-Host "  4. Python test runner (pytest or unittest)"
    Write-Host ""
}

function Test-Environment {
    Write-Host "🔍 Checking environment..." -ForegroundColor Yellow

    $checks = @{
        'Odoo Path Exists' = (Test-Path $OdooPath)
        'Workspace Path Exists' = (Test-Path $WorkspacePath)
        'V19 Modules Path Exists' = (Test-Path "$WorkspacePath\02_Odoo_ERP\Odoo_Consolidated_Library\v19\Modules")
        'Python Available' = (Get-Command python -ErrorAction SilentlyContinue) -ne $null
        'Git Available' = (Get-Command git -ErrorAction SilentlyContinue) -ne $null
    }

    $checks.GetEnumerator() | ForEach-Object {
        $status = if ($_.Value) { '✅' } else { '❌' }
        Write-Host "  $status $($_.Key)"
    }

    Write-Host ""
    $allPass = $checks.Values | Where-Object { $_ -eq $false } | Measure-Object | Select-Object -ExpandProperty Count
    return $allPass -eq 0
}

function Show-SetupInstructions {
    Write-Host "🚀 Setup Instructions for Phase 1" -ForegroundColor Green
    Write-Host ""

    Write-Host "1️⃣  Install base_orca_integration module:" -ForegroundColor Yellow
    Write-Host '   cd "$WorkspacePath"' -ForegroundColor Gray
    Write-Host '   .\scripts\setup_odoo_orca_modules.ps1 -Action copy' -ForegroundColor Gray
    Write-Host ""

    Write-Host "2️⃣  Verify Odoo database connection:" -ForegroundColor Yellow
    Write-Host "   python -c 'import odoo; print(odoo.__version__)'" -ForegroundColor Gray
    Write-Host ""

    Write-Host "3️⃣  Create refactoring workspace:" -ForegroundColor Yellow
    Write-Host '   mkdir "$WorkspacePath\task-ledger\v19-phase1-work"' -ForegroundColor Gray
    Write-Host ""

    Write-Host "4️⃣  Begin with OO-F-401 (account module):" -ForegroundColor Yellow
    Write-Host "   - Copy account module to local dev environment"
    Write-Host "   - Add OrcaAuditMixin to tracked models"
    Write-Host "   - Create account_orca_log model"
    Write-Host "   - Add 8 test cases"
    Write-Host "   - Update manifest with author: 'getupsoft'"
    Write-Host ""

    Write-Host "5️⃣  Create PR with all 4 modules:" -ForegroundColor Yellow
    Write-Host "   - Push to feature/orca-v19-phase1-financial"
    Write-Host "   - Reference OO-F-401..404 in commit messages"
    Write-Host "   - Include ORCA integration checklist"
    Write-Host ""
}

function Show-RefactorChecklist {
    Write-Host "📋 Refactoring Checklist (Per Module):" -ForegroundColor Green
    Write-Host ""

    $checklist = @(
        "[ ] Copy module to local environment",
        "[ ] Create <module>_orca.py with OrcaLog model",
        "[ ] Apply OrcaAuditMixin to tracked models",
        "[ ] Define _orca_tracked_fields for each model",
        "[ ] Create security/ir.model.access.csv entries",
        "[ ] Create views/<module>_orca_log_views.xml",
        "[ ] Update __manifest__.py (author: 'getupsoft')",
        "[ ] Create tests/test_orca_<module>.py",
        "[ ] Verify manifest syntax",
        "[ ] Test create/write/unlink operations",
        "[ ] Verify logs are created",
        "[ ] Test access control (read-only for accountants)",
        "[ ] Update README with ORCA section",
        "[ ] Add backlog ID to commits (OO-F-40X)",
        "[ ] All tests PASSING"
    )

    $checklist | ForEach-Object {
        Write-Host "  $_" -ForegroundColor Gray
    }
    Write-Host ""
}

function Show-Timeline {
    Write-Host "⏱️  Estimated Timeline:" -ForegroundColor Green
    Write-Host ""
    Write-Host "  Module              | Est. Hours | Tasks" -ForegroundColor Yellow
    Write-Host "  ────────────────────┼────────────┼──────────────" -ForegroundColor Gray

    $Phase1Modules | ForEach-Object {
        $tasks = "Copy, Mixin, Logs, Tests, Security"
        Write-Host "  $($_.name.PadRight(18)) | $($_.hours.ToString().PadRight(10)) | $tasks" -ForegroundColor Gray
    }

    Write-Host ""
    Write-Host "  Total: 13 hours (~2 sessions)" -ForegroundColor Cyan
    Write-Host ""
}

function Invoke-Setup {
    Write-Host "⚙️  Setting up Phase 1 environment..." -ForegroundColor Yellow
    Write-Host ""

    # Verify environment
    if (-not (Test-Environment)) {
        Write-Host "❌ Environment check failed. Please fix issues above." -ForegroundColor Red
        return $false
    }

    Write-Host "✅ Environment check passed" -ForegroundColor Green
    Write-Host ""

    # Create workspace directories
    $v19WorkDir = "$WorkspacePath\task-ledger\v19-phase1-work"
    if (-not (Test-Path $v19WorkDir)) {
        New-Item -ItemType Directory -Path $v19WorkDir -Force | Out-Null
        Write-Host "✅ Created workspace: $v19WorkDir" -ForegroundColor Green
    }

    # Create module templates
    $moduleTemplates = @(
        'account', 'account_accountant', 'account_payment', 'account_reports'
    )

    $moduleTemplates | ForEach-Object {
        $templateDir = "$v19WorkDir\$_-template"
        if (-not (Test-Path $templateDir)) {
            New-Item -ItemType Directory -Path $templateDir -Force | Out-Null
            Write-Host "✅ Created template dir: $templateDir" -ForegroundColor Green
        }
    }

    Write-Host ""
    Write-Host "✅ Setup complete!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "  1. Run: .\scripts\v19-phase1-refactor.ps1 -Action refactor" -ForegroundColor Gray
    Write-Host "  2. Follow the refactoring checklist" -ForegroundColor Gray
    Write-Host ""

    return $true
}

function Invoke-TestTemplate {
    Write-Host "🧪 Template Test Instructions" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Create test file: tests/test_orca_<module>.py" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Example structure:" -ForegroundColor Gray
    Write-Host @"
import unittest
from odoo.tests import TransactionCase

class TestAccountOrcaLogging(TransactionCase):
    '''Test ORCA audit logging for account module'''

    def setUp(self):
        super().setUp()
        self.account = self.env['account.move']
        self.orca_log = self.env['account.orca.log']

    def test_create_generates_log(self):
        '''Test: Creating move generates ORCA log'''
        move = self.account.create({'state': 'draft'})
        log = self.orca_log.search([('record_id', '=', move.id)])
        self.assertEqual(len(log), 1)
        self.assertEqual(log.action, 'create')

    def test_write_captures_before_after(self):
        '''Test: Write operation captures before/after values'''
        move = self.account.create({'ref': 'OLD'})
        move.write({'ref': 'NEW'})
        log = self.orca_log.search([('record_id', '=', move.id), ('action', '=', 'write')])
        self.assertIn('OLD', log.before_values)
        self.assertIn('NEW', log.after_values)

    def test_unlink_generates_log(self):
        '''Test: Delete operation generates log'''
        move = self.account.create({})
        move.unlink()
        log = self.orca_log.search([('action', '=', 'unlink')])
        self.assertGreater(len(log), 0)

    def test_accountant_read_only(self):
        '''Test: Accountants can only read ORCA logs'''
        accountant = self.env['res.users'].search([('name', '=', 'Accountant')])
        log = self.orca_log.sudo(accountant)
        # Verify read access exists, write access denied
        # (test depends on security/ir.model.access.csv configuration)

if __name__ == '__main__':
    unittest.main()
"@ -ForegroundColor Gray

    Write-Host ""
}

# Main logic
switch ($Action) {
    'info' {
        Show-Info
        Show-Timeline
        Write-Host "📖 For detailed instructions, see:" -ForegroundColor Yellow
        Write-Host "   - task-ledger/V19_COMPLETE_MODULE_REFACTORING_BACKLOG.md" -ForegroundColor Cyan
        Write-Host "   - task-ledger/V19_ODOO_MODULE_SETUP_GUIDE.md" -ForegroundColor Cyan
        Write-Host ""
    }
    'setup' {
        Show-Info
        if (Test-Environment) {
            Invoke-Setup
        } else {
            Write-Host "❌ Environment check failed" -ForegroundColor Red
        }
    }
    'refactor' {
        Show-RefactorChecklist
        Show-SetupInstructions
    }
    'test' {
        Invoke-TestTemplate
    }
    'all' {
        Show-Info
        Show-SetupInstructions
        Show-RefactorChecklist
        Show-Timeline
        Invoke-TestTemplate
    }
}

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "Ready to begin V19 Phase 1 refactoring" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
