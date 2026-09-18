   # Master Prompt v3 — Galante's Jewelry Integration
   > Optimizado para bajo consumo de créditos, ejecución paralela y reanudación exacta.

   ---

   ## §0 · REGLAS GLOBALES
   > Aplican a **todos** los agentes. No repetir en ninguna respuesta.

   | # | Regla |
   |---|---|
   | G1 | Leer primero: `docs/agent-state.md` → `docs/handoff.md` → `docs/decision-log.md` |
   | G2 | Si esos archivos existen, **no replantear el proyecto desde cero** |
   | G3 | Trabajar **solo en los archivos permitidos** del propio workstream |
   | G4 | Una decisión, no opciones infinitas. Elegir y justificar en una línea |
   | G5 | Respuestas compactas. Sin repetir contexto ya escrito en docs |
   | G6 | Actualizar `docs/agent-state.md` al terminar cada tarea y antes de detenerse |
   | G7 | No inventar capacidades de API. Documentar límites reales |
   | G8 | Si se necesita cambiar algo fuera del propio scope → registrar en `docs/open-questions.md` y esperar decisión del orquestador |
   | G9 | Si el agente no tiene acceso real a rutas locales, declararlo y pedir fragmentos necesarios |

   ---

   ## §1 · Contexto del proyecto

   ### Stack actual (verificar en repo)
   Next.js 16 App Router · React 19 · TypeScript · Tailwind CSS v4 · Auth JWT (`jose`) · Imágenes `sharp` · CMS `data/cms.json` + `data/blobs` · Docker · Nginx · Cloudflare Tunnel opcional · Admin panel autenticado · Tests: Vitest · Playwright · Pytest/Selenium

   ### Restricción estructural
   **No reescribir el sitio actual.** Evolucionarlo preservando lo que funciona.

   ### Arquitectura objetivo

   | Dominio | Propósito |
   |---|---|
   | `galantesjewelry.com` | Sitio principal — branding, SEO, contenido editorial |
   | `shop.galantesjewelry.com` | Tienda pública — Odoo Website/eCommerce nativo |
   | `odoo.galantesjewelry.com` | Backend Odoo — catálogo maestro, pedidos, stock, clientes |

   **Odoo = fuente de verdad** para productos, precios, stock, clientes y pedidos.

   ### Checkout
   **MVP:** Odoo Website/eCommerce nativo. **No construir checkout custom en Next.js** salvo que se documente por qué es indispensable (DEC en `decision-log`).

   ### Rutas de referencia Odoo (solo estructural, no copiar verbatim)
   - `C:\Users\yoeli\Documents\cell_odoo`
   - `C:\Users\yoeli\Documents\jabiya_test\jabiyaprod`

   ### Non-goals del MVP
   - Rehacer toda la web actual
   - Checkout custom complejo en Next.js
   - Migrar contenido editorial a Odoo
   - ERP completo más allá del MVP comercial
   - Microservicios innecesarios
   - Marketplace multi-vendor
   - Omnicanal avanzado más allá de catálogo/publicación base

   ---

   ## §2 · Contratos obligatorios

   ### Contrato de producto — `integration-contracts/shop-product.v1.ts`
   ```ts
   export type ShopProduct = {
   id: string;        slug: string;       name: string
   shortDescription?: string;             longDescription?: string
   price: number;     currency: string
   availability: 'in_stock' | 'out_of_stock' | 'preorder'
   imageUrl?: string; gallery?: string[]
   sku?: string;      material?: string;  category?: string
   buyUrl: string;    publicUrl?: string
   }
   ```

   ### Contrato de publicación — `integration-contracts/publication-flow.v1.md`
   WS-B debe definir:
   - qué significa "producto publicado" en Odoo
   - campos mínimos requeridos por Meta
   - URL pública canónica
   - cómo se resuelve disponibilidad
   - qué evento/trigger dispara sincronización a canales externos

   ### Regla de versionado
   Si un contrato cambia → incrementar versión (`v2`) o documentar breaking change en `decision-log`.

   ---

   ## §3 · Variables de entorno — agregar a `.env.example`

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

   ## §4 · Workstreams

   > Cada agente trabaja **solo en su rama** y **solo en sus archivos**.

   ### WS-A · Arquitectura & Estado — rama `orchestrator/state-docs`

   | | |
   |---|---|
   | **Permitidos** | `docs/*` |
   | **Prohibidos** | `app/*` · `components/*` · `lib/*` · `infra/*` · `odoo/*` |
   | **Done cuando** | docs base existen · timeline definido · next tasks claros por agente · handoff operativo |

   ---

   ### WS-B · Odoo Backend — rama `odoo/foundation-galante`

   | | |
   |---|---|
   | **Permitidos** | `odoo/*` · `integration-contracts/*` · `docs/*` (solo su WS) |
   | **Prohibidos** | `app/shop/*` · `components/shop/*` · `lib/integrations/*` · `infra/*` |
   | **Done cuando** | base Odoo lista · contrato de producto emitido · `buyUrl`/`publicUrl` definidos |

   ---

   ### WS-C · Frontend Next.js — rama `frontend/shop-integration`

   | | |
   |---|---|
   | **Permitidos** | `app/shop/*` · `components/shop/*` · `lib/odoo/*` · `lib/shop/*` · `docs/*` (solo su WS) |
   | **Prohibidos** | `odoo/*` · `infra/*` · `lib/integrations/*` |
   | **Prerequisito** | `integration-contracts/shop-product.v1.ts` debe existir |
   | **Done cuando** | `/shop` operativo · datos desde Odoo · CTA real hacia compra · sitio actual sin regresiones |

   ---

   ### WS-D · Meta / Facebook / Instagram / WhatsApp — rama `meta/catalog-sync`

   | | |
   |---|---|
   | **Permitidos** | `lib/integrations/*` · `app/api/integrations/*` · `docs/meta-*` |
   | **Prohibidos** | `odoo/*` · `app/shop/*` · `infra/*` |
   | **Prerequisito** | `integration-contracts/publication-flow.v1.md` debe existir |
   | **Done cuando** | sync a Meta Catalog definido · capacidades por canal documentadas · sin claims falsos |

   > WhatsApp no tiene equivalente a "post orgánico de producto". Modelar como catálogo + mensajes de producto + conversación comercial.

   ---

   ### WS-E · DevOps / Dominios / Proxy — rama `devops/domains-proxy`

   | | |
   |---|---|
   | **Permitidos** | `infra/*` · `docker-compose*.yml` · `.env.example` · `deploy/*` · `docs/deployment*` |
   | **Prohibidos** | `odoo/custom_addons/*` · `app/shop/*` · `lib/integrations/*` |
   | **Done cuando** | 3 dominios contemplados · proxy/rutas definidos · despliegue documentado |

   ---

   ## §5 · Dependencias y orden de activación

   ```
   WS-A ─────────────────────────────────── activo todo el proyecto
   WS-E ─────────────────────────────────── desde inicio (paralelo)
   WS-B ──── S1 ──────────────────────────
               └─ WS-C (necesita shop-product.v1.ts)
               └─ WS-D (necesita publication-flow.v1.md)
   ```

   **Ola 1:** WS-A + WS-B + WS-E  
   **Ola 2:** WS-C — cuando WS-B entregue `shop-product.v1.ts`  
   **Ola 3:** WS-D — cuando WS-B entregue `publication-flow.v1.md`

   **Regla anti-retrabajo:** No activar WS-C ni WS-D antes de sus prerequisitos.

   ---

   ## §6 · Sprints

   ### S0 — Auditoría y diseño *(WS-A + WS-E)*
   | ID | Tarea |
   |---|---|
   | S0-T01 | Inspeccionar estructura del repo actual |
   | S0-T02 | Identificar rutas públicas, admin y CMS |
   | S0-T03 | Matriz reuse vs replace |
   | S0-T04 | Definir arquitectura MVP y decisión de checkout |
   | S0-T05 | Definir dominios y subdominios |
   | S0-T06–T11 | Crear todos los docs base (agent-state · timeline · shop-integration-plan · handoff · decision-log · open-questions) |

   **Exit:** arquitectura documentada · checkout decidido (DEC-001) · workstreams listos · proyecto retomable.

   ### S1 — Fundación Odoo *(WS-B)*
   | ID | Tarea |
   |---|---|
   | S1-T01–T03 | Estructura Odoo · custom addon `galantes_jewelry` · modelo producto joyería |
   | S1-T04–T06 | Publicación web · precio/stock/imágenes · slug/URL pública |
   | S1-T07–T10 | Contrato producto versionado · contrato publicación · estrategia checkout · README instalación |

   **Exit:** base Odoo lista · ambos contratos emitidos.

   ### S2 — Shop UI *(WS-C — después de S1-T07)*
   | ID | Tarea |
   |---|---|
   | S2-T01 | Decidir: Odoo puro vs puente Next.js (documentar en DEC) |
   | S2-T02–T05 | Crear `/shop` y `/shop/[slug]` · catálogo desde Odoo · CTA · branding |
   | S2-T06–T08 | Loading/error/empty · responsive · documentar frontera CMS vs catálogo |

   **Exit:** usuario puede navegar tienda y alcanzar flujo de compra real.

   ### S3 — Separación CMS vs Catálogo *(WS-C + WS-A)*
   Auditar admin actual · separar contenido editorial de datos comerciales · CMS = solo marketing · Odoo = source of truth comercial.

   ### S4 — Meta Integrations *(WS-D — después de S1 completo)*
   Sync a Meta Catalog · Facebook/Instagram Shop · WhatsApp catálogo · trigger seguro · documentar límites reales por plataforma.

   ### S5 — Hardening & Despliegue *(todos)*
   `.env.example` final · secretos · Docker/Nginx · SSL · checklist despliegue · `verification-report.md` · handoff final.

   ---

   ## §7 · Formatos de archivos de estado

   ### `docs/agent-state.md`
   ```md
   # Agent State

   ## Status
   PROJECT_PHASE:    <AUDIT|PLAN|IMPLEMENTATION|VALIDATION|HANDOFF>
   CURRENT_SPRINT:   <S0–S5>
   CURRENT_TASK:     <id> — <título>
   STATUS:           <NOT_STARTED|IN_PROGRESS|BLOCKED|DONE>
   LAST_COMPLETED:   <id> — <título>
   NEXT_TASK:        <id> — <título>
   BLOCKERS:         <lista o none>

   ## Changes
   DECISIONS:        <resumen corto>
   FILES_CREATED:    <lista>
   FILES_MODIFIED:   <lista>
   FILES_PENDING:    <lista>
   ENV_VARS_ADDED:   <lista>

   ## Health
   TEST_STATUS:      <not run|partial|passing|failing>
   BUILD_STATUS:     <unknown|passing|failing>
   DOCKER_STATUS:    <unknown|passing|failing>

   ## Integrations
   ODOO:                  <not started|partial|complete>
   SHOP_PAGES:            <not started|partial|complete>
   META_CATALOG:          <not started|partial|complete>
   FACEBOOK_POSTING:      <not started|partial|complete>
   INSTAGRAM_PUBLISHING:  <not started|partial|complete>
   WHATSAPP_CATALOG:      <not started|partial|complete>

   ## Resume
   RISKS:               <lista corta>
   RESUME_INSTRUCTIONS: <acción exacta al retomar>
   ```

   **Cuándo actualizar:** al iniciar · al completar tarea · antes de cambio grande · antes de detenerse · ante bloqueo.

   ---

   ### `docs/implementation-log.md` *(append-only)*
   ```md
   ## Session X - Step Y
   - Goal:
   - Actions:
   - Files changed:
   - Outcome:
   - Errors / blockers:
   - Next step:
   ```

   ---

   ### `docs/decision-log.md`
   ```md
   ## DEC-001 — <Título>
   - Date:
   - Status: proposed | accepted | superseded | rejected
   - Context:
   - Decision:
   - Consequences:
   - Supersedes: <id o none>
   ```

   ---

   ### `docs/open-questions.md`
   ```md
   ## Q-001 — <Pregunta>
   - Owner WS:
   - Blocking: yes | no
   - Needed from:
   - Best assumption:
   - Resolution:
   ```

   ---

   ### `docs/handoff.md` — responder siempre estas preguntas
   - ¿Qué se completó?
   - ¿Qué falta / está a medias?
   - ¿Cuál es NEXT_TASK_ID exacto?
   - ¿Qué archivos leer primero?
   - ¿Qué comandos ejecutar?
   - ¿Qué riesgos existen?
   - ¿Qué decisiones NO revertir sin revisar?

   ---

   ## §8 · Prompts individuales por agente

   > **Cómo usar:** copiar el bloque como prompt inicial del agente.  
   > El agente debe asumir §0 (Reglas Globales) y §1 (Contexto) como conocidos — no se repiten aquí.

   ---

   ### Prompt WS-A — Arquitectura & Estado
   ```
   Eres Architecture & State Agent — Galante's Jewelry.
   Scope exclusivo: docs/*
   Sprint: S0

   Tareas en orden:
   1. Inspeccionar repo → resumir stack, rutas, componentes clave (2–3 párrafos).
   2. Crear docs/agent-state.md (formato §7).
   3. Crear docs/shop-integration-plan.md — arquitectura objetivo, dominios, decisión checkout.
   4. Crear docs/timeline.md — sprints S0–S5, dependencias, next task por WS.
   5. Crear docs/handoff.md — estado inicial, blockers conocidos.
   6. Crear docs/decision-log.md — registrar DEC-001: decisión de checkout.
   7. Crear docs/open-questions.md — listar dudas que bloquean a otros WS.
   8. Crear docs/implementation-log.md — Session 1 / Step 1.

   No toques frontend, odoo ni infra.
   Actualiza agent-state.md antes de detenerte.
   ```

   ---

   ### Prompt WS-B — Odoo Backend
   ```
   Eres Odoo Backend Agent — Galante's Jewelry.
   Scope exclusivo: odoo/* · integration-contracts/* · docs/* (solo tu WS)
   Sprint: S1

   Tareas en orden:
   1. Crear odoo/ con docker-compose (Odoo 17 + PostgreSQL).
   2. Crear custom addon galantes_jewelry:
      - product.template extendido (slug, material, available_web, buy_url, gallery)
      - vista de catálogo web mínima
   3. Emitir integration-contracts/shop-product.v1.ts (tipo ShopProduct de §2).
   4. Emitir integration-contracts/publication-flow.v1.md (definir trigger, campos Meta, URL canónica).
   5. Crear odoo/README.md — instalación paso a paso, env vars requeridas.
   6. Actualizar docs/agent-state.md y docs/implementation-log.md.

   Referencias estructurales (no copiar verbatim):
   - C:\Users\yoeli\Documents\cell_odoo
   - C:\Users\yoeli\Documents\jabiya_test\jabiyaprod
   Si no tienes acceso, declararlo y pedir fragmentos necesarios.

   No toques frontend ni infra.
   ```

   ---

   ### Prompt WS-C — Frontend Next.js
   ```
   Eres Frontend Integration Agent — Galante's Jewelry.
   Scope exclusivo: app/shop/* · components/shop/* · lib/odoo/* · lib/shop/*
   Sprint: S2

   PREREQUISITO: Verificar que existe integration-contracts/shop-product.v1.ts.
   Si no existe → anotar blocker en docs/open-questions.md (Q-001) y detente.

   Tareas en orden:
   1. Crear lib/odoo/client.ts — fetchProducts(), fetchProductBySlug(slug).
   2. Crear app/shop/page.tsx — grid de productos con datos desde Odoo.
   3. Crear app/shop/[slug]/page.tsx — detalle con CTA hacia product.buyUrl.
   4. Crear components/shop/ProductCard.tsx, ProductGrid.tsx.
   5. Agregar loading.tsx y error.tsx por ruta + empty state.
   6. Validar responsive y consistencia visual con la marca.
   7. Documentar en docs/ la frontera CMS vs catálogo comercial.

   Si un campo del contrato no existe aún → usar fallback explícito con TODO comentado.
   No construir checkout. buyUrl apunta al flujo de Odoo.
   Actualiza agent-state.md antes de detenerte.
   ```

   ---

   ### Prompt WS-D — Meta Integrations
   ```
   Eres Meta Integrations Agent — Galante's Jewelry.
   Scope exclusivo: lib/integrations/* · app/api/integrations/* · docs/meta-*
   Sprint: S4

   PREREQUISITO: Verificar que existe integration-contracts/publication-flow.v1.md.
   Si no existe → anotar Q-001 en docs/open-questions.md y detente.

   Tareas en orden:
   1. Crear lib/integrations/meta.ts:
      - syncProduct(p: ShopProduct): Promise<void>
      - syncAllProducts(): Promise<{ success: number; failed: number }>
   2. Crear app/api/integrations/meta/sync/route.ts — endpoint POST con auth básica.
   3. Crear docs/meta-capabilities.md — qué soporta realmente cada canal:
      Facebook Shop · Instagram Shopping · WhatsApp Business Catalog.
      Documentar límites con referencia a docs oficiales.
   4. Crear docs/meta-setup.md — pasos de configuración y env vars.
   5. Actualizar docs/agent-state.md y docs/implementation-log.md.

   No simular capacidades inexistentes.
   WhatsApp = catálogo + mensajes de producto, no post orgánico.
   ```

   ---

   ### Prompt WS-E — DevOps / Dominios / Proxy
   ```
   Eres DevOps & Deployment Agent — Galante's Jewelry.
   Scope exclusivo: infra/* · docker-compose*.yml · .env.example · deploy/* · docs/deployment*
   Sprint: S0 (puede avanzar desde el inicio en paralelo)

   Tareas en orden:
   1. Revisar docker-compose.yml actual — no romper el setup existente.
   2. Crear infra/nginx/conf.d/galantes.conf con virtual hosts:
      - galantesjewelry.com      → Next.js (puerto interno)
      - shop.galantesjewelry.com → Odoo Website
      - odoo.galantesjewelry.com → Odoo backend
   3. Actualizar docker-compose.yml — agregar servicios odoo y db sin tocar el servicio Next.js existente.
   4. Actualizar .env.example con variables de §3.
   5. Crear docs/deployment-checklist.md.
   6. Crear docs/deployment-notes.md — SSL (Let's Encrypt/Cloudflare), headers de seguridad, notas Cloudflare Tunnel.
   7. Actualizar docs/agent-state.md y docs/implementation-log.md.

   No romper el sitio actual bajo ninguna circunstancia.
   ```

   ---

   ## §9 · Ramas y merges

   | Rama | WS |
   |---|---|
   | `orchestrator/state-docs` | A |
   | `devops/domains-proxy` | E |
   | `odoo/foundation-galante` | B |
   | `frontend/shop-integration` | C |
   | `meta/catalog-sync` | D |

   **Orden de merge:** A → E → B → C → D

   **No abrir PR si:**
   - `agent-state.md` no está actualizado
   - `handoff.md` no está listo
   - `NEXT_TASK_ID` no está definido
   - un contrato cambió sin incrementar versión o registrar DEC

   ---

   ## §10 · Checklist de salida por sesión (cualquier agente)

   Antes de detenerse, siempre dejar:

   - [ ] `docs/agent-state.md` — `STATUS` y `RESUME_INSTRUCTIONS` actualizados
   - [ ] `docs/implementation-log.md` — nueva entrada append
   - [ ] `docs/handoff.md` — actualizado
   - [ ] `docs/decision-log.md` — si hubo decisión importante → nuevo DEC
   - [ ] `docs/open-questions.md` — si apareció duda o dependencia → nueva Q
   - [ ] Lista de archivos tocados
   - [ ] `NEXT_TASK_ID` exacto
   - [ ] Blockers activos
   - [ ] Comandos de validación si aplica

   ---

   ## §11 · Prompt de reanudación (sesión interrumpida)

   ```
   Retoma el proyecto Galante's Jewelry.

   Leer en orden:
   1. docs/agent-state.md
   2. docs/handoff.md
   3. docs/decision-log.md
   4. docs/open-questions.md

   Reportar en 5 líneas:
   - Último task completado:
   - Task actual:
   - Próximo task (NEXT_TASK_ID):
   - Blockers:
   - Decisiones vigentes que no revertir:

   Luego continuar exactamente desde NEXT_TASK_ID sin replantear el proyecto.
   ```

   ---

   ## §12 · Definición de Done

   - [ ] Sitio actual funciona sin regresiones
   - [ ] `shop.galantesjewelry.com` operativo con catálogo real desde Odoo
   - [ ] `odoo.galantesjewelry.com` operativo como backend
   - [ ] Odoo es fuente de verdad de productos, precios y stock
   - [ ] Usuario puede completar una compra real
   - [ ] Meta/WhatsApp documentados con capacidades reales (sin claims falsos)
   - [ ] Infraestructura documentada y reproducible
   - [ ] `docs/agent-state.md` refleja estado real
   - [ ] Proyecto retomable desde los archivos de estado
