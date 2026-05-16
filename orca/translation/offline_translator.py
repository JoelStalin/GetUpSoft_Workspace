from __future__ import annotations

from dataclasses import dataclass

from orca.config import OrcaSettings, get_settings


@dataclass(frozen=True)
class TranslationResult:
    detected_language: str
    canonical_language: str
    text: str


class OfflineTranslator:
    english_markers = {"fix", "build", "feature", "deploy", "refactor", "test"}
    spanish_markers = {"arregla", "crear", "funcionalidad", "despliegue", "prueba", "error"}
    mini_dictionary = {
        "fix": "arreglar",
        "bug": "error",
        "feature": "funcionalidad",
        "tests": "pruebas",
        "test": "prueba",
        "deploy": "despliegue",
        "documentation": "documentacion",
        "refactor": "refactorizar",
    }

    def __init__(self, settings: OrcaSettings | None = None) -> None:
        self.settings = settings or get_settings()

    def canonicalize(self, text: str) -> TranslationResult:
        detected_language = self.detect_language(text)
        if detected_language == self.settings.canonical_language:
            return TranslationResult(
                detected_language=detected_language,
                canonical_language=self.settings.canonical_language,
                text=text,
            )

        if detected_language == "en" and self.settings.canonical_language == "es":
            words = [self.mini_dictionary.get(token.lower(), token) for token in text.split()]
            return TranslationResult(
                detected_language="en",
                canonical_language="es",
                text=" ".join(words),
            )

        return TranslationResult(
            detected_language=detected_language,
            canonical_language=detected_language,
            text=text,
        )

    def detect_language(self, text: str) -> str:
        lowered = text.lower()
        english_hits = sum(1 for marker in self.english_markers if marker in lowered)
        spanish_hits = sum(1 for marker in self.spanish_markers if marker in lowered)
        return "en" if english_hits > spanish_hits else "es"
