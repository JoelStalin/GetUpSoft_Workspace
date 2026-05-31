from __future__ import annotations

import json
import re
from dataclasses import asdict, is_dataclass
from datetime import UTC, datetime
from pathlib import Path
from typing import Any, cast


class TranscriptHistory:
    redaction_rules: tuple[tuple[re.Pattern[str], str], ...] = (
        (
            re.compile(r"\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b", flags=re.IGNORECASE),
            "[REDACTED_EMAIL]",
        ),
        (re.compile(r"\b(?:sk|rk|pk)_[A-Za-z0-9_-]{8,}\b"), "[REDACTED_KEY]"),
        (re.compile(r"\btoken\s*[:=]\s*\S+", flags=re.IGNORECASE), "token=[REDACTED]"),
        (re.compile(r"\bpassword\s*[:=]\s*\S+", flags=re.IGNORECASE), "password=[REDACTED]"),
    )

    def __init__(self, storage_path: Path, *, enabled: bool = False) -> None:
        self.storage_path = storage_path
        self.enabled = enabled

    def _redact(self, value: Any) -> Any:
        if isinstance(value, str):
            redacted = value
            for pattern, replacement in self.redaction_rules:
                redacted = pattern.sub(replacement, redacted)
            return redacted
        if isinstance(value, dict):
            return {key: self._redact(item) for key, item in value.items()}
        if isinstance(value, list):
            return [self._redact(item) for item in value]
        if hasattr(value, "model_dump"):
            return self._redact(value.model_dump(mode="json"))
        if is_dataclass(value):
            return self._redact(asdict(cast(Any, value)))
        return value

    def add(self, event: Any) -> None:
        if not self.enabled:
            return
        self.storage_path.parent.mkdir(parents=True, exist_ok=True)
        payload = {
            "timestamp": datetime.now(UTC).isoformat(),
            "event": self._redact(event),
        }
        with self.storage_path.open("a", encoding="utf-8") as handle:
            handle.write(json.dumps(payload, ensure_ascii=False) + "\n")

    def list_recent(self, limit: int = 10) -> list[dict[str, Any]]:
        if not self.storage_path.exists():
            return []
        lines = self.storage_path.read_text(encoding="utf-8").splitlines()
        recent = lines[-limit:]
        return [json.loads(line) for line in recent]

    def clear(self) -> None:
        if self.storage_path.exists():
            self.storage_path.unlink()
