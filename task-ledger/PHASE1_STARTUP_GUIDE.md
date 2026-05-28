# Phase 1 Startup Guide - After Lab Validation

**Status:** READY FOR PHASE 1 EXECUTION  
**Duration:** 1 week (13 hours)  
**Modules:** 4 core financial (account, account_accountant, account_payment, account_reports)  
**Tests:** 25+ unit tests required  

---

## Prerequisites Checklist

Before starting Phase 1, verify all prerequisites are met:

### ✅ Pre-Phase 1 Checklist

- [ ] **Lab running:** Odoo accessible at http://localhost:8069
- [ ] **Admin login works:** admin/admin credentials accepted
- [ ] **ORCA logs visible:** Navigate to Accounting → ORCA Logs (should show entries)
- [ ] **Database ready:** odoo19_orca database initialized with 13 modules
- [ ] **Code templates available:** Review `PHASE1_CODE_TEMPLATES.md`
- [ ] **Checklist ready:** `PHASE1_QUICK_START_CHECKLIST.md` open and reviewed
- [ ] **Working directory clean:** No uncommitted changes in git
- [ ] **Backup created:** Optional, recommended for lab data

### Required Files Verification

```bash
# Verify all required files exist
ls task-ledger/PHASE1_QUICK_START_CHECKLIST.md          # ✅ Exists
ls task-ledger/PHASE1_CODE_TEMPLATES.md                 # ✅ Exists
ls task-ledger/PHASE_COMPLETION_TEMPLATE.md             # ✅ Exists
ls docker-compose.yml                                     # ✅ Exists
ls scripts/automated_lab_setup.ps1                        # ✅ Exists
ls scripts/automated_lab_setup.sh                         # ✅ Exists
```

---

## Phase 1 Timeline

### Week 1 Execution Plan

| Day | Focus | Hours | Modules |
|-----|-------|-------|---------|
| **Mon-Tue** | account module | 4h | account (OO-F-401) |
| **Wed** | account_accountant + account_payment | 3h | account_accountant, account_payment |
| **Thu** | account_reports module | 2h | account_reports (OO-F-404) |
| **Fri** | Testing + code review + merge | 4h | All 4 modules + 10-point gate |

**Total: 13 hours, 5 working days, 4 modules, 25+ tests**

---

## Getting Started (First 30 Minutes)

### Step 1: Create Git Feature Branch

```bash
cd C:\Users\yoeli\Documents\GetUpSoft_Workspace

# Create feature branch
git checkout -b feature/orca-phase-1-accounting

# Verify branch created
git branch
# Output should show: * feature/orca-phase-1-accounting
```

### Step 2: Review Phase 1 Scope

Read the following documents in order:
1. **PHASE1_QUICK_START_CHECKLIST.md** (15 min)
   - Understand the 4 modules and what needs to be done
   - Review step-by-step implementation process
   
2. **PHASE1_CODE_TEMPLATES.md** (15 min)
   - Study Template 1: ORCA Log Model
   - Study Template 2: OrcaAuditMixin Application
   - Review all 8 templates (bookmark for reference)

3. **PHASE_COMPLETION_TEMPLATE.md** (5 min)
   - Understand how to verify completion
   - Know what the 10-point code review gate checks

### Step 3: Set Up Your Work Area

Create a local development directory structure:

```bash
# Navigate to module directory
cd 02_Odoo_ERP/Odoo_Consolidated_Library/v19/Modules

# Create workspace notes file (optional but recommended)
touch PHASE1_NOTES.md
```

**In PHASE1_NOTES.md, document:**
- Start time: [timestamp]
- Target modules: account (OO-F-401)
- Tracked fields identified
- Progress tracking
- Issues encountered
- Tests written

---

## Module 1: `account` Module Implementation (4 Hours)

This is the first module. Follow every step carefully.

### Hour 1: Create ORCA Log Model

**File to create:** `account/models/account_orca.py`

1. Copy **Template 1** from `PHASE1_CODE_TEMPLATES.md`
2. Replace placeholder values:
   ```python
   class AccountMoveOrcaLog(models.Model):
       _name = 'account.move.orca.log'
       _inherit = 'orca.log'
       _description = 'Account Move ORCA Audit Log'
   ```

3. Add module-specific fields:
   ```python
   move_type = fields.Selection([
       ('entry', 'Journal Entry'),
       ('out_invoice', 'Customer Invoice'),
       ('in_invoice', 'Vendor Bill'),
       ('out_refund', 'Customer Credit Note'),
       ('in_refund', 'Vendor Credit Note'),
   ], string='Move Type')
   
   amount_total = fields.Float(string='Total Amount')
   partner_name = fields.Char(string='Partner Name')
   ```

4. Save file

### Hour 2: Apply OrcaAuditMixin

**Continue in same file:** `account/models/account_orca.py`

Add the account.move class with mixin:

```python
class AccountMove(models.Model):
    _inherit = ['account.move', 'orca.audit.mixin']
    
    _orca_tracked_fields = [
        'state', 'move_type', 'amount_total', 'amount_untaxed',
        'amount_tax', 'partner_id', 'date', 'company_id', 'journal_id'
    ]
    _orca_log_model = 'account.move.orca.log'
```

Also add for account.journal and account.account (see Template 2 for reference).

### Hour 3: Update Manifest & Imports

**File:** `account/__manifest__.py`

1. Find the `depends` list
2. Add `'base_orca_integration'` if not present
3. Update version: `'19.0.1.1.0'` (increment minor)
4. Add to `data` list:
   ```python
   'views/account_orca_log_views.xml',
   'security/ir.model.access.csv',
   ```

**File:** `account/models/__init__.py`

1. Add import: `from . import account_orca`

### Hour 4: Write Tests & Verification

**File:** `account/tests/test_account_orca.py`

Copy Template 5 from `PHASE1_CODE_TEMPLATES.md` and adapt:

```python
class TestAccountOrcaLogging(TransactionCase):
    
    def test_account_move_create_logs(self):
        """Test that creating an account.move creates ORCA log"""
        move = self.env['account.move'].create({
            'move_type': 'out_invoice',
            'partner_id': self.env.ref('base.res_partner_1').id,
        })
        logs = self.env['account.move.orca.log'].search([
            ('record_id', '=', move.id)
        ])
        self.assertEqual(len(logs), 1)
        self.assertEqual(logs[0].action, 'create')
    
    def test_account_move_write_captures_changes(self):
        """Test that writing to account.move captures before/after values"""
        move = self.env['account.move'].create({...})
        move.write({'state': 'posted'})
        logs = self.env['account.move.orca.log'].search([
            ('record_id', '=', move.id),
            ('action', '=', 'write')
        ])
        self.assertTrue(len(logs) > 0)
        # Verify before/after values captured
        import json
        after = json.loads(logs[0].after_values)
        self.assertEqual(after.get('state'), 'posted')
    
    # Add 6+ more tests (delete, security, field tracking, etc.)
```

---

## Validation: Testing Your Work

### In Odoo UI (Manual Testing)

1. **Create a test invoice:**
   - Go to Accounting → Invoices → Create
   - Fill required fields
   - Click Save
   
2. **Check ORCA log appeared:**
   - Go to Accounting → ORCA Logs
   - Find your new entry (most recent)
   - Click to open form view
   - Verify `action = 'create'`
   - Verify `after_values` contains invoice data

3. **Modify the invoice:**
   - Go back to invoice
   - Edit a field (description, amount, etc.)
   - Save
   - Check ORCA Logs again
   - Find new entry with `action = 'write'`
   - Verify `before_values` and `after_values` differ

4. **Test delete:**
   - Create another invoice
   - Delete it
   - Check ORCA Logs
   - Find entry with `action = 'unlink'`

### Run Unit Tests

```bash
# From workspace directory
docker-compose exec odoo python -m pytest \
    02_Odoo_ERP/Odoo_Consolidated_Library/v19/Modules/account/tests/test_account_orca.py \
    -v

# Expected output: all tests PASSING (8+ tests)
```

---

## Commit Your Work

After completing the account module:

```bash
git add 02_Odoo_ERP/Odoo_Consolidated_Library/v19/Modules/account/

git commit -m "feat: Refactor account module with ORCA audit logging (OO-F-401)"

# Your commit message should reference the backlog item (OO-F-401)
```

---

## Troubleshooting During Phase 1

### Issue: OrcaAuditMixin not imported

**Error:** `NameError: name 'orca.audit.mixin' is not defined`

**Solution:**
- Verify `base_orca_integration` is in `depends`
- Verify `from orca.audit.mixin import OrcaAuditMixin` (or _inherit with path)
- Check that base_orca_integration module is installed in Odoo

### Issue: Tests won't run

**Error:** `No module named pytest` or tests don't execute

**Solution:**
```bash
# Install pytest in container
docker-compose exec odoo pip install pytest

# Run tests again
docker-compose exec odoo python -m pytest [path] -v
```

### Issue: Log entries not appearing

**Error:** Create/write operations don't create ORCA logs

**Solution:**
1. Check that `_orca_tracked_fields` is defined
2. Verify `_orca_log_model` is set correctly
3. Check that model actually inherits from `orca.audit.mixin`
4. Review logs: `docker-compose logs odoo | grep -i orca`

### Issue: Git branch conflicts

**Solution:**
```bash
# Check current branch
git branch

# Switch back to main if needed
git checkout main

# Delete old branch
git branch -D feature/orca-phase-1-accounting

# Start fresh with new branch
git checkout -b feature/orca-phase-1-accounting
```

---

## Next Module (Day 3: account_accountant)

After account module is complete and tests pass:

1. **Update CHANGE_TIMELINE.md** with account completion
2. **Commit with message:** `feat: Refactor account module with ORCA (OO-F-401)`
3. **Begin account_accountant** (same pattern as account)
   - OrcaLog model for accounting reports
   - Apply mixin to main models
   - Write 6+ tests
   - Verify in UI

**Reference:** Use `PHASE1_QUICK_START_CHECKLIST.md` step-by-step for each module

---

## Code Review Gate (Day 5 - Friday)

After all 4 modules complete, verify against **10-point checklist:**

1. ✅ ORCA Integration complete (all modules have OrcaLog + mixin)
2. ✅ Tests written & passing (25+ tests total, all passing)
3. ✅ Security rules configured (ir.model.access.csv exists)
4. ✅ Views created (list/form views for logs)
5. ✅ Documentation updated (README sections added)
6. ✅ Code quality verified (no TODO/FIXME, clean code)
7. ✅ Integration testing passed (manual tests work)
8. ✅ Performance verified (no blocking operations)
9. ✅ Git commits clean (4 commits, one per module, OO-XXX references)
10. ✅ Evidence & sign-off (screenshots of logs, test results)

**Use:** `PHASE_COMPLETION_TEMPLATE.md` to document all verifications

---

## Success Criteria for Phase 1

✅ **All 4 modules refactored:**
- account (OO-F-401)
- account_accountant (OO-F-402)
- account_payment (OO-F-403)
- account_reports (OO-F-404)

✅ **25+ unit tests written and PASSING**

✅ **ORCA logs visible in Odoo UI for all 4 modules**

✅ **Manual testing verified (create/write/delete operations log correctly)**

✅ **Security rules configured (read-only for accountants, full for managers)**

✅ **10-point code review gate passed (all checks passing)**

✅ **Clean git history (4 commits, references OO-XXX items)**

---

## Summary

| Item | Time | Status |
|------|------|--------|
| Lab running | 5-8 min | ✅ Automated setup ready |
| Feature branch created | 5 min | 📝 Start Phase 1 |
| account module (OO-F-401) | 4h | 📝 Monday-Tuesday |
| account_accountant (OO-F-402) | 3h | 📝 Wednesday |
| account_payment (OO-F-403) | 2h | 📝 Thursday AM |
| account_reports (OO-F-404) | 2h | 📝 Thursday PM |
| Testing + Code Review | 2h | 📝 Friday |
| Merge to main | 1h | 📝 Friday PM |
| **Total Phase 1** | **13h** | **Ready** |

---

**Ready to start Phase 1?**

✅ Lab running: http://localhost:8069  
✅ Code templates: PHASE1_CODE_TEMPLATES.md  
✅ Checklist: PHASE1_QUICK_START_CHECKLIST.md  
✅ Verification: PHASE_COMPLETION_TEMPLATE.md  

**Next step:** Create git branch `feature/orca-phase-1-accounting` and begin account module refactoring.

---

**Prepared by:** Claude AI  
**Date:** 2026-05-28  
**Status:** READY FOR EXECUTION
