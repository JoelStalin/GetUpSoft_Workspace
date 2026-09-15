"""Pruebas reales del escaner de logs.

Ejecutar: python tools/agent-memory/tests/test_scan_logs.py
"""
import sys
import tempfile
import unittest
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent))

from scan_logs import scan_file, normalize_level, record_finding  # noqa: E402
from db import connect  # noqa: E402


class TestLogScanning(unittest.TestCase):
    def setUp(self):
        self.tmpdir = tempfile.TemporaryDirectory()
        self.log_path = Path(self.tmpdir.name) / "sample.log"

    def tearDown(self):
        self.tmpdir.cleanup()

    def test_detects_error_and_warn_lines(self):
        self.log_path.write_text(
            "2026-09-12 ok linea normal\n"
            "2026-09-12 ERROR algo se rompio\n"
            "2026-09-12 WARNING revisar esto\n"
            "2026-09-12 otra linea normal\n",
            encoding="utf-8",
        )
        findings = scan_file(self.log_path)
        levels = [f[1] for f in findings]
        self.assertIn("ERROR", levels)
        self.assertIn("WARN", levels)
        self.assertEqual(len(findings), 2, "solo las 2 lineas con nivel real deben marcarse")

    def test_ignores_clean_log(self):
        self.log_path.write_text("todo ok\nsin problemas\n", encoding="utf-8")
        self.assertEqual(scan_file(self.log_path), [])

    def test_normalize_level_variants(self):
        self.assertEqual(normalize_level("Error"), "ERROR")
        self.assertEqual(normalize_level("WARNING"), "WARN")
        self.assertEqual(normalize_level("FAILED"), "FAIL")
        self.assertEqual(normalize_level("Traceback"), "EXCEPTION")


class TestFindingsPersistence(unittest.TestCase):
    def setUp(self):
        self.tmpdir = tempfile.TemporaryDirectory()
        self.db_path = Path(self.tmpdir.name) / "test.db"
        self.conn = connect(self.db_path)

    def tearDown(self):
        self.conn.close()
        self.tmpdir.cleanup()

    def test_duplicate_finding_does_not_create_new_row(self):
        with self.conn:
            record_finding(self.conn, "a.log", 1, "ERROR", "algo se rompio")
            record_finding(self.conn, "a.log", 1, "ERROR", "algo se rompio")
        count = self.conn.execute("SELECT COUNT(*) c FROM log_findings").fetchone()["c"]
        self.assertEqual(count, 1)

    def test_resolved_finding_excluded_from_unresolved_query(self):
        with self.conn:
            record_finding(self.conn, "b.log", 5, "WARN", "cuidado")
            finding_id = self.conn.execute(
                "SELECT id FROM log_findings WHERE file='b.log'"
            ).fetchone()["id"]
            self.conn.execute("UPDATE log_findings SET resolved=1 WHERE id=?", (finding_id,))
        unresolved = self.conn.execute(
            "SELECT COUNT(*) c FROM log_findings WHERE resolved=0 AND file='b.log'"
        ).fetchone()["c"]
        self.assertEqual(unresolved, 0)


if __name__ == "__main__":
    unittest.main()
