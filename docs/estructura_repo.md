# Estructura del repo — diagnóstico y propuesta (sin ejecutar)

**Fecha:** 2026-09-12. **Estado:** propuesta para aprobación, nada se movió todavía.

## 1. Árbol actual real (raíz del workspace)

Levantado con `ls`/`find` reales en este momento, agrupando lo irrelevante (`node_modules`, cachés, builds).

```text
GetUpSoft_Workspace/
│
├── package.json               ⚠️ "name": "galantesjewelry" -- la RAIZ del workspace
├── next.config.ts              corporativo esta configurada como si fuera la app
├── proxy.ts                    de Galantes. next.config.ts/proxy.ts/package.json
├── vitest.config.ts            en texto plano en la raiz, sin carpeta contenedora.
├── eslint.config.mjs
├── postcss.config.mjs
├── tsconfig.json
├── package-lock.json
├── docker-compose.yml / docker-compose.production.yml / Dockerfile
├── bootstrap.ps1 / bootstrap.sh
├── AGENTS.md / CHANGE_TIMELINE.md / workspace.json
├── OrcaAgentServer.spec
├── edx_cookies.json            ⚠️ archivo de cookies suelto en la raiz
├── uv.lock
│
├── context/                    ⚠️ reaparecido (ya se habia descartado antes por ser
│   └── prompts/                   remanente de Galantes) -- recreado por algun proceso
│
├── scripts/                    220 archivos, TODOS sueltos, sin subcarpetas:
│   ├── test_*.mjs (74)             mezcla tests, runners, diagnosticos y validadores
│   ├── careerai_*.mjs (21)         en un solo directorio plano
│   ├── run_*.mjs (7)
│   ├── orca_*.mjs (9)
│   ├── diagnose_*.mjs (4)
│   └── validate_*/verify_*/*.ps1/*.py (~85 mas, nombres sueltos)
│
├── apps/                       Duplica proposito con platform/ y products/:
│   ├── orca/                       codigo VIEJO/paralelo de ORCA (docker/, deploy/,
│   │   ├── chrome_profile/          evidence/, tars sueltos orca_final.tar,
│   │   ├── docker/                  orca_payload.tar.gz, orca_src.tar) -- mientras
│   │   ├── scripts/                 platform/orca/ ya tiene el src real consolidado
│   │   ├── workflow-editor/         (R02, sesion anterior). apps/orca/scripts/,
│   │   └── (18 entradas mas)        apps/orca/tests/ tambien duplican scripts/ raiz.
│   ├── site/                    ⚠️ reaparecido (ya se habia movido a products/
│   │                                getupsoft-site en R02)
│   ├── local_printer_agent/     contiene Chefalitas/.env -- bajo revision (worktree
│   │                                de otra sesion concurrente)
│   ├── insta-manager-pro/       .env con credenciales reales de Instagram
│   └── research-ai/             experimentos, ya con copia en labs/research-ai/
│
├── platform/
│   ├── orca/{src,database}/    fuente REAL consolidada de ORCA (R02)
│   └── client-gateway/
│
├── products/                   getupsoft-site, easycount, smartdoor, boat (via R02)
├── client-solutions/           galantes-jewelry (checkout independiente, R02)
├── integrations/               odoo/, n8n/
├── infrastructure/             cloudflare/, networking-nginx/, postgres/, mail/
├── labs/                       NemoClaw, miniverse, research-ai
├── libraries/third-party/      hermes-agent, scrapling, mailcow-dockerized, loader
├── governance/                 registry/, migration/, policies/
├── historicos/                 duplicados descartados (fuera de git, R02)
├── archives/source/            backups catalogados (fuera de git, R02)
│
├── tools/
│   ├── workspace-cli/           CLI de bootstrap (B01-B04)
│   └── agent-memory/            captura de prompts + locks + escaner de logs (nuevo)
│
├── data/                       careerai/, odoo/, orca/, postgres/, n8n_workflows.json
│                                  -- datos operativos reales, mezclados con configs
│
├── docs/                       29 archivos sueltos (arquitectura, deployment,
│                                  acceptance reports, decision-log) sin categorizar
│
├── task-ledger/                evidencia de pruebas reales (screenshots, logs, CVs
│                                  generados) -- 24 entradas de primer nivel
│
├── _Knowledge_Center/           historial, prompts maestros -- ya organizado
│
├── 03_AI_Automation/            ⚠️ solo queda orca-legacy/ (correcto, se archiva
│                                    despues de retirar consumidores -- R02)
├── 06_E_Commerce_Lux/           ⚠️ reaparecido, solo AGENTS.md (cascaron vacio)
├── 07_Libraries_Tools/          ⚠️ solo loader/ (dejado en su lugar a proposito, R01)
├── 08_Research_Labs/            ⚠️ hyperframes/ (sin codigo real) + miniverse/
│                                    (reaparecido, ya copiado en labs/)
├── 05_Backups/                  830 entradas -- SIN CATALOGAR EN DETALLE, incluye
│                                    secrets_recovery/ (ver governance/migration/
│                                    inventory/05-backups-catalog.md)
│
└── .runtime/                    fuera de git -- modelos, logs, datos operacionales
```

## 2. Diagnóstico (ejemplos reales, no genéricos)

### 2.1. La raíz del workspace corporativo se identifica como la app de Galantes
`package.json` en la raíz tiene `"name": "galantesjewelry"` y scripts como
`"start:express": "node server/express-app.js"`. Esto es la causa directa de que
`context/`, `next.config.ts`, `proxy.ts` reaparezcan solos: cualquier tooling que lea
`package.json` en la raíz (instaladores, editores, agentes) asume que la raíz ES esa
app. El checkout real y completo de Galantes ya vive en
`client-solutions/galantes-jewelry/` (con su propio `package.json` correcto) desde R02.

### 2.2. `scripts/` es un directorio plano de 220 archivos
Ejemplos reales encontrados: `careerai_dispatch_email_talenthive.mjs`,
`run_careerai_linkedin_jobs_node.mjs`, `test_careerai_whatsapp_web_live.mjs`,
`orca_oauth_doctor.mjs`, `diagnose_whatsapp_web_headless.mjs` — mezclan runners de
producción, scripts de diagnóstico puntual, y 74 archivos de test, todos en el mismo
nivel sin ninguna subcarpeta. Un desarrollador nuevo no puede distinguir "esto se
ejecuta en producción" de "esto fue un diagnóstico de un bug de una sola vez" sin leer
el nombre completo de cada archivo.

### 2.3. `apps/orca/` y `platform/orca/` coexisten con propósito solapado
`apps/orca/` todavía tiene `docker/`, `deploy/`, `evidence/`, `scripts/`, `tests/`,
`workflow-editor/` y tres archivos `.tar`/`.tar.gz` sueltos de builds viejos
(`orca_final.tar`, `orca_payload.tar.gz`, `orca_src.tar`) — mientras
`platform/orca/{src,database}` ya es la fuente consolidada real (movida en R02,
sesión anterior). Un import o script que todavía apunte a `apps/orca/...` en vez de
`platform/orca/...` está usando la copia vieja sin saberlo.

### 2.4. Directorios numerados (`0X_Nombre`) siguen reapareciendo
`03_AI_Automation`, `06_E_Commerce_Lux`, `07_Libraries_Tools`, `08_Research_Labs`
existían antes de la reorganización de R01/R02 de la sesión anterior y en su mayoría
quedaron vacíos o con cascarones — pero varios reaparecieron (`06_E_Commerce_Lux`,
`apps/site`, `08_Research_Labs/miniverse`) con contenido mínimo, probablemente
recreados por algún script o sesión concurrente que todavía referencia las rutas
viejas. Esto confirma que la limpieza de R02 no es "definitiva" mientras exista
tooling (como `sync_memory.py`, ya corregido parcialmente) que siga apuntando a las
rutas antiguas.

### 2.5. `data/` mezcla datos operativos reales con configuración
`data/postgres`, `data/odoo`, `data/orca` (con dos perfiles de Chrome con credenciales
reales dentro, según el checkpoint de seguridad de la sesión anterior) y
`data/n8n_workflows.json` conviven en el mismo nivel que `data/careerai/` (el dominio
activo de esta rama). No hay separación entre "datos que se versionan porque son
fixtures/config" y "datos operativos reales que nunca deberían acercarse a git".

### 2.6. Archivos sueltos en la raíz sin carpeta contenedora
`edx_cookies.json` (nombre sugiere cookies de sesión — revisar si tiene datos reales
antes de decidir su destino), `OrcaAgentServer.spec` (spec de PyInstaller, debería
vivir junto al código que empaqueta), `uv.lock` (lockfile de Python, sin un
`pyproject.toml` visible en la raíz que lo acompañe).

### 2.7. `05_Backups/` (830 entradas) sigue sin catalogar en detalle
Ya se generó un catálogo superficial en la sesión anterior
(`governance/migration/inventory/05-backups-catalog.md`) que confirmó una carpeta
`secrets_recovery/` sin auditar. Nada se ha tocado desde entonces — sigue siendo el
mayor volumen sin clasificar del repo.

## 3. Patrón oficial ya definido (el que pasaste antes en esta conversación)

**Corrección importante:** la primera versión de este documento inventó un árbol
propio en vez de usar el patrón que ya habías definido. Ese patrón oficial es la
sección 2.1 ("Árbol corporativo objetivo") del documento "Diseño técnico integral de
GetUpSoft Workspace y ORCA" que pegaste en esta misma conversación. No está guardado
como archivo aparte en ningún sitio (se buscó en el repo completo, `~/.agents_shared_memory`,
`CLAUDE.md`/`AGENTS.md` globales y locales, la carpeta de memoria, y la base de datos
de prompts capturados — solo existe resumido, no reproducido, en
`governance/architecture/ADR-0002-diseno-integral-getupsoft-orca.md`). Se reproduce
aquí textualmente para que quede guardado por primera vez:

```text
GetUpSoft_Workspace/
├── AGENTS.md
├── README.md
├── workspace.json
├── workspace.lock.json
├── bootstrap.ps1
├── bootstrap.sh
│
├── governance/
│   ├── registry/
│   │   ├── projects/
│   │   ├── products/
│   │   ├── environments/
│   │   └── repositories/
│   ├── profiles/
│   ├── contracts/
│   ├── policies/
│   ├── migration/
│   │   ├── inventory/
│   │   ├── manifests/
│   │   ├── validations/
│   │   └── rollback/
│   └── delivery/
│
├── platform/
│   ├── orca/                     # Repositorio independiente
│   └── client-gateway/           # Repositorio independiente
│
├── products/
│   ├── getupsoft-site/
│   ├── easycount/
│   ├── chefalitas/
│   ├── getupnet/
│   ├── smartdoor/
│   └── boat/
│
├── client-solutions/
│   ├── galantes-jewelry/
│   └── customer-overlays/        # Configuraciones versionables específicas
│
├── workers/
│   ├── printing/
│   ├── documents/
│   ├── data/
│   ├── browser/
│   └── ai/
│
├── integrations/
│   ├── odoo/
│   │   ├── shared-addons/
│   │   │   ├── v15/ ... v19/
│   │   ├── connectors/
│   │   └── compatibility/
│   └── n8n/
│
├── libraries/
│   ├── internal/
│   └── third-party/              # Referencias a upstream, licencia y versión
│
├── infrastructure/
│   ├── compose/
│   ├── hosts/
│   ├── networking/
│   ├── observability/
│   ├── backup/
│   └── mail/
│
├── tools/
│   ├── workspace-cli/
│   ├── inventory/
│   ├── migration/
│   └── verification/
│
├── _Knowledge_Center/
│   ├── corporate/
│   ├── architecture/
│   ├── projects/
│   ├── runbooks/
│   ├── prompts/
│   ├── glossary/
│   └── history/
│
├── labs/
├── archives/
│   ├── source/
│   └── provenance/
│
├── .runtime/                     # Fuera de Git
│   ├── bootstrap/
│   ├── data/
│   ├── artifacts/
│   ├── logs/
│   ├── models/
│   ├── backups/
│   └── recovery/
│
├── .agents/  ├── .codex/  ├── .claude/  ├── .hermes/  └── .github/
```

Regla explícita del propio patrón (sección 2.2): `docs`, `context`, `data`, `logs`,
`build`, `artifacts`, `test-results`, `graphify-out` **no son carpetas de primer nivel**
en este patrón — se distribuyen dentro de `_Knowledge_Center/` (docs/contexto) o
`.runtime/` (todo lo generado/operativo), y `scripts`/`tools` se reparten entre la CLI
corporativa (`tools/workspace-cli/`) y scripts propios de cada proyecto.

## 4. Comparación real: qué ya cumple el patrón, qué falta

| Carpeta del patrón | Estado actual | Brecha real |
|---|---|---|
| `governance/` | ✅ Existe con la forma correcta (`registry/`, `migration/`, `policies/`) | Ninguna |
| `platform/orca/`, `platform/client-gateway/` | ✅ Existen (R02) | Ninguna |
| `products/` | ✅ Existe con `getupsoft-site/`, `smartdoor/`, `boat/`, `easycount/` | Falta confirmar `chefalitas/`, `getupnet/` (bloqueados por worktree/pendientes según checkpoints anteriores) |
| `client-solutions/galantes-jewelry/` | ✅ Existe | Falta `customer-overlays/` (no se ha creado nunca) |
| `workers/` | ⚠️ Carpeta existe pero **vacía** | Falta poblar `printing/`, `documents/`, `data/`, `browser/`, `ai/` — el contenido real (ej. `apps/local_printer_agent/`) sigue fuera, en `apps/` |
| `integrations/odoo/`, `integrations/n8n/` | ✅ Existen | Ninguna |
| `libraries/third-party/` | ✅ Existe y poblada (R02) | Falta `libraries/internal/` |
| `infrastructure/` | ✅ Existe | Nombres no coinciden exactamente (`networking-nginx/` vs `networking/`, falta `compose/`, `hosts/`, `observability/`) |
| `tools/workspace-cli/` | ✅ Existe | Falta `tools/inventory/`, `tools/migration/`, `tools/verification/` como carpetas propias (hoy ese trabajo vive suelto en `governance/migration/`) |
| `_Knowledge_Center/` | ⚠️ Existe pero sin la subestructura exacta (`corporate/`, `architecture/`, `runbooks/`, `glossary/`) | `docs/` (29 archivos) y `context/` siguen sueltos en la raíz en vez de estar dentro de aquí — **esta es la brecha más grande del diagnóstico anterior, y el patrón oficial confirma que la solución correcta es absorberlos aquí, no crear una carpeta `docs/` nueva y organizada como propuse antes** |
| `labs/` | ✅ Existe | Ninguna |
| `archives/source/` | ✅ Existe | Falta `archives/provenance/` |
| `.runtime/` | ✅ Existe, fuera de git | `data/`, `logs/`, `artifacts/`, `build/`, `test-results/`, `graphify-out/` de la raíz **deberían fusionarse aquí** según el patrón, en vez de quedar como carpetas de primer nivel |
| — (no existe en el patrón) | `apps/`, `scripts/`, `03_AI_Automation/`, `05_Backups/`, `06_E_Commerce_Lux/`, `07_Libraries_Tools/`, `08_Research_Labs/` | Estas 7 carpetas **no tienen lugar en el patrón oficial en absoluto** — todo su contenido real debe terminar dentro de `products/`, `workers/`, `labs/`, `.runtime/` o `historicos/` (fuera de git) |

## 5. Propuesta de movimiento, ahora sí alineada al patrón (sin cambios drásticos)

Igual que antes: nada se ejecuta hasta aprobación. Los movimientos de bajo riesgo del
diagnóstico anterior (corregir `package.json`, eliminar cascarones vacíos reaparecidos,
mover `data/n8n_workflows.json`) **siguen siendo válidos** y ahora además coinciden
con el patrón oficial (ese JSON terminaría en `.runtime/data/`, no en una carpeta
`data/config/` inventada). Se agregan, siguiendo el patrón real:

```text
docs/ (29 archivos)      → _Knowledge_Center/ (repartidos por categoría: architecture,
                             runbooks, projects — requiere leer cada archivo, no es
                             un simple mv en bloque)
context/                  → _Knowledge_Center/prompts/ (si tiene contenido vigente) o
                             historicos/ (si es el remanente ya descartado antes)
data/, logs/, artifacts/,
build/, test-results/,
graphify-out/             → .runtime/ (coincide con la regla explícita del patrón:
                             "Fuera de Git" — actualmente varias de estas SÍ están
                             sin trackear ya, pero conviven como carpetas de primer
                             nivel en vez de vivir dentro de .runtime/)
scripts/ (220 archivos)   → repartir entre tools/workspace-cli/ (lo que es CLI
                             corporativa real) y scripts propios de cada proyecto
                             (careerai_*.mjs → platform/orca/scripts/ o similar)
apps/local_printer_agent  → workers/printing/ (es exactamente lo que ese slot del
                             patron espera, hoy vacío)
apps/insta-manager-pro    → workers/ai/ (mismo caso — slot vacío en el patrón)
```

**Explícitamente NO propuesto en este bloque** (fuera de alcance de "sin cambios
drásticos", igual que antes): tocar `apps/orca/` (requiere auditoría de consumidores),
mover los 74 `scripts/test_*.mjs` (rutas hardcodeadas conocidas), clasificar
`edx_cookies.json`, o resolver `05_Backups/secrets_recovery/`.

## 6. Mapa de movimientos (origen → destino → qué se rompería)

| Origen | Destino | Riesgo | Qué se rompería si se hace mal |
|---|---|---|---|
| `package.json` (raíz) — editar `name` y quitar scripts de Galantes | mismo archivo | 🟢 Bajo | Si algún hook/CI corre `npm run <script-de-galantes>` desde la raíz, dejaría de existir — hay que confirmar que nada lo use antes |
| `scripts/careerai_*.mjs`, `scripts/run_careerai_*.mjs` | `scripts/careerai/` | 🟡 Medio | Estos scripts se invocan por ruta relativa desde otros scripts y desde `package.json`/documentación — cada referencia (`scripts/careerai_harvest.mjs` etc.) debe actualizarse a la vez |
| `scripts/orca_*.mjs` | `scripts/orca/` | 🟡 Medio | Igual que arriba — verificar referencias en `docs/` y en otros scripts antes de mover |
| `scripts/diagnose_*.mjs` | `scripts/diagnostics/` | 🟢 Bajo | Son scripts puntuales de un bug ya resuelto; bajo riesgo de que algo los referencie activamente, pero hay que confirmarlo primero, no asumirlo |
| `scripts/test_*.mjs` (74) | `tests/` (nueva carpeta) o dejarlos | 🔴 Alto | Estos SÍ se ejecutan por CI/rutinas de verificación con la ruta `scripts/test_*` hardcodeada en varios lugares (visto en checkpoints anteriores). Mover 74 archivos exige actualizar cada referencia — se recomienda hacerlo en un lote aparte, no junto con lo demás |
| `06_E_Commerce_Lux/`, `08_Research_Labs/miniverse`, `apps/site` (cascarones reaparecidos) | eliminar de nuevo | 🟢 Bajo | Ya se confirmó vacíos/duplicados en R02; el único riesgo es no investigar primero POR QUÉ reaparecieron (si es un script vivo que los recrea, eliminar sin arreglar la causa hace que vuelvan) |
| `apps/orca/` completo | evaluar consumidores antes de tocar | 🔴 Alto | No se propone mover en este bloque — requiere primero un grep de quién importa desde `apps/orca/...` en vez de `platform/orca/...` |
| `data/n8n_workflows.json` | `data/config/` | 🟢 Bajo | Un solo archivo, referenciarlo debería ser trivial de actualizar (buscar el nombre exacto) |
| `edx_cookies.json` | revisar contenido primero | 🔴 Alto (sin clasificar) | No se propone mover a ningún lado todavía — hay que abrir y confirmar si tiene cookies reales antes de decidir si va a `.gitignore`+`historicos/` o se elimina |

## 7. Resumen de riesgo

**🟢 Bajo riesgo (mover y listo, reversible sin tocar imports):**
- Corregir `package.json` de la raíz (identidad, no scripts activos)
- Eliminar de nuevo los cascarones vacíos reaparecidos
- Mover `data/n8n_workflows.json` a `data/config/`
- Agrupar `scripts/diagnose_*.mjs` en `scripts/diagnostics/`

**🟡 Riesgo medio (mover pero actualizar referencias conocidas):**
- Agrupar `scripts/careerai_*.mjs` y `scripts/orca_*.mjs` en subcarpetas

**🔴 Requiere cuidado (fuera de este bloque, decisión aparte):**
- Mover los 74 `scripts/test_*.mjs`
- Retirar `apps/orca/` (requiere auditoría de consumidores primero)
- Clasificar `edx_cookies.json`
- `05_Backups/` completo (ya documentado como pendiente de decisión desde la sesión anterior)

## 8. Propuesta B (Clean Code / lean, diseño emergente) — alternativa a la Propuesta A (ADR-0002)

**No se ejecuta nada.** Esto es una segunda opción para que el usuario elija antes de
tocar el repo. Propuesta A = el árbol de la sección 3 (ADR-0002 / PLAN.md de
Downloads, ~12 carpetas de primer nivel). Propuesta B = la idea de este bloque:
producto/plataforma/worker/client-solution es **metadata en `workspace.json`**, no
jerarquía de carpetas.

### 8.1. Apps reales verificadas ahora mismo en el repo

Antes de escribir el árbol se verificó contra el repo real (no se inventó ninguna):
`platform/orca/`, `platform/client-gateway/`, `products/{getupsoft-site,easycount,
smartdoor,boat,getupnet}/`, `client-solutions/galantes-jewelry/`. **`careerai` NO es
una app separada** — vive como módulo dentro de `platform/orca/src/careerai/`, así que
en la Propuesta B no aparece como carpeta propia bajo `apps/`.

```text
GetUpSoft_Workspace/
├── README.md
├── AGENTS.md
├── workspace.json          # metadata por app: tipo (product|platform|worker|client), owner, estado
│
├── apps/
│   ├── orca/                # incluye careerai/ como modulo interno (src/careerai/)
│   ├── client-gateway/
│   ├── getupsoft-site/
│   ├── easycount/
│   ├── smartdoor/
│   ├── boat/
│   ├── getupnet/
│   └── galantes-jewelry/    # checkout independiente, solo referencia (igual que hoy)
│
├── packages/                 # codigo compartido entre apps (hoy: libraries/third-party)
├── infra/                    # compose, deploy, observabilidad (hoy: infrastructure/)
├── docs/                     # ADRs, runbooks, decisiones (absorbe _Knowledge_Center)
└── .runtime/                 # fuera de git: datos, logs, perfiles de navegador, backups
```

### 8.2. Tabla de decisión: dónde cae cada carpeta de A en B

| Carpeta en A (ADR-0002) | Dónde cae en B | Por qué |
|---|---|---|
| `platform/orca/`, `platform/client-gateway/` | `apps/orca/`, `apps/client-gateway/` | La distinción "plataforma" vs "producto" pasa a ser un campo `type` en `workspace.json`, no una carpeta separada |
| `products/*` (6 apps) | `apps/*` (mismas 6 carpetas) | Igual que arriba — `type: product` en metadata |
| `client-solutions/galantes-jewelry/` | `apps/galantes-jewelry/` | Igual — `type: client`. El tratamiento especial (checkout independiente, no trackeado) se mantiene igual en ambas propuestas |
| `workers/{printing,documents,data,browser,ai}/` | **Elimina la carpeta** — cada worker real (ej. `local_printer_agent`) pasa a ser una app más bajo `apps/` con `type: worker` | En A, `workers/` hoy está completamente vacía (verificado en la sección 4) — B no crea slots especulativos, solo carpetas con contenido real |
| `integrations/{odoo,n8n}/` | `packages/odoo/`, `packages/n8n/` (si son compartidas por varias apps) o quedan dentro de la app que las usa | Se colapsa "integración" como categoría separada; si el conector lo usa una sola app, vive con ella, no en un directorio aparte |
| `libraries/{internal,third-party}/` | `packages/` | Mismo concepto, un solo nombre |
| `infrastructure/*` | `infra/` | Mismo contenido, nombre mas corto, sin subcarpetas especulativas (`hosts/`, `observability/` vacías hoy no se crean hasta que haya contenido) |
| `tools/{workspace-cli,inventory,migration,verification}/` | `packages/workspace-cli/` (lo único que existe hoy con contenido real) | `inventory/`, `migration/`, `verification/` no existen como carpetas reales todavía — no se crean vacías |
| `_Knowledge_Center/*` (7 subcarpetas) | `docs/` (una sola carpeta, categorías como archivos/subcarpetas solo si hay contenido) | Menos navegación para llegar a un documento — hoy `_Knowledge_Center` ya existe pero sin la subestructura completa (ver sección 4) |
| `labs/`, `archives/` | Se quedan igual (o se renombran a `.runtime/labs`, `.runtime/archives` si son material no publicado) | Son experimentales/históricos — encajan en la idea de ".runtime = todo lo que no es código de producto" |
| `.runtime/*` (7 subcarpetas) | `.runtime/` (una sola carpeta, sin subcarpetas fijas) | Igual que `_Knowledge_Center` — se generan solo las que tengan contenido |

### 8.3. Trade-offs honestos

**Gana A (ADR-0002, 12 carpetas):**
- Mapeo explícito 1:1 con la visión corporativa ya escrita en el diseño integral (secciones 3 y 4 de ese documento hablan de roles/seguridad/hosting asumiendo esta jerarquía)
- Separación física entre "plataforma" y "producto" es visible sin abrir ningún archivo — útil si el equipo crece y alguien nuevo navega por carpetas antes de leer documentación
- Ya tiene trabajo real invertido (R01/R02 de la sesión anterior movieron contenido real a varias de estas carpetas)

**Gana B (lean, ~5 carpetas):**
- Cero carpetas vacías — hoy `workers/` existe vacía en A; B nunca crea un slot hasta que haya contenido real (principio YAGNI aplicado a la estructura de directorios)
- Menos saltos de navegación para un agente o desarrollador: `apps/<nombre>` siempre, sin decidir primero si algo es "producto" o "plataforma" o "cliente" antes de encontrarlo
- Los metadatos en `workspace.json` son consultables por script (exactamente lo que ya usa `tools/workspace-cli/`) — la jerarquía de carpetas no necesita cargar esa información dos veces
- Encaja mejor con "slice vertical": cada carpeta de `apps/` es una unidad desplegable completa, en vez de estar repartida conceptualmente entre `platform/`, `products/`, `client-solutions/`

### 8.4. Riesgo de migración de cada una (desde el estado actual)

| | Riesgo de migrar desde hoy |
|---|---|
| **A** | 🟡 Medio-bajo — gran parte del trabajo YA está hecho (R01/R02); falta sobre todo poblar `workers/` y absorber `docs/`/`scripts/` sueltos, tal como ya lista la sección 6 |
| **B** | 🔴 Medio-alto — exige un segundo movimiento sobre lo que A ya logró: `platform/orca` → `apps/orca`, `products/*` → `apps/*`, `client-solutions/galantes-jewelry` → `apps/galantes-jewelry`, más escribir el esquema de metadata en `workspace.json` y actualizar todo lo que ya referencia rutas `platform/`/`products/` (scripts, `tools/workspace-cli`, este mismo `CHANGE_TIMELINE.md`) |

**Nota de riesgo explícita:** elegir B ahora significa deshacer parte de R01/R02 (ya
comiteado y pusheado en la sesión anterior) para volver a moverlo con nombres nuevos —
no es una migración desde cero, es una segunda migración sobre una primera ya hecha.
