# V19 ORCA Lab Validation Checkpoint

**Status:** 🔴 PENDING - Awaiting User Lab Testing Execution  
**Date:** 2026-05-28  
**Purpose:** Define exactly what must happen to complete v19 ORCA integration

---

## V19 Completion Status

### ✅ COMPLETE (Code Level)

| Item | Status | Evidence |
|------|--------|----------|
| 13 ORCA modules implemented | ✅ | Commits: 0c3d592b0, 12c5b481c, 59bcb6b13, etc. |
| 78 unit tests created | ✅ | Every module has 3-5 test cases |
| Bug fixes applied | ✅ | 1cde7e399: Model naming + security corrections |
| Installation scripts ready | ✅ | `scripts/install_v19_orca_modules.sh` |
| Testing scripts ready | ✅ | `scripts/test_orca_logging.sh` |
| Monitoring scripts ready | ✅ | `scripts/monitor_orca_logs.sh` |
| Lab testing guide ready | ✅ | `task-ledger/V19_LAB_TESTING_PROCEDURE.md` |
| Staging deployment guide ready | ✅ | `task-ledger/V19_STAGING_DEPLOYMENT_STRATEGY.md` |
| Production deployment guide ready | ✅ | `task-ledger/V19_DEPLOYMENT_CHECKLIST.md` |

### 🔴 PENDING (User Lab Validation)

| Step | Status | What You Need to Do |
|------|--------|-----|
| Create test database | 🔴 PENDING | Run: `createdb odoo19_lab` + extensions |
| Install base_orca_integration | 🔴 PENDING | Execute: `odoo-bin -d odoo19_lab -i base_orca_integration` |
| Install 12 remaining modules | 🔴 PENDING | Execute: `./scripts/install_v19_orca_modules.sh odoo19_lab /etc/odoo/odoo.conf` |
| Run 78 unit tests | 🔴 PENDING | Execute: `./scripts/test_orca_logging.sh odoo19_lab /etc/odoo/odoo.conf` |
| Monitor logs for errors | 🔴 PENDING | Execute: `./scripts/monitor_orca_logs.sh /var/log/odoo/odoo.log` (in separate terminal) |
| Verify in Odoo UI | 🔴 PENDING | Login to http://localhost:8069 → check Modules list |
| Confirm ORCA logs appearing | 🔴 PENDING | Create test invoice → verify ORCA log entry created |
| Record evidence/screenshots | 🔴 PENDING | Capture screenshots of successful installation + test results |

---

## What You Must Do to Complete V19

### STEP 0: Setup Odoo to Find ORCA Modules (5 minutes)

**CRITICAL FIRST STEP:** The ORCA modules exist in the repository but Odoo doesn't know where to find them yet.

**Quick Setup (Recommended):**

**Windows Users:**
```powershell
cd C:\Users\yoeli\Documents\GetUpSoft_Workspace\scripts
.\setup_odoo_orca_modules.ps1 -Action copy
```

**Linux Users:**
```bash
cd ~/GetUpSoft_Workspace/scripts
chmod +x setup_odoo_orca_modules.sh
./setup_odoo_orca_modules.sh copy
```

**Expected output:**
```
✅ Found addons directory: C:\Odoo\addons
✅ Copying modules to: C:\Odoo\addons
✅ Copied: base_orca_integration
✅ Copied: account_extended
... (all 13 modules)
✅ Setup complete!
```

**What this does:**
- Automatically detects your Odoo installation
- Copies all 13 ORCA modules to Odoo's addons directory
- Prepares them to be discovered by Odoo

**Detailed instructions:** See `task-ledger/V19_ODOO_MODULE_SETUP_GUIDE.md`

If setup fails, see troubleshooting section there.

---

### Prerequisites

Before starting, ensure you have:

```bash
✅ Odoo 19.0 installed and running
✅ PostgreSQL 12+ installed
✅ psql command-line access to create databases
✅ At least 5GB free disk space
✅ odoo-bin executable in PATH
✅ This workspace cloned locally
```

Verify:
```bash
odoo-bin --version
# Expected: odoo-bin 19.0...

psql --version
# Expected: psql (PostgreSQL) 12.x

df -h
# Expected: >/5GB available
```

---

### Step-by-Step Lab Execution

#### STEP 1: Create Test Database (5 minutes)

**Option A: Using provided script**
```bash
./scripts/setup_v19_test_db.sql  # (if SQL file exists)
```

**Option B: Manual PostgreSQL commands**
```bash
# Create database
createdb -U postgres -E UTF8 -l C odoo19_lab

# Connect and create extensions
psql -U postgres odoo19_lab << 'EOF'
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "hstore";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
EOF

# Verify
psql -U postgres odoo19_lab -c "SELECT version();"
```

**Expected output:**
```
PostgreSQL 12.x on ...
(1 row)
```

---

#### STEP 2: Monitor Logs (Start in separate terminal)

**Before doing anything else, start log monitoring:**

```bash
# Terminal #1 - Keep running for entire test
./scripts/monitor_orca_logs.sh /var/log/odoo/odoo.log
```

**This terminal will show errors in real-time. Leave it running.**

---

#### STEP 3: Install All 13 ORCA Modules (45 minutes)

**Terminal #2 - Main installation terminal**

```bash
# Make scripts executable
chmod +x ./scripts/install_v19_orca_modules.sh

# Run installation
./scripts/install_v19_orca_modules.sh odoo19_lab /etc/odoo/odoo.conf
```

**Expected output:**
```
✅ base_orca_integration: INSTALLED
✅ account_extended: INSTALLED
✅ pos_extended: INSTALLED
✅ sale_extended: INSTALLED
✅ asset_extended: INSTALLED
✅ stock_extended: INSTALLED
✅ payment_extended: INSTALLED
✅ bank_extended: INSTALLED
✅ invoice_extended: INSTALLED
✅ l10n_do_accounting: INSTALLED
✅ l10n_do_accounting_report: INSTALLED
✅ l10n_do_pos: INSTALLED
✅ l10n_do_rnc_search: INSTALLED

✅ ALL MODULES INSTALLED SUCCESSFULLY
```

**Monitoring terminal (#1) should show:** NO errors containing "orca", "ERROR", or "CRITICAL"

---

#### STEP 4: Run 78 Unit Tests (20 minutes)

```bash
# Terminal #2 (same as installation)
chmod +x ./scripts/test_orca_logging.sh

./scripts/test_orca_logging.sh odoo19_lab /etc/odoo/odoo.conf
```

**Expected output:**
```
[TEST] Test 1: Verify ORCA modules installed
✅ PASS: All 13 modules installed

[TEST] Test 2: Verify ORCA log models in database
✅ PASS: All ORCA log models exist

[TEST] Test 3: Test account.move ORCA logging
✅ PASS: ORCA logging working for account.move

[TEST] Test 4: Test account.move write hook
✅ PASS: Write hook working

[TEST] Test 5: Verify field auto-detection
✅ PASS: Field auto-detection confirmed

[TEST] Test 6: Verify access control
✅ PASS: Access control rules bound

[TEST] Test 7: Verify ORCA tables in database
✅ PASS: All tables exist

============================================
All tests PASSED
============================================
```

**Test log location:** `test-results/v19_orca_logging_test_YYYYMMDD_HHMMSS.log`

---

#### STEP 5: Manual UI Verification (10 minutes)

**Verify in Odoo web interface:**

1. Open: `http://localhost:8069`
2. Login with admin credentials
3. Click "Modules" in left menu
4. Search for "orca" 

**You should see 13 modules all with status "Installed":**
```
✅ base_orca_integration - 19.0.1.0.0 - Installed
✅ account_extended - 19.0.1.0.0 - Installed
✅ pos_extended - 19.0.1.0.0 - Installed
✅ sale_extended - 19.0.1.0.0 - Installed
✅ asset_extended - 19.0.1.0.0 - Installed
✅ stock_extended - 19.0.1.0.0 - Installed
✅ payment_extended - 19.0.1.0.0 - Installed
✅ bank_extended - 19.0.1.0.0 - Installed
✅ invoice_extended - 19.0.1.0.0 - Installed
✅ l10n_do_accounting - 19.0.2.0.0 - Installed
✅ l10n_do_accounting_report - 19.0.2.0.0 - Installed
✅ l10n_do_pos - 19.0.2.0.0 - Installed
✅ l10n_do_rnc_search - 19.0.1.0.0 - Installed
```

---

#### STEP 6: Test ORCA Logging Manually (5 minutes)

**Create a test invoice and verify ORCA log appears:**

1. In Odoo UI, click "Accounting" → "Invoices"
2. Click "Create" to create new invoice
3. Fill in basic details:
   - Type: "Customer Invoice"
   - Customer: (select any)
   - Date: Today
   - Journal: (select default)
4. Click "Save"
5. Navigate to "Accounting" → "ORCA Logs" → "Account Move Logs"
6. **Expected:** You should see a log entry for the invoice you just created
   - Model: `account.move`
   - Record ID: (your invoice ID)
   - Action: `create`
   - User: `admin`
   - Before values: empty `{}`
   - After values: JSON with invoice fields

---

#### STEP 7: Capture Evidence (5 minutes)

**Screenshots to capture:**

1. **Modules list showing all 13 installed**
   - File: `evidence/01_modules_list_v19.png`
   
2. **Test execution output (terminal)**
   - File: `evidence/02_test_output_v19.txt` (copy from test-results log)
   
3. **ORCA log entry in Odoo UI**
   - File: `evidence/03_orca_log_created_v19.png`
   
4. **Log monitoring terminal showing no errors**
   - File: `evidence/04_monitor_no_errors_v19.png`

---

### Success Criteria Checklist

✅ means you can check this off when complete:

- [ ] Database `odoo19_lab` created with extensions
- [ ] Log monitoring terminal running without errors
- [ ] All 13 modules installed successfully (no errors)
- [ ] 78 unit tests all PASSED
- [ ] No "ERROR" or "CRITICAL" messages in monitoring terminal
- [ ] 13 modules visible in Odoo UI with "Installed" status
- [ ] Manual invoice creation → ORCA log appears (seconds later)
- [ ] Evidence screenshots captured

**When ALL boxes are checked, v19 ORCA integration is COMPLETE ✅**

---

## What Happens Next

Once you complete the above steps and confirm all success criteria:

1. **Report results** → I will verify evidence
2. **Proceed to v17/v16/v15 porting** → Same pattern applied to older versions
3. **Staging deployment** → Move to pre-production environment
4. **Production rollout** → Blue-green deployment with monitoring

---

## Troubleshooting

If any test fails, check:

1. **Check the monitoring terminal** (#1) for detailed error messages
2. **Check test log file:** `test-results/v19_orca_logging_test_*.log`
3. **Check Odoo logs:** `/var/log/odoo/odoo.log`
4. **Refer to:** `task-ledger/V19_LAB_TESTING_PROCEDURE.md` (troubleshooting section)

---

## Timeline

```
NOW              Lab testing (2-3 hours)       ← YOU ARE HERE
   ↓
AFTER TESTS      Porting to v17/v16/v15 (~19h)
   ↓
WEEK 1           Staging deployment (5 days)
   ↓
WEEK 2-3         Production rollout (2 weeks)
```

---

## Contact/Questions

When executing the lab tests:
- Check the monitoring terminal for real-time errors
- All test commands should complete without requiring input
- Each script takes the expected time (45 min install, 20 min tests)

