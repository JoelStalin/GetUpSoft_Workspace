# chatbot.getupsoft.com

## Objetivo

Publicar el portal de onboarding comercial del chatbot en `chatbot.getupsoft.com` usando el mismo frontend de `getupsoft-site`, con comportamiento de homepage especifico por hostname.

## Opcion recomendada: Cloudflare Pages

1. Desplegar `getupsoft-site` en Cloudflare Pages.
2. Agregar `chatbot.getupsoft.com` como **Custom domain** del mismo proyecto.
3. Mantener `getupsoft.com` y `www.getupsoft.com` en el sitio corporativo principal.
4. El frontend detecta `chatbot.*` y renderiza directamente el portal chatbot en `/`.

## DNS

- Tipo: `CNAME`
- Nombre: `chatbot`
- Destino: `<pages-project>.pages.dev`
- Proxy status: `Proxied`

Si se usa un origin propio en lugar de Pages:

- Tipo: `CNAME` o `A` segun el host
- Nombre: `chatbot`
- Destino: origin asignado
- SSL/TLS: `Full (strict)`

## Cloudflare

- Activar Always Use HTTPS.
- Mantener caché estandar para assets.
- No cachear respuestas API sensibles del portal cuando se agregue backend.
- Si el backend vive aparte, crear `api.chatbot.getupsoft.com` con reglas CORS explicitas.

## Backend pendiente

Este commit deja lista la superficie frontend. Aun falta conectar:

- autenticacion de clientes;
- almacenamiento de consentimientos y permisos;
- billing real;
- webhooks de WhatsApp, Telegram y SMS;
- estado real de canales y credenciales.
