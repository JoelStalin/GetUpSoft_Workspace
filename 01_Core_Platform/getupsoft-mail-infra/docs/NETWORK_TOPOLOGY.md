# Network Topology

## Objetivo

Permitir que producto, sitio corporativo y correo convivan en el mismo dominio sin vivir en el mismo repositorio.

## Flujo recomendado

1. `cloudflared` publica solo trafico `HTTP/HTTPS`.
2. `nginx` compartido enruta `api/admin/cliente/socios/www`.
3. El correo usa rutas directas:
   - `mail.getupsoft.com.do`
   - `MX`
   - `SPF`
   - `DKIM`
   - `DMARC`

## Regla principal

No intentes pasar `SMTP`, `IMAP`, `POP` o `MX` por el tunnel HTTP de Cloudflare. Mailcow debe exponerse con DNS y puertos propios, o mediante otro reverse proxy apto para protocolos de correo.
