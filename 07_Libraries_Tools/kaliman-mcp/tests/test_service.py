from __future__ import annotations

from pathlib import Path

import requests

from kaliman_mcp.service import KalimanService


class FakeResponse:
    def __init__(self, text: str = "", content: bytes = b"", status_code: int = 200) -> None:
        self.text = text
        self._content = content
        self.status_code = status_code

    def raise_for_status(self) -> None:
        if self.status_code >= 400:
            raise requests.HTTPError(f"HTTP {self.status_code}")

    def iter_content(self, chunk_size: int = 16384):
        for index in range(0, len(self._content), chunk_size):
            yield self._content[index : index + chunk_size]


class FakeSession:
    def __init__(self, mapping: dict[str, FakeResponse]) -> None:
        self.mapping = mapping
        self.headers: dict[str, str] = {}

    def get(self, url: str, **_: object) -> FakeResponse:
        if url not in self.mapping:
            raise AssertionError(f"Unexpected URL {url}")
        return self.mapping[url]


def test_list_seasons_merges_discovered_links() -> None:
    main_page = """
    <a href="/radionovelas-al-oido/kaliman-el-hombre-increible-el-tigre-de-hong-kong">Tigre</a>
    <a href="/radionovelas-al-oido/kaliman-el-hombre-increible-la-amenaza-invisible">Nueva</a>
    """
    service = KalimanService(session=FakeSession({"https://www.rtvcplay.co/radionovelas-al-oido/kaliman-el-hombre-increible": FakeResponse(text=main_page)}))

    seasons = service.list_seasons()

    assert seasons[0].slug == "el-tigre-de-hong-kong"
    assert any(season.slug == "la-amenaza-invisible" for season in seasons)


def test_list_episodes_parses_chapters_audios_block() -> None:
    season_url = "https://www.rtvcplay.co/radionovelas-al-oido/kaliman-el-hombre-increible-el-tigre-de-hong-kong"
    season_page = """
    {"chapters_audios":[
      {"chapter":2,"title":"Capitulo 2","file":"https:\\/\\/cdn.example.com\\/kaliman-2.mp3"},
      {"chapter":1,"title":"Capitulo 1","file":"https:\\/\\/cdn.example.com\\/kaliman-1.mp3"}
    ]}
    """
    service = KalimanService(session=FakeSession({season_url: FakeResponse(text=season_page)}))

    episodes = service.list_episodes(season_slug="el-tigre-de-hong-kong")

    assert [episode.chapter for episode in episodes] == [1, 2]
    assert episodes[0].file_url == "https://cdn.example.com/kaliman-1.mp3"


def test_download_season_creates_mp3_files(tmp_path: Path) -> None:
    season_url = "https://www.rtvcplay.co/radionovelas-al-oido/kaliman-el-hombre-increible-el-tigre-de-hong-kong"
    audio_url = "https://cdn.example.com/kaliman-1.mp3"
    season_page = """
    {"chapters_audios":[
      {"chapter":1,"title":"Capitulo 1","file":"https:\\/\\/cdn.example.com\\/kaliman-1.mp3"}
    ]}
    """
    service = KalimanService(
        session=FakeSession(
            {
                season_url: FakeResponse(text=season_page),
                audio_url: FakeResponse(content=b"fake-mp3-data"),
            }
        )
    )

    summary = service.download_season(
        output_dir=tmp_path,
        season_slug="el-tigre-de-hong-kong",
    )

    assert summary["downloaded_count"] == 1
    downloaded_file = Path(summary["downloaded_files"][0])
    assert downloaded_file.exists()
    assert downloaded_file.read_bytes() == b"fake-mp3-data"
