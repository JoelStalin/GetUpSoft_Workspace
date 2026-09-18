"""N8n-compatible API endpoints for workflow management."""

from __future__ import annotations

import json
import uuid
from datetime import datetime
from pathlib import Path
from typing import Any, Optional, List

from fastapi import APIRouter, HTTPException, Cookie, File, UploadFile

from .n8n_models import (
    N8nWorkflow,
    N8nNode,
    NodeTypeInfo,
    WorkflowGenerateRequest,
)
from .n8n_store import WorkflowStore, ExecutionStore
from .user_auth import SessionManager

# Node type catalog
NODE_TYPE_CATALOG = {
    "orca-nodes-base.trigger": NodeTypeInfo(
        type="orca-nodes-base.trigger",
        label="Trigger",
        color="#ff6d5a",
        inputs=0,
        outputs=1,
        category="core",
        description="Workflow trigger/start point"
    ),
    "orca-nodes-base.aiPrompt": NodeTypeInfo(
        type="orca-nodes-base.aiPrompt",
        label="AI Prompt",
        color="#7c4dff",
        inputs=1,
        outputs=1,
        category="ai",
        description="Send prompt to AI model"
    ),
    "orca-nodes-base.httpRequest": NodeTypeInfo(
        type="orca-nodes-base.httpRequest",
        label="HTTP Request",
        color="#1a9ba1",
        inputs=1,
        outputs=1,
        category="integration",
        description="Make HTTP API request"
    ),
    "orca-nodes-base.condition": NodeTypeInfo(
        type="orca-nodes-base.condition",
        label="Condition",
        color="#ff9f43",
        inputs=1,
        outputs=2,
        category="logic",
        description="Conditional branching"
    ),
    "orca-nodes-base.loop": NodeTypeInfo(
        type="orca-nodes-base.loop",
        label="Loop",
        color="#10ac84",
        inputs=1,
        outputs=1,
        category="logic",
        description="Loop over items"
    ),
    "orca-nodes-base.setVariable": NodeTypeInfo(
        type="orca-nodes-base.setVariable",
        label="Set Variable",
        color="#576574",
        inputs=1,
        outputs=1,
        category="utility",
        description="Set workflow variables"
    ),
    "orca-nodes-base.executeCommand": NodeTypeInfo(
        type="orca-nodes-base.executeCommand",
        label="Execute",
        color="#ee5a24",
        inputs=1,
        outputs=1,
        category="execution",
        description="Execute system command"
    ),
    "orca-nodes-base.end": NodeTypeInfo(
        type="orca-nodes-base.end",
        label="End",
        color="#353b48",
        inputs=1,
        outputs=0,
        category="core",
        description="Workflow end point"
    ),
}

# Initialize stores
workflow_store = WorkflowStore("data/n8n_workflows.json")
execution_store = ExecutionStore("data/n8n_executions.json")
session_manager: Optional[SessionManager] = None

router = APIRouter(prefix="/api/n8n", tags=["n8n-workflows"])


def set_session_manager(mgr: SessionManager):
    """Set the session manager for authentication."""
    global session_manager
    session_manager = mgr


def _require_auth(session_id: Optional[str]) -> str:
    """Validate session and return user_id."""
    if not session_id or not session_manager:
        raise HTTPException(status_code=401, detail="Not authenticated")
    user_id = session_manager.validate_session(session_id)
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid session")
    return user_id


@router.get("/node-types")
def get_node_types(session_id: str = Cookie(None)):
    """Get available node types."""
    _require_auth(session_id)
    return {
        "types": [t.model_dump() for t in NODE_TYPE_CATALOG.values()],
        "count": len(NODE_TYPE_CATALOG)
    }


@router.get("/workflows")
def list_workflows(session_id: str = Cookie(None)):
    """List all workflows."""
    _require_auth(session_id)
    workflows = workflow_store.list_workflows()
    return {
        "workflows": [w.model_dump() for w in workflows],
        "count": len(workflows)
    }


@router.post("/workflows")
def create_workflow(workflow: N8nWorkflow, session_id: str = Cookie(None)):
    """Create a new workflow."""
    user_id = _require_auth(session_id)
    workflow.id = str(uuid.uuid4())
    workflow.createdAt = datetime.utcnow().isoformat()
    workflow.updatedAt = datetime.utcnow().isoformat()
    workflow.orca_meta["user_id"] = user_id
    saved = workflow_store.create_workflow(workflow.name, workflow.nodes)
    workflow_store.update_workflow(saved.id, workflow)
    return {"workflow": workflow.model_dump(), "message": "Workflow created"}


@router.get("/workflows/{workflow_id}")
def get_workflow(workflow_id: str, session_id: str = Cookie(None)):
    """Get workflow by ID."""
    _require_auth(session_id)
    workflow = workflow_store.get_workflow(workflow_id)
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")
    return {"workflow": workflow.model_dump()}


@router.put("/workflows/{workflow_id}")
def update_workflow(workflow_id: str, workflow: N8nWorkflow, session_id: str = Cookie(None)):
    """Update workflow."""
    user_id = _require_auth(session_id)
    existing = workflow_store.get_workflow(workflow_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Workflow not found")
    workflow.id = workflow_id
    workflow.updatedAt = datetime.utcnow().isoformat()
    workflow.orca_meta["user_id"] = user_id
    updated = workflow_store.update_workflow(workflow_id, workflow)
    return {"workflow": updated.model_dump(), "message": "Workflow updated"}


@router.delete("/workflows/{workflow_id}")
def delete_workflow(workflow_id: str, session_id: str = Cookie(None)):
    """Delete workflow."""
    _require_auth(session_id)
    if not workflow_store.delete_workflow(workflow_id):
        raise HTTPException(status_code=404, detail="Workflow not found")
    return {"message": f"Workflow {workflow_id} deleted"}


@router.post("/workflows/{workflow_id}/run")
def run_workflow(workflow_id: str, session_id: str = Cookie(None)):
    """Execute workflow."""
    user_id = _require_auth(session_id)
    workflow = workflow_store.get_workflow(workflow_id)
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")
    execution = execution_store.create_execution(workflow_id, user_id)
    execution.status = "pending"
    execution_store.update_execution(execution.id, execution)
    return {
        "execution_id": execution.id,
        "status": "pending",
        "message": "Workflow execution started"
    }


def register_n8n_endpoints(app, mgr: Optional[SessionManager] = None):
    """Register n8n endpoints with FastAPI app."""
    if mgr:
        set_session_manager(mgr)
    app.include_router(router)
