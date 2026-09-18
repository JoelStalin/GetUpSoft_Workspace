# Obsidian Stack Rollback Guide

## Overview

This document provides step-by-step instructions for rolling back any component of the Obsidian integration without losing data or breaking the repository.

## Quick Rollback Reference

| Component | Quick Rollback | Data Loss | Impact |
|-----------|----------------|-----------|--------|
| **Obsidian Vault** | Delete `/obsidian/vault/` directory | Recoverable from git | Low |
| **LiveSync Plugin** | Uninstall in Obsidian settings | No | Low |
| **CouchDB** | `docker-compose down` | Recoverable from backup | Medium |
| **Quartz Integration** | Delete `/quartz/` & workflow | No | Low |
| **GitHub Actions** | Delete `.github/workflows/notes-publish.yml` | No | Low |
| **Full Stack** | git reset --hard <original-commit> | Recoverable | High |

---

## Level 1: Soft Rollback (No Data Loss)

### Remove Obsidian Plugin (LiveSync)

**In Obsidian App:**
1. Settings → Community plugins
2. Find "Obsidian Live Sync"
3. Click Disable
4. (Optional) Click Uninstall

**Result:**
- ✅ Vault still exists locally
- ✅ Notes untouched
- ✅ No sync from now on

**Recover:**
1. Settings → Community plugins
2. Search "Obsidian Live Sync"
3. Install and re-enable
4. Reconfigure with saved credentials

### Stop CouchDB (Keep Data)

**Keep containers running:**
```bash
# Disable only sync
docker-compose -f docker-compose.obsidian-sync.yml pause couchdb

# OR temporarily stop (data persists)
docker-compose -f docker-compose.obsidian-sync.yml stop
```

**Recover:**
```bash
# Restart CouchDB
docker-compose -f docker-compose.obsidian-sync.yml start

# Check health
curl http://localhost:5984/_up
```

### Remove GitHub Actions Publishing

```bash
# Delete publishing workflow
rm .github/workflows/notes-publish.yml

# Commit removal
git add .github/
git commit -m "chore: remove automated publishing"
```

**Result:**
- ✅ Manual publishing still works
- ✅ No automatic deploys

**Recover:**
```bash
# Restore from git
git checkout HEAD^ -- .github/workflows/notes-publish.yml
git add .github/
git commit -m "chore: restore publishing workflow"
```

### Keep Vault, Remove Publishing Infrastructure

```bash
# Remove publishing-related files only
rm -rf quartz/
rm .env.obsidian
rm docker-compose.obsidian-sync.yml
rm scripts/check-private-notes.js
rm scripts/sync-vault-to-quartz.js
rm docs/obsidian-stack.md
rm docs/sync-architecture.md
rm docs/publish-pipeline.md

# Vault remains intact
ls obsidian/vault/public/  # Still there!

# Commit removals
git add -A
git commit -m "chore: remove obsidian publishing stack"
```

**Result:**
- ✅ Vault preserved locally
- ✅ Can restore scripts later
- ❌ Publishing disabled

**Recover:**
```bash
# Restore specific files
git checkout HEAD^ -- docker-compose.obsidian-sync.yml
git checkout HEAD^ -- scripts/
git checkout HEAD^ -- docs/obsidian-stack.md
# etc.

git add -A
git commit -m "chore: restore obsidian stack"
```

---

## Level 2: Medium Rollback (Some Data May Need Recovery)

### Delete Quartz Build Artifacts

```bash
# Keep config/content, remove build output
rm -rf quartz/public/
mkdir -p quartz/public

# Content still exists
ls quartz/content/  # Still there!

# Rebuild when ready
npm run notes:build
```

**Result:**
- ✅ Website offline temporarily
- ✅ Source notes preserved
- ✅ Can rebuild anytime

**Recover:**
```bash
npm run notes:build
npm run notes:preview  # Test locally first
npm run notes:publish  # Push to web
```

### Clear CouchDB Data (Rebuild from Git)

⚠️ **Warning:** Deletes CouchDB database, recoverable from git backup

```bash
# 1. Back up current state to git
git add obsidian/vault/public/
git commit -m "backup: vault before CouchDB reset"

# 2. Stop CouchDB
docker-compose -f docker-compose.obsidian-sync.yml down

# 3. Delete database
rm -rf docker/couchdb/data/*

# 4. Remove stale volumes (optional)
docker volume rm obsidian-sync_couchdb_data

# 5. Restart CouchDB (fresh database)
docker-compose -f docker-compose.obsidian-sync.yml up -d

# 6. Re-initialize LiveSync on all devices
# In Obsidian: Settings → Live Sync → Re-initialize
# On Mobile: Re-configure with same credentials
```

**Result:**
- ✅ CouchDB fresh (no corruption)
- ✅ Vault recoverable from git
- ❌ Devices need re-sync (~1 min each)

**Recover:**
```bash
# All devices resync from CouchDB
# (Automatic if LiveSync re-enabled)

# Or restore from specific git commit
git checkout <commit-hash> -- obsidian/vault/public/
```

---

## Level 3: Comprehensive Rollback (Hard Reset)

### Revert Entire Obsidian Integration

**Option A: Revert to Before Integration Started**

```bash
# Find the commit before Obsidian setup
git log --oneline | grep -i obsidian

# Example output:
# abc1234 docs: add Obsidian integration TIMELINE
# def5678 docs: add obsidian-stack documentation
# ghi9012 Merge branch 'main' (before integration)

# Reset to before integration
git reset --hard ghi9012

# Verify
ls obsidian/  # Should not exist
git status    # Should be clean
```

**Option B: Revert Latest Commit Only**

```bash
# Revert last commit
git revert HEAD

# This creates a new commit that undoes changes
# Safer than reset --hard (preserves history)
```

**Result:**
- ✅ Repository back to pre-integration state
- ✅ History preserved (git shows what was reverted)
- ❌ All Obsidian configuration deleted
- ❌ Vault (if local) deleted

**Recover:**
```bash
# Restore deleted files from git history
git checkout HEAD~N -- obsidian/
git checkout HEAD~N -- docker-compose.obsidian-sync.yml
git checkout HEAD~N -- scripts/check-private-notes.js
# etc.

git add -A
git commit -m "chore: restore obsidian stack"
```

### Restore from CouchDB Backup to Git

**If CouchDB data is your source of truth:**

```bash
# 1. Export CouchDB data to JSON
docker exec obsidian-couchdb curl http://localhost:5984/obsidian_vault/_all_docs > vault-export.json

# 2. Convert JSON to markdown files
node scripts/convert-couchdb-to-md.js vault-export.json

# 3. Place files in obsidian/vault/public/
# 4. Commit to git
git add obsidian/
git commit -m "chore: restore vault from CouchDB backup"

# 5. Clean up
rm vault-export.json convert-couchdb-to-md.js
```

**Recover:**
- ✅ Vault restored to git
- ✅ Can push to GitHub for backup
- ✅ Can re-sync to new CouchDB instance

---

## Level 4: Emergency Recovery

### Complete Data Loss Scenario

**Situation:** CouchDB corrupted, git history lost, local vault deleted

**Recovery Priority:**
1. ✅ Most recent CouchDB backup file
2. ✅ Git history on GitHub (push history)
3. ✅ Local backups (`obsidian/backups/vault-*.tar.gz`)
4. ✅ GitHub Actions artifact history

**Recovery Steps:**

```bash
# 1. Check local backups
ls -lt obsidian/backups/ | head -5

# 2. Restore from most recent backup
tar -xzf obsidian/backups/vault-20260522_143000.tar.gz -C obsidian/vault/

# 3. Restore CouchDB from docker volume backup
docker volume create obsidian-couchdb-restore
docker run --rm -v obsidian-couchdb-restore:/data -v $(pwd):/backup \
  alpine tar xzf /backup/couchdb-backup.tar.gz -C /data

# 4. Restart CouchDB with restored data
docker-compose -f docker-compose.obsidian-sync.yml down
# Manually change volume in docker-compose to obsidian-couchdb-restore
docker-compose up -d

# 5. Verify vault
ls obsidian/vault/public/ | head -5
curl http://localhost:5984/obsidian_vault | jq .doc_count
```

**Result:**
- ✅ Vault recovered to last backup point
- ✅ CouchDB restored
- ⚠️ May be missing changes since last backup

---

## Rollback by Component

### Obsidian App
**Rollback:** Uninstall app
**Data:** Lost (unless synced to CouchDB or git)
**Recovery:** Reinstall app + restore vault

```bash
# Keep backup
cp -r obsidian/vault/public obsidian/backups/vault-manual-$(date +%s)

# Reinstall Obsidian
# Open vault: obsidian/vault
```

### LiveSync Plugin
**Rollback:** Uninstall in Settings → Community plugins
**Data:** Not affected
**Recovery:** Reinstall plugin

```bash
# In Obsidian: Settings → Community plugins → Search "Obsidian Live Sync" → Install
```

### CouchDB
**Rollback:** Stop or delete container
**Data:** In docker volumes (recoverable)
**Recovery:** Restart container or restore from backup

```bash
# Graceful stop (data preserved)
docker-compose down

# Destructive (delete all data)
docker-compose down -v

# Restart
docker-compose up -d
```

### Quartz Integration
**Rollback:** Delete `/quartz` directory
**Data:** Not affected (source in `/obsidian/vault/public`)
**Recovery:** Recreate quartz directory + rebuild

```bash
rm -rf quartz/
# Rebuild when ready: npm run notes:build
```

### GitHub Actions Publishing
**Rollback:** Delete workflow file
**Data:** Not affected
**Recovery:** Restore file from git

```bash
rm .github/workflows/notes-publish.yml
# Recover: git checkout HEAD^ -- .github/workflows/notes-publish.yml
```

---

## Validation After Rollback

### Check Vault Integrity

```bash
# Count files
find obsidian/vault/public -type f | wc -l

# Check for corruption
find obsidian/vault/public -name "*.md" -exec grep -l "^$" {} \;

# Verify frontmatter
grep -r "^---" obsidian/vault/public | wc -l
```

### Check CouchDB Health

```bash
# CouchDB status
curl http://localhost:5984/_up

# Database exists
curl http://user:password@localhost:5984/obsidian_vault

# Document count
curl http://user:password@localhost:5984/obsidian_vault | jq .doc_count

# Replication status
curl http://localhost:5984/_scheduler/docs
```

### Check Git Status

```bash
# Verify clean state
git status

# Check history
git log --oneline | head -10

# Verify remote
git remote -v
```

### Test Sync

```bash
# Create test file
echo "# Test" > obsidian/vault/public/test.md

# Check if LiveSync detects change
# (Watch Obsidian: should show file in CouchDB)

# Verify on mobile
# (Should appear in seconds)

# Clean up
rm obsidian/vault/public/test.md
```

---

## Prevention: Regular Backups

### Automatic Backup Schedule

**Git Backup (Daily):**
```bash
# Add to crontab (Linux/Mac)
0 2 * * * cd /path/to/repo && git add obsidian/vault/public/ && git commit -m "backup: daily vault snapshot" && git push origin main
```

**CouchDB Backup (Weekly):**
```bash
# Add to crontab
0 3 * * 0 docker run --rm -v obsidian-sync_couchdb_data:/data -v /path/to/repo:/backup \
  alpine tar czf /backup/couchdb-backup-$(date +\%Y\%m\%d).tar.gz -C /data .
```

**Vault Backup (On Demand):**
```bash
npm run notes:backup
# Creates: obsidian/backups/vault-YYYYMMDD_HHMMSS.tar.gz
```

### Backup Verification

```bash
# Test restore (to temp directory)
mkdir /tmp/test-restore
tar -xzf obsidian/backups/vault-LATEST.tar.gz -C /tmp/test-restore

# Verify files
ls /tmp/test-restore/public/
find /tmp/test-restore -name "*.md" -type f | wc -l

# Cleanup
rm -rf /tmp/test-restore
```

---

## Emergency Contact

**If rollback fails:**
1. Check recent commits: `git log --oneline -20`
2. Check git reflog: `git reflog`
3. Restore specific commit: `git reset --hard <commit>`
4. Contact DevOps team for CouchDB recovery
5. Use last backup file as last resort

---

**Last Updated:** 2026-05-22  
**Status:** Ready for reference  
**Maintained by:** DevOps Team
