"""Provider OAuth and authentication management."""

from abc import ABC, abstractmethod
from dataclasses import dataclass, field, asdict
from datetime import datetime, timedelta
from enum import Enum
import json
import secrets
from pathlib import Path
from typing import Any, Optional, Dict
from urllib.parse import urlencode
import httpx

import logging
logger = logging.getLogger(__name__)


class AuthStatus(str, Enum):
    """Authentication status."""
    CONNECTED = "connected"
    DISCONNECTED = "disconnected"
    EXPIRED = "expired"
    ERROR = "error"


@dataclass
class OAuthToken:
    """OAuth token with expiration."""
    access_token: str
    refresh_token: Optional[str] = None
    token_type: str = "Bearer"
    expires_at: Optional[float] = None
    scope: Optional[str] = None

    def is_expired(self) -> bool:
        if not self.expires_at:
            return False
        return datetime.utcnow().timestamp() > self.expires_at

    def to_dict(self) -> dict:
        return asdict(self)

    @classmethod
    def from_dict(cls, data: dict) -> "OAuthToken":
        return cls(**data)


@dataclass
class ProviderSession:
    """Provider authentication session."""
    provider: str
    user_id: str
    token: Optional[OAuthToken] = None
    status: AuthStatus = AuthStatus.DISCONNECTED
    last_login: Optional[datetime] = None
    metadata: Dict[str, Any] = field(default_factory=dict)

    def is_valid(self) -> bool:
        if not self.token:
            return False
        if self.token.is_expired():
            self.status = AuthStatus.EXPIRED
            return False
        return self.status == AuthStatus.CONNECTED

    def to_dict(self) -> dict:
        data = asdict(self)
        data["token"] = self.token.to_dict() if self.token else None
        data["status"] = self.status.value
        data["last_login"] = self.last_login.isoformat() if self.last_login else None
        return data


class AuthProvider(ABC):
    """Abstract base for provider authentication."""

    def __init__(self, provider_id: str, config: dict):
        self.provider_id = provider_id
        self.config = config

    @abstractmethod
    def get_login_url(self, state: str, redirect_uri: str) -> str:
        """Get OAuth login URL."""
        pass

    @abstractmethod
    async def exchange_code(self, code: str, redirect_uri: str) -> OAuthToken:
        """Exchange authorization code for access token."""
        pass

    @abstractmethod
    async def refresh_token(self, refresh_token: str) -> OAuthToken:
        """Refresh access token."""
        pass

    async def verify_token(self, token: str) -> bool:
        """Verify token is valid."""
        return True


class GoogleOAuthProvider(AuthProvider):
    """Google OAuth provider for Gemini."""

    def get_login_url(self, state: str, redirect_uri: str) -> str:
        params = {
            "client_id": self.config["client_id"],
            "redirect_uri": redirect_uri,
            "response_type": "code",
            "scope": " ".join(self.config.get("scopes", ["openid", "email", "profile"])),
            "state": state,
            "access_type": "offline",
            "prompt": "consent"
        }
        return f"https://accounts.google.com/o/oauth2/v2/auth?{urlencode(params)}"

    async def exchange_code(self, code: str, redirect_uri: str) -> OAuthToken:
        async with httpx.AsyncClient() as client:
            resp = await client.post(
                "https://oauth2.googleapis.com/token",
                data={
                    "client_id": self.config["client_id"],
                    "client_secret": self.config["client_secret"],
                    "code": code,
                    "grant_type": "authorization_code",
                    "redirect_uri": redirect_uri
                }
            )
            resp.raise_for_status()
            data = resp.json()

            expires_at = None
            if "expires_in" in data:
                expires_at = datetime.utcnow().timestamp() + data["expires_in"]

            return OAuthToken(
                access_token=data["access_token"],
                refresh_token=data.get("refresh_token"),
                expires_at=expires_at,
                scope=data.get("scope")
            )

    async def refresh_token(self, refresh_token: str) -> OAuthToken:
        async with httpx.AsyncClient() as client:
            resp = await client.post(
                "https://oauth2.googleapis.com/token",
                data={
                    "client_id": self.config["client_id"],
                    "client_secret": self.config["client_secret"],
                    "refresh_token": refresh_token,
                    "grant_type": "refresh_token"
                }
            )
            resp.raise_for_status()
            data = resp.json()

            expires_at = None
            if "expires_in" in data:
                expires_at = datetime.utcnow().timestamp() + data["expires_in"]

            return OAuthToken(
                access_token=data["access_token"],
                refresh_token=refresh_token,
                expires_at=expires_at
            )


class APIKeyAuthProvider(AuthProvider):
    """Simple API key provider."""

    def get_login_url(self, state: str, redirect_uri: str) -> str:
        # For API key providers, return a special redirect to input form
        return f"{redirect_uri}?provider={self.provider_id}&state={state}&method=apikey"

    async def exchange_code(self, code: str, redirect_uri: str) -> OAuthToken:
        # For API key, code is the actual API key
        return OAuthToken(
            access_token=code,
            token_type="APIKey"
        )

    async def refresh_token(self, refresh_token: str) -> OAuthToken:
        # API keys don't refresh
        return OAuthToken(access_token=refresh_token, token_type="APIKey")


class ProviderAuthManager:
    """Manage provider authentication sessions."""

    def __init__(self, storage_path: str = None):
        self.storage_path = Path(storage_path) if storage_path else Path.home() / ".orca" / "provider_auth.json"
        self.storage_path.parent.mkdir(parents=True, exist_ok=True)
        self.sessions: Dict[tuple, ProviderSession] = {}
        self._load_sessions()
        self.providers: Dict[str, AuthProvider] = {}

    def register_provider(self, provider_id: str, provider: AuthProvider):
        """Register an OAuth provider."""
        self.providers[provider_id] = provider

    def create_auth_state(self, provider: str, user_id: str) -> str:
        """Create a secure state token for OAuth."""
        state = secrets.token_urlsafe(32)
        self.sessions[(provider, user_id, state)] = ProviderSession(provider, user_id)
        return state

    def get_session(self, provider: str, user_id: str) -> Optional[ProviderSession]:
        """Get provider session for user."""
        # Check main sessions
        for (p, uid), session in list(self.sessions.items()):
            if p == provider and uid == user_id and not isinstance(p, tuple):
                return session
        # Load from disk
        key = f"{provider}:{user_id}"
        sessions = self._load_sessions()
        return sessions.get(key)

    def save_session(self, session: ProviderSession):
        """Save provider session."""
        session.last_login = datetime.utcnow()
        key = f"{session.provider}:{session.user_id}"
        sessions = self._load_sessions()
        sessions[key] = session
        self._write_sessions(sessions)

    def _load_sessions(self) -> Dict[str, ProviderSession]:
        """Load sessions from disk."""
        if not self.storage_path.exists():
            return {}
        try:
            with open(self.storage_path) as f:
                data = json.load(f)
            return {
                k: ProviderSession(
                    provider=v["provider"],
                    user_id=v["user_id"],
                    token=OAuthToken.from_dict(v["token"]) if v.get("token") else None,
                    status=AuthStatus(v.get("status", "disconnected"))
                )
                for k, v in data.items()
            }
        except Exception as e:
            logger.error(f"Failed to load sessions: {e}")
            return {}

    def _write_sessions(self, sessions: Dict[str, ProviderSession]):
        """Write sessions to disk."""
        try:
            data = {k: v.to_dict() for k, v in sessions.items()}
            with open(self.storage_path, "w") as f:
                json.dump(data, f, indent=2, default=str)
        except Exception as e:
            logger.error(f"Failed to save sessions: {e}")
