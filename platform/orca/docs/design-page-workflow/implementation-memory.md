---
title: Professional Page Design Orchestrator
owner: GetUpSoft
system: Orca
applies_to_projects: all
status: planned
created_at: 2026-05-19
---

# Memoria de implementacion

## Decision principal

Crear un workflow maestro para diseno de paginas profesionales que funcione en tres capas:

1. n8n como motor operativo importable.
2. Orca como visualizador, memoria y ejecutor interno.
3. Obsidian + NotebookLM como capa de conocimiento, investigacion y estudio.

## Nombre del workflow

`Professional Page Design Orchestrator`

## Resultado esperado

Para cada proyecto, Orca debe producir:

- investigacion;
- brief normalizado;
- sitemap;
- UX page map;
- copy principal;
- sistema visual;
- prompts de assets;
- prompts de animacion;
- paquete NotebookLM;
- nota Obsidian;
- plan de pruebas;
- reporte de calidad;
- blueprint visual tipo n8n.

## Tecnicas visuales adoptadas

Desde `davidhckh/portfolio-2025` se adoptan como referencia:

- Three.js para escenas 3D;
- GSAP para transiciones;
- Lenis para scroll suave;
- GLSL para efectos controlados;
- ciclo `init` / `destroy` en escenas;
- separacion entre contenido, componentes y experiencia visual.

## Politica de almacenamiento

Implementacion inmediata:

- Guardar blueprint en Orca con `/api/blueprints`.
- Mantener workflow n8n como JSON importable.
- Mantener MCP como manifiesto versionado.

Implementacion productiva:

- Migrar `WorkflowBlueprintStore` de JSON local a SQLite/Postgres.
- Guardar `n8n_workflow_json`, `nodes_json`, `edges_json`, `settings_json`, `obsidian_note_path` y `notebooklm_pack_path`.

## Skills aplicadas

- `mcp-builder`: diseno de herramientas MCP orientadas a workflows.
- `agency-agents`: checklist de roles, evidencia y revision.
- `webapp-testing`: estrategia de validacion funcional y evidencia UI.

## Pendientes controlados

- Instalar/importar workflow en runtime n8n cuando existan credenciales o acceso UI confirmado.
- Implementar store SQL de blueprints.
- Conectar NotebookLM con automatizacion browser si no hay API estable disponible.
- Crear pruebas Selenium especificas del canvas cuando se modifique la UI.

