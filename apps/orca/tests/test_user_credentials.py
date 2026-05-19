from __future__ import annotations

import os
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))

from ai_automation_orchestrator.user_credentials import CredentialStore, mask_secret


class UserCredentialTests(unittest.TestCase):
    def test_mask_secret(self) -> None:
        self.assertEqual(mask_secret("abcdefgh1234"), "abcd...1234")

    def test_user_overrides_global_and_environment(self) -> None:
        with tempfile.TemporaryDirectory() as temp_dir:
            store = CredentialStore(Path(temp_dir) / "user_credentials.json")
            store.upsert_global({"openai": "global-openai-key"})
            store.upsert_user("yoeli", {"openai": "user-openai-key"})

            with patch.dict(os.environ, {"OPENAI_API_KEY": "env-openai-key"}, clear=False):
                resolution = store.resolve("openai", user_id="yoeli")

        self.assertTrue(resolution.configured)
        self.assertEqual(resolution.scope, "user")
        self.assertEqual(resolution.source, "user_store")

    def test_global_falls_back_when_user_missing(self) -> None:
        with tempfile.TemporaryDirectory() as temp_dir:
            store = CredentialStore(Path(temp_dir) / "user_credentials.json")
            store.upsert_global({"claude": "global-claude-key"})
            resolution = store.resolve("claude", user_id="someone")

        self.assertTrue(resolution.configured)
        self.assertEqual(resolution.scope, "global")
        self.assertEqual(resolution.source, "global_store")

    def test_environment_falls_back_when_store_missing(self) -> None:
        with tempfile.TemporaryDirectory() as temp_dir:
            store = CredentialStore(Path(temp_dir) / "user_credentials.json")
            with patch.dict(os.environ, {"MANUS_API_KEY": "env-manus-key"}, clear=False):
                resolution = store.resolve("manus", user_id="yoeli")

        self.assertTrue(resolution.configured)
        self.assertEqual(resolution.source, "environment")

    def test_delete_provider(self) -> None:
        with tempfile.TemporaryDirectory() as temp_dir:
            store = CredentialStore(Path(temp_dir) / "user_credentials.json")
            store.upsert_global({"gemini": "gemini-key"})
            store.upsert_user("yoeli", {"gemini": "user-gemini-key"})

            self.assertTrue(store.delete_user_provider("yoeli", "gemini"))
            self.assertTrue(store.delete_global_provider("gemini"))


if __name__ == "__main__":
    unittest.main()
