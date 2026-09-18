# V19 ORCA Test Database Setup Guide

**Date:** 2026-05-28  
**Purpose:** Step-by-step guide for creating and initializing test database for v19 ORCA module testing

---

## Prerequisites

- Odoo 19.0 installed and running
- PostgreSQL 12+ installed
- `odoo-bin` accessible from command line
- 2GB+ free disk space
- Read/write access to `/var/log/odoo/` (or configured log directory)

---

## Database Setup (5 minutes)

### Option 1: Using SQL Script

```bash
# Create test database
psql -U odoo -d postgres -f scripts/setup_v19_test_db.sql

# Verify database created
psql -U odoo -l | grep test_v19_orca
```

**Expected Output:**
```
 test_v19_orca | odoo | UTF8 | C | C | =Tc/odoo + ...
```

### Option 2: Manual PostgreSQL Steps

```bash
# Connect as postgres user
sudo su - postgres

# Create database
createdb -U odoo -T template0 -E UTF8 -l C test_v19_orca

# Create extensions
psql -U odoo -d test_v19_orca << 'EOF'
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "hstore";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
EOF

# Exit
exit
```

---

## Odoo Initialization (10 minutes)

### Initialize Base Modules

```bash
cd /path/to/odoo

python3 odoo-bin \
  -d test_v19_orca \
  -i base \
  --no-http \
  --stop-after-init \
  2>&1 | tee /tmp/odoo_init.log
```

**Expected Output (tail):**
```
... Loading Server-wide Modules
... init base
... successfully loaded
... (init) base
```

### Verify Installation

```bash
# Check database exists
psql -U odoo test_v19_orca -c "SELECT version();"

# Check tables created
psql -U odoo test_v19_orca -c "\dt" | head -20
```

---

## Install ORCA Base Module (5 minutes)

```bash
python3 odoo-bin \
  --addons-path=02_Odoo_ERP/Odoo_Consolidated_Library/v19/Modules \
  -d test_v19_orca \
  -i base_orca_integration \
  --no-http \
  --stop-after-init \
  2>&1 | tee /tmp/odoo_orca_init.log
```

**Expected Output:**
```
... Loading Server-wide Modules
... Loading custom modules
... init base_orca_integration
... (init) base_orca_integration
... successfully loaded
```

---

## Pre-Test Verification (5 minutes)

### Check ORCA Models Loaded

```bash
python3 odoo-bin \
  --addons-path=02_Odoo_ERP/Odoo_Consolidated_Library/v19/Modules \
  -d test_v19_orca \
  -i account_extended \
  --no-http \
  --stop-after-init
```

### Verify Base Tables

```bash
psql -U odoo test_v19_orca << 'EOF'
-- Check orca.log base model
\dt orca_log

-- Check account_extended log model
\dt account_move_orca_log

-- Expected: 2 rows returned
SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public' AND table_name LIKE '%orca%';
EOF
```

---

## Database Configuration (Optional)

### Increase Shared Buffers (for performance)

Edit `/etc/postgresql/*/main/postgresql.conf`:
```
shared_buffers = 256MB  # 25% of system RAM
work_mem = 64MB
```

Then reload:
```bash
sudo systemctl reload postgresql
```

### Create Backup (Recommended)

```bash
# Before running tests
pg_dump -U odoo test_v19_orca > test_v19_orca_backup_$(date +%Y%m%d).sql

# After tests (if failed)
dropdb -U odoo test_v19_orca
createdb -U odoo -T template0 -E UTF8 test_v19_orca
psql -U odoo test_v19_orca < test_v19_orca_backup_*.sql
```

---

## Test Execution (60+ minutes)

### Run Full Test Suite

```bash
# Using provided script (recommended)
chmod +x scripts/run_v19_orca_tests.sh
./scripts/run_v19_orca_tests.sh test_v19_orca /etc/odoo/odoo.conf

# Or manually
python3 odoo-bin \
  --addons-path=02_Odoo_ERP/Odoo_Consolidated_Library/v19/Modules \
  -d test_v19_orca \
  --test-enable \
  --test-tags "account_extended,pos_extended,sale_extended,asset_extended,stock_extended,payment_extended,bank_extended,invoice_extended" \
  --log-level=info \
  2>&1 | tee test-results/v19_orca_tests_$(date +%Y%m%d_%H%M%S).log
```

### Run Single Module Tests

```bash
# Test account_extended only
python3 odoo-bin \
  --addons-path=02_Odoo_ERP/Odoo_Consolidated_Library/v19/Modules \
  -d test_v19_orca \
  --test-enable \
  --test-tags account_extended \
  --log-level=info

# Test POS
python3 odoo-bin \
  --addons-path=02_Odoo_ERP/Odoo_Consolidated_Library/v19/Modules \
  -d test_v19_orca \
  --test-enable \
  --test-tags pos_extended \
  --log-level=info
```

---

## Troubleshooting

### Issue: Database already exists
```bash
dropdb -U odoo test_v19_orca
# Then re-create using setup script
```

### Issue: Permission denied on tables
```bash
psql -U odoo test_v19_orca -c "GRANT ALL ON ALL TABLES IN SCHEMA public TO odoo;"
```

### Issue: Tests hang or timeout
```bash
# Increase timeout (default 60s)
python3 odoo-bin ... --test-timeout=180

# Or run subset
--test-tags account_extended  # Single module only
```

### Issue: Module import error
```bash
# Verify module path
ls -la 02_Odoo_ERP/Odoo_Consolidated_Library/v19/Modules/account_extended/

# Check __init__.py files exist
find 02_Odoo_ERP/Odoo_Consolidated_Library/v19/Modules -name "__init__.py"
```

### Issue: base_orca_integration not found
```bash
# Ensure base_orca_integration is installed FIRST
python3 odoo-bin \
  --addons-path=02_Odoo_ERP/Odoo_Consolidated_Library/v19/Modules \
  -d test_v19_orca \
  -i base_orca_integration \
  --no-http \
  --stop-after-init
```

---

## Cleanup (Optional)

### Drop Test Database

```bash
dropdb -U odoo test_v19_orca
```

### Clean Test Logs

```bash
rm -f test-results/v19_orca_tests_*.log
rm -f test-results/v19_orca_report_*.txt
```

---

## Performance Baseline

Expected test execution times:
- account_extended: 3-5 minutes (14 tests)
- pos_extended: 2-3 minutes (12 tests)
- sale_extended: 2-3 minutes (12 tests)
- asset_extended: 1-2 minutes (8 tests)
- stock_extended: 1-2 minutes (8 tests)
- payment_extended: 1-2 minutes (8 tests)
- bank_extended: 1-2 minutes (8 tests)
- invoice_extended: 1-2 minutes (8 tests)

**Total: 12-21 minutes** for all 78 tests

---

## Results Analysis

After tests complete:

### Check for failures
```bash
grep "FAILED\|ERROR" test-results/v19_orca_tests_*.log
```

### Count passed tests
```bash
grep "ok\|PASS" test-results/v19_orca_tests_*.log | wc -l
```

### Generate summary
```bash
tail -20 test-results/v19_orca_report_*.txt
```

---

## Next Steps

After successful test execution (Task #23):
1. ✅ Task #24: Code review & security audit
2. ✅ Task #25: Staging deployment & production readiness

See **V19_ORCA_TEST_EXECUTION_PLAN.md** for detailed test procedures and expected outputs.
