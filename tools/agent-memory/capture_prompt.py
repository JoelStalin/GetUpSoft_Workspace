#!/usr/bin/env python3
"""Hook UserPromptSubmit: captura cada prompt en agent-memory.db.

No usa ningun LLM -- es un script determinista. Nunca debe bloquear ni fallar
el envio del prompt: cualquier error se registra en stderr y el script sale
con codigo 0.

Contrato del hook (stdin, JSON de Claude Code):
    {"session_id": "...", "cwd": "...", "hook_event_name": "UserPromptSubmit",
     "prompt": "texto del usuario", ...}

Uso manual / pruebas:
    echo '{"prompt": "hola mundo"}' | python capture_prompt.py
"""
import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from db import connect, hex_id  # noqa: E402
from embeddings import cosine_similarity, embed, pack_vector, unpack_vector  # noqa: E402

WORD_RE = re.compile(r"[^\W_]+", re.UNICODE)
SIMILARITY_THRESHOLD = 0.92


def tokenize(text: str) -> list[str]:
    return [w.lower() for w in WORD_RE.findall(text)]


def get_or_create_word_id(conn, word: str) -> int:
    row = conn.execute("SELECT id FROM dictionary WHERE word = ?", (word,)).fetchone()
    if row:
        return row["id"]
    cur = conn.execute("INSERT INTO dictionary(word) VALUES (?)", (word,))
    return cur.lastrowid


def store_prompt(conn, raw_text: str, session_id: str | None, agent_id: str | None) -> int:
    cur = conn.execute(
        "INSERT INTO prompts(session_id, agent_id, raw_text) VALUES (?, ?, ?)",
        (session_id, agent_id, raw_text),
    )
    prompt_id = cur.lastrowid
    for position, word in enumerate(tokenize(raw_text)):
        word_id = get_or_create_word_id(conn, word)
        conn.execute(
            "INSERT INTO prompt_tokens(prompt_id, position, word_id) VALUES (?, ?, ?)",
            (prompt_id, position, word_id),
        )
    return prompt_id


def find_similar_prompt(conn, vector: list[float]) -> tuple[int, float] | None:
    """Busca el prompt anterior mas parecido (coseno) para evitar tareas repetidas."""
    best = None
    for row in conn.execute("SELECT prompt_id, model, dim, vector FROM embeddings"):
        candidate = unpack_vector(row["vector"], row["dim"])
        score = cosine_similarity(vector, candidate)
        if best is None or score > best[1]:
            best = (row["prompt_id"], score)
    if best and best[1] >= SIMILARITY_THRESHOLD:
        return best
    return None


def store_embedding(conn, prompt_id: int, raw_text: str) -> None:
    vector, model = embed(raw_text)
    if vector is None:
        return  # Ollama no disponible -- se omite, no es un error fatal.
    similar = find_similar_prompt(conn, vector)
    conn.execute(
        "INSERT INTO embeddings(prompt_id, model, dim, vector) VALUES (?, ?, ?, ?)",
        (prompt_id, model, len(vector), pack_vector(vector)),
    )
    if similar:
        similar_id, score = similar
        sys.stderr.write(
            f"[agent-memory] prompt similar ya visto (id={similar_id}, "
            f"similitud={score:.2f})\n"
        )


def main() -> int:
    try:
        raw_input = sys.stdin.read()
        payload = json.loads(raw_input) if raw_input.strip() else {}
    except json.JSONDecodeError:
        payload = {"prompt": raw_input}

    prompt_text = payload.get("prompt") or payload.get("text") or ""
    if not prompt_text.strip():
        return 0  # nada que capturar

    session_id = payload.get("session_id")
    agent_id = payload.get("agent_id", "claude-code")

    try:
        conn = connect()
        with conn:
            prompt_id = store_prompt(conn, prompt_text, session_id, agent_id)
            store_embedding(conn, prompt_id, prompt_text)
        conn.close()
    except Exception as exc:  # nunca bloquear el prompt del usuario por esto
        sys.stderr.write(f"[agent-memory] captura fallo (no bloqueante): {exc}\n")

    return 0


if __name__ == "__main__":
    sys.exit(main())
