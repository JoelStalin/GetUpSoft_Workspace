from __future__ import annotations

import json
import sys
import unittest
from pathlib import Path
from unittest.mock import patch

import httpx

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))

from ai_automation_orchestrator.rowboat import (
    RowboatClient,
    RowboatSettings,
    extract_output_text,
    load_rowboat_settings,
)


class RowboatClientTests(unittest.TestCase):
    def test_load_settings_from_environment(self) -> None:
        with patch.dict(
            "os.environ",
            {
                "ROWBOAT_HOST": "http://localhost:3000",
                "ROWBOAT_PROJECT_ID": "project-1",
                "ROWBOAT_API_KEY": "secret",
                "ROWBOAT_TIMEOUT_SECONDS": "12",
            },
            clear=False,
        ):
            settings = load_rowboat_settings()

        self.assertTrue(settings.configured)
        self.assertEqual(settings.timeout_seconds, 12)

    def test_chat_posts_to_rowboat_api(self) -> None:
        requests: list[httpx.Request] = []

        def handler(request: httpx.Request) -> httpx.Response:
            requests.append(request)
            return httpx.Response(
                200,
                json={
                    "conversationId": "conversation-1",
                    "turn": {
                        "id": "turn-1",
                        "output": [{"role": "assistant", "content": "Listo", "responseType": "external"}],
                    },
                },
            )

        client = RowboatClient(
            RowboatSettings(
                host="http://rowboat.local",
                project_id="project-1",
                api_key="secret",
            ),
            transport=httpx.MockTransport(handler),
        )

        response = client.chat("Hola", conversation_id="conversation-0")

        self.assertEqual(response["conversationId"], "conversation-1")
        self.assertEqual(extract_output_text(response), "Listo")
        self.assertEqual(str(requests[0].url), "http://rowboat.local/api/v1/project-1/chat")
        self.assertEqual(requests[0].headers["authorization"], "Bearer secret")
        self.assertEqual(json.loads(requests[0].content)["conversationId"], "conversation-0")

    def test_chat_requires_configuration(self) -> None:
        client = RowboatClient(RowboatSettings(host=None, project_id=None, api_key=None))

        with self.assertRaises(RuntimeError):
            client.chat("Hola")


if __name__ == "__main__":
    unittest.main()
