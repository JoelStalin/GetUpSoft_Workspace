# GetUpSoft Mail Infra

Infraestructura operativa de correo para `getupsoft.com.do`.

> **Estado:** `mailcow` fue retirado de `getupsoft-lan` y quedó deshabilitado en este repositorio. No uses los scripts `setup_mailcow.py`, `start_mailcow.py` ni `send_mailcow_test.py`.

## Contenido

- submodulo `vendor/mailcow-dockerized`
- scripts de bootstrap y arranque de Mailcow
- automatizacion DNS/mail para Cloudflare
- runbooks y plantillas de entorno

## Comandos base

Los scripts de Mailcow permanecen solo como referencia histórica y ahora fallan de forma explícita para evitar un despliegue accidental.

## Topologia

- `SMTP`, `IMAP`, `POP` y `MX` no pasan por `Cloudflare Tunnel`.
- El borde HTTP compartido puede seguir publicando producto y sitio corporativo por separado.
- Los registros `SPF`, `DKIM`, `DMARC` y el hostname `mail.getupsoft.com.do` se administran desde este repo.

Mas detalle en `docs/NETWORK_TOPOLOGY.md`.
