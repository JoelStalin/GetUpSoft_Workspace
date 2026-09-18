# PHASE 3 Quick-Start Checklist - Procurement & Inventory Modules

**Status:** READY FOR EXECUTION  
**Duration:** 1 week (15 hours total)  
**Start:** Immediately after Phase 2 merges  
**Deadline:** 5 working days  
**Depends On:** Phase 2 must be merged to main

---

## Prerequisites ✅

- [ ] Phase 2 complete and merged to main
- [ ] Code templates ready (`PHASE1_CODE_TEMPLATES.md`)
- [ ] Git branch created: `feature/orca-phase-3-procurement`
- [ ] No uncommitted changes

---

## Module 1: `purchase` (OO-P-601) - 4 HOURS

### Models to Track:
1. **purchase.order** (critical)
   - Tracked fields: state, amount_total, amount_tax, partner_id, date_order, date_planned, currency_id, company_id, warehouse_id, user_id, notes, incoterm_id

2. **purchase.order.line** (important)
   - Tracked fields: product_id, product_qty, price_unit, date_planned, taxes_id

3. **purchase.requisition** (important)
   - Tracked fields: vendor_id, state, date_end

### Tests: 8 minimum
- test_orca_purchase_order_create()
- test_orca_rfq_sent()
- test_orca_order_confirmed()
- test_orca_line_item_changes()
- test_orca_quantity_modification()
- test_orca_price_changes()
- test_orca_cancellation()
- test_orca_access_control()

**Commit:** `feat: Refactor purchase module with ORCA audit logging (OO-P-601)`

---

## Module 2: `purchase_stock` (OO-P-602) - 2.5 HOURS

### Models to Track:
- purchase.order (inventory-related fields)
- stock.move (track from PO)

### Tests: 5 minimum
- test_orca_po_to_inventory()
- test_orca_receipt_tracking()
- test_orca_quantity_matching()
- test_orca_warehouse_tracking()
- test_orca_access_control()

**Commit:** `feat: Refactor purchase_stock module with ORCA audit logging (OO-P-602)`

---

## Module 3: `purchase_requisition` (OO-P-603) - 2 HOURS

### Models to Track:
1. **purchase.requisition**
   - Tracked fields: vendor_id, partner_id, state, date_end, user_id

2. **purchase.requisition.line**
   - Tracked fields: product_id, product_qty, schedule_date

### Tests: 4 minimum
- test_orca_requisition_create()
- test_orca_requisition_state()
- test_orca_vendor_assignment()
- test_orca_access_control()

**Commit:** `feat: Refactor purchase_requisition module with ORCA audit logging (OO-P-603)`

---

## Module 4: `stock` (OO-I-604) - 4.5 HOURS

### Models to Track:
1. **stock.move** (critical)
   - Tracked fields: state, product_id, quantity, location_id, location_dest_id, warehouse_id, date, date_deadline, picking_id, company_id

2. **stock.picking** (important)
   - Tracked fields: state, picking_type_id, date_done, partner_id

3. **stock.quant** (important)
   - Tracked fields: product_id, quantity, location_id, reserved_quantity

4. **stock.location** (important)
   - Tracked fields: name, code, location_id, usage

### Tests: 9 minimum
- test_orca_inventory_movement()
- test_orca_picking_operation()
- test_orca_quantity_changes()
- test_orca_location_transfer()
- test_orca_warehouse_moves()
- test_orca_reserved_quantity()
- test_orca_stock_adjustment()
- test_orca_transfer_done()
- test_orca_access_control()

**Commit:** `feat: Refactor stock module with ORCA audit logging (OO-I-604)`

---

## Module 5: `stock_intrastat` (OO-I-605) - 1.5 HOURS

### Models to Track:
1. **stock.move.line**
   - Tracked fields: intrastat_code, country_id, weight, value

2. **intrastat.report**
   - Tracked fields: date_from, date_to, company_id

### Tests: 3 minimum
- test_orca_intrastat_tracking()
- test_orca_country_classification()
- test_orca_access_control()

**Commit:** `feat: Refactor stock_intrastat module with ORCA audit logging (OO-I-605)`

---

## Phase 3 Completion Checklist

### Code Review Gate - 10 Points ✅

All must PASS before merge:
- [ ] 1. ORCA Integration Complete (5 modules)
- [ ] 2. Tests Written & Passing (31+ tests)
- [ ] 3. Security & Access Control
- [ ] 4. Views & UI
- [ ] 5. Documentation
- [ ] 6. Code Quality
- [ ] 7. Integration Testing (PO → Receipt → Inventory flow)
- [ ] 8. Performance & Compliance
- [ ] 9. Git Commit
- [ ] 10. Evidence & Sign-off

**MERGE STATUS:** All 10 PASS = APPROVED

---

## Success Metrics

✅ **Phase 3 Success:**
- 5 modules refactored
- 31+ tests passing
- Complete PO → Receipt → Inventory flow audited
- Code review gate 10/10 pass
- All commits merged to main
- Timeline: 5 working days (15 hours)

