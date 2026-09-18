from __future__ import annotations

from orca.core.prompt_interpreter import PromptInterpreter

from orca.config import get_settings
from orca.service_health import build_health_response


def test_service_health_payload_reports_runtime_policy() -> None:
    payload = build_health_response().model_dump(mode="json")
    assert payload["status"] == "ok"
    assert "Work autonomously" in payload["completion_policy"]


def test_service_interpret_returns_structured_payload() -> None:
    interpreter = PromptInterpreter(get_settings())
    payload = interpreter.interpret_text("arregla el error del login y agrega pruebas").model_dump(mode="json")
    assert payload["detected_intent"] == "bugfix"
    assert payload["selected_skill"] == "bugfix_skill"
