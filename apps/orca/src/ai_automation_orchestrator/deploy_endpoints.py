"""FastAPI endpoints for Deploy Copilot."""

from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import List, Optional
import logging

from .deploy_copilot import DeployCopilot, DeployRecord

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/deploy", tags=["deploy"])

# Global copilot instance
copilot: Optional[DeployCopilot] = None


def init_copilot(workspace_root: str = "/home/ubuntu/workspaces/GetUpSoft_Workspace"):
    """Initialize the deploy copilot."""
    global copilot
    copilot = DeployCopilot(workspace_root)


class DeployRequest(BaseModel):
    """Deploy request."""
    target: str = "dev"  # dev, staging, prod


class VersionBumpRequest(BaseModel):
    """Version bump request."""
    bump_type: str = "patch"  # major, minor, patch


class ProjectStatus(BaseModel):
    """Project status response."""
    id: str
    name: str
    version: str
    status: str
    health_url: str


class DeployStatus(BaseModel):
    """Deployment status response."""
    project_id: str
    project_name: str
    version: str
    target: str
    timestamp: str
    status: str
    logs: str
    duration_seconds: float


@router.get("/projects", response_model=List[ProjectStatus])
async def get_projects():
    """Get list of all deployable projects."""
    if not copilot:
        raise HTTPException(status_code=503, detail="Deploy Copilot not initialized")

    try:
        projects = copilot.list_projects()
        return projects
    except Exception as e:
        logger.error(f"Failed to list projects: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{project_id}/status", response_model=ProjectStatus)
async def get_project_status(project_id: str):
    """Get current status of a project."""
    if not copilot:
        raise HTTPException(status_code=503, detail="Deploy Copilot not initialized")

    try:
        projects = copilot.list_projects()
        project = next((p for p in projects if p["id"] == project_id), None)
        if not project:
            raise HTTPException(status_code=404, detail=f"Project not found: {project_id}")
        return project
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get project status: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{project_id}/deploy", response_model=DeployStatus)
async def deploy_project(project_id: str, request: DeployRequest, background_tasks: BackgroundTasks):
    """Deploy a project."""
    if not copilot:
        raise HTTPException(status_code=503, detail="Deploy Copilot not initialized")

    try:
        record = copilot.deploy(project_id, request.target)
        return DeployStatus(**{**vars(record)})
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Deployment failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{project_id}/rollback", response_model=DeployStatus)
async def rollback_project(project_id: str):
    """Rollback to last successful deployment."""
    if not copilot:
        raise HTTPException(status_code=503, detail="Deploy Copilot not initialized")

    try:
        record = copilot.rollback(project_id)
        return DeployStatus(**{**vars(record)})
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Rollback failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{project_id}/health")
async def health_check(project_id: str):
    """Check health of deployed service."""
    if not copilot:
        raise HTTPException(status_code=503, detail="Deploy Copilot not initialized")

    try:
        status = copilot._check_health(project_id)
        return {"project_id": project_id, "status": status}
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{project_id}/bump-version")
async def bump_version(project_id: str, request: VersionBumpRequest):
    """Bump project version."""
    if not copilot:
        raise HTTPException(status_code=503, detail="Deploy Copilot not initialized")

    try:
        new_version = copilot.bump_version(project_id, request.bump_type)
        return {"project_id": project_id, "new_version": new_version}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Version bump failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/history")
async def get_deployment_history(project_id: Optional[str] = None, limit: int = 50):
    """Get deployment history."""
    if not copilot:
        raise HTTPException(status_code=503, detail="Deploy Copilot not initialized")

    try:
        records = copilot.get_history(project_id, limit)
        return [DeployStatus(**{**vars(record)}) for record in records]
    except Exception as e:
        logger.error(f"Failed to get history: {e}")
        raise HTTPException(status_code=500, detail=str(e))


def register_deploy_endpoints(app, workspace_root: str = "/home/ubuntu/workspaces/GetUpSoft_Workspace"):
    """Register deploy endpoints with FastAPI app."""
    init_copilot(workspace_root)
    app.include_router(router)
