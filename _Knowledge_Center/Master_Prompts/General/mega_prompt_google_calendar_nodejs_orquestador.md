# Mega Prompt — Implementación Integral de Plataforma de Agendamiento con Google Calendar API v3, Node.js, Bot de Configuración, Pruebas Funcionales, Seguimiento de Cumplimiento y Orquestación Multi-CLI

```md
# Rol
Actúa como un **Arquitecto de Software Senior + Staff Backend Engineer + QA Automation Engineer + DevOps Implementer + AI Workflow Orchestrator**, especializado en **Node.js**, **Express.js**, **Google Cloud Platform**, **Google Calendar API v3**, **OAuth2**, **automatización de pruebas funcionales**, **bots de configuración operativa**, **seguimiento de cumplimiento de tareas**, **orquestación de agentes CLI** y **notificaciones transaccionales por correo**.

Tu misión es **diseñar, implementar, documentar, probar, auditar y dejar operativo** un sistema de **agendamiento de citas robusto, seguro, modular y listo para producción**, basado estrictamente en la **Google Calendar API v3**, con un **bot auxiliar** que realice las **configuraciones operativas**, las **verificaciones automáticas**, las **pruebas funcionales end-to-end** del sistema y el **seguimiento del cumplimiento de tareas técnicas**.

Además, debes incorporar un **orquestador multi-modelo por CLI** capaz de usar **Claude Code**, **Codex CLI** y **Gemini CLI** de forma coordinada, con política de continuidad automática: **cuando un proveedor se quede sin créditos, cuota, presupuesto, rate limit operativo o capacidad temporal para continuar, el proceso debe transferir la tarea pendiente al siguiente proveedor disponible, sin perder contexto, avance ni trazabilidad**.

Debes trabajar con **precisión milimétrica**, siguiendo principios de **Clean Code**, **arquitectura modular**, **seguridad defensiva**, **mantenibilidad**, **observabilidad**, **resiliencia**, **continuidad operacional**, **auditoría técnica** y **calidad verificable**.

---

# Contexto de negocio y hallazgos que deben influir en la solución
La solución debe diseñarse considerando que los sistemas de calendario y reservas suelen soportar, como mínimo, estas categorías de uso:

1. **Scheduling y booking tools**.
2. **AI meeting assistants**.
3. **CRM y sales workflows**.
4. **Herramientas de productividad interna**.
5. **Workflow automation**.
6. **Resource scheduling**.
7. **Reservas 24/7**.
8. **Notificaciones inteligentes y recordatorios**.
9. **Integración con CRM**.
10. **Acceso multicanal / multiplataforma**.
11. **Gestión de recursos y reglas de disponibilidad**.
12. **Seguimiento, analítica y trazabilidad operativa**.

La implementación debe quedar preparada para escalar hacia cientos de casos de uso sectoriales: salud, educación, legal, financiero, belleza, home services, automotriz, hospitality, reclutamiento, IT support, real estate, manufactura, nonprofit, retail y uso personal.

Esto implica que la arquitectura **no debe ser rígida**. Debe ser extensible para soportar:
- diferentes tipos de cita,
- políticas de duración,
- buffers,
- reglas por servicio,
- validaciones por canal,
- disponibilidad futura,
- conflictos de agenda,
- recordatorios,
- reintentos,
- cancelaciones y reprogramaciones.

---

# Objetivo principal
Construir un proyecto backend completo que permita:

- recibir solicitudes de creación de citas,
- validar y sanitizar los datos del cliente,
- autenticar de forma segura con Google mediante OAuth2,
- verificar el estado del token antes de cada transacción,
- refrescar credenciales automáticamente cuando sea necesario,
- insertar eventos en Google Calendar usando `calendar.events.insert`,
- disparar notificaciones transaccionales por correo con SendGrid,
- generar o adjuntar un `.ics` o, en su defecto, incluir el `htmlLink` del evento,
- registrar errores y estados operativos de manera consistente,
- ejecutar pruebas funcionales automatizadas por medio de un bot,
- incluir configuración inicial asistida por bot para validar que el entorno esté correctamente preparado,
- rastrear el cumplimiento de cada tarea técnica y funcional,
- orquestar trabajo entre **Claude Code**, **Codex CLI** y **Gemini CLI** con continuidad automática ante agotamiento de créditos o cuota.

---

# Stack obligatorio
Debes usar **exactamente** este stack, salvo justificación técnica explícita y compatible:

- **Runtime:** Node.js v18 o superior.
- **Framework:** Express.js.
- **Google libs:** `googleapis`, `google-auth-library`.
- **Mail:** `@sendgrid/mail`.
- **Secrets/config:** `dotenv`.
- **Parsing de requests/buffers:** `body-parser`.

Puedes agregar librerías auxiliares **solo si aportan seguridad, validación, testabilidad, orquestación, persistencia de estado, parsing de salidas CLI o claridad**. Si agregas una librería, debes justificar su función dentro del código y usarla solo si es necesaria.

---

# Restricciones técnicas obligatorias

## 1) Autenticación OAuth2
Implementa un flujo asíncrono y robusto para Google OAuth2 que cumpla exactamente con lo siguiente:

- Configura el `oauth2Client` con:
  - `CLIENT_ID`
  - `CLIENT_SECRET`
  - `REDIRECT_URI`
- Gestiona el ciclo de vida de `token.json`.
- Antes de cada operación contra Google Calendar:
  - valida que el token exista,
  - valida que sea íntegro,
  - valida que no esté expirado,
  - si expiró, refresca automáticamente usando `refresh_token`.
- Si el `refresh_token` no existe o es inválido, devuelve un error controlado.
- Si ocurre `invalid_grant`, debes capturarlo con tratamiento específico.
- Nunca hardcodees secretos.
- Usa exclusivamente `process.env` para credenciales sensibles.

## 2) Gestión de eventos en Google Calendar
Debes implementar el endpoint:

`POST /api/v1/appointments`

Este endpoint debe:

- recibir payload JSON,
- validar campos obligatorios,
- sanitizar entradas,
- normalizar formatos,
- convertir fecha/hora a **ISO 8601 UTC** antes de insertar,
- crear el evento en `calendarId: 'primary'`.

### Campos mínimos esperados del payload
- `name`
- `email`
- `date`
- `time`
- `duration`

### Campos opcionales recomendados
- `description`
- `serviceType`
- `notes`
- `timezone`
- `phone`
- `metadata`

### Reglas de validación mínimas
- `name`: string, trim, longitud razonable, sin payloads peligrosos.
- `email`: formato email válido, normalizado a lowercase.
- `date`: formato estricto.
- `time`: formato estricto.
- `duration`: entero positivo, límites controlados.
- `description` y `notes`: sanitizados.
- rechazar campos inesperados si comprometen la integridad.

### Recurso del evento de Google Calendar
El objeto `resource` del evento debe incluir como mínimo:

- `summary`: identificador de cita + nombre del cliente.
- `description`: notas técnicas o detalles del servicio.
- `attendees`: incluir email del cliente con `responseStatus: 'needsAction'`.
- `reminders`: popup 30 minutos antes.

### Reglas adicionales recomendadas
También debes contemplar, si es razonable en la arquitectura:
- generación de identificador interno de cita,
- trazabilidad por request id / correlation id,
- prevención de duplicidad básica,
- validación de conflicto por disponibilidad futura vía `freebusy.query` o diseño listo para ello,
- opción para extender a cancelación y reprogramación.

## 3) Lógica de notificación
Después de una inserción exitosa en Google Calendar:

- responde con éxito al cliente,
- dispara una función asíncrona de SendGrid,
- envía confirmación por correo,
- el correo debe incluir:
  - un archivo ICS **o**
  - el `event.data.htmlLink`.

El correo debe ser profesional, claro y robusto ante errores.

Si SendGrid falla:
- no pierdas trazabilidad,
- registra el error,
- decide explícitamente si la API responde éxito parcial o fallo total,
- documenta esa decisión en el código.

## 4) Manejo global de errores
Debes implementar middleware global de errores con captura específica de:

- `invalid_grant`
- `rateLimitExceeded`
- errores 4xx de validación
- errores 5xx internos
- errores de red
- errores de SendGrid
- errores de parsing
- errores de cuota agotada o capacidad no disponible en CLIs externos
- errores de handoff entre proveedores CLI

Cada error debe devolver:
- status code correcto,
- mensaje seguro,
- estructura JSON consistente,
- sin filtrar secretos internos.

## 5) Modularidad obligatoria
La solución debe separar, como mínimo, la lógica en:

- `config/googleAuth.js`
- `services/calendarService.js`
- `controllers/appointmentController.js`

Además, se recomienda incluir:

- `routes/appointmentRoutes.js`
- `middlewares/errorHandler.js`
- `middlewares/notFound.js`
- `utils/validation.js`
- `utils/dateTime.js`
- `utils/logger.js`
- `services/emailService.js`
- `services/icsService.js`
- `bots/setupAndTestBot.js`
- `bots/taskComplianceBot.js`
- `bots/modelOrchestratorBot.js`
- `services/cliProviders/claudeCodeProvider.js`
- `services/cliProviders/codexCliProvider.js`
- `services/cliProviders/geminiCliProvider.js`
- `services/taskLedgerService.js`
- `services/handoffService.js`
- `tests/` con pruebas funcionales y de integración

---

# Requisito extra obligatorio: bot de configuración y pruebas funcionales
Debes crear un **bot operativo** dentro del proyecto, con responsabilidad explícita sobre:

## A. Configuración automática / verificación del entorno
El bot debe comprobar y/o asistir con:

- presencia de `.env`,
- presencia de variables obligatorias,
- integridad mínima de `token.json`,
- conectividad básica con Google API,
- conectividad con SendGrid,
- disponibilidad del puerto de la app,
- consistencia del formato de fechas,
- estado general del entorno.

## B. Pruebas funcionales automatizadas
El bot debe ejecutar pruebas funcionales como mínimo para:

- creación exitosa de cita,
- payload inválido,
- email inválido,
- duración inválida,
- fecha inválida,
- time inválido,
- token expirado con refresh exitoso,
- token inválido,
- fallo de Google Calendar,
- fallo de SendGrid,
- respuesta estructurada correcta,
- validación de campos sanitizados,
- verificación del link del evento o ICS,
- manejo consistente de errores.

## C. Salida del bot
El bot debe generar salida entendible, por ejemplo:
- resumen de checks,
- pruebas aprobadas,
- pruebas fallidas,
- recomendaciones de corrección,
- exit codes útiles.

El bot debe poder ejecutarse mediante script npm, por ejemplo:
- `npm run bot:setup`
- `npm run bot:test`
- `npm run test`

---

# Nuevo requisito obligatorio: seguimiento de cumplimiento de tareas
Debes crear una **capa explícita de seguimiento de cumplimiento** para que el proyecto no solo implemente funcionalidades, sino que también **controle qué tareas fueron definidas, iniciadas, ejecutadas, verificadas, aprobadas, bloqueadas, transferidas o completadas**.

## Objetivo del seguimiento
La solución debe poder responder, en cualquier momento, preguntas como:

- qué tareas existen,
- qué tarea está en curso,
- qué porcentaje del plan está completado,
- qué subtareas faltan,
- qué evidencia existe para cada tarea,
- qué modelo CLI ejecutó cada parte,
- qué tarea fue transferida por agotamiento de cuota,
- qué errores impidieron avanzar,
- qué pruebas validaron cada tarea,
- qué entregables están listos y cuáles no.

## Requisitos obligatorios del task tracking
Debes implementar un **ledger de tareas persistente** con estas características:

- persistencia en archivo JSON y/o Markdown auditable,
- identificador único por tarea,
- nombre corto,
- descripción técnica,
- criterio de aceptación,
- dependencias,
- prioridad,
- estado,
- responsable actual,
- proveedor CLI actual,
- intentos,
- timestamps de creación, inicio, handoff, bloqueo y cierre,
- evidencia generada,
- archivos modificados,
- pruebas ejecutadas,
- resultado final.

## Estados mínimos obligatorios
Cada tarea debe usar una máquina de estados clara. Como mínimo:

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

## Archivos mínimos recomendados para el tracking
- `task-ledger/tasks.json`
- `task-ledger/tasks.md`
- `task-ledger/execution-log.ndjson`
- `task-ledger/handoffs.json`
- `task-ledger/checkpoints/`

## Contenido mínimo por tarea
Cada tarea debe incluir como mínimo:

```json
{
  "taskId": "TASK-001",
  "title": "Implement Google OAuth2 token lifecycle",
  "description": "Create resilient auth module with token integrity checks and automatic refresh.",
  "acceptanceCriteria": [
    "token is loaded from token.json",
    "expired token is refreshed automatically",
    "invalid_grant is handled with controlled error"
  ],
  "status": "in_progress",
  "priority": "high",
  "currentProvider": "claude_code",
  "assignedBot": "modelOrchestratorBot",
  "attemptCount": 1,
  "dependsOn": [],
  "artifacts": ["src/config/googleAuth.js"],
  "evidence": ["unit test passed", "integration mock passed"],
  "createdAt": "ISO_DATE",
  "updatedAt": "ISO_DATE"
}
```

## Reglas del seguimiento
- ninguna tarea puede marcarse como `completed` sin evidencia verificable,
- ninguna tarea crítica puede avanzar sin criterio de aceptación definido,
- toda transferencia entre modelos debe quedar registrada,
- toda prueba asociada a una tarea debe referenciar el `taskId`,
- si una tarea falla, debe quedar documentado el motivo exacto,
- si una tarea queda parcial, debe registrarse qué falta,
- el sistema debe producir un resumen de avance por porcentaje y por categoría.

---

# Nuevo requisito obligatorio: orquestación multi-CLI con Claude Code, Codex CLI y Gemini CLI
Debes diseñar e implementar un **orquestador operativo real** que pueda invocar, supervisar y encadenar estos proveedores por CLI:

- **Claude Code**
- **Codex CLI**
- **Gemini CLI**

## Objetivo del orquestador
El orquestador debe distribuir o serializar el trabajo entre estos CLIs y **garantizar continuidad de ejecución por tarea** cuando ocurra cualquiera de estos eventos:

- agotamiento de créditos,
- agotamiento de cuota,
- límite diario,
- rate limit prolongado,
- respuesta explícita de capacidad agotada,
- timeout reiterado,
- fallo operativo recuperable del proveedor,
- proceso CLI no disponible temporalmente.

## Regla principal de continuidad
Debes implementar esta política:

1. una tarea se intenta con el proveedor prioritario actual,
2. si el proveedor responde normalmente, continúa con él,
3. si el proveedor reporta crédito/cuota agotada o incapacidad temporal persistente, la tarea **no se reinicia desde cero**,
4. se genera un **checkpoint técnico**,
5. se empaqueta el contexto mínimo necesario,
6. se registra un evento de handoff,
7. se reasigna la tarea al siguiente proveedor disponible,
8. el siguiente proveedor continúa la tarea desde el último estado confirmado,
9. la cadena debe continuar hasta completar la tarea o agotar todos los proveedores configurados.

## Orden configurable de proveedores
El orden de uso debe ser configurable por entorno, por ejemplo:

- `claude_code -> codex_cli -> gemini_cli`
- `codex_cli -> claude_code -> gemini_cli`
- `gemini_cli -> codex_cli -> claude_code`

La prioridad **no debe estar hardcodeada**. Debe definirse por configuración.

## Variables de entorno obligatorias para orquestación
Debes contemplar variables como mínimo equivalentes a:

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

## Requisito de detección de agotamiento
Debes diseñar la capa de proveedores para detectar señales de agotamiento o indisponibilidad a partir de:

- exit codes,
- stderr,
- stdout,
- mensajes conocidos de rate limit,
- mensajes de quota exceeded,
- mensajes de insufficient credits,
- timeouts,
- falta de respuesta utilizable.

La detección debe mapearse a códigos internos estandarizados, por ejemplo:

- `CLI_QUOTA_EXHAUSTED`
- `CLI_CREDITS_EXHAUSTED`
- `CLI_RATE_LIMITED`
- `CLI_TIMEOUT`
- `CLI_NOT_INSTALLED`
- `CLI_AUTH_FAILURE`
- `CLI_OUTPUT_INVALID`
- `CLI_TRANSIENT_FAILURE`

## Protocolo de checkpoint obligatorio
Antes de transferir una tarea al siguiente modelo, debes persistir un checkpoint con:

- `taskId`
- objetivo actual
- contexto resumido
- archivos tocados
- diff o lista de cambios
- pendientes exactos
- pruebas ejecutadas y resultados
- errores observados
- siguiente acción sugerida
- proveedor saliente
- proveedor entrante
- timestamp

## Protocolo de handoff obligatorio
Cada handoff debe incluir:

- motivo del handoff,
- estado de la tarea al momento del handoff,
- resumen técnico compacto,
- criterios de aceptación aún no cumplidos,
- artefactos producidos,
- riesgos abiertos,
- instrucciones para retomar sin duplicar trabajo,
- referencia al checkpoint asociado.

## Reglas de continuidad por tarea
- una tarea no debe perder su `taskId` al cambiar de proveedor,
- el cambio de proveedor no debe borrar historial,
- el siguiente proveedor debe continuar, no rehacer por defecto,
- si detecta inconsistencia, debe registrar `needs_reconciliation`,
- si los tres proveedores fallan, debe dejar estado `failed` con causa consolidada,
- si uno completó parcialmente y otro terminó, el crédito debe quedar atribuido por tramos en el ledger.

## Requisito de control presupuestario
El sistema debe quedar listo para incorporar métricas de consumo por proveedor. Aunque no siempre sea posible leer créditos exactos del CLI, debes dejar una arquitectura capaz de registrar:

- intentos por proveedor,
- duración de ejecución,
- número de handoffs,
- fallos por cuota,
- tiempo total invertido,
- tareas completadas por proveedor,
- porcentaje del proyecto resuelto por cada proveedor.

## Requisito de salida estructurada de los CLIs
Siempre que sea viable, fuerza a cada proveedor a responder con salida estructurada, por ejemplo JSON, que incluya:

- resumen,
- archivos creados,
- archivos modificados,
- comando ejecutado,
- pruebas lanzadas,
- resultado,
- bloqueos,
- siguiente paso recomendado.

Si un CLI no puede responder en JSON confiable, debes implementar una capa de normalización robusta.

---

# Requisito obligatorio: bot orquestador de modelos
Debes crear un bot o módulo central, por ejemplo `bots/modelOrchestratorBot.js`, responsable de:

- leer la cola de tareas,
- seleccionar proveedor según prioridad configurada,
- invocar el proveedor CLI,
- validar salida,
- registrar resultados,
- detectar agotamiento o fallo,
- generar checkpoint,
- transferir la tarea al siguiente proveedor,
- reintentar bajo política controlada,
- actualizar el ledger,
- emitir resumen operativo.

## Responsabilidades mínimas del orquestador
- `loadTaskLedger()`
- `selectNextTask()`
- `selectProviderForTask()`
- `runProviderCommand()`
- `parseProviderOutput()`
- `detectQuotaOrCreditExhaustion()`
- `createCheckpoint()`
- `handoffTaskToNextProvider()`
- `updateTaskStatus()`
- `emitExecutionSummary()`

## Scripts npm recomendados
Debes incluir scripts equivalentes a:

- `npm run orchestrator:start`
- `npm run orchestrator:resume`
- `npm run orchestrator:status`
- `npm run tasks:report`
- `npm run bot:setup`
- `npm run bot:test`
- `npm run test`

---

# Requisitos de arquitectura
Diseña la arquitectura usando estos principios:

1. **Single Responsibility Principle**.
2. **Separation of Concerns**.
3. **Defensive Programming**.
4. **Fail Fast en validación**.
5. **Errores explícitos y trazables**.
6. **Extensibilidad para nuevos casos de uso**.
7. **Código legible antes que “ingenioso”**.
8. **Nombres semánticos y consistentes**.
9. **Bajo acoplamiento**.
10. **Alta cohesión**.
11. **Auditabilidad de ejecución**.
12. **Continuidad multi-proveedor**.
13. **Recuperación por checkpoint**.

---

# Requisitos de seguridad
Implementa obligatoriamente:

- sanitización de input,
- validación estricta,
- no exponer secretos,
- no registrar tokens completos en logs,
- no retornar stack traces en producción,
- manejo seguro de errores,
- uso de variables de entorno,
- validación de tipos y rangos,
- protección contra payloads malformados,
- tratamiento seguro de fechas y timezones,
- manejo seguro de credenciales de CLIs,
- no imprimir prompts sensibles completos si contienen secretos.

Opcional pero recomendado:
- `helmet`,
- rate limiting,
- request id,
- structured logging,
- CORS controlado,
- idempotency key para futuras extensiones.

---

# Requisitos funcionales ampliados por diseño
Aunque el MVP principal es crear citas, debes dejar la base preparada para soportar evoluciones relacionadas con los hallazgos del dominio de scheduling:

- reservas 24/7,
- notificaciones automáticas,
- buffers entre eventos,
- múltiples tipos de servicio,
- múltiples canales futuros,
- integración con CRM,
- resource scheduling,
- reglas personalizadas por servicio,
- analítica futura,
- reprogramación,
- cancelación,
- workflow automation,
- seguimiento de cumplimiento de tareas,
- continuidad operativa entre modelos CLI.

No implementes features no solicitadas de forma invasiva, pero sí deja la estructura lista para crecer.

---

# Especificación precisa del endpoint principal

## Endpoint
`POST /api/v1/appointments`

## Request example
```json
{
  "name": "Juan Pérez",
  "email": "juan.perez@example.com",
  "date": "2026-02-15",
  "time": "14:30",
  "duration": 45,
  "description": "Consulta inicial del servicio",
  "serviceType": "consultation",
  "notes": "Cliente solicita videollamada",
  "timezone": "America/Mexico_City"
}
```

## Success response example
```json
{
  "success": true,
  "message": "Appointment created successfully",
  "data": {
    "appointmentId": "APT-20260215-000123",
    "calendarEventId": "google-event-id",
    "htmlLink": "https://calendar.google.com/...",
    "start": "2026-02-15T20:30:00.000Z",
    "end": "2026-02-15T21:15:00.000Z",
    "attendee": "juan.perez@example.com",
    "notification": {
      "emailSent": true,
      "deliveryMode": "htmlLink"
    }
  }
}
```

## Error response example
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The field 'email' is invalid"
  }
}
```

---

# Conversión de tiempo y reglas temporales
Debes implementar esto con extremo cuidado:

- recibir `date`, `time` y opcionalmente `timezone`,
- convertir a `DateTime` válido,
- transformar a **UTC ISO 8601**,
- usar el valor UTC en el evento,
- evitar ambigüedades por zona horaria,
- documentar claramente el criterio,
- si no se provee timezone, definir una política clara y explícita.

Debes evitar errores clásicos de:
- timezone drift,
- parsing inconsistente,
- DST,
- concatenación ingenua de strings de fecha.

---

# Requisitos de correo transaccional
La implementación de SendGrid debe incluir:

- servicio desacoplado,
- templates claros,
- asunto entendible,
- cuerpo en texto y HTML,
- manejo de errores,
- posibilidad de incluir `htmlLink` o `.ics`.

Si implementas ICS, debe ser válido y utilizable por el cliente.

---

# Requisitos de pruebas
Debes incluir una estrategia real de pruebas:

## 1. Unitarias
Para:
- validadores,
- parseadores de fecha/hora,
- generador de payload para Google,
- generador de correo,
- constructor de ICS,
- tratamiento de errores,
- parser de salidas CLI,
- detector de cuota agotada,
- selector de proveedor,
- servicio de handoff.

## 2. Integración
Para:
- controller + service,
- Google auth flow mockeado,
- inserción del evento mockeada,
- email service mockeado,
- middlewares,
- task ledger service,
- provider adapters,
- checkpoint creation,
- handoff orchestration.

## 3. Funcionales / E2E
Con el bot de pruebas para:
- happy path,
- validación fallida,
- token refresh,
- error de Google,
- error de SendGrid,
- respuestas JSON consistentes,
- verificación del enlace o archivo de invitación,
- ejecución del orquestador,
- simulación de agotamiento de Claude Code,
- transferencia automática a Codex CLI,
- simulación de agotamiento de Codex CLI,
- transferencia automática a Gemini CLI,
- continuidad de tarea tras handoff,
- persistencia correcta de checkpoints,
- reporte de cumplimiento exacto.

## 4. Criterios de aceptación mínimos
La solución se considera aceptable solo si:
- la app arranca sin errores,
- el endpoint responde correctamente,
- la validación es consistente,
- el token refresh funciona o falla controladamente,
- el evento se construye correctamente,
- el correo se dispara correctamente,
- el bot detecta fallos de configuración,
- el bot ejecuta pruebas funcionales con resultados claros,
- el ledger refleja el avance real,
- el orquestador puede transferir tareas sin perder contexto,
- el sistema marca correctamente agotamiento de proveedor,
- el siguiente proveedor retoma la tarea pendiente.

---

# Requisitos de observabilidad
Implementa logs útiles y no verbosos en exceso:

- inicio de app,
- carga de config,
- inicio de request,
- resultado de validación,
- intento de refresh de token,
- creación de evento,
- envío de correo,
- errores controlados,
- resultados del bot,
- selección de proveedor CLI,
- handoffs,
- checkpoints,
- estado agregado del ledger,
- resumen por proveedor.

Los logs deben evitar exponer:
- tokens,
- secretos,
- datos sensibles innecesarios,
- prompts con credenciales.

---

# Entregables obligatorios
Debes generar el proyecto completo, incluyendo como mínimo:

1. `package.json`
2. `.env.example`
3. `app.js` o `server.js`
4. estructura de carpetas limpia
5. módulos de config/services/controllers/routes/middlewares/utils
6. bot de configuración y pruebas
7. bot de seguimiento de cumplimiento
8. bot orquestador multi-CLI
9. adaptadores para Claude Code, Codex CLI y Gemini CLI
10. pruebas automatizadas
11. README técnico
12. ejemplos de requests/responses
13. instrucciones de ejecución
14. manejo de errores global
15. comentarios técnicos dentro del código cuando sean realmente útiles
16. ledger de tareas persistente
17. estrategia de checkpoint y handoff
18. scripts npm para reanudar ejecución

---

# Estructura sugerida del proyecto
```text
project-root/
├─ app.js
├─ package.json
├─ .env.example
├─ README.md
├─ token.json                # no versionar
├─ task-ledger/
│  ├─ tasks.json
│  ├─ tasks.md
│  ├─ handoffs.json
│  ├─ execution-log.ndjson
│  └─ checkpoints/
├─ src/
│  ├─ config/
│  │  └─ googleAuth.js
│  ├─ controllers/
│  │  └─ appointmentController.js
│  ├─ routes/
│  │  └─ appointmentRoutes.js
│  ├─ services/
│  │  ├─ calendarService.js
│  │  ├─ emailService.js
│  │  ├─ icsService.js
│  │  ├─ taskLedgerService.js
│  │  ├─ handoffService.js
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
│  └─ modelOrchestratorBot.js
└─ tests/
   ├─ unit/
   ├─ integration/
   └─ functional/
```

---

# Requisitos del README
El README debe incluir:

- propósito del proyecto,
- arquitectura,
- variables de entorno,
- pasos de instalación,
- cómo obtener/usar `token.json`,
- cómo correr la app,
- cómo correr el bot,
- cómo ejecutar pruebas,
- cómo correr el orquestador,
- cómo reanudar tareas,
- cómo interpretar el ledger,
- cómo interpretar handoffs y checkpoints,
- ejemplos de request y response,
- posibles errores comunes,
- consideraciones de seguridad.

---

# Estándares de implementación
Debes escribir el código con estas reglas:

- JavaScript limpio y mantenible.
- Si necesitas “tipado”, usa JSDoc con precisión o justifica TypeScript si decides migrar, pero por defecto mantén compatibilidad con el stack pedido.
- Funciones pequeñas y expresivas.
- Variables con nombres semánticos.
- Evita duplicación.
- Evita anidar lógica innecesariamente.
- No mezcles responsabilidades.
- No uses comentarios redundantes.
- Comenta solo lo que aporte valor técnico real.
- No diseñes la orquestación como pseudocódigo; implementa módulos ejecutables.
- Toda lógica de fallback entre CLIs debe quedar claramente codificada.

---

# Requisitos de salida
Tu salida final debe incluir **todo el código fuente completo**, listo para copiar y ejecutar, y debe seguir este orden:

1. Árbol de directorios.
2. `package.json`.
3. `.env.example`.
4. Código de cada archivo, uno por uno, con separadores claros.
5. Bot de configuración y pruebas.
6. Bot de seguimiento de cumplimiento.
7. Bot orquestador multi-CLI.
8. Adaptadores de Claude Code, Codex CLI y Gemini CLI.
9. Suite de pruebas.
10. README.md.
11. Notas mínimas de ejecución.

No des una explicación introductoria extensa.
No omitas archivos importantes.
No devuelvas pseudocódigo si puedes implementar código real.
No dejes “TODO” abiertos en piezas críticas.
No hardcodees secretos.
No simplifiques partes sensibles como OAuth2, validación, errores, tracking, handoff o pruebas.

---

# Instrucción final crítica
Entrega una implementación **operativa, coherente, segura, modular, verificable, auditable y lista para correr localmente**, preparada para evolucionar hacia una plataforma más amplia de scheduling basada en Google Calendar API.

La solución debe incluir, de forma obligatoria, un sistema de **seguimiento de cumplimiento de tareas** y una **orquestación multi-CLI** con **Claude Code**, **Codex CLI** y **Gemini CLI**, capaz de **continuar automáticamente la tarea con el siguiente proveedor cuando el anterior agote créditos, cuota o capacidad temporal**, sin perder contexto ni trazabilidad.
```
