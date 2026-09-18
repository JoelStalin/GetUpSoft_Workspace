from __future__ import annotations

from dataclasses import dataclass
import json
import os
from pathlib import Path
from threading import Lock
from typing import Any

from ai_automation_orchestrator.config import repository_root


SUPPORTED_PROVIDERS = ("openai", "gemini", "claude", "manus")
ENV_FALLBACKS = {
    "openai": "OPENAI_API_KEY",
    "gemini": "GEMINI_API_KEY",
    "claude": "CLAUDE_API_KEY",
    "manus": "MANUS_API_KEY",
}


@dataclass(slots=True)
class CredentialResolution:
    provider: str
    configured: bool
    scope: str | None
    source: str | None
    masked_value: str | None
    env_name: str | None


def mask_secret(value: str | None) -> str | None:
    if not value:
        return None
    if len(value) <= 8:
        return "*" * len(value)
    return f"{value[:4]}...{value[-4:]}"


class CredentialStore:
    def __init__(self, path: str | Path | None = None) -> None:
        self.path = Path(path) if path else repository_root() / "data" / "user_credentials.json"
        self._lock = Lock()
        self.path.parent.mkdir(parents=True, exist_ok=True)

    def get_status_view(self, user_id: str) -> dict[str, Any]:
        return {
            "providers": [self._resolution_to_dict(self.resolve(provider, user_id=user_id)) for provider in SUPPORTED_PROVIDERS]
        }

    def upsert_global(self, values: dict[str, str]) -> dict[str, Any]:
        sanitized = self._sanitize(values)
        with self._lock:
            data = self._read()
            global_data = data.setdefault("global", {})
            global_data.update(sanitized)
            self._write(data)
        return {"updated": sorted(sanitized.keys())}

    def upsert_user(self, user_id: str, values: dict[str, str]) -> dict[str, Any]:
        sanitized = self._sanitize(values)
        with self._lock:
            data = self._read()
            users = data.setdefault("users", {})
            user_data = users.setdefault(user_id, {})
            user_data.update(sanitized)
            self._write(data)
        return {"updated": sorted(sanitized.keys())}

    def delete_global_provider(self, provider: str) -> bool:
        if provider not in SUPPORTED_PROVIDERS:
            return False
        with self._lock:
            data = self._read()
            global_data = data.setdefault("global", {})
            removed = provider in global_data
            global_data.pop(provider, None)
            self._write(data)
            return removed

    def delete_user_provider(self, user_id: str, provider: str) -> bool:
        if provider not in SUPPORTED_PROVIDERS:
            return False
        with self._lock:
            data = self._read()
            user_data = data.setdefault("users", {}).setdefault(user_id, {})
            removed = provider in user_data
            user_data.pop(provider, None)
            self._write(data)
            return removed

    def resolve(self, provider: str, *, user_id: str) -> CredentialResolution:
        if provider not in SUPPORTED_PROVIDERS:
            raise KeyError(f"Unsupported provider '{provider}'.")

        data = self._read()
        user_value = data.get("users", {}).get(user_id, {}).get(provider)
        if user_value:
            return CredentialResolution(
                provider=provider,
                configured=True,
                scope="user",
                source="user_store",
                masked_value=mask_secret(user_value),
                env_name=ENV_FALLBACKS.get(provider),
            )

        global_value = data.get("global", {}).get(provider)
        if global_value:
            return CredentialResolution(
                provider=provider,
                configured=True,
                scope="global",
                source="global_store",
                masked_value=mask_secret(global_value),
                env_name=ENV_FALLBACKS.get(provider),
            )

        env_name = ENV_FALLBACKS.get(provider)
        env_value = os.getenv(env_name or "")
        if env_value:
            return CredentialResolution(
                provider=provider,
                configured=True,
                scope="global",
                source="environment",
                masked_value=mask_secret(env_value),
                env_name=env_name,
            )

        return CredentialResolution(
            provider=provider,
            configured=False,
            scope=None,
            source=None,
            masked_value=None,
            env_name=env_name,
        )

    def _sanitize(self, values: dict[str, str]) -> dict[str, str]:
        sanitized: dict[str, str] = {}
        for provider, value in values.items():
            if provider not in SUPPORTED_PROVIDERS:
                continue
            cleaned = value.strip()
            if cleaned:
                sanitized[provider] = cleaned
        return sanitized

    def _resolution_to_dict(self, resolution: CredentialResolution) -> dict[str, Any]:
        return {
            "provider": resolution.provider,
            "configured": resolution.configured,
            "scope": resolution.scope,
            "source": resolution.source,
            "masked_value": resolution.masked_value,
            "env_name": resolution.env_name,
        }

    def _read(self) -> dict[str, Any]:
        if not self.path.exists():
            return {"global": {}, "users": {}}
        raw = self.path.read_text(encoding="utf-8").strip()
        if not raw:
            return {"global": {}, "users": {}}
        data = json.loads(raw)
        data.setdefault("global", {})
        data.setdefault("users", {})
        return data

    def _write(self, data: dict[str, Any]) -> None:
        self.path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
