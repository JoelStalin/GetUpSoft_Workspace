# V19 ORCA Deployment Execution Checklist

**Deployment Date:** _______________  
**Deployed By:** _______________  
**Approved By:** _______________  

---

## PRE-DEPLOYMENT VALIDATION (Day Before)

### Code & Module Quality
- [ ] All 78 tests passing on staging: `./scripts/run_v19_orca_tests.sh`
- [ ] Code review completed and signed off
- [ ] All manifest files validated (version, author, depends)
- [ ] Security files reviewed (model IDs match Odoo pattern)
- [ ] Views verified loading on staging

### Environment Readiness
- [ ] PostgreSQL 12+ running and accessible
- [ ] Odoo v19.0 stable running on staging
- [ ] Backup of production database created and tested
- [ ] Disk space >2GB free (staging + production)
- [ ] Network connectivity verified
- [ ] Firewall rules confirmed

### Stakeholder Preparation
- [ ] Users notified of deployment window (1 week prior)
- [ ] Support team trained on ORCA features
- [ ] UAT team signed off on test results
- [ ] Management approves deployment plan
- [ ] Rollback plan reviewed by team

---

## DEPLOYMENT DAY EXECUTION

### Pre-Deployment (T-60 minutes)

- [ ] System status checks:
  ```bash
  # Check Odoo status
  systemctl status odoo
  
  # Check database size
  psql -U odoo -l | grep production
  
  # Check disk space
  df -h | grep odoo
  ```

- [ ] Notify users:
  - [ ] Email notification sent
  - [ ] In-app banner displayed (if available)
  - [ ] Support team on standby

- [ ] Final test run (on staging copy):
  ```bash
  ./scripts/run_v19_orca_tests.sh staging_copy /etc/odoo/odoo.conf
  ```
  Expected result: **78/78 PASS** ✅

### Deployment Execution (T-0)

#### Step 1: Blue-Green Environment Setup (T+0 to T+30)

- [ ] Copy production database to "Green" instance:
  ```bash
  pg_dump -U odoo production_db | \
    psql -U odoo -d production_db_green
  Elapsed time: _______ min
  ```

- [ ] Verify Green database:
  ```bash
  psql -U odoo production_db_green -c "SELECT COUNT(*) FROM res_company;"
  Expected: ≥ [count from production]
  ```

- [ ] Update Odoo config to point to Green (NOT ACTIVE YET):
  ```bash
  # Edit /etc/odoo/odoo.conf or override in environment
  # Do NOT activate yet
  ```

#### Step 2: Module Installation on Green (T+30 to T+60)

- [ ] Install base_orca_integration:
  ```bash
  python3 odoo-bin \
    --addons-path=02_Odoo_ERP/Odoo_Consolidated_Library/v19/Modules \
    -d production_db_green \
    -i base_orca_integration \
    --no-http \
    --stop-after-init
  Status: ✅ Success / ❌ Failed
  Elapsed time: _______ min
  ```

- [ ] Install extended modules (batch):
  ```bash
  # Install: account_extended, pos_extended, sale_extended, 
  #          asset_extended, stock_extended, payment_extended,
  #          bank_extended, invoice_extended
  
  [Run batch installation script]
  Status: ✅ Success / ❌ Failed
  Elapsed time: _______ min
  ```

- [ ] Install localization modules:
  ```bash
  # Install: l10n_do_accounting, l10n_do_accounting_report,
  #          l10n_do_pos, l10n_do_rnc_search
  
  [Run batch installation script]
  Status: ✅ Success / ❌ Failed
  Elapsed time: _______ min
  ```

#### Step 3: Green Environment Validation (T+60 to T+90)

- [ ] Verify all modules installed:
  ```bash
  python3 odoo-bin -d production_db_green --shell << 'EOF'
  modules = env['ir.module.module'].search([('name','ilike','orca')])
  for m in modules:
      print(f"{m.name}: {m.state}")
  EOF
  
  Expected: All modules = "installed" ✅
  ```

- [ ] Run quick functional test (on Green):
  ```bash
  # Create test invoice and verify ORCA log appears
  [Manual test or automated script]
  Status: ✅ Pass / ❌ Fail
  ```

- [ ] Check view loading:
  ```bash
  # Access Accounting > ORCA Logs in UI
  Expected: No errors, list view loads ✅
  ```

#### Step 4: Traffic Switch to Green (T+90 to T+95)

- [ ] **FINAL GO/NO-GO DECISION**
  - [ ] All checks passed above?  YES / NO
  - [ ] Team lead approval?  YES / NO
  - [ ] Ready to switch traffic?  YES / NO

- [ ] Switch database routing:
  ```bash
  # Option A: Update Odoo configuration file
  sed -i 's/dbname = production_db/dbname = production_db_green/' /etc/odoo/odoo.conf
  
  # Option B: Update load balancer
  [LB command to route to Green instance]
  
  # Option C: Update connection string in app
  [Change connection string]
  
  Status: ✅ Switched
  Time of switch: _________
  ```

- [ ] Restart Odoo service:
  ```bash
  systemctl restart odoo
  # Wait for service to start
  sleep 30
  systemctl status odoo
  Expected: ● odoo.service - OpenERP (Odoo)
                    Active: active (running) ✅
  ```

- [ ] Verify Green is now active:
  ```bash
  psql -U odoo production_db_green -c "SELECT COUNT(*) FROM orca_account_move_log;"
  # Should be empty or 0 (just installed)
  Expected: 0 ✅
  ```

#### Step 5: Post-Deployment Monitoring (T+95 to T+180)

**First 30 minutes (Critical monitoring):**
- [ ] Check application logs:
  ```bash
  tail -f /var/log/odoo/odoo.log | grep -i error
  Expected: No ORCA-related errors ✅
  ```

- [ ] Test user login:
  ```
  Login to Odoo as different user types
  - [ ] Admin/System user
  - [ ] Accounting manager
  - [ ] Accountant/user
  
  Expected: All can login ✅
  ```

- [ ] Verify ORCA logs being created:
  ```bash
  # Create test invoice
  # Verify ORCA log appears within 10 seconds
  
  Status: ✅ Logs appearing / ❌ No logs
  Time to create log: _______ sec
  ```

- [ ] Check performance metrics:
  ```bash
  # Monitor database CPU, connections
  watch -n 5 'psql -U odoo production_db_green -c "
    SELECT datname, count(*) FROM pg_stat_activity 
    GROUP BY datname;"'
  
  Expected: Normal connection count (<50) ✅
  ```

**Ongoing monitoring (Next 23.5 hours):**
- [ ] ORCA log generation rate (every 4 hours):
  ```bash
  psql -U odoo production_db_green -c "
    SELECT COUNT(*) as logs_last_hour 
    FROM orca_account_move_log 
    WHERE date > NOW() - INTERVAL '1 hour';"
  
  Expected: > 10 logs/hour (depending on activity) ✅
  ```

- [ ] Database query performance (every 6 hours):
  ```bash
  # Check slow queries
  pg_stat_statements report
  Expected: ORCA queries < 100ms ✅
  ```

- [ ] Error log review (every 4 hours):
  ```bash
  grep -i "ERROR\|CRITICAL" /var/log/odoo/odoo.log | tail -20
  Expected: No ORCA-related errors ✅
  ```

---

## INCIDENT RESPONSE PROCEDURES

### If Critical Issue Found (Response within 1 hour)

**Issue Type:** ________________________________________

**Issue Severity:** CRITICAL / HIGH / MEDIUM

**Response Steps:**
1. [ ] Stop accepting new transactions (maintenance mode)
2. [ ] Assess impact:
   ```bash
   # Check affected module/data
   psql -c "SELECT * FROM orca_[module]_log ORDER BY date DESC LIMIT 10;"
   ```
3. [ ] Decide: FIX vs ROLLBACK
   - **FIX** (if minor data issue):
     ```bash
     # Example: UPDATE orca_logs SET field = value WHERE condition
     ```
   - **ROLLBACK** (if critical):
     ```bash
     # Switch back to Blue (production_db)
     sed -i 's/dbname = production_db_green/dbname = production_db/' /etc/odoo/odoo.conf
     systemctl restart odoo
     Time to rollback: _______ min
     ```

4. [ ] Verify stability (5 min after action)
5. [ ] Communicate to users
6. [ ] Escalate to management

### If Performance Issue Found (Response within 4 hours)

**Symptoms:** _________________________________________

**Investigation:**
```bash
# Slow query analysis
EXPLAIN ANALYZE SELECT * FROM orca_account_move_log 
  WHERE date > NOW() - INTERVAL '1 day' 
  ORDER BY date DESC LIMIT 100;

# Check missing indexes
SELECT * FROM pg_stat_user_indexes 
  WHERE schemaname = 'public' AND tablename LIKE 'orca%';
```

**Resolution:**
- [ ] Add missing indexes
- [ ] Archive old logs
- [ ] Optimize queries
- [ ] If issue persists: ROLLBACK to Blue

---

## POST-DEPLOYMENT SIGN-OFF (Day 1, End of Shift)

### Deployment Summary

| Metric | Value | Status |
|--------|-------|--------|
| Modules installed | 13/13 | ✅ |
| Tests passed | 78/78 | ✅ |
| Critical incidents | 0 | ✅ |
| Performance baseline | [value] | ✅ |
| ORCA logs created | [count] | ✅ |
| User logins successful | [count] | ✅ |

### Sign-Off

- [ ] **QA Lead:** All tests passed and UAT approved
  Signature: _________________ Date: _________

- [ ] **DevOps Lead:** Deployment executed successfully, monitoring in place
  Signature: _________________ Date: _________

- [ ] **Deployment Lead:** All criteria met, deployment approved
  Signature: _________________ Date: _________

### Issues Encountered & Resolution

| Issue | Severity | Resolved? | Details |
|-------|----------|-----------|---------|
| [Issue 1] | HIGH | YES/NO | [Details] |
| [Issue 2] | MEDIUM | YES/NO | [Details] |

### Next Steps

- [ ] Continue 24/7 monitoring for next 7 days
- [ ] Expand to additional companies (if applicable)
- [ ] Schedule post-deployment review meeting
- [ ] Document lessons learned
- [ ] Plan Phase 3 rollout (if applicable)

---

## APPENDIX: Quick Reference

### Emergency Rollback (5 minutes)
```bash
# 1. Switch database
sed -i 's/production_db_green/production_db/' /etc/odoo/odoo.conf

# 2. Restart Odoo
systemctl restart odoo

# 3. Verify
psql -U odoo production_db -c "SELECT version();"
```

### Emergency Database Restore (30 minutes)
```bash
# 1. Stop Odoo
systemctl stop odoo

# 2. Restore from backup
dropdb production_db
gunzip < /backups/prod_backup.sql.gz | psql -U odoo

# 3. Verify and restart
psql -U odoo production_db -c "SELECT COUNT(*) FROM res_company;"
systemctl start odoo
```

### Contact Information
**On-Call DevOps:** _________________  
**Deployment Lead:** _________________  
**Emergency Escalation:** _________________  
**Incident War Room:** [Slack channel / Meeting link]  

