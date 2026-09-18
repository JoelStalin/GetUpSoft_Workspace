# V19 ORCA Lab Testing Procedure

**Date:** 2026-05-28  
**Purpose:** Step-by-step guide for installing and validating all v19 ORCA modules in a lab environment  
**Duration:** 2-3 hours  
**Requirement:** Odoo 19.0 instance with PostgreSQL database access

---

## Overview

This procedure validates that:
1. ✅ All 13 ORCA modules install without errors
2. ✅ Database tables and models are created correctly
3. ✅ ORCA logging hooks are active and working
4. ✅ Field auto-detection (CRITICAL/HIGH tier) functioning
5. ✅ Access control rules properly bound
6. ✅ No errors in application logs

---

## Prerequisites

Before starting, verify:

```bash
# Check Odoo is running
systemctl status odoo
# Expected: ● odoo.service - OpenERP (Odoo)
#                    Active: active (running)

# Check database exists
psql -U odoo -l | grep odoo19_test
# Or your test database name

# Check disk space
df -h | grep -E "^/dev|odoo"
# Expected: >5GB free

# Verify odoo-bin accessible
which odoo-bin
# Expected: /usr/bin/odoo-bin or similar
```

---

## Step 1: Prepare Lab Environment (15 minutes)

### 1.1 Create Fresh Test Database

```bash
# Create database from production backup or template
sudo -u postgres createdb \
  -T template0 \
  -E UTF8 \
  -l C \
  odoo19_lab

# Set owner
sudo -u postgres psql -c "ALTER DATABASE odoo19_lab OWNER TO odoo;"

# Create required extensions
psql -U odoo odoo19_lab << 'EOF'
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "hstore";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
EOF

# Verify database ready
psql -U odoo odoo19_lab -c "SELECT version();"
```

**Expected output:**
```
PostgreSQL 12.x on ...
(1 row)
```

### 1.2 Initialize Odoo Base (if fresh database)

```bash
# Install base module only
python3 odoo-bin \
  -d odoo19_lab \
  -i base \
  --no-http \
  --stop-after-init

# Expected: "successfully loaded"
```

### 1.3 Open Terminal for Log Monitoring

```bash
# In a separate terminal, start monitoring logs
./scripts/monitor_orca_logs.sh /var/log/odoo/odoo.log

# Keep this running during installation
# Any errors will be displayed in real-time
```

---

## Step 2: Install All ORCA Modules (30-45 minutes)

### 2.1 Run Automated Installation Script

```bash
# Make script executable
chmod +x ./scripts/install_v19_orca_modules.sh

# Run installation with monitoring
./scripts/install_v19_orca_modules.sh odoo19_lab /etc/odoo/odoo.conf

# Expected output:
# ✅ Each module installs successfully
# ✅ Database verification passes
# ✅ ORCA log models found
# ✅ No errors in final report
```

**What the script does:**
1. Connects to database (verify connection)
2. Installs base_orca_integration first (dependency)
3. Installs 9 extended modules in sequence
4. Installs 4 localization modules
5. Verifies each installation in database
6. Confirms ORCA log models exist
7. Tests ORCA mixin is applied
8. Checks application logs for errors
9. Generates validation report

### 2.2 Monitor Output Carefully

**✅ Good signs:**
```
✅ Installation successful: account_extended
✅ Database verification passed: account_extended
✅ ORCA log model verified: orca.account.move.log
✅ ORCA mixin properly applied: account_extended
```

**❌ Bad signs (STOP and investigate):**
```
❌ Installation failed for account_extended
❌ Database verification failed
❌ Module not found or uninstalled
❌ ORCA-related errors detected in log
Traceback / ImportError / AttributeError
```

### 2.3 Check Installation Log

```bash
# Review detailed log
tail -f test-results/v19_orca_install_*.log

# Look for:
# - "Loading module"
# - "Tables loaded"
# - "Module [...] loaded successfully"
# - NO "Error", "Traceback", "ImportError"
```

---

## Step 3: Run ORCA Logging Tests (15-20 minutes)

### 3.1 Execute Comprehensive Logging Tests

```bash
# Make script executable
chmod +x ./scripts/test_orca_logging.sh

# Run tests
./scripts/test_orca_logging.sh odoo19_lab /etc/odoo/odoo.conf

# Expected output:
# ✅ Test 1: All modules installed
# ✅ Test 2: All ORCA log models exist
# ✅ Test 3: account.move logging works
# ✅ Test 4: Write hook working
# ✅ Test 5: Field auto-detection working
# ✅ Test 6: Access control configured
# ✅ Test 7: ORCA tables in database
```

### 3.2 What Tests Verify

**Test 1: Module Installation**
- Confirms all 13 modules show "installed" state in database
- Command: `SELECT state FROM ir_module_module WHERE name='account_extended';`

**Test 2: ORCA Log Models**
- Verifies model exists in ir_model table
- Checks field count for each log model
- Command: `SELECT * FROM ir_model WHERE model='orca.account.move.log';`

**Test 3: Create Hook (account.move)**
- Creates test invoice
- Verifies ORCA log created automatically
- Checks log contains correct fields
- Expected: 1 log with action='create'

**Test 4: Write Hook**
- Modifies existing record
- Checks for write action log
- Verifies before/after values captured

**Test 5: Field Auto-Detection**
- Confirms CRITICAL tier for account.move
- Checks _orca_tier and _orca_log_model attributes
- Verifies mixin properly applied

**Test 6: Access Control**
- Lists all ir.model.access rules for ORCA models
- Shows permission matrix (read/write/create/delete)
- Verifies accountants have read-only, managers have full access

**Test 7: Database Tables**
- Lists all ORCA tables: `\dt orca*`
- Shows schema is properly created

### 3.3 Review Test Output

```bash
# Check detailed test results
cat test-results/v19_orca_logging_test_*.log

# Look for each test marked PASS or FAIL
# If any FAIL, see error details and root cause
```

---

## Step 4: Monitor Logs for Errors (Continuous, 15 minutes)

### 4.1 Real-Time Error Detection

The monitoring script (started in Step 1.3) continuously watches for:

```
ERROR keywords:
- "orca.*error" (ORCA-specific errors)
- "error.*orca"
- "module.*error.*extended"
- "CRITICAL"
- "ImportError" (module load failures)
- "AttributeError" (missing fields/methods)
- "model.*not.*found" (missing models)
```

### 4.2 Respond to Errors

**If ERROR detected in logs:**

```bash
# 1. Check specific error
grep "ERROR" /var/log/odoo/odoo.log | tail -20

# 2. Identify module causing error
grep "account_extended\|pos_extended\|..." /var/log/odoo/odoo.log | grep -i error

# 3. Check module state
psql -U odoo odoo19_lab -c \
  "SELECT name, state, last_update FROM ir_module_module WHERE name='account_extended';"

# 4. If uninstalled unexpectedly, reinstall
python3 odoo-bin \
  --addons-path=02_Odoo_ERP/Odoo_Consolidated_Library/v19/Modules \
  -d odoo19_lab \
  -i account_extended \
  --no-http \
  --stop-after-init

# 5. Check logs again
tail -f /var/log/odoo/odoo.log
```

### 4.3 Common Errors and Solutions

**Error: "Model orca.account.move.log not found"**
- **Cause:** ORCA log model class not loading
- **Solution:** Check Python syntax in models file
  ```bash
  python3 -m py_compile \
    02_Odoo_ERP/Odoo_Consolidated_Library/v19/Modules/account_extended/models/account_move_orca.py
  ```

**Error: "Field 'orca_tier' not found"**
- **Cause:** OrcaUniversalMixin not inherited properly
- **Solution:** Check AccountMove class inheritance
  ```python
  # Should have both:
  _inherit = ['account.move', 'orca.universal.mixin']
  ```

**Error: "Access denied for model orca.account.move.log"**
- **Cause:** Security rules not binding or user groups wrong
- **Solution:** Check security/ir.model.access.csv
  ```bash
  cat 02_Odoo_ERP/Odoo_Consolidated_Library/v19/Modules/account_extended/security/ir.model.access.csv
  ```

**Error: "Module depends on base_orca_integration"**
- **Cause:** Installation order wrong
- **Solution:** Install base_orca_integration first, then others

---

## Step 5: Validate ORCA Functionality (20 minutes)

### 5.1 Manual Test: Create Invoice and Check ORCA Log

```bash
# Connect to Odoo shell
python3 odoo-bin \
  -d odoo19_lab \
  -c /etc/odoo/odoo.conf \
  --shell
```

**In Odoo shell:**
```python
# 1. Create test journal
journal = env['account.journal'].search([('type','=','general')], limit=1)
if not journal:
    journal = env['account.journal'].create({
        'name': 'Test Journal',
        'code': 'TJOURNAL',
        'type': 'general',
        'company_id': env.company.id,
    })

# 2. Create test invoice
move = env['account.move'].create({
    'move_type': 'out_invoice',
    'journal_id': journal.id,
    'partner_id': env.ref('base.partner_demo').id,
    'invoice_date': '2026-05-28',
    'invoice_line_ids': [(0, 0, {
        'product_id': env.ref('product.product_product_1').id,
        'quantity': 1,
        'price_unit': 100.0,
    })],
})

# 3. Check ORCA log was created
logs = env['orca.account.move.log'].search([
    ('record_id', '=', move.id),
    ('action', '=', 'create')
])

print(f"ORCA logs created: {len(logs)}")
if logs:
    log = logs[0]
    print(f"  Model: {log.model_name}")
    print(f"  Action: {log.action}")
    print(f"  User: {log.user_id.name}")
    print(f"  Fields captured: {len(eval(log.after_values) if log.after_values else {})}")
    print("✅ ORCA logging working correctly!")
else:
    print("❌ No ORCA log found - logging may not be working")

# 4. Exit shell
exit()
```

**Expected output:**
```
ORCA logs created: 1
  Model: account.move
  Action: create
  User: Administrator
  Fields captured: 15+
✅ ORCA logging working correctly!
```

### 5.2 Manual Test: Verify Access Control

```bash
# Connect as different user types
# Test 1: Portal user (should have NO access)
su - www-data  # or your non-admin user
python3 odoo-bin -d odoo19_lab --shell
# Try: env['orca.account.move.log'].search([])
# Expected: AccessError (permission denied)

# Test 2: Accountant user (should have READ-ONLY)
# Try: env['orca.account.move.log'].search([]) -> Should succeed (read)
# Try: log.write({'orca_synced': True}) -> Should fail (no write)

# Test 3: Manager user (should have FULL ACCESS)
# Try: log.write({'orca_synced': True}) -> Should succeed
```

---

## Step 6: Generate Final Report (5 minutes)

### 6.1 Collect All Results

```bash
# Gather all log files
ls -lah test-results/v19_orca_*

# Create summary
cat > test-results/V19_LAB_TEST_SUMMARY_$(date +%Y%m%d).txt << 'EOF'
V19 ORCA Lab Testing Summary
Generated: $(date)

Installation Status:
- base_orca_integration: ✅
- account_extended: ✅
- pos_extended: ✅
- [others]: ✅

Validation Status:
- ORCA log models: ✅
- Logging hooks: ✅
- Field auto-detection: ✅
- Access control: ✅
- Database tables: ✅

Log Analysis:
- Errors found: 0
- Warnings: [count]
- ORCA operations: [count]

Status: ✅ ALL TESTS PASSED
Ready for: Production Deployment
EOF
```

### 6.2 Success Criteria Checklist

```
✅ All 13 modules installed without error
✅ ORCA log models exist in database (ir_model table)
✅ ORCA log tables created (_orca_* tables)
✅ Create hook working (logs created on record creation)
✅ Write hook working (logs created on record modification)
✅ Unlink hook working (logs created on record deletion)
✅ Field auto-detection working (CRITICAL/HIGH tier)
✅ Access control enforced (read-only for accountants)
✅ No errors in application logs
✅ All 7 automated tests PASS
✅ Manual invoice test shows ORCA log created
✅ User access control validated
```

---

## Step 7: Troubleshooting Guide

### If Any Test FAILS

**1. Check installation log for specific error:**
```bash
grep "ERROR\|Traceback" test-results/v19_orca_install_*.log | head -20
```

**2. Check module state:**
```bash
psql -U odoo odoo19_lab -c \
  "SELECT name, state FROM ir_module_module WHERE name LIKE '%orca%' ORDER BY name;"
```

**3. Reinstall failed module:**
```bash
# Uninstall
python3 odoo-bin \
  -d odoo19_lab \
  -c /etc/odoo/odoo.conf \
  --shell << 'EOF'
env['ir.module.module'].search([('name','=','account_extended')]).button_immediate_uninstall()
EOF

# Reinstall
python3 odoo-bin \
  --addons-path=02_Odoo_ERP/Odoo_Consolidated_Library/v19/Modules \
  -d odoo19_lab \
  -i account_extended \
  --no-http \
  --stop-after-init
```

**4. Check Python syntax:**
```bash
python3 -m py_compile 02_Odoo_ERP/Odoo_Consolidated_Library/v19/Modules/account_extended/models/*.py
```

**5. Check file permissions:**
```bash
ls -la 02_Odoo_ERP/Odoo_Consolidated_Library/v19/Modules/account_extended/
# Should be readable by odoo user
```

**6. Check Odoo logs:**
```bash
tail -100 /var/log/odoo/odoo.log
grep -i "error\|traceback" /var/log/odoo/odoo.log | tail -20
```

---

## Complete Lab Test Checklist

Print this and mark off as you complete:

```
PRE-LAB VERIFICATION
☐ Odoo 19.0 running (systemctl status odoo)
☐ Database exists (psql -l | grep odoo19_lab)
☐ Disk space available (df -h shows 5GB+)
☐ odoo-bin accessible (which odoo-bin)

STEP 1: PREPARE ENVIRONMENT
☐ Create fresh test database
☐ Create ORCA extensions (uuid-ossp, hstore, pg_trgm)
☐ Initialize Odoo base module
☐ Start log monitoring script

STEP 2: INSTALL MODULES
☐ Run install_v19_orca_modules.sh
☐ All 13 modules show "successfully installed"
☐ No errors during installation
☐ Installation report generated

STEP 3: RUN ORCA LOGGING TESTS
☐ Run test_orca_logging.sh
☐ Test 1 PASS: All modules installed
☐ Test 2 PASS: ORCA log models exist
☐ Test 3 PASS: account.move logging works
☐ Test 4 PASS: Write hook working
☐ Test 5 PASS: Field auto-detection working
☐ Test 6 PASS: Access control configured
☐ Test 7 PASS: ORCA tables in database

STEP 4: MONITOR LOGS
☐ Monitor script running for 15+ minutes
☐ No ORCA-related errors detected
☐ No ImportError or AttributeError
☐ Module load messages successful

STEP 5: MANUAL VALIDATION
☐ Created test invoice
☐ ORCA log created automatically
☐ Fields captured correctly
☐ Access control working (accountant read-only)
☐ Access control working (manager full access)

STEP 6: FINAL REPORT
☐ Generated test summary
☐ All success criteria met
☐ No unresolved errors
☐ Lab test PASSED

READY FOR PRODUCTION
☐ All tests PASSED
☐ No errors or warnings
☐ Configuration correct
☐ Ready to deploy to staging
```

---

## Expected Timing

| Phase | Duration | What Happens |
|-------|----------|-------------|
| Prerequisites check | 5 min | Verify Odoo, DB, disk space |
| Step 1: Setup | 15 min | Create test DB, initialize base |
| Step 2: Install all modules | 45 min | Sequential install of 13 modules |
| Step 3: Run tests | 20 min | Validate all components |
| Step 4: Monitor logs | 15 min | Watch for errors in real-time |
| Step 5: Manual tests | 20 min | Test invoice creation, access control |
| Step 6: Report | 5 min | Generate summary |
| **Total** | **2-3 hours** | Complete lab validation |

---

## Next Steps

**If all tests PASS:**
1. ✅ You have validated the code works in Odoo 19
2. ✅ Proceed to staging environment deployment
3. ✅ Follow V19_STAGING_DEPLOYMENT_STRATEGY.md

**If any test FAILS:**
1. ❌ Investigate root cause using troubleshooting guide
2. ❌ Fix code issue or configuration problem
3. ❌ Re-run failing test until PASS
4. ❌ Document any changes made

---

## Support

**If you encounter issues:**
- Check the detailed logs in `test-results/` directory
- Review error messages in `/var/log/odoo/odoo.log`
- Run individual tests to isolate the problem
- Verify database and module state with SQL queries
- Document error for debugging

**Contact:**
- Submit detailed error output from test logs
- Include module name and specific error message
- Attach latest `/var/log/odoo/odoo.log` excerpt

