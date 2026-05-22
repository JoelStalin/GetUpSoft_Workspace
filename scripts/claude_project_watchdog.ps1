param(
    [string]$WorkspaceRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path,
    [string]$ClaudeCommand = "claude",
    [string[]]$ClaudeArgs = @(),
    [int]$CheckEverySeconds = 15,
    [string]$LogPath = (Join-Path (Resolve-Path (Join-Path $PSScriptRoot "..")).Path ".claude\claude_project_watchdog.log"),
    [switch]$Once
)

$ErrorActionPreference = "Stop"

$workspaceRoot = (Resolve-Path -LiteralPath $WorkspaceRoot).Path
$evidenceDir = Join-Path $workspaceRoot ".claude\evidence"
$qaPromptPath = Join-Path $workspaceRoot ".claude\QA_EVIDENCE_REQUIRED.md"

New-Item -ItemType Directory -Force -Path (Split-Path -Parent $LogPath) | Out-Null
New-Item -ItemType Directory -Force -Path $evidenceDir | Out-Null

$qaMessage = @"
# QA evidence required for GetUpSoft_Workspace

Before stopping, closing, or marking work as complete in this workspace:

- State only QA tests that were actually executed.
- State only functional tests that were actually executed.
- Reference real physical evidence files when they exist, such as videos or screenshots in:
  $evidenceDir
- Do not invent evidence.
- Do not generate fake screenshots or videos.
- Do not claim tests were run if they were not run.
- If there is no real physical evidence, say that explicitly.
"@

Set-Content -LiteralPath $qaPromptPath -Value $qaMessage -Encoding UTF8

function Write-WatchdogLog {
    param([string]$Message)

    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Add-Content -LiteralPath $LogPath -Value "[$timestamp] $Message"
}

function Get-ClaudeWorkspaceProcess {
    $escapedWorkspace = [Regex]::Escape($workspaceRoot)
    $candidates = Get-CimInstance Win32_Process |
        Where-Object {
            $_.Name -match "claude|node|electron" -and
            $_.CommandLine -and
            $_.CommandLine -match $escapedWorkspace
        }

    return $candidates
}

function Start-ClaudeForWorkspace {
    $arguments = @()

    if ($ClaudeArgs.Count -gt 0) {
        $arguments += $ClaudeArgs
    }

    Write-WatchdogLog "Claude no esta activo para workspace '$workspaceRoot'. Prompt QA: '$qaPromptPath'. Evidencias: '$evidenceDir'."

    if ($arguments.Count -gt 0) {
        Start-Process -FilePath $ClaudeCommand -ArgumentList $arguments -WorkingDirectory $workspaceRoot
        return
    }

    Start-Process -FilePath $ClaudeCommand -WorkingDirectory $workspaceRoot
}

Write-WatchdogLog "Watchdog iniciado para '$workspaceRoot'. CheckEverySeconds=$CheckEverySeconds."
Write-Host "Watchdog GetUpSoft activo"
Write-Host "Workspace: $workspaceRoot"
Write-Host "Log: $LogPath"
Write-Host "Prompt QA: $qaPromptPath"
Write-Host "Evidencias reales: $evidenceDir"

do {
    $running = Get-ClaudeWorkspaceProcess

    if (-not $running) {
        Start-ClaudeForWorkspace
    }
    else {
        $ids = ($running | Select-Object -ExpandProperty ProcessId) -join ","
        Write-WatchdogLog "Claude activo para este workspace. PIDs=$ids."
    }

    if ($Once) {
        break
    }

    Start-Sleep -Seconds $CheckEverySeconds
} while ($true)
