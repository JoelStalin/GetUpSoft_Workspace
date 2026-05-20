"""n8n API endpoints for workflow management."""

from __future__ import annotations

import json
import uuid
import asyncio
from datetime import UTC, datetime
from pathlib import Path
from typing import Any, AsyncGenerator
from collections import deque

from fastapi import APIRouter, HTTPException, UploadFile, File
from fastapi.responses import FileResponse, StreamingResponse

from ai_automation_orchestrator.n8n_models import (
    N8nWorkflow,
    N8nNode,
    N8nNodeType,
    NODE_TYPE_CATALOG,
    WorkflowGenerateRequest,
    WorkflowDirectoryImportRequest,
)
from ai_automation_orchestrator.n8n_executor import WorkflowExecutor
from ai_automation_orchestrator.n8n_importer import import_n8n_workflow_directory

router = APIRouter(prefix="/api/n8n", tags=["n8n-workflows"])

# In-memory store for now; persist to JSON file
_WORKFLOWS_FILE = Path("data/n8n_workflows.json")
_WORKFLOWS_FILE.parent.mkdir(exist_ok=True)

# Workflow executor and execution tracking
_executor = WorkflowExecutor()
_executions: dict[str, dict] = {}  # execution_id -> {"state": ExecutionState, "logs": deque}


def _get_execution_logs(execution_id: str) -> deque:
    """Get or create execution logs queue."""
    if execution_id not in _executions:
        _executions[execution_id] = {
            "state": None,
            "logs": deque(maxlen=1000),
        }
    return _executions[execution_id]["logs"]


def _load_workflows() -> dict[str, N8nWorkflow]:
    """Load workflows from JSON file."""
    if not _WORKFLOWS_FILE.exists():
        return {}
    try:
        with open(_WORKFLOWS_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
            return {
                wf_id: N8nWorkflow(**wf_data)
                for wf_id, wf_data in data.items()
            }
    except (json.JSONDecodeError, ValueError):
        return {}


def _save_workflows(workflows: dict[str, N8nWorkflow]) -> None:
    """Save workflows to JSON file."""
    data = {
        wf_id: wf.model_dump(mode="json")
        for wf_id, wf in workflows.items()
    }
    with open(_WORKFLOWS_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)


@router.get("/node-types")
async def get_node_types() -> dict[str, N8nNodeType]:
    """List all available node types in Orca."""
    return NODE_TYPE_CATALOG


@router.get("/workflows")
async def list_workflows(limit: int = 50, offset: int = 0) -> dict[str, Any]:
    """List all workflows."""
    workflows = _load_workflows()
    total = len(workflows)
    items = list(workflows.values())[offset : offset + limit]
    return {
        "total": total,
        "items": [w.model_dump(mode="json") for w in items],
        "offset": offset,
        "limit": limit,
    }


@router.post("/workflows")
async def create_workflow(workflow: N8nWorkflow) -> dict[str, Any]:
    """Create or update a workflow."""
    if not workflow.id:
        workflow.id = str(uuid.uuid4())

    workflow.updatedAt = datetime.utcnow().isoformat()

    workflows = _load_workflows()
    workflows[workflow.id] = workflow
    _save_workflows(workflows)

    return {
        "id": workflow.id,
        "name": workflow.name,
        "created": workflow.createdAt,
        "updated": workflow.updatedAt,
    }


@router.get("/workflows/{workflow_id}")
async def get_workflow(workflow_id: str) -> dict[str, Any]:
    """Get a workflow by ID."""
    workflows = _load_workflows()
    workflow = workflows.get(workflow_id)
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")
    return workflow.model_dump(mode="json")


@router.put("/workflows/{workflow_id}")
async def update_workflow(workflow_id: str, workflow: N8nWorkflow) -> dict[str, Any]:
    """Update an existing workflow."""
    workflow.id = workflow_id
    workflow.updatedAt = datetime.utcnow().isoformat()

    workflows = _load_workflows()
    workflows[workflow_id] = workflow
    _save_workflows(workflows)

    return {
        "id": workflow.id,
        "name": workflow.name,
        "updated": workflow.updatedAt,
    }


@router.delete("/workflows/{workflow_id}")
async def delete_workflow(workflow_id: str) -> dict[str, str]:
    """Delete a workflow."""
    workflows = _load_workflows()
    if workflow_id not in workflows:
        raise HTTPException(status_code=404, detail="Workflow not found")

    del workflows[workflow_id]
    _save_workflows(workflows)

    return {"message": "Workflow deleted"}


@router.get("/workflows/{workflow_id}/export")
async def export_workflow(workflow_id: str) -> FileResponse:
    """Export a workflow as n8n JSON."""
    workflows = _load_workflows()
    workflow = workflows.get(workflow_id)
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")

    # Create temp file with n8n JSON
    export_file = Path("data") / f"{workflow_id}.json"
    with open(export_file, "w", encoding="utf-8") as f:
        json.dump(workflow.to_json_dict(), f, indent=2, ensure_ascii=False)

    return FileResponse(
        export_file,
        media_type="application/json",
        filename=f"{workflow.name}.json",
    )


@router.post("/import")
async def import_workflow(file: UploadFile = File(...)) -> dict[str, Any]:
    """Import a workflow from n8n JSON file."""
    try:
        content = await file.read()
        data = json.loads(content.decode("utf-8"))
        workflow = N8nWorkflow(**data)

        # Ensure unique ID
        if not workflow.id:
            workflow.id = str(uuid.uuid4())

        workflows = _load_workflows()
        workflows[workflow.id] = workflow
        _save_workflows(workflows)

        return {
            "id": workflow.id,
            "name": workflow.name,
            "node_count": len(workflow.nodes),
            "message": "Workflow imported successfully",
        }
    except (json.JSONDecodeError, ValueError) as e:
        raise HTTPException(
            status_code=400, detail=f"Invalid JSON or schema: {str(e)}"
        )


@router.post("/import-directory")
async def import_workflow_directory(request: WorkflowDirectoryImportRequest) -> dict[str, Any]:
    """Import all valid n8n workflow JSON files from a local directory."""
    try:
        source_path = Path(request.source_path).expanduser().resolve()
        workflows = _load_workflows()
        result = import_n8n_workflow_directory(
            source_path,
            workflows,
            limit=request.limit,
            dry_run=request.dry_run,
        )
        if not request.dry_run:
            _save_workflows(result["workflows"])
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    result.pop("workflows", None)
    return result


@router.post("/workflows/{workflow_id}/run")
async def run_workflow(
    workflow_id: str, body: dict | None = None
) -> dict[str, Any]:
    """Execute a workflow (async, returns execution ID)."""
    workflows = _load_workflows()
    workflow = workflows.get(workflow_id)
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")

    execution_id = str(uuid.uuid4())
    logs = _get_execution_logs(execution_id)
    input_data = (body or {}).get("input_data", {}) if body else {}

    async def execute_and_log():
        """Execute workflow and collect logs."""
        try:
            async for update in _executor.execute_workflow(
                workflow,
                input_data=input_data,
                execution_id=execution_id,
            ):
                logs.append(update)
        except Exception as e:
            logs.append({
                "execution_id": execution_id,
                "workflow_id": workflow_id,
                "status": "error",
                "error": str(e),
                "timestamp": datetime.now(UTC).isoformat(),
            })

    # Start execution in background
    asyncio.create_task(execute_and_log())

    return {
        "execution_id": execution_id,
        "workflow_id": workflow_id,
        "status": "running",
        "message": "Workflow execution started",
    }


@router.get("/workflows/{workflow_id}/executions")
async def get_workflow_executions(workflow_id: str) -> dict[str, Any]:
    """Get execution history for a workflow."""
    workflows = _load_workflows()
    if workflow_id not in workflows:
        raise HTTPException(status_code=404, detail="Workflow not found")

    # TODO: Return execution history from database
    return {
        "workflow_id": workflow_id,
        "executions": [],
    }


@router.get("/executions/{execution_id}")
async def get_execution_status(execution_id: str) -> dict[str, Any]:
    """Get the status and logs of an execution."""
    if execution_id not in _executions:
        raise HTTPException(status_code=404, detail="Execution not found")

    data = _executions[execution_id]
    logs = list(data["logs"])

    # Determine overall status from logs
    status = "pending"
    if logs:
        last = logs[-1]
        status = last.get("status", "pending")

    return {
        "execution_id": execution_id,
        "status": status,
        "logs": logs,
        "log_count": len(logs),
    }


@router.get("/executions/{execution_id}/stream")
async def stream_execution_logs(execution_id: str) -> StreamingResponse:
    """Stream execution logs as server-sent events (SSE)."""
    if execution_id not in _executions:
        raise HTTPException(status_code=404, detail="Execution not found")

    async def event_generator() -> AsyncGenerator[str, None]:
        """Generate SSE events from execution logs."""
        seen = set()
        max_retries = 300  # 5 minutes at 1 second intervals

        for _ in range(max_retries):
            logs = _executions[execution_id]["logs"]

            # Send all new logs
            for log_entry in logs:
                log_id = id(log_entry)
                if log_id not in seen:
                    seen.add(log_id)
                    yield f"data: {json.dumps(log_entry)}\n\n"

            # Check if execution is complete
            if logs:
                last_status = logs[-1].get("status")
                if last_status in ("completed", "failed", "error"):
                    yield f"data: {json.dumps({'status': 'done'})}\n\n"
                    break

            await asyncio.sleep(0.1)

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )


@router.post("/generate")
async def generate_workflow_from_prompt(request: WorkflowGenerateRequest) -> dict[str, Any]:
    """Generate a workflow from a natural language prompt."""
    from ai_automation_orchestrator.n8n_generator import generate_n8n_workflow

    try:
        workflow = await generate_n8n_workflow(
            prompt=request.prompt,
            model_id=request.model_id,
            context=request.context,
        )

        workflows = _load_workflows()
        workflows[workflow.id] = workflow
        _save_workflows(workflows)

        return {
            "workflow_id": workflow.id,
            "name": workflow.name,
            "node_count": len(workflow.nodes),
            "workflow": workflow.model_dump(mode="json"),
        }
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to generate workflow: {str(e)}"
        )


def register_n8n_endpoints(app: Any) -> None:
    """Register n8n workflow API endpoints."""
    from fastapi import FastAPI
    app.include_router(router)
