from __future__ import annotations

from collections.abc import Mapping
from dataclasses import dataclass
from pathlib import Path
from typing import Any, cast

import yaml

from orca.config import OrcaSettings, get_settings
from orca.core.skill_router import SkillDefinition


@dataclass(frozen=True)
class ScrumMapping:
    epic: str
    user_story: str
    acceptance_criteria: list[str]
    definition_of_ready: list[str]
    definition_of_done: list[str]
    tasks: list[str]
    risks: list[str]
    dependencies: list[str]


class ScrumMapper:
    epic_by_intent = {
        "feature": "EPIC-2",
        "bugfix": "EPIC-6",
        "refactor": "EPIC-5",
        "research": "EPIC-2",
        "documentation": "EPIC-5",
        "test": "EPIC-5",
        "deployment": "EPIC-5",
        "scrum-management": "EPIC-5",
    }

    def __init__(self, settings: OrcaSettings | None = None) -> None:
        self.settings = settings or get_settings()
        self._definitions = self._load_yaml(self.settings.backlog_dir / "definitions.yaml")
        self._product_backlog = self._load_yaml(self.settings.backlog_dir / "product_backlog.yaml")

    def map_request(
        self,
        normalized_prompt: str,
        detected_intent: str,
        selected_skill: SkillDefinition,
        extracted_rules: dict[str, Any],
        confidence: float,
    ) -> ScrumMapping:
        epic_id = self.epic_by_intent.get(detected_intent, "EPIC-5")
        epic = self._resolve_epic_title(epic_id)
        priority = extracted_rules["priority"]
        risks = list(extracted_rules["risks"])
        dependencies = list(extracted_rules["dependencies"])
        system = extracted_rules["system"]

        user_story = (
            f"Como equipo de ingeniería, quiero atender una solicitud de tipo {detected_intent} "
            f"sobre {system} para convertir '{normalized_prompt}' en trabajo ejecutable."
        )

        acceptance_criteria = [
            "La solicitud queda normalizada y estructurada.",
            f"La intención {detected_intent} queda clasificada con confianza {confidence:.2f}.",
            "El resultado incluye plan técnico, skill y criterios Scrum.",
        ]
        if confidence < self.settings.low_confidence_threshold:
            acceptance_criteria.append(
                "Se solicita refinamiento estructurado por ambigüedad detectada."
            )

        tasks = [
            "Validar alcance y contexto de entrada.",
            f"Aplicar skill '{selected_skill.name}'.",
            "Ejecutar implementación o refinamiento según el tipo de trabajo.",
            "Definir y ejecutar pruebas asociadas.",
            "Actualizar documentación y backlog.",
        ]
        if priority == "high":
            tasks.insert(
                0,
                "Atender el trabajo con prioridad alta y validar riesgos antes de ejecutar.",
            )

        dor = list(self._definitions["definition_of_ready"]) + list(
            selected_skill.definition_of_ready_overrides
        )
        dod = list(self._definitions["definition_of_done"]) + list(
            selected_skill.definition_of_done_overrides
        )

        return ScrumMapping(
            epic=epic,
            user_story=user_story,
            acceptance_criteria=acceptance_criteria,
            definition_of_ready=dor,
            definition_of_done=dod,
            tasks=tasks,
            risks=risks,
            dependencies=dependencies,
        )

    @staticmethod
    def _load_yaml(path: Path) -> dict[str, Any]:
        payload = cast(Mapping[str, Any], yaml.safe_load(path.read_text(encoding="utf-8")))
        return dict(payload)

    def _resolve_epic_title(self, epic_id: str) -> str:
        for epic in self._product_backlog["epics"]:
            if epic["id"] == epic_id:
                return f"{epic_id}: {epic['title']}"
        return epic_id
