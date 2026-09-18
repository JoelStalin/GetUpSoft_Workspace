"""Conexion compartida a agent-memory.db (SQLite).

Un solo archivo local, WAL activado para que ORCA pueda leer mientras un
agente escribe. Ver schema.sql para la estructura completa.
"""
import sqlite3
from pathlib import Path

HERE = Path(__file__).resolve().parent
REPO_ROOT = HERE.parent.parent
DEFAULT_DB_PATH = REPO_ROOT / "platform" / "orca" / ".runtime" / "data" / "agent-memory.db"
SCHEMA_PATH = HERE / "schema.sql"


def connect(db_path: Path = DEFAULT_DB_PATH) -> sqlite3.Connection:
    """Abre (creando si hace falta) la DB y aplica el schema. Idempotente."""
    db_path.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(str(db_path), timeout=10)
    conn.row_factory = sqlite3.Row
    conn.executescript(SCHEMA_PATH.read_text(encoding="utf-8"))
    return conn


def hex_id(word_id: int) -> str:
    """Representa el id de una palabra del diccionario como codigo hex."""
    return f"0x{word_id:X}"
