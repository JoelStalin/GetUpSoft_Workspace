from __future__ import annotations

import asyncio
import json
import os
import shutil
import tempfile
import unittest
from pathlib import Path

from ai_automation_orchestrator.n8n_executor import WorkflowExecutor
from ai_automation_orchestrator.n8n_importer import load_n8n_workflow_file


class DrivePublicationWorkflowTests(unittest.TestCase):
    def test_import_and_execute_drive_publication_workflow(self) -> None:
        workspace_root = Path(__file__).resolve().parents[3]
        workflow_path = (
            workspace_root
            / "06_E_Commerce_Lux"
            / "Galantesjewelry"
            / "Galantesjewelry"
            / "automation"
            / "n8n"
            / "google-drive-product-publication-workflow.json"
        )
        fixture_sources = [
            workspace_root / "apps" / "orca" / "workflow-editor" / "orca_interface_loaded.png",
            workspace_root / "apps" / "orca" / "workflow-editor" / "workflow_with_nodes.png",
            workspace_root / "apps" / "orca" / "workflow-editor" / "final_02_components.png",
        ]

        with tempfile.TemporaryDirectory() as temp_dir:
            temp_root = Path(temp_dir)
            source_root = temp_root / "drive-fixture"
            ring_set = source_root / "ring-set"
            necklace_set = source_root / "necklace-set"
            ring_set.mkdir(parents=True, exist_ok=True)
            necklace_set.mkdir(parents=True, exist_ok=True)

            shutil.copy2(fixture_sources[0], ring_set / "20260701_120000.png")
            shutil.copy2(fixture_sources[1], ring_set / "20260701_120615.png")
            shutil.copy2(fixture_sources[2], necklace_set / "20260701_121500.png")

            scan_out = temp_root / "scan.json"
            manifest_out = temp_root / "manifest.json"

            workflow = load_n8n_workflow_file(workflow_path)
            executor = WorkflowExecutor()

            previous_real = os.environ.get("ORCA_REAL_COMMANDS")
            os.environ["ORCA_REAL_COMMANDS"] = "1"
            try:
                async def run_workflow():
                    return [
                        update
                        async for update in executor.execute_workflow(
                            workflow,
                            input_data={
                                "workspaceRoot": str(workspace_root / "06_E_Commerce_Lux" / "Galantesjewelry"),
                                "folderId": "local-fixture",
                                "sourcePath": str(source_root),
                                "scanOut": str(scan_out),
                                "manifestOut": str(manifest_out),
                                "publishArgs": "--dry-run",
                                "enhancerCommand": f"node {workspace_root / 'apps' / 'orca' / 'scripts' / 'noop-enhance.mjs'}",
                            },
                            execution_id="orca-drive-publication-test",
                        )
                    ]

                updates = asyncio.run(run_workflow())
            finally:
                if previous_real is None:
                    os.environ.pop("ORCA_REAL_COMMANDS", None)
                else:
                    os.environ["ORCA_REAL_COMMANDS"] = previous_real

            self.assertTrue(updates)
            self.assertEqual(updates[-1]["status"], "completed")
            self.assertTrue(scan_out.exists())
            self.assertTrue(manifest_out.exists())

            scan = json.loads(scan_out.read_text(encoding="utf-8"))
            manifest = json.loads(manifest_out.read_text(encoding="utf-8"))

            self.assertGreaterEqual(scan["totalImages"], 3)
            self.assertGreaterEqual(scan["totalClusters"], 2)
            self.assertGreaterEqual(len(manifest["products"]), 2)

            final_node_updates = [update for update in updates if update.get("node_name") == "Final Evidence"]
            self.assertTrue(final_node_updates)
            self.assertEqual(final_node_updates[-1]["status"], "completed")
            final_stdout = final_node_updates[-1]["result"]["stdout"]
            self.assertIn('"status":"ok"', final_stdout.replace(" ", ""))
