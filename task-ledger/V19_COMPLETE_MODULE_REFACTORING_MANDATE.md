# 🔴 MANDATORY: V19 Complete Module Refactoring Directive

**Effective Date:** 2026-05-28  
**Status:** MANDATORY COMPLIANCE REQUIRED  
**Scope:** ALL Odoo v19 modules (core + custom + localization)  
**Enforcement:** Code review gate - refactoring required before merge

---

## The Mandate

> **Every single Odoo v19 module MUST be refactored to inherit from `OrcaAuditMixin` and provide automatic audit logging via ORCA.**

This is not optional. This is not a nice-to-have. This is a mandatory architecture requirement.

---

## Scope: All Modules Must Be Refactored

### Category 1: Core Accounting Modules (4 modules)
- [ ] account - Chart of accounts, journals, moves, entries
- [ ] account_accountant - Advanced accounting features
- [ ] account_payment - Payment methods and processing
- [ ] account_reports - Financial reporting

### Category 2: Sales & CRM Modules (7 modules)
- [ ] sale - Sales orders, quotations
- [ ] sale_management - Advanced sales features
- [ ] sales_team - Sales team management
- [ ] crm - Customer relationships
- [ ] crm_phone - Phone integration
- [ ] crm_livechat - Live chat support
- [ ] website_sale - E-commerce integration

### Category 3: Purchase & Requisition Modules (3 modules)
- [ ] purchase - Purchase orders, RFQ
- [ ] purchase_stock - Inventory integration
- [ ] purchase_requisition - Purchase requests

### Category 4: Inventory & Stock Modules (3 modules)
- [ ] stock - Inventory movements, warehousing
- [ ] stock_intrastat - Intrastat reporting
- [ ] stock_dropshipping - Drop shipping

### Category 5: HR & Payroll Modules (6 modules)
- [ ] hr - Human resources
- [ ] hr_org_chart - Organizational chart
- [ ] hr_holidays - Time off management
- [ ] hr_expense - Expense management
- [ ] payroll - Salary processing
- [ ] hr_payroll - HR + Payroll integration

### Category 6: Manufacturing & Quality (3 modules)
- [ ] mrp - Manufacturing orders
- [ ] mrp_byproduct - Byproduct handling
- [ ] quality - Quality control

### Category 7: Project Management (2 modules)
- [ ] project - Projects and tasks
- [ ] project_enterprise - Advanced features

### Category 8: Website & E-Commerce (3 modules)
- [ ] website - Website builder
- [ ] website_form - Form builder
- [ ] website_sale_management - E-commerce features

### Category 9: Localization Modules (Dominican Republic)
- [ ] l10n_do_accounting - DR Accounting compliance
- [ ] l10n_do_accounting_report - DGII reporting
- [ ] l10n_do_pos - DR POS fiscal controls
- [ ] l10n_do_rnc_search - RNC validation
- [ ] (+ any future DR localizations)

### Category 10: Custom/Extended Modules (Already Done ✅)
- [x] base_orca_integration - ORCA foundation
- [x] account_extended - Account enhancements
- [x] asset_extended - Asset tracking
- [x] bank_extended - Bank reconciliation
- [x] invoice_extended - Invoice details
- [x] l10n_do_accounting - (custom version)
- [x] l10n_do_accounting_report - (custom version)
- [x] l10n_do_pos - (custom version)
- [x] l10n_do_rnc_search - (custom version)
- [x] payment_extended - Payment tracking
- [x] pos_extended - POS enhancements
- [x] sale_extended - Sales enhancements
- [x] stock_extended - Inventory enhancements

**13 custom/localization modules DONE ✅**  
**~30 core modules REMAINING ⏳**

---

## Why This Is Mandatory

### 1. **Audit Trail Completeness**
Every transaction, every record creation/modification, every workflow change must be logged. Not just custom modules - **all modules**.

**Example:** If HR module creates employee records without ORCA logging, we have a compliance gap.

### 2. **Regulatory Compliance**
Dominican Republic (and many jurisdictions) require complete audit trails for:
- Financial operations (account module)
- Payroll (hr_payroll module)
- Inventory (stock module)
- Sales (sale module)

Refactoring only custom modules leaves legal gaps.

### 3. **EasyCount Integration**
The localization modules must sync with EasyCount for:
- E-CF (electronic fiscal documents)
- DGII compliance
- RNC validation
- Fiscal reporting

This requires ORCA logging at every fiscal operation across all related modules.

### 4. **Data Integrity**
We cannot claim "full audit logging" when only 13 of ~40+ modules are covered. This is incomplete and creates false confidence.

### 5. **Consistency & Architecture**
All modules must follow the same pattern:
```
Every model → OrcaAuditMixin
Every create/write/unlink → Auto-logged via ORCA
Every significant field → Captured in before/after snapshots
```

Not some modules, **all modules**.

---

## Refactoring Rule - One-By-One Execution

### Rule: Sequential Module Refactoring

**Every module must be refactored individually following this pattern:**

1. **Create Module ORCA Variant**
   - File: `models/<module>_orca.py`
   - Class: `<Module>OrcaLog` (inherit from `orca.log`)
   - Define tracked fields specific to module

2. **Apply Mixin to All Relevant Models**
   - Update: `models/<module>.py` files
   - Add: `_inherit = ['<model>', 'orca.audit.mixin']`
   - Define: `_orca_tracked_fields = [...]`
   - Define: `_orca_log_model = '<module>.orca.log'`

3. **Create Security Rules**
   - File: `security/ir.model.access.csv`
   - Rules for: log model access (read-only for accountants, full for managers)

4. **Create UI Views**
   - File: `views/<module>_orca_log_views.xml`
   - List view: Show all logs for the module
   - Form view: Show individual log entry details

5. **Create Tests**
   - File: `tests/test_<module>_orca.py`
   - Test: create hook fires and logs created
   - Test: write hook captures before/after
   - Test: access control enforced

6. **Document Tracked Fields**
   - Update: `README.md` with ORCA section
   - List: Which fields are captured at CRITICAL/HIGH tier
   - Explain: Why these fields matter

7. **Commit with Clear Message**
   ```
   feat: Refactor <module> with ORCA audit logging
   
   - Add <module>_orca.py model
   - Apply OrcaAuditMixin to <X> models
   - Define CRITICAL tier: <fields>
   - Define HIGH tier: <fields>
   - Security rules: accountants read-only, managers full
   - Views: list/form for audit logs
   - Tests: 5 test cases covering create/write/delete hooks
   
   Tracked records: <model1>, <model2>, <model3>
   Tests: <N>/N passing
   ```

---

## Execution Order (Recommended)

Priority order for refactoring:

### Phase 1: Core Financial (HIGH IMPACT)
**Estimated:** 20 hours
1. account - Central to all financial operations
2. account_accountant - Advanced accounting
3. account_payment - Payment tracking
4. account_reports - Financial reporting

### Phase 2: Sales & Revenue (HIGH IMPACT)
**Estimated:** 15 hours
5. sale - Revenue tracking
6. sale_management - Sales process
7. crm - Customer interactions
8. website_sale - E-commerce revenue

### Phase 3: Procurement & Inventory (MEDIUM IMPACT)
**Estimated:** 15 hours
9. purchase - Procurement tracking
10. stock - Inventory movements
11. stock_intrastat - Regulatory compliance

### Phase 4: HR & Payroll (MEDIUM IMPACT)
**Estimated:** 12 hours
12. hr - Employee records
13. hr_payroll - Salary processing
14. hr_expense - Expense tracking

### Phase 5: Manufacturing & Projects (MEDIUM IMPACT)
**Estimated:** 10 hours
15. mrp - Manufacturing orders
16. project - Project tracking

### Phase 6: Website & Support (LOW-MEDIUM IMPACT)
**Estimated:** 8 hours
17. website - Website content
18. crm_livechat - Customer support

---

## Backlog Format (Required)

Every module must have a backlog entry like:

```yaml
- id: OO-401
  module: account
  category: Core Financial
  priority: P0
  estimated_hours: 4
  status: TODO
  tracked_models: 
    - account.move
    - account.journal
    - account.account
  critical_fields: 
    - move_type
    - state
    - amount_total
    - partner_id
  high_fields:
    - ref
    - date
    - company_id
  tests: 5
  comments: "Central financial module - highest priority"
```

---

## Code Review Gate (BLOCKING)

No module refactoring is merged without:

- [ ] OrcaLog model created
- [ ] OrcaAuditMixin applied to all relevant models
- [ ] `_orca_tracked_fields` defined for each model
- [ ] `_orca_log_model` specified correctly
- [ ] Security rules created (ir.model.access.csv)
- [ ] Views created (list/form for audit logs)
- [ ] Tests written (5+ test cases)
- [ ] All tests PASSING
- [ ] README updated with ORCA section
- [ ] Commit message follows template
- [ ] No module can bypass this (applies to ALL)

---

## Non-Negotiable Requirements

1. **Every model change is logged** - create/write/delete
2. **Field snapshots captured** - before/after JSON
3. **User tracked** - who made the change
4. **Timestamp recorded** - when it happened
5. **Access control enforced** - appropriate groups can only read/write logs
6. **Tests prove it works** - not theoretical, proven by tests
7. **Views show it** - users can see logs in Odoo UI
8. **Documented** - why these fields are tracked, tier levels

---

## Exceptions (NONE - There Are No Exceptions)

The following are NOT exceptions:
- "This is a core Odoo module" → Still must refactor
- "This module is rarely used" → Still must refactor
- "This module doesn't handle critical data" → Still must refactor
- "Refactoring is complex" → That's why we plan it properly
- "We don't have time" → MAKE time - this is non-negotiable

---

## Enforcement

### For Code Review
If a PR modifies any Odoo module without ORCA integration:
- [ ] PR is REJECTED
- [ ] Comment: "Module refactoring required - see V19_COMPLETE_MODULE_REFACTORING_MANDATE.md"
- [ ] Provide: Link to backlog item for this module

### For Commits
All commits modifying Odoo modules must reference their backlog ID:
```
feat: Refactor account module with ORCA (OO-401)

...commit message...
```

### For Tracking
A master backlog tracks all modules:
- Completed: 13 custom modules ✅
- In Progress: 0 modules
- Pending: ~30 core modules
- Total: ~40+ modules

---

## Timeline Target

**Phase 1 (20h):** Core financial - Week 1  
**Phase 2 (15h):** Sales/CRM - Week 2  
**Phase 3 (15h):** Procurement/Inventory - Week 3  
**Phase 4 (12h):** HR/Payroll - Week 4  
**Phase 5-6 (18h):** Manufacturing/Website - Week 5  

**Total: ~80 hours over 5 weeks**

---

## This Is Not Optional

Any code that:
- Creates a model in Odoo v19
- Modifies a model in Odoo v19
- Adds business logic to a model in Odoo v19

Must be refactored to include ORCA logging **before** it can be merged.

This applies to:
- ✅ Custom modules
- ✅ Localization modules
- ✅ Core Odoo modules
- ✅ Any future modules

**There are no exceptions.**

---

## Reference Documents

- `task-ledger/V19_COMPLETE_MODULE_REFACTORING_BACKLOG.md` - Full backlog with all ~40 modules
- `task-ledger/V19_LAB_VALIDATION_CHECKPOINT.md` - Lab validation for completed modules
- `task-ledger/V19_ODOO_MODULE_SETUP_GUIDE.md` - How to set up modules for testing
- CLAUDE.md - Updated with this mandate as code review gate

---

**Sign-off:** This mandate is effective immediately and applies to all future work on Odoo v19.

