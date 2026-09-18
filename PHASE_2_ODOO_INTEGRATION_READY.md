# Phase 2 ORCA Odoo Integration - READY TO START

**Date:** 2026-05-26  
**Status:** ✅ READY FOR NEXT SESSION  
**Prerequisite:** Phase 1 COMPLETE (commits 45f36f70b, 833c05b38, 843b6bc4d)

---

## Quick Start

When you start the next session, you can begin Phase 2 immediately. All prerequisites are in place:

1. ✅ base_orca_integration module fully functional (v18.0.1.0.0)
2. ✅ l10n_do_accounting refactored as Phase 1 reference (v18.0.2.0.0)
3. ✅ CHANGE_TIMELINE.md updated with Phase 1 completion
4. ✅ orca-odoo-integration-backlog.md established with Phase 2 stories
5. ✅ All work pushed to origin/main

---

## Phase 2 Scope

**Refactor remaining v18 modules with ORCA integration (6 hours estimated)**

### Modules to Refactor (in order):

1. **l10n_do_accounting_report** (~2 hours)
   - Create: `l10n_do_accounting_report/models/account_move_report_orca.py`
   - Create: `l10n_do_accounting_report/services/easycount_service.py`
   - Create: `l10n_do_accounting_report/views/account_move_report_orca_log_views.xml`
   - Track fields: date_from, date_to, state, report_type (wizard)
   - Apply OrcaAuditMixin to report wizard model

2. **l10n_do_pos** (~2 hours)
   - Create: `l10n_do_pos/models/pos_order_orca.py`
   - Track fields: name, state, amount_total, partner_id, document_type (pos.order)
   - Create views and update manifest

3. **pos_kitchen_core** (~1 hour)
   - Create: `pos_kitchen_core/models/kitchen_order_orca.py`
   - Track kitchen order events (state, order_id, items)
   - Simpler module, minimal new files

4. **pos_printing_suite** (~1 hour)
   - Create: `pos_printing_suite/models/print_log_orca.py`
   - Track print actions (document_type, user_id, status)
   - Simplest module, reuse same pattern

---

## Implementation Pattern (Reuse from Phase 1)

Each module follows the same pattern as l10n_do_accounting refactoring:

### Template Checklist:

- [ ] Update `__manifest__.py`:
  - Change author to "getupsoft"
  - Bump version to 18.0.2.0.0
  - Add "base_orca_integration" to depends
  - Add views/<module>_orca_log_views.xml to data

- [ ] Create `models/<module>_orca.py`:
  - Define concrete log model (inherit from orca.log)
  - Add domain-specific extra fields
  - Apply OrcaAuditMixin to main tracked model
  - Set _orca_tracked_fields and _orca_log_model

- [ ] Create `services/__init__.py` and `services/easycount_service.py`:
  - Copy EasyCountFiscalService from l10n_do_accounting
  - Adapt method names if module-specific

- [ ] Create `views/<module>_orca_log_views.xml`:
  - Copy template from l10n_do_accounting views
  - Update model names and field names
  - Update menu parent if different

- [ ] Update `models/__init__.py`:
  - Add `from . import <module>_orca`

- [ ] Update `security/ir.model.access.csv`:
  - Add entries for new log model

- [ ] Create/update `data/` files if needed

---

## Key Files to Reference

### Phase 1 Implementation Examples:
- **base_orca_integration:** `02_Odoo_ERP/Odoo_Consolidated_Library/v18/Modules/base_orca_integration/` — use as reference for base patterns
- **l10n_do_accounting:** `02_Odoo_ERP/Odoo_Consolidated_Library/v18/Modules/l10n_do_accounting/` — use as template
  - `models/account_move_orca.py` — copy structure
  - `services/easycount_service.py` — copy service template
  - `views/account_move_orca_log_views.xml` — copy view template
  - `__manifest__.py` — manifest changes pattern

### Documentation:
- **Plan:** `.claude/plans/proud-skipping-riddle.md` — full architecture (reference for Phase 5-8)
- **Backlog:** `task-ledger/orca-odoo-integration-backlog.md` — Phase 2 stories (OO-003, OO-004, OO-005, OO-006)
- **Timeline:** `CHANGE_TIMELINE.md` — update after each module refactoring

---

## Git Workflow for Phase 2

After completing each module:

```bash
# Stage changes for one module
git add "02_Odoo_ERP/Odoo_Consolidated_Library/v18/Modules/<module>/__manifest__.py"
git add "02_Odoo_ERP/Odoo_Consolidated_Library/v18/Modules/<module>/models/<module>_orca.py"
git add "02_Odoo_ERP/Odoo_Consolidated_Library/v18/Modules/<module>/services/"
git add "02_Odoo_ERP/Odoo_Consolidated_Library/v18/Modules/<module>/views/<module>_orca_log_views.xml"
git add "02_Odoo_ERP/Odoo_Consolidated_Library/v18/Modules/<module>/models/__init__.py"
git add "02_Odoo_ERP/Odoo_Consolidated_Library/v18/Modules/<module>/security/ir.model.access.csv"

# Create commit
git commit -m "feat: Phase 2 - Refactor <module> with ORCA integration (v18.0.2.0.0)

- Apply OrcaAuditMixin to <model> with [field list]
- Create <model>OrcaLog with domain-specific fields
- Add EasyCountFiscalService placeholder
- Create ORCA audit log views and menu
- Update security and manifest

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"

# Push after each module or batch
git push origin main
```

---

## Current Git Commit Status

**Latest Commits:**
1. `843b6bc4d` — CHANGE_TIMELINE update with Phase 1 completion (2026-05-26 20:30)
2. `833c05b38` — Session completion summary (Phase 1 ORCA integration)
3. `45f36f70b` — Phase 1 implementation (base_orca_integration + l10n_do_accounting)

**Branch:** main  
**Remote:** up to date with origin/main  
**Working Directory:** Clean (only pre-existing untracked items)

---

## Pre-Requisites Check (All ✅)

- ✅ base_orca_integration module exists and fully implements OrcaLog, OrcaAuditMixin, AbstractOrcaService
- ✅ l10n_do_accounting refactored with OrcaAuditMixin, AccountMoveOrcaLog, EasyCountFiscalService
- ✅ CHANGE_TIMELINE.md includes Phase 1 section with commit references
- ✅ orca-odoo-integration-backlog.md created with all 9 phases
- ✅ .claude/plans/proud-skipping-riddle.md contains full architecture plan
- ✅ All commits pushed to origin/main
- ✅ Git working directory clean (no pending changes)
- ✅ No tests failing or pending
- ✅ No blocker issues identified

---

## Estimated Timeline for Phase 2

| Module | Est. | Actual | Status |
|--------|------|--------|--------|
| l10n_do_accounting_report | 2h | - | TODO |
| l10n_do_pos | 2h | - | TODO |
| pos_kitchen_core | 1h | - | TODO |
| pos_printing_suite | 1h | - | TODO |
| Testing + commits | 1h | - | TODO |
| **Phase 2 Total** | **6h** | - | **TODO** |

---

## After Phase 2 Complete

1. Commit all Phase 2 changes (one per module or batch)
2. Push to origin/main
3. Update CHANGE_TIMELINE.md with Phase 2 completion
4. Start Phase 3: refactor l10n_do_rnc_search v18 + NestJS endpoints planning

---

## Notes for Next Session

- Phase 2 modules are independent — can refactor in any order
- All modules follow same OrcaAuditMixin pattern from Phase 1
- Services are placeholders until NestJS endpoints ready
- Focus on code reuse from Phase 1 templates
- After Phase 2, NestJS team should create the real endpoints

**Status:** Ready to begin Phase 2 implementation immediately.

---

**Last Updated:** 2026-05-26 20:45 UTC  
**Prepared For:** Next Development Session  
**Next Phase:** Phase 2 - v18 Module Refactoring (6 hours)
