"""Initialize root user from environment variables."""

import os
from pathlib import Path
from .user_auth import UserAuthManager
from .password_auth import hash_password


def init_root_user(user_auth_mgr: UserAuthManager, env_file: str = ".env"):
    """Initialize root user from .env configuration.

    Args:
        user_auth_mgr: UserAuthManager instance
        env_file: Path to .env file

    Returns:
        Created root user or None if not configured
    """
    # Load environment variables
    root_email = os.getenv("ROOT_EMAIL")
    root_password = os.getenv("ROOT_PASSWORD")

    # Try .env file if not in environment
    if not root_email and Path(env_file).exists():
        try:
            with open(env_file) as f:
                for line in f:
                    if line.startswith("ROOT_EMAIL="):
                        root_email = line.split("=", 1)[1].strip().strip('"\'')
                    elif line.startswith("ROOT_PASSWORD="):
                        root_password = line.split("=", 1)[1].strip().strip('"\'')
        except Exception as e:
            print(f"Warning: Could not read .env file: {e}")

    if not root_email or not root_password:
        print("ℹ Root user not configured (ROOT_EMAIL/ROOT_PASSWORD not in .env)")
        return None

    # Check if root user already exists
    existing_user = user_auth_mgr.get_user_by_email(root_email)
    if existing_user:
        print(f"✓ Root user already exists: {root_email}")
        return existing_user

    # Create root user
    password_hash = hash_password(root_password)
    root_user = user_auth_mgr.create_user(
        email=root_email,
        name="Root Administrator",
        password_hash=password_hash,
        is_root=True
    )

    print(f"✓ Root user created: {root_email}")
    print(f"✓ User ID: {root_user.user_id}")
    print(f"✓ Is Admin: {root_user.is_root}")
    return root_user


def change_root_password(user_auth_mgr: UserAuthManager, user_id: str, new_password: str):
    """Change root user's password.

    Args:
        user_auth_mgr: UserAuthManager instance
        user_id: Root user ID
        new_password: New password

    Returns:
        Updated user or None if failed
    """
    user = user_auth_mgr.get_user(user_id)
    if not user or not user.is_root:
        raise ValueError("User is not a root/admin user")

    password_hash = hash_password(new_password)
    user.password_hash = password_hash
    user_auth_mgr._save_users()

    print(f"✓ Password updated for: {user.email}")
    return user
