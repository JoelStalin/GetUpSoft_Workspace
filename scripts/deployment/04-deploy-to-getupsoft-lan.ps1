# Deployment Script - GetUpSoft_Workspace to getupsoft-lan
# Purpose: Push Phase 2 changes via SSH to getupsoft-lan
# Safety: Multiple confirmations required, non-destructive

param(
    [string]$SshHost = "getupsoft-lan",
    [string]$SshUser = "getupsoft",
    [string]$RemotePath = "/opt/getupsoft-workspace",  # ADJUST IF NEEDED
    [switch]$SkipBackup = $false,
    [switch]$SkipVerify = $false
)

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Magenta
Write-Host "DEPLOYMENT TO GETUPSOFT-LAN" -ForegroundColor Magenta
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Magenta
Write-Host ""
Write-Host "⚠️  CRITICAL CONSTRAINTS:" -ForegroundColor Red
Write-Host "   🔴 SSH tunnels will NOT be modified"
Write-Host "   🔴 jonlynch processes will NOT be modified"
Write-Host "   🔴 No services will be restarted"
Write-Host "   🔴 All current services must remain responsive"
Write-Host ""

# STEP 1: Backup (unless skipped)
if (-not $SkipBackup) {
    Write-Host "STEP 1: Creating Backup..." -ForegroundColor Cyan
    Write-Host "Running: .\01-backup-repo.ps1"
    & .\01-backup-repo.ps1
    Write-Host "✅ Backup complete"
} else {
    Write-Host "⏭️  Skipping backup (--SkipBackup specified)"
}

# STEP 2: Verify services (unless skipped)
if (-not $SkipVerify) {
    Write-Host ""
    Write-Host "STEP 2: Verifying current services..." -ForegroundColor Cyan
    Write-Host "Running: .\02-verify-services-pre-deploy.ps1"
    & .\02-verify-services-pre-deploy.ps1
    Write-Host "✅ Pre-deployment check complete"
}

# STEP 3: Verify SSH connectivity
Write-Host ""
Write-Host "STEP 3: Verifying SSH connectivity..." -ForegroundColor Cyan
Write-Host "Target: $SshUser@$SshHost"
Write-Host "Remote Path: $RemotePath"
try {
    $result = ssh -o ConnectTimeout=5 -o StrictHostKeyChecking=no "$SshUser@$SshHost" 'echo "OK"' 2>&1
    if ($result -eq "OK") {
        Write-Host "✅ SSH connection verified"
    } else {
        Write-Host "❌ SSH connection failed" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ SSH error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# STEP 4: Show what will be deployed
Write-Host ""
Write-Host "STEP 4: Deployment Summary" -ForegroundColor Cyan
Write-Host "Phase 2 Changes:"
Write-Host "  • 11 new files (contexts, hooks, utilities)"
Write-Host "  • Enhanced type definitions"
Write-Host "  • Event system implementation"
Write-Host "  • Error recovery system"
Write-Host "  • Migration guides and examples"
Write-Host ""
Write-Host "Commits to push: 13 commits (20354a38f...ce63b252c)"
Write-Host ""

# STEP 5: User confirmation
Write-Host "⚠️  BEFORE PROCEEDING:" -ForegroundColor Red
Write-Host "  1. Are all current services documented and responding?"
Write-Host "  2. Is the backup verified in .backup/ directory?"
Write-Host "  3. Do you have rollback plan ready?"
Write-Host "  4. Will you monitor services for 24 hours post-deploy?"
Write-Host ""
$confirm = Read-Host "Type 'DEPLOY' to proceed (anything else to cancel)"
if ($confirm -ne "DEPLOY") {
    Write-Host "❌ Deployment cancelled" -ForegroundColor Yellow
    exit 0
}

# STEP 6: SSH Push
Write-Host ""
Write-Host "STEP 6: Deploying via SSH..." -ForegroundColor Magenta
Write-Host "Executing: ssh $SshUser@$SshHost 'cd $RemotePath && git pull origin main'"
Write-Host ""

$deployCmd = @"
cd $RemotePath && \
git status && \
git pull origin main && \
echo '✅ Deployment complete at $(date)' 
"@

ssh "$SshUser@$SshHost" $deployCmd

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Deployment succeeded" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "❌ Deployment failed (exit code: $LASTEXITCODE)" -ForegroundColor Red
    Write-Host "Rollback: git revert HEAD on $SshHost"
    exit 1
}

# STEP 7: Post-deployment verification
Write-Host ""
Write-Host "STEP 7: Post-deployment verification..." -ForegroundColor Cyan
Write-Host "Checking remote git status..."

ssh "$SshUser@$SshHost" "cd $RemotePath && git log --oneline -5"

Write-Host ""
Write-Host "⚠️  NEXT STEPS:" -ForegroundColor Yellow
Write-Host "  1. ✅ Verify services still responding"
Write-Host "  2. ✅ Check application logs for errors"
Write-Host "  3. ✅ Test all critical workflows"
Write-Host "  4. ✅ Monitor for 24 hours"
Write-Host ""
Write-Host "Rollback if needed: git revert HEAD on $SshHost"
