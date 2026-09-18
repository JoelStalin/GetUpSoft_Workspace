# V19 Module Refactoring & ORCA Integration - Complete Implementation Plan

**Date:** 2026-05-28  
**Status:** PLANNING  
**Target:** Production v19 (Odoo 19.0)  
**Scope:** 5 custom GetUpSoft modules + extension modules for official Odoo Tier 1  
**Timeline:** Phase 1B completion → Phase 1C initiation  

---

## 1. INVENTORY - V19 CUSTOM MODULES

| # | Module | Version | Status | Depends On | ORCA Ready | Models |
|---|--------|---------|--------|-----------|-----------|--------|
| 1 | base_orca_integration | 19.0.1.0.0 | ✅ DONE | base | ✅ YES | OrcaLog, OrcaUniversalMixin |
| 2 | l10n_do_accounting | 19.0.2.1.0 | ✅ DONE | account | ✅ YES | AccountMove (CRITICAL) |
| 3 | l10n_do_accounting_report | 19.0.2.1.0 | ✅ DONE | account | ✅ YES | DgiiReport (CRITICAL) |
| 4 | l10n_do_pos | 19.0.2.1.0 | ✅ DONE | point_of_sale | ✅ YES | PosOrder (CRITICAL) |
| 5 | l10n_do_rnc_search | 19.0.1.1.0 | ✅ DONE | base | ✅ YES | RNCSearch (CRITICAL) |

**Total Refactored:** 5/5 (100% complete for GetUpSoft custom modules)

---

## 2. OFFICIAL ODOO TIER 1 MODULES (Next Phase)

**Strategy:** Create extension modules (do NOT modify Odoo Enterprise source per CLAUDE.md)

### Phase 1B Extension Modules (Tier 1 - ~20 modules)

#### Accounting Module Extensions
- [ ] account_extended (extends account.move, account.invoice, account.journal)
- [ ] account_asset_extended (extends account.asset)
- [ ] account_payment_extended (extends account.payment)
- [ ] account_tax_extended (extends account.tax)
- [ ] account_bank_statement_extended (extends account.bank.statement)

#### POS Module Extensions
- [ ] pos_enterprise_extended (extends pos.order, pos.session)
- [ ] pos_restaurant_extended (extends pos.restaurant)

#### Sales Module Extensions
- [ ] sale_extended (extends sale.order, sale.order.line)
- [ ] sale_management_extended (extends sale pipeline)
- [ ] sale_subscription_extended (extends subscription)

#### Other Critical
- [ ] invoice_extended (extends invoice operations)
- [ ] payment_extended (extends payment provider)
- [ ] procurement_extended (extends procurement)

---

## 3. CURRENT STATE ASSESSMENT

### What's Complete (Phase 1A-1B v19)
✅ OrcaUniversalMixin infrastructure (1,180 lines)
✅ EasyCount ERP-agnostic core (850 lines)
✅ ORCA Rules Engine (650 lines)
✅ 5/5 GetUpSoft custom modules refactored
✅ All base_orca_integration files in place
✅ Tier-based field auto-detection working
✅ Multi-tenant isolation (project_id)
✅ EasyCount sync tracking fields

### What's Remaining
⏳ Official Odoo Tier 1 extension modules (15-20 modules)
⏳ Tier 2-4 module refactoring (405 modules)
⏳ NestJS endpoint wiring (audit-log, fiscal-sync)
⏳ E2E integration testing
⏳ Production deployment validation

---

## 4. IMPLEMENTATION PLAN - V19 TIER 1 COMPLETION

### Phase: Create Extension Modules (Tier 1 Official)

**Time Estimate:** 15-20 modules × 30 min = 7.5-10 hours

#### Extension Module Template
```
v19/Modules/account_extended/
├── __manifest__.py
├── __init__.py
├── models/
│   ├── __init__.py
│   └── account_move_orca.py       (inherit account.move + orca.universal.mixin)
├── security/
│   └── ir.model.access.csv
└── views/
    └── account_move_orca_log_views.xml
```

#### Manifest Template
```python
{
    'name': 'Account ORCA Integration',
    'version': '19.0.1.0.0',
    'author': 'getupsoft',
    'website': 'https://getupsoft.com',
    'license': 'LGPL-3',
    'category': 'Technical/Accounting',
    'depends': ['account', 'base_orca_integration'],
    'data': [
        'security/ir.model.access.csv',
        'views/account_move_orca_log_views.xml',
    ],
    'installable': True,
    'auto_install': False,
}
```

---

## 5. BACKLOG WITH CHECKLIST - IMPLEMENTATION TRACKING

### EPIC-ORCA-v19-TIER-1: Official Odoo Module Extensions

#### Story 1: Account Extension Module
**Complexity:** MEDIUM | **Time:** 1.5h | **Depends:** base_orca_integration

**Tasks:**
- [ ] T1.1 Create module structure (manifest, __init__.py)
- [ ] T1.2 Create AccountMoveOrcaLog model
- [ ] T1.3 Apply OrcaUniversalMixin to account.move
- [ ] T1.4 Create security/ir.model.access.csv
- [ ] T1.5 Create views/account_move_orca_log_views.xml
- [ ] T1.6 **TEST:** Manual ORCA log creation test
- [ ] T1.7 **TEST:** Verify field auto-detection (CRITICAL tier ~20 fields)
- [ ] T1.8 **TEST:** Check access control (accounting manager only)
- [ ] T1.9 **DEPLOY:** Module installation in test DB
- [ ] T1.10 **VALIDATE:** Log entries visible in UI

#### Story 2: Asset Extension Module
**Complexity:** LOW | **Time:** 1h | **Depends:** base_orca_integration

**Tasks:**
- [ ] T2.1 Create module structure
- [ ] T2.2 Apply OrcaUniversalMixin to account.asset
- [ ] T2.3 Create security/views
- [ ] T2.4 **TEST:** ORCA log creation for asset operations
- [ ] T2.5 **VALIDATE:** Tier-based field selection working

#### Story 3: Payment Extension Module
**Complexity:** LOW | **Time:** 1h | **Depends:** base_orca_integration

**Tasks:**
- [ ] T3.1 Create module structure
- [ ] T3.2 Apply OrcaUniversalMixin to account.payment
- [ ] T3.3 Create security/views
- [ ] T3.4 **TEST:** Payment operation logging
- [ ] T3.5 **VALIDATE:** Log data integrity

#### Story 4: POS Extension Module
**Complexity:** MEDIUM | **Time:** 1.5h | **Depends:** base_orca_integration

**Tasks:**
- [ ] T4.1 Create module structure
- [ ] T4.2 Apply OrcaUniversalMixin to pos.order
- [ ] T4.3 Create PosOrderOrcaLog with fiscal fields
- [ ] T4.4 Create security/views
- [ ] T4.5 **TEST:** POS order logging
- [ ] T4.6 **TEST:** Fiscal data capture (NCF, amount)
- [ ] T4.7 **VALIDATE:** Concurrent order handling

#### Story 5: Sale Extension Module
**Complexity:** MEDIUM | **Time:** 1.5h | **Depends:** base_orca_integration

**Tasks:**
- [ ] T5.1 Create module structure
- [ ] T5.2 Apply OrcaUniversalMixin to sale.order
- [ ] T5.3 Create security/views
- [ ] T5.4 **TEST:** Sale order logging
- [ ] T5.5 **VALIDATE:** Order state transitions logged

#### Story 6-15: Additional Tier 1 Modules (Asset, Bank, Invoice, etc.)
**Complexity:** LOW-MEDIUM | **Time:** 1-1.5h each

**Standard Tasks per Module:**
- [ ] Create module structure (manifest)
- [ ] Create model with OrcaUniversalMixin
- [ ] Create security/ir.model.access.csv
- [ ] Create views (orca log list/form)
- [ ] **TEST:** ORCA log creation
- [ ] **TEST:** Field auto-detection
- [ ] **TEST:** Access control
- [ ] **VALIDATE:** No console errors

---

## 6. MANDATORY TEST PLAN

### Pre-Deployment Tests (For Each Module)

#### 6.1 UNIT TESTS
```
✅ Model creation test (create hook fires)
✅ Model write test (change tracking works)
✅ Model unlink test (deletion logged)
✅ Field auto-detection test (tier matching correct fields)
✅ JSON snapshot test (before/after values captured)
```

#### 6.2 INTEGRATION TESTS
```
✅ Module installation test (no dependency errors)
✅ ORCA log model accessible
✅ Log entries created automatically
✅ Tier field populated correctly
✅ EasyCount sync fields present
✅ Project ID isolation working
```

#### 6.3 SECURITY TESTS
```
✅ Access control: Only authorized users see logs
✅ Multi-tenant: Project_id correctly isolated
✅ Data protection: Sensitive fields encrypted if needed
✅ Access logs: User attribution correct
```

#### 6.4 UI/UX TESTS (QA Mandatory per CLAUDE.md)
```
✅ Log list view displays correctly
✅ Log form view readable
✅ Field labels clear and help text present
✅ No console errors (F12 DevTools)
✅ Responsive design (1024px, 1440px, 1920px)
✅ Keyboard navigation works (Tab, Escape, Enter)
✅ Color contrast ≥ 4.5:1 WCAG AA
✅ Icons and spacing consistent
```

#### 6.5 PERFORMANCE TESTS
```
✅ ORCA hook overhead < 100ms per operation
✅ Log creation doesn't block main transaction
✅ 100+ record batch create/write/unlink works
✅ No N+1 query problems
✅ Memory usage stable
```

#### 6.6 FUNCTIONAL TESTS (Domain-Specific)
```
For l10n_do_accounting:
  ✅ ENCF number logged
  ✅ Fiscal state transitions tracked
  ✅ DGII UUID captured when sent

For l10n_do_pos:
  ✅ NCF generated and logged
  ✅ Order amounts captured
  ✅ Concurrent orders handled

For account extensions:
  ✅ Multi-currency amounts logged
  ✅ Tax calculations tracked
  ✅ Bank reconciliation logged
```

---

## 7. DEPLOYMENT CHECKLIST

### Pre-Production (Dev Environment)
- [ ] All extension modules created
- [ ] All unit tests passing
- [ ] All integration tests passing
- [ ] All UI/UX tests passing (per CLAUDE.md QA rules)
- [ ] All performance tests passing
- [ ] Code review completed
- [ ] Security audit completed
- [ ] Documentation updated

### Staging Environment
- [ ] Module installation successful
- [ ] Production-like data volume tested (10K+ records)
- [ ] Concurrent operations tested (50+ simultaneous users)
- [ ] ORCA log volume sustainable (100K+ logs per day)
- [ ] Backup/restore tested
- [ ] Performance metrics acceptable

### Production
- [ ] Deployment plan documented
- [ ] Rollback procedure documented
- [ ] Monitoring/alerts configured
- [ ] User training completed
- [ ] Production deployment executed
- [ ] Health checks passing
- [ ] Log volume validated

---

## 8. SUCCESS CRITERIA

### Module Completion Definition (DoD)
✅ Code written (models, manifest, views, security)  
✅ All mandatory tests passing  
✅ Code review approved  
✅ No console errors (UI/UX validated per CLAUDE.md)  
✅ Access control verified  
✅ Documentation complete  
✅ Deployed to staging  

### Phase 1B Tier 1 Completion
✅ All 15-20 Tier 1 extension modules complete  
✅ 100% test coverage for all modules  
✅ Production deployment approved  
✅ User acceptance testing passed  

### Phase 1C Ready
✅ Tier 2-4 module refactoring plan documented  
✅ 405 remaining modules prioritized  
✅ Automated refactoring scripts ready  

---

## 9. TIMELINE & MILESTONES

| Phase | Scope | Est. Time | Start | End | Status |
|-------|-------|-----------|-------|-----|--------|
| 1B Tier 1 v19 Complete | 5 GetUpSoft modules | 2h | DONE | 2026-05-28 | ✅ DONE |
| 1B Tier 1 Extensions | 15-20 Odoo modules | 7.5-10h | 2026-05-28 | TBD | ⏳ READY |
| Testing & QA | All modules | 4-5h | After impl | TBD | ⏳ READY |
| Staging deployment | Prod-like env | 2h | After QA | TBD | ⏳ READY |
| Production deploy | Live v19 | 1h | After staging | TBD | ⏳ READY |
| **TOTAL Phase 1B** | **~40 modules** | **~16-18h** | **2026-05-28** | **Est. 2026-05-30** | ⏳ IN PROGRESS |

---

## 10. NEXT IMMEDIATE ACTIONS

1. **Today (2026-05-28):**
   - [ ] Create account_extended module (Story 1)
   - [ ] Verify ORCA log creation works
   - [ ] Run all mandatory tests

2. **Tomorrow (2026-05-29):**
   - [ ] Complete remaining Tier 1 extensions (Stories 2-5)
   - [ ] Full test suite execution
   - [ ] Code review & approval

3. **Day 3 (2026-05-30):**
   - [ ] Staging deployment
   - [ ] Production readiness assessment

---

## 11. RISK MITIGATION

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| Breaking existing ORCA functionality | MEDIUM | HIGH | Full regression test suite before commit |
| Performance degradation | MEDIUM | HIGH | Benchmark 100K+ records during testing |
| Access control gaps | LOW | CRITICAL | Security audit mandatory before deploy |
| Multi-tenant isolation failure | LOW | CRITICAL | Project_id validation test required |
| User adoption issues | MEDIUM | MEDIUM | Training + documentation before deploy |

---

## 12. DECISION LOG

**Decision 1 (2026-05-28):** Skip v12 legacy support (DISCONTINUED)  
**Rationale:** v12 uses @api.multi/old API; focus on production v19 first  
**Alternative Considered:** Create OrcaAuditMixinV12 adapter (deferred to Phase 2)

**Decision 2 (2026-05-28):** Create extension modules instead of modifying Odoo Enterprise  
**Rationale:** CLAUDE.md constraint + cleaner separation + deployable per customer  
**Alternative:** Fork Odoo modules (too complex, licensing risk)

---

**Owner:** Claude Haiku 4.5  
**Last Updated:** 2026-05-28 15:00 UTC  
**Next Review:** 2026-05-28 (daily until Phase 1B complete)
