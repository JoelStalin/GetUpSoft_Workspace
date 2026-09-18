# Kaliman MCP compartido

## Estado

- Existe un componente compartido en `03_AI_Automation/kaliman-mcp`.
- La capacidad reemplaza los scripts sueltos `download_kaliman.py` y `download_kaliman_final.py` como camino recomendado.
- Expone la descarga de Kaliman como API Python y como servidor MCP.

## Superficies publicas

- Libreria: `kaliman_mcp.KalimanService`
- CLI/MCP: `kaliman-mcp`
- Transportes soportados: `stdio` y `streamable-http`
- Herramientas MCP:
  - `list_kaliman_seasons`
  - `list_kaliman_episodes`
  - `download_kaliman_season`
  - `download_kaliman_library`

## Artefactos de integracion

- Config stdio lista para usar: `03_AI_Automation/kaliman-mcp/config/mcp-servers.stdio.json`
- Config HTTP lista para usar: `03_AI_Automation/kaliman-mcp/config/mcp-servers.http.json`
- Launcher stdio: `03_AI_Automation/kaliman-mcp/scripts/start-stdio.ps1`
- Launcher HTTP: `03_AI_Automation/kaliman-mcp/scripts/start-http.ps1`

## Convencion para proyectos GetUpSoft

- Usar MCP cuando la capacidad de descarga se consuma desde agentes, automatizaciones o herramientas cross-project.
- Importar `KalimanService` directamente solo para integraciones Python in-process.
- Mantener `output_dir` externo al codigo del consumidor para no acoplar rutas fijas.

## Notas operativas

- El parser real fue ajustado a la serializacion actual de RTVC Play y valida al menos la temporada `el-tigre-de-hong-kong`.
- El proyecto usa `uv` y `mcp[cli]`.
- Prueba base local: `uv run pytest`.
