from __future__ import annotations

from dataclasses import asdict, dataclass
from typing import Any

from ..prompt_query_engine import PromptQueryEngine, PromptRecord


@dataclass(slots=True)
class GStackReviewResult:
    prompt_id: str
    quality_score: int
    security_score: int
    test_coverage: int
    recommendations: list[str]
    duplicates: list[str]

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


class GStackReviewEngine:
    def __init__(self, engine: PromptQueryEngine | None = None) -> None:
        self.engine = engine or PromptQueryEngine()

    def review(self, prompt_text: str, record: PromptRecord | None = None) -> GStackReviewResult:
        classification = self.engine.classify_text(prompt_text)
        baseline = record or PromptRecord(
            prompt_id="ad-hoc",
            name="Ad hoc prompt",
            path="ad-hoc.md",
            category=classification["category"],
            gstack_role=classification["gstack_role"],
            orca_module="ai_automation_orchestrator",
            hermes_enabled=True,
            last_reviewed="",
            quality_score=0,
            security_score=0,
            test_coverage=0,
            intent=classification["intent"],
            summary=prompt_text[:250],
        )
        recommendations = self.engine.suggest_improvements(baseline)
        duplicates = [item.path for group in self.engine.find_duplicates() for item in group if item.path != baseline.path]
        return GStackReviewResult(
            prompt_id=baseline.prompt_id,
            quality_score=baseline.quality_score or 70,
            security_score=baseline.security_score or 70,
            test_coverage=baseline.test_coverage or 70,
            recommendations=recommendations,
            duplicates=duplicates,
        )
