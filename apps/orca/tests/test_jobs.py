from __future__ import annotations

import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))

from ai_automation_orchestrator.jobs import WorkflowStore


class WorkflowStoreTests(unittest.TestCase):
    def test_create_and_complete_job(self) -> None:
        with tempfile.TemporaryDirectory() as temp_dir:
            store = WorkflowStore(Path(temp_dir) / "workflows.db")
            job = store.create_job("test-flow", "Portal clientes", "deepseek-v4-pro", {"project": "Portal"})
            store.mark_running(job.id)
            store.mark_completed(job.id, "# resultado")

            saved = store.get_job(job.id)

        self.assertIsNotNone(saved)
        assert saved is not None
        self.assertEqual(saved.status, "completed")
        self.assertEqual(saved.output_markdown, "# resultado")

