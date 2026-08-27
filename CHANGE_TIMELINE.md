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

### Cobertura de regresión para los arreglos anteriores

Los tres defectos de la corrida en vivo no tenían test que los protegiera. Se extrajo
la lógica pura a `apps/orca/src/careerai/bot-wall.mjs` (`isBotWall`, `sanitizeOcrPayload`,
`parseOcrOutput`) y `careerai_harvest.mjs` la consume, de modo que test y runtime
comparten una sola fuente.

`scripts/test_careerai_bot_wall.mjs` cubre, con los textos OCR reales capturados:

- detecta los muros de Indeed y de WeWorkRemotely;
- **rechaza falsos positivos**: un listado real y un pie de página que menciona
  Cloudflare no son muros (la regex anterior marcaba cualquier "cloudflare");
- reproduce el fallo original de `JSON.parse` con el BEL 0x07 y verifica que el saneado
  lo resuelve conservando el texto.

Añadido a `npm run careerai:regression` — ahora **9/9 scripts offline en verde**.
El helper OCR además registra `step: ocr_failed` en lugar de devolver un objeto vacío
en silencio.

---

## 2026-08-27 — Cierre de sesión: estado final

**Rama:** `careerai/live-browser-run-tracking` — 13 commits, todos en `origin`.

**Regresión:** 9/9 scripts offline en verde (`npm run careerai:regression`).
La suite live (`careerai:regression:live`) requiere `npm run orca:start` en paralelo.

### Defectos reales encontrados y corregidos en esta sesión

1. Rutas `/api/careerai/prepare-only` y `/api/careerai/connectors` desaparecidas al
   renombrar el servidor local; el fallback del SPA las servía como HTML con HTTP 200.
2. Doctor de Hermes con falso negativo: solo miraba `HERMES_API_KEY` e ignoraba el CLI
   local instalado (Hermes Agent v0.18.2).
3. La sonda de sesión re-navegaba la pestaña del usuario cada 10 s, borrando lo que
   estuviera escribiendo — hacía el login imposible de completar.
4. El harvest devolvía `unique_jobs: 0` en silencio ante un muro anti-bot.
5. El muro anti-bot abortaba el flujo en vez de ceder el control al humano.
6. El texto del OCR traía caracteres de control (BEL 0x07) que invalidaban el JSON.
7. La regex de detección marcaba cualquier "cloudflare", incluido un pie de página
   legítimo — falso positivo que habría abortado búsquedas válidas.

### Pendientes que requieren al usuario (no son deuda técnica)

- **Login en los portales.** `CAREERAI_LOGIN_WAIT_MINUTES=15 node scripts/careerai_session_vault.mjs`
  con el usuario frente al equipo. La sesión queda guardada en el perfil persistente.
- **Challenge de Cloudflare.** Cuando aparezca, el agente pausa y espera
  (`CAREERAI_WALL_WAIT_MINUTES`, por defecto 3) a que el humano lo resuelva.
- **Base del PR.** Sin decidir: `main` y la base de esta rama son dos repositorios
  distintos conviviendo en el mismo directorio (ver sección del 2026-08-26).
- **CV en Google Drive.** No existe: el CV original se referencia por hash desde
  `C:/Users/yoeli/Downloads/` con `content_copied_to_repo: false`, y el conector de
  Drive está limitado a lectura. Subirlo requeriría decisión explícita del usuario
  sobre carpeta y permisos de compartición.

### Cambios locales de otra sesión, deliberadamente sin tocar

`AGENTS.md`, `context/prompts/system_prompt.md` y `docs/agent-state.md` tienen el bloque
`shared-agent-memory-rule` inyectado automáticamente. **No se revierten** porque
pertenecen a otra tarea en curso. Queda registrado el defecto: en
`context/prompts/system_prompt.md` ese bloque contamina el system prompt del chatbot de
tienda de Galantes Jewelry con `agent_id`, rutas locales de Windows y nombres de agentes
internos, en instrucciones de cara al cliente.

---

## 2026-08-27 — Inventario de nodos verificable

El plan completo del workflow existía solo como documento. Se llevó a
`data/careerai/node-inventory.json` (**71 nodos**: 17 listos, 10 con prototipo,
44 por construir) con `id`, tipo, estado, responsable propuesto y propósito,
agrupados en 9 bloques y con `search_priority` explícita: iSeries primero,
después Odoo/Python, después el resto del CV.

`scripts/validate_careerai_node_inventory.mjs` lo cruza contra el blueprint real y
falla si divergen. En su primera corrida detectó **4 imprecisiones del propio
inventario**:

- `asset-hash-registry` y `whatsapp-summary` estaban marcados como listos, pero viven
  en el contrato y en un script — no son nodos del grafo. Corregidos a `prototipo`.
- `application-draft` y `linkedin-gate` existen en el blueprint y faltaban por completo
  en el inventario.

Ese es justamente el punto: sin validación, un inventario se degrada en lista de deseos.
Ahora los 17 nodos "listo" coinciden exactamente con los 17 del blueprint.

Añadido a `npm run careerai:regression` — **10/10 scripts offline en verde**.
Consulta rápida: `npm run careerai:inventory`.

**Reparto propuesto:** 17 pendientes para Joel (criterio de dominio: sinónimos del nicho
iSeries, agencias de staffing, W2 vs C2C, publicaciones fantasma, ATS heredados),
35 para Claude (plomería, contratos, adaptadores), 2 compartidos (`cv-tailor`,
`screening-answers`).

**Decisiones abiertas:** si se construye `proxy-rotator` (reduce bloqueos, sube costo y
roza los ToS de los portales) y si `dice-discovery` va primero, que es la recomendación
por concentrar la demanda real de AS400.

---

## 2026-08-27 (cont.) — Correcciones de alcance del cliente y primer nodo nuevo

### El perfil profesional deja de estar cableado

Corrección del propietario: **RPGLE/AS400 no puede ser fijo en el sistema**. Es el caso de
un cliente, no la definición del producto. El inventario pasa de una
`search_priority` cableada a un `search_priority_model` derivado por tenant:

`cv-ingest → profession-extractor → profession-catalog → priority-prompt → search-profile-builder`

El cliente sube su CV, el sistema extrae sus profesiones y **le pregunta cuáles quiere
priorizar**; nada se asume. El caso de Joel (iSeries → Odoo/Python → fullstack) queda como
`example_tenant`, no como configuración del sistema. Los adaptadores de fuente
(`dice-discovery`, `staffing-agency-discovery`) se redefinen como genéricos y se configuran
por profesión, y `tech-stack-classifier` pasa a `stack-classifier`, que clasifica contra el
catálogo del cliente en vez de contra una lista fija.

### Proyecto ORCA por cliente

Cada cliente necesita su proyecto en ORCA, asociado a su usuario, donde ve el workflow
corriendo. Ya existe la base: `scripts/create_orca_project_link.mjs` genera proyecto y URL
de monitoreo por owner. Nuevos nodos: `orca-project-provisioner` (prototipo) y
`project-run-binding`.

### Facturación en EasyCount

Las facturas de los clientes se emiten en **EasyCount**. Nodos añadidos:
`payment-collector` (cobro), `easycount-invoice` (emisión tras cada cobro) e
`invoice-reconciler` (concilia cobro y factura, con reintento si EasyCount falla).

### Primer nodo nuevo implementado: dedupe-canonical

`apps/orca/src/careerai/dedupe.mjs` + `scripts/test_careerai_dedupe.mjs`. Deduplica por dos
vías: URL canónica (limpia `utm_*`, `vjk`, `jk`, `gclid`, ordena parámetros, normaliza host)
e identidad `empresa + puesto + ubicación` con el ruido habitual del sector filtrado
(`URGENT`, `Remote`, `W2`, `C2C`). Cuando hay duplicado sobrevive la fuente más cercana al
empleador y, a igualdad, la ficha más completa.

Inventario: **81 nodos** — 17 listos, 12 con prototipo, 52 por construir.
Regresión offline: **11/11 en verde**.

### Estrategia de conexion en cascada

Definida por el propietario y ahora declarada en `connection_strategy` dentro del
inventario, con este orden estricto:

1. **MCP** — conector oficial cuando la plataforma lo ofrece. El mas estable: sin scraping
   y sin romperse cuando cambia el DOM.
2. **OAuth2** — pantalla con PKCE y vault cifrado por tenant.
3. **Login manual en live browser** — para plataformas sin OAuth2 utilizable. El usuario
   inicia sesion, se persisten sesion y cookies, y a partir de ahi se opera por scraping.

Se baja de nivel solo cuando el anterior no es viable, nunca por comodidad. El agente nunca
escribe credenciales: en el nivel manual solo observa hasta que la sesion queda activa.

Nodos anadidos: `connection-strategy-router`, `mcp-connector-registry`,
`cookie-jar-persistence` (prototipo) y `scraping-session-guard`.

Inventario: **85 nodos** — 17 listos, 13 con prototipo, 55 por construir.

### Catalogo de profesiones y constructor de busquedas

Implementados los dos nodos que hacen generico el arranque:

- `data/careerai/profession-catalog.json` — taxonomia con 3 familias sembradas
  (IBM i/AS-400, Odoo/Python, full-stack web), cada una con terminos, adyacentes,
  **terminos negativos** y terminos de seniority. Todas marcadas `validated: false`:
  son semillas de arranque, no verdad de produccion.
- `apps/orca/src/careerai/search-profile.mjs` — convierte el ranking que eligio el cliente
  en consultas concretas, expandiendo sinonimos desde el catalogo.

El test verifica lo que importa del diseno: **el sistema no tiene profesiones favoritas**.
Dos clientes con el mismo catalogo y distinto orden obtienen perfiles distintos. Tambien
comprueba el filtro negativo (un puesto de *role playing game* no es RPGLE) y que los
errores sean explicitos: `NO_RANKED_PROFESSIONS` si el cliente no priorizo nada,
`UNKNOWN_PROFESSION` si pide algo fuera del catalogo.

Las familias sin validar se **reportan, no se bloquean**: un cliente puede querer buscar con
una semilla mientras alguien del oficio la revisa.

Inventario: 85 nodos — 17 listos, 15 con prototipo, 53 por construir.
Regresion offline: **12/12 en verde**.

### Nodo stack-classifier

`apps/orca/src/careerai/stack-classifier.mjs` + su test. Clasifica cada oferta contra el
catalogo **del cliente**, no contra una lista fija, y el ranking del cliente acota contra que
familias se compara.

Decisiones de diseno que el test protege:

- **El titulo pesa el triple que la descripcion.** Una vacante se define por el puesto, no
  por la lista de tecnologias que la empresa usa en algun lugar de la casa. Es lo que evita
  que un puesto de Java que menciona AS/400 de pasada entre a la cola como si fuera iSeries.
- **Limites de palabra en cada termino.** Sin ellos, `CL` coincide dentro de `CLIENT` y
  `RPG` dentro de cualquier cosa. El test cubre ese caso exacto.
- **Un termino negativo descarta la familia entera**, y se reporta cual y por que. Un puesto
  de *tabletop role playing game* no es RPGLE.
- **Sin senal suficiente devuelve `unclassified`** en vez de forzar la familia mas parecida.
  Una vacante mal clasificada cuesta una postulacion desperdiciada, que es mas caro que
  dejarla fuera.

Regresion offline: **13/13 en verde**.

---

## 2026-08-27 (cont.) — El consejo de modelos como cerebro de los nodos

### Reparto de roles

- **Hermes** (modelos gratuitos): tareas de mayor consumo de tokens — `heavy_lifting`.
- **Claude**: revision de codigo y cumplimiento — `code_review`.
- **ChatGPT**: analisis de sistema, documentacion y reportes PDF/Excel — `systems_analysis`, `reporting`.
- **Gemini**: testing y QA — `qa_testing`.
- **research**: unico rol que se vota entre varios proveedores.

`askRole()` prueba el titular y baja a la cadena de respaldo solo si falla, en vez de
consultar a todos y gastar el triple.

### Cuatro defectos reales encontrados al conectar los proveedores de verdad

1. **`gemini-2.0-flash` no existe** — de ahi el HTTP 404. El modelo por defecto pasa a
   `gemini-flash-latest`, configurable por `GEMINI_MODEL`.
2. **Los fallos transitorios se trataban como definitivos.** Un HTTP 503 por sobrecarga
   escalaba a un humano. Ahora hay reintento con espera exponencial para 408/429/5xx, y los
   definitivos (401, 404) no se reintentan: gastar tres llamadas en un 401 no arregla nada.
3. **El CLI de Hermes imprime sus errores por stdout y sale con codigo 0.** El consejo
   tomaba el mensaje de error como respuesta valida y, peor, daba la cadena por satisfecha y
   nunca probaba el respaldo. Con la deteccion añadida, Hermes falla, Gemini toma el relevo
   y el analisis se completa.
4. **`profession-extractor` daba el barrido por analisis completo.** Ahora declara
   `council_status` y marca esas profesiones con confianza baja.

### Perfil profesional desde el CV real

`cv-ingest.mjs` extrae texto de PDF sin dependencias externas — el CV es un documento
personal y no debe salir de la maquina para leerse — incluida la cadena ASCII85 + Flate de
ReportLab. `profession-extractor.mjs` deduce las profesiones **del documento**, con barrido
del catalogo como respaldo para que un proveedor caido no deje al cliente sin perfil.

Probado contra el CV real del propietario: 5.393 caracteres, hash `d5401d7a7bbc91af`
coincidente con el registrado en `application-assets.json`, y Gemini devolvio profesiones
con evidencia citada del propio CV, años y seniority.

**Genericidad probada, no afirmada:** el test alimenta un CV de enfermeria de cuidados
intensivos con un catalogo que no contiene esa profesion, y verifica que el extractor la
devuelve igualmente y que `family_id` queda en `null` sin forzar una familia. Los fixtures
del test del consejo se neutralizaron a cadenas genericas para que no parezcan vocabulario
del sistema.

Inventario: **87 nodos** — 17 listos, 20 con prototipo, 50 por construir.
Regresion offline: **15/15 en verde**.

### Autocorreccion verificada contra proveedores reales

Ejecutado `careerai_research_catalog.mjs iseries-core` con los tres proveedores. Diagnostico
que devolvio el consejo:

| Proveedor | Resultado | Comportamiento |
|---|---|---|
| Hermes | HTTP 404 (su backend Gemini) | **1 intento** — definitivo, no se reintenta |
| Gemini | HTTP 503 tras **3 intentos** | transitorio, reintento con espera exponencial |
| OpenAI | HTTP 429 tras **3 intentos** | cuota agotada |

El sistema hizo exactamente lo correcto: reintento los transitorios, no malgasto llamadas en
el definitivo y escalo con un diagnostico preciso por proveedor. La familia sigue sin validar
por indisponibilidad real de los modelos, no por un fallo del nodo. **Pendiente del
propietario:** configurar `hermes model` con modelos gratuitos para que asuma su rol de carga
pesada; elegir proveedores de su cuenta no me corresponde.

### Nodos cv-tailor, cover-letter-writer y screening-answers

`apps/orca/src/careerai/application-tailor.mjs`. Para **cada oportunidad** se produce un CV
adaptado, una carta que nombra empresa y puesto, y las respuestas del formulario. Dos reglas
gobiernan el modulo y el test las protege:

1. **Nunca se inventa un hecho que el CV no respalde.** El prompt lo prohibe de forma
   explicita, y el resultado incluye `gaps` (lo que la oferta pide y el CV no sostiene) y
   `unsupported_claims_avoided`. Las carencias se muestran al cliente en vez de disimularse.
2. **Un dato factual sin respaldo no se contesta.** `answerScreeningQuestions` deja la
   autorizacion de trabajo o la expectativa salarial en `human_review_required` antes que
   rellenarlas. El test verifica ese caso concreto.

Ademas: sin adaptacion del consejo **no se postula con el CV generico**, se escala — mandar
un CV sin adaptar a un ATS que filtra por palabras clave es gastar la oportunidad. Cada
artefacto es derivado y trazable al CV original por hash; el original nunca se modifica.

Inventario: 87 nodos — 17 listos, 23 con prototipo, 47 por construir.
Regresion offline: **16/16 en verde**.

### Flujo de postulacion por via, con disparador de posiciones nuevas

Definido por el propietario y declarado en `apply_flow` dentro del inventario. El buscador
recorre una **lista de plataformas** con los perfiles derivados del CV; cada posicion
**nueva** dispara al analizador, que decide la via:

| Via | Ruta | Coste |
|---|---|---|
| `easy_apply` | boton nativo de la plataforma | bajo |
| `email_apply` | CV adaptado + carta + aprobacion + envio de correo | medio |
| `external_form` | webscraping + antibot + adaptador de ATS + navegador visible + aprobacion | alto |
| `unsupported` | recolector + reporte PDF + WhatsApp al cliente | reporte |

`apps/orca/src/careerai/apply-method-classifier.mjs` implementa la decision. Criterios que
el test protege:

- **El correo exige una direccion real.** La frase "envie su CV" sin direccion NO es
  postulacion por correo; sin destinatario no hay nada que enviar.
- **Un ATS conocido se identifica** para elegir adaptador; un **dominio no reconocido pausa**
  antes de tocarlo, como ya exige la politica de `unknown_domain`.
- **Barreras reales** (cuenta previa obligatoria, presencial, clearance) marcan `unsupported`
  con el motivo, y **van al reporte del cliente en vez de descartarse en silencio**.
- **Sin senal no se adivina la via**: tambien se reporta.
- **Solo las posiciones nuevas se analizan.** Reanalizar una oportunidad ya vista gasta
  tokens y cuota del cliente sin aportar nada.

Nodos anadidos para completar la cadena: `platform-registry`, `new-position-trigger`,
`apply-method-classifier`, `email-apply-sender`, `unsupported-collector`,
`pdf-report-builder`, `whatsapp-report-sender` y `report-scheduler` (cadencia configurable
por el cliente, por hora por defecto).

El reporte PDF corresponde al rol `systems_analysis` (ChatGPT), coherente con el reparto de
roles del consejo.

Inventario: **95 nodos** — 17 listos, 25 con prototipo, 53 por construir.
Regresion offline: **17/17 en verde**.

### Reporte al cliente: PDF sin dependencias

`apps/orca/src/careerai/client-report.mjs` implementa `unsupported-collector`,
`pdf-report-builder` y la preparacion del envio por WhatsApp.

El PDF se genera a mano, sin librerias de terceros: el reporte contiene el historial laboral
del cliente y no tiene por que pasar por una dependencia externa para existir.

El test no se conforma con la cabecera `%PDF`: **vuelve a leer el PDF generado** con
`extractPdfText` y comprueba que el titulo, las posiciones sin completar y la referencia de
confirmacion esten realmente ahi. Verifica ademas que:

- el motivo se muestra en lenguaje del cliente (`Requiere crear una cuenta en el portal`),
  conservando el codigo interno para trazabilidad;
- un destinatario fuera de la allowlist **no recibe nada**;
- la clave de idempotencia es estable, de modo que reenviar el mismo reporte no genera un
  segundo mensaje, y un reporte distinto si produce otra clave;
- un periodo sin pendientes lo dice explicitamente en vez de dejar la seccion vacia.

Regresion offline: **18/18 en verde**.
