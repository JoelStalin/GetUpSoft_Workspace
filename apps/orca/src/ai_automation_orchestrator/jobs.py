from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timezone
from contextlib import closing
import json
from pathlib import Path
import sqlite3
import threading
from typing import Any
from uuid import uuid4

from ai_automation_orchestrator.config import repository_root


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


@dataclass(slots=True)
class WorkflowJob:
    id: str
    workflow_type: str
    title: str
    status: str
    model_id: str
    input_payload: dict[str, Any]
    output_markdown: str | None
    error_message: str | None
    created_at: str
    updated_at: str
    started_at: str | None
    completed_at: str | None


class WorkflowStore:
    def __init__(self, db_path: str | Path | None = None) -> None:
        base_path = Path(db_path) if db_path else repository_root() / "data" / "workflows.db"
        self.db_path = base_path
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        self._lock = threading.Lock()
        self._initialize()

    def _connect(self) -> sqlite3.Connection:
        connection = sqlite3.connect(self.db_path)
        connection.row_factory = sqlite3.Row
        return connection

    def _initialize(self) -> None:
        with closing(self._connect()) as connection:
            connection.execute(
                """
                CREATE TABLE IF NOT EXISTS workflow_jobs (
                    id TEXT PRIMARY KEY,
                    workflow_type TEXT NOT NULL,
                    title TEXT NOT NULL,
                    status TEXT NOT NULL,
                    model_id TEXT NOT NULL,
                    input_payload TEXT NOT NULL,
                    output_markdown TEXT,
                    error_message TEXT,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL,
                    started_at TEXT,
                    completed_at TEXT
                )
                """
            )
            connection.commit()

    def create_job(self, workflow_type: str, title: str, model_id: str, input_payload: dict[str, Any]) -> WorkflowJob:
        job = WorkflowJob(
            id=str(uuid4()),
            workflow_type=workflow_type,
            title=title,
            status="pending",
            model_id=model_id,
            input_payload=input_payload,
            output_markdown=None,
            error_message=None,
            created_at=utc_now(),
            updated_at=utc_now(),
            started_at=None,
            completed_at=None,
        )
        with self._lock, closing(self._connect()) as connection:
            connection.execute(
                """
                INSERT INTO workflow_jobs (
                    id, workflow_type, title, status, model_id, input_payload,
                    output_markdown, error_message, created_at, updated_at, started_at, completed_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    job.id,
                    job.workflow_type,
                    job.title,
                    job.status,
                    job.model_id,
                    json.dumps(job.input_payload, ensure_ascii=False),
                    job.output_markdown,
                    job.error_message,
                    job.created_at,
                    job.updated_at,
                    job.started_at,
                    job.completed_at,
                ),
            )
            connection.commit()
        return job

    def mark_running(self, job_id: str) -> None:
        now = utc_now()
        self._update(job_id, status="running", updated_at=now, started_at=now)

    def mark_completed(self, job_id: str, output_markdown: str) -> None:
        now = utc_now()
        self._update(
            job_id,
            status="completed",
            updated_at=now,
            completed_at=now,
            output_markdown=output_markdown,
            error_message=None,
        )

    def mark_failed(self, job_id: str, error_message: str) -> None:
        now = utc_now()
        self._update(
            job_id,
            status="failed",
            updated_at=now,
            completed_at=now,
            error_message=error_message,
        )

    def _update(self, job_id: str, **fields: Any) -> None:
        assignments = ", ".join(f"{column} = ?" for column in fields)
        values = list(fields.values())
        values.append(job_id)
        with self._lock, closing(self._connect()) as connection:
            connection.execute(f"UPDATE workflow_jobs SET {assignments} WHERE id = ?", values)
            connection.commit()

    def get_job(self, job_id: str) -> WorkflowJob | None:
        with closing(self._connect()) as connection:
            row = connection.execute("SELECT * FROM workflow_jobs WHERE id = ?", (job_id,)).fetchone()
        return self._row_to_job(row) if row else None

    def list_jobs(self, limit: int = 50) -> list[WorkflowJob]:
        with closing(self._connect()) as connection:
            rows = connection.execute(
                "SELECT * FROM workflow_jobs ORDER BY created_at DESC LIMIT ?",
                (limit,),
            ).fetchall()
        return [self._row_to_job(row) for row in rows]

    def get_stats(self) -> dict[str, int]:
        with closing(self._connect()) as connection:
            rows = connection.execute(
                "SELECT status, COUNT(*) AS total FROM workflow_jobs GROUP BY status"
            ).fetchall()
        stats = {"pending": 0, "running": 0, "completed": 0, "failed": 0}
        for row in rows:
            stats[row["status"]] = row["total"]
        stats["total"] = sum(stats.values())
        return stats

    @staticmethod
    def _row_to_job(row: sqlite3.Row) -> WorkflowJob:
        return WorkflowJob(
            id=row["id"],
            workflow_type=row["workflow_type"],
            title=row["title"],
            status=row["status"],
            model_id=row["model_id"],
            input_payload=json.loads(row["input_payload"]),
            output_markdown=row["output_markdown"],
            error_message=row["error_message"],
            created_at=row["created_at"],
            updated_at=row["updated_at"],
            started_at=row["started_at"],
            completed_at=row["completed_at"],
        )

