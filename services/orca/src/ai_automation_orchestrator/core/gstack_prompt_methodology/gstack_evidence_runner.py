from __future__ import annotations

from dataclasses import asdict, dataclass
import json
from pathlib import Path
from typing import Any

from ..hermes_audit_logger import HermesAuditLogger
from ..hermes_memory_adapter import HermesMemoryAdapter
from ..hermes_runtime import HermesRuntime
from .gstack_prompt_router import GStackPromptRouter
from .gstack_review_engine import GStackReviewEngine


@dataclass(slots=True)
class GStackEvidenceBundle:
    route: dict[str, Any]
    review: dict[str, Any]
    hermes: dict[str, Any]

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


class GStackEvidenceRunner:
    def __init__(
        self,
        runtime: HermesRuntime | None = None,
        *,
        evidence_path: str | Path | None = None,
    ) -> None:
        self.runtime = runtime or HermesRuntime()
        self.router = GStackPromptRouter(self.runtime.prompt_engine)
        self.reviewer = GStackReviewEngine(self.runtime.prompt_engine)
        self.evidence_path = Path(evidence_path) if evidence_path else self.runtime.evidence_path
        self.evidence_path.mkdir(parents=True, exist_ok=True)

    def run(self, prompt_text: str) -> GStackEvidenceBundle:
        route = self.router.route(prompt_text)
        review = self.reviewer.review(prompt_text)
        hermes_result = self.runtime.run(prompt_text, tools=[route.gstack_role.lower().replace(" ", "_")], workflow_context=route.to_dict())
        bundle = GStackEvidenceBundle(route=route.to_dict(), review=review.to_dict(), hermes=hermes_result.to_dict())
        self._write_bundle(bundle)
        return bundle

    def _write_bundle(self, bundle: GStackEvidenceBundle) -> Path:
        output = self.evidence_path / "gstack-hermes-orca-evidence.json"
        output.write_text(json.dumps(bundle.to_dict(), ensure_ascii=False, indent=2), encoding="utf-8")
        return output
