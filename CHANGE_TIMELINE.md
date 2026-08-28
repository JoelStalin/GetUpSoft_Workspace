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

### Tres bugs del workflow editor, encontrados al abrirlo de verdad

El propietario pidio ver el editor. Al abrirlo aparecieron tres defectos reales, los tres
diagnosticados leyendo el bundle compilado (`dist/assets/index-*.js`), porque el codigo
fuente del editor no esta en esta copia del repositorio.

1. **Los 17 nodos se renderizaban apilados en el origen** y el canvas parecia vacio. La API
   emitia `position` como array `[x, y]` al estilo n8n, pero el canvas es React Flow y espera
   `{x, y}`. Ahora se emiten ambos formatos y se reparten en rejilla de 5 columnas.
   Verificado en el DOM: transforms reales, no amontonados.

2. **Ninguna conexion se dibujaba.** El convertidor del editor es
   `JK(t)` y lee `i.node_id || i` de cada conexion; el servidor enviaba `{ node: ... }`, asi
   que el destino quedaba en `[object Object]`. Enviando `node_id` se dibujan los **22 edges**.

3. **El panel "Live ORCA system status" se quedaba en "Loading live data..." con `{}`.**
   Causa raiz: `hermesDoctor()` ejecuta el CLI de Hermes con `execFileSync` **en cada
   peticion**, bloqueando el event loop del servidor. `/api/stats` tardaba **6 segundos** y el
   efecto del panel se cancelaba antes de resolver. Ese bug lo introduje yo al hacer el doctor
   consciente del CLI. Con cache de 60 s: **6 s -> 24 ms**, y el panel ya muestra los datos.

Ademas se enriquecieron `/api/stats` y `/api/pipeline/stats` con estado real: nodos, edges,
corridas, estado de Hermes y conectores.

**URL del editor:** `http://127.0.0.1:4173/?workflow=careerai-indeed-agent` (`npm run orca:start`).

Regresion: 18/18 offline y 3/3 de la suite live en verde.

### El grafo pasa de 17 a 32 nodos

Los modulos construidos existian como codigo probado pero no estaban en el blueprint, asi
que el editor mostraba una arquitectura desactualizada. Se promueven al grafo los **15 nodos
que tienen modulo implementado y test propio**, con las **21 aristas** que reflejan el flujo
real:

`career-command -> cv-ingest -> profession-extractor -> search-profile-builder -> discovery
-> dedupe-canonical -> stack-classifier -> new-position-trigger -> apply-method-classifier`

y la rama de artefactos `consensus-score -> cv-tailor -> cover-letter-writer ->
screening-answers -> application-draft`, mas `unsupported-collector -> pdf-report-builder ->
evidence-log` para lo que no se puede completar.

**Criterio de promocion:** solo entra al grafo lo que tiene implementacion y test. Declarar
en el blueprint algo sin implementar convertiria el editor en una lista de deseos, que es
justo lo que el validador de inventario existe para impedir.

Verificado en el canvas: **32 nodos y 43 edges renderizados, sin errores de pagina**.

Inventario: 95 nodos — 32 listos, 13 con prototipo, 50 por construir.
Regresion: 18/18 offline y 3/3 live en verde.

### Guardas: remote-verifier y approval-expiry-watchdog

`apps/orca/src/careerai/guards.mjs`. Dos nodos que evitan errores caros para el cliente.

**remote-verifier.** Detecta el "remoto" que no lo es: *2 days per week in the office*,
hibrido, presencia trimestral, reubicacion obligatoria. Postular a una vacante anunciada como
remota que exige presencia mensual hace perder el tiempo del cliente y quema la candidatura.
Tambien detecta restricciones geograficas (`us_only`, `no_sponsorship`, `clearance`), pero
**solo opina sobre elegibilidad si sabe donde esta el candidato**: inventar una restriccion
que no aplica descartaria vacantes validas. Y reporta en vez de descartar: la decision final
es del cliente.

**approval-expiry-watchdog.** El contrato `ApprovalRequest` exigia `expires_at` y
`payload_hash` desde el principio, pero nadie los vigilaba. Ahora se rechaza una aprobacion
que este vencida, sea de otra oportunidad, venga de un actor distinto, no tenga fecha de
expiracion, o **cuyo contenido haya cambiado despues de aprobarse** — si el CV cambio tras la
aprobacion, lo aprobado ya no es lo que se enviaria.

Grafo: **34 nodos y 49 edges**. Inventario: 95 nodos — 34 listos, 13 con prototipo, 48 por
construir. Regresion offline: **19/19 en verde**.

### ats-router y adaptadores de Greenhouse y Lever

`apps/orca/src/careerai/ats-adapters.mjs`. La capa de mapeo es **pura a proposito**: recibe
la descripcion de los campos y devuelve un PLAN de llenado sin tocar el navegador, asi que se
prueba sin abrir Chrome y sin postular a nada.

**Regla que gobierna el modulo:** un campo que no se sabe rellenar con certeza no se rellena.
Un formulario enviado con un dato inventado no se puede deshacer.

Campos que **nunca** se autorrellenan aunque haya dato disponible:

| Campo | Motivo |
|---|---|
| Autorizacion de trabajo, visa, antecedentes | declaracion legal |
| Expectativa salarial, fecha de inicio | decision del candidato |
| Genero, etnia, discapacidad, veterania | dato sensible protegido |

Si un campo **obligatorio** queda sin resolver, `can_submit_without_human` es `false` y el
plan nombra cual bloquea. El router pausa ante dominio desconocido y tambien ante un **ATS
reconocido cuyo adaptador todavia no existe** (Workday, Taleo, iCIMS): declarar soporte
inexistente enviaria el formulario a un adaptador vacio.

Grafo: **37 nodos y 55 edges**. Regresion offline: **20/20 en verde**.

### connection-strategy-router y mcp-connector-registry

`apps/orca/src/careerai/connection-strategy.mjs`. Decide, por plataforma, el NIVEL de
conexion en cascada estricta: **mcp** (si ya existe un conector MCP conectado a esta sesion,
se usa) → **oauth2** (PKCE, vault cifrado por tenant) → **live_browser_manual** (login manual
del cliente una vez, sesion/cookies persistidas para scraping despues). Una plataforma no
declarada en ningun registro pausa en vez de asumir un nivel.

Es el mismo patron que ats-router: logica pura, sin conectarse a nada, probada sin abrir
Chrome. El registro MCP devuelve copias defensivas para que nadie mute el original desde
afuera.

**Nota sobre alcance:** el propio ats-router ya señala a Workday/Taleo/iCIMS como el siguiente
adaptador natural, pero su nodo en el inventario (`workday-adapter`) tiene `owner: joel` y
`purpose: "ATS multi-paso con cuenta obligatoria"` — a diferencia de Greenhouse/Lever, Workday
exige crear una cuenta para postular, y crear cuentas esta fuera de lo que este agente hace
sin decision explicita del propietario. Se tomo en su lugar `connection-strategy-router` y
`mcp-connector-registry`, ambos con `owner: claude` en el inventario y ya declarados (sin
implementar) desde el commit `54dc020a66`.

Grafo: **39 nodos y 58 edges**. Inventario: 95 nodos — 39 listos, 13 con prototipo, 43 por
construir. Regresion offline: **21/21 en verde**.

### tenant-resolver

`apps/orca/src/careerai/tenant-resolver.mjs`. Resuelve `tenant_id` con precedencia estricta
**request → session → default** y lo propaga al run. Por que importa: `tenant_id` decide de
que cliente son los CVs, credenciales y oportunidades que se leen y escriben — resolverlo mal
no es un bug cosmetico, es fuga de datos entre clientes.

Reglas duras:
- Sin ninguna fuente confiable, **pausa** en vez de inventar un tenant por defecto.
- Una fuente con forma invalida (espacios, mayusculas, `..` de path traversal — el tenant_id
  termina en rutas de archivo y claves de vault) **pausa en esa fuente**, no salta en silencio
  a la siguiente fuente disponible.
- `bindTenantToRun` es puro (no muta el run recibido) y **rechaza reasignar** el tenant de un
  run que ya pertenece a otro tenant; vincular el mismo tenant otra vez es idempotente.

Grafo: **40 nodos y 60 edges**. Inventario: 95 nodos — 40 listos, 13 con prototipo, 42 por
construir. Regresion offline: **22/22 en verde**.

### project-run-binding

`apps/orca/src/careerai/project-run-binding.mjs`. Asocia un run al proyecto ORCA del cliente
(el que crea `orca-project-provisioner`, aun en prototipo) para que aparezca en su panel.
Misma familia de riesgo que tenant-resolver, en el borde proyecto↔run: un proyecto pertenece a
un tenant especifico, y asociar el run de un cliente al proyecto de otro los mezclaria en el
mismo panel de monitoreo.

Reglas duras:
- Exige que el run ya traiga `tenant_id` resuelto (por `tenant-resolver`) antes de asociarse;
  sin eso no hay forma de verificar propiedad, asi que se rechaza en vez de asumir.
- Si `run.tenant_id !== project.tenant_id`, la asociacion se rechaza explicando ambos tenants.
- Un run ya asociado a otro proyecto no se reasigna en silencio; re-asociar al mismo proyecto
  es idempotente.

Grafo: **41 nodos y 61 edges**. Inventario: 95 nodos — 41 listos, 13 con prototipo, 41 por
construir. Regresion offline: **23/23 en verde**.

### rate-limiter

`apps/orca/src/careerai/rate-limiter.mjs`. Decide si una accion sobre un portal puede
ejecutarse ahora o debe esperar, para imitar espaciado humano y no gatillar defensas anti-bot.
Logica pura: no duerme, no reintenta, solo calcula con `now`/`lastActionAt` inyectados (mismo
patron que `checkApproval`/`sweepExpired` en guards.mjs).

Intervalo minimo por portal (Indeed 45s, LinkedIn 90s, Glassdoor/Workday 60s, Greenhouse/Lever
20s — los portales con deteccion anti-bot mas agresiva piden mas espacio). **Portal no
declarado en la tabla: se usa el intervalo mas conservador conocido, no uno optimista** — es
la unica decision que nunca hace daño por exceso de cautela. Reloj inconsistente (ultima
accion registrada en el futuro respecto a "now") bloquea en vez de calcular una espera
negativa.

Grafo: **42 nodos y 63 edges**. Inventario: 95 nodos — 42 listos, 13 con prototipo, 40 por
construir. Regresion offline: **24/24 en verde**.

### queue-dispatcher

`apps/orca/src/careerai/queue-dispatcher.mjs`. Serializa corridas por tenant: decide si una
corrida nueva puede arrancar ya o debe esperar en cola porque el mismo cliente ya tiene una
corrida activa. Logica pura: no arranca ni escribe nada, solo decide con la lista de runs que
se le pasa (mismo patron que project-run-binding).

**Por que serializar por tenant:** dos corridas simultaneas del mismo cliente competirian por
el mismo perfil de navegador, la misma sesion persistida y las mismas cookies — el resultado
no es paralelismo, es corrupcion de sesion o postulaciones duplicadas. Tenants distintos si
corren en paralelo entre si; no hay motivo de seguridad para bloquearlos.

Estados intermedios (`running`, `streaming`, `queued`, `pending`, `blocked_approval_required`,
`blocked_needs_permission`) siguen ocupando el turno del tenant; solo `completed`, `failed` y
`cancelled` lo liberan. `buildDispatchPlan` arma el orden de despacho de un lote respetando
como maximo una corrida dispatchable por tenant por pasada.

Grafo: **43 nodos y 65 edges**. Inventario: 95 nodos — 43 listos, 13 con prototipo, 39 por
construir. Regresion offline: **25/25 en verde**.

### scraping-session-guard

`apps/orca/src/careerai/scraping-session-guard.mjs`. Verifica que la sesion persistida (login
manual del cliente en live browser) sigue viva ANTES de cada accion de scraping. Logica pura:
no abre navegador, no refresca nada.

**Por que importa:** scrapear con sesion caducada dispara el login del portal, que interrumpe
la corrida o se lee como actividad sospechosa. Y reusar la sesion de un tenant para las
acciones de otro es la misma fuga que evitan tenant-resolver y project-run-binding — se
verifica tambien aqui, en el ultimo punto antes de tocar el portal: **sesion de otro tenant o
de otro portal nunca se considera viva**, sin excepcion.

Con `expires_at` declarado por el portal, esa fecha manda. Sin ella, se estima frescura por
`captured_at` + una ventana de 12h: pasada esa ventana el estado es `stale` (no "caducada" de
forma dura, sino "revisar antes de confiar"). Sin ninguna fecha de referencia, `unknown_age`
— no se asume que una sesion sin metadata es valida. Reloj inconsistente (captured_at en el
futuro) falla explicitamente.

Grafo: **44 nodos y 67 edges**. Inventario: 95 nodos — 44 listos, 13 con prototipo, 38 por
construir. Regresion offline: **26/26 en verde**.

### connection-health-check

`apps/orca/src/careerai/connection-health-check.mjs`. Evalua, ANTES de arrancar la corrida
completa, si todas las conexiones necesarias (MCP, OAuth2, live-browser) estan sanas. Logica
pura: agrega el estado que se le pasa, no conecta ni refresca nada.

Diferencia con scraping-session-guard: ese verifica la sesion justo antes de CADA accion de
scraping durante la corrida; este evalua TODAS las conexiones de una vez al principio, para
no arrancar discovery + analisis + preparacion (varios minutos de trabajo) si ya se sabe que
una conexion va a fallar a mitad de camino.

**Reutiliza `checkSessionAlive` de scraping-session-guard** para el nivel `live_browser_manual`
en vez de reimplementar la logica de sesion: la verificacion de tenant/portal cruzado se
hereda automaticamente, sin duplicar la regla en dos sitios que podrian divergir. Nivel MCP
sano si `mcp_available`; nivel OAuth2 sano con token presente y no vencido; un nivel no
reconocido nunca se asume sano.

Grafo: **45 nodos y 69 edges**. Inventario: 95 nodos — 45 listos, 13 con prototipo, 37 por
construir. Regresion offline: **27/27 en verde**.

### credential-rotation

`apps/orca/src/careerai/credential-rotation.mjs`. Decide que hacer con un token OAuth2 antes
de que caduque: nada, refrescarlo (si hay `refresh_token`), o re-autorizar desde cero (si no
lo hay). Logica pura: devuelve un PLAN, igual que ats-adapters — no llama al proveedor OAuth
ni escribe el token nuevo en ningun vault. Ejecutar el refresco real queda para otro paso que
consuma este plan.

Se adelanta 5 minutos al vencimiento por defecto (configurable) para no interrumpir una accion
a mitad de camino. Sin `expires_at` declarado por el proveedor, no se inventa una fecha de
vencimiento — se marca `needs_review: true` en vez de asumir vigencia o caducidad. Un token ya
vencido con `refresh_token` disponible se refresca (no se re-autoriza de mas); sin
`refresh_token` siempre requiere al cliente.

Grafo: **46 nodos y 70 edges**. Inventario: 95 nodos — 46 listos, 13 con prototipo, 36 por
construir. Regresion offline: **28/28 en verde**.

### Pivote: foco en operar esta semana, no en mas nodos

El propietario pidio parar de abrir frentes nuevos de codigo y priorizar que CareerAI opere de
verdad esta semana. Se levanto el estado real (no de fixtures):

- **CV real verificado** (`Joel_Stalin_Martinez_CV_ES_2026.pdf`, hash confirmado, existe en
  disco) y claves reales cargadas (Hermes CLI, Gemini, ChatGPT, WhatsApp).
- **Bloqueante critico:** `session-vault.json` de la prueba del 26-ago muestra `logged_in:
  false` para Indeed y LinkedIn — nadie completo el login manual en el navegador persistido
  del agente. Sin eso no hay discovery real en Indeed (el portal principal del workflow).
- `opportunities.json` solo tiene datos sinteticos de test; cero oportunidades reales del
  tenant `joel` descubiertas todavia.
- **Los nodos construidos en esta sesion (tenant-resolver, rate-limiter, queue-dispatcher,
  scraping-session-guard, connection-health-check, credential-rotation, connection-strategy)
  estan probados en aislamiento pero NO estan cableados a `prepare-only.mjs`/`runs.mjs`, que
  es el camino de ejecucion real.** Utiles para cuando el sistema crezca a multi-tenant, pero
  no son lo que bloquea operar esta semana.

**Correccion de contenido:** `data/careerai/profession-catalog.json` tenia la familia
`fullstack-web` sembrada por Claude sin ver el CV real — apuntaba a React/Next.js/NestJS/
TypeScript, ninguno de los cuales aparece en el CV. Corregida al stack real (.NET/C#, PHP,
Java, Angular.js, Node.js, React.js, Flutter). Se agrego una familia nueva,
`banking-core-systems`, ausente del catalogo original pese a ser la especialidad mas fuerte y
senior del CV (8+ anos, core bancario/tarjetas/ACH/RTGS en 5 empleadores). Ambos cambios
quedan `validated: false` con `review_note` explicando el motivo — la confirmacion final es
del cliente (`profile-confirmation`), no se fingio aqui.

Checklist entregado al propietario, con lo que depende de el (login manual, confirmar
catalogo, decidir modo de envio final) separado de lo que se puede avanzar sin el.

### Bug real encontrado antes de pedirle el login al propietario

`scripts/careerai_login_handoff.mjs` (el script pensado para que el cliente haga login manual)
guardaba la sesion en `apps/orca/chrome_profile/careerai`, pero `careerai_session_vault.mjs` y
`careerai_harvest.mjs` (los que de verdad usan la sesion para discovery) leen de
`apps/orca/chrome_profile/careerai-migrated` — **un perfil de Chrome distinto**. Un login hecho
con el script original nunca habria sido visto por el resto del pipeline; coincide con el
`logged_in: false` observado. Corregido para usar el mismo perfil (con el mismo override
`CAREERAI_PROFILE_DIR` que ya usan los otros dos scripts).

Alternativa mas rapida disponible y sin tocar codigo: `careerai_apply_with_chrome_profile.mjs`
usa el perfil REAL de Chrome del usuario (con Chrome cerrado) — si el propietario ya tiene
sesion iniciada en Indeed/LinkedIn en su navegador de siempre, esto evita el login manual por
completo.

### email-apply-sender y submit-executor: las dos acciones irreversibles

`apps/orca/src/careerai/senders.mjs`. Son los unicos dos puntos del workflow que actuan sobre
el mundo exterior. Todo lo demas se puede repetir; un correo enviado y un formulario enviado
no se pueden retirar. Por eso comparten la misma cadena de guardas, y basta que una falle
para que no se ejecute nada:

1. aprobacion valida, vigente y **para esa oportunidad**;
2. el contenido no cambio despues de aprobarse (hash del payload);
3. destinatario dentro del dominio permitido — un correo a la direccion equivocada expone
   datos personales del cliente;
4. sin muro anti-bot activo y con sesion viva;
5. sin campos obligatorios pendientes: un ATS puede aceptar un formulario incompleto y quemar
   la candidatura;
6. idempotencia por canal y contenido: no se postula dos veces a lo mismo.

`recordDelivery` distingue `confirmed` de `sent_without_confirmation`. **Una postulacion sin
prueba es una promesa**, y el reporte al cliente no debe presentarlas como equivalentes.

Grafo: **49 nodos y 77 edges**. Inventario: 95 nodos — 49 listos, 13 con prototipo, 33 por
construir. Regresion offline: **29/29 en verde**.

Nota: esta tanda se apoya en tres commits de otra sesion en la misma rama, uno de los cuales
corrige un defecto de mi codigo (`login_handoff.mjs` guardaba la sesion en
`chrome_profile/careerai` mientras el harvest leia `chrome_profile/careerai-migrated`).

### store.mjs: persistencia, bitacora y orden de la cola

`opportunity-upsert` es idempotente por `(tenant, canonical_url)`: volver a ver la misma
vacante actualiza lo que se sabe de ella en vez de crear un duplicado que luego generaria una
segunda postulacion. Y **el estado no retrocede**: una vacante ya postulada no vuelve a
"descubierta" porque el buscador la reencuentre.

`audit-append` hace cumplir de verdad el `secret_fields_forbidden` del contrato, que hasta
ahora solo estaba declarado. `stripSecrets` redacta tokens, cookies, contrasenas y cabeceras
de autorizacion **en profundidad**, tambien dentro de arrays y objetos anidados. La lectura
filtra por tenant: un cliente nunca ve la bitacora de otro.

`priority-ranker` ordena por el ranking que eligio **el cliente**; el score y la frescura solo
desempatan dentro de una misma familia. El test verifica el caso que importa: una vacante con
peor score gana a otra con mejor score si pertenece a la familia que el cliente puso primero.
Lo que queda fuera del ranking **no se descarta**, va al final y se cuenta en
`outside_client_ranking`.

Grafo: **52 nodos y 83 edges**. Regresion offline: **30/30 en verde**.

### rss-feed-ingest y email-alert-ingest: las fuentes que no disparan anti-bot

Despues del muro de Cloudflare que freno el scraping en Indeed y WeWorkRemotely, estas dos
fuentes pasan a ser las mas fiables: un feed RSS es un documento publico pensado para que lo
lean maquinas, y una alerta de empleo **ya llego al correo del cliente**, asi que leerla no
toca el portal. Ademas suelen llegar antes de que la vacante circule.

El parseo es propio: meter un parser XML completo para leer cuatro etiquetas anadiria una
dependencia que hay que mantener y auditar. Soporta RSS (`<item>`, `<link>` como texto) y
Atom (`<entry>`, `<link href>`), decodifica entidades y CDATA, limpia el HTML de las
descripciones y normaliza fechas a ISO.

Decisiones que el test protege:

- **El remitente debe estar en la allowlist.** Cualquiera puede enviar un correo que parezca
  una alerta de empleo; seguir sus enlaces a ciegas es exactamente como funciona el phishing.
- **Los enlaces envueltos en rastreadores se desenvuelven** (`?u=https%3A%2F%2F...`), porque
  si no, la URL canonica seria la del rastreador y la deduplicacion fallaria.
- **Un feed sin entradas se declara** (`no_entries`) en vez de devolver una lista vacia: puede
  ser un error del portal disfrazado de HTTP 200, y ese fue justo el fallo que ya cometi una
  vez en el harvest.
- Lo descartado por falta de URL **se cuenta** en `skipped_without_url`.

Grafo: **54 nodos y 87 edges**. Regresion offline: **31/31 en verde**.

### status-tracker y report-scheduler: el seguimiento

Postular es la parte facil; dar seguimiento es lo que cansa, y es lo que hace que alguien
pague una suscripcion todos los meses.

`status-tracker` clasifica las respuestas en `rejected`, `interview_invite`,
`info_requested`, `acknowledged` o `unknown`. Detalles que el test protege:

- **El orden de los clasificadores importa.** Un rechazo que cita la palabra *interview* del
  hilo anterior ("thank you for attending the interview... unfortunately") debe clasificarse
  como rechazo, no como invitacion. Al reves, el cliente esperaria una llamada que nunca llega.
- **Sin senal clara se queda en `unknown` y lo revisa el cliente.** No se inventa un estado.
- **Lo que no se puede vincular a una postulacion se muestra**, no se descarta: una de esas
  respuestas huerfanas puede ser una invitacion a entrevista.
- Una invitacion o una peticion de informacion **siempre** requieren al cliente: son una cita
  en su agenda y una decision suya.

`report-scheduler` admite cadencia `hourly`, `daily` (a la hora que elija el cliente,
calculada **en su zona horaria**, no en la del servidor) o `manual`. Y `shouldSendReport`
**no envia un reporte vacio**: molestar cada hora sin novedades hace que el cliente silencie
el canal, y entonces se pierde el aviso que si importaba.

Grafo: **56 nodos y 92 edges**. Regresion offline: **32/32 en verde**.

### profile-confirmation y priority-prompt: cierra el bloque de perfil

El sistema **propone** lo que extrajo del CV; el cliente **confirma, corrige y ordena**. Nada
arranca sin su confirmacion explicita, porque buscar con un perfil equivocado gasta su cuota y
le llena la cola de vacantes que no quiere.

Lo que el test protege:

- El orden del CV es **solo una sugerencia**: alguien puede tener diez anos en una tecnologia
  y querer buscar en otra.
- El cliente puede **quitar** cualquier profesion y **anadir** una que el CV no dejaba ver.
- Lo confirmado pero no ordenado **no se pierde**: va al final marcado como
  `ranked_by_client: false` y se cuenta en `unranked_count`.
- Ordenar algo que no se confirmo **falla explicitamente**: indica que cliente y sistema no
  estan hablando de lo mismo.
- No se puede saltar la confirmacion para ir directo al ranking.
- `assertReadyToSearch` es la guarda de arranque: ningun nodo de busqueda corre sin perfil
  confirmado, ordenado y con al menos una familia del catalogo asociada.

Probado con un perfil de enfermeria, sin ninguna tecnologia cableada.

Grafo: **58 nodos y 95 edges**. Regresion offline: **33/33 en verde**.

### La URL de proyecto del cliente ya sirve algo

El propietario reporto que no veia ORCA en linea. El servidor estaba corriendo y respondia
200 en el 4173; lo que no funcionaba era **la URL de su proyecto**: el generador emitia
enlaces a `http://localhost:5174`, **donde nunca hubo nada escuchando**. El nodo
`project-run-binding` figuraba como listo en el inventario y tenia modulo y test, pero nadie
servia esa ruta. Una discrepancia real entre lo declarado y lo que funciona.

Corregido:

- El mismo servidor sirve `/project/<slug>/<id>` (404 explicito si el proyecto no existe, en
  vez de una pagina en blanco).
- Nuevos endpoints `GET /api/orca/projects` (filtrable por `owner`, para que un cliente no vea
  los proyectos de otro) y `GET /api/orca/projects/<id>` con su workflow y sus corridas.
- `create_orca_project_link.mjs` genera la URL apuntando al servidor que de verdad la sirve.
- `test_careerai_project_routes.mjs` impide que vuelva a pasar: verifica que la URL de
  monitoreo apunte al puerto que responde y que la pagina sirva el editor.

Verificado en navegador: la ruta del proyecto renderiza los 58 nodos con el panel de estado
en datos reales.

**Pendiente que conviene no confundir:** el frontend del CLIENTE (bloque J: onboarding,
conexiones, bandeja de oportunidades, aprobaciones, facturacion) **no existe**. Lo que hay es
el editor de workflows, que es herramienta interna.

### Layout del grafo y robustez del servidor

El propietario señalo que la UI no se veia bien. Tres hallazgos:

**1. El grafo era un plato de espagueti, y era culpa mia.** Cuando arregle el apilamiento de
nodos los coloque en rejilla por orden de declaracion, asi que las 95 conexiones cruzaban el
canvas en todas direcciones. Primer intento de arreglo: capas topologicas puras. Resultado
**peor**: 33 columnas, ~10.000 px de ancho, y al encuadrar el grafo los nodos quedaban
reducidos a lineas. Solucion final en `graph-layout.mjs`: se conserva el **orden topologico**
(que es lo que hace legible el flujo) pero se **envuelve en filas de 6 columnas**, asi que
cabe en pantalla con los nodos legibles. Verificado: 58 nodos de 102x61 px al encuadrar.

**2. El grafo tiene ciclos de verdad.** Kahn puro dejaba 43 nodos sin capa amontonados en la
columna 0, porque hay realimentaciones legitimas (reintentos, escalados que vuelven atras, el
investigador que realimenta al constructor de busquedas). El recorrido en profundidad ignora
las aristas que vuelven a un ancestro y las reporta: **12 aristas de ciclo** de 95.

**3. Una excepcion en cualquier ruta tumbaba el servidor entero.** Basto una referencia a un
campo que renombre para dejar ORCA fuera de linea por completo. Esto explica muy bien que el
propietario a veces no lo viera arriba. Ahora cada peticion esta acotada en su propio
try/catch y hay guardas de `uncaughtException` y `unhandledRejection`. Comprobado: una ruta
que antes mataba el proceso devuelve 404 y el servidor sigue respondiendo.

**4. Arranque en frio del panel de estado.** La comprobacion de Hermes tarda ~2,4 s la primera
vez; si la pagaba la primera peticion, el efecto del panel se cancelaba y se quedaba en
"Loading live data". Ahora se precalienta al arrancar, cuando nadie espera.

### El pipeline se ejecuta, no solo se declara

Hasta ahora los modulos estaban probados en aislamiento y declarados en el blueprint, pero
**nada los encadenaba**: el canvas mostraba la arquitectura, no una ejecucion. `pipeline.mjs`
encadena ocho nodos reales y `POST /api/careerai/pipeline` lo expone.

Ejecutado contra las fixtures del repositorio, devuelve el estado de cada paso:

```
dedupe-canonical -> stack-classifier -> remote-verifier -> opportunity-upsert
-> priority-ranker -> new-position-trigger -> apply-method-classifier -> unsupported-collector
```

El test cubre lo que importa del encadenado, no solo que corra: la deduplicacion funde el
duplicado por parametro de seguimiento, la oportunidad ajena al catalogo del cliente no pasa a
clasificada, el falso remoto (*2 days per week in the office*) no cuenta como remoto
verificado, manda el ranking del cliente, y lo ya visto no se reanaliza. La guarda de arranque
sigue activa: sin perfil confirmado y ordenado, el pipeline se bloquea en `profile`.

Ningun paso envia nada: `submit_performed: false` de principio a fin.

Ademas, `graph-layout.mjs` era el unico modulo sin test. Ya lo tiene, y cubre el caso que
motivo reescribirlo: un ciclo no debe dejar nodos sin capa, y el grafo debe caber en pantalla.

Regresion offline: **35 scripts, todos en verde**.

### hermes-doctor: el ultimo modulo sin test, y un defecto que escondia

`hermes-doctor.mjs` era el unico modulo sin cobertura propia, y precisamente donde introduje
el bloqueo del event loop. Al escribirle el test aparecio otro defecto **de la propia
correccion**: `HERMES_DOCTOR_TTL_MS=0` no desactivaba la cache.

Dos causas encadenadas:

1. `Number(process.env.HERMES_DOCTOR_TTL_MS || 60000)` — el `0` es falsy, asi que se
   convertia en 60000 y la cache seguia activa.
2. El valor se leia **una sola vez al cargar el modulo**, de modo que cambiarlo despues no
   tenia efecto.

Ahora el TTL se lee en cada llamada y se distingue el `0` explicito del valor ausente. Sin
esto no habia forma de desactivar la cache, ni en pruebas ni en produccion.

El test cubre ademas los tres transportes (`http`, `cli`, ninguno), que un CLI declarado pero
inexistente no configura nada, y que **un CLI que falla no se reporta como configurado** —
que fue el bug original: Hermes imprime su error y sale con codigo 0.

Regresion offline: 36 scripts, todos en verde.

---

## 2026-08-28 — Prioridad NVIDIA/gratis en el consejo de LLM (Claude Code)

**Rama:** `careerai/live-browser-run-tracking`

**Contexto:** `TASK-ORCA-N8N-PARITY-RUNTIME-20260828` (n8n/Orca) quedo detenida en
`codex-orca-restore-20260827` por `usage_limit_exceeded`. El usuario pidio, mientras esa
tarea se retoma con Codex, que el consejo de proveedores de `careerai` priorice NVIDIA y
modelos gratuitos, delegando a Gemini/ChatGPT antes de tocar un proveedor de pago.

**Que cambio:**

1. `apps/orca/src/careerai/llm-council.mjs` — los roles `code_review`, `systems_analysis`,
   `reporting` y `qa_testing` ahora empiezan en `nvidia` -> `hermes` (gratis) y solo delegan
   a `gemini`/`openai` despues; `claude` queda como ultimo respaldo en vez de titular.
   `heavy_lifting` y `research` ya empezaban en NVIDIA/Hermes y no se tocaron.
2. `scripts/test_careerai_model_delegation.mjs` actualizado para reflejar el nuevo orden
   (`code_review`/`qa_testing` primary = `nvidia`, con `claude`/`gemini` como fallback).

**Que NO se toco:** el resto de archivos con cambios locales sin commitear
(`graph-layout.mjs`, `runs.mjs`, `workflow_blueprints.json`, `node-inventory.json`,
`start_orca_local.mjs`, etc.) pertenecen al trabajo en curso de
`codex-orca-restore-20260827` sobre paridad n8n; no se entendieron ni verificaron en esta
sesion, asi que quedan fuera de este commit a proposito.

**Regresion offline (`scripts/test_careerai_*.mjs`, 41 scripts):** 38 en verde. Los 3 que
fallan son preexistentes y no relacionados con este cambio:
- `test_careerai_nvidia_live.mjs` / `test_careerai_gemini_live.mjs`: pegan a la API real y
  dependen de credenciales/cuota vigentes (NVIDIA responde HTTP 400 en este entorno ahora
  mismo).
- `test_careerai_canvas_live_browser.mjs`: falla al escribir
  `task-ledger/evidence/careerai/canvas-live-browser.png` — el archivo esta bloqueado por
  otro proceso (coincide con el PNG que ya aparecia modificado sin commitear).

### INCOMPLETE — trabajo en curso de codex-orca-restore-20260827, pendiente de auditoria

**Estado:** sin commitear, sin analizar en profundidad, sin verificar por mi (Claude Code).
No lo tome porque el usuario pidio explicitamente dejar `TASK-ORCA-N8N-PARITY-RUNTIME-20260828`
para que Codex la retome cuando su limite de uso se restablezca. Registro aqui lo que hay en
el arbol de trabajo para que el proximo agente no tenga que re-descubrirlo desde cero.

**Archivos trackeados modificados (11, sin commitear):**

| Archivo | Que parece contener |
|---|---|
| `apps/orca/src/careerai/graph-layout.mjs` | Nueva estrategia de layout `functional_swimlanes`: cuando todos los nodos declaran `block`, los agrupa en carriles verticales por bloque (A..I) en vez de una rejilla por capas. |
| `scripts/test_careerai_graph_layout.mjs` | Test agregado para `functional_swimlanes` (carga `node-inventory.json`, valida que existan carriles `D` y `H`). **Este test ya pasa** en la regresion actual. |
| `data/careerai/node-inventory.json` | Inventario sube de 95 a 99 nodos (58->62 "listo"). Nuevos: `nvidia-heavy-analysis`, `claude-code-review`, `getupsoft-edx-knowledge` (bloque D), `whatsapp-approval-notification` (bloque H, nodo visual n8n-compatible en modo draft-only). |
| `apps/orca/data/workflow_blueprints.json` | Agrega los mismos 4 nodos anteriores al blueprint `careerai-indeed-agent`. |
| `apps/orca/src/careerai/runs.mjs` | Cambios grandes: STEPS ahora incluye `nvidia-heavy-analysis`, `claude-code-review`, `getupsoft-edx-knowledge`, `whatsapp-approval-notification`, y separa `llm-council`/`consensus-score` a estado `waiting_for_providers`. Agrega cola de delegaciones (`data/careerai/delegations/<runId>.json` + spawn de `scripts/careerai_delegation_worker.mjs`) y control de ejecucion de runs (`data/careerai/run-control/<runId>.json` + spawn de `scripts/careerai_run_worker.mjs`), mas `tenant_id`, `execute_delegations`, `execute_workflow` como parametros nuevos de `startRun`. **No verifique que los workers referenciados funcionen end-to-end.** |
| `scripts/start_orca_local.mjs` | Nuevas rutas: `GET /api/careerai/provider-credentials`, `GET /api/careerai/models`, `GET /api/n8n/node-types`, `GET /api/careerai/browser-sessions` (y mas, +182 lineas netas). |
| `scripts/test_careerai_llm_council.mjs` | Ajuste menor (+8/-algo lineas), coherente con el consejo de proveedores. |
| `AGENTS.md`, `context/prompts/system_prompt.md`, `docs/agent-state.md` | Cambio identico y de bajo riesgo en los tres: insercion del bloque `<!-- BEGIN:shared-agent-memory-rule -->...<!-- END -->` (protocolo multi-agente), aparenta ser una sincronizacion automatica de Cowork/AGENTS.md, no logica de producto. |
| `task-ledger/evidence/careerai/canvas-live-browser.png` | Binario regenerado (231020 -> 159295 bytes), consistente con una corrida reciente de `test_careerai_canvas_live_browser.mjs` (que ahora falla por archivo bloqueado, ver arriba). |

**Archivos nuevos sin trackear relacionados (no exhaustivo, vistos con `git status`):**
`scripts/careerai_delegation_worker.mjs`, `scripts/careerai_run_worker.mjs`,
`scripts/build_careerai_n8n_parity.mjs`, `scripts/validate_careerai_n8n_parity.mjs`,
`scripts/careerai_model_review_packet.mjs`, `scripts/careerai_form_audit.py`,
`scripts/run_careerai_bot.mjs`, `scripts/test_careerai_browser_session_vault.mjs`,
`scripts/test_careerai_claude_live.mjs`, `scripts/test_careerai_gemini_live.mjs`,
`scripts/test_careerai_knowledge_context.mjs`, `scripts/test_careerai_node_use_cases.mjs`,
`scripts/test_careerai_nvidia_live.mjs`, `scripts/test_careerai_provider_credentials.mjs`,
`scripts/test_careerai_run_lifecycle.mjs` — todos consistentes con la ejecucion real de
runs (workers, sesiones de navegador, credenciales de proveedor) que describe
`TASK-ORCA-N8N-PARITY-RUNTIME-20260828`.

**Por que no lo commiteo ni lo completo:** decision explicita del usuario en esta sesion
("Just update provider priority" / dejar la auditoria de paridad n8n para Codex). No corri
los workers ni las pruebas nuevas sin trackear, asi que no puedo certificar que funcionen.

**Siguiente paso seguro para quien retome esto (Codex u otro agente):**
1. Correr las pruebas nuevas sin trackear (`test_careerai_browser_session_vault.mjs`,
   `test_careerai_knowledge_context.mjs`, `test_careerai_node_use_cases.mjs`,
   `test_careerai_provider_credentials.mjs`, `test_careerai_run_lifecycle.mjs`) para ver
   cuales ya pasan.
2. Verificar que `scripts/careerai_delegation_worker.mjs` y `scripts/careerai_run_worker.mjs`
   arrancan sin error (`node scripts/careerai_run_worker.mjs <runId-de-prueba>`).
3. Si todo pasa, commitear en bloques logicos (layout+inventory+blueprint por un lado,
   runs.mjs+workers por otro, rutas de `start_orca_local.mjs` por otro) en vez de un solo
   commit gigante, y actualizar `TASKS_LEDGER.json` / `ACTIVE_TASKS.md` a `COMPLETED_QA`.
4. Retomar literalmente en: "Auditing current node schema, execution state machine,
   browser-session persistence and n8n equivalents before implementation" (texto ya
   registrado en `TASKS_LEDGER.json`).

**Commit de cierre:** ver `git log -1` inmediatamente despues de esta entrada.
**Para revertir:** `git revert <hash>` solo afecta a `llm-council.mjs` y al test de
delegacion; no toca el resto del arbol de trabajo.

---

## 2026-08-28 — Conector WhatsApp via Evolution API, gratis y con las mismas guardas que email/formulario (Claude Code)

**Rama:** `careerai/live-browser-run-tracking`

**Contexto:** el usuario compartio un documento de arquitectura (comparativa de frameworks
de voz/WhatsApp open-source: LiveKit, Dograh, Pipecat, Evolution API, Chatwoot, n8n) y pidio
una conversacion mas fluida y una conexion de WhatsApp mas real, priorizando servicios
gratuitos, con el objetivo final de enviar 5-10 postulaciones reales (CV desde su Drive) por
correo y por formulario derivado de LinkedIn. Se acordo explicitamente con el usuario que
**cada envio real requiere su aprobacion individual** — no hay loop autonomo que envie sin
confirmacion humana por accion, siguiendo el mismo patron `prepare -> approval -> confirm`
que ya usaban `email-apply-sender` y `submit-executor` en `senders.mjs`.

**Que cambio:**

1. `apps/orca/src/careerai/whatsapp.mjs` (nuevo) — conector Evolution API (gratis,
   autoalojado, Baileys o WhatsApp Cloud API oficial). `prepareWhatsAppMessage` sigue el
   mismo esqueleto que `prepareEmailApplication`: exige `checkApproval` vigente y especifica
   de la oportunidad, valida el numero contra una lista permitida, es idempotente, y
   **nunca** pone `send_performed: true`. `sendWhatsAppMessage` es la unica funcion que toca
   la red: exige ademas `confirm: true` explicito del llamador (una segunda puerta,
   independiente de la aprobacion de negocio) y simula presencia "escribiendo..." con una
   demora aleatoria antes de enviar, siguiendo la mitigacion de bloqueo de cuenta que
   recomienda el documento para conexiones via Baileys.
2. `scripts/test_careerai_whatsapp.mjs` (nuevo) — cubre: bloqueo sin aprobacion, bloqueo por
   numero fuera de lista, que preparar nunca envia, idempotencia, bloqueo sin `confirm:true`,
   bloqueo sin `EVOLUTION_API_BASE_URL`/instancia configurados, y el envio real con `fetch`
   simulado (incluye la llamada de presencia).
3. `apps/orca/docker-compose.orca.yml` — agrega el servicio `evolution-api`
   (`evoapicloud/evolution-api:latest`) detras de un profile `whatsapp` (no se levanta con
   `docker compose up` normal; hace falta `docker compose --profile whatsapp up
   evolution-api`), con `AUTHENTICATION_API_KEY` obligatoria por variable de entorno — sin
   credenciales embebidas.

**Que NO se hizo (a proposito):**
- No se desplego ningun contenedor ni se probo contra una instancia real de Evolution API.
- No se implemento LiveKit/Dograh/Chatwoot ni el resto del stack de voz del documento — el
  usuario prioriza primero las 5-10 postulaciones reales antes que la infraestructura de voz.
- No se envio, ni se prepara para enviar automaticamente, ningun mensaje real: falta que el
  usuario decida las oportunidades concretas, apruebe cada una, y confirme cada envio.
- No se toco el prototipo anterior de WhatsApp por navegador (perfil de Chrome sobre
  `web.whatsapp.com`, visible en `apps/orca/chrome_profile/`); el nuevo conector es una
  alternativa mas robusta, no un reemplazo forzado.

**Regresion offline (`scripts/test_careerai_*.mjs`, 42 scripts):** 39 en verde. Los mismos 3
fallos preexistentes de la entrada anterior siguen fallando por las mismas razones
(dependencia de red/credenciales reales o archivo bloqueado), no relacionados con este
cambio.

**Commit de cierre:** ver `git log -1` inmediatamente despues de esta entrada.
**Para revertir:** `git revert <hash>` afecta solo a `whatsapp.mjs`, su test y el servicio
`evolution-api` en el compose (que ademas esta detras de un profile, asi que ni siquiera
activo revertirlo rompe nada en ejecucion).

**Siguiente paso seguro:** definir `EVOLUTION_API_KEY`/`EVOLUTION_API_INSTANCE` en
`.env.orca.local`, levantar `evolution-api` con el profile `whatsapp`, vincular una instancia
por QR, y solo entonces preparar el primer mensaje real de prueba — con aprobacion y
`confirm: true` explicitos del usuario para ese envio puntual.
