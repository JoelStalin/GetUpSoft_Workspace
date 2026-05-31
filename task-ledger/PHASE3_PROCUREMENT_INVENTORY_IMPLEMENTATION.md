# PHASE 3: Procurement & Inventory Modules - Implementation Plan

**Status:** PREPARATION (ready for Phase 2 completion)  
**Phase:** 3 of 5  
**Duration:** 1 week (15 hours)  
**Modules:** 5 (purchase, purchase_stock, purchase_requisition, stock, stock_intrastat)  
**Priority:** P0 (critical for supply chain)  
**Start Date:** After Phase 2 complete + merged  

---

## Overview

Phase 3 refactors the supply chain with ORCA audit logging. These 5 modules handle procurement, inventory movements, warehousing, and inbound logistics.

**Phase 2 (Sales & CRM) must complete before Phase 3 starts.**

---

## Module 1: `purchase` (OO-P-601)

### Strategic Importance
**CRITICAL** - Central to procurement. Every RFQ and purchase order flows through here.

### Estimated Hours: 4 hours

### Models to Refactor

1. **purchase.order** (Most critical)
   - Purchase orders, RFQs
   - Tracked fields (20+ fields):
     - `state` (draft, sent, to approve, purchase, done, cancel)
     - `amount_total`, `amount_tax`
     - `partner_id` (vendor)
     - `date_order`, `date_planned`
     - `currency_id`, `company_id`
     - `warehouse_id`
     - `user_id` (purchaser)
     - `notes`
     - `incoterm_id`

2. **purchase.order.line** (Important)
   - PO line items
   - Tracked fields:
     - `product_id`
     - `product_qty`, `price_unit`
     - `date_planned`
     - `taxes_id`

3. **purchase.requisition** (Important)
   - Purchase requests
   - Tracked fields:
     - `vendor_id`
     - `state`
     - `date_end`

### Tests Required (8 tests)
```python
test_orca_purchase_order_create()
test_orca_rfq_sent()
test_orca_order_confirmed()
test_orca_line_item_changes()
test_orca_quantity_modification()
test_orca_price_changes()
test_orca_cancellation()
test_orca_access_control()
```

---

## Module 2: `purchase_stock` (OO-P-602)

### Strategic Importance
**HIGH** - Links procurement with inventory.

### Estimated Hours: 2.5 hours

### Models to Refactor

1. **purchase.order** (reference)
   - Track inventory-related fields

2. **stock.move** (reference)
   - Track moves from PO

### Tests Required (5 tests)
```python
test_orca_po_to_inventory()
test_orca_receipt_tracking()
test_orca_quantity_matching()
test_orca_warehouse_tracking()
test_orca_access_control()
```

---

## Module 3: `purchase_requisition` (OO-P-603)

### Strategic Importance
**MEDIUM** - Purchase request management.

### Estimated Hours: 2 hours

### Models to Refactor

1. **purchase.requisition** (Important)
   - Purchase requisitions
   - Tracked fields:
     - `vendor_id`, `partner_id`
     - `state` (draft, in progress, done, cancel)
     - `date_end`
     - `user_id`

2. **purchase.requisition.line** (Important)
   - Requisition line items
   - Tracked fields:
     - `product_id`, `product_qty`
     - `schedule_date`

### Tests Required (4 tests)
```python
test_orca_requisition_create()
test_orca_requisition_state()
test_orca_vendor_assignment()
test_orca_access_control()
```

---

## Module 4: `stock` (OO-I-604)

### Strategic Importance
**CRITICAL** - Inventory management, the heart of supply chain.

### Estimated Hours: 4.5 hours

### Models to Refactor

1. **stock.move** (Most critical)
   - Inventory movements
   - Tracked fields (20+ fields):
     - `state` (draft, confirmed, assigned, done, cancel)
     - `product_id`, `quantity`
     - `location_id`, `location_dest_id`
     - `warehouse_id`
     - `date`, `date_deadline`
     - `picking_id` (related operation)
     - `company_id`

2. **stock.picking** (Important)
   - Transfer operations
   - Tracked fields:
     - `state` (draft, confirmed, assigned, done, cancel)
     - `picking_type_id`
     - `date_done`
     - `partner_id`

3. **stock.quant** (Important)
   - Inventory quantity
   - Tracked fields:
     - `product_id`
     - `quantity`
     - `location_id`
     - `reserved_quantity`

4. **stock.location** (Important)
   - Warehouse locations
   - Tracked fields:
     - `name`, `code`
     - `location_id` (parent)
     - `usage` (internal, supplier, customer, transit, agile_manufacturing)

### Tests Required (9 tests)
```python
test_orca_inventory_movement()
test_orca_picking_operation()
test_orca_quantity_changes()
test_orca_location_transfer()
test_orca_warehouse_moves()
test_orca_reserved_quantity()
test_orca_stock_adjustment()
test_orca_transfer_done()
test_orca_access_control()
```

---

## Module 5: `stock_intrastat` (OO-I-605)

### Strategic Importance
**MEDIUM** - International trade reporting.

### Estimated Hours: 1.5 hours

### Models to Refactor

1. **stock.move.line** (Important)
   - Intrastat tracking
   - Tracked fields:
     - `intrastat_code`
     - `country_id`
     - `weight`
     - `value`

2. **intrastat.report** (Important)
   - Intrastat reporting
   - Tracked fields:
     - `date_from`, `date_to`
     - `company_id`

### Tests Required (3 tests)
```python
test_orca_intrastat_tracking()
test_orca_country_classification()
test_orca_access_control()
```

---

## Implementation Sequence

### Day 1-2: `purchase` Module (4 hours)
1. Create purchase_orca.py
2. Define OrcaLog model
3. Apply mixin to purchase.order (primary)
4. Apply mixin to purchase.order.line
5. Apply mixin to purchase.requisition
6. Create security rules and views
7. Write 8 tests

### Day 3: `purchase_stock` & `purchase_requisition` (4.5 hours)
1. Create purchase_stock_orca.py (2.5h)
2. Create purchase_requisition_orca.py (2h)
3. Create security rules and views
4. Write 9 tests total

### Day 4: `stock` Module (4.5 hours)
1. Create stock_orca.py
2. Apply mixin to stock.move (critical)
3. Apply mixin to stock.picking
4. Apply mixin to stock.quant
5. Apply mixin to stock.location
6. Create security rules and views
7. Write 9 tests

### Day 5: `stock_intrastat` (1.5 hours)
1. Create stock_intrastat_orca.py
2. Create security rules and views
3. Write 3 tests

### Day 6-7: Integration & Testing
1. Run all Phase 3 tests (31 tests total)
2. Verify PO → Receipt → Inventory flow
3. Test intrastat reporting
4. Update CHANGE_TIMELINE.md
5. Create commit(s)

**Total: 15 hours (5 days of work + 2 days integration)**

---

## Integration Points with Other Phases

**Depends on:**
- Phase 1 (Core Financial) - Vendor invoices
- Phase 2 (Sales & CRM) - Stock levels affect sales

**Blocks:**
- Phase 4 (HR) - Production planning depends on inventory

**Integrates with:**
- Purchase orders → Vendor invoices (Phase 1)
- Warehouse transfers → Stock accounting
- Intrastat → International compliance

---

## Success Criteria

✅ **All 5 modules refactored**
✅ **31+ tests written and passing**
✅ **Supply chain fully logged**
✅ **Intrastat compliance tracked**
✅ **PO → Receipt → Inventory flow audited**

