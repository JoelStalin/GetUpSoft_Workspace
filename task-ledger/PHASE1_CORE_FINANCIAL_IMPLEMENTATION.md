# PHASE 1: Core Financial Modules - Implementation Plan

**Status:** PREPARATION (waiting for user lab validation)  
**Phase:** 1 of 5  
**Duration:** 1 week (20 hours)  
**Modules:** 4 (account, account_accountant, account_payment, account_reports)  
**Priority:** P0 (highest)  
**Start Date:** After lab validation confirmed  

---

## Overview

Phase 1 refactors the foundation of Odoo's financial system with ORCA audit logging. These 4 modules handle all monetary transactions, journal entries, and financial reports.

**All future phases depend on Phase 1 completion.**

---

## Module 1: `account` (OO-F-401)

### Strategic Importance
**CRITICAL** - Central to all financial operations. Every invoice, bill, journal entry, and ledger entry flows through here.

### Estimated Hours: 4 hours

### Models to Refactor (CRITICAL Tier)

#### Primary Models
1. **account.move** (Most critical)
   - Journal entries, invoices, bills, payment records
   - Tracked fields (20+ fields):
     - `move_type` (out_invoice, in_invoice, out_receipt, in_receipt, etc.)
     - `state` (draft, posted, cancel)
     - `amount_total`, `amount_tax`, `amount_untaxed`
     - `partner_id` (customer/vendor)
     - `date`, `posting_date`
     - `currency_id`, `company_id`
     - `journal_id`
     - `ref` (reference number)
     - `narration`
     - `invoice_number`

2. **account.journal** (Important)
   - Ledger journals (bank, cash, general, sales, purchases)
   - Tracked fields:
     - `code`, `name`, `type`
     - `active` (enable/disable)
     - `currency_id`
     - `company_id`

3. **account.account** (Important)
   - Chart of accounts
   - Tracked fields:
     - `code`, `name`
     - `account_type` (asset, liability, equity, income, expense)
     - `active`
     - `company_id`
     - `deprecated` (old/obsolete accounts)

4. **account.analytic** (Optional - HIGH tier)
   - Cost center allocation
   - Tracked fields:
     - `name`, `code`
     - `account_type`
     - `active`

### Files to Create

```
v19/Modules/account_extended/ (already exists, update it)
├── models/
│   ├── __init__.py (UPDATE to import account_orca)
│   └── account_orca.py (NEW)
├── security/
│   └── ir.model.access.csv (UPDATE - add account.move.orca.log rules)
├── views/
│   └── account_move_orca_log_views.xml (NEW)
└── tests/
    └── test_account_orca.py (NEW - 8 tests)
```

### Tests Required (8 tests minimum)

```python
# test_account_orca.py
test_orca_account_move_create()           # Create hook fires
test_orca_account_move_write()            # Write hook captures before/after
test_orca_account_move_state_change()     # State change logged
test_orca_account_move_fields_detected()  # Field auto-detection works
test_orca_account_journal_create()        # Journal creation logged
test_orca_account_account_changes()       # Chart of accounts changes logged
test_orca_access_control_accountant()     # Accountant can only read logs
test_orca_access_control_manager()        # Manager can full access
```

### Implementation Order
1. Create `account_orca.py` with OrcaLog model
2. Apply OrcaAuditMixin to account.move
3. Apply OrcaAuditMixin to account.journal
4. Apply OrcaAuditMixin to account.account
5. Create security rules
6. Create views
7. Write and pass 8 tests
8. Update README

---

## Module 2: `account_accountant` (OO-F-402)

### Strategic Importance
**HIGH** - Advanced accounting features used by accountants (tax computation, analytical accounting, bank reconciliation).

### Estimated Hours: 3 hours

### Models to Refactor

#### Primary Models
1. **account.tax** (Important)
   - Tax configurations and calculations
   - Tracked fields:
     - `name`, `type_tax_use`
     - `amount`, `amount_type` (fixed, percent)
     - `active`
     - `company_id`

2. **account.move.line** (Important)
   - Invoice/bill line items
   - Tracked fields:
     - `account_id`
     - `amount_currency`, `debit`, `credit`
     - `tax_ids`
     - `analytic_account_id`
     - `description`

3. **account.bank** (Optional - HIGH tier)
   - Bank account details
   - Tracked fields:
     - `acc_number`
     - `bank_id`, `currency_id`

### Files to Create

```
v19/Modules/account_extended/ (update)
├── models/
│   └── account_accountant_orca.py (NEW)
├── security/
│   └── ir.model.access.csv (UPDATE)
├── views/
│   └── account_tax_orca_log_views.xml (NEW)
└── tests/
    └── test_account_accountant_orca.py (NEW - 6 tests)
```

### Tests Required (6 tests)

```python
test_orca_tax_create()
test_orca_tax_rate_change()
test_orca_move_line_tracking()
test_orca_tax_application()
test_orca_bank_details_logged()
test_orca_access_control()
```

---

## Module 3: `account_payment` (OO-F-403)

### Strategic Importance
**HIGH** - Handles all payment processing, payment methods, and payment matching.

### Estimated Hours: 3.5 hours

### Models to Refactor

#### Primary Models
1. **account.payment** (Critical)
   - Payment records (incoming/outgoing)
   - Tracked fields:
     - `move_type` (inbound, outbound)
     - `state` (draft, posted, sent, reconciled, cancelled)
     - `amount`
     - `date`, `posting_date`
     - `partner_id`
     - `currency_id`
     - `company_id`
     - `journal_id`
     - `payment_method_id`

2. **account.payment.method** (Important)
   - Payment method definitions
   - Tracked fields:
     - `code`, `name`
     - `active`

3. **account.payment.register** (Optional)
   - Payment registration wizard
   - Tracked fields:
     - `amount`
     - `journal_id`

### Files to Create

```
v19/Modules/payment_extended/ (already exists, update)
├── models/
│   ├── __init__.py (UPDATE)
│   └── payment_orca.py (NEW)
├── security/
│   └── ir.model.access.csv (UPDATE)
├── views/
│   └── payment_orca_log_views.xml (NEW)
└── tests/
    └── test_payment_orca.py (NEW - 6 tests)
```

### Tests Required (6 tests)

```python
test_orca_payment_create()
test_orca_payment_state_change()
test_orca_payment_posted()
test_orca_payment_cancelled()
test_orca_payment_method_tracking()
test_orca_access_control()
```

---

## Module 4: `account_reports` (OO-F-404)

### Strategic Importance
**MEDIUM-HIGH** - Financial reporting (balance sheet, income statement, trial balance, DGII compliance).

### Estimated Hours: 2.5 hours

### Models to Refactor

#### Primary Models
1. **report.general.ledger** (Important)
   - General ledger report
   - Tracked fields:
     - `date_from`, `date_to`
     - `account_ids`
     - `company_id`

2. **account.report.wizard** (Important)
   - Report configuration
   - Tracked fields:
     - `date_from`, `date_to`
     - `report_type` (balance_sheet, income_statement, etc.)
     - `company_id`
     - `generated_at` (timestamp)

### Files to Create

```
v19/Modules/account_extended/ (update)
├── models/
│   └── account_reports_orca.py (NEW)
├── security/
│   └── ir.model.access.csv (UPDATE)
├── views/
│   └── account_report_orca_log_views.xml (NEW)
└── tests/
    └── test_account_reports_orca.py (NEW - 5 tests)
```

### Tests Required (5 tests)

```python
test_orca_report_generation()
test_orca_report_parameters_logged()
test_orca_date_range_tracked()
test_orca_company_filter_tracked()
test_orca_access_control()
```

---

## Implementation Sequence

### Day 1-2: `account` Module (4 hours)
1. Create account_orca.py
2. Define OrcaLog model
3. Apply mixin to account.move (primary)
4. Apply mixin to account.journal
5. Apply mixin to account.account
6. Create security rules
7. Create views
8. Write 8 tests

### Day 3: `account_accountant` Module (3 hours)
1. Create account_accountant_orca.py
2. Apply mixin to account.tax
3. Apply mixin to account.move.line
4. Apply mixin to account.bank
5. Create security rules and views
6. Write 6 tests

### Day 4: `account_payment` Module (3.5 hours)
1. Create payment_orca.py
2. Apply mixin to account.payment (primary)
3. Apply mixin to account.payment.method
4. Create security rules and views
5. Write 6 tests

### Day 5: `account_reports` Module (2.5 hours)
1. Create account_reports_orca.py
2. Apply mixin to report models
3. Create security rules and views
4. Write 5 tests

### Day 6-7: Integration & Testing
1. Run all Phase 1 tests (25 tests total)
2. Verify ORCA logging in database
3. Create UI views and test manually
4. Update CHANGE_TIMELINE.md
5. Create commit(s)

**Total: 20 hours (5 days of 4-hour work)**

---

## Code Template: account_orca.py

```python
# v19/Modules/account_extended/models/account_orca.py

from odoo import models, fields

class AccountMoveOrcaLog(models.Model):
    """ORCA audit log for account.move - Central financial transactions"""
    _name = 'account.move.orca.log'
    _description = 'Account Move Audit Log'
    _inherit = 'orca.log'
    
    # Module-specific fields
    move_type = fields.Char(string='Move Type')
    posting_date = fields.Date(string='Posting Date')
    partner_name = fields.Char(string='Partner')
    invoice_number = fields.Char(string='Invoice Number')


class AccountMove(models.Model):
    """Inherit account.move with ORCA audit logging"""
    _inherit = ['account.move', 'orca.audit.mixin']
    
    _orca_tracked_fields = [
        'move_type', 'state', 'amount_total', 'amount_tax',
        'partner_id', 'date', 'posting_date', 'currency_id',
        'journal_id', 'ref', 'narration', 'company_id'
    ]
    _orca_log_model = 'account.move.orca.log'


class AccountJournal(models.Model):
    """Inherit account.journal with ORCA audit logging"""
    _inherit = ['account.journal', 'orca.audit.mixin']
    
    _orca_tracked_fields = [
        'code', 'name', 'type', 'active', 'currency_id', 'company_id'
    ]
    _orca_log_model = 'account.move.orca.log'  # Reuse same log


class AccountAccount(models.Model):
    """Inherit account.account with ORCA audit logging"""
    _inherit = ['account.account', 'orca.audit.mixin']
    
    _orca_tracked_fields = [
        'code', 'name', 'account_type', 'active', 'company_id', 'deprecated'
    ]
    _orca_log_model = 'account.move.orca.log'  # Reuse same log
```

---

## Testing Strategy

### Unit Tests (25 total across 4 modules)
- Create hooks: Verify log entry created when model created
- Write hooks: Verify before/after snapshots captured
- State changes: Verify important state transitions logged
- Field detection: Verify CRITICAL/HIGH tier fields auto-detected
- Access control: Verify accountants read-only, managers full access
- Database: Verify ORCA tables exist with correct structure

### Integration Tests (Phase 1)
- Create invoice → verify ORCA log
- Change invoice state → verify log with before/after
- Create payment → verify logged
- Generate report → verify logged
- Check UI shows all logs

### Performance Tests
- Measure ORCA logging latency (<10ms per transaction)
- Verify no blocking of account operations
- Check database query performance

---

## Success Criteria

✅ **All 4 modules refactored**
✅ **25+ tests written and passing**
✅ **Security rules enforced**
✅ **UI views created**
✅ **Documentation updated**
✅ **Git commits clean and organized**
✅ **ORCA logs visible in Odoo UI**
✅ **Performance baseline: <10ms latency**

---

## Blockers / Dependencies

1. **User lab validation must pass first** (v19 basic infrastructure)
2. **base_orca_integration must be installed** (ORCA foundation)
3. **All custom modules (v19) must exist** (already done)

Once these are satisfied, Phase 1 can execute without blocking.

---

## What Happens After Phase 1

- ✅ Phase 1 complete → Phase 2 unlocks (Sales & CRM)
- ✅ Core financial ops fully logged
- ✅ Ready for staging deployment with financial audit trail
- ✅ Pattern established for remaining 6 phases

---

## Files Modified/Created

**New Files:** 
- account_orca.py
- account_accountant_orca.py
- payment_orca.py
- account_reports_orca.py
- 4 views XML files
- 4 test files
- Updated security CSV

**Total:** 12 files, ~1,500 lines of code

---

## Next Phase Preview

**Phase 2: Sales & CRM** (Week 2)
- sale.order tracking
- crm.lead tracking
- sales pipeline logging
- Estimated: 15 hours, 5 modules

