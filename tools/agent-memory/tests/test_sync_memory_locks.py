"""Pruebas reales de las funciones de lock por directorio agregadas a
~/.agents_shared_memory/sync_memory.py. Usa una DB SQLite temporal (nunca la
real de produccion) inyectada via monkeypatch de _agent_memory_connect.

Ejecutar: python tools/agent-memory/tests/test_sync_memory_locks.py
"""
import importlib.util
import sys
import tempfile
import unittest
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent))
from db import connect  # noqa: E402

SYNC_MEMORY_PATH = Path(r"C:\Users\yoeli\.agents_shared_memory\sync_memory.py")


def load_sync_memory_module():
    spec = importlib.util.spec_from_file_location("sync_memory_under_test", SYNC_MEMORY_PATH)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


@unittest.skipUnless(SYNC_MEMORY_PATH.exists(), "sync_memory.py no encontrado en esta maquina")
class TestDirectoryLocks(unittest.TestCase):
    def setUp(self):
        self.tmpdir = tempfile.TemporaryDirectory()
        self.db_path = Path(self.tmpdir.name) / "test.db"
        self.sm = load_sync_memory_module()
        # Inyecta una DB temporal -- estas pruebas NUNCA deben tocar la DB real.
        self.sm._agent_memory_connect = lambda: connect(self.db_path)

    def tearDown(self):
        self.tmpdir.cleanup()

    def test_second_agent_is_blocked_while_first_holds_lock(self):
        got_first = self.sm.acquire_directory_lock("some/dir", "T1", "agent-a")
        got_second = self.sm.acquire_directory_lock("some/dir", "T1", "agent-b")
        self.assertTrue(got_first)
        self.assertFalse(got_second, "un segundo agente no debe poder tomar un directorio ya bloqueado")

    def test_same_agent_can_reacquire_its_own_lock(self):
        self.sm.acquire_directory_lock("some/dir", "T1", "agent-a")
        reacquired = self.sm.acquire_directory_lock("some/dir", "T1", "agent-a")
        self.assertTrue(reacquired)

    def test_lock_becomes_available_after_release(self):
        self.sm.acquire_directory_lock("some/dir", "T1", "agent-a")
        self.sm.release_directory_lock("some/dir", "agent-a")
        got = self.sm.acquire_directory_lock("some/dir", "T1", "agent-b")
        self.assertTrue(got)

    def test_wait_for_lock_succeeds_once_released(self):
        self.sm.acquire_directory_lock("some/dir", "T1", "agent-a")
        self.sm.release_directory_lock("some/dir", "agent-a")
        got = self.sm.wait_for_directory_lock(
            "some/dir", "T1", "agent-b", poll_seconds=0.01, timeout_seconds=1
        )
        self.assertTrue(got)

    def test_wait_for_lock_times_out_if_never_released(self):
        self.sm.acquire_directory_lock("some/dir", "T1", "agent-a")
        got = self.sm.wait_for_directory_lock(
            "some/dir", "T1", "agent-b", poll_seconds=0.01, timeout_seconds=0.05
        )
        self.assertFalse(got)


@unittest.skipUnless(SYNC_MEMORY_PATH.exists(), "sync_memory.py no encontrado en esta maquina")
class TestMirrorResilience(unittest.TestCase):
    def setUp(self):
        self.tmpdir = tempfile.TemporaryDirectory()
        self.db_path = Path(self.tmpdir.name) / "test.db"
        self.sm = load_sync_memory_module()
        self.sm._agent_memory_connect = lambda: connect(self.db_path)

    def tearDown(self):
        self.tmpdir.cleanup()

    def test_task_with_unassigned_owner_does_not_break_other_rows(self):
        """Regresion real: una tarea con agent_id='unassigned' (no registrado
        como agente) abortaba TODO el espejo antes del fix -- se confirmo con
        el ledger real de produccion (4 tareas -> solo 1 se guardaba)."""
        ledger = {
            "agents": {"agent-a": {"agent_type": "Test", "status": "ACTIVE", "last_active": "now"}},
            "tasks": [
                {"task_id": "T1", "title": "Tarea normal", "project": "p", "status": "OPEN",
                 "agent_id": "agent-a", "updated_at": "now"},
                {"task_id": "T2", "title": "Tarea sin dueno real", "project": "p", "status": "PENDING",
                 "agent_id": "unassigned", "updated_at": "now"},
            ],
        }
        self.sm.mirror_ledger_to_sqlite(ledger)
        conn = connect(self.db_path)
        count = conn.execute("SELECT COUNT(*) c FROM tasks").fetchone()["c"]
        t2_claimed_by = conn.execute("SELECT claimed_by FROM tasks WHERE id='T2'").fetchone()["claimed_by"]
        conn.close()
        self.assertEqual(count, 2, "ambas tareas deben quedar guardadas, no solo la valida")
        self.assertIsNone(t2_claimed_by, "el owner invalido se guarda como NULL, no rompe la fila")


if __name__ == "__main__":
    unittest.main()
