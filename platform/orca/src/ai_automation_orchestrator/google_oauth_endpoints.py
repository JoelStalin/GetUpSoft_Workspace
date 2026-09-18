"""Google OAuth endpoints for authentication."""

import uuid
from fastapi import APIRouter, HTTPException, Request, Response, Cookie
from pydantic import BaseModel
from typing import Optional
from .google_oauth import GoogleOAuthManager, load_google_oauth_config
from .user_auth import UserAuthManager, SessionManager


router = APIRouter(prefix="/api/auth/google", tags=["google-auth"])
google_oauth_manager: Optional[GoogleOAuthManager] = None
user_auth_manager: Optional[UserAuthManager] = None
session_manager: Optional[SessionManager] = None


class GoogleAuthRequest(BaseModel):
    """Google authentication request."""
    code: str
    state: str


class GoogleAuthResponse(BaseModel):
    """Google authentication response."""
    user_id: str
    email: str
    name: str
    picture: Optional[str] = None
    session_id: str
    is_new_user: bool
    message: str


def init_google_oauth(
    oauth_mgr: GoogleOAuthManager,
    user_auth_mgr: UserAuthManager,
    session_mgr: SessionManager
):
    """Initialize Google OAuth managers."""
    global google_oauth_manager, user_auth_manager, session_manager
    google_oauth_manager = oauth_mgr
    user_auth_manager = user_auth_mgr
    session_manager = session_mgr


@router.get("/start")
async def start_google_login(request: Request):
    """Start Google OAuth login flow.

    Returns:
        Redirect to Google login page
    """
    if not google_oauth_manager:
        raise HTTPException(status_code=500, detail="Google OAuth not configured")

    # Generate state token for CSRF protection
    state = str(uuid.uuid4())

    # Get authorization URL
    auth_url = google_oauth_manager.get_authorization_url(state)

    # TODO: Store state in session for validation in callback
    # In production, use Redis or session store

    return {
        "url": auth_url,
        "state": state
    }


@router.post("/callback", response_model=GoogleAuthResponse)
async def google_callback(
    request: GoogleAuthRequest,
    response: Response
):
    """Handle Google OAuth callback.

    Args:
        request: Contains authorization code and state

    Returns:
        User info and session token
    """
    if not google_oauth_manager or not user_auth_manager or not session_manager:
        raise HTTPException(status_code=500, detail="OAuth not initialized")

    try:
        # Authenticate with Google
        google_user = await google_oauth_manager.authenticate_with_google(request.code)

        # Extract user info
        email = google_user.get("email")
        name = google_user.get("name")
        picture = google_user.get("picture")
        google_id = google_user.get("sub")

        if not email:
            raise ValueError("No email in Google response")

        # Check if user exists
        existing_user = user_auth_manager.get_user_by_email(email)
        is_new_user = existing_user is None

        if is_new_user:
            # Create new user
            user = user_auth_manager.create_user(email, name or email)
            message = f"Welcome {name}! Account created via Google."
        else:
            # Update last login
            user = existing_user
            user_auth_manager.update_last_login(user.user_id)
            message = f"Welcome back {name}!"

        # Store Google OAuth info in user profile
        user_auth_manager.save_provider_config(user.user_id, "google_oauth", {
            "google_id": google_id,
            "picture": picture,
            "access_token": google_user.get("access_token"),
            "email_verified": google_user.get("email_verified"),
            "authenticated_at": google_user.get("authenticated_at")
        })

        # Create session
        session_id = session_manager.create_session(user.user_id)

        # Set session cookie
        response.set_cookie(
            key="session_id",
            value=session_id,
            max_age=30 * 24 * 60 * 60,  # 30 days
            secure=True,
            httponly=True,
            samesite="strict"
        )

        return GoogleAuthResponse(
            user_id=user.user_id,
            email=user.email,
            name=user.name,
            picture=picture,
            session_id=session_id,
            is_new_user=is_new_user,
            message=message
        )

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Google authentication failed: {str(e)}")


@router.get("/user-info")
async def get_google_user_info(session_id: str = Cookie(None)):
    """Get Google OAuth info for current user.

    Returns:
        Google user info if authenticated via Google
    """
    if not session_manager or not user_auth_manager:
        raise HTTPException(status_code=500, detail="Not initialized")

    if not session_id:
        raise HTTPException(status_code=401, detail="Not authenticated")

    user_id = session_manager.validate_session(session_id)
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid session")

    # Get Google OAuth info
    google_info = user_auth_manager.get_provider_config(user_id, "google_oauth")

    if not google_info:
        raise HTTPException(status_code=404, detail="User not authenticated via Google")

    return {
        "authenticated_via_google": True,
        "google_id": google_info.get("config", {}).get("google_id"),
        "picture": google_info.get("config", {}).get("picture"),
        "email_verified": google_info.get("config", {}).get("email_verified"),
        "authenticated_at": google_info.get("config", {}).get("authenticated_at")
    }


def register_google_oauth_endpoints(app):
    """Register Google OAuth endpoints with FastAPI app."""
    app.include_router(router)
