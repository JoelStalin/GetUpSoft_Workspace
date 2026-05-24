param(
  [string]$BaseUrl = "http://localhost:8915",
  [string]$OutDir = "docs/qa/evidence",
  [switch]$ValidateLogs,
  [string]$SshHost = "ubuntu@ssh.getupsoft.com.do",
  [string]$SystemdService = "orca-client-gateway-api.service",
  [string]$SudoPassword = ""
)

$ErrorActionPreference = "Stop"

function Post-Json {
  param(
    [Parameter(Mandatory = $true)][string]$Url,
    [Parameter(Mandatory = $true)][object]$Body
  )
  $json = $Body | ConvertTo-Json -Depth 10 -Compress
  Invoke-RestMethod -Method Post -Uri $Url -ContentType "application/json" -Body $json
}

function Get-Json {
  param([Parameter(Mandatory = $true)][string]$Url)
  Invoke-RestMethod -Method Get -Uri $Url
}

function New-Slug {
  param([string]$Prefix = "demo")
  $epoch = [int][double]::Parse((Get-Date -UFormat %s))
  "$Prefix-$epoch"
}

if (-not [System.IO.Path]::IsPathRooted($OutDir)) {
  $OutDir = Join-Path (Get-Location) $OutDir
}
New-Item -ItemType Directory -Path $OutDir -Force | Out-Null

$timestamp = (Get-Date).ToUniversalTime().ToString("yyyyMMdd-HHmmss")
$slug = New-Slug -Prefix "demo-qa"
$startUtc = (Get-Date).ToUniversalTime().ToString("o")

$tenant = Post-Json "$BaseUrl/api/v1/tenants" @{ name = "QA Demo Client"; slug = $slug }
$pair = Post-Json "$BaseUrl/api/v1/tenants/$($tenant.id)/pairing-codes" @{}
$enroll = Post-Json "$BaseUrl/api/v1/agent/devices/enroll" @{
  pairingCode = $pair.pairingCode
  deviceName = "QA Device"
  os = "windows"
  arch = "x64"
  agentVersion = "1.0.0"
  publicKey = "PUBKEY-$([guid]::NewGuid().ToString('N'))"
}
$heartbeat = Post-Json "$BaseUrl/api/v1/agent/devices/$($enroll.deviceId)/heartbeat" @{
  status = "connected"
  agentVersion = "1.0.0"
  runtimeVersion = "1.0.0"
  tunnelStatus = "connected"
  lastError = $null
  localTime = (Get-Date).ToUniversalTime().ToString("o")
}
$command = Post-Json "$BaseUrl/api/v1/devices/$($enroll.deviceId)/commands" @{
  type = "RUN_FLOW"
  flowId = "flow-demo-hello"
  payload = @{ input = "hello-from-qa-script" }
  ttlSeconds = 300
  idempotencyKey = "idem-$([guid]::NewGuid().ToString('N'))"
}
$poll = Get-Json "$BaseUrl/api/v1/agent/devices/$($enroll.deviceId)/commands/poll"
if (-not $poll.commands -or $poll.commands.Count -lt 1) {
  throw "No command was delivered on poll."
}
$commandId = $poll.commands[0].id
$result = Post-Json "$BaseUrl/api/v1/agent/devices/$($enroll.deviceId)/commands/$commandId/result" @{
  status = "succeeded"
  startedAt = (Get-Date).ToUniversalTime().ToString("o")
  finishedAt = (Get-Date).ToUniversalTime().AddSeconds(1).ToString("o")
  exitCode = 0
  safeLogs = "Flow completed by QA script"
  artifacts = @()
}
$revoke = Post-Json "$BaseUrl/api/v1/devices/$($enroll.deviceId)/revoke" @{}
$heartbeatAfterRevoke = Post-Json "$BaseUrl/api/v1/agent/devices/$($enroll.deviceId)/heartbeat" @{
  status = "connected"
  agentVersion = "1.0.0"
  runtimeVersion = "1.0.0"
  tunnelStatus = "connected"
  lastError = $null
  localTime = (Get-Date).ToUniversalTime().ToString("o")
}
$audit = Get-Json "$BaseUrl/api/v1/devices/$($enroll.deviceId)/audit"

$logCheck = $null
if ($ValidateLogs) {
  if ([string]::IsNullOrWhiteSpace($SudoPassword)) {
    throw "ValidateLogs was enabled but SudoPassword is empty."
  }
  $cmd = "echo '$SudoPassword' | sudo -S journalctl -u $SystemdService --since '10 min ago' --no-pager | grep -iE 'error|exception|fail' || true"
  $rawLogCheck = ssh $SshHost $cmd
  $lines = @()
  if ($rawLogCheck) {
    $lines = ($rawLogCheck -split "`r?`n" | Where-Object { $_ -and ($_ -notmatch "^\[sudo\] password for") })
  }
  $logCheck = [pscustomobject]@{
    checked = $true
    sshHost = $SshHost
    systemdService = $SystemdService
    errorLines = $lines
    passed = ($lines.Count -eq 0)
  }
}

$report = [pscustomobject]@{
  meta = [pscustomobject]@{
    timestampUtc = (Get-Date).ToUniversalTime().ToString("o")
    startedAtUtc = $startUtc
    baseUrl = $BaseUrl
    validateLogs = [bool]$ValidateLogs
  }
  ids = [pscustomobject]@{
    tenantId = $tenant.id
    slug = $slug
    pairingCode = $pair.pairingCode
    deviceId = $enroll.deviceId
    commandId = $commandId
  }
  checks = [pscustomobject]@{
    tenantCreated = [bool]($tenant.id)
    pairingIssued = [bool]($pair.pairingCode)
    enrolled = [bool]($enroll.deviceId)
    heartbeatOk = [bool]$heartbeat.ok
    commandIssued = [bool]($command.id)
    commandPolled = [bool]($commandId)
    resultOk = [bool]$result.ok
    revokeOk = [bool]$revoke.ok
    heartbeatRejectedAfterRevoke = ($heartbeatAfterRevoke.error -eq "device_revoked_or_not_found")
    auditCount = if ($audit) { $audit.Count } else { 0 }
  }
  responses = [pscustomobject]@{
    tenant = $tenant
    pairing = $pair
    enroll = $enroll
    heartbeat = $heartbeat
    command = $command
    poll = $poll
    result = $result
    revoke = $revoke
    heartbeatAfterRevoke = $heartbeatAfterRevoke
    audit = $audit
  }
  logCheck = $logCheck
}

$outFile = Join-Path $OutDir "vertical-flow-$timestamp.json"
$report | ConvertTo-Json -Depth 15 | Set-Content -Path $outFile -Encoding UTF8

$summary = [pscustomobject]@{
  outFile = $outFile
  baseUrl = $BaseUrl
  tenantId = $tenant.id
  deviceId = $enroll.deviceId
  commandId = $commandId
  heartbeatRejectedAfterRevoke = ($heartbeatAfterRevoke.error -eq "device_revoked_or_not_found")
  auditCount = if ($audit) { $audit.Count } else { 0 }
  logCheckPassed = if ($logCheck) { $logCheck.passed } else { $null }
}

$summary | ConvertTo-Json -Depth 6
