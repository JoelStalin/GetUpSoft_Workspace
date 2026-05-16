param(
  [Parameter(Mandatory=$true)][string]$ApiToken,
  [Parameter(Mandatory=$true)][string]$AccountId,
  [Parameter(Mandatory=$false)][string]$GetupsoftComZoneId,
  [Parameter(Mandatory=$false)][string]$GetupsoftComDoZoneId,
  [Parameter(Mandatory=$false)][string]$TargetHost = "ssh.getupsoft.com.do",
  [switch]$DryRun
)

$ErrorActionPreference = "Stop"

$headers = @{
  Authorization = "Bearer $ApiToken"
  "Content-Type" = "application/json"
}

function Get-ZoneId {
  param([string]$Name, [string]$Provided)
  if ($Provided) { return $Provided }
  $response = Invoke-RestMethod -Method Get -Uri "https://api.cloudflare.com/client/v4/zones?name=$Name" -Headers $headers
  if (-not $response.success -or $response.result.Count -lt 1) {
    throw "Zone not found or token has no access: $Name"
  }
  return $response.result[0].id
}

function Ensure-DnsRecord {
  param([string]$ZoneId, [string]$Name, [string]$Type, [string]$Content, [bool]$Proxied)
  Write-Host "DNS $Name $Type $Content proxied=$Proxied"
  if ($DryRun) { return }
  $existing = Invoke-RestMethod -Method Get -Uri "https://api.cloudflare.com/client/v4/zones/$ZoneId/dns_records?name=$Name&type=$Type" -Headers $headers
  $body = @{ type=$Type; name=$Name; content=$Content; proxied=$Proxied; ttl=1 } | ConvertTo-Json
  if ($existing.result.Count -gt 0) {
    Invoke-RestMethod -Method Put -Uri "https://api.cloudflare.com/client/v4/zones/$ZoneId/dns_records/$($existing.result[0].id)" -Headers $headers -Body $body | Out-Null
  } else {
    Invoke-RestMethod -Method Post -Uri "https://api.cloudflare.com/client/v4/zones/$ZoneId/dns_records" -Headers $headers -Body $body | Out-Null
  }
}

$zoneCom = Get-ZoneId "getupsoft.com" $GetupsoftComZoneId
$zoneComDo = Get-ZoneId "getupsoft.com.do" $GetupsoftComDoZoneId

# Public DNS points to the existing deployment entry host. Runtime isolation on
# ssh.getupsoft.com.do is handled by dedicated compose projects, localhost-only
# ports, and reverse-proxy/tunnel rules documented in deployment-isolation.md.
Ensure-DnsRecord $zoneCom "getupsoft.com" "CNAME" $TargetHost $true
Ensure-DnsRecord $zoneCom "www.getupsoft.com" "CNAME" $TargetHost $true
Ensure-DnsRecord $zoneCom "easycount.getupsoft.com" "CNAME" $TargetHost $true
Ensure-DnsRecord $zoneCom "admin.getupsoft.com" "CNAME" $TargetHost $true
Ensure-DnsRecord $zoneCom "api.getupsoft.com" "CNAME" $TargetHost $true

Ensure-DnsRecord $zoneComDo "getupsoft.com.do" "CNAME" $TargetHost $true
Ensure-DnsRecord $zoneComDo "www.getupsoft.com.do" "CNAME" $TargetHost $true
Ensure-DnsRecord $zoneComDo "easycount.getupsoft.com.do" "CNAME" $TargetHost $true
Ensure-DnsRecord $zoneComDo "admin.getupsoft.com.do" "CNAME" $TargetHost $true
Ensure-DnsRecord $zoneComDo "stg.getupsoft.com.do" "CNAME" $TargetHost $true
Ensure-DnsRecord $zoneComDo "odoo-int.getupsoft.com.do" "CNAME" $TargetHost $true

Write-Host "Cloudflare DNS provisioning completed."
