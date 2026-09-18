param(
    [string]$TaskName = "GetUpSoft Claude Watchdog",
    [string]$WorkspaceRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
)

$ErrorActionPreference = "Stop"

$workspaceRoot = (Resolve-Path -LiteralPath $WorkspaceRoot).Path
$watchdogScript = Join-Path $workspaceRoot "scripts\claude_project_watchdog.ps1"

if (-not (Test-Path -LiteralPath $watchdogScript)) {
    throw "No existe el watchdog: $watchdogScript"
}

$powershell = "$env:SystemRoot\System32\WindowsPowerShell\v1.0\powershell.exe"
$argument = "-NoProfile -ExecutionPolicy Bypass -File `"$watchdogScript`" -WorkspaceRoot `"$workspaceRoot`""

$action = New-ScheduledTaskAction -Execute $powershell -Argument $argument -WorkingDirectory $workspaceRoot
$trigger = New-ScheduledTaskTrigger -AtLogOn
$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -RestartCount 3 -RestartInterval (New-TimeSpan -Minutes 1)
$principal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -LogonType Interactive -RunLevel Limited

Register-ScheduledTask -TaskName $TaskName -Action $action -Trigger $trigger -Settings $settings -Principal $principal -Force | Out-Null
Start-ScheduledTask -TaskName $TaskName

Write-Host "Tarea programada instalada y arrancada: $TaskName"
Write-Host "Workspace: $workspaceRoot"
Write-Host "Script: $watchdogScript"
