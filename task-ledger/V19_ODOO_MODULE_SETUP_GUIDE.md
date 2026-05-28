# V19 ORCA Modules Setup Guide

**Date:** 2026-05-28  
**Purpose:** Install v19 ORCA modules to your local Odoo instance  
**Estimated Time:** 10 minutes  
**Status:** REQUIRED before lab testing

---

## Problem: "No hay ningún módulo en Odoo local"

The ORCA modules exist in the repository but Odoo doesn't know where to find them.

**Solution:** Three options to make modules accessible to Odoo:

1. **Copy modules** (easiest, recommended for production)
2. **Create symlinks** (best for development, auto-updates)
3. **Update odoo.conf** (advanced, requires restart)

---

## Quick Start (Windows Users)

```powershell
# Navigate to scripts directory
cd C:\Users\yoeli\Documents\GetUpSoft_Workspace\scripts

# Run setup script
.\setup_odoo_orca_modules.ps1 -Action copy

# Expected output:
# ✅ Found addons directory: C:\Odoo\addons
# ✅ Copied: base_orca_integration
# ✅ Copied: account_extended
# ... (13 modules total)
# ✅ Setup complete!
```

---

## Quick Start (Linux Users)

```bash
# Navigate to scripts directory
cd ~/GetUpSoft_Workspace/scripts

# Run setup script
chmod +x setup_odoo_orca_modules.sh
./setup_odoo_orca_modules.sh copy

# Expected output:
# ✅ odoo-bin found: /usr/bin/odoo-bin
# ✅ Addons path from config: /opt/odoo/addons
# ✅ All modules copied successfully
```

---

## Detailed Options

### Option 1: Copy Modules (Easiest)

**What it does:** Copies all 13 ORCA modules from the repository to your Odoo addons directory

**Best for:** Production environments, final deployment

**Command (Windows):**
```powershell
.\setup_odoo_orca_modules.ps1 -Action copy
```

**Command (Linux):**
```bash
./setup_odoo_orca_modules.sh copy
```

**Time:** 2-3 minutes

**Pros:**
- ✅ Modules are independent (no dependency on repo)
- ✅ Safest for production
- ✅ Works even if repo is moved

**Cons:**
- ❌ Updates in repo don't auto-sync
- ❌ Need to recopy if changes made

---

### Option 2: Create Symlinks (Recommended for Development)

**What it does:** Creates shortcuts (symlinks) pointing from Odoo addons to repo modules

**Best for:** Development, testing, frequent changes

**Command (Windows - requires Admin):**
```powershell
# Run PowerShell as Administrator first
.\setup_odoo_orca_modules.ps1 -Action symlink
```

**Command (Linux):**
```bash
./setup_odoo_orca_modules.sh symlink
```

**Time:** 1 minute

**Pros:**
- ✅ Auto-updates when repo changes
- ✅ Single source of truth
- ✅ Fastest setup

**Cons:**
- ❌ Requires repo to always be available
- ❌ Can't move Odoo without updating symlinks

---

### Option 3: Update odoo.conf (Manual Control)

**What it does:** Adds the repository path to Odoo's `addons_path` configuration

**Best for:** Users who want full control

**Command (Windows):**
```powershell
.\setup_odoo_orca_modules.ps1 -Action config
```

**Command (Linux):**
```bash
./setup_odoo_orca_modules.sh config
```

**Manual (if scripts don't work):**
```bash
# Edit your odoo.conf
sudo nano /etc/odoo/odoo.conf

# Find the line starting with: addons_path
# Change from:
addons_path = /opt/odoo/addons

# To:
addons_path = C:\Users\yoeli\Documents\GetUpSoft_Workspace\02_Odoo_ERP\Odoo_Consolidated_Library\v19\Modules,/opt/odoo/addons

# Save and restart Odoo
sudo systemctl restart odoo
```

**Time:** 2-3 minutes

**Pros:**
- ✅ All paths searchable without copying
- ✅ Flexible
- ✅ No admin required

**Cons:**
- ❌ Config file modified
- ❌ Must restart Odoo
- ❌ Requires careful path management

---

## Step-by-Step: Copy Modules Method (Easiest)

### Step 1: Detect Odoo Installation

The script automatically finds your Odoo addons directory. First, verify Odoo is running:

**Windows:**
```powershell
where odoo-bin
# Should output: C:\Odoo\bin\odoo-bin or similar
```

**Linux:**
```bash
which odoo-bin
# Should output: /usr/bin/odoo-bin
```

If you get "not found", Odoo is not in PATH. See "Troubleshooting" below.

### Step 2: Run Copy Script

**Windows:**
```powershell
cd C:\Users\yoeli\Documents\GetUpSoft_Workspace\scripts
.\setup_odoo_orca_modules.ps1 -Action copy
```

**Linux:**
```bash
cd ~/GetUpSoft_Workspace/scripts
./setup_odoo_orca_modules.sh copy
```

### Step 3: Verify Modules Copied

Check that all 13 modules are in your Odoo addons directory:

**Windows:**
```powershell
ls C:\Odoo\addons | findstr orca
# Should list: base_orca_integration, account_extended, pos_extended, etc.
```

**Linux:**
```bash
ls /opt/odoo/addons | grep orca
# Should list: base_orca_integration, account_extended, pos_extended, etc.
```

### Step 4: Restart Odoo

**Windows:**
```powershell
# Stop Odoo
Get-Process odoo | Stop-Process -Force

# Wait 5 seconds
Start-Sleep -Seconds 5

# Restart Odoo
Start-Process odoo-bin
```

**Linux:**
```bash
sudo systemctl restart odoo
# Wait for service to restart
sleep 10
systemctl status odoo
```

### Step 5: Refresh Odoo Module Cache

```bash
# Tell Odoo to load new modules
odoo-bin -d <your_database> -u base --stop-after-init

# Example:
odoo-bin -d odoo19_lab -u base --stop-after-init
```

**Expected output:**
```
[2026-05-28 10:30:45] INFO: base_orca_integration: Module loaded successfully
[2026-05-28 10:30:46] INFO: account_extended: Module loaded successfully
...
[2026-05-28 10:30:52] SUCCESS: All modules initialized
```

### Step 6: Verify in Odoo UI

1. Open http://localhost:8069 (or your Odoo URL)
2. Login with admin credentials
3. Click "Modules" (left menu)
4. Search for "orca"

**You should see all 13 modules:**
```
✅ base_orca_integration (19.0.1.0.0) - Installed/Uninstalled
✅ account_extended (19.0.1.0.0) - Installed/Uninstalled
✅ asset_extended (19.0.1.0.0) - Installed/Uninstalled
✅ bank_extended (19.0.1.0.0) - Installed/Uninstalled
✅ invoice_extended (19.0.1.0.0) - Installed/Uninstalled
✅ l10n_do_accounting (19.0.2.0.0) - Installed/Uninstalled
✅ l10n_do_accounting_report (19.0.2.0.0) - Installed/Uninstalled
✅ l10n_do_pos (19.0.2.0.0) - Installed/Uninstalled
✅ l10n_do_rnc_search (19.0.1.0.0) - Installed/Uninstalled
✅ payment_extended (19.0.1.0.0) - Installed/Uninstalled
✅ pos_extended (19.0.1.0.0) - Installed/Uninstalled
✅ sale_extended (19.0.1.0.0) - Installed/Uninstalled
✅ stock_extended (19.0.1.0.0) - Installed/Uninstalled
```

If you see them, **SETUP IS COMPLETE** ✅

---

## Troubleshooting

### "odoo-bin not found in PATH"

**Solution 1: Add Odoo to PATH**

**Windows:**
```powershell
# Find where Odoo is installed
Get-ChildItem "C:\" -Recurse -Filter "odoo-bin*" | Select-Object FullName

# Add to PATH (System Properties → Environment Variables)
# Or temporarily:
$env:PATH += ";C:\Odoo\bin"
where odoo-bin
```

**Linux:**
```bash
# Find Odoo
sudo find / -name "odoo-bin" 2>/dev/null

# Add to PATH
export PATH="/opt/odoo/bin:$PATH"
which odoo-bin
```

**Solution 2: Specify path in script**

If you can't add to PATH, manually provide the path to the script or run the copy command directly:

```powershell
# Windows - copy modules manually
Copy-Item "C:\Users\yoeli\Documents\GetUpSoft_Workspace\02_Odoo_ERP\Odoo_Consolidated_Library\v19\Modules\*" `
  -Destination "C:\Odoo\addons" -Recurse
```

---

### "Modules not showing up in Odoo UI"

**Step 1:** Verify files were copied
```bash
ls -la /opt/odoo/addons | grep orca
# Should show directories for all 13 modules
```

**Step 2:** Check Odoo logs for errors
```bash
tail -f /var/log/odoo/odoo.log | grep -i orca
# Look for import errors or permission issues
```

**Step 3:** Restart Odoo completely

**Windows:**
```powershell
Get-Process | Where-Object {$_.Name -like "*odoo*"} | Stop-Process -Force
Start-Sleep -Seconds 10
Start-Process odoo-bin
```

**Linux:**
```bash
sudo systemctl stop odoo
sudo systemctl start odoo
sleep 10
tail -n 20 /var/log/odoo/odoo.log
```

**Step 4:** Clear Odoo cache
```bash
# Stop Odoo
# Delete cache directory (varies by install)
rm -rf /opt/odoo/cache/*
rm -rf ~/.local/share/Odoo/*

# Restart Odoo
sudo systemctl restart odoo
```

---

### "Permission denied" errors

**Windows:**
- Run PowerShell as Administrator
- Check file permissions on destination folder

**Linux:**
```bash
# Check ownership
ls -ld /opt/odoo/addons
# Should be: odoo:odoo (or similar user)

# Fix permissions
sudo chown -R odoo:odoo /opt/odoo/addons
sudo chmod -R 755 /opt/odoo/addons
```

---

### "Module installed but ORCA logs not working"

This means modules are found but ORCA logging isn't active. Check:

```bash
# Verify base_orca_integration is installed
odoo-bin -d <database> --shell << 'EOF'
mod = env['ir.module.module'].search([('name','=','base_orca_integration')])
print(f"Status: {mod.state}")
EOF
```

**Expected output:** `Status: installed`

If not installed, install it:
```bash
odoo-bin -d <database> -i base_orca_integration --stop-after-init
```

---

## What Happens Next

Once modules are visible in Odoo UI:

1. ✅ Modules are installed in Odoo
2. ⏳ Run lab testing scripts: `scripts/test_orca_logging.sh`
3. ⏳ Verify ORCA logging works
4. ⏳ See ORCA logs in Odoo UI when records change

---

## Files Reference

| Script | Platform | Purpose |
|--------|----------|---------|
| `setup_odoo_orca_modules.sh` | Linux/Mac | Auto-setup modules (copy/symlink) |
| `setup_odoo_orca_modules.ps1` | Windows | Auto-setup modules (copy/symlink) |
| `install_v19_orca_modules.sh` | Linux | Install modules into Odoo database |
| `test_orca_logging.sh` | Linux | Run 78 unit tests |
| `monitor_orca_logs.sh` | Linux | Monitor real-time errors |

---

## Support

If setup fails, provide:
1. Output of the setup script
2. Odoo log tail: `tail -n 50 /var/log/odoo/odoo.log`
3. Your Odoo installation path
4. Your operating system and Odoo version

