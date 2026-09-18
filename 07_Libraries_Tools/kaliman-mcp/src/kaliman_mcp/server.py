from __future__ import annotations

import argparse
from pathlib import Path

from mcp.server.fastmcp import FastMCP

from .service import KalimanService


def create_server(
    *,
    host: str = "127.0.0.1",
    port: int = 8000,
    streamable_http_path: str = "/mcp",
) -> FastMCP:
    service = KalimanService()
    server = FastMCP(
        name="getupsoft-kaliman-mcp",
        instructions=(
            "Expose catalog and download operations for the RTVC Kaliman collection. "
            "Use list tools to inspect seasons and episodes before downloading."
        ),
        host=host,
        port=port,
        streamable_http_path=streamable_http_path,
        json_response=True,
    )

    @server.tool()
    def list_kaliman_seasons(include_discovered: bool = True) -> dict[str, object]:
        """Lista temporadas disponibles de Kaliman."""
        seasons = service.list_seasons(include_discovered=include_discovered)
        return {
            "series": "kaliman",
            "season_count": len(seasons),
            "seasons": [season.to_dict() for season in seasons],
        }

    @server.tool()
    def list_kaliman_episodes(
        season_slug: str = "",
        season_url: str = "",
    ) -> dict[str, object]:
        """Lista episodios de una temporada por slug o URL."""
        episodes = service.list_episodes(
            season_slug=season_slug or None,
            season_url=season_url or None,
        )
        return {
            "season_slug": season_slug or service._slug_from_url(season_url),
            "episode_count": len(episodes),
            "episodes": [episode.to_dict() for episode in episodes],
        }

    @server.tool()
    def download_kaliman_season(
        output_dir: str,
        season_slug: str = "",
        season_url: str = "",
        limit: int = 0,
        max_workers: int = 4,
        skip_existing: bool = True,
    ) -> dict[str, object]:
        """Descarga una temporada de Kaliman a un directorio local."""
        return service.download_season(
            output_dir=Path(output_dir),
            season_slug=season_slug or None,
            season_url=season_url or None,
            limit=limit or None,
            max_workers=max_workers,
            skip_existing=skip_existing,
        )

    @server.tool()
    def download_kaliman_library(
        output_dir: str,
        limit_per_season: int = 0,
        max_workers: int = 4,
        skip_existing: bool = True,
    ) -> dict[str, object]:
        """Descarga toda la biblioteca conocida de Kaliman."""
        return service.download_library(
            output_dir=Path(output_dir),
            limit_per_season=limit_per_season or None,
            max_workers=max_workers,
            skip_existing=skip_existing,
        )

    return server


def main() -> int:
    parser = argparse.ArgumentParser(description="GetUpSoft Kaliman MCP server")
    parser.add_argument(
        "--transport",
        choices=["stdio", "streamable-http"],
        default="stdio",
        help="Transporte MCP a utilizar.",
    )
    parser.add_argument("--host", default="127.0.0.1", help="Host para transporte HTTP.")
    parser.add_argument("--port", type=int, default=8000, help="Puerto para transporte HTTP.")
    parser.add_argument(
        "--streamable-http-path",
        default="/mcp",
        help="Ruta MCP para streamable-http.",
    )
    parser.add_argument(
        "--mount-path",
        default="/",
        help="Ruta base ASGI usada por streamable-http.",
    )
    args = parser.parse_args()

    server = create_server(
        host=args.host,
        port=args.port,
        streamable_http_path=args.streamable_http_path,
    )
    server.run(transport=args.transport, mount_path=args.mount_path)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
