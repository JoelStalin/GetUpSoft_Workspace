# Plan de ejecucion

## Fase 1: Preparacion

1. Crear el blueprint "Professional Page Design Orchestrator" en Orca.
2. Importar el workflow n8n desde `n8n-professional-page-design.workflow.json`.
3. Configurar MCP con el manifiesto `mcp-orca-design-tools.manifest.json`.
4. Definir rutas de salida por proyecto:
   - `docs/design-memory/{project}/`
   - `docs/obsidian-vault/{project}/`
   - `outputs/notebooklm/{project}/`
   - `outputs/assets/{project}/`

## Fase 2: Intake e investigacion

1. Recibir solicitud desde Orca, n8n webhook o formulario interno.
2. Normalizar objetivo, audiencia, marca, idioma, referencias y restricciones.
3. Ejecutar investigacion de:
   - marca y posicionamiento;
   - competidores;
   - referencias visuales;
   - SEO;
   - tecnologia del proyecto;
   - reglas de accesibilidad y performance.
4. Guardar memoria inicial en Obsidian.

## Fase 3: Diseno de experiencia

1. Generar arquitectura de informacion.
2. Crear sitemap.
3. Crear estructura pagina por pagina.
4. Definir sistema visual, componentes, estados y responsive.
5. Generar prompts para assets, videos, posters y Open Graph.
6. Definir animaciones con Three.js, GSAP, Lenis y shaders solo donde agreguen valor.

## Fase 4: Implementacion asistida

1. Exportar especificacion frontend.
2. Crear tareas por modulo.
3. Registrar nodos/edges en Orca.
4. Generar paquete NotebookLM con documentos fuente.
5. Publicar memoria Obsidian.

## Fase 5: QA y publicacion

1. Ejecutar pruebas funcionales.
2. Ejecutar pruebas visuales.
3. Validar imagenes, enlaces, formularios, SEO y accesibilidad.
4. Generar reporte de cumplimiento.
5. Marcar blueprint como `ready_for_build` o `blocked`.

## Migracion a base de datos Orca

Tabla propuesta `workflow_blueprints`:

```sql
CREATE TABLE workflow_blueprints (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  objective TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  nodes_json TEXT NOT NULL DEFAULT '[]',
  edges_json TEXT NOT NULL DEFAULT '[]',
  settings_json TEXT NOT NULL DEFAULT '{}',
  n8n_workflow_json TEXT,
  obsidian_note_path TEXT,
  notebooklm_pack_path TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
```

Tabla propuesta `workflow_runs`:

```sql
CREATE TABLE workflow_runs (
  id TEXT PRIMARY KEY,
  blueprint_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  status TEXT NOT NULL,
  input_json TEXT NOT NULL DEFAULT '{}',
  output_json TEXT NOT NULL DEFAULT '{}',
  evidence_path TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (blueprint_id) REFERENCES workflow_blueprints(id)
);
```

