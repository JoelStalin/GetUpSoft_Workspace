from __future__ import annotations

from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Any

from .hermes_runtime import HermesRuntime, HermesRuntimeConfig


@dataclass(slots=True)
class HermesTaskExecution:
    mode: str
    result: dict[str, Any]
    task: dict[str, Any]

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


class HermesTaskRunner:
    def __init__(self, runtime: HermesRuntime | None = None) -> None:
        self.runtime = runtime or HermesRuntime()

    def run_manual(
        self,
        prompt: str,
        *,
        model: str | None = None,
        tools: list[str] | None = None,
        memory: bool | None = None,
        timeout: int | None = None,
        output_schema: dict[str, Any] | None = None,
    ) -> HermesTaskExecution:
        result = self.runtime.run(
            prompt,
            model=model,
            tools=tools,
            memory=memory,
            timeout=timeout,
            output_schema=output_schema,
        )
        task = {
            "prompt": prompt,
            "model": model or self.runtime.config.model,
            "tools": tools or self.runtime.config.allowed_tools,
            "memory": self.runtime.config.memory_enabled if memory is None else memory,
            "timeout": timeout or self.runtime.config.timeout_seconds,
        }
        return HermesTaskExecution(mode="manual", result=result.to_dict(), task=task)

    def run_scheduled(self, prompt: str, *, schedule_id: str, **kwargs: Any) -> HermesTaskExecution:
        execution = self.run_manual(prompt, **kwargs)
        execution.mode = "scheduled"
        execution.task["schedule_id"] = schedule_id
        return execution

    def run_from_workflow(self, node: dict[str, Any]) -> HermesTaskExecution:
        prompt = str(node.get("prompt", "")).strip()
        if not prompt:
            raise ValueError("Workflow node prompt is required.")
        execution = self.run_manual(
            prompt,
            model=node.get("model"),
            tools=node.get("tools"),
            memory=node.get("memory"),
            timeout=node.get("timeout"),
            output_schema=node.get("output_schema"),
        )
        execution.mode = "workflow"
        execution.task["node"] = node
        return execution

    def self_test(self) -> dict[str, Any]:
        doctor = self.runtime.doctor()
        sample = self.run_manual("Create a short ORCA/Hermes readiness summary.", tools=["echo"])
        return {"doctor": doctor, "sample": sample.to_dict()}
