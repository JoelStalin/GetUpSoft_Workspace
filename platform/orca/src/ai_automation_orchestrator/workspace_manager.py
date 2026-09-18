"""Workspace Management — permitir a Orca modificar archivos y ejecutar operaciones git."""

from __future__ import annotations

import os
import subprocess
from dataclasses import dataclass, field
from datetime import datetime
from pathlib import Path
from typing import Any

import httpx


@dataclass
class FileOperation:
    """Registro de una operación de archivo."""

    path: str
    operation: str  # "create", "modify", "delete", "read"
    timestamp: str = field(default_factory=lambda: datetime.now().isoformat())
    success: bool = True
    message: str = ""


@dataclass
class GitOperation:
    """Registro de una operación git."""

    command: str  # "commit", "push", "pull", "branch", etc.
    branch: str
    timestamp: str = field(default_factory=lambda: datetime.now().isoformat())
    success: bool = True
    message: str = ""
    files_changed: int = 0


class WorkspaceManager:
    """Gestor centralizado del workspace GetUpSoft."""

    def __init__(self, workspace_root: Path | str | None = None) -> None:
        """Inicializar el manager.

        Args:
            workspace_root: Ruta raíz del workspace. Si no se proporciona,
                          busca la carpeta padre que contenga .git
        """
        if workspace_root is None:
            # Buscar .git hacia arriba
            current = Path.cwd()
            while current != current.parent:
                if (current / ".git").exists():
                    workspace_root = current
                    break
                current = current.parent
            else:
                raise ValueError("No .git repository found in parent directories")

        self.workspace_root = Path(workspace_root)
        self.operations_log: list[FileOperation | GitOperation] = []

    # ========== FILE OPERATIONS ==========

    def read_file(self, relative_path: str) -> str:
        """Leer un archivo del workspace.

        Args:
            relative_path: Ruta relativa al workspace root

        Returns:
            Contenido del archivo

        Raises:
            FileNotFoundError: Si el archivo no existe
        """
        file_path = self.workspace_root / relative_path
        if not file_path.exists():
            raise FileNotFoundError(f"File not found: {relative_path}")

        try:
            content = file_path.read_text(encoding="utf-8")
            self.operations_log.append(
                FileOperation(
                    path=relative_path,
                    operation="read",
                    success=True,
                )
            )
            return content
        except Exception as e:
            self.operations_log.append(
                FileOperation(
                    path=relative_path,
                    operation="read",
                    success=False,
                    message=str(e),
                )
            )
            raise

    def write_file(
        self, relative_path: str, content: str, create_dirs: bool = True
    ) -> None:
        """Escribir o modificar un archivo.

        Args:
            relative_path: Ruta relativa al workspace root
            content: Contenido a escribir
            create_dirs: Si True, crear directorios si no existen
        """
        file_path = self.workspace_root / relative_path

        if create_dirs:
            file_path.parent.mkdir(parents=True, exist_ok=True)

        try:
            file_path.write_text(content, encoding="utf-8")
            operation_type = "create" if not file_path.exists() else "modify"
            self.operations_log.append(
                FileOperation(
                    path=relative_path,
                    operation=operation_type,
                    success=True,
                )
            )
        except Exception as e:
            self.operations_log.append(
                FileOperation(
                    path=relative_path,
                    operation="modify",
                    success=False,
                    message=str(e),
                )
            )
            raise

    def delete_file(self, relative_path: str) -> None:
        """Eliminar un archivo.

        Args:
            relative_path: Ruta relativa al workspace root
        """
        file_path = self.workspace_root / relative_path
        if not file_path.exists():
            raise FileNotFoundError(f"File not found: {relative_path}")

        try:
            file_path.unlink()
            self.operations_log.append(
                FileOperation(
                    path=relative_path,
                    operation="delete",
                    success=True,
                )
            )
        except Exception as e:
            self.operations_log.append(
                FileOperation(
                    path=relative_path,
                    operation="delete",
                    success=False,
                    message=str(e),
                )
            )
            raise

    def list_files(self, relative_path: str = ".") -> list[dict[str, Any]]:
        """Listar archivos en un directorio.

        Args:
            relative_path: Ruta relativa del directorio

        Returns:
            Lista de dicts con info de archivos
        """
        dir_path = self.workspace_root / relative_path
        if not dir_path.exists():
            raise FileNotFoundError(f"Directory not found: {relative_path}")

        files = []
        for item in sorted(dir_path.iterdir()):
            files.append(
                {
                    "name": item.name,
                    "path": str(item.relative_to(self.workspace_root)),
                    "type": "dir" if item.is_dir() else "file",
                    "size": item.stat().st_size if item.is_file() else None,
                }
            )
        return files

    # ========== GIT OPERATIONS ==========

    def git_status(self) -> dict[str, Any]:
        """Obtener estado del repositorio git.

        Returns:
            Dict con status, branch, cambios pendientes
        """
        try:
            # Branch actual
            result = subprocess.run(
                ["git", "rev-parse", "--abbrev-ref", "HEAD"],
                cwd=self.workspace_root,
                capture_output=True,
                text=True,
                timeout=10,
            )
            branch = result.stdout.strip() if result.returncode == 0 else "unknown"

            # Cambios pendientes
            result = subprocess.run(
                ["git", "status", "--porcelain"],
                cwd=self.workspace_root,
                capture_output=True,
                text=True,
                timeout=10,
            )
            changes = result.stdout.strip().split("\n") if result.returncode == 0 else []

            # Commits sin pushear
            result = subprocess.run(
                ["git", "log", "origin/main..HEAD", "--oneline"],
                cwd=self.workspace_root,
                capture_output=True,
                text=True,
                timeout=10,
            )
            unpushed = (
                result.stdout.strip().split("\n") if result.returncode == 0 else []
            )

            return {
                "branch": branch,
                "changes": [c for c in changes if c],
                "unpushed_commits": [c for c in unpushed if c],
                "has_changes": len(changes) > 0 and changes[0] != "",
            }
        except Exception as e:
            return {
                "error": str(e),
                "branch": "unknown",
                "changes": [],
                "has_changes": False,
            }

    def git_commit(self, message: str, files: list[str] | None = None) -> dict[str, Any]:
        """Hacer commit de cambios.

        Args:
            message: Mensaje del commit
            files: Lista de archivos a incluir (None = todos los cambios)

        Returns:
            Dict con resultado del commit
        """
        try:
            # Add files
            if files is None:
                subprocess.run(
                    ["git", "add", "-A"],
                    cwd=self.workspace_root,
                    timeout=30,
                    check=True,
                )
            else:
                for file_path in files:
                    subprocess.run(
                        ["git", "add", file_path],
                        cwd=self.workspace_root,
                        timeout=10,
                        check=True,
                    )

            # Commit
            result = subprocess.run(
                ["git", "commit", "-m", message],
                cwd=self.workspace_root,
                capture_output=True,
                text=True,
                timeout=30,
            )

            success = result.returncode == 0
            self.operations_log.append(
                GitOperation(
                    command="commit",
                    branch=self.git_status().get("branch", "unknown"),
                    success=success,
                    message=result.stdout + result.stderr,
                )
            )

            return {
                "success": success,
                "message": result.stdout,
                "error": result.stderr if not success else None,
            }
        except Exception as e:
            self.operations_log.append(
                GitOperation(
                    command="commit",
                    branch="unknown",
                    success=False,
                    message=str(e),
                )
            )
            return {"success": False, "error": str(e)}

    def git_push(
        self, branch: str = "main", force: bool = False
    ) -> dict[str, Any]:
        """Hacer push de commits.

        Args:
            branch: Rama a pushear
            force: Si True, hacer force push (peligroso)

        Returns:
            Dict con resultado del push
        """
        try:
            cmd = ["git", "push", "origin", branch]
            if force:
                cmd.insert(2, "--force-with-lease")  # Más seguro que --force

            result = subprocess.run(
                cmd,
                cwd=self.workspace_root,
                capture_output=True,
                text=True,
                timeout=60,
            )

            success = result.returncode == 0
            self.operations_log.append(
                GitOperation(
                    command="push",
                    branch=branch,
                    success=success,
                    message=result.stdout + result.stderr,
                )
            )

            return {
                "success": success,
                "message": result.stdout,
                "error": result.stderr if not success else None,
            }
        except Exception as e:
            self.operations_log.append(
                GitOperation(
                    command="push",
                    branch=branch,
                    success=False,
                    message=str(e),
                )
            )
            return {"success": False, "error": str(e)}

    def git_pull(self, branch: str = "main") -> dict[str, Any]:
        """Hacer pull de cambios remotos.

        Args:
            branch: Rama a pullear

        Returns:
            Dict con resultado del pull
        """
        try:
            result = subprocess.run(
                ["git", "pull", "origin", branch],
                cwd=self.workspace_root,
                capture_output=True,
                text=True,
                timeout=60,
            )

            success = result.returncode == 0
            self.operations_log.append(
                GitOperation(
                    command="pull",
                    branch=branch,
                    success=success,
                    message=result.stdout + result.stderr,
                )
            )

            return {
                "success": success,
                "message": result.stdout,
                "error": result.stderr if not success else None,
            }
        except Exception as e:
            self.operations_log.append(
                GitOperation(
                    command="pull",
                    branch=branch,
                    success=False,
                    message=str(e),
                )
            )
            return {"success": False, "error": str(e)}

    # ========== COMMAND EXECUTION ==========

    def execute_command(
        self, command: str, cwd: str | None = None, timeout: int = 300
    ) -> dict[str, Any]:
        """Ejecutar un comando shell en el workspace.

        Args:
            command: Comando a ejecutar (ej: "npm install", "python -m pytest")
            cwd: Directorio donde ejecutar (relativo al workspace root)
            timeout: Timeout en segundos

        Returns:
            Dict con stdout, stderr, returncode
        """
        try:
            working_dir = (
                self.workspace_root / cwd if cwd else self.workspace_root
            )

            result = subprocess.run(
                command,
                shell=True,
                cwd=working_dir,
                capture_output=True,
                text=True,
                timeout=timeout,
            )

            return {
                "success": result.returncode == 0,
                "returncode": result.returncode,
                "stdout": result.stdout,
                "stderr": result.stderr,
            }
        except subprocess.TimeoutExpired:
            return {
                "success": False,
                "error": f"Command timed out after {timeout}s",
            }
        except Exception as e:
            return {"success": False, "error": str(e)}

    # ========== LOGGING ==========

    def get_operations_log(self) -> list[dict[str, Any]]:
        """Obtener log de operaciones realizadas."""
        return [
            {
                "timestamp": op.timestamp,
                "type": "file" if isinstance(op, FileOperation) else "git",
                "operation": op.operation,
                "path": getattr(op, "path", getattr(op, "branch", "")),
                "success": op.success,
                "message": op.message,
            }
            for op in self.operations_log
        ]
