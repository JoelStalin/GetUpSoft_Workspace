# Prompt Maestro – Upgrade Completo **Jabiyaprod** de **Odoo 15 → Odoo 19** (Docker + Nginx + PostgreSQL + GitHub + Testing + Contexto IA)

**Modo:** AUTO (Lyra)  
**Rol esperado del modelo:** Arquitecto Senior Odoo v17+ + DevOps + QA Automation (Selenium)  
**Versión objetivo:** **Odoo 19.0** (Community o Enterprise según aplique)  
**Repo oficial a verificar:** `https://github.com/odoo/odoo` (branch **19.0**)  
**Importante (Odoo v17+):** No usar `attrs="..."` ni `states="..."` en vistas; trasladar lógica a backend y/o usar campos técnicos (booleans) para visibilidad/readonly/required.

---

## 1) Resumen del entendimiento (lo que necesito que hagas)

Necesito que actúes como un **Arquitecto Senior de Odoo v17+** y un **DevOps/QA Engineer**, y ejecutes un **upgrade completo** del proyecto **Jabiyaprod** desde **Odoo 15** hasta **Odoo 19**, cubriendo:

1. **Migración de código** de addons (custom + terceros) para compatibilidad con Odoo 19.
2. **Migración de base de datos** (y filestore si aplica) hacia la versión objetivo.
3. **Dockerización completa** del stack:
   - Odoo 19
   - PostgreSQL (mínimo 13, recomendado 16+)
   - Nginx (reverse proxy + HTTPS + websocket/gevent)
4. **Control de versiones en GitHub**:
   - estrategia de ramas
   - PRs
   - Issues
   - CI/CD con GitHub Actions
5. **Loop de calidad (obligatorio)**: `prueba → error → investigación → fix → prueba` hasta quedar **cero errores** (tests + arranque + flows funcionales).
6. **Testing automatizado**:
   - Unit tests (Odoo unittest + test-tags)
   - Quality checks (linting, security)
   - Functional/E2E con **Selenium** (headless + screenshots en fallos)
7. Crear un **“Directorio de Contexto IA”** dentro del repo para “memoria a largo plazo” del proyecto:
   - registrar cambios exitosos
   - registrar cambios fallidos/errores y su causa
   - registrar decisiones arquitectónicas
   - registrar comandos usados y outputs relevantes
   - registrar “playbooks” de troubleshooting

---

## 2) Estado de evidencias (provistas / no provistas)

### 2.1 Evidencias provistas
- **Repositorio del proyecto** (zip): `jabiyaprod.zip` (contiene addons y configuración Odoo 15 con docker-compose).
- **Documento** (PDF) con contexto de Odoo/arquitectura y prácticas generales (no necesariamente del repo): `Sastre - Desarrollo de una aplicación para Odoo ERP.pdf`.
- Repositorio de scripts útil para migración de vistas (v17+):  
  `https://github.com/JoelStalin/Odoo_up_db` (script “attrs replacer”).

### 2.2 Evidencias NO provistas (por ahora)
- Dump real de base de datos (`.dump`, `.sql`) y/o **filestore**.
- Logs/tracebacks de errores actuales.
- Lista exacta de módulos instalados en producción y su orden/prioridad.
- Lista de integraciones externas (APIs, cron jobs, webhooks, tokens).

> **Si no se entregan evidencias**: trabajarás con supuestos razonables, pero deberás dejar **explícitos** esos supuestos en el directorio de Contexto IA.

---

## 3) Contexto técnico inicial detectado en el repo (baseline)

> **Nota:** esto es una foto inicial del código; tú debes **verificarlo** al iniciar.

- Existe `docker-compose.yml` con un servicio `odoo:15.0` sin Postgres/Nginx incluidos.
- `config/odoo.conf` apunta a DB en host externo y tiene `proxy_mode = True`.
- Addons presentes (mezcla de custom y terceros, con versiones diversas):
  - `api`, `api_models`, `api_views`, `api_worker`, `dependencies_modules` (custom)
  - `account_mass_reconcile` (15)
  - `report_xlsx` (15)
  - `account_statement_base` (16)
  - `account_reconcile_oca` (16)
  - `stock_inventory_adjustment` (17)
  - `bi_website_loyalty` (14)
  - `stock_location_limit_product` (12)
  - `sr_price_history_for_product` (15)
- Se detecta uso de `attrs=` / `states=` en varias vistas XML (incompatible con Odoo 17+ sin refactor).

---

## 4) Preguntas obligatorias (máximo 3) + evidencias técnicas (CRÍTICO)

Antes de proponer cualquier solución definitiva, haz **máximo 3 preguntas**.  
Una de ellas debe ser obligatoriamente:

> **¿Dispones de alguna de las siguientes evidencias que puedas compartir ahora mismo?**  
> - Mensajes de error (traceback completo)  
> - Logs relevantes de Odoo (server logs, `_logger`)  
> - Dump de base de datos + versión exacta de Postgres actual  
> - Filestore (o tamaño/ubicación)  
> - Lista de módulos instalados y módulos críticos (Top 10)  
> - Diferencia exacta entre comportamiento esperado vs real

⚠️ **Pero NO bloquees el avance**: si no hay respuesta, continúa con supuestos explícitos.

---

## 5) Restricciones no negociables (Odoo + seguridad + calidad)

1. **Solo Odoo v17, v18, v19** (objetivo: **19**).  
   - La migración desde v15 se hará **por etapas**: 15 → 16 → 17 → 18 → 19 (código y datos).
2. **ORM-first**: evitar SQL directo salvo migraciones/optimización justificadas.
3. Respetar **ACLs**, **Record Rules**, **multi-company**.
4. `sudo()` solo con justificación y minimizando el alcance.
5. Overrides siempre con `super()`.
6. **Vistas XML v17+**: prohibido `attrs="..."` y `states="..."`.  
   - La visibilidad/readonly/required debe depender de **campos** (booleans o selection helpers) computados en backend.
7. Entregables deben ser **productivos y reproducibles** (Docker + CI).

---

## 6) Objetivo final medible (“Definition of Done”)

No consideres la migración “terminada” hasta cumplir TODO:

- [ ] Odoo 19 inicia en Docker, detrás de Nginx, con Postgres en contenedor (sin dependencias externas).
- [ ] Base de datos migrada a 19 con integridad (y filestore fusionado si aplica).
- [ ] Todos los addons necesarios están disponibles en versión compatible y **se instalan** sin errores.
- [ ] `-u all` (update all) se ejecuta sin traceback.
- [ ] Unit tests pasan (`--test-enable` y/o `--test-tags`).
- [ ] E2E Selenium pasa para los flujos críticos.
- [ ] Lint/quality checks pasan en CI.
- [ ] Directorio **Contexto IA** actualizado con:
  - cambios exitosos
  - cambios fallidos y causa/solución
  - comandos y evidencias
- [ ] Documentación de despliegue y rollback lista.

---

## 7) Plan maestro de migración (en etapas)

### 7.1 Etapa 0 — Congelar baseline (Odoo 15)
**Objetivo:** tener un punto de referencia “golden” reproducible.

Tareas:
- Crear branch/tag `baseline/odoo15`.
- Exportar:
  - Dump DB (ideal: `pg_dump --format=custom`)
  - Filestore (`/var/lib/odoo/filestore/<db>`)
  - Lista de módulos instalados (Settings → Apps → Installed, o query controlada)
- Ejecutar smoke test (manual + automatizado mínimo).

Entregables:
- `/.ai_context/baseline/` con dumps (si el repo no debe contenerlos, documentar storage externo + checksum).
- `/.ai_context/baseline/INSTALLED_MODULES.md`
- `/.ai_context/baseline/SMOKE_TESTS.md`

---

### 7.2 Etapas 1-4 — Upgrade incremental (recomendado)
**Regla:** cada salto de versión produce **una rama**, **un pipeline**, y un set de fixes.

- `upgrade/16.0`
- `upgrade/17.0`
- `upgrade/18.0`
- `upgrade/19.0`

En cada etapa:
1. **Actualizar dependencias de terceros** (OCA/marketplace) a la rama correspondiente.
2. Migrar addons custom (Python + XML + JS).
3. Ejecutar:
   - instalación en DB limpia
   - update en DB migrada
   - unit tests + lint
   - selenium E2E (mínimo smoke)

---

## 8) Migración de vistas XML (v17+ sin attrs)

### 8.1 Estrategia segura (en 2 pasos)
1) **Conversión mecánica**: ejecutar herramienta de reemplazo para identificar y reemplazar `attrs=` y `states=` en XML.  
   - Usar el repo de scripts: `JoelStalin/Odoo_up_db` (script `replace_attrs.py`).  
   - Resultado: XML “compila”, pero puede quedar con expresiones que debes **refactorizar**.

2) **Refactor funcional**: convertir expresiones complejas a **campos técnicos** en backend:
   - `x_show_field = fields.Boolean(compute=..., store=False)`  
   - usar `invisible="not x_show_field"` (solo referencias a campos, no expresiones tipo `state in (...)`).

**Regla:** todo lo que antes estaba en `attrs` debe terminar en:
- compute booleans / compute selection helpers
- constraints/guards en backend (si es lógica de negocio, no de UI)

---

## 9) Migración de código Python (addons custom)

Checklist por módulo custom:
- [ ] `__manifest__.py` actualizado (version, depends, assets, license).
- [ ] Revisión de imports y APIs deprecadas entre 15→19.
- [ ] Revisión de modelos estándar renombrados/cambiados (validar en repo oficial 19.0).
- [ ] Revisión de campos calculados y `@api.depends`.
- [ ] Revisión de seguridad (`ir.model.access.csv`, record rules).
- [ ] Revisión de controladores web (`controllers/`) y rutas.
- [ ] Multi-company: `company_id`, `allowed_company_ids`.
- [ ] Eliminación de hacks de SQL o `sudo()`.

---

## 10) Migración de JS / Assets (web framework)

- Verificar si los assets usan `@odoo-module`, `patch`, OWL components.
- Migrar cualquier JS legado a la forma soportada en 19.
- Revalidar `manifest['assets']` y bundles (`web.assets_backend`, `web.assets_frontend`, etc).

---

## 11) Migración de base de datos (DB Upgrade)

### 11.1 Opciones aceptadas
Debes elegir y justificar la estrategia:

**Opción A – OpenUpgrade (OCA)**  
- Recomendado para Community y upgrades grandes.
- Requiere scripts y pasos por versión.

**Opción B – Upgrade platform / scripts oficiales**  
- Para Enterprise es el camino “SLA”.
- Para Community puede no estar soportado oficialmente: documentar riesgos.

### 11.2 Reglas
- Cada salto de versión debe:
  - migrar DB + actualizar módulos
  - registrar en `/.ai_context/migrations/<version>/`:
    - comandos exactos
    - logs
    - checklist de validación
    - issues encontrados + resolución

---

## 12) Dockerización completa (Odoo + Postgres + Nginx)

### 12.1 Estructura recomendada del repo
```
/docker
  /odoo
    Dockerfile
    entrypoint.d/
  /nginx
    odoo.conf
    snippets/
  /postgres
    initdb/
docker-compose.dev.yml
docker-compose.prod.yml
.env.example
/config
  odoo.conf
/addons
  /custom
  /third_party
/tests
  /unit
  /quality
  /e2e_selenium
/.ai_context
  /baseline
  /migrations
  /changes_success
  /changes_failed
  /decisions
  /runbooks
  INDEX.md
```

### 12.2 Requisitos Nginx mínimos
- HTTPS termination (ideal: Let’s Encrypt / certbot o reverse proxy externo).
- Proxy headers para `proxy_mode`.
- Websocket/gevent en `/websocket` hacia puerto 8072.
- Timeouts altos (720s) para operaciones largas.
- gzip habilitado.

---

## 13) Directorio “Contexto IA” (memoria a largo plazo del proyecto)

Crear `/.ai_context/` (o `contexto_ia/`) con el siguiente estándar:

### 13.1 Índice
`/.ai_context/INDEX.md` debe enlazar todo:
- baseline
- decisiones
- migraciones por versión
- errores recurrentes
- cambios exitosos/fallidos

### 13.2 Registro de cambios (obligatorio)
Cada cambio significativo debe registrarse como un “case”:

`/.ai_context/changes_success/2026-03-10__short_title.md`
- Contexto
- Objetivo
- Archivos tocados
- Cambios realizados
- Evidencia (logs, test output)
- Resultado
- Cómo revertir

`/.ai_context/changes_failed/2026-03-10__short_title.md`
- Contexto
- Qué intenté
- Error exacto (traceback)
- Hipótesis
- Qué NO funcionó
- Fix sugerido / next steps

---

## 14) Testing automatizado (Unit + Quality + Functional)

### 14.1 Unit tests Odoo
- Añadir tests por módulo en `addons/<module>/tests/`.
- Ejecutar tests en CI usando:
  - `--test-enable`
  - `--test-tags`
  - `--stop-after-init`
- Generar reportes + logs.

### 14.2 Quality checks
- Lint Python (ej: `ruff`/`flake8`) y formateo.
- Validación de XML (well-formed + schema básico).
- Reglas anti-secrets: nunca commitear credenciales reales.

### 14.3 Selenium E2E (obligatorio)
- `tests/e2e_selenium/` con:
  - `requirements.txt` (selenium)
  - `pages/` (Page Object Model)
  - `flows/` (casos críticos)
  - `screenshots/` (artefactos de fallos)
- Ejecutar en GitHub Actions con Chrome headless (o contenedor selenium/standalone-chrome).

**Casos mínimos sugeridos (adaptar al negocio):**
- Login
- Navegación a módulo principal
- Creación/edición de registro crítico
- Reporte/Export
- Flujo de website (si aplica)

---

## 15) Loop obligatorio de “Prueba → Error → Investigación → Fix → Prueba”

Implementa este protocolo y NO lo rompas:

1. **Prueba**: ejecutar comando/test con parámetros reproducibles.
2. **Captura de error**: copiar traceback/log completo (texto, no screenshots).
3. **Investigación**:
   - localizar archivo/línea
   - buscar cambio de API en branch oficial 19.0
   - identificar solución mínima
4. **Fix**:
   - aplicar cambio
   - añadir test o reforzar cobertura si aplica
   - documentar en Contexto IA
5. **Re-prueba**: repetir el mismo comando/test.
6. **Stop condition**: solo parar cuando el pipeline esté verde + E2E pase.

---

## 16) GitHub: estrategia de ramas + CI/CD

### 16.1 Estrategia sugerida
- `main`: estable (Odoo 19)
- `baseline/odoo15`: snapshot
- `upgrade/16.0`, `upgrade/17.0`, `upgrade/18.0`, `upgrade/19.0`
- Feature branches: `feat/<...>` para cambios puntuales

### 16.2 GitHub Actions (mínimo)
Workflows:
1. `lint.yml`
2. `unit-tests.yml`
3. `e2e-selenium.yml`
4. `security.yml` (secret scanning + dependency audit)

Artefactos:
- logs
- screenshots selenium
- reports unit tests

---

## 17) Verificación obligatoria en repo oficial (odoo/odoo)

En cada cambio de compatibilidad:
1. Confirmar versión objetivo: **19.0**
2. Branch: `19.0`
3. Localizar módulo/archivo relevante en `addons/...` o `odoo/...`
4. Verificar firma de métodos, nombres de campos, assets, rutas
5. Guardar evidencia en `/.ai_context/decisions/` con:
   - ruta consultada
   - commit (si aplica)
   - razón del cambio

---

## 18) Formato de salida (OBLIGATORIO)

Devuelve tus resultados como:

1) **Plan de migración** con hitos  
2) **PRs sugeridos** (lista)  
3) **Cambios por módulo** (tabla o bullets)  
4) **Comandos reproducibles** (docker compose, odoo-bin, pg tools)  
5) **Docker files/configs** listos para pegar  
6) **Estrategia de testing** + ejemplos Selenium  
7) **Checklist final** (Definition of Done)

---

## 19) Prompt optimizado (COPIAR / PEGAR)

> Pega TODO lo siguiente en tu IA objetivo (ChatGPT/Claude/etc.) y úsalo como “prompt de trabajo”:

```md
# 🔥 PROMPT MAESTRO – Upgrade Completo Jabiyaprod (Odoo 15 → Odoo 19) con Docker + Nginx + Postgres + GitHub + CI + Selenium

## Rol
Actúa como:
1) **Arquitecto Senior de Odoo 19 (v17+)**
2) **DevOps Engineer (Docker, Nginx, Postgres)**
3) **QA Automation Engineer (Unit + Quality + Selenium E2E)**

## Paso previo obligatorio (evidencias)
Antes de proponer soluciones definitivas:
1. Indica si el usuario proporcionó:
   - Logs / tracebacks
   - Código actual (repo)
   - Dump DB + filestore
   - Lista de módulos instalados
2. Si existen, **analízalos primero** (prioridad absoluta).
3. Si no existen, declara **supuestos explícitos** y continúa.

### Pregunta obligatoria (no bloqueante)
¿Dispones de alguna de estas evidencias para acelerar y reducir riesgo?
- Traceback completo
- Logs de servidor
- Dump DB + filestore
- Lista de módulos instalados
- Flujos críticos del negocio (Top 5)
- Integraciones externas (APIs/cron/webhooks)

## Restricciones
- Objetivo: **Odoo 19.0** (branch `19.0` del repo oficial `odoo/odoo`).
- Migración incremental: **15 → 16 → 17 → 18 → 19**.
- ORM-first + seguridad Odoo (ACLs, record rules, multi-company).
- Overrides con `super()` obligatorio.
- **Vistas v17+**: prohibido `attrs=`/`states=`. Convertir a:
  - booleans técnicos computados
  - invisibility/readonly basado en campos (no expresiones directas complejas).
- Debes implementar un **loop de pruebas** hasta 0 errores.

## Contexto del proyecto (baseline)
- Repo contiene addons custom y terceros, además de config y docker-compose v15.
- Hay uso de `attrs=` en XML (incompatible v17+).
- Se requiere dockerizar Postgres y Nginx, además de Odoo.
- Se requiere CI/CD GitHub Actions y tests (unit + quality + selenium).

## Objetivos y entregables
1) Migrar addons a Odoo 19 (código + vistas + assets).
2) Migrar DB y filestore.
3) Entregar docker-compose DEV y PROD (Odoo+Postgres+Nginx).
4) Config Nginx (HTTPS + websocket/gevent) + proxy_mode.
5) Crear directorio `/.ai_context/` para memoria de cambios:
   - casos exitosos y fallidos
   - decisiones y evidencias
   - runbooks
6) Crear `/tests/` con:
   - unit tests Odoo
   - quality checks
   - Selenium E2E
7) Implementar loop: **test → error → investigación → fix → test** hasta que:
   - Odoo arranque sin errores
   - `-u all` pase
   - tests y E2E pasen

## Metodología de trabajo (obligatoria)
### Fase A – Diagnóstico
- Inventariar módulos (custom vs terceros).
- Mapear dependencias y reemplazos necesarios (OCA repos / versiones).
- Identificar integraciones externas y variables de entorno.

### Fase B – Dockerización
- Crear `docker-compose.dev.yml` y `docker-compose.prod.yml`.
- Incluir:
  - `odoo` (19.0)
  - `db` (postgres >= 13)
  - `nginx` (reverse proxy + websocket)
- Agregar volúmenes persistentes:
  - Postgres data
  - Odoo filestore
- Crear `.env.example` (sin secretos reales).

### Fase C – Migración por versiones (15→16→17→18→19)
En cada salto:
1) Actualiza dependencias de terceros a la versión del salto.
2) Ajusta código custom.
3) Ejecuta instalación en DB limpia.
4) Migra DB (OpenUpgrade/upgrade scripts) y corre `-u all`.
5) Corre unit tests + quality + E2E.
6) Documenta TODO en `/.ai_context/migrations/<version>/`.

### Fase D – Loop de calidad (NO NEGOCIABLE)
Mientras exista cualquier error:
- Ejecutar pruebas
- Capturar error completo (texto)
- Investigar: ubicar archivo/método y verificar en repo oficial `odoo/odoo` branch objetivo
- Aplicar fix mínimo
- Añadir test si aplica
- Re-ejecutar pruebas
Repetir hasta 0 errores.

## Reglas de salida
Devuelve un único informe en Markdown con:
1) Plan de migración por etapas + riesgos
2) Checklist por módulo
3) Cambios propuestos (con rutas/archivos)
4) Configs Docker/Nginx listas
5) Pipeline GitHub Actions
6) Diseño del directorio `.ai_context`
7) Suite de tests + ejemplos Selenium
8) Checklist final “Definition of Done”
```

---

## 20) Checklist de validación (para ti, IA ejecutora)

### Migración técnica
- [ ] Confirmé Odoo 19.0 y branch 19.0 en `odoo/odoo`.
- [ ] Confirmé requisitos mínimos (Python 3.10+, Postgres 13+).
- [ ] Eliminé `attrs`/`states` y refactoricé a booleans en backend.
- [ ] Migré todos los módulos custom y terceros o los reemplacé.
- [ ] `-u all` sin traceback.

### Docker/DevOps
- [ ] Postgres en contenedor con volumen persistente.
- [ ] Nginx reverse proxy con `/websocket` hacia gevent.
- [ ] `proxy_mode` habilitado.
- [ ] `.env.example` sin secretos.

### Testing/QA
- [ ] Unit tests corren en CI.
- [ ] Quality checks corren en CI.
- [ ] Selenium E2E corre en CI y produce screenshots en fallos.

### Contexto IA
- [ ] `/.ai_context/INDEX.md` actualizado.
- [ ] Registré cambios exitosos y fallidos.
- [ ] Guardé comandos y evidencias.

---

## 21) Referencias rápidas (para el equipo)

- Repo oficial Odoo: `https://github.com/odoo/odoo`  
- Docs Upgrade Odoo 19: `https://www.odoo.com/documentation/19.0/administration/upgrade.html`  
- Docs Deploy/Nginx sample: `https://www.odoo.com/documentation/19.0/administration/on_premise/deploy.html`  
- CLI (tests / gevent / proxy): `https://www.odoo.com/documentation/19.0/developer/reference/cli.html`  
- Script attrs replacer (v17+): `https://github.com/JoelStalin/Odoo_up_db`




---

## 22) EXTENSIÓN (SIN ROMPER EL PROMPT) — Plantilla **Chefalitas** + Backups obligatorios + Política **main vs main_pro**

> Esta sección se **agrega** al prompt anterior (sin eliminar nada) para cumplir con los requisitos nuevos basados en el repo `JoelStalin/Chefalitas`.

### 22.1 Revisión obligatoria del repo Chefalitas (plantilla de despliegue)

Usa el repo Chefalitas como **referencia de despliegue** (estructura + docker-compose + nginx + scripts + workflow).  
Elementos confirmados en ese repo:
- Estructura raíz con: `.github/workflows`, `addons/`, `backups/`, `config/`, `nginx/`, `odoo/`, `postgres-config/`, `docker-compose.yml`, `restart.sh`, `.env`.  
- `backups/` contiene scripts: `backup_odoo18.sh` y `restore_odoo18.sh`.  
- `.github/workflows/deploy.yml` separa despliegue “solo addons” en `main` y despliegue completo en otro branch (en Chefalitas se llama `main-full`).  

### 22.2 Nueva distribución de directorios (adoptar estilo Chefalitas)

**Objetivo:** que tu repo de upgrade y despliegue (Odoo 19) adopte la misma base:

```
.github/workflows/
addons/
  external/              # ✅ ÚNICO directorio permitido a cambiar en branch main
  custom/                # código propio (solo se toca en main_pro)
  requirements.txt
backups/
  backup_odoo19.sh
  restore_odoo19.sh
config/
  odoo.conf
nginx/
  conf.d/
  templates/
  html/
  ssl/
odoo/
  Dockerfile
postgres-config/
  pg_hba.conf
  postgresql.conf
tmp/
tests/
  unit/
  quality/
  e2e_selenium/
.ai_context/
  ...
docker-compose.yml
restart.sh
.env.example
README.md
```

> Nota: Si ya existe otra estructura (ej: `/docker/...`), **no la borres**: migra gradualmente. Pero el “layout” final debe quedar como arriba (Chefalitas-like).

### 22.3 Scripts de backup (tomados de Chefalitas, adaptados a Odoo 19)

#### 22.3.1 Reglas de backup
- El backup se ejecuta **cada vez que se modifique `main`**, **ANTES** de aplicar cambios.
- El backup debe generar (mínimo):
  1) `.tgz` del volumen de Postgres
  2) `.tgz` del volumen de Odoo (filestore/data)
  3) `.sql.gz` lógico con `pg_dumpall`
- Política de retención:
  - Mantener **solo el último** backup (como en Chefalitas), o
  - Mantener N backups (si el storage lo permite). Debes documentar la política en `.ai_context/decisions/`.

#### 22.3.2 Implementación recomendada (adaptación directa)
- Copiar `backups/backup_odoo18.sh` → `backups/backup_odoo19.sh`
- Copiar `backups/restore_odoo18.sh` → `backups/restore_odoo19.sh`
- Reemplazar valores:
  - Volúmenes: `odoo19_*` (según tu `docker-compose.yml`)
  - Contenedor Postgres: usar nombre de servicio o detectar con `docker compose ps -q db`
  - Usuario PG: `POSTGRES_USER` del `.env`
  - Proyecto: usar `COMPOSE_PROJECT_NAME` para nombres estables

**Mejora obligatoria (robustez):**
En vez de hardcodear `PG_CONTAINER="odoo19-db-1"`, detectar así:
- `PG_CONTAINER="$(docker compose ps -q db)"`
- y luego `docker exec "$PG_CONTAINER" ...`

### 22.4 Política de ramas: `main` restringido + `main_pro` para cambios completos

#### 22.4.1 Regla de oro
- **Branch `main`**:
  - Solo se permite actualizar **addons externos** (`addons/external/**`).
  - El pipeline de deploy en `main` debe:
    1) **ejecutar backup** (SSH al servidor → `./backups/backup_odoo19.sh`)
    2) subir **solo** `addons/external/` (y opcionalmente `addons/requirements.txt` si estrictamente necesario)
    3) reiniciar solo Odoo (`restart.sh`) sin tocar DB

- **Branch `main_pro`**:
  - Se permiten cambios en TODO el repo (docker, nginx, config, scripts, addons custom, tests, workflows, etc.).
  - Su deploy es “FULL”:
    - subir repo completo a directorio temporal
    - swap atómico (o blue/green)
    - reiniciar stack completo si aplica

> Esto replica el patrón del workflow de Chefalitas donde `main` despliega addons y otro branch despliega todo.

#### 22.4.2 Guardrails automáticos (obligatorio)
Implementar 2 controles en GitHub:

1) **Path Guard para `main`** (falla si hay cambios fuera de `addons/external/**`):
- Workflow: `.github/workflows/guard_main_paths.yml`
- Trigger: `pull_request` con base `main` + `push` a `main` (por seguridad).
- Lógica: si detecta cambios fuera de rutas permitidas, falla con mensaje:
  - “Este cambio debe ir a `main_pro` (deploy FULL).”

2) **Backup Gate para `main`** (backup antes del deploy):
- Integrar en `.github/workflows/deploy.yml` (ver 22.5):
  - Paso inicial por SSH: `cd ~/odoo19/backups && ./backup_odoo19.sh`
- Recomendado: branch protection en GitHub:
  - requerir `guard_main_paths` + `deploy` en verde antes de permitir merge.

### 22.5 Workflow de deploy estilo Chefalitas (adaptado a tus ramas)

Crea/ajusta `.github/workflows/deploy.yml` para reflejar:
- `push` a `main` → deploy **solo** `addons/external` **+ backup previo**
- `push` a `main_pro` → deploy **FULL** (swap atómico)

**Pseudoplantilla (a implementar tal cual en el repo):**
- Job `deploy-external-addons` (solo `main`):
  1) SSH: ejecutar backup (`./backups/backup_odoo19.sh`)
  2) SCP: subir `addons/external` a `~/odoo19/addons/external`
  3) SSH: `bash ./restart.sh` (solo Odoo)
- Job `deploy-full` (solo `main_pro`):
  1) SCP: subir repo completo a `~/odoo19_tmp_<run_id>`
  2) SSH: swap `~/odoo19_tmp_<run_id>` → `~/odoo19`
  3) SSH: `bash ./restart.sh` (y si cambia docker-compose, `docker compose up -d --build`)

> Importante: nunca guardar passwords reales en `.env` del repo. Usa `secrets` + `.env.example`.

### 22.6 ACTUALIZACIÓN del “PROMPT OPTIMIZADO” (sin borrar el bloque existente)

Al final del bloque **“Prompt optimizado (COPIAR/PEGAR)”** agrega esta cláusula adicional:

```md
## Política de ramas y despliegue (Chefalitas-like)
- `main`: SOLO actualiza `addons/external/**`. Antes de cualquier deploy en `main`, ejecutar backup en servidor (script `backups/backup_odoo19.sh`).
- `main_pro`: cambios completos del repo (docker/nginx/config/addons custom/tests/workflows). Deploy FULL con swap atómico.

## Requisito de backup (gate)
Cada push/merge a `main` debe ejecutar **backup previo** (DB + filestore + pg_dumpall) y registrar evidencia en `/.ai_context/changes_success/` o `/.ai_context/changes_failed/`.
```

---

### 22.7 Evidencias de Chefalitas usadas para este anexo (para trazabilidad)
- Estructura y README (incluye menciones de backups): ver repo Chefalitas.
- Scripts `backup_odoo18.sh` y `restore_odoo18.sh` en `backups/`.
- Workflow `.github/workflows/deploy.yml` con despliegue diferenciado por branch.
