from __future__ import annotations

import sys
import unittest
from pathlib import Path
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))

from ai_automation_orchestrator.providers.nvidia_openai import provider_timeout_seconds


class NvidiaProviderTests(unittest.TestCase):
    def test_provider_timeout_from_environment(self) -> None:
        with patch.dict("os.environ", {"AI_PROVIDER_TIMEOUT_SECONDS": "12.5"}, clear=False):
            self.assertEqual(provider_timeout_seconds(), 12.5)

    def test_provider_timeout_falls_back_on_invalid_value(self) -> None:
        with patch.dict("os.environ", {"AI_PROVIDER_TIMEOUT_SECONDS": "invalid"}, clear=False):
            self.assertEqual(provider_timeout_seconds(), 60.0)


if __name__ == "__main__":
    unittest.main()
