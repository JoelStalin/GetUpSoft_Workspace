from __future__ import annotations

import json
from pathlib import Path
from typing import Any

import typer


class OutputAdapter:
    def to_json(self, payload: Any) -> str:
        if hasattr(payload, "model_dump"):
            payload = payload.model_dump(mode="json")
        return json.dumps(payload, ensure_ascii=False, indent=2)

    def to_file(self, payload: Any, destination: str | Path) -> Path:
        path = Path(destination)
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(self.to_json(payload), encoding="utf-8")
        return path

    def to_terminal(self, payload: Any) -> None:
        typer.echo(self.to_json(payload))
