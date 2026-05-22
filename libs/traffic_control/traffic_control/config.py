from __future__ import annotations

from dataclasses import dataclass, field
from ipaddress import ip_address
from pathlib import Path
from typing import Any

import yaml


@dataclass(frozen=True)
class TrafficControlConfig:
    allowed_targets: tuple[str, ...]
    allowed_client_domains: tuple[str, ...] = ()
    output_dir: Path = Path(".traffic-control")
    nmap_args: tuple[str, ...] = ("-sV", "--top-ports", "100")
    capture_seconds: int = 60
    capture_packet_limit: int = 1000
    raw: dict[str, Any] = field(default_factory=dict)


def load_config(path: Path) -> TrafficControlConfig:
    if not path.exists():
        raise FileNotFoundError(f"Config file not found: {path}")

    data = yaml.safe_load(path.read_text(encoding="utf-8")) or {}
    allowed = data.get("allowed_targets") or []
    if not isinstance(allowed, list) or not all(isinstance(item, str) for item in allowed):
        raise ValueError("Config must define allowed_targets as a list of domains or IPs")
    allowed_client_domains = data.get("allowed_client_domains") or []
    if not isinstance(allowed_client_domains, list) or not all(
        isinstance(item, str) for item in allowed_client_domains
    ):
        raise ValueError("allowed_client_domains must be a list of domains")

    defaults = data.get("defaults") or {}
    nmap_args = defaults.get("nmap_args", ["-sV", "--top-ports", "100"])
    if not isinstance(nmap_args, list) or not all(isinstance(item, str) for item in nmap_args):
        raise ValueError("defaults.nmap_args must be a list of strings")

    return TrafficControlConfig(
        allowed_targets=tuple(normalize_target(item) for item in allowed),
        allowed_client_domains=tuple(normalize_target(item) for item in allowed_client_domains),
        output_dir=Path(defaults.get("output_dir", ".traffic-control")),
        nmap_args=tuple(nmap_args),
        capture_seconds=int(defaults.get("capture_seconds", 60)),
        capture_packet_limit=int(defaults.get("capture_packet_limit", 1000)),
        raw=data,
    )


def normalize_target(target: str) -> str:
    value = target.strip().lower()
    if not value:
        raise ValueError("Target cannot be empty")
    if value.startswith("http://") or value.startswith("https://"):
        value = value.split("://", 1)[1]
    value = value.split("/", 1)[0]
    value = value.split(":", 1)[0] if not value.startswith("[") else value
    try:
        return str(ip_address(value))
    except ValueError:
        return value.rstrip(".")
