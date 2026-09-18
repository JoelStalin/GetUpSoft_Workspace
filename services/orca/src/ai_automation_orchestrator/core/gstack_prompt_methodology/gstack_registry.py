from __future__ import annotations

from dataclasses import asdict, dataclass
from typing import Any

from ..prompt_query_engine import PromptQueryEngine, PromptRecord


@dataclass(slots=True)
class GStackPromptRegistryItem:
    record: PromptRecord
    tags: list[str]
    reviewers: list[str]


class GStackPromptRegistry:
    def __init__(self, engine: PromptQueryEngine | None = None) -> None:
        self.engine = engine or PromptQueryEngine()

    def list_records(self) -> list[PromptRecord]:
        return list(self.engine.prompts)

    def categorize(self) -> dict[str, list[dict[str, Any]]]:
        grouped: dict[str, list[dict[str, Any]]] = {}
        for record in self.engine.prompts:
            grouped.setdefault(record.category, []).append(asdict(record))
        return grouped

    def resolve_role(self, text: str) -> str:
        return self.engine.classify_text(text)["gstack_role"]

    def register_prompt(self, record: PromptRecord) -> None:
        self.engine.prompts.append(record)
        self.engine.save_index()
