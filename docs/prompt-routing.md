# Prompt Routing

## Objetivo

El routing selecciona una skill específica para restringir el contexto del prompt y evitar instrucciones genéricas.

## Intenciones soportadas

- `feature`
- `bugfix`
- `refactor`
- `research`
- `documentation`
- `test`
- `deployment`
- `scrum-management`

## Reglas de routing

1. Clasificar intención con ML local y heurísticas.
2. Aplicar fallback por reglas cuando la confianza del clasificador es baja.
3. Resolver skill en YAML por prioridad:
   - match exacto por intención
   - fallback a `scrum_skill`
4. Generar prompt con:
   - objetivo
   - alcance
   - riesgos
   - criterios de aceptación
   - plan de pruebas

## Resultado

El router devuelve:

- skill seleccionada
- rationale resumido
- plantilla de prompt asociada
