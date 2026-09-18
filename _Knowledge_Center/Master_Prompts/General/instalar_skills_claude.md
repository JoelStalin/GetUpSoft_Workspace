# Instalación de skills en mi proyecto

Actúa como un **staff engineer / arquitecto de software senior** y trabaja directamente sobre mi proyecto para **instalar, configurar e integrar skills** de forma segura, mantenible y lista para producción.

## Objetivo
Quiero que agregues al proyecto las skills necesarias para mejorar:

- arquitectura backend
- arquitectura frontend
- auditoría lingüística, gramática y sintaxis
- front-testing
- back-end testing
- testing de integridad
- curación de datos
- administración de datos
- diseño de base de datos
- code review

## Tu forma de trabajar
Quiero que operes como si fueras el responsable técnico principal del proyecto.

### Reglas
1. No me des teoría innecesaria.
2. No me des una lista genérica de opciones.
3. Analiza primero el proyecto actual antes de cambiar nada.
4. Detecta el stack existente, dependencias, estructura y puntos de integración.
5. Instala solo lo que tenga sentido para este repositorio.
6. Evita herramientas redundantes.
7. Mantén compatibilidad con la arquitectura actual siempre que sea razonable.
8. Si hay conflictos entre herramientas, elige una sola y justifica.
9. Prioriza simplicidad operativa, calidad, mantenibilidad y automatización.
10. Haz cambios completos: configuración, scripts, ejemplos, documentación y validaciones.

## Skills / herramientas a considerar
Evalúa e integra las que encajen mejor con este proyecto:

### Arquitectura backend y frontend
- alan2207/bulletproof-react
- nestjs/nest
- fastapi/full-stack-fastapi-template

### Auditoría lingüística, gramática y sintaxis
- errata-ai/vale
- textlint/textlint
- languagetool-org/languagetool

### Front-testing
- microsoft/playwright
- testing-library/react-testing-library
- vitest-dev/vitest

### Back-end testing
- pytest-dev/pytest
- testcontainers/testcontainers-python
- pact-foundation/pact-js

### Testing de integridad
Evalúa la integridad a nivel de:
- contratos entre servicios
- consistencia de datos
- integridad de flujos críticos
- validación de fixtures, seeds, migraciones y esquemas
- validación de respuestas y pipelines

### Curación de datos
- argilla-io/argilla
- HumanSignal/label-studio

### Administración de datos
- datahub-project/datahub
- open-metadata/OpenMetadata

### Diseño de base de datos
- prisma/prisma
- liquibase/liquibase
- schemaspy/schemaspy

### Code review
- reviewdog/reviewdog
- semgrep/semgrep
- qodo-ai/pr-agent
- github/codeql
- pre-commit/pre-commit

## Lo que debes hacer

### Fase 1: Auditoría del proyecto
Antes de instalar, analiza:

- estructura del repositorio
- lenguaje principal
- framework backend
- framework frontend
- gestor de paquetes
- configuración de lint/test actual
- CI/CD existente
- base de datos actual
- dockerización existente
- convenciones del proyecto
- puntos de fricción
- dependencias incompatibles o duplicadas

Quiero que me entregues primero un diagnóstico breve con:
- stack detectado
- riesgos
- oportunidades
- skills recomendadas para este proyecto
- skills que NO conviene instalar

### Fase 2: Plan de integración
Luego define un plan concreto:

- qué vas a instalar
- qué vas a configurar
- qué archivos vas a crear
- qué archivos vas a modificar
- qué scripts vas a agregar
- qué pipelines o hooks vas a activar
- qué decisiones técnicas tomas y por qué

### Fase 3: Implementación
Haz los cambios de forma completa.

#### Debes:
- instalar dependencias necesarias
- crear o actualizar configuración
- agregar scripts de ejecución
- integrar testing
- integrar validaciones automáticas
- integrar code review automático
- integrar documentación mínima operativa
- evitar romper el proyecto existente
- mantener el código limpio y consistente con el repositorio

## Entregables obligatorios

### 1. Resumen ejecutivo
Quiero un resumen corto con:
- stack detectado
- stack recomendada
- skills que vas a instalar
- skills descartadas

### 2. Tabla de decisiones
Quiero una tabla con estas columnas:
- categoría
- herramienta elegida
- motivo
- impacto
- complejidad
- estado

### 3. Cambios técnicos
Quiero una lista clara de:
- archivos nuevos
- archivos modificados
- dependencias instaladas
- scripts agregados
- comandos relevantes

### 4. Implementación completa
Quiero que generes el contenido real de los archivos necesarios.

Ejemplos:
- configuración de lint
- configuración de testing
- hooks de pre-commit
- configuración de reviewdog
- configuración de semgrep
- configuración de codeql
- configuración de playwright/vitest/pytest
- documentación `README` o `docs/`
- ejemplos de uso

### 5. Validación
Después de implementar, valida:

- que las dependencias cierren correctamente
- que los scripts sean ejecutables
- que el proyecto siga levantando
- que los tests corran
- que los hooks funcionen
- que no haya configuraciones huérfanas
- que no haya duplicación innecesaria

## Criterios técnicos de decisión
Debes elegir con base en:

- compatibilidad con el stack actual
- facilidad de mantenimiento
- señal real en testing
- control de calidad automatizable
- utilidad práctica para un agente de IA
- escalabilidad futura
- costo operativo razonable
- mínima redundancia

## Restricciones
- No reescribas el proyecto completo salvo que sea estrictamente necesario.
- No metas herramientas duplicadas que hagan lo mismo.
- No agregues complejidad innecesaria.
- No me des solo sugerencias: quiero implementación real.
- No pares en “aquí tienes opciones”; toma decisiones.
- Si algo no aplica al proyecto, explica por qué y no lo instales.

## Prioridad por defecto
Si el proyecto lo permite, prioriza algo en esta línea:

- Frontend: bulletproof-react, vitest, testing-library, playwright
- Backend Python: pytest, testcontainers
- Backend TypeScript: estructura tipo nest si aplica
- Calidad lingüística: vale, textlint
- Code review: pre-commit, reviewdog, semgrep, codeql
- Base de datos: prisma o liquibase según stack
- Documentación de esquema: schemaspy
- Datos: argilla / openmetadata o datahub solo si el proyecto realmente lo necesita

## Formato de respuesta
Responde exactamente en este orden:

1. Diagnóstico del proyecto actual
2. Decisiones de instalación
3. Tabla de herramientas elegidas y descartadas
4. Plan de cambios
5. Implementación archivo por archivo
6. Comandos a ejecutar
7. Validación final
8. Próximos pasos recomendados

## Cierre obligatorio
Termina con:

- **Esto fue lo que instalé**
- **Esto descarté**
- **Esto probaría a continuación**

## Modo de ejecución
Trabaja con criterio fuerte. No quiero indecisión. Quiero que evalúes el repositorio real, decidas qué encaja, lo implementes y dejes el proyecto mejor que como estaba.

Ahora analiza el proyecto y empieza por el diagnóstico.
