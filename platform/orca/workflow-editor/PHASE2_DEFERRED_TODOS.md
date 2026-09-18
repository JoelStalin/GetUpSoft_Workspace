# Phase 2 Deferred TODOs - ORCA Workflow Editor

**Status:** Documented & Deferred to Phase 2 (State Management Enhancement)  
**Date Documented:** 2026-05-25  
**Phase Target:** Phase 2 - State Management Enhancement (6.5 hours estimated)

---

## Deferred Implementation Items

### 1. Undo/Redo Command Pattern Implementation
**File:** `src/stores/useEditorStore.ts` (lines 205-211)  
**Functions:** `undo()`, `redo()`  
**Reason for Deferral:** 
- Requires full Command pattern implementation
- Needs history stack traversal logic with state snapshots
- Should be implemented as part of Phase 2 state management refactoring
- Currently stubbed with console warnings

**Phase 2 Task Reference:** P2-002 (Custom hooks for workflow operations)  
**Estimated Effort:** 1-2 hours  
**Dependencies:** 
- Phase 2-001: Create contexts (WorkflowContext must exist first)
- Zustand history state management setup

**Implementation Checklist (Phase 2):**
- [ ] Implement Command pattern with execute/undo/redo methods
- [ ] Create history snapshot system (diff-based or full state snapshots)
- [ ] Add undo/redo stack management (max 50 states for memory)
- [ ] Integrate with WorkflowContext hooks
- [ ] Write unit tests (useWorkflowHistory hook)
- [ ] Selenium test undo/redo workflow

---

### 2. Production Error Tracking Integration (Sentry/DataDog)
**File:** `src/utils/errorHandler.ts` (line 88)  
**Function:** `logError()`  
**Reason for Deferral:**
- Requires external SDK setup (Sentry or DataDog)
- Needs environment configuration (.env, API keys)
- Should have error sampling strategy to avoid quota overages
- Placeholder console logging now (safe for Phase 11 deployment)

**Phase 2+ Task Reference:** Infrastructure/DevOps phase (after Phase 11 stabilization)  
**Estimated Effort:** 2-3 hours (including SDK setup, configuration, testing)  
**Dependencies:**
- Phase 11 deployment must be stable first
- DevOps team must configure Sentry/DataDog project
- Environment variables setup

**Implementation Checklist (Phase 2+ DevOps):**
- [ ] Choose monitoring service (Sentry recommended for JavaScript)
- [ ] Create project in Sentry/DataDog
- [ ] Add SDK to package.json and initialize in app bootstrap
- [ ] Configure error sampling rules
- [ ] Set up source maps upload
- [ ] Configure alerts for critical errors
- [ ] Test error tracking with synthetic errors
- [ ] Document error dashboard access for on-call team

---

## Summary

**Total Deferred Work:** ~3-5 hours  
**Current Status:** Phase 1 (Professional Upgrade) ✅ COMPLETE  
**Next Phase:** Phase 2 (State Management Enhancement) - READY_TO_START  
**Why Deferred?**
- Phase 11 deployment is current priority (DevOps, not engineering)
- Phase 2 work is foundational for undo/redo implementation
- Error tracking is infrastructure concern (Phase 2+)

**Documentation Impact:** All TODOs now explained in code with Phase references

---

**Related Documents:**
- `master-phase-plan.md` - Phase 2 detailed plan
- `phase2-state-management-plan.md` - State management architecture
- `progress.json` - Automated progress tracking
