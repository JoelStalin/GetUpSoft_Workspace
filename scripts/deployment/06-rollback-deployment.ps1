# Rollback Script - Emergency Recovery
# Purpose: Revert deployment if something goes wrong
# Safety: User confirmation required

param(
    [string]$SshHost = "getupsoft-lan",
    [string]$SshUser = "getupsoft",
    [string]$CommitsBack = "1"  # How many commits to revert
)

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Red
Write-Host "⚠️  EMERGENCY ROLLBACK PROCEDURE" -ForegroundColor Red
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Red
Write-Host ""
Write-Host "This will revert the last $CommitsBack commit(s) on $SshHost"
Write-Host ""

# Confirmation
Write-Host "⚠️  CONFIRM:" -ForegroundColor Red
Write-Host "  1. Do you want to rollback?"
Write-Host "  2. Have you stopped any dependent processes?"
Write-Host "  3. Do you have the backup available?"
Write-Host ""
$confirm = Read-Host "Type 'ROLLBACK' to proceed (anything else to cancel)"
if ($confirm -ne "ROLLBACK") {
    Write-Host "❌ Rollback cancelled" -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "Executing rollback on $SshHost..." -ForegroundColor Cyan
Write-Host ""

ssh "$SshUser@$SshHost" @"
cd /opt/getupsoft-workspace && \
echo "Current commit:" && \
git log --oneline -1 && \
echo "" && \
echo "Reverting..." && \
git reset --hard HEAD~$CommitsBack && \
echo "✅ Rollback complete" && \
git log --oneline -3
"@

Write-Host ""
Write-Host "✅ Rollback executed" -ForegroundColor Green
Write-Host ""
Write-Host "📋 NEXT STEPS:" -ForegroundColor Yellow
Write-Host "  1. Verify services are responding"
Write-Host "  2. Check logs for errors"
Write-Host "  3. Document what went wrong"
Write-Host "  4. Run: 05-verify-services-post-deploy.ps1"
