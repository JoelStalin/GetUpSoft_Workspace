from __future__ import annotations

import importlib.util
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
        "login": "inicio de sesion",
        "feature": "funcionalidad",
        "tests": "pruebas",
        "test": "prueba",
        "deploy": "despliegue",
        "documentation": "documentacion",
        "refactor": "refactorizar",
        "build": "compilar",
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

        argos_translation = self._translate_with_argos(text, detected_language)
        if argos_translation is not None:
            return TranslationResult(
                detected_language=detected_language,
                canonical_language=self.settings.canonical_language,
                text=argos_translation,
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

    def _translate_with_argos(self, text: str, detected_language: str) -> str | None:
        if importlib.util.find_spec("argostranslate") is None:  # pragma: no cover
            return None
        if detected_language == self.settings.canonical_language:
            return text

        try:  # pragma: no cover - depends on optional local packages
            from argostranslate import package, translate
        except ImportError:
            return None

        if self.settings.argos_package_dir is not None and self.settings.argos_package_dir.exists():
            for archive in self.settings.argos_package_dir.glob("*.argosmodel"):
                package.install_from_path(archive)

        languages = translate.get_installed_languages()
        from_language = next((lang for lang in languages if lang.code == detected_language), None)
        to_language = next(
            (lang for lang in languages if lang.code == self.settings.canonical_language),
            None,
        )
        if from_language is None or to_language is None:
            return None
        translation = from_language.get_translation(to_language)
        return str(translation.translate(text))
