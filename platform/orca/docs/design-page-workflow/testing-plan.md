# Plan de pruebas funcionales

## Alcance

Validar que el workflow pueda verse en Orca, importarse en n8n, ejecutar pasos principales y generar evidencia para proyectos de paginas profesionales.

## Pruebas Orca

1. `GET /` debe cargar dashboard.
2. Dashboard debe contener `workflow-canvas`.
3. `POST /api/blueprints` debe guardar el blueprint del workflow.
4. `GET /api/blueprints?user_id=yoeli` debe devolverlo.
5. `POST /api/blueprints/{id}/run` debe crear ejecucion.
6. El blueprint debe incluir nodos, edges y settings validos.

## Pruebas n8n

1. JSON debe ser valido.
2. Workflow debe tener trigger.
3. Workflow debe incluir nodo HTTP para registrar blueprint en Orca.
4. Workflow no debe incluir credenciales en claro.
5. Nodos MCP deben quedar declarados como configurables.

## Pruebas Obsidian

1. Crear nota con frontmatter.
2. Validar enlaces internos.
3. Confirmar que se guarda investigacion, decisiones, tareas y QA.

## Pruebas NotebookLM

1. Crear paquete fuente por proyecto.
2. Confirmar inclusion de brief, investigacion, prompts, sitemap y QA.
3. Validar que el paquete no contenga secretos.

## Pruebas Selenium

Cuando se active UI real:

1. Abrir Orca.
2. Crear blueprint desde UI.
3. Ver nodos en canvas.
4. Ejecutar blueprint.
5. Capturar screenshot y consola.
6. Confirmar ausencia de errores severos.

