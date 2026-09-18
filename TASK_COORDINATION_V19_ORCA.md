# Task Coordination: ORCA Deploy → V19 Refactoring

**Status**: Coordination document for Session 14+  
**Date**: 2026-05-30  
**Priority**: HIGH - Both tasks are critical and sequential

---

## Current Work (Session 14)

### PRIMARY TASK: ORCA Workflow Editor Deployment
- **Status**: 🟡 Awaiting Cloudflare Pages upload (user action)
- **What's Done**: Build verified, tests created, documentation complete
- **What's Pending**: Manual upload to https://orca.getupsoft.com/, run production tests
- **Timeline**: ~20-30 minutes (user action required)

**Next Steps After Deploy**:
1. User uploads to Cloudflare Pages
2. Execute: `.\scripts\test-orca-production.ps1 -BaseUrl "https://orca.getupsoft.com"`
3. Verify production health
4. Announce deployment to team

---

## Pending Work (Session 15+)

### SECONDARY TASK: Odoo V19 Module Refactoring (MANDATORY)
- **Status**: 🔴 CRITICAL - All 30 core modules TODO
- **Mandate Date**: 2026-05-28 (already effective - non-negotiable)
- **Scope**: 30 core Odoo modules (Phase 1-6, ~80 hours)
- **Base Infrastructure**: Already complete (13 custom modules ✅)

**Architecture Already Defined**:
- ✅ `base_orca_integration` module (foundation)
- ✅ `OrcaLog` abstract model
- ✅ `OrcaAuditMixin` mixin class
- ✅ `AbstractOrcaService` placeholder
- ✅ Tests and security templates

**Current V19 Status**:
- ✅ 13 custom/localization modules: DONE
- ⏳ 30 core modules: TODO (blocked waiting for Phase 1 start)
- ❌ 0 core modules completed

**V19 Backlog**:
- `task-ledger/V19_COMPLETE_MODULE_REFACTORING_BACKLOG.md` - All 43 modules with estimates
- `task-ledger/V19_COMPLETE_MODULE_REFACTORING_MANDATE.md` - Mandate and rules
- `task-ledger/V19_ODOO_MODULE_SETUP_GUIDE.md` - Lab setup
- `task-ledger/V19_LAB_VALIDATION_CHECKPOINT.md` - Validation

---

## Sequential Workflow

```
SESSION 14 (CURRENT)
├─ ORCA Deploy: Build ✅ → Package ✅ → Upload [WAITING] → Test [WAITING]
└─ V19 Prep: Document [CURRENT] → Plan Phase 1 → Prepare Lab

SESSION 15 (NEXT)
├─ ORCA Deploy: Verify production [IF NEEDED]
└─ V19 Phase 1: Start Core Financial modules (account, account_accountant, account_payment, account_reports)
   ├─ Setup Odoo 19 lab
   ├─ Create base_orca_integration
   ├─ Refactor Phase 1 modules
   ├─ Run tests
   └─ Create PR (OO-F-401..404)
```

---

## Why Both Matter

### ORCA Deploy (Session 14)
- **Why Now**: User explicitly requested it, infrastructure ready, tests passing
- **Impact**: Makes ORCA available to end users at orca.getupsoft.com
- **Duration**: Quick (20-30 min user action + 5 min tests)

### V19 Refactoring (Session 15+)
- **Why Now**: Effective date passed (2026-05-28), all new PRs BLOCKED if not compliant
- **Impact**: Enables audit logging for all Odoo operations
- **Duration**: Long (80+ hours, 5 phases)
- **Non-Negotiable**: Code review will reject any module changes that don't include ORCA integration

---

## Do NOT Start V19 Phase 1 Yet

### Reasons to Wait
1. ORCA Deploy should complete first (20-30 min user action)
2. V19 requires Odoo 19 lab setup (separate environment)
3. Phase 1 is 13 hours of focused work (session duration varies)
4. Better to dedicate a full session to Phase 1 rather than context-switching

### When to Start Phase 1
- ✅ ORCA production tests passing
- ✅ User confirms deployment success
- ✅ Next session or when user explicitly asks for V19 work

---

## V19 Phase 1 Readiness

### What's Already Done
- ✅ Backlog created with all 43 modules
- ✅ Architecture designed (see plan file)
- ✅ Base module template ready
- ✅ Test templates prepared
- ✅ Lab setup guides written

### What Needs to Happen
1. Set up Odoo 19 development environment (documented in V19_ODOO_MODULE_SETUP_GUIDE.md)
2. Create base_orca_integration module (2 hours)
3. Refactor Phase 1 modules:
   - account (4 hours)
   - account_accountant (3 hours)
   - account_payment (3.5 hours)
   - account_reports (2.5 hours)
4. Run test suite (2 hours)
5. Create PR with all 4 modules (1 hour)

**Total Phase 1**: ~18 hours

---

## Checkpoints

### End of Session 14
- [ ] ORCA deployed to https://orca.getupsoft.com/
- [ ] Production tests passing
- [ ] This coordination document exists
- [ ] V19 Phase 1 is documented and ready to start

### Start of Session 15
- [ ] Review V19 backlog status
- [ ] Setup Odoo 19 lab
- [ ] Create base_orca_integration
- [ ] Begin Phase 1 module refactoring

---

## Key Files to Reference

### V19 Documentation
- `task-ledger/V19_COMPLETE_MODULE_REFACTORING_BACKLOG.md`
- `task-ledger/V19_COMPLETE_MODULE_REFACTORING_MANDATE.md`
- `task-ledger/V19_ODOO_MODULE_SETUP_GUIDE.md`
- `task-ledger/V19_LAB_VALIDATION_CHECKPOINT.md`

### ORCA Deploy Documentation
- `DEPLOYMENT_READY_SUMMARY.md`
- `CLOUDFLARE_PAGES_UPLOAD_GUIDE.md`
- `ORCA_PRODUCTION_DEPLOYMENT.md`

### Phase 1 Module Estimates
| Module | Hours | ID |
|--------|-------|-----|
| account | 4h | OO-F-401 |
| account_accountant | 3h | OO-F-402 |
| account_payment | 3.5h | OO-F-403 |
| account_reports | 2.5h | OO-F-404 |

---

## Current Status Summary

| Task | Status | Blocker | Next |
|------|--------|---------|------|
| ORCA Deploy | 🟡 Awaiting upload | User action | Upload to CF Pages |
| ORCA Tests | 🟢 Ready | None | Run after deploy |
| V19 Phase 1 | 🔴 TODO | None (but sequential) | Start next session |
| V19 Lab | 🟢 Documented | None | Setup when Phase 1 starts |

---

**This coordination ensures both critical paths complete successfully without context-switching mid-session.**

