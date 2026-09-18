# GetUpSoft Corporate Site

Sitio corporativo standalone para `www.getupsoft.com.do`.

## Comandos

```bash
pnpm install
pnpm dev
pnpm build
pnpm preview:edge
```

## Topologia

- Este repo no depende del monorepo `EasyCounting`.
- En modo local compartido debe publicar el sitio en `127.0.0.1:18085`.
- El apex `getupsoft.com.do` puede resolverse con redirect externo o con el redirect service del edge compartido.

## Integracion con el edge compartido

1. Levanta el producto desde `EasyCounting`.
2. Levanta este repo con `pnpm preview:edge`.
3. Mantiene `cloudflared` y `nginx` en el host compartido para enrutar `www.getupsoft.com.do` hacia `127.0.0.1:18085`.
