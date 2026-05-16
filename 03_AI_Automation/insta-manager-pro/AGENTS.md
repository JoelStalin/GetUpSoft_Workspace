# Insta Manager Pro Agent Rules

Estas reglas aplican a tareas de analisis estrategico de Instagram dentro de este proyecto.

## Proposito

- `insta-manager-pro` puede alojar una plantilla de analisis estrategico de Instagram para uso en sesiones de `Claude Cowork` con `Windsor AI`.
- La plantilla no sustituye los flujos existentes del producto; se conserva como activo reusable del proyecto.

## Flujo multi-agente requerido

Cuando se use la plantilla de analisis estrategico de Instagram, el flujo debe respetar este orden:

1. `Orchestrator Agent`
2. `Data Agent` y `Context Agent` en paralelo
3. `Analyst Agent`
4. `Strategist Agent`
5. `Report Agent`
6. `Authorizer Agent`

No se debe avanzar al siguiente bloque hasta completar el anterior.

## Dependencias externas

- El flujo asume `Claude Cowork + Windsor AI`.
- Si `Windsor AI` no esta conectado o no tiene acceso a datos de Instagram, el analisis debe detenerse y reportarlo.
- No se deben inventar metricas faltantes; deben marcarse como `[N/D]`.

## Entregables minimos

- Contexto del periodo y benchmarks declarados.
- Bloques `A-J` completos en el informe final.
- Validacion final del `Authorizer Agent`.
- Hipotesis justificadas con evidencia, no inventadas.

## Ubicacion de la plantilla

- La plantilla versionada vive en `shared/prompts/instagramStrategicAnalysis.ts`.
- El README debe apuntar a esta ubicacion cuando se documente el analisis estrategico.
