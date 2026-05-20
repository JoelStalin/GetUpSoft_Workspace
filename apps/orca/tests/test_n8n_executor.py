from __future__ import annotations

import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))

from ai_automation_orchestrator.n8n_executor import WorkflowExecutor
from ai_automation_orchestrator.n8n_models import N8nWorkflow


class N8nExecutorTests(unittest.IsolatedAsyncioTestCase):
    async def test_executor_streams_with_supplied_execution_id(self) -> None:
        workflow = N8nWorkflow(
            id="workflow-1",
            name="Executor test",
            nodes=[
                {
                    "id": "trigger",
                    "name": "Manual Trigger",
                    "type": "n8n-nodes-base.manualTrigger",
                    "typeVersion": 1,
                    "position": [0, 0],
                    "parameters": {},
                },
                {
                    "id": "prompt",
                    "name": "AI Prompt",
                    "type": "orca-nodes-base.aiPrompt",
                    "typeVersion": 1,
                    "position": [220, 0],
                    "parameters": {"prompt": "Summarize this"},
                },
            ],
            connections={
                "Manual Trigger": {
                    "main": [[{"node": "AI Prompt", "type": "main", "index": 0}]]
                }
            },
        )

        executor = WorkflowExecutor()
        updates = [
            update
            async for update in executor.execute_workflow(
                workflow,
                input_data={"customer": "GetUpSoft"},
                execution_id="exec-test",
            )
        ]

        self.assertTrue(updates)
        self.assertTrue(all(update["execution_id"] == "exec-test" for update in updates))
        self.assertEqual(updates[-1]["status"], "completed")
        self.assertEqual(updates[-1]["successful"], 2)
        self.assertIn("exec-test", executor.executions)
