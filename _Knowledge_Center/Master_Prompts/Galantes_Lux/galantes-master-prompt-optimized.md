# Master Prompt — Galante's Jewelry Integration
> Versión optimizada para bajo consumo de créditos y ejecución paralela.

---

## REGLAS GLOBALES (aplican a TODOS los agentes)
> Leer antes de cualquier acción. No repetir en respuestas.

1. **Antes de actuar**, leer en este orden: `docs/agent-state.md` → `docs/handoff.md`.
2. **Trabajar sólo en los archivos permitidos** de tu workstream. Ver sección 4.
3. **No replantear el proyecto desde cero** si ya existen archivos de estado.
4. **Una decisión, no opciones infinitas.** Elige y justifica en una línea.
5. **Respuestas compactas.** Sin repetir contexto ya escrito en docs.
6. **Actualizar `docs/agent-state.md`** al terminar cada tarea importante y antes de detenerte.
7. **No inventes capacidades de API.** Si algo no existe, documéntalo honestamente.

---

## 1. Contexto del proyecto

### Stack actual (verificar en repo)
- Next.js 16 App Router · React 19 · TypeScript · Tailwind CSS v4
- Auth: JWT con `jose` · Imágenes: `sharp`
- CMS: `data/cms.json` + `data/blobs`
- Docker · Nginx · Cloudflare Tunnel opcional
- Admin panel autenticado existente
- Tests: Vitest · Playwright · Pytest/Selenium

### Restricción estructural
**No reescribir el sitio actual.** Evolucionarlo conservando lo que funciona.

### Arquitectura objetivo
| Dominio | Propósito |
|---|---|
| `galantesjewelry.com` | Sitio principal actual (branding, SEO, marketing) |
| `shop.galantesjewelry.com` | Tienda pública — Odoo Website/eCommerce |
| `odoo.galantesjewelry.com` | Backend Odoo (admin, catálogo, pedidos, stock) |

**Odoo = fuente de verdad** para productos, precios, stock, clientes y pedidos.  
**Next.js actual** = branding, contenido editorial, landing hacia la tienda.

### Checkout
MVP: Odoo Website/eCommerce nativo → redirección desde Next.js. **No construir checkout custom en Next.js.**

### Referencias Odoo (solo estructural, no copiar verbatim)
- `C:\Users\yoeli\Documents\cell_odoo`
- `C:\Users\yoeli\Documents\jabiya_test\jabiyaprod`

Inspirarse en: estructura de addons, flujos, vistas, naming. **No clonar código enterprise.**

---

## 2. Contrato mínimo de producto (ShopProduct)

```ts
export type ShopProduct = {
  id: string;           slug: string;         name: string
  shortDescription?: string;                  longDescription?: string
  price: number;        currency: string
  availability: 'in_stock' | 'out_of_stock' | 'preorder'
  imageUrl?: string;    gallery?: string[]
  sku?: string;         material?: string;    category?: string
  buyUrl: string;       publicUrl?: string
}
```

---

## 3. Variables de entorno — agregar a `.env.example`

```env
# Odoo
ODOO_BASE_URL=           ODOO_PUBLIC_SHOP_URL=    ODOO_DB=
ODOO_USERNAME=           ODOO_PASSWORD=           ODOO_API_KEY=
ODOO_WEBSITE_ID=         ODOO_COMPANY_ID=

# Meta
META_APP_ID=             META_APP_SECRET=         META_ACCESS_TOKEN=
META_CATALOG_ID=         META_VERIFY_TOKEN=       FACEBOOK_PAGE_ID=
INSTAGRAM_BUSINESS_ACCOUNT_ID=                    WHATSAPP_BUSINESS_ACCOUNT_ID=

# Dominios
SITE_URL=https://galantesjewelry.com
SHOP_URL=https://shop.galantesjewelry.com
ODOO_URL=https://odoo.galantesjewelry.com
```

---

## 4. Workstreams y scopes

> Cada agente trabaja **solo en su rama** y **solo en sus archivos**.

### WS-A · Arquitectura & Estado
**Rama:** `orchestrator/state-docs`  
**Archivos permitidos:** `docs/*`  
**Archivos prohibidos:** `app/*` · `components/*` · `lib/*` · `infra/*` · `odoo/*`

**Responsabilidades:** auditar repo · definir arquitectura · crear timeline · registrar decisiones/blockers · mantener handoff.

**Entregables obligatorios:**
- `docs/agent-state.md` (formato §5)
- `docs/timeline.md`
- `docs/shop-integration-plan.md`
- `docs/handoff.md`
- `docs/implementation-log.md`

---

### WS-B · Odoo Backend
**Rama:** `odoo/foundation-galante`  
**Archivos permitidos:** `odoo/*` · `odoo/custom_addons/*` · `odoo/docker/*` · `integration-contracts/*` · `docs/*` (solo estado de este WS)  
**Archivos prohibidos:** `app/shop/*` · `components/shop/*` · `lib/integrations/*` · `infra/*`

**Responsabilidades:** crear proyecto Odoo · custom addons para Galante · modelo de producto (joyería) · website/ecommerce base · stock/disponibilidad · contrato de datos para Next.js.

**Entregables obligatorios:**
- Estructura `odoo/`
- `integration-contracts/shop-product.ts`
- `odoo/README.md` con pasos de instalación
- Lista de env vars necesarias
- Estado actualizado en `docs/`

---

### WS-C · Frontend Next.js
**Rama:** `frontend/shop-integration`  
**Archivos permitidos:** `app/shop/*` · `components/shop/*` · `lib/odoo/*` · `lib/shop/*` · `docs/*` (solo notas frontend)  
**Archivos prohibidos:** `odoo/*` · `infra/*` · `lib/integrations/*`

**Prerequisito:** esperar contrato mínimo de WS-B (`integration-contracts/shop-product.ts`).

**Responsabilidades:** crear `/shop` y `/shop/[slug]` · consumir catálogo desde Odoo · CTA hacia compra real en Odoo · conservar diseño y branding · loading/error/empty states · responsive · TS fuerte.

**No construir checkout propio.**

---

### WS-D · Meta / Facebook / Instagram / WhatsApp
**Rama:** `meta/catalog-sync`  
**Archivos permitidos:** `lib/integrations/*` · `app/api/integrations/*` · `docs/meta-*`  
**Archivos prohibidos:** `odoo/*` · `app/shop/*` · `infra/*`

**Prerequisito:** esperar que WS-B defina modelo de publicación/catálogo.

**Responsabilidades:** sync a Meta Catalog · Facebook Shop / Instagram Shopping (si aplica) · catálogo WhatsApp Business (si aplica) · trigger seguro (webhook/cron/manual) · **documentar honestamente los límites reales de cada API**.

> WhatsApp no tiene equivalente a "post orgánico de producto". Modelar como catálogo + mensajes de producto + conversación.

---

### WS-E · DevOps / Dominios / Proxy
**Rama:** `devops/domains-proxy`  
**Archivos permitidos:** `infra/*` · `docker-compose*.yml` · `.env.example` · `deploy/*` · `docs/deployment*`  
**Archivos prohibidos:** `odoo/custom_addons/*` · `app/shop/*` · `lib/integrations/*`

**Responsabilidades:** Nginx/reverse proxy · Docker Compose · networking entre servicios · SSL · subdominios · no romper el sitio actual.

**Entregables:** propuesta de despliegue · `docker-compose` actualizado · config Nginx para los 3 dominios · checklist de despliegue · notas de seguridad.

---

## 5. Formato obligatorio: `docs/agent-state.md`

```md
# Agent State

## Status
PROJECT_PHASE: <AUDIT|PLAN|IMPLEMENTATION|VALIDATION|HANDOFF>
CURRENT_SPRINT: <S0–S5>
CURRENT_TASK_ID / TITLE: <id> — <título>
STATUS: <NOT_STARTED|IN_PROGRESS|BLOCKED|DONE>
LAST_COMPLETED: <id> — <título>
NEXT_TASK: <id> — <título>
BLOCKERS: <lista o none>

## Changes
DECISIONS: <resumen corto>
FILES_CREATED: <lista>
FILES_MODIFIED: <lista>
FILES_PENDING: <lista>
ENV_VARS_ADDED: <lista>

## Health
TEST_STATUS: <not run|partial|passing|failing>
BUILD_STATUS: <unknown|passing|failing>
DOCKER_STATUS: <unknown|passing|failing>

## Integrations
ODOO: <not started|partial|complete>
SHOP_PAGES: <not started|partial|complete>
META_CATALOG: <not started|partial|complete>
FACEBOOK_POSTING: <not started|partial|complete>
INSTAGRAM_PUBLISHING: <not started|partial|complete>
WHATSAPP_CATALOG: <not started|partial|complete>

## Resume
RISKS: <lista corta>
RESUME_INSTRUCTIONS: <acción exacta al retomar>
```

**Cuándo actualizar:** al iniciar sesión · al completar tarea · antes de un cambio grande · antes de detenerse · ante un bloqueo.

---

## 6. Formato obligatorio: `docs/implementation-log.md`

```md
## Session X - Step Y
- Goal:
- Actions:
- Files changed:
- Outcome:
- Errors / blockers:
- Next step:
```

Append-only. Nunca borrar entradas anteriores.

---

## 7. Formato obligatorio: `docs/handoff.md`

Responder estas preguntas con precisión:
- ¿Qué se completó?
- ¿Qué falta / está a medias?
- ¿Cuál es la siguiente tarea exacta (NEXT_TASK_ID)?
- ¿Qué archivos leer primero?
- ¿Qué comandos ejecutar?
- ¿Qué riesgos existen?
- ¿Qué decisiones NO revertir sin revisión?

---

## 8. Sprints

### S0 — Auditoría y diseño *(WS-A + WS-E en paralelo)*
| ID | Tarea |
|---|---|
| S0-T01 | Inspeccionar estructura del repo actual |
| S0-T02 | Identificar rutas públicas, admin y CMS |
| S0-T03 | Matriz reuse vs replace |
| S0-T04 | Determinar arquitectura MVP y decisión de checkout |
| S0-T05 | Definir dominios y subdominios |
| S0-T06–T09 | Crear `shop-integration-plan.md` · `agent-state.md` · `timeline.md` · `handoff.md` |

**Exit:** arquitectura documentada · decisión checkout · handoff inicial listo.

### S1 — Fundación Odoo *(WS-B)*
| ID | Tarea |
|---|---|
| S1-T01–T03 | Crear estructura Odoo · custom addons · modelo de producto (joyería) |
| S1-T04–T06 | Publicación web · campos precio/stock/imágenes · slug/URL pública |
| S1-T07–T09 | Contrato integración Next.js · estrategia checkout Odoo · docs instalación |

**Exit:** Odoo base listo · contrato de producto definido.

### S2 — Shop UI *(WS-C — después de S1-T07)*
| ID | Tarea |
|---|---|
| S2-T01 | Decidir: Odoo puro vs puente Next.js |
| S2-T02–T05 | Crear `/shop` y `/shop/[slug]` · catálogo desde Odoo · CTA · branding |
| S2-T06–T08 | Loading/error/empty · responsive · documentar frontera CMS vs catálogo |

**Exit:** usuario puede navegar tienda y alcanzar flujo de compra real.

### S3 — Separación CMS vs Catálogo *(WS-C + WS-A)*
- Auditar admin actual · separar contenido editorial de datos comerciales.
- CMS actual → solo marketing. Odoo → source of truth comercial.

### S4 — Meta Integrations *(WS-D — después de S1 completo)*
- Sync a Meta Catalog · Facebook/Instagram Shop · WhatsApp catálogo · trigger seguro · documentar límites reales.

### S5 — Hardening & Despliegue *(todos los WS)*
- `.env.example` · secretos · validar Docker/Nginx · SSL · checklist despliegue · `verification-report.md` · handoff final.

---

## 9. Dependencias entre workstreams

```
WS-A ──────────────────────────────────────── siempre activo
WS-E ──────────────────────────────────────── desde inicio
WS-B ────────────────── S1 ─────────────────
                              └── WS-C (necesita contrato mínimo de WS-B)
                              └── WS-D (necesita modelo publicación de WS-B)
```

**Ola 1:** WS-A + WS-B + WS-E  
**Ola 2:** WS-C (cuando WS-B entregue `integration-contracts/shop-product.ts`)  
**Ola 3:** WS-D (cuando WS-B defina publicación/catálogo)

---

## 10. Convención de ramas

| Rama | Workstream |
|---|---|
| `orchestrator/state-docs` | WS-A |
| `odoo/foundation-galante` | WS-B |
| `frontend/shop-integration` | WS-C |
| `meta/catalog-sync` | WS-D |
| `devops/domains-proxy` | WS-E |

**Orden de merge:** A → E → B → C → D

---

## 11. Prompts individuales por agente

> **Instrucción de uso:** copiar el bloque del agente correspondiente como prompt inicial. El agente debe leer las REGLAS GLOBALES (§0) y el contexto (§1) de este documento antes de actuar.

---

### Prompt Agente A — Arquitectura & Estado

```
Eres el Architecture & State Agent de Galante's Jewelry.

Scope: solo docs/*
Sprint actual: S0

Tareas inmediatas (en orden):
1. Inspeccionar repo — resumir stack, rutas, componentes clave.
2. Crear docs/agent-state.md (formato §5 del master prompt).
3. Crear docs/shop-integration-plan.md — arquitectura objetivo con dominios.
4. Crear docs/timeline.md — sprints S0–S5, dependencias, próxima tarea por WS.
5. Crear docs/handoff.md — estado inicial, next task por WS, blockers conocidos.
6. Crear docs/implementation-log.md — Session 1 / Step 1.

No toques frontend, odoo ni infra.
Actualiza agent-state.md antes de detenerte.
```

---

### Prompt Agente B — Odoo Backend

```
Eres el Odoo Backend Agent de Galante's Jewelry.

Scope: odoo/* · integration-contracts/* · docs/* (solo tu WS)
Sprint actual: S1

Tareas inmediatas (en orden):
1. Crear estructura odoo/ con docker-compose Odoo + PostgreSQL básico.
2. Crear custom addon galantes_jewelry con modelo product.template extendido
   (campos: slug, material, available_web, buy_url).
3. Definir integration-contracts/shop-product.ts (tipo ShopProduct del §2).
4. Crear odoo/README.md con pasos de instalación y env vars.
5. Actualizar docs/agent-state.md con estado de tu WS.

Referencias estructurales (no copiar verbatim):
- C:\Users\yoeli\Documents\cell_odoo
- C:\Users\yoeli\Documents\jabiya_test\jabiyaprod

No toques frontend ni infra.
```

---

### Prompt Agente C — Frontend Next.js

```
Eres el Frontend Integration Agent de Galante's Jewelry.

Scope: app/shop/* · components/shop/* · lib/odoo/* · lib/shop/*
Sprint actual: S2

PREREQUISITO: Verificar que existe integration-contracts/shop-product.ts.
Si no existe, detente y anota el blocker en docs/agent-state.md.

Tareas inmediatas (en orden):
1. Crear lib/odoo/client.ts — fetchProducts(), fetchProductBySlug().
2. Crear app/shop/page.tsx — listado de productos desde Odoo.
3. Crear app/shop/[slug]/page.tsx — detalle con CTA hacia buyUrl de Odoo.
4. Crear components/shop/ProductCard.tsx, ProductGrid.tsx.
5. Agregar loading.tsx, error.tsx, empty state por ruta.
6. Validar responsive y consistencia visual con la marca.

No construir checkout custom. buyUrl apunta al flujo de Odoo.
Actualiza docs/agent-state.md antes de detenerte.
```

---

### Prompt Agente D — Meta Integrations

```
Eres el Meta Integrations Agent de Galante's Jewelry.

Scope: lib/integrations/* · app/api/integrations/* · docs/meta-*
Sprint actual: S4

PREREQUISITO: Verificar que WS-B definió el modelo de publicación en odoo/.
Si no existe, detente y anota el blocker.

Tareas inmediatas (en orden):
1. Crear lib/integrations/meta.ts — clase MetaCatalogSync con:
   - syncProduct(product: ShopProduct): Promise<void>
   - syncAllProducts(): Promise<SyncResult>
2. Crear app/api/integrations/meta/sync/route.ts — endpoint POST manual.
3. Crear docs/meta-capabilities.md — qué soporta realmente cada canal:
   Facebook Shop / Instagram Shopping / WhatsApp Business Catalog.
   Documentar límites con fuente oficial.
4. Crear docs/meta-setup.md — pasos de configuración con env vars.

No simular capacidades inexistentes.
Actualiza docs/agent-state.md antes de detenerte.
```

---

### Prompt Agente E — DevOps / Dominios / Proxy

```
Eres el DevOps & Deployment Agent de Galante's Jewelry.

Scope: infra/* · docker-compose*.yml · .env.example · deploy/* · docs/deployment*
Sprint actual: S0 (puede avanzar desde el inicio)

Tareas inmediatas (en orden):
1. Revisar docker-compose.yml actual — no romper el setup existente.
2. Crear infra/nginx/conf.d/galantes.conf con virtual hosts para:
   - galantesjewelry.com → Next.js actual
   - shop.galantesjewelry.com → Odoo Website
   - odoo.galantesjewelry.com → Odoo backend
3. Actualizar docker-compose.yml para incluir servicio Odoo + PostgreSQL.
4. Actualizar .env.example con variables de §3 del master prompt.
5. Crear docs/deployment-checklist.md.
6. Crear docs/deployment-notes.md — SSL, headers de seguridad, Cloudflare.

No romper el sitio actual.
Actualiza docs/agent-state.md antes de detenerte.
```

---

## 12. Prompt de reanudación (sesión interrumpida)

```
Retoma el proyecto Galante's Jewelry.

Leer en este orden:
1. docs/agent-state.md
2. docs/handoff.md

Reportar en 4 líneas:
- Último task completado:
- Task actual:
- Próximo task (NEXT_TASK_ID):
- Blockers:

Luego continuar exactamente desde NEXT_TASK_ID sin replantear el proyecto.
```

---

## 13. Definición de Done

El proyecto está listo cuando:
- [ ] Sitio actual sigue funcionando sin regresiones
- [ ] `shop.galantesjewelry.com` operativo con catálogo real desde Odoo
- [ ] `odoo.galantesjewelry.com` operativo como backend
- [ ] Odoo es fuente de verdad de productos, precios y stock
- [ ] Usuario puede comprar a través de un flujo real
- [ ] Meta/WhatsApp documentados honestamente con capacidades reales
- [ ] Infraestructura documentada y reproducible
- [ ] `docs/agent-state.md` refleja estado real del proyecto
- [ ] Proyecto retomable desde los archivos de estado

---

## 14. Entregables obligatorios antes de detenerse (cualquier agente)

1. `docs/agent-state.md` actualizado (campos STATUS y RESUME_INSTRUCTIONS)
2. `docs/implementation-log.md` con nueva entrada (append)
3. `docs/handoff.md` actualizado
4. Lista de archivos tocados
5. NEXT_TASK_ID exacto
