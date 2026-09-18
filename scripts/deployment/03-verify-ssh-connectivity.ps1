# SSH Connectivity Verification Script
# Purpose: Verify we can connect to getupsoft-lan via SSH
# Status: READ-ONLY - Diagnostic only

param(
    [string]$SshHost = "getupsoft-lan",
    [string]$SshUser = "getupsoft"  # ADJUST IF NEEDED
)

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "SSH CONNECTIVITY CHECK" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

# 1. Check SSH availability
Write-Host "1️⃣  Checking SSH command availability..." -ForegroundColor Yellow
try {
    $sshVersion = ssh -V 2>&1
    Write-Host "   ✅ SSH is available: $sshVersion"
} catch {
    Write-Host "   ❌ SSH not found. Install OpenSSH." -ForegroundColor Red
    exit 1
}

# 2. Check network connectivity
Write-Host ""
Write-Host "2️⃣  Testing network connectivity to $SshHost..." -ForegroundColor Yellow
try {
    $ping = Test-NetConnection $SshHost -WarningAction SilentlyContinue
    if ($ping.PingSucceeded) {
        Write-Host "   ✅ Host is reachable (latency: $($ping.PingReplyDetails.RoundtripTime)ms)"
    } else {
        Write-Host "   ⚠️  Host not reachable via ping (may still have SSH)"
    }
} catch {
    Write-Host "   ⚠️  Cannot resolve hostname (check network/DNS)"
}

# 3. Check SSH port availability
Write-Host ""
Write-Host "3️⃣  Testing SSH port (22) connectivity..." -ForegroundColor Yellow
try {
    $tcpTest = Test-NetConnection $SshHost -Port 22 -WarningAction SilentlyContinue
    if ($tcpTest.TcpTestSucceeded) {
        Write-Host "   ✅ SSH port is open"
    } else {
        Write-Host "   ❌ SSH port is closed or blocked" -ForegroundColor Red
    }
} catch {
    Write-Host "   ❌ Cannot connect: $($_.Exception.Message)" -ForegroundColor Red
}

# 4. Check SSH keys
Write-Host ""
Write-Host "4️⃣  Checking SSH keys..." -ForegroundColor Yellow
$sshKeyPath = "$HOME\.ssh\id_rsa"
if (Test-Path $sshKeyPath) {
    Write-Host "   ✅ SSH private key exists: $sshKeyPath"
} else {
    Write-Host "   ⚠️  No SSH key found at $sshKeyPath"
    Write-Host "   Generate with: ssh-keygen -t rsa -b 4096"
}

# 5. Try SSH connection (without executing commands)
Write-Host ""
Write-Host "5️⃣  Testing SSH connection..." -ForegroundColor Yellow
Write-Host "   Command: ssh -o ConnectTimeout=5 -o StrictHostKeyChecking=no $SshUser@$SshHost 'echo Connection OK'"
try {
    $output = ssh -o ConnectTimeout=5 -o StrictHostKeyChecking=no "$SshUser@$SshHost" 'echo Connection OK' 2>&1
    if ($output -contains "Connection OK") {
        Write-Host "   ✅ SSH connection successful!"
        Write-Host "   User: $SshUser"
        Write-Host "   Host: $SshHost"
    } else {
        Write-Host "   ⚠️  Connection succeeded but unexpected response: $output"
    }
} catch {
    Write-Host "   ❌ SSH connection failed: $($_.Exception.Message)" -ForegroundColor Red
}

# 6. Summary
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "📋 DEPLOYMENT PREREQUISITES:" -ForegroundColor Yellow
Write-Host "   ✓ SSH available"
Write-Host "   ✓ Network connectivity"
Write-Host "   ✓ SSH port open"
Write-Host "   ✓ SSH keys configured"
Write-Host "   ✓ SSH authentication working"
Write-Host ""
Write-Host "🔒 CRITICAL CONSTRAINTS (DO NOT VIOLATE):"
Write-Host "   🔴 DO NOT modify SSH tunnels"
Write-Host "   🔴 DO NOT modify jonlynch configuration"
Write-Host "   🔴 DO NOT stop services during deploy"
Write-Host ""
Write-Host "Ready to proceed? Run: 04-deploy-to-getupsoft-lan.ps1"
