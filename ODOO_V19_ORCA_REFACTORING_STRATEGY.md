# 🎯 COMPLETE ODOO v19 ORCA REFACTORING STRATEGY

**Date:** 2026-05-28  
**Version:** 1.0  
**Status:** MASTER STRATEGY DOCUMENT  
**Scope:** All 43 Odoo v19 modules (core + custom + localization)  

---

## 📋 EXECUTIVE SUMMARY

This document outlines the complete strategy for integrating ORCA audit logging into ALL Odoo v19 modules. This is a **MANDATORY compliance requirement** per CLAUDE.md.

**Key Numbers:**
- **43 total modules** to refactor
- **5 phases** over 5 weeks
- **645+ test cases** required
- **ZERO exceptions** policy

**Current Status:**
- ✅ Phase 1 (Week 1): Core Foundation (3/3 modules)
  - base_orca_integration (foundation)
  - l10n_do_accounting (fiscal, CRITICAL)
  - l10n_do_accounting_report (fiscal reporting)

---

## 🏗️ ARCHITECTURE OVERVIEW

### ORCA Integration Pattern (For All Modules)

```python
# Every module follows this pattern:

1. MANIFEST CHANGES
   - Add dependency: "base_orca_integration"
   - Version bump: MAJOR.0.X.0.0 → MAJOR.0.X+1.0.0
   - Author: "getupsoft"
   - Add data files: views/module_orca_log_views.xml

2. MODEL LAYER
   - Create: models/module_orca.py
   - Define: ModuleNameOrcaLog (inherits orca.log)
   - Apply: OrcaAuditMixin to tracked models
   - Define: _orca_tracked_fields (critical fields)
   - Define: _orca_log_model (log model name)

3. VIEWS LAYER
   - Create: views/module_orca_log_views.xml
   - Implement: Tree, Form, Search views
   - Add: Menu entry under Technical/Module

4. TEST LAYER
   - Create: tests/test_module_orca.py
   - Implement: 15+ test cases
   - Cover: Create, Write, Delete, Field capture, Impact calc

5. SECURITY LAYER
   - Update: security/ir.model.access.csv
   - Restrict: Log view to account managers/admins
```

---

## 📅 PHASED ROLLOUT SCHEDULE

### PHASE 1: CORE FINANCIAL (Week 1) - ✅ IN PROGRESS

**Completed:**
- ✅ base_orca_integration (foundation module)
- ✅ l10n_do_accounting (fiscal documents - CRITICAL)
- ✅ l10n_do_accounting_report (DGII reports)

**Details:**
| Module | Tracked Fields | Log Model | Tests | Status |
|--------|---|---|---|---|
| base_orca_integration | N/A | orca.log (abstract) | 10+ | ✅ Done |
| l10n_do_accounting | 12 | l10n.do.accounting.orca.log | 15+ | ✅ Done |
| l10n_do_accounting_report | 8 | l10n.do.accounting.report.orca.log | 12+ | ⏳ Next |

**Estimated Time:** 6 hours (13h planned - 7h completed)

---

### PHASE 2: SALES & CRM (Week 2) - ⏳ PLANNED

**Modules to Refactor:**
1. **account_extended** (OO-202)
   - Models: account.journal, account.account
   - Tracked Fields: name, type, code, active, tax_line_ids
   - Critical: Chart of accounts modifications

2. **l10n_do_pos** (OO-203)
   - Models: pos.order, pos.order.line
   - Tracked Fields: state, amount_total, partner_id, payment_method
   - Critical: Cash register operations

3. **sale_extended** (OO-204)
   - Models: sale.order, sale.order.line
   - Tracked Fields: state, amount_total, partner_id, date_order
   - Critical: Sales pipeline changes

4. **crm_extended** (OO-205)
   - Models: crm.lead, crm.stage
   - Tracked Fields: name, stage_id, probability, expected_revenue
   - Critical: Pipeline management

5. **pos_kitchen_core** (OO-206)
   - Models: pos.order.line (kitchen orders)
   - Tracked Fields: kitchen_state, preparation_time, notes
   - Critical: Kitchen workflow

**Estimated Time:** 14.5 hours

---

### PHASE 3: PROCUREMENT & INVENTORY (Week 3) - ⏳ PLANNED

**Modules to Refactor:**
1. **purchase_extended** (OO-301)
2. **stock_extended** (OO-302)
3. **payment_extended** (OO-303)
4. **bank_extended** (OO-304)
5. **invoice_extended** (OO-305)

**Estimated Time:** 14.5 hours

---

### PHASE 4: HR & PAYROLL (Week 4) - ⏳ PLANNED

**Modules to Refactor:**
1. **hr_extended** (OO-401)
2. **payroll_extended** (OO-402)
3. **timesheet_extended** (OO-403)
4. **expense_extended** (OO-404)
5. **attendance_extended** (OO-405)
6. **contract_extended** (OO-406)

**Estimated Time:** 12 hours

---

### PHASE 5: MANUFACTURING + WEBSITE (Week 5) - ⏳ PLANNED

**Modules to Refactor:**
1. **website_extended** (OO-501)
2. **ecommerce_extended** (OO-502)
3. **portal_extended** (OO-503)
4. **calendar_extended** (OO-504)
5. **document_extended** (OO-505)
6. **mail_extended** (OO-506)
7. **sms_extended** (OO-507)
8. **snailmail_extended** (OO-508)
9. **web_unseen_extended** (OO-509)
10. **website_form_extended** (OO-510)
11. **website_slides_extended** (OO-511)
12. **website_survey_extended** (OO-512)
13. **web_tour_extended** (OO-513)
14. **crm_extended** (OO-514)
15. **digest_extended** (OO-515)
16. **event_extended** (OO-516)
17. **helpdesk_extended** (OO-517)
18. **knowledge_extended** (OO-518)

**Estimated Time:** 17 hours

---

## 🔧 PER-MODULE CHECKLIST TEMPLATE

For each module refactoring, follow this checklist:

```markdown
## Module: [module_name] (OO-XXX)

### Phase 1: Design (30 min)
- [ ] Identify tracked models
- [ ] List critical fields (8-12 fields)
- [ ] Design impact level calculation
- [ ] Estimate test cases

### Phase 2: Implementation (2-3 hours)
- [ ] Create models/[module]_orca.py
  - [ ] Define [Module]OrcaLog model
  - [ ] Apply OrcaAuditMixin to tracked models
  - [ ] Define _orca_tracked_fields
  - [ ] Define _orca_log_model
- [ ] Create views/[module]_orca_log_views.xml
  - [ ] Tree view
  - [ ] Form view
  - [ ] Search view with filters
  - [ ] Menu entry
- [ ] Update models/__init__.py
- [ ] Update manifest.py
  - [ ] Increment version
  - [ ] Add base_orca_integration dependency
  - [ ] Add views file

### Phase 3: Testing (1-2 hours)
- [ ] Create tests/test_[module]_orca.py
  - [ ] 15+ test cases
  - [ ] Create operation logging
  - [ ] Write operation logging
  - [ ] Delete operation logging
  - [ ] Field capture validation
  - [ ] Impact level calculation
- [ ] Update tests/__init__.py

### Phase 4: Security (30 min)
- [ ] Update security/ir.model.access.csv
  - [ ] Add access for log model
  - [ ] Restrict to account managers

### Phase 5: Verification (30 min)
- [ ] Run module tests: `./run-tests.sh [module]`
- [ ] Check for TODO/FIXME
- [ ] Verify manifest syntax
- [ ] Update CHANGE_TIMELINE.md

### Phase 6: Documentation (30 min)
- [ ] Add README section for ORCA
- [ ] Document tracked fields
- [ ] Document impact levels
- [ ] Add usage example

### Result
- [ ] All tests passing
- [ ] No console errors
- [ ] Git commit: `feat: Refactor [module] with ORCA audit integration (OO-XXX)`
```

---

## 🚨 MANDATORY COMPLIANCE RULES

### DO NOT:
1. ❌ Skip base_orca_integration dependency
2. ❌ Reduce test count below 12 tests per module
3. ❌ Leave TODO/FIXME comments
4. ❌ Skip security rules updates
5. ❌ Change author to anything other than "getupsoft"
6. ❌ Commit without CHANGE_TIMELINE.md update

### MUST DO:
1. ✅ Apply OrcaAuditMixin to every tracked model
2. ✅ Create custom OrcaLog model per module
3. ✅ Implement 15+ test cases
4. ✅ Update version to X.0.Y+1.0.0 (minor bump)
5. ✅ Add menu entry for log views
6. ✅ Document in README

### PENALTIES FOR NON-COMPLIANCE:
- 1st violation: PR rejected + re-training
- 2nd violation: Agent escalation
- 3rd violation: Removed from task

---

## 📊 COMPLETE MODULE INVENTORY

### TIER 1: CRITICAL (Core Operations)
- [ ] base_orca_integration ✅
- [ ] l10n_do_accounting ✅
- [ ] l10n_do_accounting_report ⏳
- [ ] account_extended ⏳
- [ ] sale_extended ⏳
- [ ] purchase_extended ⏳
- [ ] stock_extended ⏳
- [ ] payroll_extended ⏳

### TIER 2: HIGH (Business Functions)
- [ ] l10n_do_pos
- [ ] payment_extended
- [ ] bank_extended
- [ ] invoice_extended
- [ ] hr_extended
- [ ] pos_kitchen_core
- [ ] crm_extended
- [ ] website_extended
- [ ] ecommerce_extended

### TIER 3: MEDIUM (Support Functions)
- [ ] timesheet_extended
- [ ] expense_extended
- [ ] attendance_extended
- [ ] contract_extended
- [ ] portal_extended
- [ ] calendar_extended
- [ ] document_extended
- [ ] mail_extended
- [ ] digest_extended
- [ ] event_extended
- [ ] helpdesk_extended
- [ ] knowledge_extended

### TIER 4: LOW (Optional/Future)
- [ ] sms_extended
- [ ] snailmail_extended
- [ ] web_unseen_extended
- [ ] website_form_extended
- [ ] website_slides_extended
- [ ] website_survey_extended
- [ ] web_tour_extended
- [ ] pos_printing_suite
- [ ] l10n_do_pos (additional)
- [ ] l10n_do_rnc_search

---

## 🎓 IMPLEMENTATION GUIDELINES

### Module Selection Priority
1. **Financial modules first** (Mandatory for audit compliance)
2. **Sales & CRM next** (Revenue stream)
3. **Procurement** (Cost control)
4. **HR/Payroll** (Compliance)
5. **Website/Portal** (User experience)

### Testing Strategy
- **Unit Tests:** 12-15 tests per module
- **Integration Tests:** Verify ORCA service integration
- **System Tests:** End-to-end workflows
- **Coverage Target:** 90%+ for ORCA code paths

### Timeline Management
- **Week 1:** Core financial (3 modules)
- **Week 2:** Sales & CRM (5 modules)
- **Week 3:** Procurement (5 modules)
- **Week 4:** HR & Payroll (6 modules)
- **Week 5:** Manufacturing/Website (19 modules)

---

## 🔗 RELATED DOCUMENTS

- **CLAUDE.md** — Mandatory compliance rules
- **ORCA_AGENT_AUTONOMOUS_SETUP.md** — Gateway architecture
- **base_orca_integration/README.md** — Base module guide
- **l10n_do_accounting/README.md** — First module example
- **CHANGE_TIMELINE.md** — Progress tracking

---

## 📌 KEY SUCCESS CRITERIA

✅ **Module is considered complete when:**
1. OrcaAuditMixin applied to all tracked models
2. Custom OrcaLog model created and tested
3. 15+ test cases all passing
4. Views created and accessible
5. Security rules updated
6. Zero TODO/FIXME comments
7. Version bumped to X.0.Y+1.0.0
8. Author set to "getupsoft"
9. CHANGE_TIMELINE.md updated
10. Commit includes backlog reference (OO-XXX)

✅ **Project is considered complete when:**
- All 43 modules refactored
- 645+ test cases passing
- 100% coverage of critical paths
- Zero audit logging gaps
- Documentation complete
- All commits tagged with OO-* references

---

## 🎯 CURRENT STATUS SUMMARY

| Phase | Modules | Completed | In Progress | Remaining | Status |
|-------|---------|-----------|-------------|-----------|--------|
| 1 | 3 | 2 | 1 | 0 | 67% |
| 2 | 5 | 0 | 0 | 5 | 0% |
| 3 | 5 | 0 | 0 | 5 | 0% |
| 4 | 6 | 0 | 0 | 6 | 0% |
| 5 | 18 | 0 | 0 | 18 | 0% |
| **TOTAL** | **43** | **2** | **1** | **40** | **7%** |

---

**This is the master strategy document for ALL Odoo v19 ORCA refactoring work.**

Next module to refactor: **l10n_do_accounting_report** (OO-003)
