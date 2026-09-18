from __future__ import annotations

from orca.config import OrcaSettings, get_settings


class ErrorPromptGenerator:
    def __init__(self, settings: OrcaSettings | None = None) -> None:
        self.settings = settings or get_settings()

    def generate(
        self,
        normalized_prompt: str,
        detected_intent: str,
        affected_file: str = "unknown",
        probable_cause: str = "unknown",
    ) -> dict[str, str]:
        context = {
            "normalized_prompt": normalized_prompt,
            "detected_intent": detected_intent,
            "affected_file": affected_file,
            "probable_cause": probable_cause,
        }
        return {
            "diagnostic_prompt": self._render("bugfix_prompt.md", context),
            "implementation_prompt": self._render("continue_implementation_prompt.md", context),
            "test_prompt": self._render("test_generation_prompt.md", context),
            "refactor_prompt": self._render("refactor_prompt.md", context),
            "documentation_prompt": self._render("documentation_prompt.md", context),
        }

    def _render(self, template_name: str, context: dict[str, str]) -> str:
        template_path = self.settings.templates_dir / template_name
        template = template_path.read_text(encoding="utf-8")
        return template.format(**context)
