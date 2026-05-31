from __future__ import annotations

import json
import shutil
import subprocess
from datetime import datetime, timezone
from pathlib import Path

from .config import TrafficControlConfig
from .scope import assert_allowed


def timestamp() -> str:
    return datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")


def require_binary(name: str) -> str:
    found = shutil.which(name)
    if not found:
        raise RuntimeError(f"Required binary not found on PATH: {name}")
    return found


def ensure_output_dir(config: TrafficControlConfig) -> Path:
    config.output_dir.mkdir(parents=True, exist_ok=True)
    return config.output_dir


def run_nmap(target: str, config: TrafficControlConfig, extra_args: list[str] | None = None) -> Path:
    checked = assert_allowed(target, config)
    nmap = require_binary("nmap")
    out_dir = ensure_output_dir(config)
    output = out_dir / f"nmap-{checked}-{timestamp()}.xml"
    command = [nmap, *config.nmap_args, "-oX", str(output), checked]
    if extra_args:
        command = [nmap, *extra_args, "-oX", str(output), checked]
    subprocess.run(command, check=True)
    return output


def run_tshark_capture(
    target: str,
    interface: str,
    config: TrafficControlConfig,
    seconds: int | None = None,
    packet_limit: int | None = None,
) -> Path:
    checked = assert_allowed(target, config)
    tshark = require_binary("tshark")
    out_dir = ensure_output_dir(config)
    output = out_dir / f"capture-{checked}-{timestamp()}.pcapng"
    duration = str(seconds or config.capture_seconds)
    packets = str(packet_limit or config.capture_packet_limit)
    display_filter = f"host {checked}"
    command = [
        tshark,
        "-i",
        interface,
        "-f",
        display_filter,
        "-a",
        f"duration:{duration}",
        "-c",
        packets,
        "-w",
        str(output),
    ]
    subprocess.run(command, check=True)
    return output


def write_json_report(path: Path, payload: dict[str, object]) -> Path:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, indent=2, sort_keys=True), encoding="utf-8")
    return path
