param(
    [Parameter(ValueFromRemainingArguments = $true)]
    [string[]]$Args
)

$ErrorActionPreference = "Stop"

$workspace = Split-Path -Parent $PSScriptRoot
$packageRoot = Join-Path $workspace "libs\traffic_control"
$env:PYTHONPATH = if ($env:PYTHONPATH) { "$packageRoot;$env:PYTHONPATH" } else { $packageRoot }

python -m traffic_control.cli @Args
