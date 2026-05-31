# Phase 2: Deployment Startup Guide

**Status:** Ready to Execute  
**Date:** 2026-05-22  
**Phase 1 Status:** ✅ COMPLETE  
**Phase 2 Status:** 🚀 READY TO START

---

## Overview

This guide will walk you through Phase 2 deployment of the Obsidian stack integration. All infrastructure is documented and ready—this phase focuses on activation and testing.

**Estimated Duration:** 45-60 minutes  
**Prerequisites Checklist:**
- [ ] Docker & Docker Compose installed (`docker --version`, `docker-compose --version`)
- [ ] Node.js 18+ installed (`node --version`)
- [ ] Obsidian app downloaded (https://obsidian.md)
- [ ] Repository cloned locally (`git clone` or already in workspace)
- [ ] Phase 1 documentation reviewed (optional but recommended)

---

## Prerequisites Validation

### 1. Verify Docker Installation

```powershell
# Check Docker version
docker --version
# Expected: Docker version 20.10.0 or higher

# Check Docker Compose version
docker-compose --version
# Expected: Docker Compose version 1.29.0 or higher

# Verify Docker daemon is running
docker ps
# Should list running containers (may be empty)
```

**If Docker is not installed:**
- Windows: Download Docker Desktop from https://www.docker.com/products/docker-desktop
- Install and restart Windows
- Run validation commands above

### 2. Verify Node.js Installation

```powershell
# Check Node.js version
node --version
# Expected: v18.0.0 or higher

# Check npm version
npm --version
# Expected: 8.0.0 or higher
```

**If Node.js is not installed:**
- Download from https://nodejs.org/ (LTS version recommended)
- Install and restart PowerShell
- Run validation commands above

### 3. Verify Git Status

```powershell
# Navigate to workspace
cd C:\Users\yoeli\Documents\GetUpSoft_Workspace

# Check git status
git status

# Expected output: "On branch main" and "nothing to commit, working tree clean"
# OR with submodule note: "modified: 03_AI_Automation/scrapling (untracked content)"
```

### 4. Verify Phase 1 Files

```powershell
# List Phase 1 deliverables
Get-ChildItem -Path docs -Filter "obsidian*"
Get-ChildItem -Path obsidian -Recurse | Select-Object -First 20
Get-ChildItem -Path scripts -Filter "*notes*"
Get-ChildItem -Path docker -Recurse

# Expected: All Phase 1 directories and files present
```

**If Phase 1 files are missing:**
Restore from git history:
```powershell
git checkout HEAD -- docs/obsidian-stack.md
git checkout HEAD -- docs/sync-architecture.md
git checkout HEAD -- docs/publish-pipeline.md
git checkout HEAD -- docs/rollback.md
git checkout HEAD -- obsidian/
git checkout HEAD -- docker/couchdb/
git checkout HEAD -- scripts/check-private-notes.js
git checkout HEAD -- scripts/sync-vault-to-quartz.js
git checkout HEAD -- scripts/backup-vault.sh
```

---

## Phase 2 Execution: Step-by-Step

### Step 1: Create Environment Configuration (5 minutes)

**1.1 Copy the template file:**

```powershell
cd C:\Users\yoeli\Documents\GetUpSoft_Workspace

# Copy template to actual env file
Copy-Item .env.obsidian.example .env.obsidian -Force
```

**1.2 Generate secure passwords:**

PowerShell password generator (recommended):
```powershell
# Generate two strong passwords
function New-SecurePassword {
    [System.Web.Security.Membership]::GeneratePassword(16, 3)
}

$userPass = New-SecurePassword
$adminPass = New-SecurePassword

Write-Host "User Password: $userPass"
Write-Host "Admin Password: $adminPass"
# Copy these passwords somewhere safe (password manager preferred)
```

Alternative: Use an online generator or create manually (min 16 characters, mixed case + numbers + symbols)

**1.3 Edit .env.obsidian:**

```powershell
# Open with notepad
notepad .env.obsidian

# OR with VS Code
code .env.obsidian
```

**Replace these values:**
```
COUCHDB_USER=obsidian_user
COUCHDB_PASSWORD=<your-generated-password-16-chars-min>
COUCHDB_ADMIN_PASSWORD=<your-different-password-16-chars-min>
COUCHDB_HOST=localhost
COUCHDB_PORT=5984
```

**⚠️ IMPORTANT:** 
- Keep .env.obsidian SECRET — never commit it
- Use different passwords for user and admin
- Minimum 16 characters with mixed case, numbers, symbols
- Store passwords in password manager (Bitwarden, 1Password, LastPass, etc.)

---

### Step 2: Start CouchDB (5 minutes)

**2.1 Start the container:**

```powershell
cd C:\Users\yoeli\Documents\GetUpSoft_Workspace

# Start CouchDB in background
docker-compose -f docker-compose.obsidian-sync.yml up -d

# Expected output:
# Creating network "obsidian-sync_default" with the default driver
# Pulling couchdb (couchdb:3.3)...
# Creating obsidian-couchdb ... done
```

**2.2 Verify CouchDB is running:**

```powershell
# Check container status
docker ps | Select-String "couchdb"

# Expected: Container listed as "Up X seconds"
```

**2.3 Test CouchDB health endpoint:**

```powershell
# Test connection (no auth required for health check)
curl http://localhost:5984/_up

# Expected response:
# {"status":"ok"}
```

**If health check fails:**
```powershell
# Check logs
docker-compose -f docker-compose.obsidian-sync.yml logs couchdb | tail -20

# Restart container
docker-compose -f docker-compose.obsidian-sync.yml restart

# Wait 5 seconds and retry health check
Start-Sleep -Seconds 5
curl http://localhost:5984/_up
```

**2.4 Verify database initialization:**

```powershell
# Query the admin endpoint (using credentials from .env.obsidian)
# Format: http://admin:password@localhost:5984/

$adminPassword = (Get-Content .env.obsidian | Select-String "COUCHDB_ADMIN_PASSWORD" | Select-Object -First 1) -replace '.*=', ''
$uri = "http://admin:${adminPassword}@localhost:5984/"

# Verify connection
curl $uri

# Expected response includes: {"couchdb":"Welcome","version":"3.3.0"...}
```

**2.5 Access CouchDB UI (optional):**

```powershell
# Open Fauxton admin interface
Start-Process "http://localhost:5984/_utils/"

# Login with admin credentials from .env.obsidian
# admin / <your-admin-password>
```

---

### Step 3: Download and Configure Obsidian (10 minutes)

**3.1 Install Obsidian app:**

```powershell
# Download from https://obsidian.md/download
# Or use winget if you prefer:
winget install -e --id Obsidian.Obsidian

# Open Obsidian app after installation
Start-Process "obsidian://"
```

**3.2 Open the vault:**

In Obsidian app:
1. Click "Create new vault" OR "Open folder as vault"
2. Navigate to: `C:\Users\yoeli\Documents\GetUpSoft_Workspace\obsidian\vault`
3. Click "Open"
4. Obsidian will initialize the vault

**3.3 Enable community plugins:**

In Obsidian:
1. Go to Settings (icon: ⚙️)
2. Left sidebar → Community plugins
3. Toggle ON: "Turn on community plugins"
4. Confirm the warning about community plugins

**3.4 Install LiveSync plugin:**

In Obsidian:
1. Settings → Community plugins → "Browse"
2. Search: "Obsidian Live Sync"
3. Click first result (by vrtmrz)
4. Click "Install"
5. Click "Enable" (or toggle the switch)

---

### Step 4: Configure LiveSync Plugin (10 minutes)

**4.1 Access LiveSync settings:**

In Obsidian:
1. Settings (⚙️) → Community plugins
2. Find "Obsidian Live Sync" (installed plugins section)
3. Click the gear icon ⚙️ next to it
4. OR go to Settings → Live Sync

**4.2 Configure CouchDB connection:**

In LiveSync settings, fill:

| Field | Value |
|-------|-------|
| **CouchDB URI** | `http://obsidian_user:password@localhost:5984` |
| **Database Name** | `obsidian_vault` |
| **Passphrase (optional)** | Same passphrase on all devices |
| **Chunk Size** | 100 (default) |
| **Compression** | Enabled (recommended) |

**Example (replace password):**
```
CouchDB URI: http://obsidian_user:MyGeneratedPassword123!@localhost:5984
Database Name: obsidian_vault
```

**4.3 Enable encryption (recommended):**

In LiveSync settings:
1. Find "Encryption" section
2. Enable "Encrypt notes"
3. Set a strong passphrase (remember this for mobile devices!)
4. Confirm passphrase

**⚠️ Important:**
- Use the SAME passphrase on all devices (desktop, mobile, tablet)
- Use a different passphrase from your CouchDB password
- Store securely in password manager

**4.4 Test connection:**

In LiveSync settings:
1. Click "Test connection" button
2. Should show: "✓ Connected to CouchDB"

**If connection fails:**
- Verify Docker container is running: `docker ps | Select-String couchdb`
- Verify .env.obsidian credentials are correct
- Check CouchDB logs: `docker-compose -f docker-compose.obsidian-sync.yml logs couchdb`
- Verify firewall isn't blocking port 5984

**4.5 Start sync:**

In LiveSync settings:
1. Click "Start sync" button
2. Button should change to "Stop sync" (indicating it's running)
3. Obsidian status bar should show sync indicator

---

### Step 5: Test Sync (10 minutes)

**5.1 Create a test note:**

In Obsidian:
1. Create a new file: `public/test-sync.md`
2. Add content:
   ```markdown
   ---
   title: "Sync Test Note"
   publish: true
   ---

   # Sync Test

   This is a test note to verify LiveSync is working correctly.

   If this note appears in CouchDB, sync is active.
   ```
3. Save the file (Ctrl+S)

**5.2 Verify in CouchDB:**

```powershell
$adminPassword = (Get-Content .env.obsidian | Select-String "COUCHDB_ADMIN_PASSWORD" | Select-Object -First 1) -replace '.*=', ''
$uri = "http://admin:${adminPassword}@localhost:5984/obsidian_vault/_all_docs"

# Query all documents
$docs = curl $uri | ConvertFrom-Json
$docs.rows | Format-Table -Property id

# Should see: "notes/test-sync.md" or similar
```

**5.3 Check in Fauxton UI (visual confirmation):**

1. Open http://localhost:5984/_utils/
2. Left sidebar → Databases → obsidian_vault
3. Should see documents listed
4. Click on "test-sync.md" to view content

**5.4 Clean up test file:**

In Obsidian:
1. Delete `public/test-sync.md`
2. Confirm deletion
3. Verify it's removed from CouchDB after 1-2 seconds

---

### Step 6: Create First Real Notes (15 minutes)

**6.1 Create directory structure:**

In Obsidian, create folders in the vault:

```
obsidian/vault/public/
├── Architecture/
│   ├── README.md
│   └── System-Design.md
├── Guides/
│   ├── README.md
│   └── Getting-Started.md
├── FAQ.md
└── README.md
```

**6.2 Create first note (README.md):**

File: `obsidian/vault/public/README.md`
```markdown
---
title: "GetUpSoft Knowledge Base"
description: "Public documentation for GetUpSoft projects"
date: 2026-05-22
tags:
  - documentation
  - public
publish: true
---

# GetUpSoft Knowledge Base

Welcome to the public knowledge base for GetUpSoft projects.

This vault contains:
- Architecture documentation
- Implementation guides
- Best practices
- FAQ

All content is automatically synced and published.
```

**6.3 Create additional notes:**

Feel free to add a few more notes in the Architecture/ and Guides/ folders. LiveSync will sync them to CouchDB automatically.

**Tip:** Use the OBSIDIAN_SETUP_CHECKLIST.md as reference for what to include.

---

### Step 7: Validate Content (5 minutes)

**7.1 Set up npm scripts (if needed):**

If you want to use npm commands (npm run notes:check, notes:sync, etc.), create a package.json at the root:

```powershell
# Navigate to workspace
cd C:\Users\yoeli\Documents\GetUpSoft_Workspace

# Create minimal package.json with notes scripts
$packageJson = @{
    name = "getupsoft-workspace"
    version = "1.0.0"
    description = "GetUpSoft workspace with Obsidian integration"
    scripts = @{
        "notes:check" = "node scripts/check-private-notes.js"
        "notes:sync" = "node scripts/sync-vault-to-quartz.js"
        "notes:backup" = "./scripts/backup-vault.sh"
    }
}

$packageJson | ConvertTo-Json | Set-Content package.json

# Verify
Get-Content package.json
```

**7.2 Run validation script:**

```powershell
# Check for private content
node scripts/check-private-notes.js

# Expected output:
# [✓] ALL CLEAR - SAFE TO PUBLISH
#     No private content detected in public vault
#     Ready to run: npm run notes:build
```

**If validation fails:**
- Review flagged files
- Move sensitive content to `obsidian/vault/private/`
- Re-run validation

---

### Step 8: Backup Strategy (5 minutes)

**8.1 Create first backup:**

```powershell
cd C:\Users\yoeli\Documents\GetUpSoft_Workspace

# Run backup script
./scripts/backup-vault.sh

# Or if you created the npm script:
npm run notes:backup

# Expected: Creates obsidian/backups/vault-YYYYMMDD_HHMMSS.tar.gz
```

**8.2 Set up automatic git backup (recommended):**

```powershell
# Create a backup commit
git add obsidian/vault/public/
git commit -m "docs: initial backup after Phase 2 deployment"
git push origin main
```

**8.3 Verify backups exist:**

```powershell
Get-ChildItem -Path obsidian/backups/ | Sort-Object LastWriteTime -Descending | Select-Object -First 5
```

---

## Phase 2 Validation Checklist

- [ ] Docker is running and healthy (`docker ps`)
- [ ] CouchDB container is up (`curl http://localhost:5984/_up` returns `{"status":"ok"}`)
- [ ] .env.obsidian created with strong passwords (NOT committed to git)
- [ ] Obsidian app installed and vault opened
- [ ] LiveSync plugin installed and enabled
- [ ] LiveSync configured with correct CouchDB URI
- [ ] LiveSync connection test passed
- [ ] Test note created and verified in CouchDB
- [ ] Test note deleted successfully
- [ ] First real notes created (at least README.md in public/)
- [ ] Content validation passed (`npm run notes:check` or manual script)
- [ ] First backup created (`obsidian/backups/` contains recent tar.gz)
- [ ] Git backup committed and pushed (public vault notes in git history)
- [ ] Obsidian showing "synced" or sync indicator active

---

## Troubleshooting Phase 2

### CouchDB Connection Issues

**Problem:** "Connection refused" in LiveSync settings

**Solutions:**
1. Verify Docker is running: `docker ps`
2. Check container status: `docker-compose -f docker-compose.obsidian-sync.yml ps`
3. Verify port 5984 is accessible:
   ```powershell
   netstat -ano | Select-String "5984"
   # Or: lsof -i :5984 (Linux/Mac)
   ```
4. Restart CouchDB:
   ```powershell
   docker-compose -f docker-compose.obsidian-sync.yml restart
   Start-Sleep -Seconds 5
   curl http://localhost:5984/_up
   ```
5. Check Docker logs:
   ```powershell
   docker-compose -f docker-compose.obsidian-sync.yml logs couchdb | tail -30
   ```

### Obsidian Won't Open Vault

**Problem:** "Vault not found" or permission error

**Solutions:**
1. Verify path exists: `Test-Path C:\Users\yoeli\Documents\GetUpSoft_Workspace\obsidian\vault`
2. Check permissions on folder:
   ```powershell
   Get-Acl obsidian/vault | Format-List
   ```
3. Try creating vault manually:
   - File → Create new vault
   - Choose "Create in existing folder"
   - Select `obsidian/vault`

### Sync Not Working

**Problem:** Files created but not syncing to CouchDB

**Solutions:**
1. Verify LiveSync is enabled (should show "Stop sync" button)
2. Check Obsidian console for errors:
   - Help (?) → Toggle developer tools
   - Look for error messages
3. Test manually:
   ```powershell
   # Check if database exists
   $adminPassword = (Get-Content .env.obsidian | Select-String "COUCHDB_ADMIN_PASSWORD" | Select-Object -First 1) -replace '.*=', ''
   curl "http://admin:${adminPassword}@localhost:5984/obsidian_vault"
   ```
4. Reinitialize sync:
   - Settings → Live Sync → "Stop sync"
   - Wait 3 seconds
   - "Start sync" again
   - Give it 5-10 seconds to sync backlog

### Password Issues

**Problem:** CouchDB connection fails with wrong password error

**Solutions:**
1. Verify .env.obsidian has correct password:
   ```powershell
   Get-Content .env.obsidian | Select-String "COUCHDB_"
   ```
2. Test credentials manually:
   ```powershell
   $pass = (Get-Content .env.obsidian | Select-String "COUCHDB_PASSWORD" | Select-Object -First 1) -replace '.*=', ''
   curl "http://obsidian_user:${pass}@localhost:5984/"
   ```
3. If still failing, reset credentials:
   ```powershell
   # Stop CouchDB
   docker-compose -f docker-compose.obsidian-sync.yml down
   
   # Remove data volume (careful - deletes all notes!)
   Remove-Item -Path docker/couchdb/data -Recurse -Force
   
   # Update .env.obsidian with new passwords
   notepad .env.obsidian
   
   # Restart
   docker-compose -f docker-compose.obsidian-sync.yml up -d
   ```

---

## Next Steps After Phase 2

Once Phase 2 is complete:

1. **Optional: Set up mobile sync**
   - Install Obsidian on mobile (iOS App Store or Android Google Play)
   - Install Live Sync from community plugins
   - Use same CouchDB URI and credentials
   - Set same encryption passphrase
   - Wait for full sync (may take a few minutes)

2. **Phase 3: Publishing Pipeline** (when ready)
   - See `docs/publish-pipeline.md` for Quartz setup
   - Configure GitHub Actions (optional)
   - Set up web hosting (GitHub Pages, Cloudflare Pages, etc.)

3. **Ongoing: Create and manage notes**
   - Use `obsidian/vault/public/` for publishable notes
   - Use `obsidian/vault/private/` for private notes
   - Regular backups: `npm run notes:backup` or git commits

4. **Monitoring and maintenance**
   - Check CouchDB health weekly: `curl http://localhost:5984/_up`
   - Review backups monthly: `Get-ChildItem obsidian/backups/`
   - Test restore once per quarter

---

## Support and Escalation

**If Phase 2 encounters issues:**

1. Check the troubleshooting section above first
2. Review detailed docs:
   - `docs/sync-architecture.md` — CouchDB and LiveSync technical details
   - `docs/rollback.md` — Recovery procedures
   - `obsidian/README.md` — Quick reference guide
3. Check git history for related issues: `git log --all --oneline | grep -i obsidian`
4. Contact DevOps team with:
   - Error message (exact text)
   - Steps to reproduce
   - Environment info (`docker ps`, `node --version`, etc.)
   - Recent git commits

---

## Safety Reminders

🔒 **DO:**
- Keep .env.obsidian SECRET (add to .gitignore permanently)
- Use strong passwords (16+ chars, mixed case, numbers, symbols)
- Backup regularly (git commits + backup scripts)
- Test restore procedures monthly
- Keep Docker and Obsidian updated

❌ **DON'T:**
- Commit .env.obsidian to git
- Share CouchDB credentials via email/chat
- Use weak passwords
- Skip backups
- Expose port 5984 to the internet (use VPN/Tailscale if remote access needed)

---

**Phase 2 Completion Date:** [To be filled after execution]  
**Status:** Ready to Execute  
**Next Review:** After Phase 2 deployment complete  
**Maintained by:** DevOps Team

✅ **PHASE 2: DEPLOYMENT READY**
