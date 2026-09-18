# PHASE 2: Sales & CRM Modules - Implementation Plan

**Status:** PREPARATION (ready for Phase 1 completion)  
**Phase:** 2 of 5  
**Duration:** 1 week (15 hours)  
**Modules:** 5 (sale, sale_management, crm, website_sale, crm_phone)  
**Priority:** P0 (critical for revenue tracking)  
**Start Date:** After Phase 1 complete + merged  

---

## Overview

Phase 2 refactors the revenue generation system with ORCA audit logging. These 5 modules handle sales orders, quotations, customer relationships, and e-commerce.

**Phase 1 (Core Financial) must complete before Phase 2 starts.**

---

## Module 1: `sale` (OO-S-501)

### Strategic Importance
**CRITICAL** - Central to revenue. Every quotation and sales order flows through here.

### Estimated Hours: 4 hours

### Models to Refactor

#### Primary Models
1. **sale.order** (Most critical)
   - Sales orders, quotations
   - Tracked fields (20+ fields):
     - `state` (draft, sent, sale, done, cancel)
     - `amount_total`, `amount_tax`, `amount_untaxed`
     - `partner_id` (customer)
     - `date_order`
     - `currency_id`, `company_id`
     - `warehouse_id`
     - `note`, `client_order_ref`
     - `payment_term_id`
     - `user_id` (salesperson)

2. **sale.order.line** (Important)
   - Sales order line items
   - Tracked fields:
     - `product_id`
     - `product_qty`, `price_unit`
     - `tax_id`
     - `name` (description)
     - `state`

3. **sale.order.template** (Optional)
   - Quotation templates
   - Tracked fields:
     - `name`
     - `note`
     - `active`

### Tests Required (8 tests)
```python
test_orca_sale_order_create()
test_orca_sale_order_quotation_sent()
test_orca_sale_order_confirmed()
test_orca_sale_order_line_changes()
test_orca_price_modification()
test_orca_order_cancellation()
test_orca_field_detection()
test_orca_access_control()
```

---

## Module 2: `sale_management` (OO-S-502)

### Strategic Importance
**HIGH** - Advanced sales features, workflow management, order fulfillment.

### Estimated Hours: 3 hours

### Models to Refactor

1. **sale.order.state** (Important)
   - Order state tracking
   - Tracked fields: state, status, stage

2. **crm.lead** (Important - shared with CRM)
   - Leads in sales pipeline
   - Tracked fields:
     - `name`, `partner_id`
     - `stage_id`
     - `probability`
     - `expected_revenue`
     - `user_id` (owner)

### Tests Required (6 tests)
```python
test_orca_order_state_changes()
test_orca_lead_pipeline_moves()
test_orca_stage_transitions()
test_orca_revenue_tracking()
test_orca_user_assignment()
test_orca_access_control()
```

---

## Module 3: `crm` (OO-S-503)

### Strategic Importance
**CRITICAL** - Customer relationships, pipeline management, business development.

### Estimated Hours: 4 hours

### Models to Refactor

1. **crm.lead** (Most critical)
   - Leads and opportunities
   - Tracked fields (20+ fields):
     - `name`, `email`, `phone`
     - `partner_id`, `partner_name`
     - `stage_id` (prospect, qualified, proposal, negotiation, won, lost)
     - `probability` (0-100%)
     - `expected_revenue`
     - `date_deadline`
     - `user_id` (salesperson)
     - `company_id`
     - `type` (lead, opportunity)
     - `lost_reason`

2. **crm.stage** (Important)
   - Pipeline stages
   - Tracked fields:
     - `name`, `sequence`
     - `probability`
     - `fold` (hide/show)

3. **crm.team** (Important)
   - Sales teams
   - Tracked fields:
     - `name`, `code`
     - `active`
     - `currency_id`

### Tests Required (7 tests)
```python
test_orca_lead_creation()
test_orca_lead_qualification()
test_orca_stage_movement()
test_orca_probability_changes()
test_orca_revenue_update()
test_orca_lost_reason_tracking()
test_orca_access_control()
```

---

## Module 4: `website_sale` (OO-S-504)

### Strategic Importance
**MEDIUM-HIGH** - E-commerce integration, online sales tracking.

### Estimated Hours: 2 hours

### Models to Refactor

1. **website.sale** (Important)
   - E-commerce orders
   - Tracked fields:
     - `order_id` (sale.order reference)
     - `cart_value`
     - `source` (organic, paid, direct)

2. **sale.order** (reference)
   - Track e-commerce specific fields

### Tests Required (5 tests)
```python
test_orca_ecommerce_order()
test_orca_cart_tracking()
test_orca_payment_online()
test_orca_source_attribution()
test_orca_access_control()
```

---

## Module 5: `crm_phone` (OO-S-505)

### Strategic Importance
**MEDIUM** - Phone call integration with CRM.

### Estimated Hours: 1.5 hours

### Models to Refactor

1. **crm.phone.call** (Important)
   - Phone call records
   - Tracked fields:
     - `lead_id`, `partner_id`
     - `date`, `duration`
     - `user_id` (caller)
     - `direction` (incoming, outgoing)

### Tests Required (3 tests)
```python
test_orca_phone_call_logged()
test_orca_call_duration_tracked()
test_orca_access_control()
```

---

## Implementation Sequence

### Day 1-2: `sale` Module (4 hours)
1. Create sale_orca.py
2. Define OrcaLog model
3. Apply mixin to sale.order (primary)
4. Apply mixin to sale.order.line
5. Create security rules and views
6. Write 8 tests

### Day 3: `sale_management` Module (3 hours)
1. Create sale_management_orca.py
2. Apply mixin to crm.lead (shared with CRM)
3. Apply mixin to sale.order.state
4. Create security rules and views
5. Write 6 tests

### Day 4: `crm` Module (4 hours)
1. Create crm_orca.py
2. Apply mixin to crm.lead
3. Apply mixin to crm.stage
4. Apply mixin to crm.team
5. Create security rules and views
6. Write 7 tests

### Day 5: `website_sale` & `crm_phone` (3.5 hours)
1. Create website_sale_orca.py (2h)
2. Create crm_phone_orca.py (1.5h)
3. Create security rules and views
4. Write 8 tests total

### Day 6-7: Integration & Testing
1. Run all Phase 2 tests (29 tests total)
2. Verify ORCA logging in database
3. Test CRM → Sale order flow
4. Update CHANGE_TIMELINE.md
5. Create commit(s)

**Total: 15 hours (4 days of work + 2 days integration)**

---

## Code Template: crm_orca.py

```python
# v19/Modules/crm/models/crm_orca.py

from odoo import models, fields

class CrmLeadOrcaLog(models.Model):
    """ORCA audit log for crm.lead - Customer relationships"""
    _name = 'crm.lead.orca.log'
    _description = 'CRM Lead Audit Log'
    _inherit = 'orca.log'
    
    # Module-specific fields
    partner_name = fields.Char(string='Partner Name')
    stage_name = fields.Char(string='Stage')
    revenue = fields.Float(string='Expected Revenue')
    probability = fields.Float(string='Probability %')


class CrmLead(models.Model):
    """Inherit crm.lead with ORCA audit logging"""
    _inherit = ['crm.lead', 'orca.audit.mixin']
    
    _orca_tracked_fields = [
        'name', 'email', 'phone', 'partner_id', 'stage_id',
        'probability', 'expected_revenue', 'date_deadline',
        'user_id', 'type', 'lost_reason', 'company_id'
    ]
    _orca_log_model = 'crm.lead.orca.log'


class CrmStage(models.Model):
    """Inherit crm.stage with ORCA audit logging"""
    _inherit = ['crm.stage', 'orca.audit.mixin']
    
    _orca_tracked_fields = [
        'name', 'sequence', 'probability', 'fold'
    ]
    _orca_log_model = 'crm.lead.orca.log'


class CrmTeam(models.Model):
    """Inherit crm.team with ORCA audit logging"""
    _inherit = ['crm.team', 'orca.audit.mixin']
    
    _orca_tracked_fields = [
        'name', 'code', 'active', 'currency_id'
    ]
    _orca_log_model = 'crm.lead.orca.log'
```

---

## Success Criteria

✅ **All 5 modules refactored**
✅ **29+ tests written and passing**
✅ **Security rules enforced**
✅ **UI views created**
✅ **Documentation updated**
✅ **Git commits clean**
✅ **ORCA logs visible in Odoo UI**
✅ **CRM → Sale order flow tracked**

---

## Integration Points with Other Phases

**Depends on:**
- Phase 1 (Core Financial) - Must complete first

**Blocks:**
- Phase 3 (Procurement) - Inventory linked to sales

**Integrates with:**
- Sales orders → Invoices (Phase 1)
- Customer data → Financial records

---

## What Happens After Phase 2

- ✅ Phase 2 complete → Phase 3 unlocks (Procurement)
- ✅ Revenue generation fully logged
- ✅ Sales pipeline completely audited
- ✅ Pattern established across CRM and Financial

