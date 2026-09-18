"""Evidence helpers for browser-assisted DGII workflows."""
from __future__ import annotations

from pathlib import Path

from app.observability.evidence import build_run_directory


def evidence_directory(operation_id: str) -> Path:
    run_dir = build_run_directory("browser")
    target = run_dir / operation_id
    target.mkdir(parents=True, exist_ok=True)
    return target

