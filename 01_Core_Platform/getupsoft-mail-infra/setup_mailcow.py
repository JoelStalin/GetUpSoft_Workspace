#!/usr/bin/env python3
from __future__ import annotations

import os
from pathlib import Path


MAILCOW_DIR = Path("vendor") / "mailcow-dockerized"


def build_mailcow_env() -> str:
    hostname = os.getenv("MAILCOW_HOSTNAME", "mail.getupsoft.com.do")
    timezone = os.getenv("MAILCOW_TZ", "America/Santo_Domingo")
    project_name = os.getenv("MAILCOW_PROJECT_NAME", "mailcow")
    return "\n".join(
        [
            f"COMPOSE_PROJECT_NAME={project_name}",
            f"MAILCOW_HOSTNAME={hostname}",
            f"MAILCOW_TZ={timezone}",
            "MAILCOW_DOCKER_LABELS=com.getupsoft=mail",
            "LOG_LINES=9999",
            "SKIP_CLAMD=n",
            "SKIP_IP_CHECK=n",
            "SKIP_EXTERNAL_CHECKS=n",
            "SKIP_SOGO=n",
            "ENABLE_SSL_SNI=y",
            "ENABLE_TLS_SNI=y",
            "",
        ]
    )


def main() -> int:
    if not MAILCOW_DIR.exists():
        print("No se encontro el submodulo vendor/mailcow-dockerized.")
        print("Ejecuta: git submodule update --init --recursive")
        return 1

    env_path = MAILCOW_DIR / ".env"
    if env_path.exists():
        print(f"Configuracion existente detectada en {env_path}")
    else:
        env_path.write_text(build_mailcow_env(), encoding="utf-8")
        print(f"Se creo {env_path}")

    print("Siguientes pasos:")
    print("1. Revisa vendor/mailcow-dockerized/mailcow.conf y .env")
    print("2. Ejecuta: python start_mailcow.py")
    print("3. Configura DNS/MX/SPF/DKIM/DMARC desde los runbooks de este repo")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
