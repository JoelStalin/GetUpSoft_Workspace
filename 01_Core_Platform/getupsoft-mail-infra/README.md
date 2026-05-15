# GetUpSoft Mail Infra

Infraestructura operativa de correo para `getupsoft.com.do`.

## Contenido

- submodulo `vendor/mailcow-dockerized`
- scripts de bootstrap y arranque de Mailcow
- automatizacion DNS/mail para Cloudflare
- runbooks y plantillas de entorno

## Comandos base

```bash
git submodule update --init --recursive
python setup_mailcow.py
python start_mailcow.py
python send_mailcow_test.py
```

## Topologia

- `SMTP`, `IMAP`, `POP` y `MX` no pasan por `Cloudflare Tunnel`.
- El borde HTTP compartido puede seguir publicando producto y sitio corporativo por separado.
- Los registros `SPF`, `DKIM`, `DMARC` y el hostname `mail.getupsoft.com.do` se administran desde este repo.

Mas detalle en `docs/NETWORK_TOPOLOGY.md`.
