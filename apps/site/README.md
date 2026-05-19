# GetUpSoft Corporate Site

Sitio corporativo standalone para `getupsoft.com` y `getupsoft.com.do`.

## Comandos

```bash
pnpm install
pnpm dev
pnpm build
pnpm preview:edge
docker compose -p getupsoft-web-prod -f docker-compose.prod.yml up -d --build
```

## Topologia

- Este repo no depende del monorepo `EasyCounting`.
- En el host compartido debe publicar el sitio en `127.0.0.1:3120`.
- El router compartido de nginx debe enviar `getupsoft.com` y `getupsoft.com.do` al servicio local de este repo.
- El mismo frontend puede atender `chatbot.getupsoft.com`; cuando detecta ese hostname muestra el portal comercial del chatbot como homepage.

## Runtime de produccion

- Imagen multi-stage `node:20-alpine` -> `nginx:alpine`.
- SPA fallback por `try_files ... /index.html`.
- Healthcheck HTTP en `/healthz`.

## Subdominio chatbot

- Ruta directa en el sitio: `/chatbot`
- Host dedicado: `chatbot.getupsoft.com`
- Guia operativa Cloudflare: `ops/cloudflare/chatbot-subdomain.md`
# Test deployment Mon May 18 20:25:33 SAWST 2026
