#!/usr/bin/env python3
from __future__ import annotations

import os
import smtplib
from email.mime.text import MIMEText
from pathlib import Path


def load_env_file(path: Path) -> None:
    if not path.exists():
        return
    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip())


def main() -> int:
    load_env_file(Path(".env"))

    smtp_host = os.getenv("SMTP_HOST", "mail.getupsoft.com.do")
    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    smtp_user = os.getenv("SMTP_USER", "")
    smtp_pass = os.getenv("SMTP_PASS", "")
    smtp_from = os.getenv("SMTP_FROM", "sistema@getupsoft.com.do")
    smtp_to = os.getenv("SMTP_TEST_TO", smtp_from)
    smtp_secure = os.getenv("SMTP_SECURE", "true").lower() == "true"

    if not smtp_user or not smtp_pass:
        print("Faltan SMTP_USER o SMTP_PASS en .env")
        return 1

    message = MIMEText("Prueba SMTP desde getupsoft-mail-infra.", "plain", "utf-8")
    message["Subject"] = "SMTP test - GetUpSoft"
    message["From"] = smtp_from
    message["To"] = smtp_to

    with smtplib.SMTP(smtp_host, smtp_port, timeout=15) as server:
        if smtp_secure:
            server.starttls()
        server.login(smtp_user, smtp_pass)
        server.sendmail(smtp_from, [smtp_to], message.as_string())

    print(f"Correo enviado a {smtp_to}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
