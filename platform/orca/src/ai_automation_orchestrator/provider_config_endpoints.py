"""Provider configuration endpoints for AI services."""

from fastapi import APIRouter, HTTPException, Cookie
from pydantic import BaseModel
from typing import Optional
import httpx

from .user_auth import UserAuthManager
from .auth_endpoints import get_current_user_id


router = APIRouter(prefix="/api/providers", tags=["providers"])
user_auth_manager: Optional[UserAuthManager] = None


class ProviderConfigRequest(BaseModel):
    """Provider configuration request."""
    user_id: str
    provider_id: str
    config: dict


class ProviderTestRequest(BaseModel):
    """Provider test request."""
    provider_id: str


@router.post("/config")
async def save_provider_config(
    request: ProviderConfigRequest,
    session_id: str = Cookie(None)
):
    """Save provider configuration for user."""
    if not user_auth_manager:
        raise HTTPException(status_code=500, detail="Provider manager not initialized")

    # Verify user owns this config
    try:
        user_id = get_current_user_id(session_id)
    except:
        raise HTTPException(status_code=401, detail="Not authenticated")

    if user_id != request.user_id:
        raise HTTPException(status_code=403, detail="Cannot modify other users' configs")

    # Save config
    user_auth_manager.save_provider_config(
        request.user_id,
        request.provider_id,
        request.config
    )

    return {
        "message": f"{request.provider_id} configuration saved",
        "provider_id": request.provider_id,
        "user_id": request.user_id
    }


@router.get("/config/{provider_id}")
async def get_provider_config(
    provider_id: str,
    session_id: str = Cookie(None)
):
    """Get provider configuration for current user."""
    if not user_auth_manager:
        raise HTTPException(status_code=500, detail="Provider manager not initialized")

    try:
        user_id = get_current_user_id(session_id)
    except:
        raise HTTPException(status_code=401, detail="Not authenticated")

    config = user_auth_manager.get_provider_config(user_id, provider_id)
    if not config:
        raise HTTPException(status_code=404, detail=f"No config found for {provider_id}")

    return {
        "provider_id": provider_id,
        "configured": True,
        "saved_at": config.get("saved_at")
    }


@router.post("/test")
async def test_provider_connection(
    request: ProviderTestRequest,
    session_id: str = Cookie(None)
):
    """Test provider connection."""
    try:
        user_id = get_current_user_id(session_id)
    except:
        raise HTTPException(status_code=401, detail="Not authenticated")

    if not user_auth_manager:
        raise HTTPException(status_code=500, detail="Provider manager not initialized")

    config = user_auth_manager.get_provider_config(user_id, request.provider_id)
    if not config:
        return {"success": False, "error": "No configuration found"}

    try:
        # Test each provider type
        if request.provider_id == "nvidia":
            return test_nvidia_api(config.get("config", {}).get("key"))
        elif request.provider_id == "ollama":
            return test_ollama_api(config.get("config", {}).get("key"))
        elif request.provider_id == "openai":
            return test_openai_api(config.get("config", {}).get("key"))
        elif request.provider_id == "anthropic":
            return test_anthropic_api(config.get("config", {}).get("key"))
        elif request.provider_id == "google":
            return test_google_api(config.get("config", {}).get("key"))
        elif request.provider_id == "cohere":
            return test_cohere_api(config.get("config", {}).get("key"))
        else:
            return {"success": False, "error": "Unknown provider"}
    except Exception as e:
        return {"success": False, "error": str(e)}


def test_nvidia_api(api_key: str) -> dict:
    """Test NVIDIA Build API connection."""
    if not api_key:
        return {"success": False, "error": "No API key provided"}

    try:
        response = httpx.post(
            "https://integrate.api.nvidia.com/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json"
            },
            json={
                "model": "mistralai/mistral-7b-instruct-v0.1",
                "messages": [{"role": "user", "content": "test"}],
                "max_tokens": 10
            },
            timeout=10
        )
        return {
            "success": response.status_code in [200, 201],
            "status_code": response.status_code,
            "message": "NVIDIA API connection successful" if response.status_code in [200, 201] else response.text
        }
    except Exception as e:
        return {"success": False, "error": str(e)}


def test_ollama_api(endpoint: str) -> dict:
    """Test Ollama connection."""
    if not endpoint:
        return {"success": False, "error": "No endpoint provided"}

    try:
        response = httpx.get(f"{endpoint}/api/tags", timeout=10)
        return {
            "success": response.status_code == 200,
            "status_code": response.status_code,
            "message": "Ollama connection successful" if response.status_code == 200 else response.text
        }
    except Exception as e:
        return {"success": False, "error": str(e)}


def test_openai_api(api_key: str) -> dict:
    """Test OpenAI API connection."""
    if not api_key:
        return {"success": False, "error": "No API key provided"}

    try:
        response = httpx.post(
            "https://api.openai.com/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json"
            },
            json={
                "model": "gpt-4",
                "messages": [{"role": "user", "content": "test"}],
                "max_tokens": 10
            },
            timeout=10
        )
        return {
            "success": response.status_code in [200, 201],
            "status_code": response.status_code,
            "message": "OpenAI API connection successful" if response.status_code in [200, 201] else response.text
        }
    except Exception as e:
        return {"success": False, "error": str(e)}


def test_anthropic_api(api_key: str) -> dict:
    """Test Anthropic API connection."""
    if not api_key:
        return {"success": False, "error": "No API key provided"}

    try:
        response = httpx.post(
            "https://api.anthropic.com/v1/messages",
            headers={
                "x-api-key": api_key,
                "content-type": "application/json",
                "anthropic-version": "2023-06-01"
            },
            json={
                "model": "claude-3-5-sonnet-20241022",
                "max_tokens": 10,
                "messages": [{"role": "user", "content": "test"}]
            },
            timeout=10
        )
        return {
            "success": response.status_code in [200, 201],
            "status_code": response.status_code,
            "message": "Anthropic API connection successful" if response.status_code in [200, 201] else response.text
        }
    except Exception as e:
        return {"success": False, "error": str(e)}


def test_google_api(api_key: str) -> dict:
    """Test Google Gemini API connection."""
    if not api_key:
        return {"success": False, "error": "No API key provided"}

    try:
        response = httpx.post(
            f"https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key={api_key}",
            headers={"Content-Type": "application/json"},
            json={
                "contents": [{"parts": [{"text": "test"}]}]
            },
            timeout=10
        )
        return {
            "success": response.status_code in [200, 201],
            "status_code": response.status_code,
            "message": "Google API connection successful" if response.status_code in [200, 201] else response.text
        }
    except Exception as e:
        return {"success": False, "error": str(e)}


def test_cohere_api(api_key: str) -> dict:
    """Test Cohere API connection."""
    if not api_key:
        return {"success": False, "error": "No API key provided"}

    try:
        response = httpx.post(
            "https://api.cohere.ai/v1/generate",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json"
            },
            json={
                "prompt": "test",
                "max_tokens": 10
            },
            timeout=10
        )
        return {
            "success": response.status_code in [200, 201],
            "status_code": response.status_code,
            "message": "Cohere API connection successful" if response.status_code in [200, 201] else response.text
        }
    except Exception as e:
        return {"success": False, "error": str(e)}


def init_provider_config_manager(auth_mgr: UserAuthManager):
    """Initialize provider config manager."""
    global user_auth_manager
    user_auth_manager = auth_mgr


def register_provider_config_endpoints(app):
    """Register provider config endpoints with FastAPI app."""
    app.include_router(router)
