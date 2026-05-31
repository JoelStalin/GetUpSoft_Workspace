from __future__ import annotations

import re

from pydantic import BaseModel


class VoiceCommand(BaseModel):
    wake_word: str | None
    command_text: str
    intent_hint: str | None
    target_hint: str | None
    should_send_to_orca: bool


class VoiceCommandRouter:
    wake_words = ("jarvis",)
    intent_rules: tuple[tuple[str, tuple[str, ...]], ...] = (
        ("prompt-generation", ("genera prompt", "genera un prompt")),
        ("scrum-management", ("crea tarea", "agrega al backlog", "backlog", "sprint")),
        ("bugfix", ("arregla", "corrige", "bug", "error")),
        ("feature", ("implementa", "crea modulo", "crea módulo", "agrega feature")),
        ("research", ("investiga", "analiza", "compara")),
        ("documentation", ("documenta", "readme", "adr")),
    )

    def route(self, text: str) -> VoiceCommand:
        stripped = re.sub(r"\s+", " ", text).strip()
        lowered = stripped.casefold()
        wake_word: str | None = None
        command_text = stripped

        for candidate in self.wake_words:
            if lowered.startswith(candidate):
                wake_word = candidate.capitalize()
                command_text = stripped[len(candidate) :].lstrip(" ,:-")
                break

        command_lowered = command_text.casefold()
        intent_hint = next(
            (
                intent
                for intent, markers in self.intent_rules
                if any(marker in command_lowered for marker in markers)
            ),
            None,
        )

        target_match = re.search(r"(?:del|de la|de|para)\s+([a-z0-9_.-]+)", command_lowered)
        target_hint = target_match.group(1) if target_match else None

        return VoiceCommand(
            wake_word=wake_word,
            command_text=command_text or stripped,
            intent_hint=intent_hint,
            target_hint=target_hint,
            should_send_to_orca=bool(command_text or stripped),
        )
