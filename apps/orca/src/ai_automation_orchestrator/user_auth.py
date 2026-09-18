"""User authentication system for Orca."""

import json
from datetime import datetime
from pathlib import Path
from typing import Optional
from pydantic import BaseModel, Field, EmailStr
import hashlib
import uuid


class UserProfile(BaseModel):
    """User profile model."""
    user_id: str
    email: str
    name: str
    created_at: str
    last_login: str
    is_active: bool = True
    password_hash: Optional[str] = None  # Optional password hash for login
    is_root: bool = False  # Root/admin user flag
    provider_configs: dict = Field(default_factory=dict)  # {provider_id: config_data}


class UserAuthManager:
    """Manages user authentication and profiles."""

    def __init__(self, storage_path: str = "data/users.json"):
        self.storage_path = Path(storage_path)
        self.storage_path.parent.mkdir(parents=True, exist_ok=True)
        self.users: dict[str, UserProfile] = {}
        self._load_users()

    def _load_users(self):
        """Load users from storage."""
        if self.storage_path.exists():
            with open(self.storage_path) as f:
                data = json.load(f)
                self.users = {uid: UserProfile(**u) for uid, u in data.items()}

    def _save_users(self):
        """Save users to storage."""
        with open(self.storage_path, 'w') as f:
            json.dump({uid: u.model_dump() for uid, u in self.users.items()}, f, indent=2)

    def create_user(self, email: str, name: str, password_hash: Optional[str] = None, is_root: bool = False) -> UserProfile:
        """Create a new user."""
        user_id = str(uuid.uuid4())
        now = datetime.utcnow().isoformat()

        user = UserProfile(
            user_id=user_id,
            email=email,
            name=name,
            created_at=now,
            last_login=now,
            password_hash=password_hash,
            is_root=is_root
        )
        self.users[user_id] = user
        self._save_users()
        return user

    def get_user(self, user_id: str) -> Optional[UserProfile]:
        """Get user by ID."""
        return self.users.get(user_id)

    def get_user_by_email(self, email: str) -> Optional[UserProfile]:
        """Get user by email."""
        for user in self.users.values():
            if user.email == email:
                return user
        return None

    def update_last_login(self, user_id: str):
        """Update user's last login time."""
        if user_id in self.users:
            self.users[user_id].last_login = datetime.utcnow().isoformat()
            self._save_users()

    def save_provider_config(self, user_id: str, provider_id: str, config: dict):
        """Save provider configuration for user."""
        if user_id not in self.users:
            raise ValueError(f"User {user_id} not found")

        self.users[user_id].provider_configs[provider_id] = {
            "config": config,
            "saved_at": datetime.utcnow().isoformat()
        }
        self._save_users()

    def get_provider_config(self, user_id: str, provider_id: str) -> Optional[dict]:
        """Get provider configuration for user."""
        if user_id not in self.users:
            return None

        return self.users[user_id].provider_configs.get(provider_id)

    def list_users(self) -> list[UserProfile]:
        """List all users."""
        return list(self.users.values())

    def verify_password(self, user_id: str, password: str) -> bool:
        """Verify user's password.

        Args:
            user_id: User ID
            password: Plain text password to verify

        Returns:
            True if password is correct, False otherwise
        """
        if user_id not in self.users:
            return False

        user = self.users[user_id]
        if not user.password_hash:
            return False

        # Import here to avoid circular imports
        from .password_auth import verify_password
        return verify_password(password, user.password_hash)


class SessionManager:
    """Manages user sessions."""

    def __init__(self, storage_path: str = "data/sessions.json"):
        self.storage_path = Path(storage_path)
        self.storage_path.parent.mkdir(parents=True, exist_ok=True)
        self.sessions: dict[str, dict] = {}
        self._load_sessions()

    def _load_sessions(self):
        """Load sessions from storage."""
        if self.storage_path.exists():
            with open(self.storage_path) as f:
                self.sessions = json.load(f)

    def _save_sessions(self):
        """Save sessions to storage."""
        with open(self.storage_path, 'w') as f:
            json.dump(self.sessions, f, indent=2)

    def create_session(self, user_id: str) -> str:
        """Create a new session."""
        session_id = str(uuid.uuid4())
        self.sessions[session_id] = {
            "user_id": user_id,
            "created_at": datetime.utcnow().isoformat(),
            "last_activity": datetime.utcnow().isoformat()
        }
        self._save_sessions()
        return session_id

    def get_session(self, session_id: str) -> Optional[dict]:
        """Get session info."""
        return self.sessions.get(session_id)

    def invalidate_session(self, session_id: str):
        """Invalidate a session."""
        if session_id in self.sessions:
            del self.sessions[session_id]
            self._save_sessions()

    def validate_session(self, session_id: str) -> Optional[str]:
        """Validate session and return user_id if valid."""
        session = self.sessions.get(session_id)
        if session:
            self.sessions[session_id]["last_activity"] = datetime.utcnow().isoformat()
            self._save_sessions()
            return session["user_id"]
        return None
