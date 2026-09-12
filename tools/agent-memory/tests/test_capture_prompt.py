"""Pruebas reales (unittest, stdlib) de captura de prompts y diccionario.

Ejecutar: python tools/agent-memory/tests/test_capture_prompt.py
"""
import struct
import sys
import tempfile
import unittest
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent))

from db import connect, hex_id  # noqa: E402
from capture_prompt import store_prompt, tokenize, find_similar_prompt  # noqa: E402


class TestDictionary(unittest.TestCase):
    def setUp(self):
        self.tmpdir = tempfile.TemporaryDirectory()
        self.db_path = Path(self.tmpdir.name) / "test.db"
        self.conn = connect(self.db_path)

    def tearDown(self):
        self.conn.close()
        self.tmpdir.cleanup()

    def test_tokenize_lowercases_and_splits_words(self):
        self.assertEqual(tokenize("Hola Mundo, prueba!"), ["hola", "mundo", "prueba"])

    def test_store_prompt_keeps_full_raw_text(self):
        prompt_id = store_prompt(self.conn, "texto completo de prueba", "s1", "test-agent")
        row = self.conn.execute("SELECT raw_text FROM prompts WHERE id=?", (prompt_id,)).fetchone()
        self.assertEqual(row["raw_text"], "texto completo de prueba")

    def test_repeated_word_reuses_dictionary_id(self):
        store_prompt(self.conn, "hola mundo hola", "s1", "test-agent")
        count = self.conn.execute("SELECT COUNT(*) c FROM dictionary WHERE word='hola'").fetchone()["c"]
        self.assertEqual(count, 1, "la palabra repetida no debe duplicarse en el diccionario")

    def test_new_word_enriches_dictionary(self):
        before = self.conn.execute("SELECT COUNT(*) c FROM dictionary").fetchone()["c"]
        store_prompt(self.conn, "palabraunicanuevaxyz", "s1", "test-agent")
        after = self.conn.execute("SELECT COUNT(*) c FROM dictionary").fetchone()["c"]
        self.assertEqual(after, before + 1)

    def test_hex_id_format(self):
        word_id = self.conn.execute(
            "INSERT INTO dictionary(word) VALUES ('x') RETURNING id"
        ).fetchone()["id"]
        self.assertTrue(hex_id(word_id).startswith("0x"))
        self.assertEqual(hex_id(255), "0xFF")

    def test_no_content_lost_even_with_repeated_words(self):
        text = "correr correr correr rapido rapido"
        prompt_id = store_prompt(self.conn, text, "s1", "test-agent")
        tokens = self.conn.execute(
            "SELECT position FROM prompt_tokens WHERE prompt_id=? ORDER BY position", (prompt_id,)
        ).fetchall()
        self.assertEqual(len(tokens), 5, "cada posicion del texto original debe quedar registrada")


class TestSimilaritySearch(unittest.TestCase):
    def setUp(self):
        self.tmpdir = tempfile.TemporaryDirectory()
        self.db_path = Path(self.tmpdir.name) / "test.db"
        self.conn = connect(self.db_path)

    def tearDown(self):
        self.conn.close()
        self.tmpdir.cleanup()

    def _insert_embedding(self, prompt_id: int, vector: list[float]) -> None:
        blob = struct.pack(f"{len(vector)}f", *vector)
        self.conn.execute(
            "INSERT INTO embeddings(prompt_id, model, dim, vector) VALUES (?, 'test', ?, ?)",
            (prompt_id, len(vector), blob),
        )

    def test_finds_near_identical_vector_above_threshold(self):
        pid = store_prompt(self.conn, "prompt original", "s1", "a")
        self._insert_embedding(pid, [1.0, 0.0, 0.0])
        result = find_similar_prompt(self.conn, [1.0, 0.0, 0.0001])
        self.assertIsNotNone(result)
        self.assertEqual(result[0], pid)

    def test_ignores_dissimilar_vector_below_threshold(self):
        pid = store_prompt(self.conn, "prompt original", "s1", "a")
        self._insert_embedding(pid, [1.0, 0.0, 0.0])
        result = find_similar_prompt(self.conn, [0.0, 1.0, 0.0])
        self.assertIsNone(result)


if __name__ == "__main__":
    unittest.main()
