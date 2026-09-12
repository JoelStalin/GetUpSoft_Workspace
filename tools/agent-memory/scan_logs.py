#!/usr/bin/env python3
"""Escanea logs conocidos del repo en busca de ERROR/WARN/FAIL/Exception
sin resolver y los registra en agent-memory.db (tabla log_findings).

No usa ningun LLM. Se ejecuta bajo demanda o desde el hook Stop.

Uso:
    python scan_logs.py            # escanea y reporta
    python scan_logs.py --resolve <id>   # marca un hallazgo como resuelto
"""
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from db import connect  # noqa: E402

REPO_ROOT = Path(__file__).resolve().parent.parent.parent

LOG_GLOBS = [
    "task-ledger/evidence/**/*.log",
    "apps/orca/workflow-editor/*.log",
    ".runtime/logs/**/*.log",
    "platform/*/logs/**/*.log",
]

LEVEL_RE = re.compile(r"\b(ERROR|WARN(?:ING)?|FAIL(?:ED)?|EXCEPTION|Traceback)\b", re.IGNORECASE)


def normalize_level(match: str) -> str:
    m = match.upper()
    if m.startswith("ERROR"):
        return "ERROR"
    if m.startswith("WARN"):
        return "WARN"
    if m.startswith("FAIL"):
        return "FAIL"
    return "EXCEPTION"


def scan_file(path: Path) -> list[tuple[int, str, str]]:
    findings = []
    try:
        with path.open("r", encoding="utf-8", errors="ignore") as f:
            for lineno, line in enumerate(f, start=1):
                match = LEVEL_RE.search(line)
                if match:
                    findings.append((lineno, normalize_level(match.group(1)), line.strip()[:500]))
    except OSError:
        pass
    return findings


def record_finding(conn, file_rel: str, lineno: int, level: str, message: str) -> None:
    conn.execute(
        """
        INSERT INTO log_findings(file, line, level, message, last_seen_at)
        VALUES (?, ?, ?, ?, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
        ON CONFLICT(file, line, message) DO UPDATE SET
            last_seen_at = excluded.last_seen_at
        """,
        (file_rel, lineno, level, message),
    )


def scan_all() -> int:
    conn = connect()
    total = 0
    with conn:
        for pattern in LOG_GLOBS:
            for path in REPO_ROOT.glob(pattern):
                if not path.is_file():
                    continue
                rel = str(path.relative_to(REPO_ROOT))
                for lineno, level, message in scan_file(path):
                    record_finding(conn, rel, lineno, level, message)
                    total += 1
    conn.close()
    return total


def report_unresolved() -> list[dict]:
    conn = connect()
    rows = conn.execute(
        "SELECT id, file, line, level, message FROM log_findings WHERE resolved = 0 "
        "ORDER BY file, line"
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]


def resolve(finding_id: int) -> None:
    conn = connect()
    with conn:
        conn.execute("UPDATE log_findings SET resolved = 1 WHERE id = ?", (finding_id,))
    conn.close()


def main() -> int:
    if len(sys.argv) >= 3 and sys.argv[1] == "--resolve":
        resolve(int(sys.argv[2]))
        print(f"log_finding {sys.argv[2]} marcado resuelto")
        return 0

    scan_all()
    unresolved = report_unresolved()
    if not unresolved:
        print("Sin errores/advertencias sin resolver en los logs conocidos.")
        return 0

    print(f"{len(unresolved)} hallazgo(s) sin resolver:")
    for f in unresolved:
        print(f"  [{f['id']}] {f['level']} {f['file']}:{f['line']} -- {f['message']}")
    return 1


if __name__ == "__main__":
    sys.exit(main())
