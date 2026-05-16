from __future__ import annotations

import re
from pathlib import Path

import yaml

DEFAULT_ENTRIES = {
    "orka": "ORCA",
    "orca": "ORCA",
    "jarbis": "Jarvis",
    "jarvis": "Jarvis",
    "en eight en": "n8n",
    "n eight n": "n8n",
    "obsidian": "Obsidian",
    "copilot": "Copilot",
    "codex": "Codex",
    "gemini": "Gemini",
    "scrum": "Scrum",
    "sprint": "sprint",
    "backlog": "backlog",
}


class CustomDictionary:
    def __init__(
        self,
        entries: dict[str, str] | None = None,
        source_path: Path | None = None,
    ) -> None:
        self.entries = {
            key.casefold(): value
            for key, value in (entries or self._load_entries(source_path)).items()
        }

    def _load_entries(self, source_path: Path | None) -> dict[str, str]:
        dictionary_path = source_path or Path(__file__).with_name("custom_dictionary.yaml")
        if not dictionary_path.exists():
            return DEFAULT_ENTRIES
        loaded = yaml.safe_load(dictionary_path.read_text(encoding="utf-8")) or {}
        if not isinstance(loaded, dict):
            raise ValueError("Custom dictionary YAML must define a mapping.")
        return {str(key): str(value) for key, value in loaded.items()}

    def apply(self, text: str) -> str:
        normalized = text
        ordered_entries = sorted(
            self.entries.items(),
            key=lambda item: len(item[0]),
            reverse=True,
        )
        for source, target in ordered_entries:
            pattern = re.compile(rf"\b{re.escape(source)}\b", flags=re.IGNORECASE)
            normalized = pattern.sub(target, normalized)
        return re.sub(r"\s+", " ", normalized).strip()
