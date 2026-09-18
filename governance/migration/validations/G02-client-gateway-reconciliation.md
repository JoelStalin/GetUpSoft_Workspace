# G02: Reconciliacion de fuente del Client Gateway

**Fecha:** 2026-09-09
**Task:** G02 (depende de G01)

## Hallazgo

Existian tres copias relacionadas con "orca-client-gateway" en el workspace, ninguna por
si sola era la fuente completa:

| Ubicacion | Contenido real | Utilizable como fuente |
|---|---|---|
| `apps/orca-client-gateway/apps/{api,cli,client-desktop}/` | Solo `dist/` (compilado) y `node_modules/`. Sin `src/`, sin `package.json`. | No — build output, no fuente. |
| `.canonical-getupsoft/apps/orca-client-gateway/` | Solo `docs/`, `scripts/`, `README.md`. Cero archivos `.ts`. | No — documentacion, no codigo. |
| `orca-client-gateway-deploy.tar.gz` (raiz del workspace, 10MB, 23-may) | Monorepo pnpm/turbo completo: `apps/{api,cli,client-desktop}/src`, `packages/{config,contracts,crypto,logger}/src`, `prisma/schema.prisma`, tests e2e reales (`auth`, `deploy`, `easycount`, `gateway`, `n8n`, `orca`). 174 archivos de fuente real (excluyendo `node_modules`/`dist` de las 553 entradas totales del tarball). | **Si — esta es la fuente real.** |

## Accion tomada

Se extrajo del tarball SOLO el contenido de fuente (excluyendo `node_modules/`, `dist/`,
`dist-packager/`) hacia `platform/client-gateway/` — ruta destino que ya definia el diseno
original (seccion 2.1). Verificado: 74 archivos `.ts` reales, `package.json` valido
(`@getupsoft/orca-client-gateway`, pnpm workspace + turbo), incluye tests e2e de
`easycount` (relevante para la integracion EasyCount+Stripe+Odoo19 pendiente).

**No se toco ni se borro nada existente:** `apps/orca-client-gateway/` (dist-only) y
`.canonical-getupsoft/apps/orca-client-gateway/` (docs-only) quedan intactos hasta que se
verifique que `platform/client-gateway/` compila y pasa sus propias pruebas — recien
entonces se decide (en una tarea posterior, con confirmacion) si esas copias se retiran.

## Pendiente (fuera de alcance de G02)

- `platform/client-gateway/` todavia no es un checkout Git independiente (no tiene
  `.git` propio) — la definicion como repositorio separado con su remoto es una decision
  posterior (podria seguir viviendo dentro del workspace corporativo, o separarse; el
  diseno original asume "repositorio independiente" pero eso no estaba definido en ningun
  remoto real encontrado durante G01/G02).
- No se ejecuto `pnpm install` ni build — eso corresponde a B01/A01 (bootstrap +
  reconciliacion de modulos), que requieren antes tener el CLI del bootstrap funcionando.
- El tarball original (`orca-client-gateway-deploy.tar.gz`) se preserva en la raiz sin
  tocar, como respaldo de procedencia.
