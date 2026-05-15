#!/usr/bin/env python3
from __future__ import annotations

import subprocess
from pathlib import Path


MAILCOW_DIR = Path("vendor") / "mailcow-dockerized"


def run(command: list[str]) -> None:
    subprocess.run(command, cwd=MAILCOW_DIR, check=True)


def main() -> int:
    if not MAILCOW_DIR.exists():
        print("No se encontro vendor/mailcow-dockerized.")
        print("Ejecuta: git submodule update --init --recursive")
        return 1

    env_path = MAILCOW_DIR / ".env"
    if not env_path.exists():
        print("Falta vendor/mailcow-dockerized/.env")
        print("Ejecuta primero: python setup_mailcow.py")
        return 1

    run(["docker", "compose", "up", "-d"])
    run(["docker", "compose", "ps"])
    print("Mailcow quedo levantado desde el submodulo.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
