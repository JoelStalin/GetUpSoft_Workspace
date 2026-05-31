# GetUpSoft Kaliman MCP

Servicio compartido para `GetUpSoft_Workspace` que convierte los scripts de descarga de Kaliman en:

1. una libreria Python reutilizable;
2. un servidor MCP compatible con `stdio` y `streamable-http`.

## Que resuelve

- Descubre temporadas de Kaliman en RTVC Play.
- Lista episodios por temporada.
- Descarga una temporada o toda la biblioteca.
- Expone esas operaciones como herramientas MCP para cualquier cliente o proyecto del workspace.

## Uso como libreria Python

```python
from pathlib import Path

from kaliman_mcp import KalimanService

service = KalimanService()
seasons = service.list_seasons()
episodes = service.list_episodes(season_slug="el-tigre-de-hong-kong")
summary = service.download_season(
    output_dir=Path("artifacts") / "kaliman",
    season_slug="el-tigre-de-hong-kong",
    limit=3,
)
```

## Uso como servidor MCP

### Instalar dependencias

```powershell
uv sync
```

### Transporte stdio

```powershell
uv run kaliman-mcp --transport stdio
```

### Transporte HTTP

```powershell
uv run kaliman-mcp --transport streamable-http --host 127.0.0.1 --port 8765
```

El endpoint MCP queda en `http://127.0.0.1:8765/mcp`.

## Herramientas MCP expuestas

- `list_kaliman_seasons`
- `list_kaliman_episodes`
- `download_kaliman_season`
- `download_kaliman_library`

## Ejemplo de configuracion MCP para proyectos del workspace

```json
{
  "mcpServers": {
    "kaliman-getupsoft": {
      "command": "uv",
      "args": [
        "run",
        "--directory",
        "C:\\Users\\yoeli\\Documents\\GetUpSoft_Workspace\\03_AI_Automation\\kaliman-mcp",
        "kaliman-mcp",
        "--transport",
        "stdio"
      ]
    }
  }
}
```

Tambien puedes reutilizar directamente estos archivos ya preparados:

- `config/mcp-servers.stdio.json`
- `config/mcp-servers.http.json`
- `scripts/start-stdio.ps1`
- `scripts/start-http.ps1`

## Integracion por HTTP

Si prefieres desacoplar los proyectos del runtime Python local:

```json
{
  "mcpServers": {
    "kaliman-getupsoft-http": {
      "transport": "http",
      "url": "http://127.0.0.1:8765/mcp"
    }
  }
}
```

## Convencion recomendada para otros proyectos

- Invocar el servidor por MCP si el proyecto necesita capacidad compartida desde agentes o automatizaciones.
- Importar `KalimanService` directamente solo cuando el proyecto ya sea Python y necesite la API in-process.

## Arranque rapido para el workspace

### Stdio local

```powershell
.\\scripts\\start-stdio.ps1
```

### HTTP local

```powershell
.\\scripts\\start-http.ps1
```

### Consumo desde otro proyecto Python

```python
from pathlib import Path

from kaliman_mcp import KalimanService

service = KalimanService(base_output_dir=Path("artifacts"))
summary = service.download_season(
    output_dir="kaliman",
    season_slug="el-tigre-de-hong-kong",
    limit=5,
)
```

## Desarrollo

```powershell
uv sync --extra dev
uv run pytest
```
