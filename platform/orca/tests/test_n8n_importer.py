from __future__ import annotations

import json
import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))

from fastapi.testclient import TestClient

from ai_automation_orchestrator.config import load_config
from ai_automation_orchestrator.jobs import WorkflowStore
from ai_automation_orchestrator.n8n_importer import import_n8n_workflow_directory
from ai_automation_orchestrator.service import OrchestratorService
from ai_automation_orchestrator.user_credentials import CredentialStore
from ai_automation_orchestrator.webapp import create_app
from ai_automation_orchestrator.workflow_blueprints import WorkflowBlueprintStore


class FakeService(OrchestratorService):
    def __init__(self) -> None:
        super().__init__(load_config(Path(__file__).resolve().parents[1] / "config" / "models.example.json"))

    def generate(self, *, messages, model_id=None, **overrides):  # type: ignore[override]
        return f"generated for {model_id or self.config.default_model}"


def write_sample_workflow(path: Path) -> None:
    path.write_text(
        json.dumps(
            {
                "id": "112",
                "name": "Sample n8n workflow",
                "active": False,
                "nodes": [
                    {
                        "id": "trigger",
                        "name": "Manual Trigger",
                        "type": "n8n-nodes-base.manualTrigger",
                        "typeVersion": 1,
                        "position": [100, 200],
                        "parameters": {},
                        "credentials": {"activeCampaignApi": ""},
                    }
                ],
                "connections": {},
                "settings": {"executionOrder": "v1"},
            }
        ),
        encoding="utf-8",
    )


class N8nImporterTests(unittest.TestCase):
    def test_import_directory_filters_and_normalizes_workflows(self) -> None:
        with tempfile.TemporaryDirectory() as temp_dir:
            root = Path(temp_dir)
            write_sample_workflow(root / "workflow.json")
            (root / "report.json").write_text('{"total": 1}', encoding="utf-8")

            result = import_n8n_workflow_directory(root, {})

        self.assertEqual(result["discovered"], 1)
        self.assertEqual(result["imported"], 1)
        self.assertEqual(result["skipped"], 1)
        workflow = next(iter(result["workflows"].values()))
        self.assertEqual(workflow.name, "Sample n8n workflow")
        self.assertEqual(workflow.nodes[0].credentials["activeCampaignApi"], "")

    def test_import_directory_endpoint_supports_dry_run(self) -> None:
        with tempfile.TemporaryDirectory() as temp_dir:
            root = Path(temp_dir)
            write_sample_workflow(root / "workflow.json")

            store = WorkflowStore(root / "jobs.db")
            blueprint_store = WorkflowBlueprintStore(root / "blueprints.json")
            credential_store = CredentialStore(root / "user_credentials.json")
            app = create_app(
                Path(__file__).resolve().parents[1] / "config" / "models.example.json",
                service=FakeService(),
                store=store,
                blueprint_store=blueprint_store,
                credential_store=credential_store,
            )
            client = TestClient(app)
            response = client.post(
                "/api/n8n/import-directory",
                json={"source_path": str(root), "dry_run": True},
            )

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data["dry_run"])
        self.assertEqual(data["discovered"], 1)
        self.assertEqual(data["imported"], 1)
