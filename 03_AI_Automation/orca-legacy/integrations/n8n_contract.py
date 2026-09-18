from __future__ import annotations

from pydantic import BaseModel

from orca.core.prompt_interpreter import InterpretationOutput


class N8NContract(BaseModel):
    source: str
    detected_intent: str
    selected_skill: str
    normalized_prompt: str
    tasks: list[str]
    risks: list[str]
    dependencies: list[str]
    paid_model_prompt: str
    free_model_followup_prompt: str
    error_recovery_prompt: str


def build_n8n_contract(payload: InterpretationOutput) -> N8NContract:
    return N8NContract(
        source=payload.source_type,
        detected_intent=payload.detected_intent,
        selected_skill=payload.selected_skill,
        normalized_prompt=payload.normalized_prompt,
        tasks=payload.scrum.tasks,
        risks=payload.scrum.risks,
        dependencies=payload.scrum.dependencies,
        paid_model_prompt=payload.model_prompt.paid_model_prompt,
        free_model_followup_prompt=payload.model_prompt.free_model_followup_prompt,
        error_recovery_prompt=payload.model_prompt.error_recovery_prompt,
    )
