# Deployment Scripts - getupsoft-lan SSH Deploy

**Purpose:** Safe deployment of Phase 2 changes to getupsoft-lan via SSH  
**Date Created:** 2026-05-25  
**Status:** Ready for execution  

## 🔒 Safety Guarantees

✅ **No Destructive Operations**
- SSH tunnels will NOT be modified
- jonlynch processes will NOT be modified  
- No services will be stopped or restarted
- All current services must remain responsive

✅ **Full Backup Before Deploy**
- Complete git history preserved
- Configuration files backed up
- Rollback plan documented

✅ **Multi-Step Verification**
- Pre-deployment service health check
- SSH connectivity verification
- Post-deployment service verification
- User confirmation at each step

## 📋 Deployment Sequence

Run these scripts **in order**:

### Phase 1: Verification (No Changes)
```powershell
.\01-backup-repo.ps1
.\02-verify-services-pre-deploy.ps1
.\03-verify-ssh-connectivity.ps1
```

### Phase 2: Deployment (Requires Confirmation)
```powershell
.\04-deploy-to-getupsoft-lan.ps1
```

### Phase 3: Verification (No Changes)
```powershell
.\05-verify-services-post-deploy.ps1
```

### Emergency (If Needed)
```powershell
.\06-rollback-deployment.ps1
```

## 🚀 Quick Start

1. **Adjust Configuration** (if needed)
   - Edit script parameters: `$SshHost`, `$SshUser`, `$RemotePath`
   - Default: `getupsoft@getupsoft-lan:/opt/getupsoft-workspace`

2. **Run Verification**
   ```powershell
   cd .\scripts\deployment
   .\01-backup-repo.ps1
   .\02-verify-services-pre-deploy.ps1
   .\03-verify-ssh-connectivity.ps1
   ```

3. **If All Checks Pass**
   ```powershell
   .\04-deploy-to-getupsoft-lan.ps1
   ```

4. **Monitor Post-Deployment**
   ```powershell
   .\05-verify-services-post-deploy.ps1
   ```

## 📦 What Gets Deployed

**Phase 2 Changes:**
- 11 new files (contexts, hooks, utilities)
- Enhanced type definitions  
- Event system implementation
- Error recovery system
- Migration guides and examples

**Total:** 13 commits from Phase 2 work

## 🆘 Rollback Procedure

If anything goes wrong:

```powershell
.\06-rollback-deployment.ps1
```

This will:
1. Revert the last deployment commit(s)
2. Restore previous git state
3. Verify services still respond
4. Document the issue

## ⚠️ Critical Constraints (DO NOT VIOLATE)

```
🔴 DO NOT: Modify SSH tunnels
🔴 DO NOT: Modify jonlynch configuration or processes
🔴 DO NOT: Stop/restart services without approval
🔴 DO NOT: Change network configuration
🔴 DO NOT: Delete or modify backups
```

## 📊 Backup Location

Backups created in: `.\.backup\yyyy-MM-dd_HHmmss\`

Contains:
- `repo.bundle` - Complete git history
- `git-status.txt` - Current git status
- `git-log.txt` - Recent commits
- `MANIFEST.json` - Backup inventory

## 🔍 Verification Points

### Pre-Deployment
- ✅ All current services documented and responding
- ✅ SSH connectivity verified
- ✅ Backup created successfully
- ✅ No conflicts with existing config

### Post-Deployment
- ✅ All services still responding with same status
- ✅ No new errors in logs
- ✅ Git history updated correctly
- ✅ jonlynch processes unaffected

## 📝 Requirements

- PowerShell 7+ (or 5.1 with OpenSSH)
- SSH client (OpenSSH for Windows)
- Git installed and configured
- Network access to getupsoft-lan:22
- Valid SSH credentials for getupsoft@getupsoft-lan

## 🛠️ Troubleshooting

### SSH Connection Fails
```powershell
# Check SSH connectivity manually
ssh -v getupsoft@getupsoft-lan 'echo OK'

# Verify SSH key
ls ~/.ssh/id_rsa
```

### Deployment Hangs
```powershell
# Press Ctrl+C to cancel
# Rollback with: .\06-rollback-deployment.ps1
```

### Services Not Responding Post-Deploy
```powershell
# Run post-deploy checks
.\05-verify-services-post-deploy.ps1

# If issues found, rollback
.\06-rollback-deployment.ps1
```

## 📞 Support

If deployment issues occur:
1. Run rollback script immediately
2. Restore from backup
3. Document what failed
4. Check logs on getupsoft-lan
5. Contact system administrator

---

**Status:** Ready for deployment  
**Last Updated:** 2026-05-25  
**Next Step:** Run verification scripts
