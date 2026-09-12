# Prompt maestro unificado: ORCA + Hermes + gstack

## Proposito

Unificar en un solo prompt operativo la integracion de Hermes con ORCA y la metodologia gstack para consulta, revision, planificacion, QA y maduracion de prompts.

Este prompt debe usarse como guia de implementacion dentro de `GetUpSoft_Workspace`, respetando las reglas del repositorio y la estructura real del nucleo de ORCA.

## Contexto del repositorio

- Repositorio base: `GetUpSoft_Workspace`
- Nucleo real de ORCA: `apps/orca/src/ai_automation_orchestrator/`
- Integracion Hermes existente: `apps/orca/src/ai_automation_orchestrator/integrations/hermes_integration.py`
- Dependencia vendorizada: `apps/orca/libs/hermes-agent/`
- Routing de prompts del workspace: `_Knowledge_Center/workspace-docs/prompt-routing.md`
- Prompts maestros: `_Knowledge_Center/Master_Prompts/`
- Registro y backlog: `task-ledger/`

## Reglas obligatorias del workspace

1. Leer `WORKSPACE.map` primero.
2. Ejecutar `scripts/agent_start.ps1` antes de cualquier edicion.
3. Si el bootstrap lo requiere, re-ejecutar `scripts/workspace_bootstrap.ps1`.
4. Leer `task-ledger/skill-recommendations.md` antes de seleccionar skills.
5. Normalizar el prompt con `scripts/caveman_route.ps1`.
6. Preferir skills especificas del workspace y reutilizar el bundle compartido de `.agents/skills`.
7. No crear librerias muertas en `libs/`; extender el nucleo real de ORCA.
8. No tocar secretos, tokens ni rutas fuera del alcance del cambio.
9. Si se modifica estructura, actualizar el mapa con `python scripts/update_repo_map.py`.

## Meta unificada

Construir una capa de orquestacion que permita a ORCA:

- integrar Hermes como runtime interno controlado;
- consultar, clasificar y revisar prompts con metodologia gstack;
- enrutar solicitudes a la mejor habilidad o rol;
- registrar evidencia real y trazable;
- mantener seguridad, auditoria y reversibilidad.

## Arquitectura objetivo

```text
Usuario / Workflow ORCA
    -> ORCA Prompt Router
    -> gstack Methodology Layer
    -> Hermes Runtime
    -> ORCA Memory + Audit + Evidence
```

## Alcance funcional unificado

### 1. Analisis del nucleo ORCA

- Identificar donde vive el flujo real de prompts, workflows, memoria, logs y configuracion.
- Reutilizar el nucleo Python existente en `apps/orca/src/ai_automation_orchestrator/`.
- Mapear puntos de extension en:
  - `apps/orca/`
  - `.agents/`
  - `_Knowledge_Center/`
  - `task-ledger/`

### 2. Integracion Hermes en ORCA

- Mantener Hermes como motor interno, no como carpeta aislada.
- Crear o extender una capa de abstraccion dentro del nucleo ORCA con:
  - `HermesRuntime`
  - `HermesToolRegistry`
  - `HermesMemoryAdapter`
  - `HermesTaskRunner`
  - `HermesAuditLogger`
- Reutilizar la integracion existente de Hermes y evolucionarla en lugar de duplicarla.
- Conservar activacion y desactivacion por configuracion.

### 3. Integracion de memoria

- Sincronizar memoria Hermes con la memoria de ORCA.
- Conectar con:
  - `.agents/AGENT_MEMORY_CONFIG.json`
  - `_Knowledge_Center/Memory/REPOSITORY_MEMORY.md`
- Mantener trazabilidad de todo lo escrito por Hermes.
- Bloquear almacenamiento de secretos, claves y tokens.

### 4. Integracion de herramientas

- Exponer tools con allowlist estricta.
- Bloquear ejecucion libre de comandos peligrosos.
- Permitir solo acciones aprobadas por configuracion.
- Crear configuracion segura para herramientas aprobadas.

### 5. Integracion de tareas

- Permitir ejecucion manual, programada y desde workflows.
- Retornar resultados estructurados en JSON.
- Registrar cada ejecucion con auditoria y evidencia.

### 6. Integracion con workflow editor

- Añadir un nodo Hermes al workflow editor de ORCA.
- El nodo debe soportar:
  - prompt
  - modelo
  - herramientas permitidas
  - memoria si/no
  - timeout
  - output schema
- Guardar evidencia de la ejecucion.

### 7. Metodologia gstack para prompts

- Incorporar gstack como metodologia de consulta, revision y maduracion de prompts.
- Clasificar prompts por:
  - arquitectura
  - implementacion
  - seguridad
  - QA
  - documentacion
  - release
  - investigacion
  - workflow
  - memoria
  - automatizacion
  - integracion Hermes
  - integracion ORCA

### 8. Adaptadores gstack

- Crear adaptadores internos en ORCA para:
  - registry
  - prompt router
  - role adapter
  - review engine
  - evidence runner
- Si algun nombre o ruta no existe en el repo, ubicarlo dentro del nucleo Python de ORCA, no como dependencia suelta.

### 9. Comandos internos tipo gstack

- Diseñar comandos equivalentes para ORCA:
  - `orca prompt office-hours`
  - `orca prompt plan-ceo-review`
  - `orca prompt plan-eng-review`
  - `orca prompt plan-design-review`
  - `orca prompt review`
  - `orca prompt qa`
  - `orca prompt guard`
  - `orca prompt retro`
  - `orca prompt learn`
  - `orca prompt investigate`

### 10. Motor de consulta de prompts

- Buscar prompts por nombre, intencion, rol, proyecto y ultima modificacion.
- Detectar duplicados y prompts obsoletos.
- Sugerir mejoras y version refinada.
- Generar indice de prompts versionado.

### 11. Seguridad

- Validar input, allowlist, timeout y tamano de respuesta.
- Evitar lectura de `.env` y exfiltracion de secretos.
- Bloquear acceso libre a filesystem o comandos sin lista aprobada.
- Mantener auditoria de cada operacion.

### 12. Pruebas y evidencia

- Crear pruebas unitarias y de integracion para:
  - runtime Hermes
  - memoria
  - allowlist de tools
  - task runner
  - workflow node
  - prompt registry
  - prompt router
  - review engine
  - flujo Hermes + gstack + ORCA
- Guardar evidencia real generada por ejecucion, no inventada manualmente.

## Criterios de aceptacion

El trabajo solo se considera completo si:

- Hermes queda integrado al nucleo real de ORCA.
- gstack actua como metodologia complementaria para prompts.
- Existe codigo funcional, no solo documentacion.
- Hay pruebas automatizadas.
- Hay evidencia real generada por ejecucion.
- La integracion puede activarse y desactivarse por configuracion.
- No hay secretos en logs, memoria o evidencia.
- Todo queda documentado y trazable.
- Si algo falla, el fallo se documenta con claridad tecnica.

## Resultado esperado

Un paquete de trabajo listo para que ORCA pueda consultar, revisar y ejecutar prompts con Hermes y gstack bajo control del repo, con trazabilidad, auditoria y evidencia real.

<!-- BEGIN:shared-agent-memory-rule -->
# Multi-Agent Shared Memory & Task Ledger Protocol (GetUpSoft / Orca)

## Mandatory Multi-Agent Rules
1. **Identify Yourself**: Each agent session MUST have a unique `agent_id` (e.g., `antigravity-main`, `codex-worker-01`, `claude-dev-02`).
2. **Check Shared Memory & Ledger First**: At the start of every session, read `C:\Users\yoeli\.agents_shared_memory\ACTIVE_TASKS.md` and `TASKS_LEDGER.json` to see active agents and claimed tasks.
3. **Claim & Mark Active Tasks**: Never work on a task currently locked by another `agent_id`. Claim your `task_id` using `sync_memory.py start-task` or by writing to `TASKS_LEDGER.json`.
4. **Update Progress & Hand-Off**: Before ending a turn, hitting token limits, or context switching, update your task progress in `TASKS_LEDGER.json` and `ACTIVE_SESSION.md` so peer agents can collaborate smoothly on the same project without duplicating effort.
5. **Brand & Ecosystem Identity**: Remember GetUpSoft (mother company), Orca (automation engine), Galantes Jewelry (e-commerce client). Use Google AI Studio / Antigravity (never Vertex AI).
<!-- END:shared-agent-memory-rule -->
