# Investigacion: Orca Design Workflow

## Objetivo

Disenar un workflow compatible con n8n y visualizable en Orca para producir paginas profesionales tipo Galantes Jewelry, combinando investigacion, memoria en Obsidian, paquetes de estudio NotebookLM, automatizacion MCP y animaciones premium inspiradas en `davidhckh/portfolio-2025`.

## Hallazgos del workspace

- Orca ya tiene un canvas tipo n8n en el dashboard: las pruebas existentes validan el texto `workflow-canvas`.
- Orca ya expone endpoints de blueprint:
  - `GET /api/blueprints`
  - `POST /api/blueprints`
  - `DELETE /api/blueprints/{blueprint_id}`
  - `POST /api/blueprints/{blueprint_id}/run`
- La persistencia actual de blueprints usa JSON local en `data/workflow_blueprints.json`.
- Para cumplir "base de datos de Orca" en produccion, el workflow debe tener migracion a SQLite/Postgres sin romper la API actual.
- Orca ya tiene integracion NotebookLM parcial en `notebooklm-py[browser]` y endpoints relacionados con audio.
- El workspace exige pruebas funcionales tipo Selenium/WebApp cuando se toque UI o flujo funcional.

## Hallazgos de n8n y MCP

- n8n tiene nodos MCP oficiales en su documentacion: MCP Server Trigger, MCP Client Tool y MCP Client.
- La estrategia recomendada es usar nodos nativos de n8n primero y evitar dependencias comunitarias no revisadas.
- El workflow debe poder operar en dos modos:
  - Importable en n8n como JSON.
  - Registrable en Orca como blueprint de nodos y conexiones.

## Hallazgos de portfolio-2025

Referencia: `https://github.com/davidhckh/portfolio-2025`

Tecnicas aplicables al sistema GetUpSoft:

- Vite + Vue como stack frontend liviano.
- Three.js para escenas WebGL.
- GSAP para transiciones de alta precision.
- Lenis para scroll suave.
- Shaders GLSL para efectos visuales controlados.
- Howler para audio opcional, solo si aporta a experiencia.
- Patron de escenas con ciclo `init` / `destroy` para evitar fugas de memoria.
- Separacion entre contenido, componentes visuales y escenas 3D.

## Obsidian

Uso propuesto:

- Vault de memoria por proyecto.
- Nota de brief, investigacion, decisiones, prompts, QA y retrospectiva.
- Frontmatter YAML para indexacion por Orca.
- Enlaces bidireccionales entre proyecto, marca, assets, pruebas y entregables.

## NotebookLM

Uso propuesto:

- Generar un paquete de fuentes por proyecto: brief, investigacion, sitemap, copy, prompts visuales, decisiones y resultados de QA.
- Exportar el paquete a una carpeta `notebooklm-pack/`.
- Si no existe API disponible en el entorno, dejar el paquete listo para carga manual o automatizacion browser controlada por Orca.

## Riesgos

- n8n puede estar instalado, pero sin credenciales API disponibles no conviene mutar su runtime automaticamente.
- NotebookLM puede requerir sesion interactiva; por eso el workflow debe producir paquetes fuente independientemente de la disponibilidad del servicio.
- Animaciones WebGL deben tener fallback estatico, lazy loading y reduced motion.

