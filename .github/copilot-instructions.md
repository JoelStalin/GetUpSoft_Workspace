# Copilot Instructions

## Context

Este repositorio usa ORCA como capa local de interpretación y gobierno Scrum.

## Reglas

- No uses servicios remotos para interpretar prompts del núcleo ORCA.
- Toda tarea debe referenciar backlog, DoR, DoD y pruebas.
- Prefiere cambios pequeños y verificables.
- Si un comando o solución falla, documenta diagnóstico, causa probable y validación.
- Para tareas multi-modelo, usa la politica compartida en `docs/GSTACK_ORCA_MULTIAGENT_ADAPTER.md`.
- Mantiene ORCA como base de orquestacion y GSTACK como router de modelos.

## Output esperado

- cambios acotados;
- pruebas o smoke tests;
- documentación actualizada;
- riesgo y deuda técnica explícitos.
