# Phase 9: E2E Testing & Evidence Collection - ORCA + EasyCount Odoo Integration

**Document Status:** 🟡 TESTING PLAN (Ready for Execution)  
**Date Created:** 2026-05-27  
**Phase:** 9 (Final Integration Validation)  
**Epic:** ORCA-ODOO-13

---

## Executive Summary

Phase 9 validates the complete ORCA + EasyCount integration across Odoo versions through end-to-end testing. Tests verify:
1. ✅ Audit logging: Create/write/unlink operations logged to ORCA
2. ✅ Project tracking: Logs include project_id for multi-tenant isolation
3. ✅ HTTP integration: Odoo services POST to NestJS endpoints successfully
4. ✅ Fiscal operations: EasyCount sync triggered on invoice events
5. ✅ Error recovery: Failed syncs logged and recoverable

---

## Test Scenarios

### Scenario 1: Create Invoice → ORCA Audit Log (OO-021)

**Description:** Create a new account.move (invoice) and verify ORCA audit log is recorded

**Preconditions:**
- Odoo 18 instance running
- l10n_do_accounting v18.0.2.0.0 module installed with base_orca_integration dependency
- NestJS backend running on http://orca.getupsoft.com
- orca.api.url and orca.api.key configured in ir.config.parameter

**Test Steps:**
1. Create account.move with partner, invoice lines, fiscal data
   - move_type: 'out_invoice'
   - partner_id: existing customer
   - amount_total: 1000.00 DOP
   - l10n_latam_document_type_id: 'invoice'

2. Verify OrcaLog entry created
   - Record ID matches created move
   - Action = 'create'
   - before_values = '{}'
   - after_values contains name, state, amount_total, etc.

3. Verify NestJS endpoint called
   - POST /api/orca/audit-log received request
   - Payload contains: project_id, module_name='l10n_do_accounting', model_name='account.move'
   - Response 201 Created with orca_request_id

4. Verify sync status in Odoo
   - OrcaLog.orca_synced = True
   - OrcaLog.orca_request_id populated

**Expected Result:** ✅ PASS
- OrcaLog created with action='create'
- HTTP POST to NestJS succeeded
- orca_synced marked true

---

### Scenario 2: Update Invoice → Write Audit Log (OO-022)

**Description:** Modify invoice and verify write operation logged

**Preconditions:**
- Same as Scenario 1
- Invoice created in Scenario 1

**Test Steps:**
1. Update account.move
   - Change ref: '2024-001' → '2024-002'
   - Change state: 'draft' → 'posted'

2. Verify OrcaLog entry created
   - Action = 'write'
   - before_values contains old values (ref='2024-001', state='draft')
   - after_values contains new values (ref='2024-002', state='posted')

3. Verify NestJS sync
   - POST /api/orca/audit-log received
   - before/after values correctly serialized as JSON

**Expected Result:** ✅ PASS
- OrcaLog created with action='write'
- before_values and after_values populated correctly

---

### Scenario 3: Delete Invoice → Unlink Audit Log (OO-023)

**Description:** Delete invoice and verify unlink operation logged

**Preconditions:**
- Same as Scenario 1
- Invoice in draft state

**Test Steps:**
1. Delete account.move

2. Verify OrcaLog entry created (before deletion)
   - Action = 'unlink'
   - Record snapshot saved to before_values
   - after_values = '{}'

3. Verify deletion succeeded
   - account.move no longer exists
   - OrcaLog entry preserved (for audit trail)

**Expected Result:** ✅ PASS
- OrcaLog created with action='unlink'
- Invoice record deleted, audit trail preserved

---

### Scenario 4: Project Isolation (OO-024)

**Description:** Verify project_id correctly identifies audit logs by project

**Preconditions:**
- Two GetUpSoft projects configured
- Different orca.project.id values in each

**Test Steps:**
1. Create invoice in Project A
2. Create invoice in Project B
3. Query /api/orca/audit-log?project_id=A
4. Query /api/orca/audit-log?project_id=B

**Expected Result:** ✅ PASS
- Project A query returns only logs with project_id='A'
- Project B query returns only logs with project_id='B'
- No cross-project data leakage

---

### Scenario 5: Fiscal Integration (OO-025)

**Description:** Verify EasyCount sync triggered on fiscal operations

**Preconditions:**
- l10n_do_accounting_report v18.0.2.0.0 installed
- DGII API credentials configured
- EasyCount sync enabled

**Test Steps:**
1. Create and post invoice (l10n_do_accounting)
2. Generate DGII monthly report (l10n_do_accounting_report)
3. Submit report to DGII
4. Verify EasyCount sync triggered
   - HTTP POST to /api/easycount/fiscal-operations/notify
   - Payload contains report_id, submission_status, response_code

5. Verify ORCA audit log created for sync
   - Action = 'sync'
   - Captures DGII confirmation number
   - Tracks submission timestamp

**Expected Result:** ✅ PASS
- DGII submission succeeds
- EasyCount notified
- ORCA log created with fiscal details

---

### Scenario 6: Error Recovery (OO-026)

**Description:** Verify failed syncs logged and recoverable

**Preconditions:**
- NestJS backend temporarily unreachable
- Cron job for retry configured

**Test Steps:**
1. Create invoice while NestJS offline
2. Verify OrcaLog created
   - orca_synced = False
   - orca_sync_error captures HTTP error

3. Wait for retry cron (1 hour interval)
4. Start NestJS backend
5. Verify retry succeeds
   - orca_synced = True
   - orca_sync_error cleared

**Expected Result:** ✅ PASS
- Initial sync failure logged
- Retry mechanism functional
- Eventual consistency achieved

---

## Test Execution Plan

### Phase 9A: Manual Testing (3-4 hours)

**Resources:**
- 1 QA engineer
- Odoo 18 test instance
- NestJS backend access
- Test data (100+ invoices)
- DGII test credentials

**Procedure:**
1. Execute Scenarios 1-6 in order
2. Capture screenshots/logs at each step
3. Document any failures
4. Verify all logs visible in /api/orca/audit-log

**Success Criteria:**
- All 6 scenarios PASS
- No errors in Odoo logs
- No errors in NestJS logs
- Audit trail complete for each operation

---

### Phase 9B: Load Testing (1-2 hours)

**Description:** Verify performance with high-volume audit logging

**Test Script:**
```python
# oo-021-load-test.py
import requests
import json
import time
from datetime import datetime

def create_invoice_batch(count=1000):
    """Create 1000 invoices and measure ORCA sync performance."""
    
    start_time = time.time()
    results = {
        'invoices_created': 0,
        'orca_logs_created': 0,
        'http_posts': 0,
        'failures': 0,
        'avg_time_ms': 0,
        'max_time_ms': 0
    }
    
    times = []
    
    for i in range(count):
        t0 = time.time()
        
        # Create invoice
        move = env['account.move'].create({
            'move_type': 'out_invoice',
            'partner_id': partners[i % len(partners)].id,
            'invoice_line_ids': [...],
        })
        
        # Measure
        elapsed_ms = (time.time() - t0) * 1000
        times.append(elapsed_ms)
        
        # Verify ORCA log
        log = env['l10n.do.accounting.orca.log'].search([
            ('record_id', '=', move.id),
            ('action', '=', 'create')
        ])
        
        if log and log.orca_synced:
            results['orca_logs_created'] += 1
            results['http_posts'] += 1
        else:
            results['failures'] += 1
    
    results['invoices_created'] = count
    results['avg_time_ms'] = sum(times) / len(times)
    results['max_time_ms'] = max(times)
    results['total_duration_sec'] = time.time() - start_time
    
    return results
```

**Expected Results:**
- 1000 invoices created in < 5 minutes
- Average log creation time < 5ms
- HTTP success rate > 99%
- No timeouts or connection errors

---

### Phase 9C: Evidence Collection (1 hour)

**Deliverables:**
1. **Screenshots:**
   - OrcaLog list view (tree)
   - OrcaLog form view (details)
   - NestJS audit log response
   - ORCA Swagger API documentation

2. **Logs:**
   - Odoo server.log excerpts (create/write/unlink events)
   - NestJS application.log (audit-log endpoint calls)
   - Performance metrics (response times, throughput)

3. **Performance Metrics:**
   - Load test results (1000 invoices)
   - Average HTTP response time
   - Peak memory usage
   - Database query performance

4. **Comparison Report:**
   - Before ORCA integration (no logging)
   - After ORCA integration (with logging)
   - Performance impact analysis

---

## Test Data Requirements

### Sample Data Set

| Entity | Count | Purpose |
|--------|-------|---------|
| Partners (Customers) | 10 | Invoice recipients |
| Products | 50 | Invoice line items |
| Invoices | 100+ | Primary test data |
| Cron Jobs | 2 | Retry sync (1h interval) |

### Partner Data
```python
partners = [
    {'name': 'ACME Corp', 'country': 'Dominican Republic'},
    {'name': 'TechCorp LLC', 'country': 'Dominican Republic'},
    # ... 8 more
]
```

---

## Success Criteria

### Functional
- ✅ All 6 test scenarios PASS
- ✅ Zero console errors in Odoo/NestJS
- ✅ All audit logs synced to ORCA (orca_synced=True)
- ✅ Project isolation working (cross-project filtering)

### Performance
- ✅ Average audit log creation time < 10ms
- ✅ HTTP POST success rate > 99%
- ✅ No performance degradation vs. non-logged operations

### Data Quality
- ✅ All audit logs have complete before/after snapshots
- ✅ Timestamps correct (ISO8601 format)
- ✅ User IDs correctly recorded
- ✅ Project IDs match configuration

### Documentation
- ✅ Screenshots captured for each scenario
- ✅ Performance metrics documented
- ✅ Any issues/gaps identified and logged

---

## Risk Mitigation

| Risk | Probability | Mitigation |
|------|-------------|-----------|
| NestJS endpoint not responding | Medium | Fallback to in-memory queue, retry logic |
| Odoo module loading error | Low | Verify manifest, dependency order |
| Data format mismatch | Low | Validate payload against OpenAPI spec |
| Performance regression | Low | Load test before/after integration |
| Audit trail gaps | Medium | Verify synchronous logging before async |

---

## Timeline

| Phase | Task | Est. Duration | Status |
|-------|------|----------------|--------|
| 9A | Manual Testing (6 scenarios) | 3-4 hours | ⏳ PENDING |
| 9B | Load Testing (1000 invoices) | 1-2 hours | ⏳ PENDING |
| 9C | Evidence Collection & Report | 1 hour | ⏳ PENDING |
| **Total** | **Phase 9** | **5-7 hours** | ⏳ PENDING |

---

## Approval & Sign-Off

**Phase 9 Ready for Execution:** YES ✅

**Prerequisites Met:**
- ✅ All Odoo modules refactored (Phases 1-8)
- ✅ NestJS endpoints implemented
- ✅ HTTP integration wired
- ✅ Test plan documented
- ✅ Test scenarios defined
- ✅ Success criteria established

**Awaiting:**
- User authorization to execute Phase 9
- Test environment setup (Odoo 18 + NestJS running)
- Test data provisioning

**Next Steps:**
1. User approves Phase 9 execution
2. QA team provisions test environment
3. Execute test scenarios 1-6
4. Run load test script
5. Collect evidence and documentation
6. Report results and recommendations

---

## Appendix: Test Execution Checklist

### Pre-Execution
- [ ] Odoo 18 instance running
- [ ] NestJS backend running
- [ ] All modules installed and enabled
- [ ] orca.api.url configured
- [ ] orca.api.key configured
- [ ] orca.project.id set
- [ ] Test data loaded
- [ ] Cron jobs enabled

### Scenario 1-3 Execution
- [ ] Scenario 1: Create invoice → ORCA log PASS
- [ ] Scenario 2: Update invoice → Write log PASS
- [ ] Scenario 3: Delete invoice → Unlink log PASS

### Scenario 4-6 Execution
- [ ] Scenario 4: Project isolation PASS
- [ ] Scenario 5: Fiscal integration PASS
- [ ] Scenario 6: Error recovery PASS

### Evidence Collection
- [ ] Screenshots captured (6+ images)
- [ ] Performance metrics recorded
- [ ] Logs exported
- [ ] Report generated

### Sign-Off
- [ ] All scenarios PASSED
- [ ] No blocking issues
- [ ] Phase 9 approved
- [ ] Evidence archived

---

**Document Version:** 1.0  
**Last Updated:** 2026-05-27  
**Author:** Claude Haiku 4.5  
**Status:** READY FOR EXECUTION
