"""Deploy Copilot - Centralized deployment management for GetUpSoft Workspace."""

import json
import subprocess
import os
from datetime import datetime
from pathlib import Path
from dataclasses import dataclass, asdict
from typing import List, Optional, Dict, Any
import logging

logger = logging.getLogger(__name__)


@dataclass
class DeployRecord:
    """Record of a deployment."""
    project_id: str
    project_name: str
    version: str
    target: str  # dev, staging, prod
    timestamp: str
    status: str  # pending, in_progress, success, failed
    logs: str = ""
    duration_seconds: float = 0.0


@dataclass
class DeployProject:
    """Metadata for a deployable project."""
    id: str
    name: str
    path: str
    deploy_type: str  # docker, kubernetes, custom
    deploy_script: str
    health_url: str
    version_file: str  # Path to version file (pyproject.toml, package.json, etc)


class DeployCopilot:
    """Centralized deployment copilot for GetUpSoft Workspace."""

    PROJECTS = {
        "orca": DeployProject(
            id="orca",
            name="ORCA AI Orchestrator",
            path="03_AI_Automation/orca",
            deploy_type="docker",
            deploy_script="deploy/deploy.sh",
            health_url="http://localhost:8015/health",
            version_file="03_AI_Automation/orca/pyproject.toml",
        ),
        "getupsoft-site": DeployProject(
            id="getupsoft-site",
            name="GetUpSoft Website",
            path="01_Core_Platform/getupsoft-site",
            deploy_type="docker",
            deploy_script="deploy/deploy.sh",
            health_url="http://localhost:3120/health",
            version_file="01_Core_Platform/getupsoft-site/package.json",
        ),
        "miniverse": DeployProject(
            id="miniverse",
            name="Miniverse Image Processing",
            path="miniverse",
            deploy_type="docker",
            deploy_script="deploy/deploy.sh",
            health_url="http://localhost:3000/health",
            version_file="miniverse/package.json",
        ),
    }

    def __init__(self, workspace_root: str = "/home/ubuntu/workspaces/GetUpSoft_Workspace"):
        """Initialize Deploy Copilot."""
        self.workspace_root = workspace_root
        self.history_file = Path(workspace_root) / ".deploy_history.json"
        self.history: List[DeployRecord] = self._load_history()

    def _load_history(self) -> List[DeployRecord]:
        """Load deployment history from disk."""
        if self.history_file.exists():
            try:
                with open(self.history_file) as f:
                    data = json.load(f)
                    return [DeployRecord(**record) for record in data]
            except Exception as e:
                logger.warning(f"Failed to load history: {e}")
        return []

    def _save_history(self) -> None:
        """Save deployment history to disk."""
        try:
            with open(self.history_file, "w") as f:
                json.dump([asdict(record) for record in self.history], f, indent=2)
        except Exception as e:
            logger.error(f"Failed to save history: {e}")

    def list_projects(self) -> List[Dict[str, Any]]:
        """List all deployable projects with current status and version."""
        projects = []
        for project_id, project in self.PROJECTS.items():
            version = self._get_version(project_id)
            status = self._check_health(project_id)
            projects.append({
                "id": project_id,
                "name": project.name,
                "version": version,
                "status": status,
                "health_url": project.health_url,
            })
        return projects

    def _get_version(self, project_id: str) -> str:
        """Extract version from project metadata file."""
        project = self.PROJECTS.get(project_id)
        if not project:
            return "unknown"

        version_path = Path(self.workspace_root) / project.version_file
        try:
            if not version_path.exists():
                return "unknown"

            with open(version_path) as f:
                content = f.read()

                # For pyproject.toml
                if "pyproject.toml" in str(version_path):
                    import re
                    match = re.search(r'version\s*=\s*"([^"]+)"', content)
                    if match:
                        return match.group(1)

                # For package.json
                if "package.json" in str(version_path):
                    import json as json_mod
                    data = json_mod.loads(content)
                    return data.get("version", "unknown")
        except Exception as e:
            logger.warning(f"Failed to get version for {project_id}: {e}")

        return "unknown"

    def _check_health(self, project_id: str) -> str:
        """Check health endpoint of deployed service."""
        project = self.PROJECTS.get(project_id)
        if not project:
            return "unknown"

        try:
            import requests
            response = requests.get(project.health_url, timeout=5)
            if response.status_code == 200:
                return "healthy"
            return "unhealthy"
        except Exception:
            return "unreachable"

    def deploy(self, project_id: str, target: str = "dev") -> DeployRecord:
        """Deploy a project to target environment."""
        project = self.PROJECTS.get(project_id)
        if not project:
            raise ValueError(f"Unknown project: {project_id}")

        record = DeployRecord(
            project_id=project_id,
            project_name=project.name,
            version=self._get_version(project_id),
            target=target,
            timestamp=datetime.utcnow().isoformat(),
            status="in_progress",
        )

        start_time = datetime.utcnow()

        try:
            # Execute deploy script
            script_path = Path(self.workspace_root) / project.path / project.deploy_script

            if not script_path.exists():
                raise FileNotFoundError(f"Deploy script not found: {script_path}")

            result = subprocess.run(
                ["bash", str(script_path), target],
                cwd=str(Path(self.workspace_root) / project.path),
                capture_output=True,
                text=True,
                timeout=600,
            )

            record.logs = result.stdout + "\n" + result.stderr

            if result.returncode == 0:
                record.status = "success"
            else:
                record.status = "failed"

        except subprocess.TimeoutExpired:
            record.status = "failed"
            record.logs = "Deployment timeout after 600 seconds"
        except Exception as e:
            record.status = "failed"
            record.logs = f"Deployment error: {str(e)}"

        record.duration_seconds = (datetime.utcnow() - start_time).total_seconds()

        # Health check
        if record.status == "success":
            import time
            time.sleep(5)  # Wait for service to be ready
            if self._check_health(project_id) == "healthy":
                record.logs += "\n✓ Health check passed"
            else:
                record.logs += "\n⚠ Health check failed - service may not be ready"

        self.history.append(record)
        self._save_history()

        return record

    def rollback(self, project_id: str) -> DeployRecord:
        """Rollback to last successful deployment."""
        # Find last successful deployment
        successful = [r for r in reversed(self.history)
                     if r.project_id == project_id and r.status == "success"]

        if not successful:
            raise ValueError(f"No successful deployment found for {project_id}")

        last_success = successful[0]
        logger.info(f"Rolling back {project_id} to {last_success.version}")

        # Re-deploy from git tag if available
        return self.deploy(project_id, target=last_success.target)

    def get_history(self, project_id: Optional[str] = None, limit: int = 50) -> List[DeployRecord]:
        """Get deployment history."""
        history = self.history
        if project_id:
            history = [r for r in history if r.project_id == project_id]
        return history[-limit:]

    def bump_version(self, project_id: str, bump_type: str = "patch") -> str:
        """Bump version (major, minor, patch)."""
        import re
        from subprocess import CalledProcessError

        project = self.PROJECTS.get(project_id)
        if not project:
            raise ValueError(f"Unknown project: {project_id}")

        current_version = self._get_version(project_id)

        try:
            parts = current_version.split(".")
            if len(parts) < 3:
                raise ValueError(f"Invalid version format: {current_version}")

            major, minor, patch = int(parts[0]), int(parts[1]), int(parts[2])

            if bump_type == "major":
                major += 1
                minor = patch = 0
            elif bump_type == "minor":
                minor += 1
                patch = 0
            elif bump_type == "patch":
                patch += 1
            else:
                raise ValueError(f"Invalid bump type: {bump_type}")

            new_version = f"{major}.{minor}.{patch}"

            # Update version file
            version_path = Path(self.workspace_root) / project.version_file
            with open(version_path) as f:
                content = f.read()

            if "pyproject.toml" in str(version_path):
                content = re.sub(
                    r'version\s*=\s*"[^"]+"',
                    f'version = "{new_version}"',
                    content
                )
            elif "package.json" in str(version_path):
                content = re.sub(
                    r'"version"\s*:\s*"[^"]+"',
                    f'"version": "{new_version}"',
                    content
                )

            with open(version_path, "w") as f:
                f.write(content)

            # Create git tag
            subprocess.run(
                ["git", "tag", f"{project_id}-v{new_version}"],
                cwd=self.workspace_root,
                check=True,
            )

            return new_version

        except (CalledProcessError, ValueError) as e:
            logger.error(f"Failed to bump version: {e}")
            raise
