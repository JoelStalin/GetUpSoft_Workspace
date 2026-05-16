from __future__ import annotations

from pathlib import Path

from orca.audio.jarvis_listener import JarvisListener
from orca.core.prompt_interpreter import PromptInterpreter


class FakeJarvisListener(JarvisListener):
    def transcribe(self, audio_path: str | Path) -> str:
        return "arregla el bug del login y agrega pruebas de regresion"


def test_prompt_interpreter_detects_feature_for_implementation_request() -> None:
    interpreter = PromptInterpreter()

    result = interpreter.interpret_text("crea una nueva funcionalidad para exportar backlog a yaml")

    assert result.detected_intent == "feature"
    assert result.selected_skill == "implementation_skill"
    assert result.scrum.epic.startswith("EPIC-2")
    assert result.model_prompt.paid_model_prompt


def test_prompt_interpreter_detects_bugfix_for_bug_prompt() -> None:
    interpreter = PromptInterpreter()

    result = interpreter.interpret_text("arregla el error del login en produccion y agrega pruebas")

    assert result.detected_intent == "bugfix"
    assert result.selected_skill == "bugfix_skill"
    assert "Afecta producción" in result.scrum.risks


def test_prompt_interpreter_requests_refinement_for_ambiguous_prompt() -> None:
    interpreter = PromptInterpreter()

    result = interpreter.interpret_text("haz algo con eso porfa")

    assert result.confidence < 0.55
    assert "ambiguous" in result.model_prompt.free_model_followup_prompt.lower()


def test_prompt_interpreter_processes_audio_with_same_pipeline() -> None:
    interpreter = PromptInterpreter(jarvis_listener=FakeJarvisListener())

    result = interpreter.interpret_audio("fake.wav")

    assert result.source_type == "audio"
    assert result.detected_intent == "bugfix"


def test_prompt_interpreter_processes_jarvis_event() -> None:
    listener = JarvisListener()
    interpreter = PromptInterpreter(jarvis_listener=listener)

    event = listener.listen("Jarvis arregla el bug del login y crea pruebas", "transcript")
    result = interpreter.process_jarvis_event(event)

    assert result.source_type == "transcript"
    assert result.detected_intent == "bugfix"
