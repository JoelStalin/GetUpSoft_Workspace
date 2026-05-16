# Scrum Process

## Flujo

1. Todo cambio nace en backlog YAML.
2. Cada historia debe cumplir Definition of Ready antes de entrar al sprint backlog.
3. La implementación debe referenciar historia, tareas técnicas, pruebas y documentación.
4. La historia solo termina cuando cumple Definition of Done.

## Definition of Ready

- objetivo claro
- valor de usuario
- criterios de aceptación
- dependencias identificadas
- riesgos conocidos
- estimación
- Definition of Done asociada
- pruebas esperadas
- skill asociada si aplica

## Definition of Done

- código implementado
- pruebas unitarias pasan
- CI pasa
- documentación actualizada
- contratos JSON validados
- sin dependencias ocultas
- errores conocidos documentados
- backlog actualizado
- prompt de recuperación generado si hubo errores

## Ceremonias soportadas por ORCA

- refinamiento de backlog
- planificación de sprint
- desglose técnico
- generación de criterios de aceptación
- generación de plan de pruebas
- registro de riesgos y dependencias

## Convenciones

- Épicas: `EPIC-N`
- Historias: `US-XXX`
- Sprint: `SPRINT-N`
- ADR: `000N-title.md`
