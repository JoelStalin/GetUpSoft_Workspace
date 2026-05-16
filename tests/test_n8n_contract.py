from __future__ import annotations

from orca.core.prompt_interpreter import PromptInterpreter
from orca.integrations.n8n_contract import build_n8n_contract


def test_n8n_contract_contains_prompt_and_task_data() -> None:
    payload = PromptInterpreter().interpret_text("arregla el bug del login y agrega pruebas")

    contract = build_n8n_contract(payload)

    assert contract.detected_intent == "bugfix"
    assert contract.tasks
    assert contract.error_recovery_prompt
