"""Embeddings via Ollama local (best-effort).

Si Ollama no esta corriendo/alcanzable, las funciones devuelven None en vez de
fallar -- la captura de prompts nunca debe bloquearse por esto. La busqueda
semantica simplemente queda deshabilitada hasta que Ollama este disponible.
"""
import json
import struct
import urllib.error
import urllib.request

MODEL = "nomic-embed-text"
ENDPOINTS = [
    "http://localhost:11434/api/embeddings",
    "http://getupsoft-lan:11434/api/embeddings",
]
TIMEOUT_SECONDS = 3


def embed(text: str) -> tuple[list[float], str] | tuple[None, None]:
    """Devuelve (vector, modelo) o (None, None) si ningun endpoint responde."""
    payload = json.dumps({"model": MODEL, "prompt": text}).encode("utf-8")
    for url in ENDPOINTS:
        try:
            req = urllib.request.Request(
                url, data=payload, headers={"Content-Type": "application/json"}
            )
            with urllib.request.urlopen(req, timeout=TIMEOUT_SECONDS) as resp:
                data = json.loads(resp.read())
                vector = data.get("embedding")
                if vector:
                    return vector, MODEL
        except (urllib.error.URLError, TimeoutError, OSError, ValueError):
            continue
    return None, None


def pack_vector(vector: list[float]) -> bytes:
    return struct.pack(f"{len(vector)}f", *vector)


def unpack_vector(blob: bytes, dim: int) -> list[float]:
    return list(struct.unpack(f"{dim}f", blob))


def cosine_similarity(a: list[float], b: list[float]) -> float:
    dot = sum(x * y for x, y in zip(a, b))
    norm_a = sum(x * x for x in a) ** 0.5
    norm_b = sum(y * y for y in b) ** 0.5
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return dot / (norm_a * norm_b)
