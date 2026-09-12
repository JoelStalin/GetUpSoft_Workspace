# agent-memory

Sistema de memoria persistente local (SQLite) para: captura de prompts con
diccionario+hex, coordinación entre agentes, timeline de cambios ligado a
tareas, y validaciones con evidencia real. Ver el plan original en
`C:\Users\yoeli\.claude\plans\breezy-inventing-conway.md`.

## Archivos

- `schema.sql` — esquema completo de las 5 tablas de dominio (`dictionary`,
  `prompts`, `prompt_tokens`, `embeddings`, `agents`, `tasks`, `agent_locks`,
  `timeline_events`, `validations`, `log_findings`).
- `db.py` — conexión compartida (WAL activado para lectura concurrente desde
  ORCA) y helper `hex_id()`.
- `embeddings.py` — llamada best-effort a Ollama local (`nomic-embed-text`)
  para similitud semántica. Si Ollama no está corriendo, todo sigue
  funcionando sin embeddings (degradación controlada, nunca un error fatal).
- `capture_prompt.py` — el hook `UserPromptSubmit` en sí. Tokeniza, enriquece
  el diccionario solo con palabras nuevas, guarda el texto completo (nunca se
  pierde nada) y calcula el embedding si Ollama está disponible.
- `scan_logs.py` — escanea logs conocidos del repo (`task-ledger/evidence`,
  `apps/orca/workflow-editor`, `.runtime/logs`, etc.) en busca de
  `ERROR|WARN|FAIL|Exception` y los registra en `log_findings`.
- `tests/` — pruebas reales (`unittest`, stdlib, sin dependencias) que
  verifican deduplicación del diccionario, preservación del texto completo,
  búsqueda por similitud, y detección/deduplicación de hallazgos de log.

## Base de datos

`platform/orca/.runtime/data/agent-memory.db` — fuera de git (`.runtime/` ya
está en `.gitignore`). ORCA puede leerla directamente como archivo local; no
requiere red ni credenciales.

## Ejecutar las pruebas

```bash
python tools/agent-memory/tests/test_capture_prompt.py -v
python tools/agent-memory/tests/test_scan_logs.py -v
```

## Ejecutar el escáner de logs manualmente

```bash
python tools/agent-memory/scan_logs.py                 # reporta hallazgos sin resolver
python tools/agent-memory/scan_logs.py --resolve <id>   # marca uno como resuelto
```

## Estado / próxima entrega

Esta primera entrega cubre el esquema completo y los módulos 1 (captura de
prompts) y 5 (escáner de logs) funcionando end-to-end y probados con datos
reales. Pendiente para la siguiente entrega (ver plan):

- Extender `sync_memory.py` para escribir también en esta DB (módulo 2:
  coordinación de agentes / locks por directorio).
- Generación de `CHANGE_TIMELINE.md` como vista renderizada de
  `timeline_events` (módulo 3).
- Regla dura de validación con evidencia real antes de marcar una tarea
  `validated` (módulo 4).
- Ajuste del hook `Stop` global para que consulte `check_stop_conditions.py`
  en vez de re-evaluar todo el repo desde cero en cada intento de parada.
