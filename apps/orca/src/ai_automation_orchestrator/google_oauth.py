"""Google OAuth 2.0 implementation."""

import os
import json
from typing import Optional
from urllib.parse import urlencode
import httpx
from datetime import datetime
from pathlib import Path


class GoogleOAuthConfig:
    """Google OAuth configuration."""

    def __init__(self, client_id: str, client_secret: str, redirect_uri: str):
        self.client_id = client_id
        self.client_secret = client_secret
        self.redirect_uri = redirect_uri
        self.auth_url = "https://accounts.google.com/o/oauth2/v2/auth"
        self.token_url = "https://oauth2.googleapis.com/token"
        self.userinfo_url = "https://openidconnect.googleapis.com/v1/userinfo"


class GoogleOAuthManager:
    """Manages Google OAuth flow."""

    def __init__(self, client_id: str, client_secret: str, redirect_uri: str = "http://localhost:8015/api/auth/google/callback"):
        self.config = GoogleOAuthConfig(client_id, client_secret, redirect_uri)
        self.state_store: dict = {}  # In-memory state storage (use Redis in production)

    def get_authorization_url(self, state: str, scopes: Optional[list] = None) -> str:
        """Get Google authorization URL.

        Args:
            state: CSRF protection token
            scopes: OAuth scopes to request

        Returns:
            Authorization URL
        """
        if scopes is None:
            scopes = ["openid", "email", "profile"]

        params = {
            "client_id": self.config.client_id,
            "redirect_uri": self.config.redirect_uri,
            "response_type": "code",
            "scope": " ".join(scopes),
            "state": state,
            "access_type": "online",
            "prompt": "consent"
        }

        return f"{self.config.auth_url}?{urlencode(params)}"

    async def exchange_code_for_token(self, code: str) -> dict:
        """Exchange authorization code for access token.

        Args:
            code: Authorization code from Google

        Returns:
            Token response with access_token, id_token, etc.
        """
        async with httpx.AsyncClient() as client:
            response = await client.post(
                self.config.token_url,
                data={
                    "client_id": self.config.client_id,
                    "client_secret": self.config.client_secret,
                    "code": code,
                    "grant_type": "authorization_code",
                    "redirect_uri": self.config.redirect_uri
                },
                timeout=10.0
            )
            response.raise_for_status()
            return response.json()

    async def get_user_info(self, access_token: str) -> dict:
        """Get user info from Google.

        Args:
            access_token: Google access token

        Returns:
            User info (email, name, picture, etc.)
        """
        async with httpx.AsyncClient() as client:
            response = await client.get(
                self.config.userinfo_url,
                headers={"Authorization": f"Bearer {access_token}"},
                timeout=10.0
            )
            response.raise_for_status()
            return response.json()

    async def authenticate_with_google(self, code: str) -> dict:
        """Complete Google authentication flow.

        Args:
            code: Authorization code from Google callback

        Returns:
            User info from Google
        """
        # Exchange code for tokens
        token_response = await self.exchange_code_for_token(code)
        access_token = token_response.get("access_token")

        if not access_token:
            raise ValueError("No access token in response")

        # Get user info
        user_info = await self.get_user_info(access_token)

        return {
            "email": user_info.get("email"),
            "name": user_info.get("name"),
            "picture": user_info.get("picture"),
            "sub": user_info.get("sub"),  # Google unique ID
            "email_verified": user_info.get("email_verified", False),
            "access_token": access_token,
            "id_token": token_response.get("id_token"),
            "token_type": token_response.get("token_type", "Bearer"),
            "expires_in": token_response.get("expires_in"),
            "authenticated_at": datetime.utcnow().isoformat()
        }


def load_google_oauth_config(env_file: str = ".env") -> Optional[GoogleOAuthConfig]:
    """Load Google OAuth config from environment or .env file.

    Args:
        env_file: Path to .env file

    Returns:
        GoogleOAuthConfig or None if not configured
    """
    # Try environment variables first
    client_id = os.getenv("GOOGLE_OAUTH_CLIENT_ID")
    client_secret = os.getenv("GOOGLE_OAUTH_CLIENT_SECRET")
    redirect_uri = os.getenv("GOOGLE_OAUTH_REDIRECT_URI", "http://localhost:8015/api/auth/google/callback")

    # Try .env file
    if not client_id and Path(env_file).exists():
        try:
            with open(env_file) as f:
                for line in f:
                    if line.startswith("GOOGLE_OAUTH_CLIENT_ID="):
                        client_id = line.split("=", 1)[1].strip()
                    elif line.startswith("GOOGLE_OAUTH_CLIENT_SECRET="):
                        client_secret = line.split("=", 1)[1].strip()
        except Exception:
            pass

    if client_id and client_secret:
        return GoogleOAuthConfig(client_id, client_secret, redirect_uri)

    return None
