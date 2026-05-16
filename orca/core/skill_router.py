from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

import yaml

from orca.config import OrcaSettings, get_settings


@dataclass(frozen=True)
class SkillDefinition:
    name: str
    intents: tuple[str, ...]
    summary: str
    prompt_template: str
    definition_of_ready_overrides: tuple[str, ...]
    definition_of_done_overrides: tuple[str, ...]


class SkillRouter:
    def __init__(self, settings: OrcaSettings | None = None) -> None:
        self.settings = settings or get_settings()
        self._skills = self._load_skills(self.settings.skills_dir)

    def select(self, intent: str) -> SkillDefinition:
        for skill in self._skills:
            if intent in skill.intents:
                return skill
        return next(skill for skill in self._skills if skill.name == "scrum_skill")

    @staticmethod
    def _load_skills(directory: Path) -> list[SkillDefinition]:
        skills: list[SkillDefinition] = []
        for path in sorted(directory.glob("*_skill.yaml")):
            payload = yaml.safe_load(path.read_text(encoding="utf-8"))
            skills.append(
                SkillDefinition(
                    name=payload["name"],
                    intents=tuple(payload["intents"]),
                    summary=payload["summary"],
                    prompt_template=payload["prompt_template"],
                    definition_of_ready_overrides=tuple(payload["definition_of_ready_overrides"]),
                    definition_of_done_overrides=tuple(payload["definition_of_done_overrides"]),
                )
            )
        return skills
