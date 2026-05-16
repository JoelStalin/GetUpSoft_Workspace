param(
  [string]$VenvPath = ".venv-scrapling"
)

$ErrorActionPreference = "Stop"

python -m venv $VenvPath
$pythonExe = Join-Path $VenvPath "Scripts\\python.exe"

& $pythonExe -m pip install "scrapling[fetchers]"
& $pythonExe -m playwright install chromium

Write-Host "Scrapling environment ready at $VenvPath"
