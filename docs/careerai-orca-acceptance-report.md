# CareerAI + ORCA Acceptance Report

Fecha de verificación: 2026-07-31
Revisión de cierre: 2026-08-26

## Alcance

Se validó el workflow `careerai-indeed-agent` en el editor local de ORCA, usando el patrón de orquestación del agente de inventario de Galantes sin copiar credenciales, datos de cliente ni lógica de publicación.

## Evidencia local

| Requisito | Resultado | Evidencia |
|---|---|---|
| Workflow CareerAI/Indeed | PASS | `apps/orca/data/workflow_blueprints.json` |
| Nodos visibles en ORCA | PASS | 15 nodos renderizados en navegador |
| Conexiones del canvas | PASS | 16 edges; 0 referencias huérfanas |
| Aprobación antes de aplicar | PASS | `approval_required_before_apply: true` |
| Orden de análisis | PASS | Hermes → Gemini → OpenAI |
| Gmail/LinkedIn gates | PASS | Nodos explícitos de notificación y autorización |
| Autocorrección y escalamiento | PASS | Nodos `autocorrection` y `blocked-escalation` |
| Fixtures offline | PASS | 8/8 en `scripts/validate_careerai_fixtures.mjs`, incluido reinicio/reanudación |
| Prepare-only dry run | PASS | 8/8 fixtures; `submit_performed: false` en `scripts/run_careerai_prepare_only.mjs` |
| Prepare-only API | PASS | `GET /api/careerai/prepare-only?fixture=...`; submit guard verified |
| Connector gates | PASS | Indeed prepare-only; LinkedIn discovery-only; Gmail draft-only; Drive read-only; Hermes configuration gate |
| Connector status API | PASS | `GET /api/careerai/connectors` returns Indeed/LinkedIn capability matrices plus safe gate contract |
| Contratos versionados | PASS | `data/careerai/contracts.json` + `scripts/validate_careerai_contracts.mjs`; 5 contratos y política de secretos/aprobación |
| Notificación segura | PASS | Simulador WhatsApp `draft-only`, allowlist, idempotencia estable y `send_performed: false` |
| LinkedIn capability gate | PASS | Adapter y `GET /api/careerai/connectors` permiten people search y bloquean `prepareApplication`/Jobs/Apply con `needs_permission` |
| Indeed provider gate | PASS | Adapter separado: discovery/preparación habilitados, submit deshabilitado; aprobación vinculada a `opportunity_id` |
| CV y cartas por oportunidad | PASS | CV original preservado por hash; CV personalizado, respuestas y carta son derivados por oportunidad; envío solo tras aprobación explícita |
| Email enviado + resumen WhatsApp | CONDITIONAL | Contrato actualizado a `approved_send_after_explicit_approval`; WhatsApp recibe solo resumen de mensajes enviados y requiere proveedor oficial |
| Redirecciones ATS | PASS | Pausa en login/consent/CAPTCHA/MFA/dominio desconocido/upload/submit; solo dominios oficiales confirmados |
| Prueba Hermes/gstack/ORCA | PASS | `1 passed` |
| Regresión integrada de artefactos | PASS | Sintaxis + registro + contratos + fixtures + notificación + LinkedIn + endpoint; todo verde |
| Sintaxis del servidor | PASS | `node --check scripts/serve-orca-local.mjs` |
| Diagnóstico Hermes | PASS | `status: configured`, `transport: cli`, Hermes Agent v0.18.2 vía `HERMES_CLI_PATH` |
| Seguimiento del run desde ORCA | PASS | `POST/GET /api/careerai/runs`, `GET /api/careerai/runs/:id`, SSE `/stream`; persistencia en `data/careerai/runs.jsonl` |
| Live browser de monitoreo | PASS | Nodo `live-browser-monitor` (`type: live_browser`) + `GET /api/careerai/live-browser`; `read_only_until_approval: true` |
| Llenado de formularios externos | PASS | Nodo `external-form-fill` en modo `prepare_only` para indeed/linkedin/glassdoor/workday/greenhouse/lever; pausa en login/consent/captcha/mfa/upload/submit |
| Regresión de seguimiento | PASS | `scripts/test_careerai_run_tracking.mjs` (10/10 scripts de CareerAI en verde) |

## Gates externos

- Indeed: preparado para `prepare-only`; el submit requiere aprobación de la oportunidad exacta.
- LinkedIn: el conector disponible solo permite búsqueda de personas; Jobs/Apply requiere API oficial y permisos aprobados.
- Gmail: búsqueda read-only verificada; no se enviaron mensajes.
- Google Drive: búsqueda read-only verificada; no se encontraron documentos vistos con la consulta conjunta `CareerAI ORCA`.
- GitHub: repositorios identificados, sin push ni PR.
- Hermes: falta configurar la clave en el runtime autorizado; no se extraen ni copian secretos.

## Criterio de habilitación

No habilitar postulaciones automáticas. La secuencia autorizable es:

`discover → analyze → consensus → prepare-only → human approval → notify → user login/consent → submit → evidence`

CAPTCHA, MFA, login, discrepancia de proveedores, aprobación expirada o falta de idempotencia deben detener el workflow y conservar el checkpoint.

## Cierre 2026-08-26

Regresión completa ejecutada: **10/10 scripts en verde** (`npm run careerai:regression` + `npm run careerai:regression:live` con el servidor local levantado con `npm run orca:start`).

Correcciones aplicadas en esta revisión:

1. **Regresión de endpoints resuelta.** `scripts/serve-orca-local.mjs` fue reemplazado por `scripts/start_orca_local.mjs` sin portar las rutas `/api/careerai/prepare-only` y `/api/careerai/connectors`; el SPA fallback devolvía `index.html` con HTTP 200, por lo que el fallo pasaba desapercibido. Ambas rutas fueron reimplementadas y ahora cualquier `/api/*` desconocido devuelve `404 JSON` en vez de HTML.
2. **Lógica prepare-only compartida.** Extraída a `apps/orca/src/careerai/prepare-only.mjs`; el CLI y el servidor usan la misma fuente, evitando que vuelvan a divergir.
3. **Seguimiento desde ORCA.** Nuevo `apps/orca/src/careerai/runs.mjs` con registro persistente de ejecuciones y estado por nodo, expuesto vía API + SSE para que el canvas siga el run en vivo.
4. **Live browser + formularios externos.** El blueprint pasa de 15 a 17 nodos (22 edges) con `external-form-fill` y `live-browser-monitor`.

5. **Diagnóstico de Hermes corregido (falso negativo).** El doctor solo miraba `HERMES_API_KEY`, pero Hermes está instalado como CLI local (`HERMES_CLI_PATH` → Hermes Agent v0.18.2, responde a `--version`). Nuevo `apps/orca/src/careerai/hermes-doctor.mjs` reconoce ambos transportes y reporta `transport: http|cli`. El gate pasa de PARTIAL a PASS.

Pendientes que siguen bloqueados por terceros (no por código):

- Envío real de WhatsApp: existen `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID` y `WHATSAPP_BUSINESS_ACCOUNT_ID` en `.env.local`, por lo que el proveedor oficial parece provisionado. Aun así el canal se mantiene deliberadamente en `draft-only`: habilitar envío real es una decisión explícita del propietario, no un cambio de código pendiente.

## Cierre 2026-08-27 (cont.)

Regresión completa ejecutada: **21/21 scripts en verde** (`npm run careerai:regression`).

Nuevo módulo: `apps/orca/src/careerai/connection-strategy.mjs` (`connection-strategy-router` + `mcp-connector-registry`). Decide en cascada estricta el nivel de conexión por plataforma (`mcp` → `oauth2` → `live_browser_manual`), pausando ante plataformas no declaradas en ningún registro. Grafo: 39 nodos, 58 edges. Inventario: 39 listos, 13 con prototipo, 43 por construir.

Se evaluó tomar `workday-adapter` (siguiente ATS que `ats-router` ya señala como pendiente), pero su entrada en el inventario tiene `owner: joel` porque Workday exige creación de cuenta obligatoria — fuera del alcance de este agente sin decisión explícita del propietario.

## Cierre 2026-08-27 (cont. 2)

Regresión completa ejecutada: **22/22 scripts en verde** (`npm run careerai:regression`).

Nuevo módulo: `apps/orca/src/careerai/tenant-resolver.mjs` (`tenant-resolver`). Resuelve `tenant_id` con precedencia `request > session > default`; sin fuente confiable pausa en vez de inventar un tenant. Valida forma (rechaza espacios, mayúsculas y `..` de path traversal, ya que `tenant_id` termina en rutas de archivo y claves de vault) y bloquea reasignar el tenant de un run ya vinculado. Grafo: 40 nodos, 60 edges. Inventario: 40 listos, 13 con prototipo, 42 por construir.

## Cierre 2026-08-27 (cont. 3)

Regresión completa ejecutada: **24/24 scripts en verde** (`npm run careerai:regression`).

Nuevos módulos: `project-run-binding` (verifica que el run y el proyecto ORCA pertenezcan al mismo tenant antes de asociarlos) y `rate-limiter` (espaciado mínimo por portal — Indeed 45s, LinkedIn 90s, Glassdoor/Workday 60s, Greenhouse/Lever 20s; portal desconocido usa el intervalo más conservador). Grafo: 42 nodos, 63 edges. Inventario: 42 listos, 13 con prototipo, 40 por construir.

## Cierre 2026-08-27 (cont. 4)

Regresión completa ejecutada: **25/25 scripts en verde** (`npm run careerai:regression`).

Nuevo módulo: `queue-dispatcher` (serializa corridas por tenant; distintos tenants corren en paralelo entre sí, pero un mismo tenant nunca tiene dos corridas activas a la vez — evita corrupción de sesión de navegador compartida). Grafo: 43 nodos, 65 edges. Inventario: 43 listos, 13 con prototipo, 39 por construir.

## Próxima acción segura

Configurar Hermes mediante el mecanismo oficial de entorno/conector y repetir el doctor check. Después, ejecutar una oportunidad fixture en `prepare-only`; cualquier envío real requiere confirmación explícita en la solicitud concreta.
