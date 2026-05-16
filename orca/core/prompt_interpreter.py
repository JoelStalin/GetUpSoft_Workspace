from __future__ import annotations

import re
from dataclasses import dataclass
from pathlib import Path
from typing import Literal

from pydantic import BaseModel, Field

from orca.audio.jarvis_listener import JarvisEvent, JarvisListener
from orca.config import OrcaSettings, get_settings
from orca.core.error_prompt_generator import ErrorPromptGenerator
from orca.core.intent_classifier import IntentClassifier
from orca.core.normalizer import PromptNormalizer
from orca.core.prompt_builder import PromptBuilder
from orca.core.scrum_mapper import ScrumMapper
from orca.core.skill_router import SkillRouter
from orca.translation.offline_translator import OfflineTranslator

SourceType = Literal["text", "script", "audio", "transcript"]


class ScrumOutput(BaseModel):
    epic: str
    user_story: str
    acceptance_criteria: list[str]
    definition_of_ready: list[str]
    definition_of_done: list[str]
    tasks: list[str]
    risks: list[str]
    dependencies: list[str]


class ModelPromptOutput(BaseModel):
    paid_model_prompt: str
    free_model_followup_prompt: str
    error_recovery_prompt: str


class InterpretationOutput(BaseModel):
    source_type: SourceType
    original_input: str
    normalized_prompt: str
    canonical_language: Literal["es", "en"]
    detected_intent: str
    confidence: float = Field(ge=0.0, le=1.0)
    selected_skill: str
    scrum: ScrumOutput
    model_prompt: ModelPromptOutput


@dataclass(frozen=True)
class RuleExtractionResult:
    action: str
    entities: list[str]
    system: str
    scrum_phase: str
    priority: str
    risks: list[str]
    dependencies: list[str]
    intent_hint: str | None


class RuleExtractor:
    priority_patterns = {
        "high": ("urgent", "critico", "crítico", "asap", "hotfix", "bloquea", "blocker"),
        "medium": ("normal", "plan", "sprint"),
    }
    system_patterns = {
        "frontend": ("ui", "frontend", "react", "vista", "pantalla"),
        "backend": ("api", "backend", "python", "servicio"),
        "database": ("sql", "sqlite", "postgres", "db", "database"),
        "scrum": ("backlog", "sprint", "historia", "scrum"),
    }
    intent_patterns = {
        "bugfix": ("bug", "error", "fix", "arregla", "falla", "rompio", "rompió"),
        "feature": (
            "crear",
            "crea",
            "nuevo",
            "nueva",
            "agrega",
            "funcionalidad",
            "add",
            "feature",
            "implementar",
        ),
        "refactor": ("refactor", "limpia", "reorganiza"),
        "research": ("investiga", "research", "analiza", "explora"),
        "documentation": ("documenta", "docs", "readme", "adr"),
        "test": ("prueba", "test", "pytest", "coverage"),
        "deployment": ("deploy", "release", "publica"),
        "scrum-management": ("backlog", "sprint", "story", "epic"),
    }
    intent_priority = (
        "bugfix",
        "feature",
        "refactor",
        "test",
        "deployment",
        "research",
        "documentation",
        "scrum-management",
    )

    def extract(self, text: str) -> RuleExtractionResult:
        lowered = text.lower()
        entities = re.findall(r"`([^`]+)`", text)
        dependencies = re.findall(r"(?:depends on|requiere|blocked by)\s+([^.]+)", lowered)

        priority = "low"
        for candidate, markers in self.priority_patterns.items():
            if any(marker in lowered for marker in markers):
                priority = candidate
                break

        system = "general"
        for candidate, markers in self.system_patterns.items():
            if any(marker in lowered for marker in markers):
                system = candidate
                break

        intent_scores = {
            candidate: sum(1 for marker in markers if marker in lowered)
            for candidate, markers in self.intent_patterns.items()
        }
        ranked_intents = [
            candidate
            for candidate in self.intent_priority
            if intent_scores.get(candidate, 0) == max(intent_scores.values(), default=0)
            and intent_scores.get(candidate, 0) > 0
        ]
        intent_hint = ranked_intents[0] if ranked_intents else None

        risks: list[str] = []
        if "prod" in lowered or "production" in lowered:
            risks.append("Afecta producción")
        if "auth" in lowered or "login" in lowered or "security" in lowered:
            risks.append("Cambio sensible de autenticación/seguridad")

        scrum_phase = "implementation"
        if intent_hint in {"research", "documentation"}:
            scrum_phase = "discovery"
        elif intent_hint in {"test", "deployment"}:
            scrum_phase = "verification"

        action = intent_hint or "analyze"
        return RuleExtractionResult(
            action=action,
            entities=entities,
            system=system,
            scrum_phase=scrum_phase,
            priority=priority,
            risks=risks,
            dependencies=dependencies,
            intent_hint=intent_hint,
        )


class PromptInterpreter:
    def __init__(
        self,
        settings: OrcaSettings | None = None,
        *,
        translator: OfflineTranslator | None = None,
        normalizer: PromptNormalizer | None = None,
        classifier: IntentClassifier | None = None,
        skill_router: SkillRouter | None = None,
        scrum_mapper: ScrumMapper | None = None,
        prompt_builder: PromptBuilder | None = None,
        error_prompt_generator: ErrorPromptGenerator | None = None,
        jarvis_listener: JarvisListener | None = None,
    ) -> None:
        self.settings = settings or get_settings()
        self.translator = translator or OfflineTranslator(self.settings)
        self.normalizer = normalizer or PromptNormalizer()
        self.rule_extractor = RuleExtractor()
        self.classifier = classifier or IntentClassifier(self.settings)
        self.skill_router = skill_router or SkillRouter(self.settings)
        self.scrum_mapper = scrum_mapper or ScrumMapper(self.settings)
        self.prompt_builder = prompt_builder or PromptBuilder()
        self.error_prompt_generator = error_prompt_generator or ErrorPromptGenerator(self.settings)
        self.jarvis_listener = jarvis_listener or JarvisListener()

    def interpret_text(self, text: str, source_type: SourceType = "text") -> InterpretationOutput:
        translation = self.translator.canonicalize(text)
        normalized_prompt = self.normalizer.normalize(translation.text)
        rules = self.rule_extractor.extract(normalized_prompt)
        prediction = self.classifier.predict(normalized_prompt, rule_hint=rules.intent_hint)
        skill = self.skill_router.select(prediction.label)
        scrum_mapping = self.scrum_mapper.map_request(
            normalized_prompt=normalized_prompt,
            detected_intent=prediction.label,
            selected_skill=skill,
            extracted_rules=rules.__dict__,
            confidence=prediction.confidence,
        )
        prompt_payload = self.prompt_builder.build(
            normalized_prompt=normalized_prompt,
            selected_skill=skill,
            scrum=scrum_mapping,
            detected_intent=prediction.label,
            confidence=prediction.confidence,
        )
        error_payload = self.error_prompt_generator.generate(
            normalized_prompt=normalized_prompt,
            detected_intent=prediction.label,
            probable_cause=rules.action,
        )

        combined_prompt = ModelPromptOutput(
            paid_model_prompt=prompt_payload["paid_model_prompt"],
            free_model_followup_prompt=(
                prompt_payload["free_model_followup_prompt"]
                if prediction.confidence >= self.settings.low_confidence_threshold
                else (
                    "The request is ambiguous. Ask for missing scope, expected behavior, affected "
                    "module, and completion criteria before implementing.\n"
                    f"Current normalized prompt: {normalized_prompt}"
                )
            ),
            error_recovery_prompt=error_payload["diagnostic_prompt"],
        )

        canonical_language: Literal["es", "en"] = "es"
        if translation.canonical_language == "en":
            canonical_language = "en"

        return InterpretationOutput(
            source_type=source_type,
            original_input=text,
            normalized_prompt=normalized_prompt,
            canonical_language=canonical_language,
            detected_intent=prediction.label,
            confidence=round(prediction.confidence, 4),
            selected_skill=skill.name,
            scrum=ScrumOutput(
                epic=scrum_mapping.epic,
                user_story=scrum_mapping.user_story,
                acceptance_criteria=scrum_mapping.acceptance_criteria,
                definition_of_ready=scrum_mapping.definition_of_ready,
                definition_of_done=scrum_mapping.definition_of_done,
                tasks=scrum_mapping.tasks,
                risks=scrum_mapping.risks,
                dependencies=scrum_mapping.dependencies,
            ),
            model_prompt=combined_prompt,
        )

    def interpret_script(self, path: str | Path) -> InterpretationOutput:
        script_text = Path(path).read_text(encoding="utf-8")
        return self.interpret_text(script_text, source_type="script")

    def interpret_audio(self, path: str | Path) -> InterpretationOutput:
        transcript = self.jarvis_listener.transcribe(path)
        return self.interpret_text(transcript, source_type="audio")

    def process_jarvis_event(self, event: JarvisEvent) -> InterpretationOutput:
        prompt_text = event.voice_command.command_text or event.normalized_transcript
        source_type: SourceType = "audio" if event.source_type == "audio_ref" else "transcript"
        return self.interpret_text(prompt_text, source_type=source_type)
