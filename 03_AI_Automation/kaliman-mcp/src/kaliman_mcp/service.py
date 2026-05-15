from __future__ import annotations

import re
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from typing import Iterable

import requests

from .models import Episode, Season

BASE_URL = "https://www.rtvcplay.co"
SERIES_PATH = "/radionovelas-al-oido/kaliman-el-hombre-increible"
SERIES_URL = f"{BASE_URL}{SERIES_PATH}"
SEASON_PREFIX = "kaliman-el-hombre-increible-"
DEFAULT_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "es-ES,es;q=0.9,en;q=0.8",
}

KNOWN_SEASON_SLUGS = [
    "el-tigre-de-hong-kong",
    "el-extrano-dr-muerte",
    "los-piratas-del-espacio",
    "la-arana-negra",
    "la-bruja-blanca-del-kilimanjaro",
    "el-terrible-miklos",
    "los-samurais-mensajeros-de-la-muerte",
]


class KalimanService:
    def __init__(
        self,
        *,
        session: requests.Session | None = None,
        timeout_seconds: int = 30,
        base_output_dir: str | Path | None = None,
    ) -> None:
        self.session = session or requests.Session()
        self.timeout_seconds = timeout_seconds
        self.base_output_dir = Path(base_output_dir).expanduser() if base_output_dir else None
        self.session.headers.update(DEFAULT_HEADERS)

    def list_seasons(self, *, include_discovered: bool = True) -> list[Season]:
        seasons: dict[str, Season] = {
            slug: Season(
                slug=slug,
                name=self._season_name_from_slug(slug),
                url=f"{BASE_URL}/radionovelas-al-oido/{SEASON_PREFIX}{slug}",
            )
            for slug in KNOWN_SEASON_SLUGS
        }

        if include_discovered:
            try:
                content = self._fetch_text(SERIES_URL)
                for slug in self._extract_season_slugs(content):
                    seasons.setdefault(
                        slug,
                        Season(
                            slug=slug,
                            name=self._season_name_from_slug(slug),
                            url=f"{BASE_URL}/radionovelas-al-oido/{SEASON_PREFIX}{slug}",
                        ),
                    )
            except requests.RequestException:
                pass

        ordered = [seasons[slug] for slug in KNOWN_SEASON_SLUGS if slug in seasons]
        extras = sorted(
            (season for slug, season in seasons.items() if slug not in KNOWN_SEASON_SLUGS),
            key=lambda season: season.name.lower(),
        )
        return ordered + extras

    def list_episodes(
        self,
        *,
        season_slug: str | None = None,
        season_url: str | None = None,
    ) -> list[Episode]:
        resolved_slug, resolved_url = self._resolve_season_reference(season_slug, season_url)
        content = self._fetch_text(resolved_url)
        episodes = self._extract_episodes(content)

        if not episodes:
            raise ValueError(f"No se encontraron episodios para la temporada '{resolved_slug}'.")

        episodes.sort(key=lambda episode: (episode.chapter, episode.title.lower()))
        return episodes

    def download_season(
        self,
        *,
        output_dir: str | Path,
        season_slug: str | None = None,
        season_url: str | None = None,
        limit: int | None = None,
        max_workers: int = 4,
        skip_existing: bool = True,
    ) -> dict[str, object]:
        resolved_slug, resolved_url = self._resolve_season_reference(season_slug, season_url)
        season_name = self._season_name_from_slug(resolved_slug)
        season_folder = self._resolve_output_dir(output_dir) / season_name
        season_folder.mkdir(parents=True, exist_ok=True)

        episodes = self.list_episodes(season_slug=resolved_slug, season_url=resolved_url)
        selected_episodes = episodes[:limit] if limit and limit > 0 else episodes

        downloaded: list[str] = []
        skipped: list[str] = []
        failed: list[dict[str, str]] = []

        def _run_download(episode: Episode) -> None:
            try:
                status, payload = self._download_episode(
                    episode=episode,
                    output_dir=season_folder,
                    skip_existing=skip_existing,
                )
                if status == "downloaded":
                    downloaded.append(payload)
                elif status == "skipped":
                    skipped.append(payload)
            except Exception as exc:
                failed.append({"episode": episode.title, "error": str(exc)})

        worker_count = max(1, min(max_workers, len(selected_episodes) or 1))
        with ThreadPoolExecutor(max_workers=worker_count) as executor:
            list(executor.map(_run_download, selected_episodes))

        return {
            "season": {
                "slug": resolved_slug,
                "name": season_name,
                "url": resolved_url,
            },
            "output_dir": str(season_folder),
            "requested_episode_count": len(selected_episodes),
            "downloaded_count": len(downloaded),
            "skipped_count": len(skipped),
            "failed_count": len(failed),
            "downloaded_files": sorted(downloaded),
            "skipped_files": sorted(skipped),
            "failures": failed,
        }

    def download_library(
        self,
        *,
        output_dir: str | Path,
        limit_per_season: int | None = None,
        max_workers: int = 4,
        skip_existing: bool = True,
    ) -> dict[str, object]:
        seasons = self.list_seasons()
        results = [
            self.download_season(
                output_dir=output_dir,
                season_slug=season.slug,
                limit=limit_per_season,
                max_workers=max_workers,
                skip_existing=skip_existing,
            )
            for season in seasons
        ]
        return {
            "season_count": len(results),
            "downloaded_count": sum(int(result["downloaded_count"]) for result in results),
            "skipped_count": sum(int(result["skipped_count"]) for result in results),
            "failed_count": sum(int(result["failed_count"]) for result in results),
            "results": results,
        }

    def _fetch_text(self, url: str) -> str:
        response = self.session.get(url, timeout=self.timeout_seconds)
        response.raise_for_status()
        return response.text

    def _resolve_output_dir(self, output_dir: str | Path) -> Path:
        path = Path(output_dir).expanduser()
        if not path.is_absolute() and self.base_output_dir:
            return (self.base_output_dir / path).resolve()
        return path.resolve()

    def _resolve_season_reference(
        self,
        season_slug: str | None,
        season_url: str | None,
    ) -> tuple[str, str]:
        if season_url:
            slug = season_slug or self._slug_from_url(season_url)
            return slug, season_url

        if not season_slug:
            raise ValueError("Debes indicar season_slug o season_url.")

        return season_slug, f"{BASE_URL}/radionovelas-al-oido/{SEASON_PREFIX}{season_slug}"

    def _extract_season_slugs(self, content: str) -> list[str]:
        matches = re.findall(
            r'href="(/radionovelas-al-oido/kaliman-el-hombre-increible-([^"]+))"',
            content,
            flags=re.IGNORECASE,
        )
        slugs = {slug for _, slug in matches if slug}
        return sorted(slugs)

    def _extract_episodes(self, content: str) -> list[Episode]:
        episodes = self._extract_from_chapters_audios(content)
        if episodes:
            return episodes
        episodes = self._extract_from_serialized_episode_objects(content)
        if episodes:
            return episodes
        return self._extract_from_mp3_links(content)

    def _extract_from_chapters_audios(self, content: str) -> list[Episode]:
        marker = '"chapters_audios"'
        start = content.find(marker)
        if start == -1:
            return []

        list_start = content.find("[", start)
        if list_start == -1:
            return []

        bracket_depth = 0
        list_end = -1
        for index in range(list_start, len(content)):
            char = content[index]
            if char == "[":
                bracket_depth += 1
            elif char == "]":
                bracket_depth -= 1
                if bracket_depth == 0:
                    list_end = index + 1
                    break

        if list_end == -1:
            return []

        block = content[list_start:list_end]
        matches = re.finditer(
            r'"chapter"\s*:\s*(\d+).*?"title"\s*:\s*"([^"]+)".*?"file"\s*:\s*"(https?:\\?/\\?/[^"]+?\.mp3)"',
            block,
            flags=re.IGNORECASE | re.DOTALL,
        )
        episodes = [
            Episode(
                title=self._clean_title(title),
                file_url=self._normalize_file_url(file_url),
                chapter=int(chapter),
            )
            for chapter, title, file_url in (
                (match.group(1), match.group(2), match.group(3)) for match in matches
            )
        ]
        return self._dedupe_episodes(episodes)

    def _extract_from_serialized_episode_objects(self, content: str) -> list[Episode]:
        matches = re.finditer(
            r'"chapter"\s*:\s*(\d+).*?"title"\s*:\s*"([^"]+)".*?"file"\s*:\s*"(https?:\\?/\\?/[^"]+?\.mp3)"',
            content,
            flags=re.IGNORECASE | re.DOTALL,
        )
        episodes = [
            Episode(
                title=self._clean_title(match.group(2)),
                file_url=self._normalize_file_url(match.group(3)),
                chapter=int(match.group(1)),
            )
            for match in matches
        ]
        return self._dedupe_episodes(episodes)

    def _extract_from_mp3_links(self, content: str) -> list[Episode]:
        matches = re.finditer(
            r'"title"\s*:\s*"([^"]+)".*?"file"\s*:\s*"(https?:\\?/\\?/[^"]+?\.mp3)"',
            content,
            flags=re.IGNORECASE | re.DOTALL,
        )
        episodes = []
        for match in matches:
            title = self._clean_title(match.group(1))
            file_url = self._normalize_file_url(match.group(2))
            chapter = self._chapter_from_text(title) or self._chapter_from_text(file_url) or 0
            episodes.append(Episode(title=title, file_url=file_url, chapter=chapter))
        return self._dedupe_episodes(episodes)

    def _dedupe_episodes(self, episodes: Iterable[Episode]) -> list[Episode]:
        deduped: dict[str, Episode] = {}
        for episode in episodes:
            deduped.setdefault(episode.file_url, episode)
        return list(deduped.values())

    def _download_episode(
        self,
        *,
        episode: Episode,
        output_dir: Path,
        skip_existing: bool,
    ) -> tuple[str, str]:
        filename = self._build_episode_filename(episode)
        target_path = output_dir / filename

        if skip_existing and target_path.exists() and target_path.stat().st_size > 1024:
            return "skipped", str(target_path)

        response = self.session.get(episode.file_url, stream=True, timeout=max(self.timeout_seconds, 60))
        response.raise_for_status()

        try:
            with target_path.open("wb") as file_handle:
                for chunk in response.iter_content(chunk_size=16384):
                    if chunk:
                        file_handle.write(chunk)
        except Exception:
            if target_path.exists():
                target_path.unlink()
            raise

        return "downloaded", str(target_path)

    def _build_episode_filename(self, episode: Episode) -> str:
        safe_title = re.sub(r'[<>:"/\\|?*]+', "-", episode.title).strip(" .-_")
        safe_title = re.sub(r"\s+", " ", safe_title)
        chapter_prefix = str(max(episode.chapter, 0)).zfill(3)
        suffix = safe_title or "episodio"
        return f"{chapter_prefix} - {suffix}.mp3"

    def _season_name_from_slug(self, slug: str) -> str:
        return slug.replace("-", " ").title()

    def _slug_from_url(self, season_url: str) -> str:
        return season_url.rstrip("/").split(f"{SEASON_PREFIX}", 1)[-1]

    def _clean_title(self, value: str) -> str:
        return value.replace("\\/", "/").replace("&quot;", '"').strip()

    def _normalize_file_url(self, value: str) -> str:
        return value.replace("\\/", "/")

    def _chapter_from_text(self, value: str) -> int | None:
        match = re.search(r"(?:capitulo|cap[ií]tulo|chapter)[-_ ]*(\d+)", value, flags=re.IGNORECASE)
        if match:
            return int(match.group(1))
        return None
