"""FastAPI endpoints for Workspace Management."""

from __future__ import annotations

from pathlib import Path
from typing import Any

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

from ai_automation_orchestrator.workspace_manager import WorkspaceManager


class FileReadRequest(BaseModel):
    path: str = Field(min_length=1)


class FileWriteRequest(BaseModel):
    path: str = Field(min_length=1)
    content: str
    create_dirs: bool = True


class FileDeleteRequest(BaseModel):
    path: str = Field(min_length=1)


class GitCommitRequest(BaseModel):
    message: str = Field(min_length=1)
    files: list[str] | None = None


class GitPushRequest(BaseModel):
    branch: str = "main"
    force: bool = False


class GitPullRequest(BaseModel):
    branch: str = "main"


class CommandExecuteRequest(BaseModel):
    command: str = Field(min_length=1)
    cwd: str | None = None
    timeout: int = 300


def register_workspace_endpoints(app: FastAPI) -> None:
    """Register workspace management endpoints."""

    # Inicializar el manager
    try:
        manager = WorkspaceManager()
    except ValueError:
        manager = None

    @app.get("/api/workspace/status")
    def workspace_status() -> dict[str, Any]:
        """Get workspace and git status."""
        if manager is None:
            raise HTTPException(status_code=503, detail="Workspace not initialized")

        return {
            "workspace_root": str(manager.workspace_root),
            "initialized": True,
            "git": manager.git_status(),
        }

    @app.get("/api/workspace/files")
    def list_workspace_files(path: str = ".") -> dict[str, Any]:
        """List files in workspace directory.

        Args:
            path: Relative path within workspace
        """
        if manager is None:
            raise HTTPException(status_code=503, detail="Workspace not initialized")

        try:
            files = manager.list_files(path)
            return {"path": path, "files": files}
        except FileNotFoundError as e:
            raise HTTPException(status_code=404, detail=str(e))
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    @app.post("/api/workspace/files/read")
    def read_file(request: FileReadRequest) -> dict[str, Any]:
        """Read a file from workspace."""
        if manager is None:
            raise HTTPException(status_code=503, detail="Workspace not initialized")

        try:
            content = manager.read_file(request.path)
            return {"path": request.path, "content": content}
        except FileNotFoundError as e:
            raise HTTPException(status_code=404, detail=str(e))
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    @app.post("/api/workspace/files/write")
    def write_file(request: FileWriteRequest) -> dict[str, Any]:
        """Write or modify a file in workspace."""
        if manager is None:
            raise HTTPException(status_code=503, detail="Workspace not initialized")

        try:
            manager.write_file(request.path, request.content, request.create_dirs)
            return {"success": True, "path": request.path}
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    @app.post("/api/workspace/files/delete")
    def delete_file(request: FileDeleteRequest) -> dict[str, Any]:
        """Delete a file from workspace."""
        if manager is None:
            raise HTTPException(status_code=503, detail="Workspace not initialized")

        try:
            manager.delete_file(request.path)
            return {"success": True, "path": request.path}
        except FileNotFoundError as e:
            raise HTTPException(status_code=404, detail=str(e))
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    @app.post("/api/workspace/git/commit")
    def git_commit(request: GitCommitRequest) -> dict[str, Any]:
        """Create a git commit."""
        if manager is None:
            raise HTTPException(status_code=503, detail="Workspace not initialized")

        result = manager.git_commit(request.message, request.files)
        if not result["success"]:
            raise HTTPException(status_code=400, detail=result.get("error"))

        return result

    @app.post("/api/workspace/git/push")
    def git_push(request: GitPushRequest) -> dict[str, Any]:
        """Push commits to remote."""
        if manager is None:
            raise HTTPException(status_code=503, detail="Workspace not initialized")

        result = manager.git_push(request.branch, request.force)
        if not result["success"]:
            raise HTTPException(status_code=400, detail=result.get("error"))

        return result

    @app.post("/api/workspace/git/pull")
    def git_pull(request: GitPullRequest) -> dict[str, Any]:
        """Pull changes from remote."""
        if manager is None:
            raise HTTPException(status_code=503, detail="Workspace not initialized")

        result = manager.git_pull(request.branch)
        if not result["success"]:
            raise HTTPException(status_code=400, detail=result.get("error"))

        return result

    @app.post("/api/workspace/execute")
    def execute_command(request: CommandExecuteRequest) -> dict[str, Any]:
        """Execute a shell command in workspace."""
        if manager is None:
            raise HTTPException(status_code=503, detail="Workspace not initialized")

        # Whitelist of allowed commands for safety
        allowed_prefixes = [
            "npm",
            "pnpm",
            "yarn",
            "python",
            "pip",
            "git",
            "docker",
            "make",
            "bash",
            "sh",
        ]

        cmd_prefix = request.command.split()[0].lower()
        if not any(cmd_prefix.startswith(prefix) for prefix in allowed_prefixes):
            raise HTTPException(
                status_code=403,
                detail=f"Command '{cmd_prefix}' not in whitelist. Allowed: {', '.join(allowed_prefixes)}",
            )

        result = manager.execute_command(request.command, request.cwd, request.timeout)
        if not result.get("success"):
            raise HTTPException(status_code=400, detail=result.get("error"))

        return result

    @app.get("/api/workspace/logs")
    def get_operations_log() -> dict[str, Any]:
        """Get log of all workspace operations."""
        if manager is None:
            raise HTTPException(status_code=503, detail="Workspace not initialized")

        return {"operations": manager.get_operations_log()}
