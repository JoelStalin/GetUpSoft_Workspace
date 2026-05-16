from __future__ import annotations

from pathlib import Path

from orca.config import OrcaSettings, get_settings
from orca.core.prompt_interpreter import InterpretationOutput


class ObsidianVault:
    def __init__(self, settings: OrcaSettings | None = None) -> None:
        self.settings = settings or get_settings()
        self.vault_root = self.settings.project_root / "docs" / "obsidian-vault"

    def write_interpretation(self, note_name: str, payload: InterpretationOutput) -> Path:
        self.vault_root.mkdir(parents=True, exist_ok=True)
        note_path = self.vault_root / f"{note_name}.md"
        note_path.write_text(self._render_markdown(payload), encoding="utf-8")
        return note_path

    @staticmethod
    def _render_markdown(payload: InterpretationOutput) -> str:
        acceptance = "\n".join(f"- {item}" for item in payload.scrum.acceptance_criteria)
        tasks = "\n".join(f"- {item}" for item in payload.scrum.tasks)
        risks = "\n".join(f"- {item}" for item in payload.scrum.risks) or "- none"
        dependencies = "\n".join(f"- {item}" for item in payload.scrum.dependencies) or "- none"
        return (
            "---\n"
            f"title: {payload.detected_intent}\n"
            f"source_type: {payload.source_type}\n"
            f"skill: {payload.selected_skill}\n"
            "---\n\n"
            f"# {payload.scrum.epic}\n\n"
            f"## Normalized Prompt\n{payload.normalized_prompt}\n\n"
            f"## User Story\n{payload.scrum.user_story}\n\n"
            f"## Acceptance Criteria\n{acceptance}\n\n"
            f"## Tasks\n{tasks}\n\n"
            f"## Risks\n{risks}\n\n"
            f"## Dependencies\n{dependencies}\n"
        )
