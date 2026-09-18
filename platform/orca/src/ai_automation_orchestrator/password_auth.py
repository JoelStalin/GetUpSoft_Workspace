"""Password authentication and hashing."""

import hashlib
import secrets
from typing import Tuple


def hash_password(password: str) -> str:
    """Hash a password with a random salt.

    Args:
        password: Plain text password

    Returns:
        hashed_password (salt$hash format)
    """
    salt = secrets.token_hex(32)  # 64 char random salt
    pwd_hash = hashlib.pbkdf2_hmac(
        'sha256',
        password.encode('utf-8'),
        salt.encode('utf-8'),
        100000  # iterations
    )
    return f"{salt}${pwd_hash.hex()}"


def verify_password(password: str, hashed_password: str) -> bool:
    """Verify a password against a hash.

    Args:
        password: Plain text password to verify
        hashed_password: Hashed password to verify against

    Returns:
        True if password matches, False otherwise
    """
    try:
        salt, pwd_hash = hashed_password.split('$')
        new_hash = hashlib.pbkdf2_hmac(
            'sha256',
            password.encode('utf-8'),
            salt.encode('utf-8'),
            100000
        )
        return new_hash.hex() == pwd_hash
    except Exception:
        return False


def generate_test_hash(password: str = "Pandemia@2020#covid") -> str:
    """Generate a test hash for documentation.

    Args:
        password: Password to hash

    Returns:
        Hashed password
    """
    return hash_password(password)
