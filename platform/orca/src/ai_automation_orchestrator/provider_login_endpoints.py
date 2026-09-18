"""OAuth and provider login endpoints."""

from typing import Optional
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel

from .provider_auth import (
    ProviderAuthManager,
    GoogleOAuthProvider,
    APIKeyAuthProvider,
    AuthStatus,
    OAuthToken,
)

# Disabled in favor of new unified auth system
router = APIRouter(prefix="/api/provider-auth-disabled", tags=["provider-auth-disabled"])

# Global auth manager
auth_manager: Optional[ProviderAuthManager] = None


def init_auth_manager(storage_path: str = None):
    """Initialize authentication manager."""
    global auth_manager
    auth_manager = ProviderAuthManager(storage_path)

    # Register providers
    auth_manager.register_provider(
        "google",
        GoogleOAuthProvider("google", {
            "client_id": "YOUR_GOOGLE_CLIENT_ID",
            "client_secret": "YOUR_GOOGLE_CLIENT_SECRET",
            "scopes": ["openid", "email", "profile"]
        })
    )

    # API Key providers
    for provider in ["openai", "anthropic", "nvidia"]:
        auth_manager.register_provider(
            provider,
            APIKeyAuthProvider(provider, {})
        )


class ProviderInfo(BaseModel):
    """Provider authentication info."""
    provider_id: str
    name: str
    auth_type: str  # "oauth" or "apikey"
    configured: bool
    status: str
    last_login: Optional[str] = None


class ProviderLoginRequest(BaseModel):
    """Provider login request (legacy)."""
    provider: str
    user_id: str = "default"


class CallbackRequest(BaseModel):
    """OAuth callback request."""
    code: Optional[str] = None
    state: str
    error: Optional[str] = None


@router.get("/providers")
async def list_providers() -> dict:
    """List available providers for login."""
    providers = [
        {
            "id": "google",
            "name": "Google (Gemini)",
            "auth_type": "oauth",
            "description": "Login with Google account to use Gemini models"
        },
        {
            "id": "openai",
            "name": "OpenAI",
            "auth_type": "apikey",
            "description": "Enter your OpenAI API key"
        },
        {
            "id": "anthropic",
            "name": "Anthropic (Claude)",
            "auth_type": "apikey",
            "description": "Enter your Anthropic API key"
        },
        {
            "id": "nvidia",
            "name": "NVIDIA Build API",
            "auth_type": "apikey",
            "description": "Enter your NVIDIA Build API key"
        },
    ]
    return {"providers": providers}


@router.get("/status")
async def auth_status(user_id: str = "default") -> dict:
    """Get authentication status for all providers."""
    if not auth_manager:
        raise HTTPException(status_code=503, detail="Auth not initialized")

    providers_status = []
    for provider_id in ["google", "openai", "anthropic", "nvidia"]:
        session = auth_manager.get_session(provider_id, user_id)
        providers_status.append({
            "provider": provider_id,
            "configured": session and session.is_valid() if session else False,
            "status": session.status.value if session else "disconnected",
            "last_login": session.last_login.isoformat() if session and session.last_login else None
        })

    return {"providers": providers_status}


@router.post("/login")
async def start_login(request: ProviderLoginRequest, http_request: Request) -> dict:
    """Initiate provider login (OAuth or API key form)."""
    if not auth_manager:
        raise HTTPException(status_code=503, detail="Auth not initialized")

    if request.provider not in auth_manager.providers:
        raise HTTPException(status_code=400, detail=f"Unknown provider: {request.provider}")

    state = auth_manager.create_auth_state(request.provider, request.user_id)
    provider = auth_manager.providers[request.provider]

    # Get redirect URI
    redirect_uri = str(http_request.url_for("auth_callback"))

    login_url = provider.get_login_url(state, redirect_uri)

    return {
        "provider": request.provider,
        "login_url": login_url,
        "state": state,
        "auth_type": "oauth" if "oauth" in login_url else "apikey"
    }


@router.get("/callback")
async def auth_callback(
    code: Optional[str] = None,
    state: str = None,
    error: Optional[str] = None,
    http_request: Request = None
) -> dict:
    """OAuth callback endpoint."""
    if not auth_manager:
        raise HTTPException(status_code=503, detail="Auth not initialized")

    if error:
        raise HTTPException(status_code=400, detail=f"Auth error: {error}")

    if not state:
        raise HTTPException(status_code=400, detail="Missing state parameter")

    # Find session by state
    session = None
    provider_id = None
    user_id = None

    for (p, uid, s), sess in list(auth_manager.sessions.items()):
        if s == state:
            session = sess
            provider_id = p
            user_id = uid
            break

    if not session:
        raise HTTPException(status_code=400, detail="Invalid state parameter")

    if not code:
        raise HTTPException(status_code=400, detail="Missing authorization code")

    try:
        provider = auth_manager.providers[provider_id]
        redirect_uri = str(http_request.url_for("auth_callback"))

        token = await provider.exchange_code(code, redirect_uri)
        session.token = token
        session.status = AuthStatus.CONNECTED

        auth_manager.save_session(session)

        return {
            "status": "success",
            "provider": provider_id,
            "message": f"Successfully authenticated with {provider_id}",
            "redirect": f"/dashboard?auth_success={provider_id}"
        }
    except Exception as e:
        session.status = AuthStatus.ERROR
        auth_manager.save_session(session)
        raise HTTPException(status_code=500, detail=f"Authentication failed: {str(e)}")


@router.post("/logout")
async def logout(provider: str, user_id: str = "default") -> dict:
    """Logout from provider."""
    if not auth_manager:
        raise HTTPException(status_code=503, detail="Auth not initialized")

    session = auth_manager.get_session(provider, user_id)
    if session:
        session.token = None
        session.status = AuthStatus.DISCONNECTED
        auth_manager.save_session(session)

    return {"status": "logged_out", "provider": provider}


@router.post("/api-key")
async def set_api_key(
    provider: str,
    api_key: str,
    user_id: str = "default"
) -> dict:
    """Set API key directly (alternative to OAuth)."""
    if not auth_manager:
        raise HTTPException(status_code=503, detail="Auth not initialized")

    if provider not in auth_manager.providers:
        raise HTTPException(status_code=400, detail=f"Unknown provider: {provider}")

    try:
        provider_auth = auth_manager.providers[provider]
        token = await provider_auth.exchange_code(api_key, "")

        session = auth_manager.get_session(provider, user_id) or \
                 __import__('ai_automation_orchestrator.provider_auth', fromlist=['ProviderSession']).ProviderSession(
                    provider=provider,
                    user_id=user_id
                 )
        session.token = token
        session.status = AuthStatus.CONNECTED

        auth_manager.save_session(session)

        return {
            "status": "success",
            "provider": provider,
            "message": f"API key saved for {provider}"
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to validate API key: {str(e)}")


def register_provider_auth_endpoints(app, storage_path: str = None):
    """Register authentication endpoints with FastAPI app."""
    init_auth_manager(storage_path)
    app.include_router(router)
