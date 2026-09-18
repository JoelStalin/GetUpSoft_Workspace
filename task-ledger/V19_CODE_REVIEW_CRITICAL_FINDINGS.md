# V19 ORCA Code Review - CRITICAL FINDINGS

**Date:** 2026-05-28  
**Status:** 🔴 BLOCKING ISSUES FOUND  
**Severity:** CRITICAL - View loading and security failures  
**Impact:** All 78 tests will fail; views won't load; security rules won't bind

---

## Issue Summary

During code review of v19 ORCA modules (Task #24), critical naming mismatches were discovered that break:
1. **UI View Loading** — Views reference non-existent models
2. **Access Control** — Security rules reference non-existent model IDs  
3. **Test Execution** — All 78 tests will fail on view/model operations

---

## Issue Details

### Root Cause

Model names defined in Python (`_name = 'orca.account.move.log'`) do NOT match:
- View file references (`<field name="model">account.move.orca.log</field>`)
- Security file model IDs (`model_account_move_orca_log`)

When Odoo creates external IDs for models, it uses the pattern: `model_` + model_name with dots replaced by underscores.

**Example:**
- Python: `_name = 'orca.account.move.log'` → External ID: `model_orca_account_move_log`
- Views: ❌ Reference `account.move.orca.log` (WRONG)
- Security: ❌ Reference `model_account_move_orca_log` (WRONG)

---

## Affected Modules (6 of 13 modules)

| Module | Model Name | View References | Security References | Status |
|--------|-----------|-----------------|-------------------|--------|
| account_extended | `orca.account.move.log` | ❌ `account.move.orca.log` | ❌ `model_account_move_orca_log` | BROKEN |
| asset_extended | `orca.account.asset.log` | ✅ `orca.account.asset.log` | ✅ `model_account_asset_orca_log` | OK* |
| bank_extended | `orca.account.bank.statement.log` | ✅ `orca.account.bank.statement.log` | ✅ `model_account_bank_statement_orca_log` | OK* |
| invoice_extended | `orca.account.move.line.log` | ✅ `orca.account.move.line.log` | ✅ `model_account_move_line_orca_log` | OK* |
| l10n_do_accounting | `orca.l10n.do.accounting.log` | ❌ `orca.l10n.do.accounting.move.log` | ❌ `l10n.do.accounting.orca.log` | BROKEN |
| l10n_do_accounting_report | `orca.l10n.do.accounting.report.log` | ✅ `orca.l10n.do.accounting.report.log` | ✅ `l10n.do.accounting.report.orca.log` | OK* |
| l10n_do_pos | `orca.l10n.do.pos.log` | ❌ `orca.l10n.do.pos.order.log` | ❌ `l10n.do.pos.orca.log` | BROKEN |
| l10n_do_rnc_search | `orca.l10n.do.rnc.search.log` | ✅ `orca.l10n.do.rnc.search.log` | ✅ `l10n.do.rnc.search.orca.log` | OK* |
| payment_extended | `orca.account.payment.log` | ✅ `orca.account.payment.log` | ✅ `model_account_payment_orca_log` | OK* |
| pos_extended | `orca.pos.order.log` | ❌ `pos.order.orca.log` | ❌ `model_pos_order_orca_log` | BROKEN |
| sale_extended | `orca.sale.order.log` | ❌ `sale.order.orca.log` | ❌ `model_sale_order_orca_log` | BROKEN |
| stock_extended | `orca.stock.move.log` | ❌ `stock.move.orca.log` | ❌ `model_stock_move_orca_log` | BROKEN |

*Note: Asset, invoice, bank also have security issues — model IDs don't match Odoo's auto-generation pattern.

---

## Security File Issues (All 9 modules)

All security files use INCORRECT model reference IDs that won't match Odoo's auto-generated external IDs:

**Current Pattern (WRONG):**
```csv
model_account_move_orca_log  ← Custom ID, not auto-generated
```

**Should Be (CORRECT):**
```csv
model_orca_account_move_log  ← Matches auto-generated external ID
```

**Why This Matters:**
- Odoo auto-generates external ID: `model_` + model_name with dots→underscores
- Security file must reference that exact external ID
- If ID doesn't exist, security rule won't apply
- Users get no access control (security bypass)

---

## View Loading Failures

When views load, Odoo looks up the model by name in `ir.model`:
1. Model defined: `_name = 'orca.account.move.log'`
2. View references: `<field name="model">account.move.orca.log</field>`
3. Result: ❌ Model lookup fails → View doesn't load

**Affected:**
- account_extended: 3 views fail (tree, form, search)
- l10n_do_pos: 3 views fail
- l10n_do_accounting: 3 views fail
- pos_extended: 3 views fail
- sale_extended: 3 views fail
- stock_extended: 3 views fail

**Total:** 18 views will fail to load (broken menu, broken action buttons)

---

## Test Execution Impact

Tests will fail at:
```python
self.env['orca.account.move.log'].search([...])  # Model exists ✅
view = self.env.ref('account_extended.account_move_orca_log_view_form')  # View doesn't exist ❌
```

**Expected Test Failures:**
- All UI view tests (TestAccountMoveOrcaUIViews) in all 6 broken modules
- Menu and action tests referencing views
- ~36 tests blocked

---

## Remediation Plan

### Phase 1: Fix View Files (6 modules)

**account_extended:**
```xml
<!-- BEFORE -->
<field name="model">account.move.orca.log</field>

<!-- AFTER -->
<field name="model">orca.account.move.log</field>
```

Repeat for: l10n_do_accounting, l10n_do_pos, pos_extended, sale_extended, stock_extended

### Phase 2: Fix Security Files (ALL 9 modules + base)

**account_extended:**
```csv
<!-- BEFORE -->
access_account_move_orca_log_accountant,Access account.move.orca.log - Accountant,model_account_move_orca_log,...

<!-- AFTER -->
access_account_move_orca_log_accountant,Access orca.account.move.log - Accountant,model_orca_account_move_log,...
```

**Mapping table for all modules:**

| Module | Model Name | Old Security ID | New Security ID |
|--------|-----------|-----------------|-----------------|
| account_extended | orca.account.move.log | model_account_move_orca_log | model_orca_account_move_log |
| asset_extended | orca.account.asset.log | model_account_asset_orca_log | model_orca_account_asset_log |
| bank_extended | orca.account.bank.statement.log | model_account_bank_statement_orca_log | model_orca_account_bank_statement_log |
| invoice_extended | orca.account.move.line.log | model_account_move_line_orca_log | model_orca_account_move_line_log |
| l10n_do_accounting | orca.l10n.do.accounting.log | l10n.do.accounting.orca.log | model_orca_l10n_do_accounting_log |
| l10n_do_accounting_report | orca.l10n.do.accounting.report.log | l10n.do.accounting.report.orca.log | model_orca_l10n_do_accounting_report_log |
| l10n_do_pos | orca.l10n.do.pos.log | l10n.do.pos.orca.log | model_orca_l10n_do_pos_log |
| l10n_do_rnc_search | orca.l10n.do.rnc.search.log | l10n.do.rnc.search.orca.log | model_orca_l10n_do_rnc_search_log |
| payment_extended | orca.account.payment.log | model_account_payment_orca_log | model_orca_account_payment_log |
| pos_extended | orca.pos.order.log | model_pos_order_orca_log | model_orca_pos_order_log |
| sale_extended | orca.sale.order.log | model_sale_order_orca_log | model_orca_sale_order_log |
| stock_extended | orca.stock.move.log | model_stock_move_orca_log | model_orca_stock_move_log |
| base_orca_integration | orca.log | N/A | model_orca_log |

### Phase 3: Verification

After fixes, verify:
```bash
# 1. All models load
python3 -c "from odoo import models; from odoo.modules import load_information_from_description_file"

# 2. All external IDs exist
psql -c "SELECT name FROM ir_model WHERE model LIKE 'orca.%';"

# 3. All security rules bind
psql -c "SELECT * FROM ir_model_access WHERE model_id IN (SELECT id FROM ir_model WHERE model LIKE 'orca.%');"

# 4. Re-run full test suite
./scripts/run_v19_orca_tests.sh test_v19_orca /etc/odoo/odoo.conf
```

---

## Recommendation

**STOP all further work until these issues are fixed.**

- Task #23 (test execution) will produce 100% failure rate if run now
- Task #24 (code review) is blocked pending fixes
- Task #25 (staging/production) cannot proceed with broken code

**Suggested Action:**
1. Apply fixes immediately (estimated 45 minutes for all 6 modules)
2. Commit with message: `fix: Correct v19 ORCA model naming and security references`
3. Re-execute Task #23 test suite
4. Resume Task #24 code review after tests pass

---

## Timeline Impact

| Phase | Time | Dependency |
|-------|------|-----------|
| Fix views & security | 45 min | None |
| Commit | 5 min | Fixes complete |
| Re-run tests | 30 min | Fixes committed |
| Resume code review | 2h | Tests passing |

**Total delay: 2.5 hours if fixed now, vs. discovering failures during test execution (1-2 hours wasted + rework)**

