# Mega Prompt Maestro v3 — Plataforma de Agendamiento Google Calendar + Orquestación Multi-CLI + Memoria de Largo Plazo + Fase Odoo

## Rol
Actúa como un **Arquitecto de Software Principal + Staff Backend Engineer + Integration Architect + QA Automation Lead + DevOps Implementer + AI Agent Orchestrator + Memory Systems Designer**, especializado en:

- **Node.js**
- **Express.js**
- **Google Calendar API v3**
- **OAuth2**
- **Google Cloud Platform**
- **SendGrid**
- **automatización de pruebas funcionales**
- **sistemas de memoria persistente para agentes**
- **orquestación multi-CLI**
- **integración empresarial con Odoo**
- **trazabilidad operativa y cumplimiento de tareas**

Tu misión es **diseñar, implementar, documentar, probar, verificar, auditar y dejar operativo** un sistema de **agendamiento de citas listo para producción**, basado estrictamente en la **Google Calendar API v3**, con:

1. backend robusto en Node.js,
2. bot de configuración y pruebas funcionales,
3. seguimiento de cumplimiento de tareas,
4. orquestación multi-modelo con **Claude Code**, **Codex CLI** y **Gemini CLI**,
5. memoria de largo plazo optimizada para agentes,
6. y una **fase posterior obligatoria de integración con Odoo** una vez que el módulo de calendario quede validado.

Debes trabajar con **precisión milimétrica**, priorizando:

- seguridad,
- modularidad,
- mantenibilidad,
- continuidad operacional,
- reanudación exacta del trabajo,
- minimización de consumo de contexto,
- ahorro de créditos/cuota de modelos,
- evidencia verificable,
- y documentación ejecutable.

---

## Objetivo maestro del proyecto
Construir una plataforma que permita:

- recibir solicitudes de citas,
- validar y sanitizar payloads,
- autenticar con Google mediante OAuth2,
- refrescar credenciales automáticamente,
- insertar eventos en Google Calendar,
- notificar por correo con SendGrid,
- ejecutar configuración asistida y pruebas funcionales por bot,
- rastrear tareas, evidencias, handoffs y checkpoints,
- alternar entre Claude Code, Codex CLI y Gemini CLI cuando uno se quede sin créditos, cuota o capacidad temporal,
- guardar memoria útil de largo plazo de todos los cambios, decisiones, conversaciones compactadas y resultados,
- y, cuando el módulo de agenda quede aceptado, **abrir la siguiente fase de integración con Odoo**.

---

## Regla crítica de ejecución por fases
Debes trabajar en este orden estricto:

### Fase 1 — Plataforma de agendamiento con Google Calendar
Implementar el sistema completo de citas, pruebas, tracking, orquestación y memoria.

### Fase 2 — Validación obligatoria de Fase 1
No comiences la integración con Odoo hasta que la Fase 1 esté en estado **validated** con evidencia suficiente.

### Fase 3 — Integración con Odoo
Una vez aprobada la Fase 1, debes continuar automáticamente con la integración de Odoo sin reiniciar el proyecto desde cero y sin perder contexto.

### Regla de avance
**La integración con Odoo no es opcional**. Es una fase dependiente del cumplimiento del calendario.

---

## Hallazgos estructurales que deben influir en la solución
La arquitectura debe quedar lista para soportar casos de uso de:

- scheduling y booking,
- asistentes de reuniones,
- CRM y workflows comerciales,
- productividad interna,
- workflow automation,
- gestión de recursos,
- reservas 24/7,
- recordatorios y notificaciones,
- acceso multicanal,
- reglas de disponibilidad,
- trazabilidad,
- cumplimiento operativo,
- y posterior sincronización con sistemas empresariales.

No diseñes una solución rígida. Debe poder crecer hacia:

- múltiples tipos de servicio,
- buffers,
- conflictos de agenda,
- reprogramaciones,
- cancelaciones,
- sincronización con CRM/ERP,
- automatizaciones posteriores,
- reporting y auditoría.

---

## Stack obligatorio del módulo principal
Debes usar este stack como base del proyecto:

- **Runtime:** Node.js v18 o superior
- **Framework:** Express.js
- **Google libs:** `googleapis`, `google-auth-library`
- **Mail:** `@sendgrid/mail`
- **Secrets/config:** `dotenv`
- **Parsing:** `body-parser`

Puedes agregar librerías auxiliares solo si aportan:

- validación,
- seguridad,
- generación ICS,
- observabilidad,
- testing,
- persistencia de estado,
- parsing de salida de CLIs,
- o claridad estructural.

Toda librería extra debe justificarse dentro del código o la documentación técnica.

---

# PARTE I — IMPLEMENTACIÓN DEL SISTEMA DE CALENDARIO

## 1. Autenticación OAuth2
Implementa un flujo asíncrono robusto que cumpla exactamente con lo siguiente:

- `oauth2Client` configurado con:
  - `CLIENT_ID`
  - `CLIENT_SECRET`
  - `REDIRECT_URI`
- gestión del ciclo de vida de `token.json`,
- verificación de token antes de cada transacción,
- refresh automático usando `refresh_token`,
- error controlado si el `refresh_token` no existe o falla,
- captura específica de `invalid_grant`,
- cero secretos hardcodeados,
- uso exclusivo de `process.env` para credenciales sensibles.

## 2. Endpoint principal
Debes implementar:

`POST /api/v1/appointments`

### Payload mínimo
- `name`
- `email`
- `date`
- `time`
- `duration`

### Payload opcional recomendado
- `description`
- `serviceType`
- `notes`
- `timezone`
- `phone`
- `metadata`

### Validaciones obligatorias
- sanitización estricta,
- rechazo de payloads peligrosos,
- normalización de email,
- validación de fecha y hora,
- duración positiva y acotada,
- control de longitud de strings,
- rechazo explícito de datos inconsistentes.

## 3. Manejo temporal
Debes:

- recibir `date`, `time` y opcionalmente `timezone`,
- construir un `DateTime` válido,
- convertir a **ISO 8601 UTC**,
- persistir y usar UTC para inserción,
- evitar errores por DST y parsing ingenuo,
- documentar la política cuando `timezone` no exista.

## 4. Inserción de eventos en Google Calendar
Debes usar `calendar.events.insert` sobre:

`calendarId: 'primary'`

### Recurso del evento
Debe incluir como mínimo:

- `summary`: identificador de cita + nombre del cliente,
- `description`: detalles técnicos,
- `attendees`: email del cliente con `responseStatus: 'needsAction'`,
- `reminders`: popup 30 minutos antes.

### Preparación futura
Deja lista la arquitectura para:
- `freebusy.query`,
- conflictos de agenda,
- cancelación,
- reprogramación,
- reglas por tipo de servicio.

## 5. Notificación por correo
Después de una inserción exitosa:

- dispara una función asíncrona de SendGrid,
- envía confirmación al cliente,
- incluye `.ics` o `htmlLink`,
- registra fallos con trazabilidad,
- decide explícitamente si el fallo de email implica éxito parcial o error,
- documenta esa decisión.

## 6. Manejo global de errores
Implementa middleware global con tratamiento específico para:

- `invalid_grant`
- `rateLimitExceeded`
- errores de validación
- errores internos
- errores de red
- errores de SendGrid
- errores de parsing
- errores de CLIs
- errores de cuota agotada
- errores de handoff
- errores de memoria
- errores de integración con Odoo

Toda respuesta de error debe ser:

- consistente,
- segura,
- JSON,
- sin secretos,
- sin stacktrace en producción.

## 7. Modularidad mínima obligatoria
Debes separar como mínimo:

- `config/googleAuth.js`
- `services/calendarService.js`
- `controllers/appointmentController.js`

Y además incluir, si aplica:

- `routes/appointmentRoutes.js`
- `middlewares/errorHandler.js`
- `middlewares/notFound.js`
- `utils/validation.js`
- `utils/dateTime.js`
- `utils/logger.js`
- `services/emailService.js`
- `services/icsService.js`
- `services/taskLedgerService.js`
- `services/handoffService.js`
- `services/memory/`
- `services/cliProviders/`
- `bots/setupAndTestBot.js`
- `bots/taskComplianceBot.js`
- `bots/modelOrchestratorBot.js`
- `bots/memoryCuratorBot.js`

---

# PARTE II — BOTS OPERATIVOS

## 8. Bot de configuración y pruebas funcionales
Debes crear un bot que:

### A. Verifique entorno
- `.env`
- variables obligatorias
- `token.json`
- Google API reachability
- SendGrid reachability
- puerto disponible
- configuración temporal consistente
- integridad del directorio de memoria
- disponibilidad de los CLIs configurados

### B. Ejecute pruebas funcionales
Como mínimo:
- creación exitosa de cita,
- payload inválido,
- email inválido,
- duración inválida,
- fecha inválida,
- hora inválida,
- refresh exitoso,
- refresh fallido,
- error Google Calendar,
- error SendGrid,
- validación de respuesta JSON,
- validación de ICS o `htmlLink`,
- prueba del task ledger,
- prueba de checkpoint,
- prueba de handoff,
- simulación de agotamiento de proveedor.

### C. Produzca salida operativa
- checks OK/FAIL,
- pruebas aprobadas/fallidas,
- recomendaciones,
- exit code útil.

---

# PARTE III — SEGUIMIENTO DE CUMPLIMIENTO

## 9. Ledger persistente de tareas
Debes implementar una capa de seguimiento que permita responder:

- qué tareas existen,
- cuál está en curso,
- cuánto del plan está completado,
- qué evidencias existen,
- qué modelo hizo qué,
- qué tarea fue transferida,
- qué pruebas validaron cada tarea,
- qué falta para cerrar cada fase.

### Archivos obligatorios
- `task-ledger/tasks.json`
- `task-ledger/tasks.md`
- `task-ledger/execution-log.ndjson`
- `task-ledger/handoffs.json`
- `task-ledger/checkpoints/`

### Estados mínimos
- `pending`
- `ready`
- `in_progress`
- `blocked`
- `awaiting_validation`
- `validated`
- `handoff_required`
- `handoff_in_progress`
- `completed`
- `failed`
- `partially_completed`

### Reglas
- no completar sin evidencia,
- no avanzar tareas críticas sin criterios,
- toda prueba referencia `taskId`,
- toda transferencia se registra,
- toda falla deja causa exacta,
- todo parcial deja faltantes explícitos.

---

# PARTE IV — ORQUESTACIÓN MULTI-CLI

## 10. Proveedores obligatorios
Debes diseñar un orquestador capaz de usar:

- **Claude Code**
- **Codex CLI**
- **Gemini CLI**

## 11. Regla de continuidad por agotamiento
Cuando un proveedor se quede sin:

- créditos,
- cuota,
- rate limit operativo,
- capacidad temporal,
- sesión válida,
- o produzca fallos transitorios repetidos,

la tarea debe:

1. conservar su `taskId`,
2. generar checkpoint,
3. registrar handoff,
4. empaquetar contexto mínimo útil,
5. pasar al siguiente proveedor,
6. continuar la tarea,
7. no reiniciarse desde cero salvo inconsistencia grave documentada.

## 12. Prioridad configurable
Debes leer el orden desde entorno, por ejemplo:

```env
MODEL_PROVIDER_ORDER=claude_code,codex_cli,gemini_cli
CLAUDE_CODE_ENABLED=true
CODEX_CLI_ENABLED=true
GEMINI_CLI_ENABLED=true
CLAUDE_CODE_CMD=claude
CODEX_CLI_CMD=codex
GEMINI_CLI_CMD=gemini
CLI_TASK_TIMEOUT_MS=900000
CLI_MAX_RETRIES_PER_PROVIDER=2
CLI_COOLDOWN_ON_RATE_LIMIT_MS=60000
CLI_CHECKPOINT_DIR=./task-ledger/checkpoints
CLI_HANDOFF_STRATEGY=continue_from_last_checkpoint
CLI_REQUIRE_STRUCTURED_OUTPUT=true
CLI_AUDIT_LOG_ENABLED=true
```

## 13. Clasificación interna de fallos de proveedor
Normaliza como mínimo:

- `CLI_QUOTA_EXHAUSTED`
- `CLI_CREDITS_EXHAUSTED`
- `CLI_RATE_LIMITED`
- `CLI_TIMEOUT`
- `CLI_NOT_INSTALLED`
- `CLI_AUTH_FAILURE`
- `CLI_OUTPUT_INVALID`
- `CLI_TRANSIENT_FAILURE`

## 14. Checkpoints obligatorios
Cada checkpoint debe guardar:

- `taskId`
- objetivo
- contexto resumido
- archivos tocados
- cambios producidos
- pendientes exactos
- pruebas corridas
- errores observados
- siguiente acción sugerida
- proveedor saliente
- proveedor entrante
- timestamp

## 15. Handoff obligatorio
Cada handoff debe incluir:

- motivo,
- estado actual,
- resumen técnico compacto,
- criterios no cumplidos,
- artefactos producidos,
- riesgos abiertos,
- instrucciones para retomar,
- referencia al checkpoint.

---

# PARTE V — MEMORIA DE LARGO PLAZO OPTIMIZADA PARA AGENTES

## 16. Objetivo de la memoria
Debes implementar una **memoria de largo plazo persistente** que reduzca al mínimo la necesidad de releer contexto completo en cada sesión o cambio de proveedor.

La memoria debe guardar, como mínimo:

- cambios realizados,
- decisiones técnicas,
- estado de tareas,
- conversaciones resumidas,
- handoffs,
- checkpoints,
- resultados de pruebas,
- errores recurrentes,
- preferencias operativas,
- convenciones del proyecto,
- rutas críticas,
- contratos de integración,
- y contexto necesario para retomar el trabajo sin volver a gastar tokens innecesariamente.

## 17. Principio rector de memoria
La memoria debe ser:

- **file-first**
- **auditable**
- **versionable**
- **compacta**
- **jerárquica**
- **portable entre proveedores**
- **segura**
- **redactada de secretos**
- **optimizada para carga parcial**
- **compuesta por capas hot / warm / cold**

## 18. Arquitectura de memoria por capas

### Hot memory — siempre cargable
Debe contener solo lo estrictamente necesario para retomar trabajo:
- estado actual,
- último task completado,
- task actual,
- siguiente task,
- blockers,
- decisiones vigentes,
- contratos activos,
- comandos clave.

### Warm memory — contexto reutilizable
Debe contener:
- arquitectura,
- convenciones,
- reglas por módulo,
- decisiones importantes,
- patrones de integración,
- troubleshooting frecuente.

### Cold memory — histórico completo no siempre cargado
Debe contener:
- conversaciones compactadas por sesión,
- diffs,
- logs,
- reportes extensos,
- archivos de evidencia,
- snapshots,
- transcriptos resumidos por lote,
- reportes de ejecución largos.

### Regla de economía
**Nunca cargues transcriptos completos o logs extensos en la memoria caliente.**
Debes guardar el histórico, pero resumirlo en capas cortas y enlazables.

## 19. Estructura mínima de memoria
Debes crear como mínimo:

```text
memory/
├─ README.md
├─ current/
│  ├─ now.md
│  ├─ next-actions.md
│  ├─ blockers.md
│  ├─ active-contracts.md
│  └─ active-risks.md
├─ decisions/
│  └─ decision-log.md
├─ architecture/
│  ├─ system-map.md
│  ├─ integration-map.md
│  └─ module-boundaries.md
├─ conversations/
│  ├─ index.json
│  ├─ sessions.ndjson
│  └─ summaries/
├─ tasks/
│  ├─ task-index.json
│  ├─ evidence/
│  └─ completion-reports/
├─ checkpoints/
├─ handoffs/
├─ diffs/
├─ tests/
│  ├─ latest-summary.md
│  └─ reports/
├─ providers/
│  ├─ claude/
│  ├─ codex/
│  └─ gemini/
└─ archives/
```

## 20. Política obligatoria de conversación
Debes guardar memoria de conversaciones, pero de forma optimizada:

### Debes persistir
- sesión,
- fecha,
- objetivo,
- decisiones,
- archivos tocados,
- resumen corto,
- resumen técnico,
- pendientes,
- riesgos,
- comandos usados,
- proveedor que ejecutó,
- salida relevante normalizada.

### No debes cargar siempre
- transcriptos completos,
- cadenas largas de razonamiento,
- logs crudos,
- prompts con secretos,
- stdout masivo.

### Formato recomendado
- `NDJSON` para eventos,
- `Markdown` para resúmenes humanos,
- `JSON` para índices y lookup rápido,
- nombres estables por `taskId`, `sessionId`, `provider`, `timestamp`.

## 21. Curación y compactación obligatoria
Debes crear un **memoryCuratorBot** con estas responsabilidades:

- resumir sesiones al terminar,
- compactar conversaciones largas,
- extraer hechos duraderos,
- mover material viejo de hot a warm o cold,
- detectar duplicados,
- redactar secretos,
- actualizar archivos de contexto para agentes,
- regenerar índices,
- producir reportes de coherencia.

## 22. Regla de calidad de memoria
Cada entrada de memoria debe responder a una de estas categorías:

- `instruction`
- `fact`
- `decision`
- `checkpoint`
- `handoff`
- `evidence`
- `bug_pattern`
- `workflow`
- `integration_contract`
- `open_issue`
- `resolved_issue`

Si no pertenece a una categoría útil, no debe quedar en memoria caliente.

---

# PARTE VI — OPTIMIZACIÓN ESPECÍFICA PARA CLAUDE CODE, CODEX CLI Y GEMINI CLI

## 23. Memoria optimizada para Codex CLI
Debes usar **`AGENTS.md` como contrato principal cross-agent** del repositorio.

### Reglas
- `AGENTS.md` en raíz define instrucciones globales,
- puedes usar archivos `AGENTS.md` anidados por subdirectorio si el módulo lo requiere,
- debes colocar workflows reutilizables en `.agents/skills/`,
- no metas en `AGENTS.md` historiales extensos,
- usa `AGENTS.md` para:
  - acuerdos del proyecto,
  - comandos obligatorios,
  - estándares,
  - tareas de validación,
  - restricciones de seguridad,
  - criterios de done,
  - rutas importantes,
  - cómo consultar la memoria persistente.

### Skills
Cuando una rutina sea repetible, crea skills específicas, por ejemplo:
- `calendar-oauth-recovery`
- `appointment-validation`
- `provider-handoff`
- `memory-curation`
- `odoo-json2-sync`
- `odoo-webhook-verification`

Cada skill debe vivir en `.agents/skills/<skill-name>/SKILL.md` y cargar contexto bajo demanda.

## 24. Memoria optimizada para Claude Code
Debes crear un **`CLAUDE.md`** derivado y conciso.

### Reglas
- `CLAUDE.md` no debe ser un dump completo del proyecto,
- debe contener solo:
  - estado vigente,
  - acuerdos del proyecto,
  - comandos clave,
  - rutas críticas,
  - errores recurrentes,
  - dónde leer más contexto,
  - reglas de handoff,
  - políticas de seguridad,
  - punteros a memoria warm/cold.

### Restricción de tamaño
Mantén `CLAUDE.md` **compacto y deliberadamente corto** para no desperdiciar contexto.

### Complementos
- usa archivos complementarios en `.claude/rules/` si necesitas reglas por tipo de archivo o módulo,
- si el flujo lo soporta, deja habilitada la captura de aprendizajes persistentes del entorno, pero sin depender solo de eso.

## 25. Memoria optimizada para Gemini CLI
Debes crear un **`GEMINI.md`** modular y jerárquico.

### Reglas
- `GEMINI.md` debe ser claro, corto y orientado a ejecución,
- usa imports (`@archivo.md`) para dividir contexto,
- usa archivos específicos por componente cuando sea útil,
- debes permitir recarga y verificación de memoria dentro del flujo de trabajo,
- si hace falta, configura el proyecto para que Gemini también pueda reconocer `AGENTS.md` como nombre de contexto aceptado.

### Estructura recomendada
- `GEMINI.md` raíz: reglas globales y punteros
- imports hacia:
  - `memory/current/now.md`
  - `memory/current/next-actions.md`
  - `memory/architecture/system-map.md`
  - `memory/providers/gemini/gemini-ops.md`

## 26. Política cross-agent
Debes evitar duplicar de forma caótica la memoria entre archivos de agentes.

### Canonical source
La fuente canónica debe ser:

1. `memory/`
2. `task-ledger/`
3. `docs/`
4. `AGENTS.md`

### Derivados
Los archivos:
- `CLAUDE.md`
- `GEMINI.md`
- `.agents/skills/*`
- `.claude/rules/*`

deben **derivarse** de la memoria canónica y no convertirse en silos inconsistentes.

### Regla de sincronización
Cada vez que cambie el estado del proyecto, el sistema debe poder:

- actualizar memoria canónica,
- regenerar archivos de contexto para agentes,
- registrar timestamp,
- registrar hash o versión,
- dejar evidencia de sincronización.

## 27. Proveedor de memoria consultable
Debes dejar lista una capa de consulta, por ejemplo:

- `services/memory/memoryIndexService.js`
- `services/memory/memoryQueryService.js`
- `services/memory/memoryCompactionService.js`
- `services/memory/agentContextBuilder.js`

### Objetivo
Permitir que cualquier proveedor lea solo el subconjunto mínimo de contexto necesario.

## 28. MCP opcional pero recomendado para memoria
Si decides implementar una puerta de acceso a memoria por MCP o interfaz equivalente, debe exponer recursos seguros como:

- estado actual,
- siguiente tarea,
- decisiones activas,
- checkpoints,
- últimos handoffs,
- contratos,
- reportes de prueba.

No dependas exclusivamente de MCP. La memoria debe seguir siendo usable solo con archivos del repositorio.

---

# PARTE VII — FASE ODOO POST-CALENDARIO

## 29. Regla de activación de Odoo
Cuando el sistema de calendario esté validado, debes crear y ejecutar automáticamente la siguiente ola de trabajo:

- **Fase Odoo = enabled**
- sin replantear el proyecto desde cero,
- usando la memoria persistente acumulada,
- reaprovechando contactos, citas, servicios, estados y metadatos ya definidos.

## 30. Objetivo de la integración con Odoo
La integración con Odoo debe convertir la plataforma de citas en una solución lista para integrarse con operaciones comerciales o administrativas.

Como mínimo, debes dejar lista la arquitectura para:

- crear o sincronizar contactos (`res.partner`) desde citas confirmadas,
- mapear citas a entidades de negocio configurables,
- dejar contrato claro para sincronización con:
  - CRM,
  - ventas,
  - calendario interno,
  - helpdesk,
  - servicios,
  - o procesos administrativos,
- registrar identificadores cruzados Google ↔ sistema interno ↔ Odoo,
- soportar sincronización futura bidireccional o por eventos.

## 31. Reglas técnicas obligatorias para Odoo
Para trabajo nuevo, debes preferir **Odoo JSON-2 API**.

### Debes contemplar
- autenticación por API key,
- `Authorization: bearer`,
- `X-Odoo-Database` cuando aplique,
- llamadas explícitas por `model` y `method`,
- argumentos nombrados,
- separación clara entre integración externa y lógica interna.

### Debes evitar como base nueva
- construir la integración nueva sobre XML-RPC o JSON-RPC legados si no es estrictamente necesario,
- depender de endpoints con futuro deprecado cuando ya exista alternativa oficial más moderna.

## 32. Mapeo mínimo de datos hacia Odoo
Debes definir contrato mínimo para enviar o sincronizar:

```json
{
  "appointmentId": "APT-20260215-000123",
  "googleEventId": "google-event-id",
  "customer": {
    "name": "Juan Pérez",
    "email": "juan.perez@example.com",
    "phone": "+52..."
  },
  "service": {
    "type": "consultation",
    "duration": 45
  },
  "schedule": {
    "startUtc": "2026-02-15T20:30:00.000Z",
    "endUtc": "2026-02-15T21:15:00.000Z",
    "timezone": "America/Mexico_City"
  },
  "status": "confirmed",
  "notes": "Cliente solicita videollamada"
}
```

## 33. Estrategias mínimas de integración con Odoo
Debes diseñar, como mínimo, estas rutas:

### Ruta A — Sync de contactos
- crear/actualizar `res.partner`
- evitar duplicados por email/phone
- registrar `odooPartnerId`

### Ruta B — Registro de oportunidad o servicio
- definir si la cita crea:
  - lead,
  - actividad,
  - calendario interno,
  - ticket,
  - orden de servicio,
  - o solo bitácora sincronizada

### Ruta C — Webhooks / automatización
Deja preparada la arquitectura para:
- recibir webhooks desde Odoo,
- enviar actualizaciones a Odoo,
- testear webhooks sobre entorno seguro antes de producción.

## 34. Fase de Odoo — tareas mínimas
Debes crear tareas específicas posteriores a Fase 1, por ejemplo:

- `ODOO-001` Definir estrategia de integración
- `ODOO-002` Definir contrato Appointment ↔ Odoo
- `ODOO-003` Implementar cliente JSON-2 de Odoo
- `ODOO-004` Implementar sync de `res.partner`
- `ODOO-005` Implementar registro de entidad asociada a cita
- `ODOO-006` Implementar idempotencia y deduplicación
- `ODOO-007` Implementar pruebas de integración
- `ODOO-008` Implementar handoff y memoria específicos de Odoo
- `ODOO-009` Documentar despliegue y credenciales
- `ODOO-010` Validar integración completa

## 35. Criterios de aceptación de Fase Odoo
La fase Odoo se considera aceptable si:

- existe cliente Odoo desacoplado,
- la autenticación funciona,
- el contrato Appointment ↔ Odoo está documentado,
- el sync mínimo crea o actualiza datos correctamente,
- hay idempotencia básica,
- hay pruebas,
- el ledger registra las tareas Odoo,
- la memoria persistente incluye el estado de integración,
- el sistema puede reanudar la fase Odoo tras una interrupción.

---

# PARTE VIII — DOCUMENTACIÓN Y ESTADO RETOMABLE

## 36. Documentos de estado obligatorios
Debes crear y mantener:

- `docs/agent-state.md`
- `docs/handoff.md`
- `docs/timeline.md`
- `docs/implementation-log.md`
- `docs/verification-report.md`
- `docs/decision-log.md`
- `docs/open-questions.md`

## 37. Regla de reanudación
Si estos archivos ya existen:

- no replantees el proyecto,
- no repitas diagnóstico completo,
- resume:
  - último task completado,
  - task actual,
  - siguiente task,
  - blockers,
  - decisiones vigentes,
  - estado de memoria,
  - estado de proveedores,
  - estado de Fase Odoo.

## 38. Regla de parada segura
Antes de detenerte debes dejar:

1. `docs/agent-state.md` actualizado
2. `docs/handoff.md` actualizado
3. `task-ledger/` actualizado
4. `memory/` curada y sincronizada
5. siguiente tarea exacta
6. comandos para retomar
7. riesgos abiertos
8. pruebas ejecutadas
9. proveedor actual y proveedor de respaldo
10. checkpoint vigente

---

# PARTE IX — PRUEBAS

## 39. Tipos de pruebas obligatorias
### Unitarias
- validación
- tiempo
- payload Google
- correo
- ICS
- parser de CLIs
- clasificación de fallos
- builder de contextos de memoria
- cliente Odoo
- mapping Appointment ↔ Odoo

### Integración
- controller + service
- auth flow mock
- Google insert mock
- SendGrid mock
- ledger
- checkpoint
- handoff
- memory index
- context builders
- Odoo client mock
- sync Odoo

### Funcionales / E2E
- happy path calendario
- errores de validación
- refresh token
- error Google
- error email
- handoff de proveedor
- continuidad tras agotamiento
- persistencia de memoria
- regeneración de AGENTS/CLAUDE/GEMINI
- activación de fase Odoo
- sync mínimo hacia Odoo

---

# PARTE X — ESTRUCTURA SUGERIDA

## 40. Árbol sugerido
```text
project-root/
├─ app.js
├─ package.json
├─ .env.example
├─ README.md
├─ AGENTS.md
├─ CLAUDE.md
├─ GEMINI.md
├─ token.json                     # no versionar
├─ docs/
│  ├─ agent-state.md
│  ├─ handoff.md
│  ├─ timeline.md
│  ├─ implementation-log.md
│  ├─ verification-report.md
│  ├─ decision-log.md
│  └─ open-questions.md
├─ task-ledger/
│  ├─ tasks.json
│  ├─ tasks.md
│  ├─ handoffs.json
│  ├─ execution-log.ndjson
│  └─ checkpoints/
├─ memory/
│  ├─ README.md
│  ├─ current/
│  ├─ decisions/
│  ├─ architecture/
│  ├─ conversations/
│  ├─ tasks/
│  ├─ checkpoints/
│  ├─ handoffs/
│  ├─ diffs/
│  ├─ tests/
│  ├─ providers/
│  └─ archives/
├─ .agents/
│  └─ skills/
├─ .claude/
│  └─ rules/
├─ .gemini/
│  ├─ settings.json
│  └─ agents/
├─ src/
│  ├─ config/
│  │  ├─ googleAuth.js
│  │  └─ odooClient.js
│  ├─ controllers/
│  │  └─ appointmentController.js
│  ├─ routes/
│  │  ├─ appointmentRoutes.js
│  │  └─ odooRoutes.js
│  ├─ services/
│  │  ├─ calendarService.js
│  │  ├─ emailService.js
│  │  ├─ icsService.js
│  │  ├─ taskLedgerService.js
│  │  ├─ handoffService.js
│  │  ├─ odooSyncService.js
│  │  ├─ appointmentToOdooMapper.js
│  │  ├─ memory/
│  │  │  ├─ memoryIndexService.js
│  │  │  ├─ memoryQueryService.js
│  │  │  ├─ memoryCompactionService.js
│  │  │  └─ agentContextBuilder.js
│  │  └─ cliProviders/
│  │     ├─ claudeCodeProvider.js
│  │     ├─ codexCliProvider.js
│  │     └─ geminiCliProvider.js
│  ├─ middlewares/
│  │  ├─ errorHandler.js
│  │  └─ notFound.js
│  ├─ utils/
│  │  ├─ validation.js
│  │  ├─ dateTime.js
│  │  ├─ logger.js
│  │  ├─ appError.js
│  │  ├─ cliOutputParser.js
│  │  └─ providerFailureClassifier.js
│  └─ constants/
│     └─ index.js
├─ bots/
│  ├─ setupAndTestBot.js
│  ├─ taskComplianceBot.js
│  ├─ modelOrchestratorBot.js
│  └─ memoryCuratorBot.js
└─ tests/
   ├─ unit/
   ├─ integration/
   └─ functional/
```

---

# PARTE XI — VARIABLES DE ENTORNO

## 41. Variables mínimas
```env
# App
NODE_ENV=development
PORT=3000

# Google OAuth2
CLIENT_ID=
CLIENT_SECRET=
REDIRECT_URI=
TOKEN_PATH=./token.json

# SendGrid
SENDGRID_API_KEY=
SENDGRID_FROM_EMAIL=

# Orquestación
MODEL_PROVIDER_ORDER=claude_code,codex_cli,gemini_cli
CLAUDE_CODE_ENABLED=true
CODEX_CLI_ENABLED=true
GEMINI_CLI_ENABLED=true
CLAUDE_CODE_CMD=claude
CODEX_CLI_CMD=codex
GEMINI_CLI_CMD=gemini
CLI_TASK_TIMEOUT_MS=900000
CLI_MAX_RETRIES_PER_PROVIDER=2
CLI_COOLDOWN_ON_RATE_LIMIT_MS=60000
CLI_CHECKPOINT_DIR=./task-ledger/checkpoints
CLI_REQUIRE_STRUCTURED_OUTPUT=true

# Memoria
MEMORY_ROOT=./memory
MEMORY_ENABLE_CURATION=true
MEMORY_SESSION_SUMMARY_MAX_CHARS=6000
MEMORY_HOT_MAX_LINES=200
MEMORY_REDACT_SECRETS=true
MEMORY_REBUILD_AGENT_CONTEXT_ON_CHANGE=true

# Odoo
ODOO_ENABLED=false
ODOO_BASE_URL=
ODOO_DATABASE=
ODOO_API_KEY=
ODOO_TIMEOUT_MS=30000
ODOO_SYNC_ON_APPOINTMENT_VALIDATED=false
```

---

# PARTE XII — README Y SALIDA

## 42. README obligatorio
Debe incluir:

- propósito
- arquitectura
- variables
- instalación
- uso de `token.json`
- cómo correr la app
- cómo correr bots
- cómo correr pruebas
- cómo correr orquestación
- cómo reanudar tareas
- cómo funciona la memoria
- cómo regenerar AGENTS/CLAUDE/GEMINI
- cómo activar fase Odoo
- errores comunes
- seguridad

## 43. Requisitos de salida de la implementación
La salida final debe incluir, en este orden:

1. árbol de directorios
2. `package.json`
3. `.env.example`
4. código de cada archivo
5. bots
6. módulos de memoria
7. adaptadores CLI
8. cliente Odoo e integración mínima
9. pruebas
10. README
11. notas mínimas de ejecución

No devuelvas pseudocódigo en piezas críticas.
No dejes `TODO` abiertos en:
- OAuth2,
- validación,
- tracking,
- handoff,
- memoria,
- checkpoint,
- integración Odoo.

---

# PARTE XIII — CRITERIOS DE ACEPTACIÓN GLOBALES

## 44. Done de Fase 1
La Fase 1 queda lista solo si:

- la app arranca,
- el endpoint funciona,
- la validación es consistente,
- el refresh se comporta correctamente,
- Google event se crea,
- el correo sale o falla controladamente,
- el bot de setup detecta fallos,
- el bot funcional ejecuta casos clave,
- el ledger refleja el estado real,
- el orquestador puede mover tareas entre proveedores,
- la memoria persiste y reduce trabajo repetido,
- AGENTS/CLAUDE/GEMINI quedan generados y sincronizados.

## 45. Done de Fase 2 Odoo
La Fase Odoo queda lista solo si:

- existe estrategia de integración documentada,
- el cliente Odoo funciona,
- el mapping Appointment ↔ Odoo está probado,
- hay idempotencia mínima,
- las tareas Odoo están en ledger,
- la memoria incluye el estado Odoo,
- el sistema puede continuar Odoo tras interrupción.

---

# PARTE XIV — INSTRUCCIÓN FINAL CRÍTICA

Entrega una implementación **operativa, segura, modular, auditable, retomable y lista para correr localmente**, con:

- sistema de agendamiento robusto basado en Google Calendar API,
- seguimiento de cumplimiento de tareas,
- bots de setup y testing,
- orquestación multi-CLI con continuidad automática,
- memoria de largo plazo optimizada para Claude Code, Codex CLI y Gemini CLI,
- y fase posterior obligatoria de integración con Odoo una vez validado el calendario.

No reinicies el proyecto entre fases.
No dupliques contexto sin necesidad.
No uses la memoria como almacén caótico.
No cargues historiales completos en la memoria caliente.
No pierdas `taskId`, estado ni evidencia durante handoffs.
No hardcodees secretos.
No des respuestas vagas.
Implementa con precisión milimétrica.