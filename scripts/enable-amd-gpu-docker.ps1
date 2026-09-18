[CmdletBinding()]
param(
    [switch]$StartOllama,
    [switch]$Strict
)

$ErrorActionPreference = 'Stop'

function Fail([string]$Message) {
    if ($Strict) { throw $Message }
    Write-Warning $Message
}

Write-Host '== AMD/WSL2/Docker GPU probe ==' -ForegroundColor Cyan
$gpu = Get-CimInstance Win32_VideoController | Where-Object { $_.Name -match 'AMD|Radeon' } | Select-Object -First 1
if (-not $gpu) { Fail 'No se detectó una GPU AMD/Radeon.' }
else { Write-Host ("GPU: {0} | Driver: {1}" -f $gpu.Name,$gpu.DriverVersion) }

$dockerOs = docker info --format '{{.OperatingSystem}}' 2>$null
if ($LASTEXITCODE -ne 0) { throw 'Docker Desktop no está disponible. Inícialo y vuelve a ejecutar el script.' }
Write-Host "Docker: $dockerOs"

$wslDxg = wsl -d Ubuntu -- bash -lc "test -e /dev/dxg && echo yes || echo no" 2>$null
if ($wslDxg -notmatch 'yes') { Fail 'WSL2 no expone /dev/dxg; la GPU no está disponible para workloads Linux.' }
else { Write-Host 'WSL2: /dev/dxg visible' -ForegroundColor Green }

$containerProbe = docker run --rm --entrypoint sh ollama/ollama:latest -lc 'if test -e /dev/dxg; then echo dxg; elif test -e /dev/dri; then echo dri; else echo none; fi' 2>$null
if ($containerProbe -notmatch 'dxg|dri') {
    Write-Warning 'Docker Linux no expone ningún dispositivo GPU al contenedor.'
    Write-Host 'Modo seguro: CPU fallback. No se aplica gpus: all porque esta PC no tiene NVIDIA/CUDA.' -ForegroundColor Yellow
    if ($StartOllama) { docker start ollama-server | Out-Null; Write-Host 'ollama-server iniciado en modo CPU.' }
    exit 0
}

Write-Host "Docker GPU device: $containerProbe" -ForegroundColor Green
if ($StartOllama) {
    docker start ollama-server | Out-Null
    Write-Host 'ollama-server iniciado con dispositivo GPU visible.'
}
Write-Host 'Probe completado.' -ForegroundColor Green
