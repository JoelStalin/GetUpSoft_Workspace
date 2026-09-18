# PHASE 2 Quick-Start Checklist - Sales & CRM Modules

**Status:** READY FOR EXECUTION  
**Duration:** 1 week (15 hours total)  
**Start:** Immediately after Phase 1 merges  
**Deadline:** 5 working days  
**Depends On:** Phase 1 must be merged to main

---

## Prerequisites ✅

- [ ] Phase 1 complete and merged to main
- [ ] All code templates prepared (`PHASE1_CODE_TEMPLATES.md`)
- [ ] Git branch created: `feature/orca-phase-2-sales-crm`
- [ ] No uncommitted changes in working directory

---

## Module 1: `sale` (OO-S-501) - 4 HOURS

### Step 1: Create Module File
```bash
cd 02_Odoo_ERP/Odoo_Consolidated_Library/v19/Modules/sale/models/
touch sale_orca.py
```

### Step 2: Create OrcaLog Model
**Model name:** `sale.order.orca.log`
**Inherit from:** `orca.log`
**Module-specific fields:**
- `customer_name` (Char)
- `amount_total` (Float)
- `state_before` (Char)
- `quotation_sent` (Boolean)

### Step 3: Apply OrcaAuditMixin to Models
**Models to track:**
1. `sale.order`
   - Tracked fields: state, amount_total, amount_untaxed, amount_tax, partner_id, date_order, currency_id, company_id, user_id, payment_term_id, warehouse_id, note
   
2. `sale.order.line`
   - Tracked fields: product_id, product_qty, price_unit, tax_id, state, name
   
3. `sale.order.template` (optional)
   - Tracked fields: name, note, active

### Step 4: Update __init__.py
```python
from . import sale_orca

__all__ = [
    'existing_modules',
    'sale_orca',  # ADD THIS
]
```

### Step 5: Update __manifest__.py
```python
{
    'name': 'Sales (ORCA Integration)',
    'version': '19.0.1.1.0',
    'author': 'getupsoft',
    'depends': [
        'base_orca_integration',  # ADD IF NOT PRESENT
        'existing_deps',
    ],
    'data': [
        'security/ir.model.access.csv',
        'views/sale_orca_log_views.xml',  # ADD THIS
    ],
}
```

### Step 6: Create Security Rules
Add to `security/ir.model.access.csv`:
```csv
access_sale_order_orca_log_user,sale_order_orca_log_user,model_sale_order_orca_log,base.group_user,1,0,0,0
access_sale_order_orca_log_salesman,sale_order_orca_log_salesman,model_sale_order_orca_log,sales_team.group_sale_salesman,1,0,0,0
access_sale_order_orca_log_manager,sale_order_orca_log_manager,model_sale_order_orca_log,sales_team.group_sale_manager,1,1,1,0
```

### Step 7: Create Views
**File:** `views/sale_orca_log_views.xml`
Create list view, form view, action, and menu item for `sale.order.orca.log`

### Step 8: Write Tests
**File:** `tests/test_sale_orca.py`

Write 8 test methods:
1. `test_orca_sale_order_create_logs()`
2. `test_orca_quotation_sent()`
3. `test_orca_order_confirmed()`
4. `test_orca_line_item_changes()`
5. `test_orca_price_modification()`
6. `test_orca_order_cancellation()`
7. `test_orca_field_detection()`
8. `test_orca_access_control()`

### Step 9: Run Tests
```bash
pytest 02_Odoo_ERP/Odoo_Consolidated_Library/v19/Modules/sale/tests/test_sale_orca.py -v
```
**All 8 tests MUST PASS** ✅

### Step 10: Verify in Odoo UI
1. Navigate to: **Sales** → **ORCA Logs** → **Sale Order ORCA Logs**
2. Create a test quotation
3. Verify log entry appears

### Step 11: Commit
```bash
git commit -m "feat: Refactor sale module with ORCA audit logging (OO-S-501)

- Create sale.order.orca.log model
- Apply OrcaAuditMixin to sale.order, sale.order.line, sale.order.template
- Write 8 unit tests (all passing)
- Create security rules and views

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

**Status:** ✅ OO-S-501 COMPLETE

---

## Module 2: `sale_management` (OO-S-502) - 3 HOURS

**File:** `models/sale_management_orca.py`
**Models:**
- sale.order.state
- crm.lead (shared with CRM module)

**Tests:** 6 minimum (order state changes, lead pipeline moves, stage transitions, revenue tracking, user assignment, access control)

**Commit:** `feat: Refactor sale_management module with ORCA audit logging (OO-S-502)`

**Status:** ✅ OO-S-502 COMPLETE

---

## Module 3: `crm` (OO-S-503) - 4 HOURS

**File:** `models/crm_orca.py`
**Models:**
- crm.lead (primary)
- crm.stage
- crm.team

**Tests:** 7 minimum (lead creation, qualification, stage movement, probability changes, revenue updates, lost reason tracking, access control)

**Critical Fields for crm.lead:**
- name, email, phone, partner_id, partner_name, stage_id, probability, expected_revenue, date_deadline, user_id, company_id, type, lost_reason

**Commit:** `feat: Refactor crm module with ORCA audit logging (OO-S-503)`

**Status:** ✅ OO-S-503 COMPLETE

---

## Module 4: `website_sale` (OO-S-504) - 2 HOURS

**File:** `models/website_sale_orca.py`
**Models:**
- website.sale (if exists)
- sale.order (reference for e-commerce fields)

**Tests:** 5 minimum (e-commerce order, cart tracking, payment online, source attribution, access control)

**E-commerce Tracked Fields:**
- cart_value, source (organic, paid, direct), order_id

**Commit:** `feat: Refactor website_sale module with ORCA audit logging (OO-S-504)`

**Status:** ✅ OO-S-504 COMPLETE

---

## Module 5: `crm_phone` (OO-S-505) - 1.5 HOURS

**File:** `models/crm_phone_orca.py`
**Models:**
- crm.phone.call

**Tests:** 3 minimum (phone call logged, duration tracked, access control)

**Tracked Fields:**
- lead_id, partner_id, date, duration, user_id, direction (incoming/outgoing)

**Commit:** `feat: Refactor crm_phone module with ORCA audit logging (OO-S-505)`

**Status:** ✅ OO-S-505 COMPLETE

---

## Phase 2 Completion Checklist

### Code Review Gate (BLOCKING) - 10 Points

**All must be ✅ PASS before merge:**

- [ ] 1. ORCA Integration Complete (5 modules tracked)
- [ ] 2. Tests Written & Passing (29+ total tests)
- [ ] 3. Security & Access Control (all groups configured)
- [ ] 4. Views & UI (all modules have views)
- [ ] 5. Documentation (README updated)
- [ ] 6. Code Quality (no lint errors)
- [ ] 7. Integration Testing (CRM → Sale order flow verified)
- [ ] 8. Performance & Compliance (<10ms latency)
- [ ] 9. Git Commit (clean history, proper messages)
- [ ] 10. Evidence & Sign-off (screenshots + user confirmation)

**MERGE STATUS:** All 10 PASS = APPROVED

---

## Final Steps After Phase 2 Complete

1. **Create PR** with code review gate results
2. **Wait for approval** (all 10 points must pass)
3. **Merge to main**
4. **Update CHANGE_TIMELINE.md** with Phase 2 summary
5. **Begin Phase 3** (Procurement & Inventory)

---

## Quick Reference

**Templates:** `task-ledger/PHASE1_CODE_TEMPLATES.md`
**Implementation:** `task-ledger/PHASE2_SALES_CRM_IMPLEMENTATION.md`
**Backlog:** `task-ledger/V19_COMPLETE_MODULE_REFACTORING_BACKLOG.md`

---

## Success Metrics

✅ **Phase 2 Success:**
- 5 modules refactored
- 29+ tests passing
- ORCA logs visible in Odoo UI
- Code review gate 10/10 pass
- All commits merged to main
- Timeline: 5 working days (15 hours actual work)

