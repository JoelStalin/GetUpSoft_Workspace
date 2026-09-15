#!/usr/bin/env python3
"""Chequeo determinista de condiciones de parada -- reemplaza la
re-evaluacion completa por LLM en cada intento de Stop.

No usa ningun LLM. Se ejecuta desde el directorio del proyecto (usa
subprocess para git, y consulta agent-memory.db para log_findings sin
resolver). Imprime un resumen en texto plano y sale con codigo 0 si no hay
nada pendiente, 1 si hay algo que revisar (el hook Stop en prompt.json
decide que hacer con ese resultado).

Uso:
    python check_stop_conditions.py [--repo <ruta>]
"""
import subprocess
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
from db import connect  # noqa: E402


def run_git(repo: Path, *args: str) -> str:
    try:
        result = subprocess.run(
            ["git", "-C", str(repo), *args],
            capture_output=True, text=True, timeout=15,
        )
        return result.stdout.strip()
    except (subprocess.SubprocessError, OSError):
        return ""


def check(repo: Path) -> tuple[bool, list[str]]:
    """Devuelve (todo_limpio, lista_de_pendientes)."""
    pending = []

    status = run_git(repo, "status", "--short")
    tracked_changes = [
        line for line in status.splitlines() if not line.startswith("??")
    ]
    if tracked_changes:
        pending.append(f"{len(tracked_changes)} cambio(s) trackeado(s) sin comitear")

    diff = run_git(repo, "diff", "--stat")
    if diff:
        pending.append("hay diferencias sin comitear (git diff no vacio)")

    staged = run_git(repo, "diff", "--staged", "--stat")
    if staged:
        pending.append("hay cambios en staging sin comitear (git diff --staged no vacio)")

    ahead_behind = run_git(repo, "status", "--short", "--branch")
    if "[ahead" in ahead_behind:
        pending.append("hay commits locales sin push")

    try:
        conn = connect()
        unresolved = conn.execute(
            "SELECT COUNT(*) c FROM log_findings WHERE resolved = 0"
        ).fetchone()["c"]
        conn.close()
        if unresolved:
            pending.append(f"{unresolved} hallazgo(s) de log sin resolver (ver scan_logs.py)")
    except Exception:
        pass  # DB no disponible no bloquea el chequeo de git

    return (len(pending) == 0, pending)


def main() -> int:
    repo = Path(sys.argv[2]) if len(sys.argv) > 2 and sys.argv[1] == "--repo" else Path.cwd()
    clean, pending = check(repo)
    if clean:
        print("OK: sin cambios pendientes, sin hallazgos de log sin resolver.")
        return 0
    print("PENDIENTE:")
    for item in pending:
        print(f"  - {item}")
    return 1


if __name__ == "__main__":
    sys.exit(main())
