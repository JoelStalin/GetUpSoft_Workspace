from __future__ import annotations

from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
import json
from pathlib import Path
from threading import Lock
from typing import Any
from uuid import uuid4


@dataclass(slots=True)
class WorkflowBlueprint:
    id: str
    user_id: str
    name: str
    objective: str
    status: str = "draft"
    nodes: list[dict[str, Any]] = field(default_factory=list)
    edges: list[dict[str, Any]] = field(default_factory=list)
    settings: dict[str, Any] = field(default_factory=dict)
    created_at: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    updated_at: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class WorkflowBlueprintStore:
    def __init__(self, path: str | Path = "data/workflow_blueprints.json") -> None:
        self.path = Path(path)
        self._lock = Lock()
        self.path.parent.mkdir(parents=True, exist_ok=True)

    def list_blueprints(self, user_id: str) -> list[WorkflowBlueprint]:
        data = self._read()
        items = [WorkflowBlueprint(**item) for item in data if item.get("user_id") == user_id]
        return sorted(items, key=lambda item: item.updated_at, reverse=True)

    def get_blueprint(self, blueprint_id: str, user_id: str) -> WorkflowBlueprint | None:
        for item in self.list_blueprints(user_id):
            if item.id == blueprint_id:
                return item
        return None

    def upsert_blueprint(
        self,
        *,
        user_id: str,
        name: str,
        objective: str,
        blueprint_id: str | None = None,
        status: str = "draft",
        nodes: list[dict[str, Any]] | None = None,
        edges: list[dict[str, Any]] | None = None,
        settings: dict[str, Any] | None = None,
    ) -> WorkflowBlueprint:
        with self._lock:
            data = self._read()
            now = datetime.now(timezone.utc).isoformat()
            for index, item in enumerate(data):
                if item.get("id") == blueprint_id and item.get("user_id") == user_id:
                    item.update(
                        {
                            "name": name,
                            "objective": objective,
                            "status": status,
                            "nodes": nodes or [],
                            "edges": edges or [],
                            "settings": settings or {},
                            "updated_at": now,
                        }
                    )
                    data[index] = item
                    self._write(data)
                    return WorkflowBlueprint(**item)

            blueprint = WorkflowBlueprint(
                id=blueprint_id or str(uuid4()),
                user_id=user_id,
                name=name,
                objective=objective,
                status=status,
                nodes=nodes or [],
                edges=edges or [],
                settings=settings or {},
                updated_at=now,
            )
            data.append(asdict(blueprint))
            self._write(data)
            return blueprint

    def delete_blueprint(self, blueprint_id: str, user_id: str) -> bool:
        with self._lock:
            data = self._read()
            remaining = [item for item in data if not (item.get("id") == blueprint_id and item.get("user_id") == user_id)]
            if len(remaining) == len(data):
                return False
            self._write(remaining)
            return True

    def _read(self) -> list[dict[str, Any]]:
        if not self.path.exists():
            return []
        return json.loads(self.path.read_text(encoding="utf-8") or "[]")

    def _write(self, data: list[dict[str, Any]]) -> None:
        self.path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
