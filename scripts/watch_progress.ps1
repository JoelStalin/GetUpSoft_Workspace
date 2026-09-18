<#
.SYNOPSIS
  Panel de solo lectura que muestra en vivo el progreso del agente sobre el repo:
  rama, ultimo commit, git status, resumen de diffs, cola de CHANGE_TIMELINE.md y
  los commits nuevos desde que arranco este watcher.

.DESCRIPTION
  No modifica nada del repositorio: solo ejecuta comandos de lectura de git y lee
  archivos de texto. Pensado para dejarlo abierto en una ventana de PowerShell
  aparte mientras el agente trabaja en otra sesion/terminal.

.PARAMETER IntervalSeconds
  Segundos entre refrescos. Por defecto 3.

.EXAMPLE
  powershell -NoExit -ExecutionPolicy Bypass -File scripts\watch_progress.ps1
#>

param(
  [int]$IntervalSeconds = 3
)

$ErrorActionPreference = 'SilentlyContinue'

# Repo root = carpeta padre de scripts\, resuelto desde la ubicacion de este archivo,
# asi funciona sin importar desde donde se invoque.
$RepoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $RepoRoot

function Write-Section($title) {
  Write-Host ""
  Write-Host "-- $title " -ForegroundColor Cyan -NoNewline
  Write-Host ("-" * [Math]::Max(1, 70 - $title.Length)) -ForegroundColor DarkCyan
}

# Commit HEAD al arrancar el watcher, para poder listar solo los commits nuevos.
$startHead = git rev-parse HEAD 2>$null
$startTime = Get-Date

while ($true) {
  Clear-Host

  $now = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
  Write-Host "CareerAI / ORCA - panel de progreso (solo lectura)" -ForegroundColor Yellow
  Write-Host "Actualizado: $now   |   refresco cada ${IntervalSeconds}s   |   Ctrl+C para salir" -ForegroundColor DarkGray

  # --- rama y ultimo commit ------------------------------------------------
  Write-Section "Rama y ultimo commit"
  $branch = git rev-parse --abbrev-ref HEAD 2>$null
  $lastCommit = git log -1 --pretty=format:"%h  %ad  %s" --date=format:'%Y-%m-%d %H:%M:%S' 2>$null
  Write-Host "Rama: " -NoNewline; Write-Host $branch -ForegroundColor Green
  Write-Host "Ultimo commit: " -NoNewline; Write-Host $lastCommit -ForegroundColor White

  # --- git status -----------------------------------------------------------
  Write-Section "git status --short"
  $status = git status --short 2>$null
  if ([string]::IsNullOrWhiteSpace($status)) {
    Write-Host "  (working tree limpio)" -ForegroundColor DarkGray
  } else {
    foreach ($line in $status -split "`n") {
      if (-not $line) { continue }
      $code = $line.Substring(0, [Math]::Min(2, $line.Length))
      $color = switch -Regex ($code) {
        '^\?\?' { 'DarkGray' }
        '^A ' { 'Green' }
        '^M ' { 'Green' }
        '^ M' { 'Yellow' }
        '^D ' { 'Red' }
        default { 'White' }
      }
      Write-Host "  $line" -ForegroundColor $color
    }
  }

  # --- resumen de diffs -------------------------------------------------------
  Write-Section "git diff --stat (sin stage)"
  $diff = git diff --stat 2>$null
  if ([string]::IsNullOrWhiteSpace($diff)) {
    Write-Host "  (sin cambios sin stage)" -ForegroundColor DarkGray
  } else {
    Write-Host "  $($diff -replace "`n", "`n  ")" -ForegroundColor White
  }

  Write-Section "git diff --staged --stat"
  $diffStaged = git diff --staged --stat 2>$null
  if ([string]::IsNullOrWhiteSpace($diffStaged)) {
    Write-Host "  (nada en stage)" -ForegroundColor DarkGray
  } else {
    Write-Host "  $($diffStaged -replace "`n", "`n  ")" -ForegroundColor White
  }

  # --- commits nuevos desde que arranco el watcher ---------------------------
  Write-Section "Commits nuevos desde que abriste este panel ($($startTime.ToString('HH:mm:ss')))"
  if ($startHead) {
    $newCommits = git log "$startHead..HEAD" --pretty=format:"%h  %ad  %s" --date=format:'%Y-%m-%d %H:%M:%S' 2>$null
    if ([string]::IsNullOrWhiteSpace($newCommits)) {
      Write-Host "  (ninguno todavia)" -ForegroundColor DarkGray
    } else {
      foreach ($line in $newCommits -split "`n") {
        Write-Host "  + $line" -ForegroundColor Green
      }
    }
  } else {
    Write-Host "  (no se pudo resolver el commit inicial)" -ForegroundColor DarkGray
  }

  # --- cola de CHANGE_TIMELINE.md ---------------------------------------------
  Write-Section "CHANGE_TIMELINE.md (ultimas 15 lineas)"
  $timelinePath = Join-Path $RepoRoot 'CHANGE_TIMELINE.md'
  if (Test-Path $timelinePath) {
    Get-Content -Path $timelinePath -Tail 15 | ForEach-Object { Write-Host "  $_" -ForegroundColor White }
  } else {
    Write-Host "  (CHANGE_TIMELINE.md no encontrado)" -ForegroundColor DarkGray
  }

  Write-Host ""
  Write-Host ("=" * 78) -ForegroundColor DarkCyan

  Start-Sleep -Seconds $IntervalSeconds
}
