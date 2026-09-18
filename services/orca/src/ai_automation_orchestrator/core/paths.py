from __future__ import annotations

import os
from pathlib import Path


def orca_root() -> Path:
    env_root = os.environ.get("ORCA_ROOT") or os.environ.get("ORCA_WORKDIR")
    if env_root:
        candidate = Path(env_root).expanduser().resolve()
        if candidate.exists():
            return candidate

    cwd = Path.cwd().resolve()
    for candidate in (cwd, cwd / "apps" / "orca"):
        if (candidate / "config").exists() and (candidate / "src").exists():
            return candidate

    return Path(__file__).resolve().parents[3]


def workspace_root() -> Path:
    env_root = os.environ.get("WORKSPACE_ROOT") or os.environ.get("GETUPSOFT_WORKSPACE_ROOT")
    if env_root:
        candidate = Path(env_root).expanduser().resolve()
        if candidate.exists():
            return candidate

    candidate = Path.cwd().resolve()
    if (candidate / "apps").exists() or (candidate / ".agents").exists() or (candidate / "_Knowledge_Center").exists():
        return candidate

    return orca_root()


def orca_config_path(filename: str) -> Path:
    return orca_root() / "config" / filename


def workspace_path(*parts: str) -> Path:
    return workspace_root().joinpath(*parts)
