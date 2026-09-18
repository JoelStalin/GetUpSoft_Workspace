# V19 ORCA Staging Deployment & Production Readiness Strategy

**Date:** 2026-05-28  
**Status:** READY FOR EXECUTION  
**Target:** Odoo v19 production deployment (l10n_do_* modules + extended modules)  
**Timeline:** Phase-based deployment with comprehensive validation

---

## Deployment Overview

### Scope

**Modules in Scope (13 total):**
1. base_orca_integration — ORCA audit logging foundation
2. account_extended — Account move tracking (CRITICAL)
3. pos_extended — POS order tracking
4. sale_extended — Sales order tracking
5. asset_extended — Fixed asset tracking
6. stock_extended — Inventory movement tracking
7. payment_extended — Payment tracking
8. bank_extended — Bank statement tracking
9. invoice_extended — Invoice line tracking
10. l10n_do_accounting — Dominican localization (CRITICAL)
11. l10n_do_accounting_report — DGII reporting
12. l10n_do_pos — POS localization
13. l10n_do_rnc_search — RNC lookup integration

### Deployment Phases

**Phase 1: Staging Environment (Week 1)**
- Install to staging replica of production database
- Execute full test suite validation
- Perform user acceptance testing (UAT)
- Benchmark performance baseline
- Conduct security audit

**Phase 2: Limited Production Rollout (Week 2)**
- Deploy to production with monitoring
- Enable only for test company first (restricted scope)
- Monitor ORCA logs generation
- Verify audit trail accuracy
- Collect metrics for 24-48 hours

**Phase 3: Full Production Rollout (Week 3)**
- Expand to all companies
- Enable ORCA synchronization to external systems
- Full operational support

---

## Pre-Deployment Checklist

### Code Quality Gate (MUST PASS)

- [ ] **Test Suite:** All 78 tests passing on Odoo v19 instance
  - Command: `./scripts/run_v19_orca_tests.sh test_v19_orca /etc/odoo/odoo.conf`
  - Expected: 12-21 minutes, 78/78 PASS
  - Acceptable failure rate: 0%

- [ ] **Code Review:** Security audit completed
  - All model naming correct (orca.* pattern)
  - All security rules properly bound
  - No SQL injection vectors
  - No hardcoded credentials

- [ ] **Manifest Validation:** All 13 manifests valid
  - Author: "getupsoft" on all modules
  - Version: 19.0.1.0.0 or higher
  - License: LGPL-3
  - Dependencies correctly declared

- [ ] **View Configuration:** All 13 modules have complete views
  - Tree view (list)
  - Form view (detail)
  - Search view (filters)
  - Menu item
  - Action button

- [ ] **Security Files:** All 13 modules have access control
  - User/accountant groups have read-only access
  - Manager/admin groups have full access
  - Model references match Odoo auto-generated IDs

- [ ] **Database Migrations:** No custom SQL or migration scripts needed
  - Models inherit from base Odoo models
  - No structural schema changes required
  - Fields use standard Odoo types

### Business Logic Gate (MUST PASS)

- [ ] **ORCA Logging:** Create/write/unlink hooks working
  - Create action logged with full field snapshot
  - Write action logged with before/after values
  - Unlink action logged with final snapshot
  - User attribution correct

- [ ] **Field Auto-Detection:** CRITICAL and HIGH tier working
  - CRITICAL tier: ~20-30 accounting/operational fields detected
  - HIGH tier: ~15-20 fields detected per model
  - No manual field configuration needed

- [ ] **Access Control:** Role-based restrictions enforced
  - Accountants: Read-only ORCA logs
  - Managers: Full CRUD on ORCA logs
  - System admin: Unrestricted access

### Infrastructure Gate (MUST PASS)

- [ ] **PostgreSQL:** v12+ compatible
  - Connection pooling configured
  - Backup verified and restorable
  - Maintenance window scheduled

- [ ] **Odoo Instance:** v19.0 stable
  - All modules installed and loaded
  - Custom modules updated to latest
  - No conflicting third-party modules

- [ ] **Storage:** Adequate disk space
  - 2GB+ free for ORCA audit logs growth (est. 50KB/day per company)
  - Backup space: 2x production database size
  - Log rotation configured

- [ ] **Network:** Connectivity verified
  - Staging can reach production database (read-only backup)
  - Production can reach ORCA API (when endpoint is ready)
  - No firewall blocks on required ports

---

## Staging Environment Setup

### Database Preparation

```bash
# 1. Create staging database from production backup
pg_dump -U odoo production_db | gzip > /backups/prod_$(date +%Y%m%d).sql.gz
gunzip < /backups/prod_$(date +%Y%m%d).sql.gz | psql -U odoo -d staging_v19_orca

# 2. Verify staging database
psql -U odoo staging_v19_orca -c "SELECT COUNT(*) FROM res_company;"

# 3. Clear ORCA logs from staging (if any pre-existing)
psql -U odoo staging_v19_orca -c "DELETE FROM orca_log; DELETE FROM orca_account_move_log; DELETE FROM orca_pos_order_log;" 2>/dev/null || true
```

### Module Installation

```bash
# 1. Install base dependency first
python3 odoo-bin \
  --addons-path=02_Odoo_ERP/Odoo_Consolidated_Library/v19/Modules \
  -d staging_v19_orca \
  -i base_orca_integration \
  --no-http \
  --stop-after-init

# 2. Install extended modules in sequence
for module in account_extended pos_extended sale_extended asset_extended stock_extended payment_extended bank_extended invoice_extended; do
  python3 odoo-bin \
    --addons-path=02_Odoo_ERP/Odoo_Consolidated_Library/v19/Modules \
    -d staging_v19_orca \
    -i $module \
    --no-http \
    --stop-after-init
done

# 3. Install localization modules
for module in l10n_do_accounting l10n_do_accounting_report l10n_do_pos l10n_do_rnc_search; do
  python3 odoo-bin \
    --addons-path=02_Odoo_ERP/Odoo_Consolidated_Library/v19/Modules \
    -d staging_v19_orca \
    -i $module \
    --no-http \
    --stop-after-init
done

# 4. Verify all modules installed
python3 odoo-bin \
  -d staging_v19_orca \
  -i base \
  --no-http \
  --stop-after-init \
  --shell
```

### User Acceptance Testing (UAT)

**Test Scenario 1: Account Move Creation & Logging**
```
Preconditions:
- Staging environment ready
- Accounting manager user logged in

Steps:
1. Navigate to Accounting > Invoices > New
2. Create sample customer invoice (amount: $1,000)
3. Set state to "Posted"
4. Navigate to Accounting > ORCA Logs
5. Filter by model_name = 'account.move'

Expected:
- 2 ORCA logs present (create + write for post state)
- before_values shows empty {}
- after_values shows all fields (move_type, amount_total, partner, etc.)
- user_id matches logged-in user
- orca_synced = False (not yet synced)

Pass Criteria:
- All fields captured correctly
- Timestamps within 1 second of action
- Field values match source record
```

**Test Scenario 2: POS Order Logging**
```
Preconditions:
- POS session active
- pos_extended module installed

Steps:
1. Create POS order with 3 items
2. Process payment (cash)
3. Close session
4. Navigate to POS > ORCA Logs

Expected:
- Multiple ORCA logs for order lifecycle
- Fields captured: amount_total, order_state, cashier, etc.
- before_values show state transitions (draft → payment → closed)

Pass Criteria:
- Correct field tracking at each state change
- No data loss during transitions
```

**Test Scenario 3: Access Control**
```
Preconditions:
- Two users: accountant (read-only) and manager (full access)

Steps (Accountant):
1. Navigate to Accounting > ORCA Logs
2. Try to edit a log record
3. Try to delete a log record

Expected:
- Read-only access granted
- Edit/delete buttons disabled or error shown

Steps (Manager):
1. Same navigation
2. Successfully edit log record status
3. Successfully delete old log records

Expected:
- Full CRUD access granted
- Changes recorded in database

Pass Criteria:
- Accountants cannot modify audit logs
- Managers have full control
```

### Performance Baseline

Run load test with production-like transaction volume:

```bash
# 1. Create 100 invoices in rapid succession
python3 << 'EOF'
import odoo
env = odoo.Environment()
for i in range(100):
    env['account.move'].create({
        'move_type': 'out_invoice',
        'journal_id': 1,
        'partner_id': 2,
        'invoice_date': '2026-05-28',
        'amount_total': 1000.0 + i,
    })
    if i % 10 == 0:
        print(f"Created {i} invoices")
EOF

# 2. Measure ORCA log creation performance
psql -U odoo staging_v19_orca -c "
SELECT COUNT(*) as log_count, 
       AVG(EXTRACT(EPOCH FROM (date_trunc('second', created_at) - created_at))) as avg_capture_latency_ms
FROM orca_account_move_log
WHERE created_at > NOW() - INTERVAL '5 minutes';"

# 3. Check query response times
time psql -U odoo staging_v19_orca -c "
SELECT * FROM orca_account_move_log 
ORDER BY date DESC 
LIMIT 50;"
```

**Expected Baselines:**
- Log creation latency: <10ms per transaction
- Log retrieval (50 records): <100ms
- Database growth: ~50KB/day per company

---

## Deployment Strategy: Blue-Green

### Why Blue-Green?

- Instant rollback if issues detected
- Zero downtime deployment
- No user interruption
- Data consistency guaranteed
- Easy A/B testing/comparison

### Execution

**Setup Phase (Pre-deployment day):**

```
Production DB (Blue)          Production DB (Green)
├── v19 base + custom         ├── v19 base + custom
├── NO ORCA modules           ├── NEW: All 13 ORCA modules
├── Users accessing ↓          └── Idle, not accessed
└── Active traffic
```

**Deployment Phase (Day 0 early morning):**

1. **Green Environment Preparation (30 min)**
   ```bash
   # Create copy of Blue (production) as Green
   pg_dump -U odoo production_db | psql -U odoo -d production_db_v2
   
   # Install ORCA modules on Green
   python3 odoo-bin \
     --addons-path=02_Odoo_ERP/Odoo_Consolidated_Library/v19/Modules \
     -d production_db_v2 \
     -i base_orca_integration,account_extended,pos_extended,... \
     --no-http \
     --stop-after-init
   ```

2. **Green Validation (30 min)**
   ```bash
   # Run test suite on Green
   ./scripts/run_v19_orca_tests.sh production_db_v2 /etc/odoo/odoo.conf
   
   # Run UAT scenarios
   # Create sample invoice, verify ORCA log appears
   ```

3. **Traffic Switch (5 min)**
   ```bash
   # Update Odoo config to point to Green database
   # Update load balancer to route to Green instance
   # Verify first transactions logged in ORCA
   ```

4. **Monitoring (24 hours)**
   - Check ORCA log generation rate
   - Monitor query performance
   - Verify no errors in application logs
   - Check audit trail accuracy

5. **Rollback Plan (If issues)**
   ```bash
   # Within 1 hour window: Route back to Blue
   # Data loss: Only ORCA logs from Green deployment window
   # Re-plan and fix issues
   ```

---

## Rollback Procedures

### Scenario 1: Critical Bug Found (Rollback within 1 hour)

**Indicator:**
- ORCA logs not being created
- View loading failures
- Security rules not binding

**Action:**
```bash
# 1. Immediate rollback
UPDATE database_config SET active_db = 'production_db' WHERE name='odoo19_prod';
systemctl restart odoo

# 2. Verify Blue is active
psql -U odoo production_db -c "SELECT COUNT(*) FROM orca_account_move_log;" 
# Expected: Should match pre-deployment count

# 3. Disable affected modules temporarily
python3 odoo-bin \
  -d production_db \
  -c /etc/odoo/odoo.conf \
  --shell << 'EOF'
# Uninstall problematic module
env['ir.module.module'].search([('name','=','account_extended')]).button_immediate_uninstall()
EOF

# 4. Fix code and re-test on Green
# Then plan Phase 2 deployment
```

**Timeline:** <5 minutes to rollback

### Scenario 2: Performance Degradation (Rollback within 4 hours)

**Indicator:**
- ORCA log queries >1000ms
- Database CPU >80% sustained
- User complaints about slowness

**Action:**
```bash
# 1. Check query performance
EXPLAIN ANALYZE SELECT * FROM orca_account_move_log WHERE date > NOW() - INTERVAL '1 day' ORDER BY date DESC LIMIT 100;

# 2. If ORCA queries are bottleneck
# Option A: Add index to orca logs
CREATE INDEX CONCURRENTLY idx_orca_logs_date ON orca_account_move_log(date DESC) WHERE orca_synced = false;

# Option B: Archive old logs
DELETE FROM orca_account_move_log WHERE date < NOW() - INTERVAL '90 days';

# Option C: Rollback if indexes don't help
UPDATE database_config SET active_db = 'production_db' WHERE name='odoo19_prod';
systemctl restart odoo
```

**Timeline:** <30 minutes to resolve or rollback

### Scenario 3: Data Integrity Issue (Rollback within 24 hours)

**Indicator:**
- ORCA logs show incorrect values
- Audit trail inconsistencies
- Field snapshots missing data

**Action:**
```bash
# 1. Validate data on both databases
SELECT audit_inconsistencies FROM (
  SELECT record_id, COUNT(*) as log_count 
  FROM orca_account_move_log 
  GROUP BY record_id 
  HAVING COUNT(*) > 3
) AS suspicious_records;

# 2. If minor issue: Fix in database
UPDATE orca_account_move_log SET after_values = '{}' WHERE after_values IS NULL;

# 3. If major issue: 
#    - Create hotfix in code
#    - Rollback to Blue
#    - Deploy fixed Green

# 4. Plan data reconciliation:
#    - Compare audit logs between Blue and Green
#    - Identify discrepancies
#    - Document findings for review
```

**Timeline:** <2 hours to stabilize or rollback

---

## Monitoring & Observability

### Key Metrics to Track

| Metric | Baseline | Alert Threshold | Unit |
|--------|----------|-----------------|------|
| ORCA logs/minute | 50 | <40 or >500 | logs/min |
| Log creation latency | <10ms | >50ms | milliseconds |
| Log query response | <100ms | >500ms | milliseconds |
| Database CPU | <30% | >70% sustained | percent |
| Disk growth | 50KB/day | >100KB/day | KB/day |
| Failed syncs | 0 | >1/hour | count |
| Audit accuracy | 100% | <99% | percent |

### Monitoring Commands

```bash
# 1. ORCA log generation rate
watch -n 5 'psql -U odoo production_db -t -c "
SELECT COUNT(*) as new_logs, 
       COUNT(DISTINCT user_id) as active_users,
       COUNT(DISTINCT DATE(date)) as days_with_activity
FROM orca_account_move_log 
WHERE date > NOW() - INTERVAL '1 hour';"'

# 2. Query performance monitoring
psql -U odoo production_db -c "
SELECT query, calls, mean_time, max_time
FROM pg_stat_statements
WHERE query LIKE '%orca%'
ORDER BY mean_time DESC
LIMIT 10;"

# 3. Log table size
psql -U odoo production_db -c "
SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE tablename LIKE '%orca%'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;"

# 4. Module status check
python3 odoo-bin -d production_db --shell << 'EOF'
modules = env['ir.module.module'].search([('name','ilike','orca')])
for m in modules:
    print(f"{m.name}: {m.state}")
EOF
```

### Alerting Rules

**Critical (Immediate notification):**
- Any module in "uninstalled" state (unexpected uninstall)
- Log creation failure (0 logs for >10 minutes)
- Database connection error

**High (30-minute notification window):**
- Log query latency >500ms
- Database CPU >75% sustained
- Disk free space <1GB

**Medium (4-hour notification window):**
- Log query latency >200ms
- Database CPU >50% sustained

---

## Post-Deployment Validation (Day 1-7)

### Day 1 (Deployment Day) — Immediate Checks

- [ ] All 13 modules show "Installed" state
- [ ] ORCA logs being created (check activity per hour)
- [ ] No error messages in application logs
- [ ] Performance metrics stable
- [ ] All views loading without errors
- [ ] User access control working (read-only vs full access)

### Day 2-3 — Functional Validation

- [ ] Verify ORCA logs for all transaction types:
  - [ ] Account moves (invoices, bills, entries)
  - [ ] POS orders
  - [ ] Sales orders
  - [ ] Fixed asset operations
  - [ ] Inventory movements
  - [ ] Payments
  - [ ] Bank statements
  - [ ] Invoice line changes

- [ ] Field tracking accuracy:
  - [ ] CRITICAL tier fields captured (~20-30 per model)
  - [ ] HIGH tier fields captured (~15-20 per model)
  - [ ] before/after values complete and accurate
  - [ ] Timestamps correct (within 1 second of action)

- [ ] User attribution:
  - [ ] Correct user captured in orca_log.user_id
  - [ ] User names visible in views
  - [ ] Activity filtered by user works

### Day 4-7 — Performance & Stability

- [ ] Database growth rate normal (~50KB/day per company)
- [ ] Query response times consistent (<100ms for list view)
- [ ] No memory leaks or connection pool exhaustion
- [ ] Log rotation working (if configured)
- [ ] Backup/restore procedures tested

---

## Go/No-Go Decision Framework

### Phase 1 → Phase 2 (Staging Approval)

**GO Criteria (All must be TRUE):**
- [ ] 78/78 tests passing
- [ ] UAT scenarios pass
- [ ] Performance baseline meets expectations
- [ ] No security findings
- [ ] All views load correctly
- [ ] All access controls working

**NO-GO Actions:**
- [ ] Fix identified issues
- [ ] Re-test affected areas
- [ ] Document root cause
- [ ] Schedule Phase 2 after fixes validated

### Phase 2 → Phase 3 (Limited Rollout Approval)

**GO Criteria (All must be TRUE):**
- [ ] 24 hours without incidents in Green
- [ ] ORCA logs accurate and complete
- [ ] Performance stable
- [ ] User feedback positive
- [ ] Database integrity verified

**NO-GO Actions:**
- [ ] Pause Phase 3 expansion
- [ ] Continue monitoring Green
- [ ] Identify and fix root cause
- [ ] Plan Phase 3 restart for next day

### Phase 3 (Full Rollout Approval)

**GO Criteria (All must be TRUE):**
- [ ] All companies tested on limited rollout
- [ ] No issues in 48-72 hours
- [ ] Backup verified restorable
- [ ] Support team trained
- [ ] Documentation complete

**NO-GO Actions:**
- [ ] Maintain Phase 2 state
- [ ] Schedule full rollout after blockers resolved

---

## Timeline & Scheduling

### Week 1: Staging & UAT
| Day | Activity | Duration | Owner |
|-----|----------|----------|-------|
| Mon | Database setup, module install | 2h | DevOps |
| Tue | Full test suite execution | 1h | QA |
| Tue-Wed | UAT scenarios | 4h | Business |
| Thu | Performance testing | 2h | DevOps |
| Fri | Security review, go/no-go meeting | 2h | Security/Team |

### Week 2: Limited Production Rollout
| Day | Activity | Duration | Owner |
|-----|----------|----------|-------|
| Mon | Blue-green setup, Green deploy | 3h | DevOps |
| Mon-Tue | Monitoring & validation (24h) | Ongoing | Ops |
| Wed | Performance review, expand to test company | 1h | Team |
| Wed-Fri | Continuous monitoring | Ongoing | Ops |

### Week 3: Full Production Rollout
| Day | Activity | Duration | Owner |
|-----|----------|----------|-------|
| Mon | Final go/no-go meeting | 0.5h | Team |
| Mon-Tue | Expand to all companies (staged) | 4h | DevOps |
| Tue-Fri | Monitoring & support | Ongoing | Ops/Support |

---

## Risk Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| Test suite failures | Medium | High | Run tests in staging first; have rollback plan |
| Performance degradation | Medium | High | Performance test in staging; add indexes before deploy |
| Security misconfiguration | Low | Critical | Security audit before deploy; test access control thoroughly |
| Data corruption | Low | Critical | Backup tested before deploy; data validation queries ready |
| User resistance | Low | Medium | Communication plan; training materials ready |
| Deployment timing conflicts | Medium | Medium | Schedule during maintenance window; notify users 1 week prior |

---

## Success Criteria

**Deployment is successful when:**
1. ✅ All 13 modules installed without error
2. ✅ 78 tests passing (or documented exceptions)
3. ✅ ORCA logs generating at expected rate
4. ✅ Field tracking accurate for all models
5. ✅ User access control enforced
6. ✅ Performance baseline maintained
7. ✅ Database integrity verified
8. ✅ Zero critical incidents in 48 hours
9. ✅ All users can access ORCA logs through UI
10. ✅ Audit trail complete and auditable

---

## Post-Deployment Support (Week 4+)

### Support SLA

| Severity | Response Time | Resolution Time |
|----------|---------------|-----------------|
| Critical (data loss, security) | 15 min | 2 hours |
| High (feature broken) | 1 hour | 4 hours |
| Medium (performance issue) | 4 hours | 24 hours |
| Low (documentation, enhancement) | 24 hours | 1 week |

### Runbook for Common Issues

**Issue: ORCA logs not appearing**
```
1. Check module installed: env['ir.module.module'].search([('name','=','base_orca_integration')]).state
2. Check table exists: psql -c "\dt orca_*"
3. Check permissions: psql -c "SELECT grantee, privilege_type FROM role_table_grants WHERE table_name='orca_log';"
4. Re-install module if needed: uninstall → install
```

**Issue: Views not loading**
```
1. Check external IDs: psql -c "SELECT * FROM ir_model_data WHERE name LIKE '%orca%';"
2. Verify model references: psql -c "SELECT model FROM ir_ui_view WHERE name LIKE '%orca%';"
3. Check for typos: compare view files against model names
4. Clear view cache: env['ir.ui.view'].clear_caches()
```

---

## Appendix: Contact & Escalation

**Deployment Lead:** Joel Stalin Martinez Espinal  
**QA Lead:** [Assigned]  
**DevOps Lead:** [Assigned]  
**Security Lead:** [Assigned]  

**Escalation:**
- Issue discovered: Team lead → Deployment lead → Management
- Critical incident: Direct to CTO + Deployment lead
- Post-incident: Root cause analysis within 24 hours

