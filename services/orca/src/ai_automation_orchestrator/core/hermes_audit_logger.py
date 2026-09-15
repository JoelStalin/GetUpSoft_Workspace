from __future__ import annotations

from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
import json
from pathlib import Path
from typing import Any

from .paths import orca_root


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


@dataclass(slots=True)
class HermesAuditEntry:
    action: str
    prompt: str
    status: str
    created_at: str = field(default_factory=utc_now)
    model: str | None = None
    tool_name: str | None = None
    memory_enabled: bool = False
    audit_enabled: bool = True
    metadata: dict[str, Any] = field(default_factory=dict)


class HermesAuditLogger:
    def __init__(self, path: str | Path | None = None) -> None:
        default_path = orca_root() / "evidence" / "hermes-integration" / "audit-log.jsonl"
        self.path = Path(path) if path else default_path
        self.path.parent.mkdir(parents=True, exist_ok=True)

    def append(self, entry: HermesAuditEntry) -> None:
        with self.path.open("a", encoding="utf-8") as handle:
            handle.write(json.dumps(asdict(entry), ensure_ascii=False) + "\n")

    def read(self, limit: int = 50) -> list[dict[str, Any]]:
        if not self.path.exists():
            return []
        entries: list[dict[str, Any]] = []
        for line in self.path.read_text(encoding="utf-8").splitlines()[-limit:]:
            if line.strip():
                entries.append(json.loads(line))
        return entries
