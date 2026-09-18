# Scrum Backlog - Orca + Instagram

- Fecha de inicio: 2026-05-15
- Sprint actual: Sprint 1
- Sprint goal: integrar reglas de analisis Instagram en `insta-manager-pro`, habilitar catalogo NVIDIA gratuito en `Orca`, y agregar gestion web de credenciales de proveedores populares.
- Estado general: Done with follow-up note

## Epic 1 - Insta Manager Pro / Reglas de analisis Instagram

### Story IM-1
- Titulo: Guardar reglas del proyecto para analisis estrategico de Instagram
- Objetivo: persistir el prompt maestro multi-agente como reglas operativas del proyecto.
- Estado: Todo
- Estado: Done
- Criterios de aceptacion:
  - existe un archivo de reglas local del proyecto;
  - el flujo multi-agente queda documentado;
  - el README apunta a esas reglas.

### Story IM-2
- Titulo: Crear plantilla reusable del prompt maestro
- Objetivo: dejar una plantilla de prompt versionada para consumo futuro por chat o flujos internos.
- Estado: Todo
- Estado: Done
- Criterios de aceptacion:
  - existe un modulo con el prompt completo;
  - expone metadata estable;
  - no cambia el comportamiento actual por defecto.

## Epic 2 - Orca / Catalogo NVIDIA Build

### Story ORC-NV-1
- Titulo: Crear scraper Selenium para modelos gratuitos de NVIDIA Build
- Objetivo: capturar el catalogo `Free Endpoint` desde `build.nvidia.com/models`.
- Estado: Todo
- Estado: Done
- Criterios de aceptacion:
  - script Selenium funcional;
  - genera snapshot JSON con fecha de captura;
  - detecta y recorre paginacion.

### Story ORC-NV-2
- Titulo: Transformar snapshot a catalogo compatible con Orca
- Objetivo: derivar un archivo de modelos integrables con el provider actual.
- Estado: Todo
- Estado: Done
- Criterios de aceptacion:
  - se genera archivo versionado separado;
  - se filtran endpoints no conversacionales o incompatibles;
  - se documentan exclusiones.

### Story ORC-NV-3
- Titulo: Mantener catalogo de ejemplo estable
- Objetivo: actualizar `models.example.json` sin convertirlo en dump crudo.
- Estado: Todo
- Estado: Done
- Criterios de aceptacion:
  - el ejemplo conserva seleccion curada;
  - el README explica como usar el catalogo generado.

## Epic 3 - Orca / Credenciales web de proveedores

### Story ORC-SEC-1
- Titulo: Crear almacenamiento mixto de credenciales
- Objetivo: soportar credenciales globales y overrides por usuario.
- Estado: Todo
- Estado: Done
- Criterios de aceptacion:
  - existe store dedicado;
  - resuelve prioridad usuario > global > env;
  - la API no expone tokens completos.

### Story ORC-SEC-2
- Titulo: Agregar seccion web de credenciales
- Objetivo: permitir que el usuario guarde tokens de OpenAI, Gemini, Claude y Manus desde la web.
- Estado: Todo
- Estado: Done
- Criterios de aceptacion:
  - la UI muestra proveedores y estado;
  - permite guardar y limpiar;
  - usa el `user_id` actual del dashboard.

### Story ORC-SEC-3
- Titulo: Preparar Orca para providers futuros
- Objetivo: dejar la infraestructura lista para que providers usen credenciales web resueltas.
- Estado: Todo
- Estado: Done
- Criterios de aceptacion:
  - existe capa de resolucion de credenciales;
  - no rompe compatibilidad con variables de entorno.

## Sprint Tasks

- [x] Crear backlog persistido y seguimiento inicial
- [x] Implementar reglas y plantilla en `insta-manager-pro`
- [x] Implementar scraper Selenium de NVIDIA Build
- [x] Generar snapshot y catalogo compatible de Orca
- [x] Actualizar `models.example.json` y README de Orca
- [x] Implementar store y API de credenciales
- [x] Agregar seccion web de credenciales al dashboard
- [x] Agregar pruebas unitarias y de integracion relevantes
- [x] Ejecutar validacion final y actualizar estados del backlog

## Definition of Done

- codigo y documentacion actualizados;
- pruebas relevantes ejecutadas o documentadas si quedan pendientes;
- backlog actualizado con estado real;
- cambios listos para seguimiento en siguientes sprints.

## Sprint Review Notes

- Orca: pruebas unitarias relevantes pasaron (`15/15`).
- Orca: snapshot Selenium generado para `42` modelos `Free Endpoint` y catalogo transformado a `17` modelos compatibles con el flujo actual.
- Insta Manager Pro: reglas y plantilla quedaron persistidas.
- Incidencia detectada fuera de alcance: `pnpm check` en `insta-manager-pro` falla por un error preexistente en `client/src/pages/Automation.tsx` relacionado con la prop `title`.
