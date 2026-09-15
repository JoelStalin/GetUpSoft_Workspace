from __future__ import annotations

from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
import json
import re
from pathlib import Path
from typing import Any

from .paths import workspace_path


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


SECRET_PATTERNS = [
    (re.compile(r"(?i)(api[_-]?key|token|password)\s*[:=]\s*([^\s,;]+)"), r"\1: [REDACTED]"),
    (re.compile(r"sk-[A-Za-z0-9_\-]{8,}"), "sk-[REDACTED]"),
]


def redact_text(text: str) -> str:
    sanitized = text
    for pattern, replacement in SECRET_PATTERNS:
        sanitized = pattern.sub(replacement, sanitized)
    return sanitized


@dataclass(slots=True)
class HermesMemoryEntry:
    prompt: str
    response: str
    source: str = "hermes"
    created_at: str = field(default_factory=utc_now)
    metadata: dict[str, Any] = field(default_factory=dict)


class HermesMemoryAdapter:
    def __init__(
        self,
        *,
        config_path: str | Path | None = None,
        memory_path: str | Path | None = None,
        repository_memory_path: str | Path | None = None,
    ) -> None:
        self.config_path = Path(config_path) if config_path else workspace_path(".agents", "AGENT_MEMORY_CONFIG.json")
        self.memory_path = Path(memory_path) if memory_path else workspace_path(".agents", "memory", "hermes-memory.jsonl")
        self.repository_memory_path = (
            Path(repository_memory_path)
            if repository_memory_path
            else workspace_path("_Knowledge_Center", "Memory", "REPOSITORY_MEMORY.md")
        )
        self.memory_path.parent.mkdir(parents=True, exist_ok=True)
        self.repository_memory_path.parent.mkdir(parents=True, exist_ok=True)
        if not self.repository_memory_path.exists():
            self.repository_memory_path.write_text("# Repository Memory\n", encoding="utf-8")

    def sync_config(self) -> dict[str, Any]:
        if not self.config_path.exists():
            return {}
        return json.loads(self.config_path.read_text(encoding="utf-8"))

    def write(self, entry: HermesMemoryEntry) -> dict[str, Any]:
        sanitized_entry = HermesMemoryEntry(
            prompt=redact_text(entry.prompt),
            response=redact_text(entry.response),
            source=entry.source,
            created_at=entry.created_at,
            metadata={key: redact_text(str(value)) if isinstance(value, str) else value for key, value in entry.metadata.items()},
        )
        record = asdict(sanitized_entry)
        with self.memory_path.open("a", encoding="utf-8") as handle:
            handle.write(json.dumps(record, ensure_ascii=False) + "\n")
        self._append_repository_memory(record)
        return record

    def read(self, limit: int = 25) -> list[dict[str, Any]]:
        if not self.memory_path.exists():
            return []
        lines = self.memory_path.read_text(encoding="utf-8").splitlines()
        return [json.loads(line) for line in lines[-limit:] if line.strip()]

    def _append_repository_memory(self, record: dict[str, Any]) -> None:
        section = [
            "",
            f"## Hermes Memory Update {record['created_at']}",
            "",
            f"- Source: `{record['source']}`",
            f"- Prompt: {record['prompt']}",
            f"- Response: {record['response']}",
        ]
        metadata = record.get("metadata") or {}
        if metadata:
            section.append(f"- Metadata: `{json.dumps(metadata, ensure_ascii=False)}`")
        existing = self.repository_memory_path.read_text(encoding="utf-8") if self.repository_memory_path.exists() else "# Repository Memory\n"
        self.repository_memory_path.write_text(existing + "\n".join(section) + "\n", encoding="utf-8")
