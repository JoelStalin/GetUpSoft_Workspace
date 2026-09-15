# Migra el perfil Default de Chrome a una copia dedicada para automatizacion.
# No cierra Chrome: copia con robocopy y omite archivos bloqueados y caches.
param(
  [string]$Source = "$env:LOCALAPPDATA\Google\Chrome\User Data",
  [string]$Dest   = "$PSScriptRoot\..\apps\orca\chrome_profile\careerai-migrated",
  [string]$Profile = "Default"
)

$ErrorActionPreference = 'Stop'
New-Item -ItemType Directory -Force -Path $Dest | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $Dest $Profile) | Out-Null

# Local State guarda la clave que descifra las cookies: es obligatorio.
Copy-Item (Join-Path $Source 'Local State') (Join-Path $Dest 'Local State') -Force -ErrorAction SilentlyContinue

$excludeDirs = @('Cache','Code Cache','GPUCache','Service Worker','GrShaderCache','ShaderCache','DawnCache','component_crx_cache','extensions_crx_cache','Crashpad')
$args = @(
  (Join-Path $Source $Profile), (Join-Path $Dest $Profile),
  '/E','/R:0','/W:0','/NFL','/NDL','/NJH','/NJS','/NP','/XJ'
)
$args += '/XD'; $args += $excludeDirs

robocopy @args | Out-Null
# robocopy devuelve <8 en exito (0-7 son estados normales de copia)
if ($LASTEXITCODE -ge 8) { throw "robocopy fallo con codigo $LASTEXITCODE" }

$cookies = Join-Path $Dest "$Profile\Network\Cookies"
[pscustomobject]@{
  ok            = $true
  dest          = (Resolve-Path $Dest).Path
  profile       = $Profile
  cookies_found = (Test-Path $cookies)
  cookies_kb    = if (Test-Path $cookies) { [math]::Round((Get-Item $cookies).Length / 1KB) } else { 0 }
  local_state   = (Test-Path (Join-Path $Dest 'Local State'))
} | ConvertTo-Json -Compress
