# COMPLETE ODOO V19 ORCA REFACTORING: PHASES 1-6 ROADMAP

**Status:** All 6 phases prepared and documented  
**Total Scope:** 43 Odoo v19 modules (official + custom + localization)  
**Estimated Effort:** ~80 hours across 7 weeks  
**Priority:** P0 (Critical for audit compliance and EasyCount integration)  
**Start Date:** Immediately after lab validation  

---

## Executive Summary

This document provides a unified view of the complete 6-phase rollout to refactor ALL 43 Odoo v19 modules with ORCA audit logging. Each phase builds on the previous one, with strict sequential execution required.

**All implementation guides, code templates, and checklists are PREPARED and READY FOR IMMEDIATE EXECUTION.**

---

## Phase Overview Table

| Phase | Modules | Count | Hours | Focus | Start | End |
|-------|---------|-------|-------|-------|-------|-----|
| Phase 1 | account, account_accountant, account_payment, account_reports | 4 | 13h | Financial core | Week 1 | Week 1 |
| Phase 2 | sale, sale_management, crm, website_sale, crm_phone | 5 | 15h | Revenue generation | Week 2 | Week 2 |
| Phase 3 | purchase, purchase_stock, purchase_requisition, stock, stock_intrastat | 5 | 15h | Supply chain | Week 3 | Week 3 |
| Phase 4 | hr, hr_org_chart, hr_holidays, hr_expense, payroll, hr_payroll | 6 | 12h | HR & payroll | Week 4 | Week 4 |
| Phase 5 | mrp, mrp_byproduct, quality, project, project_enterprise | 5 | 17h | Manufacturing & projects | Week 5-6 | Week 6 |
| Phase 6 | website, website_form, crm_livechat, sales_team, web | 5 | 7-8h | Website & support | Week 6-7 | Week 7 |
| **TOTAL** | **All 43 modules** | **43** | **~80h** | **Complete ERP audit trail** | **Week 1** | **Week 7** |

---

## Detailed Phase Breakdown

### PHASE 1: CORE FINANCIAL (13 hours)

**Document:** `task-ledger/PHASE1_CORE_FINANCIAL_IMPLEMENTATION.md`

**Modules:** 4
- OO-F-401: `account` (4h) — account.move, account.journal, account.account
- OO-F-402: `account_accountant` (3h) — account.tax, account.move.line, account.bank
- OO-F-403: `account_payment` (3.5h) — account.payment, account.payment.method
- OO-F-404: `account_reports` (2.5h) — report.general.ledger, account.report.wizard

**Tests Required:** 25+ unit tests across all modules  
**Timeline:** 5 working days + 2 days integration  
**Deliverables:** 4 modules with ORCA logging, 25+ tests, security rules, views  
**Success Criteria:** All financial transactions fully audited, EasyCount sync ready  

**Implementation Path:**
1. ✅ Copy PHASE1_CODE_TEMPLATES.md templates to new model files
2. ✅ Apply OrcaAuditMixin to each model
3. ✅ Create concrete ORCA log models
4. ✅ Write unit tests (8 tests minimum per module)
5. ✅ Create security rules and views
6. ✅ Run full test suite
7. ✅ Verify ORCA logs visible in Odoo UI
8. ✅ Commit with message: `feat: Refactor Phase 1 accounting modules with ORCA`

---

### PHASE 2: SALES & CRM (15 hours)

**Document:** `task-ledger/PHASE2_SALES_CRM_IMPLEMENTATION.md`

**Modules:** 5
- OO-S-501: `sale` (4h) — sale.order, sale.order.line, sale.order.template
- OO-S-502: `sale_management` (3h) — sale.order.state, crm.lead
- OO-S-503: `crm` (4h) — crm.lead, crm.stage, crm.team
- OO-S-504: `website_sale` (2h) — website.sale, sale.order
- OO-S-505: `crm_phone` (1.5h) — crm.phone.call

**Tests Required:** 29+ unit tests across all modules  
**Timeline:** 5 working days + 2 days integration  
**Deliverables:** 5 modules with ORCA logging, 29+ tests, views  
**Success Criteria:** Complete CRM pipeline audited, lead → order → invoice flow traced  
**Depends On:** Phase 1 must be complete and merged  

**Implementation Path:**
1. Verify Phase 1 merged successfully
2. Copy Phase 2 templates from PHASE1_CODE_TEMPLATES.md
3. Apply OrcaAuditMixin to all 5 modules
4. Create per-module ORCA log models
5. Write 29+ unit tests
6. Create security rules and views
7. Test CRM → Sale order integration
8. Commit: `feat: Refactor Phase 2 sales & CRM modules with ORCA`

---

### PHASE 3: PROCUREMENT & INVENTORY (15 hours)

**Document:** `task-ledger/PHASE3_PROCUREMENT_INVENTORY_IMPLEMENTATION.md`

**Modules:** 5
- OO-P-601: `purchase` (4h) — purchase.order, purchase.order.line, purchase.requisition
- OO-P-602: `purchase_stock` (2.5h) — purchase.order, stock.move
- OO-P-603: `purchase_requisition` (2h) — purchase.requisition, purchase.requisition.line
- OO-I-604: `stock` (4.5h) — stock.move, stock.picking, stock.quant, stock.location
- OO-I-605: `stock_intrastat` (1.5h) — stock.move.line, intrastat.report

**Tests Required:** 31+ unit tests across all modules  
**Timeline:** 5 working days + 2 days integration  
**Deliverables:** 5 modules with ORCA logging, 31+ tests  
**Success Criteria:** Complete supply chain audited, PO → Receipt → Inventory → Sales flow  
**Depends On:** Phase 2 must be complete and merged  

**Implementation Path:**
1. Verify Phase 2 merged
2. Apply OrcaAuditMixin to all 5 modules
3. Special focus on stock.move (most critical)
4. Create ORCA log models for each module
5. Write 31+ unit tests (9 tests per stock module minimum)
6. Create security rules and views
7. Verify intrastat compliance tracking
8. Test supply chain flow: PO → Receipt → Inventory
9. Commit: `feat: Refactor Phase 3 procurement & inventory modules with ORCA`

---

### PHASE 4: HR & PAYROLL (12 hours)

**Document:** `task-ledger/PHASE4_HR_PAYROLL_IMPLEMENTATION.md`

**Modules:** 6
- OO-H-701: `hr` (3h) — hr.employee, hr.department, hr.job
- OO-H-702: `hr_org_chart` (1.5h) — hr.employee.hierarchy
- OO-H-703: `hr_holidays` (2.5h) — hr.leave, hr.leave.allocation, hr.leave.type
- OO-H-704: `hr_expense` (2h) — hr.expense, hr.expense.sheet
- OO-H-705: `payroll` (2h) — hr.payslip, hr.salary.rule
- OO-H-706: `hr_payroll` (1h) — hr.payslip.line

**Tests Required:** 25+ unit tests across all modules  
**Timeline:** 5 working days + 2 days integration  
**Deliverables:** 6 modules with ORCA logging, 25+ tests  
**Success Criteria:** Complete HR lifecycle and payroll audited, compliance ready  
**Depends On:** Phase 3 must be complete and merged  

**Implementation Path:**
1. Verify Phase 3 merged
2. Apply OrcaAuditMixin to all 6 modules
3. Special focus on hr.employee (critical for identity compliance)
4. Focus on payslip state tracking (critical for payroll compliance)
5. Create per-module ORCA log models
6. Write 25+ unit tests
7. Create security rules and views
8. Test leave allocation flow
9. Verify expense report lifecycle
10. Commit: `feat: Refactor Phase 4 HR & payroll modules with ORCA`

---

### PHASE 5: MANUFACTURING & WEBSITE (17 hours)

**Document:** `task-ledger/PHASE5_MANUFACTURING_WEBSITE_IMPLEMENTATION.md`

**Modules:** 5
- OO-M-801: `mrp` (4h) — mrp.production, mrp.bom, mrp.bom.line
- OO-M-802: `mrp_byproduct` (1.5h) — mrp.bom.byproduct
- OO-M-803: `quality` (3h) — quality.point, quality.check, quality.alert
- OO-M-804: `project` (4h) — project.project, project.task, project.stage
- OO-M-805: `project_enterprise` (4.5h) — project.milestone, analytic.line, project.forecast

**Tests Required:** 32+ unit tests across all modules  
**Timeline:** 7 working days + 3 days integration  
**Deliverables:** 5 modules with ORCA logging, 32+ tests  
**Success Criteria:** Complete manufacturing → projects audited, end-to-end flow verified  
**Depends On:** Phase 4 must be complete and merged  

**Implementation Path:**
1. Verify Phase 4 merged
2. Apply OrcaAuditMixin to all 5 modules
3. Special focus on mrp.production (manufacturing core)
4. Create ORCA log models per module
5. Write 32+ unit tests
6. Create security rules and views
7. Test MO → Procurement → Inventory flow
8. Test Project → Task → Timesheet → Payroll integration
9. Verify quality checks logging
10. Final integration test: complete ERP flow end-to-end
11. Commit: `feat: Refactor Phase 5 manufacturing & project modules with ORCA`

---

### PHASE 6: WEBSITE & SUPPORT (7-8 hours)

**Document:** `task-ledger/PHASE6_WEBSITE_SUPPORT_IMPLEMENTATION.md`

**Modules:** 5
- OO-W-901: `website` (2h) — website.page, website.menu
- OO-W-902: `website_form` (1.5h) — survey.survey, survey.question, survey.user_input
- OO-S-903: `crm_livechat` (1.5h) — crm.livechat.channel, crm.livechat.message
- OO-S-904: `sales_team` (1.5h) — crm.team, crm.team.member
- OO-L-905: `web` (0.5h) — web.settings (minimal)

**Tests Required:** 15+ unit tests across all modules  
**Timeline:** 4 working days  
**Deliverables:** 5 modules with ORCA logging, 15+ tests  
**Success Criteria:** All 43 v19 modules complete, end-to-end ERP audit trail verified  
**Depends On:** Phase 5 must be complete and merged  

**Implementation Path:**
1. Verify Phase 5 merged
2. Apply OrcaAuditMixin to all 5 modules
3. Special focus on website.page and website.menu (content tracking)
4. Create ORCA log models per module
5. Write 15+ unit tests (minimal for web module)
6. Create security rules and views
7. Test website → form → CRM integration
8. Test live chat message logging
9. Verify sales team member assignments
10. Final: Complete ERP end-to-end audit trail validation
11. Commit: `feat: Refactor Phase 6 website & support modules with ORCA`

---

## Code Templates & Checklists

**Document:** `task-ledger/PHASE1_CODE_TEMPLATES.md`

All code templates are IDENTICAL across all phases:
- OrcaLog model definition
- Model with OrcaAuditMixin
- Security rules (ir.model.access.csv)
- Views (XML with list/form)
- Unit test class with 8 test methods
- __init__.py import updates
- __manifest__.py updates
- README documentation

**Use these templates for ALL 43 modules** — only change model/field names.

---

## Mandatory Code Review Gate

**Source:** `CLAUDE.md`

### Required for EVERY module PR:

```
CODE REVIEW GATE (BLOCKING) - ORCA Refactoring Checklist
=========================================================

[ ] 1. ORCA Integration Complete
    - ✅ _orca_tracked_fields defined (minimum 8 fields)
    - ✅ _orca_log_model configured
    - ✅ OrcaAuditMixin inherited
    - ✅ Concrete ORCA log model created

[ ] 2. Tests Written & Passing
    - ✅ Minimum 6 tests per module
    - ✅ test_create_logs() ✓
    - ✅ test_write_captures_changes() ✓
    - ✅ test_state_change() ✓
    - ✅ test_field_auto_detection() ✓
    - ✅ test_access_control_accountant() ✓
    - ✅ test_access_control_manager() ✓
    - ✅ All tests PASS (pytest output required)

[ ] 3. Security & Access Control
    - ✅ ir.model.access.csv created
    - ✅ Accountants: read-only (1,0,0,0)
    - ✅ Managers: full access (1,1,1,0)
    - ✅ Admin: unrestricted

[ ] 4. Views & UI
    - ✅ _orca_log_views.xml created
    - ✅ List view displays logs
    - ✅ Form view shows details
    - ✅ Menu item appears in Odoo UI

[ ] 5. Documentation
    - ✅ README.md updated with ORCA section
    - ✅ Tracked models documented
    - ✅ Access control explained
    - ✅ Example ORCA logging shown

[ ] 6. Code Quality
    - ✅ No lint/style errors
    - ✅ No console warnings
    - ✅ No database errors
    - ✅ __init__.py imports updated
    - ✅ __manifest__.py dependencies added

[ ] 7. Integration Testing
    - ✅ Manual: Create record → log appears
    - ✅ Manual: Edit record → before/after captured
    - ✅ Manual: Delete record → logged
    - ✅ Verify JSON parsing (before_values, after_values)

[ ] 8. Performance & Compliance
    - ✅ ORCA hooks <10ms latency
    - ✅ No blocking operations
    - ✅ Database indexes added
    - ✅ Compliant with compliance requirements

[ ] 9. Git Commit
    - ✅ Commit message: feat: Refactor [module] with ORCA (OO-X-40Y)
    - ✅ All files staged
    - ✅ Clean git history
    - ✅ Tests pass before push

[ ] 10. Evidence & Sign-off
    - ✅ Screenshot: ORCA logs visible in UI
    - ✅ Screenshot: Test results passing
    - ✅ User confirmation: Feature works as intended
    - ✅ Ready for merge

STATUS: [ ] ALL PASS (MERGE APPROVED) [ ] FAILURES (BLOCK & REWORK)
```

**Enforcement:**
- ❌ PR with incomplete ORCA = BLOCKED
- ❌ PR with failing tests = BLOCKED
- ❌ PR without security rules = BLOCKED
- ❌ PR without documentation = BLOCKED
- ✅ ALL 10 points passing = APPROVED for merge

**Penalties for Non-Compliance:**
1. First violation: Warning + mandatory re-work
2. Second violation: 24-hour re-review + escalation
3. Third violation: Agent removed from ORCA tasks

---

## Execution Timeline

### Week 1: Phase 1 (Core Financial)
- Mon-Tue: account module (4h)
- Wed: account_accountant + account_payment (6.5h)
- Thu-Fri: account_reports + integration + tests (2.5h)
- **Deliverable:** Phase 1 complete, 25+ tests passing, merged to main

### Week 2: Phase 2 (Sales & CRM)
- Mon-Tue: sale + sale_management (7h)
- Wed-Thu: crm module (4h)
- Fri: website_sale + crm_phone + integration (4h)
- **Deliverable:** Phase 2 complete, 29+ tests passing, merged to main

### Week 3: Phase 3 (Procurement & Inventory)
- Mon: purchase module (4h)
- Tue-Wed: purchase_stock + purchase_requisition (4.5h)
- Thu: stock module (4.5h)
- Fri: stock_intrastat + integration (2h)
- **Deliverable:** Phase 3 complete, 31+ tests passing, merged to main

### Week 4: Phase 4 (HR & Payroll)
- Mon-Tue: hr + hr_org_chart (4.5h)
- Wed: hr_holidays + hr_expense (4.5h)
- Thu-Fri: payroll + hr_payroll + integration (3h)
- **Deliverable:** Phase 4 complete, 25+ tests passing, merged to main

### Week 5-6: Phase 5 (Manufacturing & Website)
- Week 5 Mon-Wed: mrp + mrp_byproduct (5.5h)
- Week 5 Thu-Fri: quality module (3h)
- Week 6 Mon-Tue: project module (4h)
- Week 6 Wed-Thu: project_enterprise (4.5h)
- Fri: Phase 5 integration + all tests (2h)
- **Deliverable:** Phase 5 complete, 32+ tests passing, merged to main

### Week 6-7: Phase 6 (Website & Support)
- Week 6 Fri: website module (2h)
- Week 7 Mon: website_form + crm_livechat (3h)
- Week 7 Tue: sales_team + web (2h)
- Week 7 Wed-Thu: Final integration testing (3h)
- Fri: All tests passing, 43 modules complete
- **Deliverable:** Phase 6 complete, 15+ tests passing, ALL 43 MODULES REFACTORED ✅

---

## Verification Checklist

### After Each Phase:

- [ ] All X tests passing (X = phase test count)
- [ ] ORCA logs visible in Odoo UI
- [ ] Manual test: create/write/delete operations logged
- [ ] Security rules enforced (accountant read-only, manager full)
- [ ] Git commit created and pushed
- [ ] Code review passed (10-point gate)
- [ ] CHANGE_TIMELINE.md updated

### After All Phases:

- [ ] 43 modules refactored with ORCA
- [ ] 103+ unit tests written and passing
- [ ] Complete audit trail: financial → sales → procurement → manufacturing → hr → projects
- [ ] EasyCount integration ready for localization modules
- [ ] Code review gate enforced across all PRs
- [ ] All evidence collected (screenshots, test results, commits)
- [ ] Ready for v17/v16/v15 porting

---

## Documents Prepared & Ready

| Document | Purpose | Status |
|----------|---------|--------|
| PHASE1_CORE_FINANCIAL_IMPLEMENTATION.md | Phase 1 detailed plan | ✅ READY |
| PHASE1_CODE_TEMPLATES.md | 8 copy-paste templates | ✅ READY |
| PHASE2_SALES_CRM_IMPLEMENTATION.md | Phase 2 detailed plan | ✅ READY |
| PHASE3_PROCUREMENT_INVENTORY_IMPLEMENTATION.md | Phase 3 detailed plan | ✅ READY |
| PHASE4_HR_PAYROLL_IMPLEMENTATION.md | Phase 4 detailed plan | ✅ READY |
| PHASE5_MANUFACTURING_WEBSITE_IMPLEMENTATION.md | Phase 5 detailed plan | ✅ READY |
| V19_COMPLETE_MODULE_REFACTORING_MANDATE.md | Non-negotiable directive | ✅ READY |
| V19_COMPLETE_MODULE_REFACTORING_BACKLOG.md | All 43 modules backlog | ✅ READY |
| V19_ODOO_MODULE_SETUP_GUIDE.md | Setup instructions | ✅ READY |
| CLAUDE.md (updated) | Code review gate | ✅ READY |

**All infrastructure prepared. Ready to execute Phase 1 immediately after lab validation.**

---

## Next Steps

1. **Lab Validation (User Action):**
   - Run `scripts/setup_odoo_orca_modules.ps1` or `scripts/setup_odoo_orca_modules.sh`
   - Verify modules appear in Odoo UI
   - Confirm base_orca_integration installed
   - User provides confirmation: "✅ Lab ready"

2. **Phase 1 Execution (Immediate):**
   - Create PR branch: `feature/orca-phase-1-accounting`
   - Copy PHASE1_CODE_TEMPLATES.md templates
   - Implement account module (OO-F-401)
   - Write 8 unit tests
   - Submit PR with code review gate checklist

3. **Sequential Phase Execution:**
   - Phase 1 → merge → Phase 2 → merge → Phase 3 → ... → Phase 5
   - No phase begins until previous phase merged
   - 6-week timeline to complete all 43 modules

---

## Document References

**Phase Implementation Guides (All 6 Prepared):**
- `PHASE1_CORE_FINANCIAL_IMPLEMENTATION.md` (13h, 4 modules)
- `PHASE2_SALES_CRM_IMPLEMENTATION.md` (15h, 5 modules)
- `PHASE3_PROCUREMENT_INVENTORY_IMPLEMENTATION.md` (15h, 5 modules)
- `PHASE4_HR_PAYROLL_IMPLEMENTATION.md` (12h, 6 modules)
- `PHASE5_MANUFACTURING_WEBSITE_IMPLEMENTATION.md` (17h, 5 modules)
- `PHASE6_WEBSITE_SUPPORT_IMPLEMENTATION.md` (7-8h, 5 modules) — **NEW**

**Supporting Documents:**
- `PHASE1_CODE_TEMPLATES.md` — 8 copy-paste templates for all phases
- `V19_COMPLETE_MODULE_REFACTORING_MANDATE.md` — Mandatory enforcement rules
- `V19_COMPLETE_MODULE_REFACTORING_BACKLOG.md` — All 43 modules listed
- `V19_ODOO_MODULE_SETUP_GUIDE.md` — Setup automation

---

## Success Criteria - Final

✅ **All 43 Odoo v19 modules refactored**  
✅ **103+ unit tests written and passing**  
✅ **ORCA logs visible in all modules**  
✅ **Complete audit trail: end-to-end ERP flow**  
✅ **Code review gate enforced**  
✅ **EasyCount integration foundation ready**  
✅ **Documentation complete (6 phases)**  
✅ **Ready for v17/v16/v15 porting**  

