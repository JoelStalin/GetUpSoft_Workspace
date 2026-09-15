from __future__ import annotations

from concurrent.futures import ThreadPoolExecutor, TimeoutError as FutureTimeoutError
from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
import json
import os
from pathlib import Path
from typing import Any, Callable

import yaml

from .hermes_audit_logger import HermesAuditEntry, HermesAuditLogger
from .hermes_memory_adapter import HermesMemoryAdapter, HermesMemoryEntry
from .hermes_tool_registry import HermesToolRegistry
from .paths import orca_config_path, orca_root, workspace_root
from .prompt_query_engine import PromptQueryEngine


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


@dataclass(slots=True)
class HermesRuntimeConfig:
    enabled: bool = True
    provider: str = "hermes-agent"
    model: str = "claude-3-5-sonnet-20240620"
    workdir: str = "."
    memory_enabled: bool = True
    memory_sources: list[str] = field(default_factory=list)
    memory_refresh_command: str = ""
    audit_enabled: bool = True
    allowed_tools: list[str] = field(default_factory=lambda: ["echo", "memory_write", "memory_read", "prompt_query", "review_prompt"])
    allowed_shell_commands: list[str] = field(default_factory=lambda: ["python", "pytest", "orca", "ai-orchestrator"])
    timeout_seconds: int = 60
    max_response_chars: int = 4000

    @classmethod
    def from_file(cls, path: str | Path | None = None) -> "HermesRuntimeConfig":
        config_path = Path(path) if path else orca_config_path("hermes.yaml")
        if config_path.exists():
            raw = yaml.safe_load(config_path.read_text(encoding="utf-8")) or {}
        else:
            raw = {}
        return cls(
            enabled=bool(raw.get("enabled", True)),
            provider=str(raw.get("provider", "hermes-agent")),
            model=str(raw.get("model", "claude-3-5-sonnet-20240620")),
            workdir=str(raw.get("workdir", ".")),
            memory_enabled=bool(raw.get("memory_enabled", True)),
            memory_sources=list(raw.get("memory_sources", [])),
            memory_refresh_command=str(raw.get("memory_refresh_command", "")),
            audit_enabled=bool(raw.get("audit_enabled", True)),
            allowed_tools=list(raw.get("allowed_tools", ["echo", "memory_write", "memory_read", "prompt_query", "review_prompt"])),
            allowed_shell_commands=list(raw.get("allowed_shell_commands", ["python", "pytest", "orca", "ai-orchestrator"])),
            timeout_seconds=int(raw.get("timeout_seconds", 60)),
            max_response_chars=int(raw.get("max_response_chars", 4000)),
        )

    @classmethod
    def from_environment(cls, path: str | Path | None = None) -> "HermesRuntimeConfig":
        config = cls.from_file(path)
        env_tools = os.getenv("HERMES_ALLOWED_TOOLS")
        if env_tools:
            config.allowed_tools = [item.strip() for item in env_tools.split(",") if item.strip()]
        config.enabled = os.getenv("HERMES_ENABLED", str(config.enabled)).lower() in {"1", "true", "yes", "on"}
        config.provider = os.getenv("HERMES_PROVIDER", config.provider)
        config.model = os.getenv("HERMES_MODEL", config.model)
        config.workdir = os.getenv("HERMES_WORKDIR", config.workdir)
        config.memory_enabled = os.getenv("HERMES_MEMORY_ENABLED", str(config.memory_enabled)).lower() in {"1", "true", "yes", "on"}
        env_sources = os.getenv("HERMES_MEMORY_SOURCES")
        if env_sources:
            config.memory_sources = [item.strip() for item in env_sources.split(",") if item.strip()]
        config.memory_refresh_command = os.getenv("HERMES_MEMORY_REFRESH_COMMAND", config.memory_refresh_command)
        config.audit_enabled = os.getenv("HERMES_AUDIT_ENABLED", str(config.audit_enabled)).lower() in {"1", "true", "yes", "on"}
        config.timeout_seconds = int(os.getenv("HERMES_TIMEOUT_SECONDS", str(config.timeout_seconds)))
        return config


@dataclass(slots=True)
class HermesExecutionResult:
    ok: bool
    response: str
    structured_response: dict[str, Any]
    prompt: str
    model: str
    tool_used: list[str]
    memory_written: bool
    audit_written: bool
    status: str
    created_at: str = field(default_factory=utc_now)
    errors: list[str] = field(default_factory=list)
    metadata: dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


class HermesRuntime:
    def __init__(
        self,
        config: HermesRuntimeConfig | None = None,
        *,
        prompt_engine: PromptQueryEngine | None = None,
        memory_adapter: HermesMemoryAdapter | None = None,
        audit_logger: HermesAuditLogger | None = None,
        tool_registry: HermesToolRegistry | None = None,
        task_executor: Callable[[str, dict[str, Any]], Any] | None = None,
        evidence_path: str | Path | None = None,
    ) -> None:
        self.config = config or HermesRuntimeConfig.from_environment()
        self.prompt_engine = prompt_engine or PromptQueryEngine()
        self.memory_adapter = memory_adapter or HermesMemoryAdapter()
        self.audit_logger = audit_logger or HermesAuditLogger()
        self.tool_registry = tool_registry or HermesToolRegistry(
            allowed_tools=self.config.allowed_tools,
            allowed_shell_commands=self.config.allowed_shell_commands,
            workdir=self.config.workdir,
        )
        self.task_executor = task_executor or self._default_executor
        self.evidence_path = Path(evidence_path) if evidence_path else orca_root() / "evidence" / "hermes-integration"
        self.evidence_path.mkdir(parents=True, exist_ok=True)

    def doctor(self) -> dict[str, Any]:
        return {
            "enabled": self.config.enabled,
            "provider": self.config.provider,
            "model": self.config.model,
            "workdir": self.config.workdir,
            "memory_enabled": self.config.memory_enabled,
            "memory_sources": self.config.memory_sources,
            "memory_refresh_command": self.config.memory_refresh_command,
            "audit_enabled": self.config.audit_enabled,
            "timeout_seconds": self.config.timeout_seconds,
            "allowed_tools": sorted(self.config.allowed_tools),
            "allowed_shell_commands": sorted(self.config.allowed_shell_commands),
            "workspace_root": str(workspace_root()),
            "orca_root": str(orca_root()),
            "memory_path": str(self.memory_adapter.memory_path),
            "repository_memory_path": str(self.memory_adapter.repository_memory_path),
            "audit_path": str(self.audit_logger.path),
        }

    def run(
        self,
        prompt: str,
        *,
        model: str | None = None,
        tools: list[str] | None = None,
        memory: bool | None = None,
        timeout: int | None = None,
        output_schema: dict[str, Any] | None = None,
        workflow_context: dict[str, Any] | None = None,
    ) -> HermesExecutionResult:
        if not self.config.enabled:
            return HermesExecutionResult(
                ok=False,
                response="Hermes is disabled by configuration.",
                structured_response={"ok": False, "reason": "disabled"},
                prompt=prompt,
                model=model or self.config.model,
                tool_used=[],
                memory_written=False,
                audit_written=False,
                status="disabled",
                errors=["Hermes is disabled."],
            )

        normalized_prompt = prompt.strip()
        if not normalized_prompt:
            raise ValueError("Prompt is required.")
        if len(normalized_prompt) > 12000:
            raise ValueError("Prompt is too large.")

        selected_model = model or self.config.model
        allowed_tools = tools or list(self.config.allowed_tools)
        tool_names = [tool for tool in allowed_tools if self.tool_registry.is_allowed(tool)]
        memory_enabled = self.config.memory_enabled if memory is None else memory
        timeout_seconds = timeout or self.config.timeout_seconds

        classification = self.prompt_engine.classify_text(normalized_prompt)
        executor_payload = {
            "prompt": normalized_prompt,
            "model": selected_model,
            "tools": tool_names,
            "output_schema": output_schema or {},
            "workflow_context": workflow_context or {},
            "classification": classification,
            "doctor": self.doctor(),
        }

        response_data = self._run_with_timeout(normalized_prompt, executor_payload, timeout_seconds)
        structured_response = self._normalize_response(response_data, normalized_prompt, selected_model, tool_names, executor_payload)
        response_text = json.dumps(structured_response, ensure_ascii=False, indent=2)
        if len(response_text) > self.config.max_response_chars:
            structured_response["truncated"] = True
            response_text = json.dumps(structured_response, ensure_ascii=False, indent=2)[: self.config.max_response_chars]

        memory_written = False
        if memory_enabled:
            self.memory_adapter.write(
                HermesMemoryEntry(
                    prompt=normalized_prompt,
                    response=response_text,
                    metadata={
                        "model": selected_model,
                        "tools": tool_names,
                        "classification": classification,
                    },
                )
            )
            memory_written = True

        audit_written = False
        if self.config.audit_enabled:
            self.audit_logger.append(
                HermesAuditEntry(
                    action="hermes.run",
                    prompt=normalized_prompt,
                    status="completed",
                    model=selected_model,
                    tool_name=",".join(tool_names) if tool_names else None,
                    memory_enabled=memory_enabled,
                    audit_enabled=True,
                    metadata={"classification": classification, "workflow_context": workflow_context or {}},
                )
            )
            audit_written = True

        result = HermesExecutionResult(
            ok=True,
            response=response_text,
            structured_response=structured_response,
            prompt=normalized_prompt,
            model=selected_model,
            tool_used=tool_names,
            memory_written=memory_written,
            audit_written=audit_written,
            status="completed",
            metadata={"classification": classification, "workflow_context": workflow_context or {}},
        )
        self._write_evidence(result)
        return result

    def self_test(self) -> dict[str, Any]:
        doctor = self.doctor()
        sample = self.run("Summarize the current ORCA integration status.", tools=["echo"], memory=False)
        return {"doctor": doctor, "sample": sample.to_dict()}

    def _run_with_timeout(self, prompt: str, payload: dict[str, Any], timeout_seconds: int) -> Any:
        with ThreadPoolExecutor(max_workers=1) as executor:
            future = executor.submit(self.task_executor, prompt, payload)
            try:
                return future.result(timeout=timeout_seconds)
            except FutureTimeoutError as exc:
                future.cancel()
                raise TimeoutError(f"Hermes execution exceeded {timeout_seconds} seconds.") from exc

    def _normalize_response(
        self,
        response_data: Any,
        prompt: str,
        model: str,
        tools: list[str],
        payload: dict[str, Any],
    ) -> dict[str, Any]:
        if isinstance(response_data, dict):
            response = dict(response_data)
        elif isinstance(response_data, str):
            stripped = response_data.strip()
            try:
                response = json.loads(stripped)
                if not isinstance(response, dict):
                    response = {"output": response}
            except Exception:
                response = {"output": stripped}
        else:
            response = {"output": str(response_data)}
        response.setdefault("ok", True)
        response.setdefault("prompt", prompt)
        response.setdefault("model", model)
        response.setdefault("tools", tools)
        response.setdefault("payload", payload)
        return response

    def _default_executor(self, prompt: str, payload: dict[str, Any]) -> Any:
        route = self.prompt_engine.classify_text(prompt)
        return {
            "ok": True,
            "source": "local-fallback",
            "route": route,
            "summary": prompt[:240],
            "tools": payload.get("tools", []),
        }

    def _write_evidence(self, result: HermesExecutionResult) -> Path:
        output = self.evidence_path / "03_runtime_invocation.json"
        output.write_text(json.dumps(result.to_dict(), ensure_ascii=False, indent=2), encoding="utf-8")
        return output
