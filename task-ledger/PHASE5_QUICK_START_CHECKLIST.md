# PHASE 5 Quick-Start Checklist - Manufacturing & Projects Modules

**Status:** READY FOR EXECUTION  
**Duration:** 1.5 weeks (17 hours total)  
**Start:** Immediately after Phase 4 merges  
**Deadline:** 7 working days  
**Depends On:** Phase 4 must be merged to main

---

## Module 1: `mrp` (OO-M-801) - 4 HOURS

### Models to Track:
1. **mrp.production** (critical)
   - Tracked fields: state, product_id, product_qty, bom_id, date_planned_start, date_planned_finished, company_id, user_id, picking_type_id

2. **mrp.bom** (important)
   - Tracked fields: product_id, product_qty, type, code, active, company_id

3. **mrp.bom.line** (important)
   - Tracked fields: product_id, product_qty, bom_id, sequence

### Tests: 8 minimum

**Commit:** `feat: Refactor mrp module with ORCA audit logging (OO-M-801)`

---

## Module 2: `mrp_byproduct` (OO-M-802) - 1.5 HOURS

### Models to Track:
- **mrp.bom.byproduct**
  - Tracked fields: product_id, product_qty, bom_id, cost_share

### Tests: 3 minimum

**Commit:** `feat: Refactor mrp_byproduct module with ORCA audit logging (OO-M-802)`

---

## Module 3: `quality` (OO-M-803) - 3 HOURS

### Models to Track:
1. **quality.point**
   - Tracked fields: name, test_type, picking_type_ids, product_ids, active

2. **quality.check**
   - Tracked fields: point_id, product_id, quantity, qty_done, state, date, user_id

3. **quality.alert**
   - Tracked fields: name, check_id, stage_id, company_id

### Tests: 6 minimum

**Commit:** `feat: Refactor quality module with ORCA audit logging (OO-M-803)`

---

## Module 4: `project` (OO-M-804) - 4 HOURS

### Models to Track:
1. **project.project** (critical)
   - Tracked fields: name, state, partner_id, analytic_account_id, user_id, date_start, date_end, company_id, budget_amount, active

2. **project.task** (critical)
   - Tracked fields: name, project_id, stage_id, user_ids, partner_id, date_start, date_deadline, priority, state, progress, company_id

3. **project.stage** (important)
   - Tracked fields: name, sequence, fold

### Tests: 8 minimum

**Commit:** `feat: Refactor project module with ORCA audit logging (OO-M-804)`

---

## Module 5: `project_enterprise` (OO-M-805) - 4.5 HOURS

### Models to Track:
1. **project.milestone**
   - Tracked fields: name, project_id, date, is_reached

2. **analytic.line**
   - Tracked fields: task_id, project_id, employee_id, unit_amount, date, state

3. **project.forecast**
   - Tracked fields: project_id, employee_id, date_start, date_end, unit_amount

### Tests: 7 minimum

**Commit:** `feat: Refactor project_enterprise module with ORCA audit logging (OO-M-805)`

---

## Phase 5 Completion Checklist

### Code Review Gate - 10 Points ✅

- [ ] 1. ORCA Integration (5 modules)
- [ ] 2. Tests (32+ passing)
- [ ] 3. Security & Access Control
- [ ] 4. Views & UI
- [ ] 5. Documentation
- [ ] 6. Code Quality
- [ ] 7. Integration Testing (MO → Projects → Timesheets)
- [ ] 8. Performance & Compliance
- [ ] 9. Git Commit
- [ ] 10. Evidence & Sign-off

**MERGE STATUS:** All 10 PASS = APPROVED

---

## Success Metrics

✅ **Phase 5 Success:**
- 5 modules refactored
- 32+ tests passing
- Manufacturing operations fully audited
- Code review gate 10/10 pass
- All commits merged to main
- Timeline: 7 working days (17 hours)

