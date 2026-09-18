param(
  [string]$SshHost = "ssh.getupsoft.com.do",
  [string]$SshUser = "",
  [int]$SshPort = 22,
  [string]$RemoteBaseDir = "/srv/getupsoft"
)

$ErrorActionPreference = "Stop"

$target = if ($SshUser) { "$SshUser@$SshHost" } else { $SshHost }
$sshArgs = @("-p", "$SshPort", "-o", "BatchMode=yes", "-o", "ConnectTimeout=15", $target)

$remoteScript = @'
set -eu
REMOTE_BASE_DIR="__REMOTE_BASE_DIR__"
echo "host=$(hostname)"
echo "remote_base=$REMOTE_BASE_DIR"
echo "--- docker compose projects ---"
docker compose ls 2>/dev/null || true
echo "--- reserved getupsoft ports ---"
for port in 3120 3110 3200 3210 3300 3310 3400 3410; do
  if ss -ltn 2>/dev/null | awk '{print $4}' | grep -Eq "[:.]$port$"; then
    echo "PORT_IN_USE=$port"
  else
    echo "PORT_FREE=$port"
  fi
done
echo "--- target paths ---"
for path in "$REMOTE_BASE_DIR/getupsoft-web" "$REMOTE_BASE_DIR/easycount-platform" "$REMOTE_BASE_DIR/getupsoft-odoo-integration" "$REMOTE_BASE_DIR/getupsoft-admin-portals" "$REMOTE_BASE_DIR/getupsoft-infra"; do
  if [ -e "$path" ]; then
    echo "PATH_EXISTS=$path"
  else
    echo "PATH_MISSING=$path"
  fi
done
'@

$remoteScript = $remoteScript.Replace("__REMOTE_BASE_DIR__", $RemoteBaseDir)
$remoteScript = $remoteScript.Replace("`r`n", "`n")

Write-Host "Checking deployment target $target without making changes..."
$remoteScript | ssh @sshArgs "tr -d '\r' | sh -s"
