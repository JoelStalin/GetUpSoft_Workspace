# Post-Deployment Service Verification
# Purpose: Verify services still responding after deployment
# Status: READ-ONLY diagnostic

param(
    [string]$SshHost = "getupsoft-lan",
    [string]$SshUser = "getupsoft"
)

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host "POST-DEPLOYMENT SERVICE VERIFICATION" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host ""

# Remote verification
Write-Host "🔍 Checking services on $SshHost..." -ForegroundColor Cyan
Write-Host ""

ssh "$SshUser@$SshHost" @'
echo "Git Status:"
cd /opt/getupsoft-workspace 2>/dev/null && git log --oneline -3 || echo "Repository not found"

echo ""
echo "Recent deployment info:"
tail -20 /var/log/deployment.log 2>/dev/null || echo "No deployment log found"

echo ""
echo "Service Status:"
systemctl status --no-pager --all 2>/dev/null || echo "Cannot check systemd services"

echo ""
echo "Network ports:"
netstat -tuln 2>/dev/null | grep LISTEN || echo "Cannot check ports"
'@

# Local post-deployment checks
Write-Host ""
Write-Host "✅ POST-DEPLOYMENT CHECKLIST:" -ForegroundColor Green
Write-Host "  [ ] All services still responding"
Write-Host "  [ ] No new errors in logs"
Write-Host "  [ ] Commit history updated"
Write-Host "  [ ] Backup is safe and accessible"
Write-Host ""
Write-Host "⏰ MONITORING RECOMMENDATION:" -ForegroundColor Yellow
Write-Host "  Monitor services for 24 hours for any issues"
Write-Host "  Keep rollback plan ready in case of problems"
Write-Host ""
Write-Host "If issues found:"
Write-Host "  1. Run: 06-rollback-deployment.ps1"
Write-Host "  2. Restore from backup in .backup/ directory"
Write-Host "  3. Document root cause"
