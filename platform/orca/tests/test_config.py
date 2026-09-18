from __future__ import annotations

import json
import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))

from ai_automation_orchestrator.config import load_config


class LoadConfigTests(unittest.TestCase):
    def test_loads_default_and_models(self) -> None:
        payload = {
            "default_model": "primary",
            "models": [
                {
                    "id": "primary",
                    "provider": "nvidia-openai-compatible",
                    "model": "provider/model",
                    "api_key_env": "TEST_API_KEY",
                }
            ],
        }

        with tempfile.TemporaryDirectory() as temp_dir:
            path = Path(temp_dir) / "models.json"
            path.write_text(json.dumps(payload), encoding="utf-8")

            config = load_config(path)

        self.assertEqual(config.default_model, "primary")
        self.assertEqual(config.get_model().model, "provider/model")


if __name__ == "__main__":
    unittest.main()

