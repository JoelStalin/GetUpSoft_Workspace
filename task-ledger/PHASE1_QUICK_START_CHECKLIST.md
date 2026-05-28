# PHASE 1 Quick-Start Checklist - Core Financial Modules

**Status:** READY FOR EXECUTION  
**Duration:** 1 week (13 hours total)  
**Start:** Immediately after lab validation  
**Deadline:** 5 working days  

---

## Prerequisites ✅

- [ ] Lab validation PASSED (user confirmed modules appear in Odoo UI)
- [ ] All code templates prepared (`PHASE1_CODE_TEMPLATES.md`)
- [ ] Git branch created: `feature/orca-phase-1-accounting`
- [ ] No uncommitted changes in working directory

---

## Module 1: `account` (OO-F-401) - 4 HOURS

### Step 1: Create Module File
```bash
cd 02_Odoo_ERP/Odoo_Consolidated_Library/v19/Modules/account/models/
touch account_orca.py
```

### Step 2: Create OrcaLog Model
Copy template from `PHASE1_CODE_TEMPLATES.md` → Template 1: ORCA Log Model
- Model name: `account.move.orca.log`
- Inherit from: `orca.log`
- Module-specific fields: 
  - `move_type` (Char)
  - `amount_total` (Float)
  - `partner_name` (Char)

### Step 3: Apply OrcaAuditMixin to Models
Copy template from `PHASE1_CODE_TEMPLATES.md` → Template 2: Model with ORCA Mixin

**Models to track:**
1. `account.move`
   - Tracked fields: state, move_type, amount_total, amount_untaxed, amount_tax, partner_id, date, company_id, journal_id, user_id
   
2. `account.journal`
   - Tracked fields: code, name, type, active
   
3. `account.account`
   - Tracked fields: code, name, account_type, active, company_id

### Step 4: Update __init__.py
```python
# Add this import to models/__init__.py
from . import account_orca

__all__ = [
    'existing_model_1',
    'existing_model_2',
    'account_orca',  # ADD THIS
]
```

### Step 5: Update __manifest__.py
```python
{
    'name': 'Accounting (ORCA Integration)',  # Add (ORCA Integration)
    'version': '19.0.1.1.0',  # Increment minor version
    'author': 'getupsoft',  # Ensure this is set
    'depends': [
        'base_orca_integration',  # ADD THIS (if not present)
        'existing_deps',
        # ... rest of deps
    ],
    'data': [
        'security/ir.model.access.csv',
        'views/account_orca_log_views.xml',  # ADD THIS
        # ... rest of data
    ],
}
```

### Step 6: Create Security Rules
Copy template from `PHASE1_CODE_TEMPLATES.md` → Template 3: Security Rules

**File:** `security/ir.model.access.csv`

Add these 3 lines:
```csv
id,name,model_id:id,group_id:id,perm_read,perm_write,perm_create,perm_unlink
access_account_move_orca_log_user,account_move_orca_log_user,model_account_move_orca_log,base.group_user,1,0,0,0
access_account_move_orca_log_accountant,account_move_orca_log_accountant,model_account_move_orca_log,account.group_account_user,1,0,0,0
access_account_move_orca_log_manager,account_move_orca_log_manager,model_account_move_orca_log,account.group_account_manager,1,1,1,0
```

### Step 7: Create Views
Copy template from `PHASE1_CODE_TEMPLATES.md` → Template 4: Views (XML)

**File:** `views/account_orca_log_views.xml`

Create list view, form view, action, and menu item for `account.move.orca.log`

### Step 8: Write Tests
Copy template from `PHASE1_CODE_TEMPLATES.md` → Template 5: Unit Tests

**File:** `tests/test_account_orca.py`

Write 8 test methods:
1. `test_orca_account_move_create_logs()`
2. `test_orca_account_move_write_captures_changes()`
3. `test_orca_journal_changes_logged()`
4. `test_orca_account_code_changes()`
5. `test_orca_field_auto_detection()`
6. `test_orca_before_after_values()`
7. `test_orca_access_control_accountant()`
8. `test_orca_access_control_manager()`

### Step 9: Run Tests
```bash
cd /path/to/odoo
python -m pytest 02_Odoo_ERP/Odoo_Consolidated_Library/v19/Modules/account/tests/test_account_orca.py -v
```

**All 8 tests MUST PASS** ✅

### Step 10: Verify ORCA Logs in Odoo UI
1. Start Odoo: `odoo-bin -d <database>`
2. Login as admin
3. Navigate to: **Accounting** → **ORCA Logs** → **Account Move ORCA Logs**
4. Create a test invoice (account.move)
5. Verify log entry appears with action='create'
6. Verify before_values and after_values populated

### Step 11: Commit
```bash
git add -A
git commit -m "feat: Refactor account module with ORCA audit logging (OO-F-401)

- Create account.move.orca.log model
- Apply OrcaAuditMixin to account.move, account.journal, account.account
- Write 8 unit tests (all passing)
- Create security rules and views
- ORCA logs visible in Odoo UI

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

**Status:** ✅ OO-F-401 COMPLETE

---

## Module 2: `account_accountant` (OO-F-402) - 3 HOURS

### Same pattern as Module 1

**File:** `models/account_accountant_orca.py`
**Models:**
- account.tax
- account.move.line
- account.bank

**Tests:** 6 minimum (tax creation, tax rate changes, move line tracking, bank statement reconciliation, access control)

**Commit:** `feat: Refactor account_accountant module with ORCA audit logging (OO-F-402)`

**Status:** ✅ OO-F-402 COMPLETE

---

## Module 3: `account_payment` (OO-F-403) - 3.5 HOURS

### Same pattern as Module 1

**File:** `models/account_payment_orca.py`
**Models:**
- account.payment
- account.payment.method

**Tests:** 6 minimum (payment creation, state changes, method tracking, currency changes, access control)

**Commit:** `feat: Refactor account_payment module with ORCA audit logging (OO-F-403)`

**Status:** ✅ OO-F-403 COMPLETE

---

## Module 4: `account_reports` (OO-F-404) - 2.5 HOURS

### Same pattern as Module 1

**File:** `models/account_reports_orca.py`
**Models:**
- report.general.ledger
- account.report.wizard

**Tests:** 5 minimum (report creation, wizard parameter changes, date range tracking, access control)

**Commit:** `feat: Refactor account_reports module with ORCA audit logging (OO-F-404)`

**Status:** ✅ OO-F-404 COMPLETE

---

## Phase 1 Completion Checklist

### Code Review Gate (BLOCKING) - 10 Points

**All must be ✅ PASS before merge:**

- [ ] 1. ORCA Integration Complete
  - ✅ _orca_tracked_fields defined (8+ fields per model)
  - ✅ _orca_log_model configured
  - ✅ OrcaAuditMixin inherited
  - ✅ Concrete ORCA log model created

- [ ] 2. Tests Written & Passing
  - ✅ 25+ tests total across 4 modules
  - ✅ All tests PASS (pytest output required)
  - ✅ Each model has coverage
  - ✅ Access control tests included

- [ ] 3. Security & Access Control
  - ✅ ir.model.access.csv created
  - ✅ Accountants: read-only (1,0,0,0)
  - ✅ Managers: full access (1,1,1,0)
  - ✅ Admin: unrestricted

- [ ] 4. Views & UI
  - ✅ _orca_log_views.xml created
  - ✅ List view displays logs
  - ✅ Form view shows details
  - ✅ Menu items appear in Odoo UI

- [ ] 5. Documentation
  - ✅ README.md updated with ORCA section
  - ✅ Tracked models documented
  - ✅ Access control explained

- [ ] 6. Code Quality
  - ✅ No lint/style errors
  - ✅ No console warnings
  - ✅ __init__.py imports updated
  - ✅ __manifest__.py correct

- [ ] 7. Integration Testing
  - ✅ Manual: Create record → log appears
  - ✅ Manual: Edit record → before/after captured
  - ✅ Manual: Delete record → logged
  - ✅ JSON before/after values valid

- [ ] 8. Performance & Compliance
  - ✅ ORCA hooks <10ms latency
  - ✅ No blocking operations
  - ✅ Compliance ready

- [ ] 9. Git Commit
  - ✅ Clean commit history
  - ✅ Proper commit messages
  - ✅ All files staged
  - ✅ No merge conflicts

- [ ] 10. Evidence & Sign-off
  - ✅ Screenshot: ORCA logs visible in UI
  - ✅ Screenshot: All tests passing
  - ✅ User confirmation: Feature works
  - ✅ Ready for merge

**MERGE STATUS:** 
- [ ] ALL 10 POINTS PASS = MERGE APPROVED
- [ ] ANY FAILURES = BLOCK & REWORK

---

## Final Steps After Phase 1 Complete

1. **Create PR on GitHub**
   - Title: `feat: Phase 1 - Core Financial modules with ORCA audit logging`
   - Body: Include 10-point checklist results
   - Link issue/commits

2. **Wait for Code Review**
   - All 10 points must pass
   - No exceptions

3. **Merge to Main**
   - Rebase and merge
   - Delete feature branch

4. **Update CHANGE_TIMELINE.md**
   - Add Session 9 summary
   - Mark Phase 1 complete
   - Document effort: 13 hours, 25+ tests

5. **Begin Phase 2**
   - Follow same pattern
   - Use same templates
   - 5 modules (sale, sale_management, crm, website_sale, crm_phone)
   - Timeline: Week 2

---

## Quick Reference

**Templates Location:** `task-ledger/PHASE1_CODE_TEMPLATES.md`
- Template 1: ORCA Log Model
- Template 2: Model with ORCA Mixin
- Template 3: Security Rules (ir.model.access.csv)
- Template 4: Views (XML)
- Template 5: Unit Tests
- Template 6: __init__.py updates
- Template 7: __manifest__.py updates
- Template 8: README documentation

**Implementation Docs:** `task-ledger/PHASE1_CORE_FINANCIAL_IMPLEMENTATION.md`

**Backlog:** `task-ledger/V19_COMPLETE_MODULE_REFACTORING_BACKLOG.md`

**Roadmap:** `task-ledger/PHASES_1_TO_6_COMPLETE_ROADMAP.md`

---

## Success Metrics

✅ **Phase 1 Success = ALL criteria met:**
- 4 modules refactored
- 25+ tests passing
- ORCA logs visible in Odoo UI
- Code review gate 10/10 pass
- All commits merged to main
- Timeline: 5 working days (13 hours actual work)

