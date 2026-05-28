# PHASE 4 Quick-Start Checklist - HR & Payroll Modules

**Status:** READY FOR EXECUTION  
**Duration:** 1 week (12 hours total)  
**Start:** Immediately after Phase 3 merges  
**Deadline:** 5 working days  
**Depends On:** Phase 3 must be merged to main

---

## Module 1: `hr` (OO-H-701) - 3 HOURS

### Models to Track:
1. **hr.employee** (critical)
   - Tracked fields: name, email, phone, department_id, job_id, manager_id, company_id, identification_id, active

2. **hr.department** (important)
   - Tracked fields: name, code, parent_id, company_id

3. **hr.job** (important)
   - Tracked fields: name, description

### Tests: 6 minimum

**Commit:** `feat: Refactor hr module with ORCA audit logging (OO-H-701)`

---

## Module 2: `hr_org_chart` (OO-H-702) - 1.5 HOURS

### Models to Track:
- **hr.employee.hierarchy**
  - Tracked fields: employee_id, parent_id, reporting_line

### Tests: 3 minimum

**Commit:** `feat: Refactor hr_org_chart module with ORCA audit logging (OO-H-702)`

---

## Module 3: `hr_holidays` (OO-H-703) - 2.5 HOURS

### Models to Track:
1. **hr.leave** (critical)
   - Tracked fields: employee_id, leave_type_id, state, date_from, date_to, number_of_days

2. **hr.leave.allocation** (important)
   - Tracked fields: employee_id, leave_type_id, number_of_days, state

3. **hr.leave.type** (important)
   - Tracked fields: name, code, active

### Tests: 5 minimum

**Commit:** `feat: Refactor hr_holidays module with ORCA audit logging (OO-H-703)`

---

## Module 4: `hr_expense` (OO-H-704) - 2 HOURS

### Models to Track:
1. **hr.expense**
   - Tracked fields: employee_id, amount, currency_id, date, state, description, category

2. **hr.expense.sheet**
   - Tracked fields: employee_id, total_amount, state

### Tests: 4 minimum

**Commit:** `feat: Refactor hr_expense module with ORCA audit logging (OO-H-704)`

---

## Module 5: `payroll` (OO-H-705) - 2 HOURS

### Models to Track:
1. **hr.payslip** (critical)
   - Tracked fields: employee_id, date_from, date_to, state, basic_salary, net_wage, company_id

2. **hr.salary.rule** (important)
   - Tracked fields: name, code, sequence, category_id

### Tests: 5 minimum

**Commit:** `feat: Refactor payroll module with ORCA audit logging (OO-H-705)`

---

## Module 6: `hr_payroll` (OO-H-706) - 1 HOUR

### Models to Track:
- **hr.payslip.line**
  - Tracked fields: name, code, amount, payslip_id

### Tests: 2 minimum

**Commit:** `feat: Refactor hr_payroll module with ORCA audit logging (OO-H-706)`

---

## Phase 4 Completion Checklist

### Code Review Gate - 10 Points ✅

- [ ] 1. ORCA Integration (6 modules)
- [ ] 2. Tests (25+ passing)
- [ ] 3. Security & Access Control
- [ ] 4. Views & UI
- [ ] 5. Documentation
- [ ] 6. Code Quality
- [ ] 7. Integration Testing (HR → Payroll → Finance flow)
- [ ] 8. Performance & Compliance
- [ ] 9. Git Commit
- [ ] 10. Evidence & Sign-off

**MERGE STATUS:** All 10 PASS = APPROVED

---

## Success Metrics

✅ **Phase 4 Success:**
- 6 modules refactored
- 25+ tests passing
- Employee records fully audited
- Code review gate 10/10 pass
- All commits merged to main
- Timeline: 5 working days (12 hours)

