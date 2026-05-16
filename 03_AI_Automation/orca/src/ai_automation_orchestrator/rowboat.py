from __future__ import annotations

from dataclasses import dataclass
import os
from typing import Any

import httpx


@dataclass(slots=True)
class RowboatSettings:
    host: str | None
    project_id: str | None
    api_key: str | None
    timeout_seconds: float = 60.0

    @property
    def configured(self) -> bool:
        return bool(self.host and self.project_id and self.api_key)

    @property
    def missing(self) -> list[str]:
        missing: list[str] = []
        if not self.host:
            missing.append("ROWBOAT_HOST")
        if not self.project_id:
            missing.append("ROWBOAT_PROJECT_ID")
        if not self.api_key:
            missing.append("ROWBOAT_API_KEY")
        return missing


class RowboatClient:
    def __init__(
        self,
        settings: RowboatSettings,
        *,
        transport: httpx.BaseTransport | None = None,
    ) -> None:
        self.settings = settings
        self._transport = transport

    @property
    def configured(self) -> bool:
        return self.settings.configured

    def chat(
        self,
        message: str,
        *,
        conversation_id: str | None = None,
        mock_tools: dict[str, str] | None = None,
    ) -> dict[str, Any]:
        if not self.settings.configured:
            missing = ", ".join(self.settings.missing)
            raise RuntimeError(f"Rowboat is not configured. Missing: {missing}.")

        assert self.settings.host is not None
        assert self.settings.project_id is not None
        assert self.settings.api_key is not None

        endpoint = f"{self.settings.host.rstrip('/')}/api/v1/{self.settings.project_id}/chat"
        payload: dict[str, Any] = {
            "messages": [{"role": "user", "content": message}],
        }
        if conversation_id:
            payload["conversationId"] = conversation_id
        if mock_tools:
            payload["mockTools"] = mock_tools

        with httpx.Client(timeout=self.settings.timeout_seconds, transport=self._transport) as client:
            response = client.post(
                endpoint,
                headers={
                    "Authorization": f"Bearer {self.settings.api_key}",
                    "Content-Type": "application/json",
                },
                json=payload,
            )
            response.raise_for_status()
            return response.json()


def load_rowboat_settings() -> RowboatSettings:
    timeout_raw = os.getenv("ROWBOAT_TIMEOUT_SECONDS", "60")
    try:
        timeout_seconds = float(timeout_raw)
    except ValueError:
        timeout_seconds = 60.0

    return RowboatSettings(
        host=os.getenv("ROWBOAT_HOST"),
        project_id=os.getenv("ROWBOAT_PROJECT_ID"),
        api_key=os.getenv("ROWBOAT_API_KEY"),
        timeout_seconds=timeout_seconds,
    )


def extract_output_text(response: dict[str, Any]) -> str:
    output = response.get("turn", {}).get("output", [])
    if not isinstance(output, list):
        return ""

    parts: list[str] = []
    for item in output:
        if isinstance(item, dict) and isinstance(item.get("content"), str):
            parts.append(item["content"])
    return "\n".join(parts).strip()
