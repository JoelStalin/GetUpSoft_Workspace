param(
    [string]$HostAlias = "ssh.getupsoft.com.do",
    [string]$RemoteArchive = "/tmp/getupsoft-orca.tar.gz",
    [string]$RemoteAppDir = "/opt/getupsoft-orca",
    [int]$Port = 8787,
    [string]$ServiceName = "getupsoft-orca"
)

$ErrorActionPreference = "Stop"

$artifactDir = Join-Path $PSScriptRoot "..\\.artifacts"
New-Item -ItemType Directory -Force -Path $artifactDir | Out-Null
$archivePath = Join-Path $artifactDir "getupsoft-orca.tar.gz"

if (Test-Path $archivePath) {
    Remove-Item -LiteralPath $archivePath -Force
}

git archive --format=tar.gz --output=$archivePath --prefix=getupsoft-orca/ HEAD
scp $archivePath "${HostAlias}:${RemoteArchive}"
ssh $HostAlias "mkdir -p ~/orca_upload"
scp "$PSScriptRoot/../deploy/install_orca_service.sh" "${HostAlias}:~/orca_upload/install_orca_service.sh"
ssh $HostAlias "chmod +x ~/orca_upload/install_orca_service.sh && ~/orca_upload/install_orca_service.sh '$RemoteArchive' '$RemoteAppDir' '$Port' '$ServiceName'"
ssh $HostAlias "systemctl status ${ServiceName}.service --no-pager --lines=20"
