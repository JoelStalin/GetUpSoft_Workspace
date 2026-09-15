from __future__ import annotations

from dataclasses import asdict, dataclass
from typing import Any

from ..prompt_query_engine import PromptQueryEngine, PromptRecord


@dataclass(slots=True)
class GStackRouteDecision:
    intent: str
    category: str
    gstack_role: str
    rationale: str
    prompt: PromptRecord | None = None

    def to_dict(self) -> dict[str, Any]:
        payload = asdict(self)
        if self.prompt is not None:
            payload["prompt"] = asdict(self.prompt)
        return payload


class GStackPromptRouter:
    def __init__(self, engine: PromptQueryEngine | None = None) -> None:
        self.engine = engine or PromptQueryEngine()

    def route(self, prompt_text: str) -> GStackRouteDecision:
        classification = self.engine.classify_text(prompt_text)
        candidates = self.engine.search_by_intent(classification["intent"])
        prompt = candidates[0] if candidates else None
        rationale = f"Routed as {classification['intent']} -> {classification['gstack_role']} using {classification['category']} heuristics."
        return GStackRouteDecision(
            intent=classification["intent"],
            category=classification["category"],
            gstack_role=classification["gstack_role"],
            rationale=rationale,
            prompt=prompt,
        )
