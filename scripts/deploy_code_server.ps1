<#
.SYNOPSIS
    Deploy code-server and configure code.getupsoft.com.do (full automated setup)
.DESCRIPTION
    1. Creates DNS record in Cloudflare (code.getupsoft.com.do -> CNAME ssh.getupsoft.com.do)
    2. Syncs workspace to server
    3. Installs code-server, configures nginx, starts service
    4. Verifies frontend access
.EXAMPLE
    .\scripts\deploy_code_server.ps1
    .\scripts\deploy_code_server.ps1 -Password "MyPass123"
    .\scripts\deploy_code_server.ps1 -SkipDns
#>
param(
    [string]$HostAlias = "getupsoft-lan",
    [string]$RemoteRoot = "/home/ubuntu/workspaces/GetUpSoft_Workspace",
    [string]$Password = "",
    [string]$CloudflareApiToken = "",
    [switch]$SkipDns,
    [switch]$SkipSync
)

$ErrorActionPreference = "Stop"
$workspace = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$domain = "code.getupsoft.com.do"

Write-Host ""
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  DEPLOYING code-server -> https://$domain" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  STEP 1: Cloudflare DNS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
if (-not $SkipDns) {
    Write-Host "[1/5] Creating DNS record in Cloudflare..." -ForegroundColor Yellow

    if (-not $CloudflareApiToken) {
        $CloudflareApiToken = $env:CLOUDFLARE_API_TOKEN
    }
    if (-not $CloudflareApiToken) {
        Write-Host "  No Cloudflare API token found." -ForegroundColor DarkYellow
        Write-Host "  Set env var CLOUDFLARE_API_TOKEN or pass -CloudflareApiToken" -ForegroundColor DarkYellow
        Write-Host "  Skipping DNS — ensure 'code.getupsoft.com.do' CNAME exists manually" -ForegroundColor DarkYellow
        Write-Host ""
    } else {
        $cfHeaders = @{
            Authorization = "Bearer $CloudflareApiToken"
            "Content-Type" = "application/json"
        }

        # Get zone ID for getupsoft.com.do
        try {
            $zoneResp = Invoke-RestMethod -Method Get `
                -Uri "https://api.cloudflare.com/client/v4/zones?name=getupsoft.com.do" `
                -Headers $cfHeaders
            $zoneId = $zoneResp.result[0].id

            # Check if record already exists
            $existingResp = Invoke-RestMethod -Method Get `
                -Uri "https://api.cloudflare.com/client/v4/zones/$zoneId/dns_records?name=$domain&type=CNAME" `
                -Headers $cfHeaders

            $body = @{
                type = "CNAME"
                name = $domain
                content = "ssh.getupsoft.com.do"
                proxied = $true
                ttl = 1
            } | ConvertTo-Json

            if ($existingResp.result.Count -gt 0) {
                $recordId = $existingResp.result[0].id
                Invoke-RestMethod -Method Put `
                    -Uri "https://api.cloudflare.com/client/v4/zones/$zoneId/dns_records/$recordId" `
                    -Headers $cfHeaders -Body $body | Out-Null
                Write-Host "  DNS record updated: $domain -> ssh.getupsoft.com.do (proxied)" -ForegroundColor Green
            } else {
                Invoke-RestMethod -Method Post `
                    -Uri "https://api.cloudflare.com/client/v4/zones/$zoneId/dns_records" `
                    -Headers $cfHeaders -Body $body | Out-Null
                Write-Host "  DNS record created: $domain -> ssh.getupsoft.com.do (proxied)" -ForegroundColor Green
            }
        } catch {
            Write-Host "  WARNING: Cloudflare API failed: $_" -ForegroundColor DarkYellow
            Write-Host "  Continuing anyway — add the DNS record manually if needed." -ForegroundColor DarkYellow
        }
    }
} else {
    Write-Host "[1/5] DNS: skipped (-SkipDns)" -ForegroundColor DarkGray
}

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  STEP 2: Sync workspace
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
if (-not $SkipSync) {
    Write-Host "[2/5] Syncing workspace to $HostAlias..." -ForegroundColor Yellow
    try {
        & "$workspace\scripts\sync_workspace_to_getupsoft.ps1" -HostAlias $HostAlias -RemoteRoot $RemoteRoot
        Write-Host "  Workspace synced." -ForegroundColor Green
    } catch {
        Write-Host "  Sync failed: $_" -ForegroundColor Red
        Write-Host "  Trying direct SCP of setup script..." -ForegroundColor DarkYellow
        ssh $HostAlias "mkdir -p $RemoteRoot/deploy/server/scripts"
        scp "$workspace\deploy\server\scripts\setup_code_server.sh" "${HostAlias}:${RemoteRoot}/deploy/server/scripts/setup_code_server.sh"
        Write-Host "  Setup script uploaded directly." -ForegroundColor Green
    }
} else {
    Write-Host "[2/5] Sync: skipped (-SkipSync)" -ForegroundColor DarkGray
}

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  STEP 3: Run setup on server
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Write-Host "[3/5] Running code-server setup on $HostAlias..." -ForegroundColor Yellow
Write-Host "  (installing packages, configuring nginx, starting service)" -ForegroundColor DarkGray

$remoteScript = "$RemoteRoot/deploy/server/scripts/setup_code_server.sh"
if ($Password) {
    ssh -t $HostAlias "chmod +x $remoteScript && bash $remoteScript '$RemoteRoot' '$Password'"
} else {
    ssh -t $HostAlias "chmod +x $remoteScript && bash $remoteScript '$RemoteRoot'"
}

if ($LASTEXITCODE -ne 0) {
    Write-Host "  ERROR: Setup script failed on server." -ForegroundColor Red
    exit 1
}
Write-Host "  Setup completed on server." -ForegroundColor Green

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  STEP 4: Verify service
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Write-Host "[4/5] Verifying code-server is running..." -ForegroundColor Yellow
$status = ssh $HostAlias "systemctl is-active code-server 2>/dev/null"
if ($status -eq "active") {
    Write-Host "  Service: ACTIVE" -ForegroundColor Green
} else {
    Write-Host "  WARNING: service status = $status" -ForegroundColor DarkYellow
    ssh $HostAlias "journalctl -u code-server --no-pager -n 10"
}

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  STEP 5: Test frontend
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Write-Host "[5/5] Testing https://$domain ..." -ForegroundColor Yellow
Start-Sleep -Seconds 3
try {
    $response = Invoke-WebRequest -Uri "https://$domain" -MaximumRedirection 5 -TimeoutSec 10 -UseBasicParsing -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Host "  FRONTEND: ACCESSIBLE (HTTP 200)" -ForegroundColor Green
    } else {
        Write-Host "  FRONTEND: HTTP $($response.StatusCode)" -ForegroundColor DarkYellow
    }
} catch {
    Write-Host "  FRONTEND: Not reachable yet (DNS may need propagation)" -ForegroundColor DarkYellow
    Write-Host "  Try: https://$domain in your browser in a few minutes" -ForegroundColor DarkGray
}

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#  DONE
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Write-Host ""
Write-Host "========================================================" -ForegroundColor Green
Write-Host "  DEPLOYMENT COMPLETE" -ForegroundColor Green
Write-Host "  URL: https://$domain" -ForegroundColor Green
Write-Host "  Password shown in setup output above" -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Green
Write-Host ""
Write-Host "  Quick commands:" -ForegroundColor DarkGray
Write-Host "    ssh $HostAlias 'systemctl status code-server'" -ForegroundColor DarkGray
Write-Host "    ssh $HostAlias 'journalctl -u code-server -f'" -ForegroundColor DarkGray
Write-Host "    ssh $HostAlias 'cat ~/.config/code-server/config.yaml'" -ForegroundColor DarkGray
Write-Host ""
