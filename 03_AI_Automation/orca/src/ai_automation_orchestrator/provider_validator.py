"""Provider connectivity validation module."""

from __future__ import annotations

import os
from typing import Any

import httpx


PROVIDER_ENDPOINTS = {
    "openai": {
        "url": "https://api.openai.com/v1/models",
        "headers": {"Authorization": "Bearer {api_key}"},
        "timeout": 10,
        "success_field": "data",
    },
    "claude": {
        "url": "https://api.anthropic.com/v1/models",
        "headers": {"x-api-key": "{api_key}"},
        "timeout": 10,
        "success_field": "data",
    },
    "gemini": {
        "url": "https://generativelanguage.googleapis.com/v1/models",
        "method": "GET",
        "query_param": "key",
        "timeout": 10,
        "success_field": "models",
    },
    "manus": {
        "url": "https://api.manus.ai/v1/me",
        "headers": {"Authorization": "Bearer {api_key}"},
        "timeout": 10,
        "success_field": "id",
    },
}

PROVIDER_CONFIG = {
    "openai": {
        "name": "OpenAI",
        "description": "GPT-4o for documentation, SEO, copywriting",
        "logo": "🤖",
        "url": "https://platform.openai.com",
        "status_page": "https://status.openai.com",
        "models": ["gpt-4o", "gpt-4-turbo", "gpt-3.5-turbo"],
    },
    "claude": {
        "name": "Anthropic Claude",
        "description": "Claude 3.5 Sonnet for planning, code review, architecture",
        "logo": "🧠",
        "url": "https://console.anthropic.com",
        "status_page": "https://status.anthropic.com",
        "models": ["claude-3-5-sonnet", "claude-3-opus", "claude-3-haiku"],
    },
    "gemini": {
        "name": "Google Gemini",
        "description": "Image generation, UI design with Stitch/Figma",
        "logo": "🎨",
        "url": "https://cloud.google.com",
        "status_page": "https://status.cloud.google.com",
        "models": ["gemini-2.0-flash", "gemini-1.5-pro", "imagen-3"],
    },
    "manus": {
        "name": "Manus AI",
        "description": "Social media automation, content scheduling",
        "logo": "📱",
        "url": "https://manus.ai",
        "status_page": "https://manus.ai/status",
        "models": ["manus-social", "manus-analytics"],
    },
}


async def validate_provider(
    provider: str, api_key: str | None = None
) -> dict[str, Any]:
    """Validate connectivity to a provider."""
    if provider not in PROVIDER_ENDPOINTS:
        return {"valid": False, "error": f"Unknown provider: {provider}"}

    # Use provided key or fallback to environment
    key = api_key or os.getenv(f"{provider.upper()}_API_KEY")
    if not key:
        return {
            "valid": False,
            "error": f"No API key provided for {provider}",
            "provider": provider,
        }

    config = PROVIDER_ENDPOINTS[provider]
    try:
        async with httpx.AsyncClient(timeout=config["timeout"]) as client:
            url = config["url"]
            headers = config.get("headers", {})

            # Substitute API key in headers or query params
            if "query_param" in config:
                params = {config["query_param"]: key}
            else:
                headers = {k: v.format(api_key=key) for k, v in headers.items()}
                params = {}

            response = await client.get(url, headers=headers, params=params)
            response.raise_for_status()

            data = response.json()
            # Check if response has expected field
            if config.get("success_field") in data:
                return {
                    "valid": True,
                    "provider": provider,
                    "message": f"Successfully connected to {PROVIDER_CONFIG[provider]['name']}",
                }
            else:
                return {
                    "valid": False,
                    "error": "Unexpected response format",
                    "provider": provider,
                }
    except httpx.HTTPStatusError as e:
        return {
            "valid": False,
            "error": f"HTTP {e.response.status_code}: {e.response.text[:200]}",
            "provider": provider,
        }
    except httpx.TimeoutException:
        return {
            "valid": False,
            "error": "Connection timeout",
            "provider": provider,
        }
    except Exception as e:
        return {
            "valid": False,
            "error": str(e),
            "provider": provider,
        }


def get_provider_info(provider: str | None = None) -> dict[str, Any]:
    """Get configuration and status for providers."""
    if provider:
        if provider not in PROVIDER_CONFIG:
            return {"error": f"Unknown provider: {provider}"}
        return {provider: PROVIDER_CONFIG[provider]}

    return {
        "providers": PROVIDER_CONFIG,
        "total": len(PROVIDER_CONFIG),
    }
