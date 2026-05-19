# Orca Professional Page Design Workflow

Este paquete define el workflow maestro para disenar paginas profesionales con Orca, n8n, MCP, Obsidian, NotebookLM y animaciones premium.

## Archivos

- `research.md`: investigacion tecnica y de producto.
- `execution-plan.md`: plan de implementacion.
- `followup-compliance-plan.md`: seguimiento, estados y evidencia.
- `testing-plan.md`: pruebas funcionales.
- `quality-testing-plan.md`: gates de calidad.
- `implementation-memory.md`: memoria de implementacion.
- `orca-blueprint.seed.json`: blueprint registrable en Orca.
- `n8n-professional-page-design.workflow.json`: workflow importable en n8n.
- `mcp-orca-design-tools.manifest.json`: especificacion del bridge MCP.
- `n8n-repo-reference-map.md`: mapa de referencia del repo `Zie619/n8n-workflows`.
- `n8n-workflows-integration.md`: manifiesto de integracion del repo como fuente de patrones.

## Registro rapido en Orca

Con Orca corriendo en `http://localhost:8015`:

```powershell
$body = Get-Content .\docs\design-page-workflow\orca-blueprint.seed.json -Raw
Invoke-RestMethod -Method Post -Uri http://localhost:8015/api/blueprints -ContentType 'application/json' -Body $body
```

## Importacion n8n

Importa `n8n-professional-page-design.workflow.json` desde la UI de n8n. Configura:

- `ORCA_BASE_URL`
- credenciales MCP si el runtime las requiere
- carpeta de salida para Obsidian y NotebookLM

## Compatibilidad actual

El blueprint es compatible con la API actual de Orca. La persistencia SQL queda definida en `execution-plan.md` para convertir el JSON store en base de datos productiva.
