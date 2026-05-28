# V19 Complete Module Refactoring Backlog

**Status:** Active  
**Last Updated:** 2026-05-28  
**Total Modules:** 43 modules  
**Completed:** 13 custom modules ✅  
**Remaining:** 30 core + localization modules  
**Total Estimated Effort:** 80+ hours

---

## PHASE 1: Core Financial Modules (CRITICAL) - 20 hours

| ID | Module | Est. Hours | Priority | Status | Tracked Models | Tests | Notes |
|----|--------|-----------|----------|--------|---|----|----|
| OO-F-401 | account | 4h | P0 | TODO | account.move, account.journal, account.account, account.analytic | 8 | Chart of accounts, journal entries, moves |
| OO-F-402 | account_accountant | 3h | P0 | TODO | account.move.line, account.tax, account.bank | 6 | Advanced accounting, tax computation |
| OO-F-403 | account_payment | 3.5h | P0 | TODO | account.payment, account.payment.method | 6 | Payment processing, method tracking |
| OO-F-404 | account_reports | 2.5h | P0 | TODO | report.*, account.report.* | 5 | Financial reports, DGII compliance |

**Subtotal: 13 hours**

---

## PHASE 2: Sales & Revenue Modules (HIGH) - 15 hours

| ID | Module | Est. Hours | Priority | Status | Tracked Models | Tests | Notes |
|----|--------|-----------|----------|--------|---|----|----|
| OO-S-501 | sale | 4h | P0 | TODO | sale.order, sale.order.line, sale.order.template | 8 | Quotations, sales orders, order lines |
| OO-S-502 | sale_management | 3h | P0 | TODO | sale.order.state, crm.lead | 6 | Sales workflow, pipeline management |
| OO-S-503 | crm | 4h | P0 | TODO | crm.lead, crm.opportunity, crm.stage | 7 | Leads, opportunities, pipeline |
| OO-S-504 | website_sale | 2h | P1 | TODO | website.*, sale.order | 5 | E-commerce integration, cart tracking |
| OO-S-505 | crm_phone | 1.5h | P1 | TODO | crm.phone.call | 3 | Phone integration logging |

**Subtotal: 14.5 hours**

---

## PHASE 3: Procurement & Inventory (MEDIUM-HIGH) - 15 hours

| ID | Module | Est. Hours | Priority | Status | Tracked Models | Tests | Notes |
|----|--------|-----------|----------|--------|---|----|----|
| OO-P-601 | purchase | 4h | P0 | TODO | purchase.order, purchase.order.line, purchase.requisition | 8 | RFQ, purchase orders, requisitions |
| OO-P-602 | purchase_stock | 2.5h | P0 | TODO | purchase.order, stock.move | 5 | Inventory integration |
| OO-P-603 | purchase_requisition | 2h | P0 | TODO | purchase.requisition, purchase.requisition.line | 4 | Purchase requests, approvals |
| OO-I-604 | stock | 4.5h | P0 | TODO | stock.move, stock.picking, stock.quant, stock.location | 9 | Inventory movements, transfers, locations |
| OO-I-605 | stock_intrastat | 1.5h | P1 | TODO | stock.move.line, intrastat.report | 3 | Regulatory compliance reporting |

**Subtotal: 14.5 hours**

---

## PHASE 4: HR & Payroll (MEDIUM) - 12 hours

| ID | Module | Est. Hours | Priority | Status | Tracked Models | Tests | Notes |
|----|--------|-----------|----------|--------|---|----|----|
| OO-H-701 | hr | 3h | P0 | TODO | hr.employee, hr.department, hr.job | 6 | Employee records, org structure |
| OO-H-702 | hr_org_chart | 1.5h | P1 | TODO | hr.employee.hierarchy | 3 | Organizational relationships |
| OO-H-703 | hr_holidays | 2.5h | P0 | TODO | hr.leave, hr.leave.allocation, hr.leave.type | 5 | Time off requests, allocations |
| OO-H-704 | hr_expense | 2h | P0 | TODO | hr.expense, hr.expense.sheet | 4 | Expense reports and approvals |
| OO-H-705 | payroll | 2h | P0 | TODO | hr.payroll, hr.salary.rule, hr.payslip | 5 | Payroll processing, salary rules |
| OO-H-706 | hr_payroll | 1h | P0 | TODO | hr.payslip.line | 2 | HR + Payroll integration |

**Subtotal: 12 hours**

---

## PHASE 5: Manufacturing & Quality (MEDIUM) - 10 hours

| ID | Module | Est. Hours | Priority | Status | Tracked Models | Tests | Notes |
|----|--------|-----------|----------|--------|---|----|----|
| OO-M-801 | mrp | 3.5h | P0 | TODO | mrp.production, mrp.bom, mrp.workorder | 7 | Manufacturing orders, BOMs |
| OO-M-802 | mrp_byproduct | 1.5h | P1 | TODO | mrp.bom.line | 3 | Byproduct handling |
| OO-Q-803 | quality | 2h | P1 | TODO | quality.check, quality.rule | 4 | Quality control, inspections |
| OO-P-804 | project | 2h | P1 | TODO | project.project, project.task, project.stage | 5 | Projects, tasks, stages |
| OO-P-805 | project_enterprise | 1h | P1 | TODO | project.milestone | 2 | Advanced features |

**Subtotal: 10 hours**

---

## PHASE 6: Website & Support (LOW-MEDIUM) - 8 hours

| ID | Module | Est. Hours | Priority | Status | Tracked Models | Tests | Notes |
|----|--------|-----------|----------|--------|---|----|----|
| OO-W-901 | website | 2h | P1 | TODO | website.page, website.menu, ir.ui.view | 4 | Website pages, menus, content |
| OO-W-902 | website_form | 1.5h | P1 | TODO | survey.*, website.form | 3 | Form submissions, surveys |
| OO-S-903 | crm_livechat | 1.5h | P2 | TODO | crm.livechat, crm.livechat.channel | 3 | Live chat conversations |
| OO-S-904 | sales_team | 1.5h | P1 | TODO | crm.team, crm.team.member | 3 | Sales team structure |
| OO-L-905 | web | 0.5h | P2 | TODO | web.* | 1 | Core web framework (minimal) |

**Subtotal: 7 hours**

---

## ALREADY COMPLETED: Custom & Localization (13 modules) ✅

| ID | Module | Hours | Priority | Status | Tests | Notes |
|----|--------|-------|----------|--------|-------|-------|
| OO-C-001 | base_orca_integration | 2h | P0 | ✅ DONE | 4 | ORCA foundation, abstract models, mixin |
| OO-C-002 | account_extended | 3h | P0 | ✅ DONE | 5 | Account move ORCA logging |
| OO-C-003 | asset_extended | 2h | P0 | ✅ DONE | 4 | Fixed asset tracking |
| OO-C-004 | bank_extended | 2h | P0 | ✅ DONE | 4 | Bank statement reconciliation |
| OO-C-005 | invoice_extended | 2h | P0 | ✅ DONE | 4 | Invoice line tracking |
| OO-C-006 | l10n_do_accounting | 4h | P0 | ✅ DONE | 6 | Dominican accounting + e-CF |
| OO-C-007 | l10n_do_accounting_report | 3h | P0 | ✅ DONE | 5 | DGII reporting |
| OO-C-008 | l10n_do_pos | 3h | P0 | ✅ DONE | 5 | POS fiscal controls |
| OO-C-009 | l10n_do_rnc_search | 2h | P0 | ✅ DONE | 3 | RNC validation |
| OO-C-010 | payment_extended | 2h | P0 | ✅ DONE | 4 | Payment tracking |
| OO-C-011 | pos_extended | 3h | P0 | ✅ DONE | 5 | POS order logging |
| OO-C-012 | sale_extended | 3h | P0 | ✅ DONE | 5 | Sales order logging |
| OO-C-013 | stock_extended | 2h | P0 | ✅ DONE | 4 | Inventory movement logging |

**Subtotal: 33 hours - ALL COMPLETE ✅**

---

## Summary

| Phase | Category | Modules | Hours | Status |
|-------|----------|---------|-------|--------|
| ✅ 0 | Custom/Localization | 13 | 33h | COMPLETE |
| ⏳ 1 | Core Financial | 4 | 13h | TODO |
| ⏳ 2 | Sales & Revenue | 5 | 14.5h | TODO |
| ⏳ 3 | Procurement & Inventory | 5 | 14.5h | TODO |
| ⏳ 4 | HR & Payroll | 6 | 12h | TODO |
| ⏳ 5 | Manufacturing | 5 | 10h | TODO |
| ⏳ 6 | Website & Support | 5 | 7h | TODO |

**Total: 43 modules, 103.5 hours estimated effort**

---

## Execution Plan

### Week 1: Core Financial (Phase 1)
- Start: 2026-06-04
- Modules: account, account_accountant, account_payment, account_reports
- Time: 20 hours
- Dependencies: None (must finish lab validation first)

### Week 2: Sales & Revenue (Phase 2)
- Start: 2026-06-11
- Modules: sale, sale_management, crm, website_sale, crm_phone
- Time: 15 hours
- Dependencies: Phase 1 complete

### Week 3: Procurement & Inventory (Phase 3)
- Start: 2026-06-18
- Modules: purchase, purchase_stock, purchase_requisition, stock, stock_intrastat
- Time: 15 hours
- Dependencies: Phase 1, 2 complete

### Weeks 4-5: HR/Payroll + Manufacturing + Website (Phases 4-6)
- Parallel execution of lower-priority phases
- Time: 30 hours
- Dependencies: Phases 1-3 complete

---

## Backlog Item Template (For Each Module)

When creating backlog items, use this template:

```markdown
# OO-XXX: Refactor <Module Name> with ORCA Integration

## Module Info
- **Name:** <module_name>
- **Category:** <Financial/Sales/HR/etc>
- **Priority:** P0/P1/P2
- **Estimated Hours:** <N>h
- **Complexity:** Low/Medium/High

## Scope
- Models to track: <model1>, <model2>, ...
- CRITICAL tier fields: <field1>, <field2>, ...
- HIGH tier fields: <field3>, <field4>, ...
- Total fields: ~<N> fields across <M> models

## Acceptance Criteria
- [ ] OrcaLog model created
- [ ] OrcaAuditMixin applied to all relevant models
- [ ] _orca_tracked_fields defined correctly
- [ ] Security rules created (accountant read-only, manager full)
- [ ] Views created (list/form for logs)
- [ ] <N> test cases written and passing
- [ ] README updated with ORCA section
- [ ] Commit message references this ticket

## Technical Details
- Create: `models/<module>_orca.py`
- Modify: `models/<module>.py`
- Create: `security/ir.model.access.csv` entries
- Create: `views/<module>_orca_log_views.xml`
- Create: `tests/test_<module>_orca.py`

## Testing Strategy
- Test 1: Module loads without errors
- Test 2: OrcaLog model exists in database
- Test 3: Create hook fires and log created
- Test 4: Write hook captures before/after
- Test 5: Delete hook logs properly
- (+ access control, field detection tests)

## Dependencies
- <OO-XXX> (if any)

## Related
- <Link to mandate>
- <Link to setup guide>
```

---

## Tracking Rules

### Status Legend
- ⏳ TODO - Not started
- 🔄 IN_PROGRESS - Being refactored
- 🔍 REVIEW - Awaiting code review
- ✅ DONE - Complete and merged

### Blockers
- Lab validation must complete before Phase 1 starts
- Each phase must complete before next starts
- Code review gate must pass (no exceptions)

### Progress Tracking
Update this backlog every Friday with:
- Modules completed this week
- Blockers encountered
- Next week's targets
- Estimated completion date

---

## Next Step

1. Complete v19 lab validation (current focus)
2. Start Phase 1 (Core Financial) when validation done
3. Execute phases sequentially
4. All 43 modules refactored by end of Q3 2026

