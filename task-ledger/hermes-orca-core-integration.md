# Hermes + gstack + ORCA unified prompt

## Estado

Preparado como prompt canonicamente combinado para el flujo de ORCA en `GetUpSoft_Workspace`.

## Fuente combinada

- Prompt Hermes original desde `C:\Users\yoeli\Downloads\prompt hermes.txt`
- Bloque adicional de metodologia gstack

## Artefacto principal

- `_Knowledge_Center/Master_Prompts/AI_Automation/HERMES_GSTACK_ORCA_UNIFIED_PROMPT.md`

## Reglas aplicadas

- Se alineo con la estructura real de ORCA en `apps/orca/src/ai_automation_orchestrator/`
- Se respeto la integracion Hermes ya existente en `apps/orca/src/ai_automation_orchestrator/integrations/hermes_integration.py`
- Se evito crear una libreria muerta fuera del nucleo de ORCA
- Se priorizo trazabilidad, seguridad, pruebas y evidencia

## Siguientes pasos sugeridos

1. Si el prompt se va a ejecutar como backlog tecnico, derivarlo a una implementacion incremental dentro de ORCA.
2. Si se va a usar como prompt maestro, indexarlo en el flujo de prompts del workspace.
3. Si cambia la estructura del repo, regenerar `WORKSPACE.map`.
