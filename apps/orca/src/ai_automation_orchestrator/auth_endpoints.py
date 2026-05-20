"""Authentication endpoints for user login/registration."""

from fastapi import APIRouter, HTTPException, Request, Response, Cookie
from pydantic import BaseModel, EmailStr
from typing import Optional
from .user_auth import UserAuthManager, SessionManager


router = APIRouter(prefix="/api/auth", tags=["authentication"])
user_auth_manager: Optional[UserAuthManager] = None
session_manager: Optional[SessionManager] = None


def init_auth(auth_mgr: UserAuthManager, sess_mgr: SessionManager):
    """Initialize auth managers."""
    global user_auth_manager, session_manager
    user_auth_manager = auth_mgr
    session_manager = sess_mgr


class LoginRequest(BaseModel):
    """Login request."""
    email: str
    name: Optional[str] = None  # Required for first-time login (registration)


class LoginResponse(BaseModel):
    """Login response."""
    user_id: str
    email: str
    name: str
    session_id: str
    message: str


class UserResponse(BaseModel):
    """User info response."""
    user_id: str
    email: str
    name: str
    created_at: str
    last_login: str
    is_active: bool


@router.post("/login", response_model=LoginResponse)
async def login(request: LoginRequest, response: Response):
    """Login or register user."""
    if not user_auth_manager or not session_manager:
        raise HTTPException(status_code=500, detail="Auth not initialized")

    # Try to find existing user
    user = user_auth_manager.get_user_by_email(request.email)

    if not user:
        # Register new user
        if not request.name:
            raise HTTPException(status_code=400, detail="Name required for new users")
        user = user_auth_manager.create_user(request.email, request.name)
        message = f"Welcome {user.name}!"
    else:
        message = f"Welcome back {user.name}!"

    # Create session
    user_auth_manager.update_last_login(user.user_id)
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

    return LoginResponse(
        user_id=user.user_id,
        email=user.email,
        name=user.name,
        session_id=session_id,
        message=message
    )


@router.post("/logout")
async def logout(response: Response, session_id: str = Cookie(None)):
    """Logout user."""
    if session_id and session_manager:
        session_manager.invalidate_session(session_id)

    response.delete_cookie("session_id")
    return {"message": "Logged out successfully"}


@router.get("/me", response_model=UserResponse)
async def get_current_user(session_id: str = Cookie(None)):
    """Get current user info."""
    if not session_id or not session_manager or not user_auth_manager:
        raise HTTPException(status_code=401, detail="Not authenticated")

    user_id = session_manager.validate_session(session_id)
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid session")

    user = user_auth_manager.get_user(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return UserResponse(
        user_id=user.user_id,
        email=user.email,
        name=user.name,
        created_at=user.created_at,
        last_login=user.last_login,
        is_active=user.is_active
    )


@router.get("/verify-session")
async def verify_session(session_id: str = Cookie(None)):
    """Verify if session is valid."""
    if not session_id or not session_manager:
        return {"valid": False}

    user_id = session_manager.validate_session(session_id)
    return {"valid": user_id is not None, "user_id": user_id}


def register_auth_endpoints(app):
    """Register auth endpoints with FastAPI app."""
    app.include_router(router)


def get_current_user_id(session_id: Optional[str]) -> str:
    """Helper to extract user_id from session."""
    if not session_id or not session_manager:
        raise HTTPException(status_code=401, detail="Not authenticated")

    user_id = session_manager.validate_session(session_id)
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid session")

    return user_id
