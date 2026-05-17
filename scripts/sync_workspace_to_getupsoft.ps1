param(
    [string]$HostAlias = "getupsoft-lan",
    [string]$RemoteRoot = "/home/ubuntu/workspaces/GetUpSoft_Workspace",
    [string]$TransferDir = "/home/ubuntu/workspaces/transfer"
)

$ErrorActionPreference = "Stop"

$workspace = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$excludeFile = Join-Path $workspace "deploy\server\transfer-excludes.txt"
ssh $HostAlias "mkdir -p $TransferDir && rm -rf $RemoteRoot && mkdir -p $RemoteRoot"

$tarCmd = "tar.exe -cf - -X `"$excludeFile`" -C `"$workspace`" ."
$sshCmd = "ssh $HostAlias `"tar -xf - -C $RemoteRoot && chmod +x $RemoteRoot/deploy/server/scripts/*.sh`""
cmd /c "$tarCmd | $sshCmd"

Write-Host "Workspace synced to ${HostAlias}:$RemoteRoot"
