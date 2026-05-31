from __future__ import annotations

from dataclasses import asdict, dataclass


@dataclass(slots=True)
class Season:
    slug: str
    name: str
    url: str

    def to_dict(self) -> dict[str, str]:
        return asdict(self)


@dataclass(slots=True)
class Episode:
    title: str
    file_url: str
    chapter: int

    def to_dict(self) -> dict[str, int | str]:
        return {
            "title": self.title,
            "file_url": self.file_url,
            "chapter": self.chapter,
        }
