from __future__ import annotations

from orca.core.completion_policy import AUTONOMOUS_COMPLETION_POLICY
from orca.core.scrum_mapper import ScrumMapping
from orca.core.skill_router import SkillDefinition


class PromptBuilder:
    def build(
        self,
        normalized_prompt: str,
        selected_skill: SkillDefinition,
        scrum: ScrumMapping,
        detected_intent: str,
        confidence: float,
    ) -> dict[str, str]:
        paid_model_prompt = (
            "Use the following structured task.\n"
            f"Execution policy: {AUTONOMOUS_COMPLETION_POLICY}\n"
            f"Intent: {detected_intent}\n"
            f"Confidence: {confidence:.2f}\n"
            f"Skill: {selected_skill.name}\n"
            f"Epic: {scrum.epic}\n"
            f"User story: {scrum.user_story}\n"
            f"Acceptance criteria: {'; '.join(scrum.acceptance_criteria)}\n"
            f"Tasks: {'; '.join(scrum.tasks)}\n"
            f"Prompt template: {selected_skill.prompt_template.strip()}\n"
            f"Normalized prompt: {normalized_prompt}"
        )
        free_model_followup_prompt = (
            "Continue the task using only the structured requirements below.\n"
            f"Execution policy: {AUTONOMOUS_COMPLETION_POLICY}\n"
            f"Normalized prompt: {normalized_prompt}\n"
            f"Tasks: {'; '.join(scrum.tasks)}\n"
            f"Definition of done: {'; '.join(scrum.definition_of_done)}"
        )
        error_recovery_prompt = (
            "If the implementation fails, diagnose the error, isolate the affected file, "
            "propose the smallest safe fix, and restate the validation steps."
        )
        return {
            "paid_model_prompt": paid_model_prompt,
            "free_model_followup_prompt": free_model_followup_prompt,
            "error_recovery_prompt": error_recovery_prompt,
        }
