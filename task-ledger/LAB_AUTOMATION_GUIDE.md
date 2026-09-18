# Automated Odoo v19 ORCA Lab Setup Guide

**Quick Start:** Run one command, wait 5 minutes, access Odoo at http://localhost:8069

---

## Prerequisites

### For Windows PowerShell
- Windows 10/11
- Docker Desktop installed and running
- PowerShell 5.0+ (included in Windows 10+)
- Administrator access (for Docker operations)

### For Linux/macOS Bash
- Docker and Docker Compose installed
- Bash shell
- Git (recommended)

### Common Requirements
- 4GB+ RAM available
- 5GB+ free disk space
- Port 8069 and 5432 available (not in use)

---

## Installation Method 1: Windows PowerShell

### Step 1: Open PowerShell

**Option A - PowerShell as Administrator:**
```powershell
# Right-click PowerShell icon → "Run as administrator"
```

**Option B - From Command Prompt:**
```cmd
powershell
```

### Step 2: Navigate to Workspace

```powershell
cd C:\Users\yoeli\Documents\GetUpSoft_Workspace
```

### Step 3: Run the Automated Setup

```powershell
# Basic setup (includes tests)
.\scripts\automated_lab_setup.ps1

# Skip prerequisite checks (if you know tools are installed)
.\scripts\automated_lab_setup.ps1 -SkipPrerequisites

# Skip tests (faster startup)
.\scripts\automated_lab_setup.ps1 -SkipTests

# Combine options
.\scripts\automated_lab_setup.ps1 -SkipPrerequisites -SkipTests
```

### Step 4: Wait for Completion

Expected timeline:
- **Docker pull/build:** 2-3 minutes (first time only)
- **PostgreSQL startup:** 30-60 seconds
- **Odoo startup:** 1-2 minutes
- **Module installation:** 1-2 minutes
- **Tests:** 30-60 seconds

**Total: 5-8 minutes on first run, 2-3 minutes on subsequent runs**

### Step 5: Access the Lab

Open browser:
```
http://localhost:8069
```

**Credentials:**
- Username: `admin`
- Password: `admin`

---

## Installation Method 2: Linux/macOS Bash

### Step 1: Open Terminal

```bash
cd /path/to/GetUpSoft_Workspace
```

### Step 2: Make Script Executable

```bash
chmod +x scripts/automated_lab_setup.sh
```

### Step 3: Run the Automated Setup

```bash
# Basic setup (includes tests)
./scripts/automated_lab_setup.sh

# Skip prerequisite checks
./scripts/automated_lab_setup.sh --skip-prerequisites

# Skip tests
./scripts/automated_lab_setup.sh --skip-tests

# Combine options
./scripts/automated_lab_setup.sh --skip-prerequisites --skip-tests
```

### Step 4-5: Same as PowerShell (wait & access)

---

## What Gets Installed

### Database: PostgreSQL 15
- User: `odoo`
- Password: `odoo`
- Database: `odoo19_orca`
- Port: `5432` (local only)

### Application: Odoo 19.0
- URL: `http://localhost:8069`
- Admin user: `admin` / `admin`
- Port: `8069` (accessible from browser)

### Modules: 13 Custom ORCA Modules
1. **base_orca_integration** — ORCA foundation
2. **account_extended** — Financial audit
3. **pos_extended** — POS audit
4. **sale_extended** — Sales audit
5. **asset_extended** — Asset audit
6. **stock_extended** — Inventory audit
7. **payment_extended** — Payment audit
8. **bank_extended** — Bank audit
9. **invoice_extended** — Invoice audit
10. **l10n_do_accounting** — Dominican accounting
11. **l10n_do_accounting_report** — DGII reporting
12. **l10n_do_pos** — POS fiscal controls
13. **l10n_do_rnc_search** — RNC validation

---

## Verification Steps

After the script completes, verify installation:

### Step 1: Access Web Interface
1. Open http://localhost:8069
2. Login with admin/admin
3. Should see Odoo dashboard

### Step 2: Check ORCA Logs in Odoo

**Method A - Via UI:**
1. Navigate to **Accounting** → **ORCA Logs**
2. You should see a list view with recent log entries
3. Click on any entry to see before/after values

**Method B - Via Database:**
```bash
# Connect to PostgreSQL container
docker exec -it odoo19_postgres psql -U odoo -d odoo19_orca

# Query ORCA logs
SELECT * FROM base_orca_integration_orca_log LIMIT 5;
```

### Step 3: Verify Docker Services

```powershell
# Windows PowerShell
docker-compose ps

# Output should show:
# NAME              STATUS
# odoo19_postgres   Up (healthy)
# odoo19_orca       Up (healthy)
```

```bash
# Linux/macOS
docker-compose ps
```

### Step 4: Check Container Logs

```powershell
# View Odoo logs
docker-compose logs -f odoo

# View PostgreSQL logs
docker-compose logs -f postgres

# View last 50 lines
docker-compose logs --tail=50
```

---

## Useful Commands After Setup

### View Real-Time Logs
```bash
docker-compose logs -f odoo
```

### Access Odoo Shell
```bash
docker-compose exec odoo bash
```

### Restart Services
```bash
# Restart everything
docker-compose restart

# Restart only Odoo
docker-compose restart odoo

# Restart only PostgreSQL
docker-compose restart postgres
```

### Stop Lab
```bash
docker-compose stop
```

### Restart Lab (after stopping)
```bash
docker-compose up -d
```

### Complete Cleanup (removes everything)
```bash
docker-compose down -v
# WARNING: This deletes the database! Only use if you want a fresh start.
```

---

## Troubleshooting

### Docker Daemon Not Running
**Error:** `Error response from daemon: dial unix docker.sock: connect: connection refused`

**Solution (Windows):**
- Open Docker Desktop application
- Wait for it to fully start (2-3 minutes)
- Re-run the setup script

**Solution (macOS/Linux):**
```bash
# Check if Docker is running
docker ps

# If not running, start it
# macOS: Open Applications/Docker.app
# Linux: sudo systemctl start docker
```

### Port 8069 Already In Use
**Error:** `Error response from daemon: Ports are not available`

**Solution:**
```bash
# Find process using port 8069
# Windows PowerShell
Get-Process | Where-Object { $_.Handles -like '*8069*' }

# Linux/macOS
lsof -i :8069

# Kill the process or change docker-compose port mapping
# Edit docker-compose.yml line 38: change "8069:8069" to "8070:8069"
```

### PostgreSQL Takes Too Long to Start
**Error:** `PostgreSQL failed to start`

**Solution:**
```bash
# Check PostgreSQL logs
docker-compose logs postgres

# Restart PostgreSQL container
docker-compose restart postgres

# Wait 30 seconds, then try again
docker-compose up -d
```

### Odoo Shows 502 Bad Gateway
**Error:** Browser shows 502 or connection refused

**Solution:**
```bash
# Wait longer (Odoo takes 1-2 minutes to fully start)
# Check container is still running
docker-compose ps

# Check logs for errors
docker-compose logs odoo

# If still failing, restart Odoo
docker-compose restart odoo
```

### PowerShell Execution Policy Error
**Error:** `cannot be loaded because running scripts is disabled on this system`

**Solution:**
```powershell
# Check current policy
Get-ExecutionPolicy

# If "Restricted", allow scripts temporarily
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Or run script bypassing policy
powershell -ExecutionPolicy Bypass -File .\scripts\automated_lab_setup.ps1
```

---

## Next Steps After Lab Validation

Once the lab is running and modules are verified installed:

1. **Validate Lab** (manual check):
   - Open http://localhost:8069
   - Confirm admin login works
   - Check ORCA Logs appear in menu
   - Verify at least one log entry exists

2. **Begin Phase 1 Execution:**
   - Open `task-ledger/PHASE1_QUICK_START_CHECKLIST.md`
   - Follow step-by-step instructions
   - Use code templates from `task-ledger/PHASE1_CODE_TEMPLATES.md`

3. **Track Progress:**
   - Update `CHANGE_TIMELINE.md` with session progress
   - Complete `PHASE_COMPLETION_TEMPLATE.md` after each module
   - Reference backlog items (OO-XXX format)

---

## Performance Expectations

### First Run (~5-8 minutes)
- Docker images downloaded and built
- Database initialized
- Modules installed
- Tests executed

### Subsequent Runs (~2-3 minutes)
- Containers restart from images
- Database already exists
- Modules already installed

### System Impact
- **RAM:** Uses 1-2GB (in container)
- **Disk:** ~3GB for images + ~500MB for data
- **CPU:** Brief spike during initialization, idle afterwards

---

## Docker Compose Configuration

The setup uses `docker-compose.yml` with:

**Services:**
- `postgres` - PostgreSQL 15, container name `odoo19_postgres`
- `odoo` - Odoo 19.0, container name `odoo19_orca`

**Volumes:**
- `postgres_data` - Database files
- `odoo_data` - Odoo instance files
- `./02_Odoo_ERP/.../v19/Modules` - Module source mount

**Network:**
- `odoo19_network` - Bridge network for service communication

**Environment:**
- Database: `odoo19_orca` (POSTGRES_DB)
- User: `odoo` (POSTGRES_USER)
- Password: `odoo` (POSTGRES_PASSWORD)

---

## Manual Testing (After Lab Validation)

### Test 1: Create a Record and Verify ORCA Log

1. Open http://localhost:8069 (login: admin/admin)
2. Create a new invoice: Accounting → Invoices → Create
3. Fill in required fields (Partner, Lines, etc.)
4. Click **Save**
5. Go back to Accounting → ORCA Logs
6. Find your new log entry (most recent, action = "create")
7. Click to open form view
8. Verify `after_values` JSON contains invoice data

### Test 2: Modify a Record and Check Before/After Values

1. Go back to the invoice you created
2. Edit a field (e.g., change description or amount)
3. Click **Save**
4. Go to ORCA Logs
5. Find new log entry (action = "write")
6. Verify `before_values` shows old data and `after_values` shows new data

### Test 3: Test Access Control

1. Go to Settings → Users & Companies → Users
2. Create a test user with **Accountant** role (read-only)
3. Login as this user
4. Navigate to ORCA Logs
5. Verify you can READ logs but cannot EDIT/CREATE
6. Create admin user with **Manager** role
7. Verify Manager can READ/WRITE/CREATE logs

---

## FAQ

**Q: How do I backup my lab data?**
```bash
docker-compose exec postgres pg_dump -U odoo odoo19_orca > backup.sql
```

**Q: How do I restore from backup?**
```bash
docker-compose down -v  # Remove old data
docker-compose up -d    # Start fresh
docker-compose exec postgres psql -U odoo odoo19_orca < backup.sql
```

**Q: Can I run this on the production machine?**
No. This lab is for testing only. Use isolated test machines.

**Q: What if I want to test different Odoo modules?**
Edit `docker-compose.yml` line 51 to change the `--init` parameter.

**Q: How do I access the database directly?**
```bash
docker-compose exec postgres psql -U odoo -d odoo19_orca
```

**Q: How long does module installation take?**
Usually 1-2 minutes. Large modules may take longer. Check logs: `docker-compose logs odoo`

**Q: Can I run multiple labs simultaneously?**
Yes, but change ports in `docker-compose.yml`:
- Line 38: `"8070:8069"` (different port for each lab)
- Line 12: `"5433:5432"` (different DB port)

---

## Clean Exit

When done with the lab:

```bash
# Option 1: Stop but keep data
docker-compose stop

# Option 2: Remove containers, keep data
docker-compose down

# Option 3: Complete cleanup (remove everything)
docker-compose down -v
# ⚠️ WARNING: This deletes the database permanently!
```

---

**Status:** ✅ Automated lab ready for deployment  
**Version:** 1.0  
**Last Updated:** 2026-05-28
