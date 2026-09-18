from __future__ import annotations

from orca.core.scrum_mapper import ScrumMapper
from orca.core.skill_router import SkillRouter


def test_scrum_mapper_includes_dor_and_dod() -> None:
    mapper = ScrumMapper()
    skill = SkillRouter().select("feature")

    scrum = mapper.map_request(
        normalized_prompt="crear una nueva funcionalidad para exportar reportes",
        detected_intent="feature",
        selected_skill=skill,
        extracted_rules={
            "priority": "medium",
            "risks": [],
            "dependencies": [],
            "system": "backend",
        },
        confidence=0.91,
    )

    assert scrum.epic.startswith("EPIC-2")
    assert "Objetivo claro" in scrum.definition_of_ready
    assert "Código implementado" in scrum.definition_of_done
    assert scrum.tasks
