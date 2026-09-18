from __future__ import annotations

from dataclasses import asdict, dataclass, field
import json
import shlex
import subprocess
from pathlib import Path
from typing import Any, Callable


@dataclass(slots=True)
class HermesToolDefinition:
    name: str
    description: str
    category: str = "builtin"
    enabled: bool = True
    metadata: dict[str, Any] = field(default_factory=dict)


class HermesToolRegistry:
    def __init__(
        self,
        *,
        allowed_tools: list[str] | None = None,
        allowed_shell_commands: list[str] | None = None,
        workdir: str | Path | None = None,
    ) -> None:
        self.allowed_tools = set(allowed_tools or ["echo", "memory_write", "memory_read", "prompt_query", "review_prompt"])
        self.allowed_shell_commands = set(allowed_shell_commands or ["python", "pytest", "orca", "ai-orchestrator"])
        self.workdir = Path(workdir) if workdir else Path.cwd()
        self._tools: dict[str, HermesToolDefinition] = {
            "echo": HermesToolDefinition(name="echo", description="Return the provided text"),
            "memory_write": HermesToolDefinition(name="memory_write", description="Write a memory entry"),
            "memory_read": HermesToolDefinition(name="memory_read", description="Read recent memory entries"),
            "prompt_query": HermesToolDefinition(name="prompt_query", description="Query the prompt index"),
            "review_prompt": HermesToolDefinition(name="review_prompt", description="Review a prompt using gstack heuristics"),
            "shell": HermesToolDefinition(name="shell", description="Run a command only if it is allowlisted", category="dangerous"),
        }
        self._handlers: dict[str, Callable[[dict[str, Any]], Any]] = {}

    def register_handler(self, tool_name: str, handler: Callable[[dict[str, Any]], Any]) -> None:
        self._handlers[tool_name] = handler

    def is_allowed(self, tool_name: str) -> bool:
        return tool_name in self.allowed_tools

    def manifest(self) -> list[dict[str, Any]]:
        return [asdict(item) for item in self._tools.values() if item.enabled]

    def invoke(self, tool_name: str, payload: dict[str, Any]) -> Any:
        if not self.is_allowed(tool_name):
            raise PermissionError(f"Tool '{tool_name}' is not allowed.")
        if tool_name == "shell":
            return self._run_shell(payload)
        handler = self._handlers.get(tool_name)
        if handler is None:
            return {"tool": tool_name, "payload": payload}
        return handler(payload)

    def _run_shell(self, payload: dict[str, Any]) -> dict[str, Any]:
        command = str(payload.get("command", "")).strip()
        arguments = payload.get("args") or []
        if not command:
            raise ValueError("Shell command is required.")
        if command not in self.allowed_shell_commands:
            raise PermissionError(f"Shell command '{command}' is not allowlisted.")
        if any(token in command for token in ("&", "|", ";", ">", "<", "`", "$", "..", "/", "\\")):
            raise PermissionError("Command contains disallowed characters.")
        if any(token in " ".join(map(str, arguments)) for token in ("&", "|", ";", ">", "<", "`", "$")):
            raise PermissionError("Arguments contain disallowed characters.")
        result = subprocess.run(
            [command, *map(str, arguments)],
            cwd=self.workdir,
            capture_output=True,
            text=True,
            timeout=int(payload.get("timeout", 30)),
            check=False,
        )
        return {
            "command": command,
            "args": [str(item) for item in arguments],
            "return_code": result.returncode,
            "stdout": result.stdout.strip(),
            "stderr": result.stderr.strip(),
        }

    def export(self) -> str:
        return json.dumps(self.manifest(), ensure_ascii=False, indent=2)
