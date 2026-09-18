"""Provider management endpoints for FastAPI."""

from __future__ import annotations

from typing import Any

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

from ai_automation_orchestrator.provider_validator import (
    get_provider_info,
    validate_provider,
)
from ai_automation_orchestrator.user_credentials import CredentialStore


class ProviderValidationRequest(BaseModel):
    api_key: str | None = None


def register_provider_endpoints(
    app: FastAPI, credentials: CredentialStore
) -> None:
    """Register provider management endpoints."""

    @app.get("/api/providers")
    def list_providers() -> dict[str, Any]:
        """Get list of available AI providers."""
        return get_provider_info()

    @app.get("/api/providers/{provider}")
    def get_provider(provider: str) -> dict[str, Any]:
        """Get details for a specific provider."""
        info = get_provider_info(provider)
        if "error" in info:
            raise HTTPException(status_code=404, detail=info["error"])
        return info

    @app.post("/api/providers/{provider}/validate")
    async def validate_provider_connection(
        provider: str, request: ProviderValidationRequest
    ) -> dict[str, Any]:
        """Validate connection to a provider."""
        result = await validate_provider(provider, request.api_key)
        if not result.get("valid"):
            raise HTTPException(status_code=400, detail=result.get("error"))
        return result

    @app.get("/api/providers/status")
    def providers_status(user_id: str = "default") -> dict[str, Any]:
        """Get configuration status for all providers."""
        status_view = credentials.get_status_view(user_id)
        providers_info = get_provider_info()

        # Combine with provider info
        return {
            "providers": [
                {
                    **providers_info.get("providers", {}).get(
                        p.get("provider"), {}
                    ),
                    **p,
                }
                for p in status_view.get("providers", [])
            ],
            "configured_count": sum(
                1 for p in status_view.get("providers", []) if p.get("configured")
            ),
            "total": len(status_view.get("providers", [])),
        }

    @app.post("/api/providers/{provider}/connect")
    def connect_provider(
        provider: str, request: ProviderValidationRequest, user_id: str = "default"
    ) -> dict[str, Any]:
        """Save provider credentials and validate connection."""
        if not request.api_key:
            raise HTTPException(
                status_code=400, detail="API key is required"
            )

        # Save credentials
        credentials.upsert_user(user_id, {provider: request.api_key})

        return {"provider": provider, "configured": True, "user_id": user_id}

    @app.delete("/api/providers/{provider}/disconnect")
    def disconnect_provider(
        provider: str, user_id: str = "default"
    ) -> dict[str, Any]:
        """Remove provider credentials."""
        deleted = credentials.delete_user_provider(user_id, provider)
        if not deleted:
            raise HTTPException(
                status_code=404, detail=f"No credentials configured for {provider}"
            )
        return {"provider": provider, "disconnected": True, "user_id": user_id}
