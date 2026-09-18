# Traffic Control

Herramienta reutilizable para inventario y monitoreo defensivo de trafico web en objetivos autorizados.

## Uso rapido

1. Copia la configuracion de ejemplo:

```powershell
Copy-Item .\libs\traffic_control\config.example.yml .\traffic-control.yml
```

2. Agrega tus dominios o IPs propias en `allowed_targets`.

3. Ejecuta desde cualquier proyecto del workspace:

```powershell
.\scripts\traffic_control.ps1 scan --target ejemplo.com --config .\traffic-control.yml
.\scripts\traffic_control.ps1 logs --file .\access.log --config .\traffic-control.yml
.\scripts\traffic_control.ps1 capture --target ejemplo.com --interface Ethernet --seconds 60 --config .\traffic-control.yml
.\scripts\traffic_control.ps1 web-audit --url https://ejemplo.com --config .\traffic-control.yml
.\scripts\traffic_control.ps1 manual-web-audit --url https://ejemplo.com --config .\traffic-control.yml
```

## Modos

- `scan`: ejecuta `nmap` contra un dominio/IP permitido.
- `logs`: resume logs HTTP tipo Nginx/Apache.
- `capture`: ejecuta `tshark` contra un host permitido en una interfaz local.
- `web-audit`: abre una pagina con Chromium/Playwright y genera un ZIP con requests, dominios, scripts externos y posibles servicios no esperados.
- `manual-web-audit`: abre Chromium visible para que una persona autentique y navegue; guarda solo metadatos de red sanitizados.
- `resolve`: muestra las IPs resueltas para un dominio permitido.

## Seguridad

La herramienta no ejecuta capturas ni scans si el target no esta en `allowed_targets`.
No intenta romper HTTPS ni capturar credenciales. Para contenido HTTP de aplicacion, usa logs del servidor o instrumentacion propia.
