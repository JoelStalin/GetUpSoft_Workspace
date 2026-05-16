from __future__ import annotations

from orca.core.completion_policy import AUTONOMOUS_COMPLETION_POLICY
from orca.core.prompt_builder import PromptBuilder
from orca.core.scrum_mapper import ScrumMapper
from orca.core.skill_router import SkillRouter


def test_prompt_builder_includes_autonomous_completion_policy() -> None:
    skill = SkillRouter().select("feature")
    scrum = ScrumMapper().map_request(
        normalized_prompt="crear modulo de exportacion",
        detected_intent="feature",
        selected_skill=skill,
        extracted_rules={
            "priority": "medium",
            "risks": [],
            "dependencies": [],
            "system": "backend",
        },
        confidence=0.92,
    )

    payload = PromptBuilder().build(
        normalized_prompt="crear modulo de exportacion",
        selected_skill=skill,
        scrum=scrum,
        detected_intent="feature",
        confidence=0.92,
    )

    assert AUTONOMOUS_COMPLETION_POLICY in payload["paid_model_prompt"]
    assert AUTONOMOUS_COMPLETION_POLICY in payload["free_model_followup_prompt"]
