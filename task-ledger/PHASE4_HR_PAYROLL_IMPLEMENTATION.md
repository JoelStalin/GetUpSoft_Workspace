# PHASE 4: HR & Payroll Modules - Implementation Plan

**Status:** PREPARATION  
**Phase:** 4 of 5  
**Duration:** 1 week (12 hours)  
**Modules:** 6 (hr, hr_org_chart, hr_holidays, hr_expense, payroll, hr_payroll)  
**Priority:** P0 (compliance critical)  
**Start Date:** After Phase 3 complete

---

## Overview

Phase 4 refactors human resources and payroll with ORCA audit logging. These 6 modules handle employee records, time off, expenses, and salary processing.

---

## Module 1: `hr` (OO-H-701)

### Estimated Hours: 3 hours

### Models to Refactor

1. **hr.employee** (Critical)
   - Employee records
   - Tracked fields:
     - `name`, `email`, `phone`
     - `department_id`, `job_id`
     - `manager_id`, `company_id`
     - `identification_id` (ID number)
     - `active`

2. **hr.department** (Important)
   - Organizational structure
   - Tracked fields:
     - `name`, `code`
     - `parent_id`, `company_id`

3. **hr.job** (Important)
   - Job positions
   - Tracked fields:
     - `name`, `description`

### Tests Required (6 tests)

---

## Module 2: `hr_org_chart` (OO-H-702)

### Estimated Hours: 1.5 hours

### Models to Refactor

1. **hr.employee.hierarchy** (Important)
   - Organizational hierarchy
   - Tracked fields:
     - `employee_id`, `parent_id`
     - `reporting_line`

### Tests Required (3 tests)

---

## Module 3: `hr_holidays` (OO-H-703)

### Estimated Hours: 2.5 hours

### Models to Refactor

1. **hr.leave** (Critical)
   - Time off requests
   - Tracked fields:
     - `employee_id`
     - `leave_type_id`
     - `state` (draft, confirm, refuse, cancel, validate)
     - `date_from`, `date_to`
     - `number_of_days`

2. **hr.leave.allocation** (Important)
   - Leave allocations
   - Tracked fields:
     - `employee_id`, `leave_type_id`
     - `number_of_days`
     - `state`

3. **hr.leave.type** (Important)
   - Leave types (vacation, sick, etc.)
   - Tracked fields:
     - `name`, `code`
     - `active`

### Tests Required (5 tests)

---

## Module 4: `hr_expense` (OO-H-704)

### Estimated Hours: 2 hours

### Models to Refactor

1. **hr.expense** (Important)
   - Expense reports
   - Tracked fields:
     - `employee_id`
     - `amount`, `currency_id`
     - `date`, `state`
     - `description`, `category`

2. **hr.expense.sheet** (Important)
   - Expense sheets
   - Tracked fields:
     - `employee_id`
     - `total_amount`
     - `state` (draft, report_to_submit, submit, approve, post, done)

### Tests Required (4 tests)

---

## Module 5: `payroll` (OO-H-705)

### Estimated Hours: 2 hours

### Models to Refactor

1. **hr.payslip** (Critical)
   - Salary slips
   - Tracked fields:
     - `employee_id`
     - `date_from`, `date_to`
     - `state` (draft, verify, done, cancel)
     - `basic_salary`
     - `net_wage`
     - `company_id`

2. **hr.salary.rule** (Important)
   - Salary rules
   - Tracked fields:
     - `name`, `code`
     - `sequence`
     - `category_id`

### Tests Required (5 tests)

---

## Module 6: `hr_payroll` (OO-H-706)

### Estimated Hours: 1 hour

### Models to Refactor

1. **hr.payslip.line** (Important)
   - Payslip line items
   - Tracked fields:
     - `name`, `code`
     - `amount`
     - `payslip_id`

### Tests Required (2 tests)

---

## Implementation Sequence

**Days 1-7: Sequential module implementation**
- Day 1: hr module (3h)
- Day 2: hr_org_chart (1.5h)
- Day 3: hr_holidays (2.5h)
- Day 4: hr_expense (2h)
- Day 5: payroll & hr_payroll (3h)
- Days 6-7: Integration & testing (2h)

**Total: 12 hours**

---

## Success Criteria

✅ **All 6 modules refactored**
✅ **25+ tests written and passing**
✅ **Employee records fully audited**
✅ **Payroll processing logged**
✅ **Leave management tracked**
✅ **Expense reports logged**

