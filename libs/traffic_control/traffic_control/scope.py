from __future__ import annotations

import socket
from ipaddress import ip_address

from .config import TrafficControlConfig, normalize_target


class ScopeError(ValueError):
    """Raised when a requested target is outside the configured authorization scope."""


def resolve_target(target: str) -> list[str]:
    normalized = normalize_target(target)
    try:
        ip_address(normalized)
        return [normalized]
    except ValueError:
        infos = socket.getaddrinfo(normalized, None, proto=socket.IPPROTO_TCP)
        return sorted({info[4][0] for info in infos})


def assert_allowed(target: str, config: TrafficControlConfig) -> str:
    normalized = normalize_target(target)
    allowed = set(config.allowed_targets)
    if normalized in allowed:
        return normalized

    target_ips = set(resolve_target(normalized))
    allowed_ips: set[str] = set()
    for item in allowed:
        try:
            allowed_ips.add(str(ip_address(item)))
        except ValueError:
            allowed_ips.update(resolve_target(item))

    if target_ips & allowed_ips:
        return normalized

    allowed_list = ", ".join(sorted(allowed)) or "<empty>"
    raise ScopeError(f"Target '{target}' is not in allowed_targets: {allowed_list}")
