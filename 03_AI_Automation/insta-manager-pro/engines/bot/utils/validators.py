"""
validators.py — URL and domain validation helpers.
"""

from __future__ import annotations
from urllib.parse import urlparse


def extract_domain(url: str) -> str:
    """Return the netloc (host) from a URL, lowercased, without www. prefix."""
    parsed = urlparse(url)
    host = parsed.netloc.lower()
    if host.startswith("www."):
        host = host[4:]
    return host


def is_domain_allowed(url: str, allowed_domains: list[str]) -> bool:
    """
    Return True if the URL's domain matches any entry in allowed_domains.
    Comparison is done after stripping www. from both sides.
    """
    domain = extract_domain(url)
    normalized = [d.lower().lstrip("www.") for d in allowed_domains]
    return any(domain == d or domain.endswith("." + d) for d in normalized)


def is_valid_url(url: str) -> bool:
    """Basic sanity check: must have scheme and netloc."""
    try:
        p = urlparse(url)
        return bool(p.scheme in ("http", "https") and p.netloc)
    except Exception:
        return False


def sanitize_name(name: str) -> str:
    """
    Strip leading/trailing whitespace, collapse internal spaces,
    and remove characters that could break message formatting.
    """
    import re
    name = name.strip()
    name = re.sub(r"\s+", " ", name)
    # Remove control characters
    name = re.sub(r"[\x00-\x1f\x7f]", "", name)
    return name
