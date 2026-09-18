"""Workflow storage and management."""

import json
from pathlib import Path
from typing import Optional, List, Dict, Any
from datetime import datetime
import uuid

from .n8n_models import N8nWorkflow, WorkflowExecution


class WorkflowStore:
    """Manages workflow storage and retrieval."""

    def __init__(self, storage_path: str = "data/n8n_workflows.json"):
        self.storage_path = Path(storage_path)
        self.storage_path.parent.mkdir(parents=True, exist_ok=True)
        self.workflows: Dict[str, N8nWorkflow] = {}
        self._load_workflows()

    def _load_workflows(self):
        """Load all workflows from storage."""
        if self.storage_path.exists():
            try:
                with open(self.storage_path) as f:
                    data = json.load(f)
                    self.workflows = {
                        wid: N8nWorkflow(**w) for wid, w in data.items()
                    }
            except Exception as e:
                print(f"Warning: Failed to load workflows: {e}")

    def _save_workflows(self):
        """Save all workflows to storage."""
        try:
            with open(self.storage_path, 'w') as f:
                json.dump(
                    {wid: w.model_dump() for wid, w in self.workflows.items()},
                    f,
                    indent=2
                )
        except Exception as e:
            print(f"Error saving workflows: {e}")

    def create_workflow(self, name: str, nodes: List[Any] = None) -> N8nWorkflow:
        """Create a new workflow."""
        workflow = N8nWorkflow(
            id=str(uuid.uuid4()),
            name=name,
            nodes=nodes or []
        )
        self.workflows[workflow.id] = workflow
        self._save_workflows()
        return workflow

    def get_workflow(self, workflow_id: str) -> Optional[N8nWorkflow]:
        """Get workflow by ID."""
        return self.workflows.get(workflow_id)

    def list_workflows(self) -> List[N8nWorkflow]:
        """List all workflows."""
        return list(self.workflows.values())

    def update_workflow(self, workflow_id: str, workflow: N8nWorkflow) -> Optional[N8nWorkflow]:
        """Update existing workflow."""
        if workflow_id not in self.workflows:
            return None
        workflow.updatedAt = datetime.utcnow().isoformat()
        self.workflows[workflow_id] = workflow
        self._save_workflows()
        return workflow

    def delete_workflow(self, workflow_id: str) -> bool:
        """Delete workflow."""
        if workflow_id in self.workflows:
            del self.workflows[workflow_id]
            self._save_workflows()
            return True
        return False


class ExecutionStore:
    """Manages workflow execution history."""

    def __init__(self, storage_path: str = "data/n8n_executions.json"):
        self.storage_path = Path(storage_path)
        self.storage_path.parent.mkdir(parents=True, exist_ok=True)
        self.executions: Dict[str, WorkflowExecution] = {}
        self._load_executions()

    def _load_executions(self):
        """Load all executions from storage."""
        if self.storage_path.exists():
            try:
                with open(self.storage_path) as f:
                    data = json.load(f)
                    self.executions = {
                        eid: WorkflowExecution(**e) for eid, e in data.items()
                    }
            except Exception as e:
                print(f"Warning: Failed to load executions: {e}")

    def _save_executions(self):
        """Save all executions to storage."""
        try:
            with open(self.storage_path, 'w') as f:
                json.dump(
                    {eid: e.model_dump() for eid, e in self.executions.items()},
                    f,
                    indent=2
                )
        except Exception as e:
            print(f"Error saving executions: {e}")

    def create_execution(
        self,
        workflow_id: str,
        user_id: str
    ) -> WorkflowExecution:
        """Create new execution record."""
        execution = WorkflowExecution(
            id=str(uuid.uuid4()),
            workflow_id=workflow_id,
            user_id=user_id,
            status="pending"
        )
        self.executions[execution.id] = execution
        self._save_executions()
        return execution

    def get_execution(self, execution_id: str) -> Optional[WorkflowExecution]:
        """Get execution by ID."""
        return self.executions.get(execution_id)

    def update_execution(self, execution_id: str, execution: WorkflowExecution) -> Optional[WorkflowExecution]:
        """Update execution record."""
        if execution_id not in self.executions:
            return None
        self.executions[execution_id] = execution
        self._save_executions()
        return execution

    def list_executions(self, workflow_id: str) -> List[WorkflowExecution]:
        """List executions for a workflow."""
        return [e for e in self.executions.values() if e.workflow_id == workflow_id]
