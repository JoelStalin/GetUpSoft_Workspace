from __future__ import annotations

import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))

from ai_automation_orchestrator.generators.automation_flows import build_automation_flow_messages
from ai_automation_orchestrator.generators.interaction_scripts import build_interaction_script_messages
from ai_automation_orchestrator.generators.test_flows import build_test_flow_messages


class GeneratorMessageTests(unittest.TestCase):
    def test_test_flow_prompt_contains_project(self) -> None:
        messages = build_test_flow_messages("API Core", "Autenticacion y pagos")
        self.assertEqual(messages[1]["role"], "user")
        self.assertIn("API Core", messages[1]["content"])

    def test_automation_flow_prompt_contains_systems(self) -> None:
        messages = build_automation_flow_messages("Onboarding", "CRM y correo", "Con aprobacion")
        self.assertIn("CRM y correo", messages[1]["content"])

    def test_interaction_script_contains_objective(self) -> None:
        messages = build_interaction_script_messages("Clientes", "Renovacion", "Consultivo", "B2B")
        self.assertIn("Renovacion", messages[1]["content"])


if __name__ == "__main__":
    unittest.main()

