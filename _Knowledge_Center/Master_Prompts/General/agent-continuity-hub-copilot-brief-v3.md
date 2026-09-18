# Prompt maestro para Copilot — **Agent Continuity Hub**

## Versión
v3 — edición restructurada para máxima comprensibilidad, trazabilidad y ejecución paso a paso.

## Nombre del proyecto
**Agent Continuity Hub**

## Propósito del documento
Este prompt debe guiar a Copilot para construir una extensión de VS Code **real**, **modular**, **local-first**, **auditable** y **orientada a reducir radicalmente el consumo de tokens** al reutilizar memoria, tareas, decisiones y contexto persistido entre distintos agentes de IA.

Este documento no es una idea general. Es una **especificación de implementación**.

---

# 1. Instrucción principal para el agente

Actúa como un **Principal Engineer / Staff Engineer** experto en:
- TypeScript
- VS Code Extension API
- arquitectura de extensiones y plugins
- SQLite y migraciones
- sistemas de memoria de largo plazo
- recuperación de contexto
- compaction y context compression
- indexación local y búsqueda híbrida
- extracción de tareas
- auditoría y trazabilidad
- integración realista con agentes de IA

Tu tarea es diseñar e implementar una extensión de VS Code llamada **Agent Continuity Hub**.

No quiero una demo frágil. Quiero una base de producto robusta y extensible.

---

# 2. Resultado esperado

La extensión debe permitir que yo pueda:
1. Trabajar con distintos agentes de IA desde VS Code.
2. Centralizar los chats y metadatos relevantes en un formato común.
3. Recuperar contexto aunque cambie de agente.
4. Mantener memoria de largo plazo por proyecto o workspace.
5. Extraer tareas desde conversaciones ya procesadas.
6. Mostrar tareas pendientes automáticamente al iniciar un nuevo chat.
7. Reutilizar decisiones, resúmenes, skills y contexto sin reenviar todo el historial.
8. Mantener un changelog auditable donde quede claro:
   - qué cambió,
   - qué agente hizo el cambio,
   - por qué se hizo,
   - sobre qué conversación/tarea/archivo impactó.
9. Reducir el consumo de tokens en alrededor de 90% frente a un baseline ingenuo.

---

# 3. Restricción de realismo

No inventes APIs ni capacidades inexistentes.

Si un agente externo no tiene API pública o integración oficial utilizable desde VS Code, no debes afirmar acceso directo a sus conversaciones privadas.

Debes diseñar una arquitectura de **adaptadores** con estos modos de operación:
- integración oficial, si existe;
- captura desde comandos y flujos iniciados por esta extensión;
- importación manual de conversaciones;
- importadores de logs o exports locales configurables;
- stubs documentados para futuras integraciones.

La solución debe ser:
- realista,
- segura,
- extensible,
- local-first,
- y utilizable en desarrollo real.

---

# 4. Objetivo principal del producto

Construir una extensión de VS Code que centralice continuidad conversacional entre agentes y mantenga una memoria operativa por proyecto con estas capacidades:

## 4.1 Centralización de conversaciones
- Guardar conversaciones y mensajes en un modelo unificado.
- Relacionar cada conversación con:
  - workspace,
  - agente,
  - archivos relevantes,
  - tareas,
  - decisiones,
  - skills activadas,
  - snapshots,
  - eventos de compactación.

## 4.2 Memoria de largo plazo por workspace
- Crear una memoria separada por proyecto/path/workspace.
- Recordar:
  - decisiones técnicas,
  - convenciones,
  - bugs,
  - tareas abiertas,
  - restricciones,
  - comandos útiles,
  - contexto reciente,
  - preferencias del usuario.

## 4.3 Continuidad entre agentes
- Poder iniciar un chat nuevo con otro agente y reconstruir el contexto sin reenviar todo.
- Mantener contexto compatible entre adaptadores.

## 4.4 Extracción de tareas
- Convertir prompts y respuestas ya procesados en tareas accionables.
- Separar preguntas informativas de trabajo pendiente.

## 4.5 Inyección de contexto comprimido
- Al iniciar un chat, construir un `context packet` comprimido y relevante.
- Incluir tareas pendientes, decisiones, resumen del proyecto y archivos clave.

## 4.6 Log de cambios auditable
- Registrar qué agente cambió qué y por qué.
- Registrar relación entre cambio, tarea, conversación y evidencia.

---

# 5. Prioridad absoluta: reducción de tokens ~90%

Esta extensión debe diseñarse para **apuntar** a una reducción aproximada del **90% del consumo de tokens** en sesiones repetidas o proyectos de tamaño medio/grande, comparado con un enfoque ingenuo.

## 5.1 Baseline ingenuo de comparación
El baseline será reenviar en cada turno:
- historial completo,
- tool outputs completos,
- memoria completa del proyecto,
- tareas completas,
- changelog reciente completo,
- decisiones completas,
- contexto de archivos sin compactar.

## 5.2 Regla obligatoria
Nunca inyectes por defecto el historial completo si existe una representación persistida y compacta más útil.

## 5.3 Estrategia obligatoria
Debes implementar todas estas capas de ahorro:
1. **Microcompaction** de mensajes.
2. **Compactación de resultados de herramientas**.
3. **Memoria incremental de sesión**.
4. **Memoria de largo plazo proyectada por relevancia**.
5. **Presupuestos de contexto por bloque y por packet**.
6. **Persistencia local de payloads grandes y reemplazo por previews estables**.
7. **Reutilización de resúmenes, decisiones y tareas ya consolidadas**.
8. **Inyección basada en deltas** en lugar de replay completo.
9. **Reutilización de resultados previos de tool calls** cuando sea seguro.
10. **Separación por workspace/worktree** para evitar mezclar contexto irrelevante.

## 5.4 Instrumentación obligatoria
Mide y persiste al menos:
- `rawContextChars`
- `rawContextEstimatedTokens`
- `compressedContextChars`
- `compressedContextEstimatedTokens`
- `reductionPercent`
- `cacheReusePercent`
- `reusedContextBlocks`
- `summarizedContextBlocks`
- `offloadedPayloadCount`
- `toolResultCompactions`
- `memoryExtractions`

## 5.5 Criterio mínimo de diseño
La extensión debe estar preparada para demostrar, con métricas, que reutiliza memoria y contexto en vez de volver a mandar el mismo contenido.

---

# 6. Funciones vitales a implementar explícitamente

Debes implementar equivalentes limpios de estas funciones/patrones derivados del repo de referencia analizado:

- `microcompactMessages(...)`
- `trySessionMemoryCompaction(...)`
- `estimateMessageTokens(...)`
- `evaluateTimeBasedTrigger(...)`
- `parseTokenBudget(...)`
- `getPerMessageBudgetLimit()`
- `enforceToolResultBudget(...)`
- `persistToolResult(...)`
- `buildLargeToolResultMessage(...)`
- `processToolResultBlock(...)`
- `recordContentReplacement(...)`
- `reconstructContentReplacementState(...)`
- `partitionByPriorDecision(...)`
- `selectFreshToReplace(...)`
- `replaceToolResultContents(...)`
- `shouldExtractMemory(...)`
- `hasMetInitializationThreshold(...)`
- `hasMetUpdateThreshold(...)`
- `getToolCallsBetweenUpdates()`
- `getSessionMemoryContent()`
- `recordExtractionTokenCount(...)`
- `setLastSummarizedMessageId(...)`
- `waitForSessionMemoryExtraction()`
- `renderableSearchText(...)`
- `toolUseSearchText(...)`
- `toolResultSearchText(...)`
- `recordTranscript(...)`
- `loadSameRepoMessageLogs(...)`
- `copyPlanForResume(...)`
- `recoverPlanFromMessages(...)`
- `createTask(...)`
- `updateTask(...)`

## 6.1 Importante
No copies implementación ciega del repo de referencia.
Usa esos patrones como requisitos funcionales para una implementación propia y mantenible dentro de la extensión.

---

# 7. Requisitos funcionales obligatorios

## 7.1 Memoria por proyecto/workspace/path
- La clave principal del workspace debe derivarse del path absoluto normalizado.
- Debe soportar:
  - single-folder,
  - multi-root workspace,
  - directorio suelto,
  - worktrees relacionados del mismo repo.
- Debe existir aislamiento fuerte por defecto.
- No mezclar memorias entre proyectos por accidente.

## 7.2 Continuidad entre worktrees y proyectos recientes
- Detectar continuidad entre worktrees del mismo repositorio.
- Permitir recuperar plan y memoria compatible.
- Considerar proyectos recientes para sugerir contexto relacionado.
- Nunca mezclar automáticamente proyectos distintos sin reglas o confirmación explícita.

## 7.3 Modelo unificado de conversaciones
Cada mensaje debe poder persistir:
- `messageId`
- `conversationId`
- `workspaceId`
- `agentId`
- `role`
- `content`
- `normalizedSearchText`
- `summary`
- `attachments`
- `relatedFiles`
- `relatedTaskIds`
- `toolUseMetadata`
- `toolResultReference`
- `isCompacted`
- `compactionStrategy`
- `createdAt`
- `updatedAt`

Cada conversación debe incluir:
- `conversationId`
- `title`
- `workspaceId`
- `sourceAdapter`
- `linkedAgents`
- `status`
- `summary`
- `recentContext`
- `sessionMemoryId`
- `relatedFiles`
- `relatedTaskIds`
- `relatedDecisionIds`
- `createdAt`
- `updatedAt`

## 7.4 Memoria de largo plazo
Crear capas separadas:
- `projectFacts`
- `decisions`
- `codingConventions`
- `openTasks`
- `recurringTasks`
- `recentContext`
- `preferredTools`
- `skillsHints`
- `resumePlan`

Actualizar la memoria solo bajo umbrales configurables.

## 7.5 Extracción de tareas
Cada tarea debe incluir:
- `taskId`
- `workspaceId`
- `sourceConversationId`
- `sourceMessageId`
- `title`
- `description`
- `status`
- `priority`
- `tags`
- `relatedFiles`
- `dependsOn`
- `acceptanceCriteria`
- `steps`
- `completionPercent`
- `createdAt`
- `updatedAt`

La extensión debe distinguir entre:
- nota,
- decisión,
- pregunta,
- tarea,
- tarea recurrente,
- seguimiento.

## 7.6 Inyección de contexto en nuevos chats
Al iniciar un chat, construir un `context packet` con:
- resumen ejecutivo del proyecto;
- tareas pendientes relevantes;
- decisiones activas;
- archivos implicados;
- changelog reciente útil;
- skills aplicables;
- restricciones del repositorio;
- próximos pasos sugeridos.

Debe existir modo:
- automático,
- sugerido,
- manual.

## 7.7 Skills por agente y por proyecto
Implementa un sistema de skills con niveles:
- globales,
- por workspace,
- por stack,
- por agente.

Las skills pueden incluir:
- prompts base,
- restricciones,
- snippets,
- plantillas,
- guías de estilo,
- workflows.

## 7.8 Log de cambios auditable
Debe existir una bitácora estructurada con:
- `changeId`
- `workspaceId`
- `agentId`
- `adapterId`
- `actorType` (`agent`, `user`, `system`)
- `reason`
- `changeType`
- `affectedEntityType`
- `affectedEntityId`
- `beforeStateRef`
- `afterStateRef`
- `relatedConversationId`
- `relatedMessageId`
- `relatedTaskId`
- `relatedFiles`
- `evidenceRef`
- `createdAt`

Debe responder preguntas como:
- qué agente hizo el cambio,
- por qué lo hizo,
- desde qué conversación se originó,
- qué tarea impactó,
- qué archivo o entidad cambió.

---

# 8. Sistema obligatorio de seguimiento del propio prompt

Debes construir un sistema dentro de la extensión para seguir el cumplimiento de **este mismo prompt**.

El objetivo es que el proyecto tenga un tablero interno que muestre:
- porcentaje global de cumplimiento,
- porcentaje por épica,
- porcentaje por tarea,
- pasos de cada tarea,
- criterios de aceptación,
- evidencia de implementación,
- blockers,
- tareas completadas vs pendientes.

## 8.1 Propósito
No quiero solo un backlog genérico. Quiero una estructura específica para rastrear la implementación de esta especificación hasta acercarse lo máximo posible al 100%.

## 8.2 Modelo obligatorio
Debes crear una entidad como `PromptExecutionPlan` o equivalente con:
- `planId`
- `promptVersion`
- `overallCompletionPercent`
- `weightedCompletionPercent`
- `epics`
- `tasks`
- `steps`
- `acceptanceChecks`
- `evidenceLinks`
- `blockers`
- `status`
- `lastComputedAt`

## 8.3 Estructura de seguimiento
Dividir el proyecto en épicas como mínimo:
1. arquitectura base
2. persistencia
3. adapters
4. memory engine
5. compaction engine
6. task extraction
7. context builder
8. UI/sidebar
9. changelog/audit
10. tests
11. docs
12. import/export
13. project recent context
14. skills engine
15. metrics/token reduction

## 8.4 Cada tarea debe tener
- `taskId`
- `epicId`
- `title`
- `description`
- `weight`
- `status`
- `completionPercent`
- `steps[]`
- `acceptanceCriteria[]`
- `evidence[]`
- `dependsOn[]`
- `blockers[]`
- `ownerAgentId`
- `lastUpdatedByAgentId`
- `lastUpdatedReason`

## 8.5 Cada paso de tarea debe tener
- `stepId`
- `taskId`
- `title`
- `status`
- `completionPercent`
- `notes`
- `evidenceRef`
- `updatedAt`

## 8.6 Cálculo de porcentaje
El porcentaje global no debe ser manual. Debe calcularse por pesos.

Regla sugerida:
- cada épica tiene peso,
- cada tarea tiene peso,
- cada paso hereda peso relativo,
- `overallCompletionPercent` se calcula desde los pasos completados y criterios satisfechos.

## 8.7 Evidencia obligatoria
Una tarea no debe marcarse como 100% solo porque exista código. Debe tener evidencia como:
- archivo implementado,
- prueba asociada,
- comando registrado,
- vista visible,
- migración creada,
- README actualizado,
- captura lógica de integración.

## 8.8 Integración con el changelog
Cada actualización del plan de cumplimiento debe generar un evento de changelog con:
- agente que actualizó el estado,
- motivo del cambio,
- porcentaje previo,
- porcentaje nuevo,
- evidencia adjunta.

## 8.9 Vista obligatoria
Debe existir en la UI una vista como:
- `Prompt Progress`
- `Epic Progress`
- `Task Progress`
- `Step Progress`
- `Evidence`
- `Blockers`

## 8.10 Requisito fuerte
La extensión debe poder mostrar algo similar a:
- cumplimiento global: 62%
- arquitectura base: 100%
- persistencia: 80%
- adapters: 35%
- compaction engine: 70%
- changelog audit: 90%
- tests: 25%

---

# 9. Arquitectura solicitada

Organiza la solución en capas y módulos separados:

```text
src/
  extension/
  commands/
  core/
  adapters/
  memory/
  tasks/
  context/
  compaction/
  changelog/
  skills/
  storage/
  metrics/
  search/
  resume/
  ui/
  views/
  models/
  services/
  migrations/
  test/
```

## 9.1 Servicios esperados
Implementa, como mínimo:
- `WorkspaceIdentityService`
- `ConversationService`
- `SessionMemoryService`
- `LongTermMemoryService`
- `TaskExtractionService`
- `TaskTrackingService`
- `PromptExecutionPlanService`
- `ContextPacketBuilder`
- `ContextBudgetController`
- `CompactionService`
- `ToolResultPersistenceService`
- `ContentReplacementService`
- `SearchIndexService`
- `RecentProjectsService`
- `ResumePlanService`
- `SkillRegistryService`
- `AgentAdapterRegistry`
- `ChangelogService`
- `MetricsService`
- `PromptComplianceCalculator`

---

# 10. Persistencia obligatoria

## 10.1 Tecnología preferida
- SQLite para datos operativos
- JSON para configuración exportable/importable
- índice semántico local opcional si se puede mantener realista

## 10.2 Reglas
- versionado de base de datos;
- migraciones;
- separación por tablas para conversaciones, mensajes, memorias, tareas, skills, changelog y plan de cumplimiento;
- soporte para exportar/importar por workspace;
- borrado selectivo y total.

## 10.3 Tablas sugeridas
- `workspaces`
- `conversations`
- `messages`
- `session_memories`
- `project_memories`
- `decisions`
- `tasks`
- `task_steps`
- `skills`
- `skill_bindings`
- `context_packets`
- `tool_result_blobs`
- `content_replacements`
- `change_log`
- `prompt_execution_plans`
- `prompt_execution_epics`
- `prompt_execution_tasks`
- `prompt_execution_steps`
- `metrics_snapshots`

---

# 11. Compaction engine obligatorio

## 11.1 Debe hacer
- estimar tokens por mensaje/bloque;
- compactar mensajes viejos y redundantes;
- persistir tool results grandes fuera del prompt;
- construir previews estables;
- congelar decisiones de reemplazo;
- impedir que payloads grandes reaparezcan innecesariamente;
- actualizar memoria de sesión bajo umbrales.

## 11.2 Políticas mínimas
- compactación por tamaño;
- compactación por antigüedad;
- compactación por repetición;
- compactación por irrelevancia al objetivo actual;
- compactación por tipo de contenido.

## 11.3 Salida esperada
El compaction engine debe devolver:
- bloques reutilizados,
- bloques resumidos,
- bloques offloaded,
- presupuesto consumido,
- porcentaje de reducción,
- refs persistidas.

---

# 12. Context packet builder obligatorio

## 12.1 Debe priorizar
1. tarea activa
2. archivos abiertos
3. workspace actual
4. decisiones recientes
5. tareas pendientes relevantes
6. memoria reciente consolidada
7. skills compatibles
8. changelog útil y corto

## 12.2 Debe producir bloques diferenciados
- `projectSummary`
- `activeTasks`
- `recentDecisions`
- `relevantFiles`
- `skillsHints`
- `recentChanges`
- `resumePlan`
- `memoryFacts`

## 12.3 Debe respetar presupuesto
Cada bloque debe tener presupuesto propio y estrategia de degradación.

---

# 13. Adaptadores de agentes

## 13.1 Contrato base
Cada adaptador debe exponer algo similar a:
- `getAgentMetadata()`
- `listCapabilities()`
- `startConversation()`
- `captureConversation()`
- `importConversation()`
- `buildContextPayload()`
- `injectContext()`
- `normalizeConversation()`

## 13.2 Reglas
- si no existe integración real, dejar stub documentado;
- no inventar acceso directo a chats privados;
- soportar modo “captura desde la propia extensión”.

## 13.3 Entregable mínimo
- un adaptador funcional mínimo;
- uno o más stubs bien documentados;
- registro central de adaptadores.

---

# 14. UI solicitada

Crear una Activity Bar o Sidebar con secciones mínimas:
- `Project Memory`
- `Recent Conversations`
- `Pending Tasks`
- `Skills`
- `Change Log`
- `Prompt Progress`
- `Agents`

## 14.1 Comandos mínimos
- `AI Memory Hub: Open Project Memory`
- `AI Memory Hub: Start Contextual Chat`
- `AI Memory Hub: Import Conversation`
- `AI Memory Hub: Extract Tasks from Conversation`
- `AI Memory Hub: Show Pending Tasks`
- `AI Memory Hub: Rebuild Memory Index`
- `AI Memory Hub: Show Change Log`
- `AI Memory Hub: Show Prompt Progress`

---

# 15. Privacidad y control

La extensión debe funcionar en local por defecto.

Debe incluir:
- exclusión de carpetas,
- exclusión de archivos sensibles,
- borrado por workspace,
- borrado total,
- export/import,
- control de anonimización de rutas,
- configuración para no indexar contenido sensible.

---

# 16. Entregables obligatorios

Debes entregar:
1. arquitectura propuesta;
2. decisiones técnicas;
3. estructura de archivos;
4. `package.json` con `contributes`, comandos, vistas y configuración;
5. modelos y tipos;
6. persistencia real;
7. núcleo funcional mínimo;
8. compaction engine;
9. context builder;
10. extracción de tareas;
11. prompt progress tracker;
12. changelog audit trail;
13. sidebar funcional;
14. tests críticos;
15. README detallado;
16. listado claro de stubs y limitaciones.

---

# 17. Orden obligatorio de trabajo

Trabaja exactamente en este orden:
1. arquitectura general
2. modelos de datos
3. estructura de carpetas y archivos
4. persistencia y migraciones
5. registro de adaptadores
6. conversación y transcript service
7. session memory
8. long-term memory
9. compaction engine
10. tool result persistence
11. content replacement
12. task extraction
13. prompt execution tracking
14. changelog audit
15. context packet builder
16. skills engine
17. recent projects / resume plan
18. UI / views / commands
19. tests
20. README y limitaciones reales

---

# 18. Formato de respuesta obligatorio

Responde con este orden exacto:
1. resumen ejecutivo
2. supuestos y limitaciones reales
3. arquitectura propuesta
4. decisiones técnicas
5. estructura de archivos
6. modelos de datos
7. código completo por archivos
8. instrucciones para ejecutar y probar
9. estrategia de reducción de tokens
10. cómo se calcula el progreso del prompt
11. limitaciones de integración con agentes externos
12. próximos pasos

---

# 19. Criterios de aceptación

La solución será aceptada si:
- al abrir un proyecto se crea o recupera su memoria;
- se pueden guardar y consultar conversaciones por proyecto;
- se pueden extraer tareas desde conversaciones;
- el contexto nuevo se construye desde memoria compacta y tareas pendientes;
- existe log de cambios por agente con motivo;
- existe tablero de cumplimiento del propio prompt;
- el sistema demuestra arquitectura orientada a reducir tokens;
- el código compila y puede ejecutarse en modo desarrollo.

---

# 20. Segmento bibliográfico y ruta de investigación obligatoria

Antes de codificar, debes revisar documentación oficial y ejemplos reales. Prioriza fuentes primarias.

## 20.1 VS Code Extension API
Buscar y estudiar:
- documentación oficial de VS Code Extension API
- samples oficiales de extensiones VS Code
- guías sobre Tree View, Webview, Commands, Storage, Workspace API y Activity Bar

## 20.2 Persistencia local
Buscar y estudiar:
- SQLite en extensiones Node/VS Code
- migraciones de esquema
- patrones de repositories y services en TypeScript

## 20.3 Arquitectura plugin/adapters
Buscar y estudiar:
- patrones adapter / registry / capability negotiation
- integración desacoplada entre proveedores de IA
- diseño de contratos estables para herramientas externas

## 20.4 Compaction y memoria
Buscar y estudiar:
- summarization pipelines
- hierarchical memory
- context compression
- retrieval for long conversations
- semantic indexing local
- snapshotting y resume flows

## 20.5 Extracción de tareas
Buscar y estudiar:
- task extraction from conversations
- action item extraction
- todo tracking from text
- evidence-based progress tracking

## 20.6 Auditoría y changelog
Buscar y estudiar:
- audit trail design
- append-only event logs
- provenance tracking
- traceability between change, task and evidence

## 20.7 Reducción de tokens
Buscar y estudiar:
- context budgeting
- delta prompts
- tool result offloading
- cacheable context blocks
- stable previews
- reuse of prior summaries

## 20.8 Referencias prácticas que debes intentar emular en espíritu
Usa como inspiración funcional:
- samples oficiales de extensiones VS Code
- patrones de memory/summary de sistemas conversacionales largos
- arquitecturas con SQLite + repository pattern
- motores de tasks/kanban/progress tracking
- sistemas append-only de auditoría

## 20.9 Regla de rigor
Cuando una integración no sea segura o no exista documentación fiable:
- no la inventes;
- deja la integración como stub;
- documenta la limitación con claridad.

---

# 21. Instrucción final

Quiero una primera versión funcional, limpia y extensible.

Si tienes que elegir entre “muchas features incompletas” o “menos features pero sólidas”, elige solidez.

Aun así, debes dejar explícitos todos los puntos de esta especificación en el diseño, el plan de implementación y el tablero de cumplimiento del prompt.

No omitas el sistema de seguimiento del propio prompt.
No omitas el log de cambios por agente.
No omitas el objetivo de reducción de tokens.
No inventes APIs.
No entregues solo teoría.
Entrega una base de producto que pueda evolucionar de forma profesional.
