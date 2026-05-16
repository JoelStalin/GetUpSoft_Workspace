from __future__ import annotations

from concurrent.futures import Future
import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))

from fastapi.testclient import TestClient

from ai_automation_orchestrator.config import load_config
from ai_automation_orchestrator.jobs import WorkflowStore
from ai_automation_orchestrator.service import OrchestratorService
from ai_automation_orchestrator.user_credentials import CredentialStore
from ai_automation_orchestrator.webapp import create_app
from ai_automation_orchestrator.workflow_blueprints import WorkflowBlueprintStore


class ImmediateExecutor:
    def submit(self, fn, *args, **kwargs):  # type: ignore[no-untyped-def]
        future = Future()
        try:
            result = fn(*args, **kwargs)
        except Exception as exc:  # pragma: no cover - helper
            future.set_exception(exc)
        else:
            future.set_result(result)
        return future


class FakeService(OrchestratorService):
    def __init__(self) -> None:
        super().__init__(load_config(Path(__file__).resolve().parents[1] / "config" / "models.example.json"))

    def generate(self, *, messages, model_id=None, **overrides):  # type: ignore[override]
        return f"generated for {model_id or self.config.default_model}"


class WebAppTests(unittest.TestCase):
    def test_dashboard_and_job_submission(self) -> None:
        with tempfile.TemporaryDirectory() as temp_dir:
            store = WorkflowStore(Path(temp_dir) / "jobs.db")
            blueprint_store = WorkflowBlueprintStore(Path(temp_dir) / "blueprints.json")
            credential_store = CredentialStore(Path(temp_dir) / "user_credentials.json")
            app = create_app(
                Path(__file__).resolve().parents[1] / "config" / "models.example.json",
                service=FakeService(),
                store=store,
                blueprint_store=blueprint_store,
                credential_store=credential_store,
                executor=ImmediateExecutor(),
            )
            client = TestClient(app)

            dashboard = client.get("/")
            submission = client.post(
                "/api/workflows/test-flow",
                json={"project": "Portal", "context": "Login y pagos", "model": "kimi-k2-6"},
            )
            listing = client.get("/api/workflows")
            rowboat_status = client.get("/api/rowboat/status")
            rowboat_chat = client.post("/api/rowboat/chat", json={"message": "Hola"})
            plugin_page = client.get("/plugin")
            plugin_zip = client.get("/downloads/orca-clap-plugin.zip")
            blueprint = client.post(
                "/api/blueprints",
                json={
                    "user_id": "yoeli",
                    "name": "Ventas Jarvis",
                    "objective": "Responder leads y crear seguimiento",
                    "nodes": [{"id": "ai", "type": "AI", "label": "Clasificar lead"}],
                    "edges": [],
                    "settings": {"voice": "browser"},
                },
            )
            blueprints = client.get("/api/blueprints", params={"user_id": "yoeli"})
            run_blueprint = client.post(
                f"/api/blueprints/{blueprint.json()['id']}/run",
                json={"user_id": "yoeli", "model": "kimi-k2-6"},
            )
            save_global_credential = client.put(
                "/api/credentials/global",
                json={"values": {"openai": "global-openai-token"}},
            )
            save_user_credential = client.put(
                "/api/credentials/user",
                json={"user_id": "yoeli", "values": {"claude": "user-claude-token"}},
            )
            credential_status = client.get("/api/credentials", params={"user_id": "yoeli"})
            clear_user_credential = client.delete("/api/credentials/user/claude", params={"user_id": "yoeli"})

        self.assertEqual(dashboard.status_code, 200)
        self.assertIn("Orca Command", dashboard.text)
        self.assertIn("workflow-canvas", dashboard.text)
        self.assertIn("OpenAI / ChatGPT", dashboard.text)
        self.assertEqual(submission.status_code, 202)
        self.assertEqual(listing.status_code, 200)
        self.assertEqual(len(listing.json()["items"]), 1)
        self.assertEqual(rowboat_status.status_code, 200)
        self.assertFalse(rowboat_status.json()["configured"])
        self.assertEqual(rowboat_chat.status_code, 503)
        self.assertEqual(plugin_page.status_code, 200)
        self.assertIn("Orca Clap Launcher", plugin_page.text)
        self.assertEqual(plugin_zip.status_code, 200)
        self.assertEqual(plugin_zip.headers["content-type"], "application/zip")
        self.assertEqual(blueprint.status_code, 200)
        self.assertEqual(len(blueprints.json()["items"]), 1)
        self.assertEqual(run_blueprint.status_code, 202)
        self.assertEqual(save_global_credential.status_code, 200)
        self.assertEqual(save_user_credential.status_code, 200)
        self.assertEqual(credential_status.status_code, 200)
        self.assertTrue(any(item["provider"] == "openai" and item["configured"] for item in credential_status.json()["providers"]))
        self.assertTrue(any(item["provider"] == "claude" and item["scope"] == "user" for item in credential_status.json()["providers"]))
        self.assertFalse(any(item.get("masked_value") == "user-claude-token" for item in credential_status.json()["providers"]))
        self.assertEqual(clear_user_credential.status_code, 200)
