from __future__ import annotations

from dataclasses import asdict, dataclass
from typing import Any

from .gstack_prompt_router import GStackRouteDecision


@dataclass(slots=True)
class GStackRoleContract:
    role: str
    review_depth: str
    evidence_required: bool
    output_format: str
    notes: list[str]

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


class GStackRoleAdapter:
    def adapt(self, decision: GStackRouteDecision) -> GStackRoleContract:
        role = decision.gstack_role
        if role == "Security Officer":
            return GStackRoleContract(role=role, review_depth="deep", evidence_required=True, output_format="json", notes=["Verify secrets and allowlists."])
        if role == "QA":
            return GStackRoleContract(role=role, review_depth="medium", evidence_required=True, output_format="json", notes=["Define test matrix and regression risk."])
        if role == "CEO":
            return GStackRoleContract(role=role, review_depth="high-level", evidence_required=False, output_format="markdown", notes=["Focus on strategy and impact."])
        return GStackRoleContract(role=role, review_depth="standard", evidence_required=True, output_format="json", notes=["Keep acceptance criteria and evidence explicit."])
