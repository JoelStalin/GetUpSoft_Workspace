param(
    [string]$TaskName = "GetUpSoft Claude Watchdog"
)

$ErrorActionPreference = "Stop"

$task = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
if ($null -eq $task) {
    Write-Host "No existe la tarea programada: $TaskName"
    return
}

Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
Write-Host "Tarea programada eliminada: $TaskName"
