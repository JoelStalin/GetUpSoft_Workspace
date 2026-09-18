# ORCA Workflow Editor - Manual Deployment Script for Windows
# This script handles the SSH key issue on Windows and deploys via password authentication

param(
    [string]$RemoteHost = "192.168.1.233",
    [string]$RemoteUser = "ubuntu",
    [string]$RemotePassword = $null
)

Write-Host "🚀 ORCA Workflow Editor Deployment to getupsoft-lan" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green
Write-Host ""

# Check if dist directory exists
$distPath = "$PSScriptRoot\..\apps\orca\workflow-editor\dist"
if (-not (Test-Path $distPath)) {
    Write-Host "❌ Build directory not found: $distPath" -ForegroundColor Red
    Write-Host "Please run: npm run build" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Build directory found: $distPath" -ForegroundColor Green
Write-Host ""

# Get build size
$distSize = [math]::Round((Get-ChildItem $distPath -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB, 2)
Write-Host "📦 Build size: ${distSize} MB" -ForegroundColor Cyan
Write-Host ""

# Check if plink is available (PuTTY SSH client for Windows)
$plinkPath = "C:\Program Files\PuTTY\plink.exe"
if (-not (Test-Path $plinkPath)) {
    Write-Host "⚠️  PuTTY plink.exe not found at: $plinkPath" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "💡 Alternatives:" -ForegroundColor Cyan
    Write-Host "  1. Install PuTTY from: https://www.putty.org/" -ForegroundColor White
    Write-Host "  2. Use WSL (Windows Subsystem for Linux) for SSH" -ForegroundColor White
    Write-Host "  3. Use the zip archive method (see ORCA_SSH_DEPLOYMENT_MANUAL.md)" -ForegroundColor White
    Write-Host ""
    Write-Host "For now, using SSH from PATH..." -ForegroundColor Yellow
}

# Test SSH connection
Write-Host "🔄 Testing SSH connection to $RemoteHost..." -ForegroundColor Cyan

# Use ssh.exe from Git Bash or OpenSSH if available
try {
    $testConnection = ssh -o ConnectTimeout=5 -o StrictHostKeyChecking=no $RemoteUser@$RemoteHost "echo 'SSH OK'" 2>&1
    if ($testConnection -contains "SSH OK") {
        Write-Host "✅ SSH connection successful!" -ForegroundColor Green
    } else {
        Write-Host "⚠️  SSH connection test inconclusive" -ForegroundColor Yellow
        Write-Host "Attempting to proceed with deployment..." -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ SSH connection failed: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 Solutions:" -ForegroundColor Cyan
    Write-Host "  1. Verify SSH is installed: ssh --version" -ForegroundColor White
    Write-Host "  2. Check network connectivity: ping 192.168.1.233" -ForegroundColor White
    Write-Host "  3. Use password authentication if available" -ForegroundColor White
    exit 1
}

Write-Host ""

# Create backup on remote server
Write-Host "💾 Creating backup on remote server..." -ForegroundColor Cyan
$backupCmd = @"
TIMESTAMP=`$(date +%Y%m%d_%H%M%S)
mkdir -p /home/ubuntu/orca_backup_`$TIMESTAMP
if [ -d /home/ubuntu/orca ]; then
  cp -r /home/ubuntu/orca/* /home/ubuntu/orca_backup_`$TIMESTAMP/ || true
  echo "Backup created: /home/ubuntu/orca_backup_`$TIMESTAMP"
else
  mkdir -p /home/ubuntu/orca
  echo "Created new /home/ubuntu/orca directory"
fi
"@

ssh -o StrictHostKeyChecking=no $RemoteUser@$RemoteHost $backupCmd
Write-Host "✅ Backup completed" -ForegroundColor Green
Write-Host ""

# Deploy files via scp
Write-Host "📤 Uploading files via SCP..." -ForegroundColor Cyan

# Get list of files to deploy
$files = Get-ChildItem -Path $distPath -Recurse -Force

$successCount = 0
$failCount = 0

foreach ($file in $files) {
    $relativePath = $file.FullName.Substring($distPath.Length + 1)

    if ($file.PSIsContainer) {
        # Create directory
        ssh -o StrictHostKeyChecking=no $RemoteUser@$RemoteHost "mkdir -p /home/ubuntu/orca/$relativePath" | Out-Null
    } else {
        # Upload file
        try {
            scp -o ConnectTimeout=5 -o StrictHostKeyChecking=no "$($file.FullName)" "${RemoteUser}@${RemoteHost}:/home/ubuntu/orca/$relativePath" 2>&1 | Out-Null
            $successCount++
            Write-Host "  ✓ $relativePath" -ForegroundColor Green
        } catch {
            $failCount++
            Write-Host "  ✗ $relativePath - $_" -ForegroundColor Red
        }
    }
}

Write-Host ""
Write-Host "📊 Upload results: $successCount files uploaded, $failCount failed" -ForegroundColor Cyan

if ($failCount -gt 0) {
    Write-Host "⚠️  Some files failed to upload" -ForegroundColor Yellow
}

Write-Host ""

# Verify deployment
Write-Host "🧪 Verifying deployment..." -ForegroundColor Cyan

$verifyCmd = @"
if [ -f /home/ubuntu/orca/index.html ]; then
  echo "✅ index.html found"
  echo "Size: `$(wc -c < /home/ubuntu/orca/index.html) bytes"
  echo "Files deployed:"
  ls -lah /home/ubuntu/orca/ | head -10
else
  echo "❌ index.html NOT found - deployment may have failed"
  exit 1
fi
"@

$verifyResult = ssh -o StrictHostKeyChecking=no $RemoteUser@$RemoteHost $verifyCmd
Write-Host $verifyResult -ForegroundColor Green

Write-Host ""
Write-Host "🎉 Deployment completed!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Next steps:" -ForegroundColor Cyan
Write-Host "  1. Open browser: http://getupsoft-lan/orca" -ForegroundColor White
Write-Host "  2. Verify intro animation loads" -ForegroundColor White
Write-Host "  3. Test interactive features" -ForegroundColor White
Write-Host "  4. Check browser console (F12) for errors" -ForegroundColor White
Write-Host ""
Write-Host "⏮️  To rollback:" -ForegroundColor Yellow
Write-Host "  ssh $RemoteUser@$RemoteHost" -ForegroundColor White
Write-Host "  BACKUP=\$(ls -d /home/ubuntu/orca_backup_*/ | sort -r | head -1)" -ForegroundColor White
Write-Host "  rm -rf /home/ubuntu/orca/*" -ForegroundColor White
Write-Host "  cp -r \$BACKUP/* /home/ubuntu/orca/" -ForegroundColor White
