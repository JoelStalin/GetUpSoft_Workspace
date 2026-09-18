# Phase 9: E2E Testing & Evidence Collection - Test Plan

**Status:** READY FOR EXECUTION  
**Date Created:** 2026-05-26  
**Author:** Claude Code  
**Phase Duration Est.:** 5 hours  

---

## Overview

Phase 9 validates the complete ORCA-Odoo integration through end-to-end testing with real fiscal operations. Three test scenarios will be executed, each capturing evidence (logs, metrics, screenshots/videos).

**Preconditions Required:**
- ✅ Phases 1-8 development complete (base module + API wiring done)
- ❓ Test Odoo 18 instance accessible (need to verify)
- ❓ DGII test credentials available (need user confirmation)
- ✅ NestJS backend with /api/orca/audit-log and /api/orca/fiscal-sync endpoints running

---

## Test Scenarios

### OO-021: Production Load Test (2 hours)

**Objective:** Verify ORCA logging scales to production workload without performance regression

**Prerequisites:**
- Active Odoo 18 test database
- base_orca_integration module installed
- l10n_do_accounting module installed with ORCA integration
- NestJS backend running and accessible

**Test Steps:**
1. **Setup:** Create test company and chart of accounts in Odoo
2. **Generate:** Create 1000 test invoice records programmatically
   - Use Odoo RPC API or direct database insertion
   - Generate valid fiscal numbers (e-CF format)
   - Vary invoice amounts, document types, and dates
3. **Monitor:** Measure performance metrics during creation
   - Average time per invoice creation
   - ORCA log database size growth
   - NestJS endpoint response times
   - Memory/CPU usage during bulk operation
4. **Verify:** Query ORCA logs for completeness
   - Confirm 1000 log entries created
   - Verify all fields populated (action, before_values, after_values)
   - Check orca_synced status (should be True if NestJS running)

**Acceptance Criteria:**
- ✅ 1000 invoices created without errors
- ✅ Average creation time <500ms per invoice
- ✅ 100% of invoices have ORCA log entry
- ✅ All before/after values captured correctly
- ✅ NestJS received all 1000 audit logs (if endpoint instrumented)

**Evidence to Capture:**
- [ ] Database query: `SELECT COUNT(*) FROM l10n_do_accounting_orca_log WHERE action='create'`
- [ ] Performance metrics (CSV): invoice_id, creation_time_ms, orca_sync_time_ms
- [ ] NestJS logs showing 1000 POST /api/orca/audit-log requests
- [ ] Screenshot: ORCA log tree view showing 1000+ entries

**Estimated Duration:** 2 hours (1h setup + data generation, 1h testing + analysis)

---

### OO-022: DGII Integration Test (1.5 hours)

**Objective:** Verify ORCA captures fiscal operations during DGII submission and logs EasyCount sync state

**Prerequisites:**
- All OO-021 prerequisites met
- DGII test credentials (RNC, PIN, or test mode)
- EasyCount instance or test endpoint configured
- l10n_do_accounting_report module installed with ORCA integration

**Test Steps:**
1. **Setup:** Create a test invoice with valid DGII fields
   - Set document type to "Comprobante Fiscal Electrónico" (e-CF)
   - Populate RNC, fiscal number, amount
   - Link to valid taxpayer
2. **Submit:** Trigger DGII submission via Odoo UI or API
   - Submit invoice to DGII (or test endpoint)
   - Monitor response status
3. **Verify:** Confirm ORCA and EasyCount logs captured the event
   - Query ORCA logs for sync action entries
   - Verify EasyCountFiscalService.notify_invoice_created() was called
   - Check EasyCount sync state (synced=True, no errors)
4. **Inspect:** Review captured audit trail
   - before_values: fiscal_state, amount, document_type
   - after_values: fiscal_state='done', orca_request_id set
   - orca_sync_error should be empty

**Acceptance Criteria:**
- ✅ Invoice successfully submitted to DGII (or test endpoint)
- ✅ ORCA log entry created with action='sync'
- ✅ EasyCount sync notification sent (HTTP 200/201)
- ✅ orca_synced and easycount_synced both True
- ✅ No errors in either service logs

**Evidence to Capture:**
- [ ] DGII response (success/error) with timestamp
- [ ] ORCA log entry showing fiscal sync (before/after values)
- [ ] EasyCount sync attempt log showing success
- [ ] Screenshot: account.move showing fiscal_state and sync timestamps
- [ ] NestJS logs showing POST /api/orca/fiscal-sync received

**Estimated Duration:** 1.5 hours (0.5h setup, 0.5h submission, 0.5h log analysis)

---

### OO-023: Evidence Collection & Documentation (1.5 hours)

**Objective:** Gather comprehensive evidence (screenshots, videos, metrics) for final validation

**Evidence Collection Checklist:**

**Functional Evidence:**
- [ ] Video (30s): ORCA log tree view showing 1000+ entries with columns (action, user, date, orca_synced, orca_request_id)
- [ ] Video (30s): Creating single invoice → ORCA log entry appears automatically in real-time
- [ ] Video (30s): DGII submission → fiscal_state changes → EasyCount sync triggered → orca_synced=True
- [ ] Screenshot: NestJS Swagger UI showing /api/orca/audit-log and /api/orca/fiscal-sync endpoints
- [ ] Screenshot: Database query results showing 1000 ORCA logs with timestamps

**Performance Evidence:**
- [ ] CSV: Load test metrics (1000 invoices with avg creation time, ORCA sync time)
- [ ] Chart/Graph: Creation time trend (should be ~constant, no performance cliff)
- [ ] NestJS logs excerpt: Sample 10 successful POST /api/orca/audit-log requests with response times

**Code Quality Evidence:**
- [ ] No console errors during testing (screenshot of DevTools console)
- [ ] No database warnings or slow query logs
- [ ] All v12-v18 modules have zero TODOs/FIXMEs (grep results)

**Metrics Summary:**
- [ ] Total invoices created: 1000
- [ ] ORCA logs created: 1000
- [ ] Average creation time: X ms
- [ ] Failed syncs: 0
- [ ] Test duration: X hours
- [ ] NestJS uptime during test: 100%

**Estimated Duration:** 1.5 hours (0.5h evidence capture + cleanup, 1h documentation + metrics compilation)

---

## Test Environment Configuration

**Required Components:**

| Component | Status | Details |
|-----------|--------|---------|
| Odoo 18 instance | ❓ UNKNOWN | Need to verify access + running status |
| base_orca_integration module | ✅ READY | Deployed in v18/Modules/ |
| l10n_do_accounting (v18) | ✅ READY | Refactored with ORCA integration |
| NestJS backend | ❓ UNKNOWN | /api/orca/audit-log and /api/orca/fiscal-sync endpoints required |
| DGII test credentials | ❓ UNKNOWN | RNC + PIN or test mode access needed |
| EasyCount instance | ❓ UNKNOWN | /api/easycount/* endpoints need to be accessible |

**Status Legend:** ✅ = Ready to use | ⚠️ = Requires configuration | ❓ = Unknown/pending verification

---

## Execution Checklist

**Pre-Test Verification:**
- [ ] Odoo 18 test instance is running and accessible
- [ ] All v18 ORCA modules are installed in test database
- [ ] NestJS backend is running and endpoints are responding
- [ ] DGII test mode is enabled or credentials are valid
- [ ] EasyCount endpoints are accessible (or mocked)
- [ ] Test database has sufficient disk space for 1000+ invoices

**During Testing:**
- [ ] Monitor Odoo logs for errors during OO-021
- [ ] Monitor NestJS logs for request failures during OO-022
- [ ] Capture all evidence files with timestamps
- [ ] Document any unexpected behavior or errors

**Post-Test:**
- [ ] Compile metrics CSV and charts
- [ ] Review all ORCA logs for data completeness
- [ ] Verify no data loss or corruption
- [ ] Generate final evidence summary report

---

## Success Criteria (Phase 9 Complete)

✅ **All three test scenarios passed without critical errors**
✅ **1000 invoices created with 100% ORCA logging**
✅ **DGII submission captured in ORCA audit trail**
✅ **All evidence files collected and documented**
✅ **Performance metrics within acceptable ranges (<500ms/invoice)**
✅ **Zero data corruption or loss**

---

## Known Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| Test instance not running | Pre-test verification step; fallback to docker-compose if needed |
| DGII test mode unavailable | Use mock endpoint returning success responses |
| Performance slow (>500ms/invoice) | Investigate indexing, service-to-service latency, database bottlenecks |
| NestJS endpoint down during test | Implement retry logic; document failed sync attempts |
| Evidence not captured | Video screen recording app ready (use OBS or Windows native) |

---

## Next Steps

1. **User Confirmation:** Verify test environment is ready (Odoo instance, DGII access, EasyCount)
2. **Environment Setup:** If needed, spin up test containers or configure mock endpoints
3. **Execute OO-021:** Run load test (2h)
4. **Execute OO-022:** Run DGII integration test (1.5h)
5. **Execute OO-023:** Collect evidence and compile report (1.5h)
6. **Final Review:** Verify all acceptance criteria met
7. **Archive Evidence:** Save all test logs, videos, metrics to `.claude/evidence/phase9/`
8. **Close Epic:** Update backlog to Phase 9 COMPLETE

---

## Files to Update Upon Completion

- ✅ CHANGE_TIMELINE.md — Add Phase 9 completion summary
- ✅ orca-odoo-integration-backlog.md — Mark OO-021, OO-022, OO-023 as DONE
- ✅ task-ledger/phase9-e2e-test-results.md — Detailed evidence and metrics
- ✅ Git commit: "Phase 9 complete: E2E tests passed, all evidence collected"

---

## Contact & Support

For environment setup issues or test data generation help, refer to:
- Odoo deployment docs: `02_Odoo_ERP/Odoo_Consolidated_Library/v18/README.md`
- DGII integration: `02_Odoo_ERP/Odoo_Consolidated_Library/v18/Modules/l10n_do_accounting/DGII_INTEGRATION.md`
- NestJS backend: `apps/backend-nest/README.md`
