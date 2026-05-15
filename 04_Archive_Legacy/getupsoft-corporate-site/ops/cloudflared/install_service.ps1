param(
    [string]$ConfigFile = "getupsoft-site.local.yml",
    [string]$CredentialFile = ""
)

$ErrorActionPreference = "Stop"

$serviceConfigPath = "C:\Windows\System32\config\systemprofile\.cloudflared"
if (-not (Test-Path $serviceConfigPath)) {
    New-Item -ItemType Directory -Force -Path $serviceConfigPath | Out-Null
}

$configPath = Join-Path $PSScriptRoot $ConfigFile
if (-not (Test-Path $configPath)) {
    throw "No se encontro el archivo de configuracion: $configPath"
}

if ([string]::IsNullOrWhiteSpace($CredentialFile)) {
    throw "Debes indicar la ruta al archivo de credenciales del tunnel con -CredentialFile"
}

Copy-Item $configPath "$serviceConfigPath\config.yml" -Force
Copy-Item $CredentialFile "$serviceConfigPath\" -Force

Get-Process -Name cloudflared -ErrorAction SilentlyContinue | Stop-Process -Force
cloudflared service install
Start-Service cloudflared
