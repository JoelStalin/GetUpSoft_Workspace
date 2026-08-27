# CHANGE_TIMELINE

Registro cronológico de checkpoints por sesión. Cada entrada deja el commit de
cierre y la forma de revertir.

---

## 2026-08-26 — Cierre del agente CareerAI (seguimiento en ORCA + live browser)

**Rama:** `careerai/live-browser-run-tracking` (base: `4dadce0b31` en `main`)

**Commits:**

| Commit | Descripción |
|---|---|
| `3ccfc5c7a7` | feat(careerai): seguimiento del run en ORCA + live browser y form fill externo |
| `8ac3f15481` | test(careerai): evidencia Playwright del canvas con live browser |
| `1f5b00f832` | docs: agregar CHANGE_TIMELINE con el checkpoint de cierre |
| (este) | fix(careerai): doctor de Hermes reconoce el transporte CLI |

**Qué cambió:**

1. **Regresión corregida.** `/api/careerai/prepare-only` y `/api/careerai/connectors`
   habían desaparecido al renombrar `serve-orca-local.mjs` → `start_orca_local.mjs`.
   El fallback del SPA las respondía con `index.html` y HTTP 200, ocultando el fallo.
   Reimplementadas; cualquier `/api/*` desconocido ahora devuelve `404 JSON`.
2. **Fuente única prepare-only:** `apps/orca/src/careerai/prepare-only.mjs`, usada por
   el CLI y por el servidor local.
3. **Seguimiento de ejecuciones:** `apps/orca/src/careerai/runs.mjs` +
   `POST/GET /api/careerai/runs`, `GET /api/careerai/runs/:id`, SSE `/stream`.
   Persistencia local en `data/careerai/runs.jsonl` (ignorada por git).
4. **Live browser y formularios externos:** blueprint `careerai-indeed-agent` pasa de
   15 → 17 nodos y 22 edges, con `external-form-fill` (prepare-only; indeed, linkedin,
   glassdoor, workday, greenhouse, lever; pausa en login/consent/captcha/mfa/upload/submit)
   y `live-browser-monitor` (`read_only_until_approval: true`).

5. **Falso negativo del doctor de Hermes.** Solo evaluaba `HERMES_API_KEY`, pero Hermes
   está instalado como CLI local (`HERMES_CLI_PATH` → Hermes Agent v0.18.2). Nuevo
   `apps/orca/src/careerai/hermes-doctor.mjs` reconoce transporte `http` o `cli`;
   el gate pasa de PARTIAL a PASS.

**Verificación:** 12/12 scripts CareerAI en verde.

```
npm run orca:start                 # servidor local en 127.0.0.1:4173
npm run careerai:regression        # 8 scripts offline
npm run careerai:regression:live   # 4 scripts contra el servidor + Playwright
```

Evidencia visual: `task-ledger/evidence/careerai/canvas-live-browser.png`.

**Gates de seguridad intactos:** `submit_performed` siempre `false`, aprobación humana
obligatoria por oportunidad, LinkedIn en `discovery-only`.

**Bloqueado por decisión del propietario (no por código):**
- Envío real de WhatsApp: las credenciales de Meta ya existen en `.env.local`; el canal
  se mantiene en `draft-only` a propósito. Habilitarlo es una decisión explícita.

**Cómo revertir:**

```
git revert 8ac3f15481 3ccfc5c7a7    # revertir los cambios conservando historial
# o descartar la rama completa:
git checkout main && git branch -D careerai/live-browser-run-tracking
```

**Fuera de alcance de esta sesión (sin tocar):** cambios locales sin commitear en
`AGENTS.md`, `context/prompts/system_prompt.md` y `docs/agent-state.md`, pertenecientes
a otra tarea.

**Siguiente tarea segura sugerida:** ver `TASK_INVENTORY.md` §2.5 (Session 13:
push/deploy/tests funcionales) y §2.4 (Fase 1 del refactor del editor ORCA).

---

## 2026-08-26 — Hallazgo abierto: dos linajes de git comparten este directorio

Al intentar rebasear la rama de CareerAI sobre `main` se detectó que **`main` y la base
de esta rama pertenecen a repositorios distintos que conviven en el mismo directorio**:

| | Base de esta rama (`4dadce0b31`) | `main` (`91d7eac09f`) |
|---|---|---|
| Raíz | `app/`, `components/`, `next.config.ts`, `proxy.ts` | `00_Workspace_Governance/`, `01_Core_Platform/`, `06_E_Commerce_Lux/`, … |
| Identidad | app Next.js de **Galantes Jewelry** | monorepo **GetUpSoft_Workspace** |
| Relación | `4dadce0b31` **no es ancestro de `main`** | `main` tiene 622 commits ausentes en esta rama |

En `main`, Galantes vive anidado en `06_E_Commerce_Lux/Galantesjewelry/Galantesjewelry/`.
Un cherry-pick de los commits de CareerAI sobre `main` produce conflictos de ruta
(`package.json`, `docs/`, `.gitignore`) porque git los reubica en esa carpeta anidada.

La sesión arrancó en **detached HEAD** sobre `4dadce0b31`, así que la rama
`careerai/live-browser-run-tracking` quedó sobre la base del linaje de Galantes aunque
los archivos de CareerAI viven en rutas del monorepo (`apps/orca/`, `scripts/`,
`data/careerai/`). El código está commiteado y pusheado y la regresión pasa, pero
**a qué base debe apuntar el PR es una decisión de topología del repo, no un arreglo
mecánico** — requiere tu criterio.

Opciones:

1. PR contra el linaje de Galantes (base actual) — es donde está la rama hoy.
2. Reubicar los archivos de CareerAI y abrir el PR contra `main` del monorepo.
3. Mantener la rama como checkpoint y decidir la ubicación definitiva más adelante.

No se tocó nada: el worktree temporal usado para la prueba fue eliminado y el árbol de
trabajo quedó intacto.

### Además: bloque `shared-agent-memory-rule` inyectado en un prompt de cliente

Los cambios locales sin commitear (`AGENTS.md`, `context/prompts/system_prompt.md`,
`docs/agent-state.md`) son inyecciones automáticas del mismo bloque de protocolo
multi-agente. En `context/prompts/system_prompt.md` es un defecto: ese archivo es el
system prompt del **chatbot de tienda de Galantes Jewelry**, y el bloque le inserta
`agent_id`, rutas locales de Windows y nombres de agentes internos en instrucciones de
cara al cliente. Se dejó sin tocar por pertenecer a otra sesión.

---

## 2026-08-26 — Pruebas reales en navegador visible (CareerAI)

Ejecutadas contra los portales en vivo, con navegador headed:

| Portal | Resultado |
|---|---|
| Indeed | HTTP 200, 50 ofertas reales renderizadas |
| LinkedIn Jobs | HTTP 200, 1.000+ ofertas visibles sin sesión |
| WeWorkRemotely | 5 ofertas reales; al seguir "Apply" redirigió a su propio login ("Sign in to verify your eligibility for this geolocked position") |

Todas las corridas terminaron en `stopped_at: human_approval_required` con
`submit_performed: false`. El agente no escribió credenciales en ningún momento.

**Scripts añadidos:** `careerai_live_browser_probe.mjs`, `careerai_live_apply_probe.mjs`,
`careerai_login_handoff.mjs`, `careerai_apply_with_chrome_profile.mjs`,
`careerai_session_vault.mjs`, `careerai_harvest.mjs`, `careerai_ocr.ps1`,
`careerai_profile_migrate.ps1`.

### Hallazgo: la migración del perfil de Chrome no traslada sesiones

`careerai_profile_migrate.ps1` copia el perfil `Default` (cookies incluidas, 2,4 MB)
sin cerrar Chrome, pero **las sesiones no sobreviven**: Chrome 127+ cifra las cookies
con App-Bound Encryption atada a la instalación original. Comprobado: LinkedIn e Indeed
redirigen a login sobre el perfil copiado.

La ruta que sí funciona es el perfil persistente con login manual una sola vez
(`careerai_session_vault.mjs`): el usuario inicia sesión, el perfil la conserva y las
corridas siguientes ya no la piden.

### OCR nativo disponible

`Windows.Media.Ocr` (en-US) funciona sin dependencias externas.
`careerai_ocr.ps1` extrajo correctamente el texto de una captura real de Indeed,
y `careerai_harvest.mjs` lo usa como verificación visual del scroll.

**Siguiente tarea:** con la sesión guardada, ejecutar
`node scripts/careerai_harvest.mjs` (scroll + OCR + captura de correos) y después
`node scripts/careerai_apply_with_chrome_profile.mjs` para el llenado prepare-only.

### Estado al cierre de la sesión: esperando acción del usuario

El flujo quedó a medio camino **a propósito**, en el gate `login`:

1. `careerai_session_vault.mjs` está corriendo con una ventana de Chrome abierta en la
   pantalla de login de LinkedIn (y después Indeed). **El usuario debe iniciar sesión
   manualmente**; el agente no escribe credenciales. La sesión queda guardada en
   `apps/orca/chrome_profile/careerai-migrated` (directorio ignorado por git).
2. Con la sesión guardada, la secuencia pendiente es:
   - `node scripts/careerai_harvest.mjs` — scroll del listado, OCR de verificación y
     captura de correos de contacto.
   - `node scripts/careerai_apply_with_chrome_profile.mjs` — abre Easy Apply y enumera
     los campos del formulario cargado, deteniéndose antes de enviar.
3. El clic de envío sigue requiriendo aprobación explícita por oportunidad.

Nota: ambos scripts abren el mismo perfil de Chrome, así que **no pueden ejecutarse en
paralelo** con la bóveda de sesiones (el perfil queda bloqueado). Hay que cerrar la
ventana de login antes de lanzar el harvest.

---

## 2026-08-26 (cont.) — Harvest real: los portales están retando al bot

Ejecutado `careerai_harvest.mjs` contra los portales en vivo con el perfil persistente.
Resultado honesto: **ambos portales sirven un challenge de Cloudflare al navegador
automatizado**, verificado por OCR sobre la captura real:

| Portal | Texto leído por OCR |
|---|---|
| Indeed | "Additional Verification Required … Verifying… CLOUDFLARE … Ray ID a3174a01cafcc82c" |
| WeWorkRemotely | "Performing security verification. This website uses a security service to protect against malicious bots." |

Nota: una corrida anterior con Chromium limpio (sin perfil) sí pasó. El challenge
aparece con `channel: 'chrome'` + perfil persistente y/o tras varios accesos seguidos.

### Tres defectos corregidos a raíz de esta corrida

1. **El harvest devolvía `unique_jobs: 0` en silencio** ante un muro anti-bot, como si
   la búsqueda no tuviera resultados. Ahora detecta la firma del challenge y activa el
   gate `captcha`.
2. **El muro abortaba el flujo.** Ahora **pausa y cede el control al humano**
   (`action: human_takeover`): el navegador es visible, el usuario resuelve la
   verificación y el agente continúa solo. Escala a `blocked-escalation` únicamente si
   expira el plazo (`CAREERAI_WALL_WAIT_MINUTES`, por defecto 3).
3. **El OCR rompía el JSON.** El texto reconocido traía caracteres de control (BEL 0x07
   al leer el logo de Cloudflare) que invalidaban el parseo, dejando `ocr_text` vacío en
   la evidencia. Se sanean en Node antes de parsear.

Además, `careerai_harvest.mjs` admite ahora `CAREERAI_SOURCE=indeed|weworkremotely`, con
extracción por anclas para WWR (sus tarjetas no tienen estructura estable y los
selectores genéricos capturaban secciones de categoría, no ofertas).

### Implicación de fondo

El obstáculo real para "el bot aplica solo" no es el código del agente: es que los
portales detectan y retan la automatización. El diseño ya lo contempla — navegador
visible + takeover humano en `login` y `captcha` — y esa es la vía sostenible.
