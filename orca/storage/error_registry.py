from __future__ import annotations

import sqlite3
from dataclasses import dataclass
from datetime import UTC, datetime

from orca.config import OrcaSettings, get_settings


@dataclass(frozen=True)
class ErrorRecord:
    category: str
    command: str
    probable_cause: str
    affected_files: tuple[str, ...]
    free_model_prompt: str
    manual_validation_steps: tuple[str, ...]
    created_at: str


class ErrorRegistry:
    def __init__(self, settings: OrcaSettings | None = None) -> None:
        self.settings = settings or get_settings()
        self.settings.sqlite_dir.mkdir(parents=True, exist_ok=True)
        self._initialize()

    def record(
        self,
        *,
        category: str,
        command: str,
        probable_cause: str,
        affected_files: list[str],
        free_model_prompt: str,
        manual_validation_steps: list[str],
    ) -> ErrorRecord:
        created_at = datetime.now(UTC).isoformat()
        with sqlite3.connect(self.settings.error_registry_path) as connection:
            connection.execute(
                """
                INSERT INTO error_records (
                    category, command, probable_cause, affected_files,
                    free_model_prompt, manual_validation_steps, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    category,
                    command,
                    probable_cause,
                    "\n".join(affected_files),
                    free_model_prompt,
                    "\n".join(manual_validation_steps),
                    created_at,
                ),
            )
            connection.commit()

        return ErrorRecord(
            category=category,
            command=command,
            probable_cause=probable_cause,
            affected_files=tuple(affected_files),
            free_model_prompt=free_model_prompt,
            manual_validation_steps=tuple(manual_validation_steps),
            created_at=created_at,
        )

    def recent(self, limit: int = 10) -> list[ErrorRecord]:
        with sqlite3.connect(self.settings.error_registry_path) as connection:
            rows = connection.execute(
                """
                SELECT category, command, probable_cause, affected_files,
                       free_model_prompt, manual_validation_steps, created_at
                FROM error_records
                ORDER BY id DESC
                LIMIT ?
                """,
                (limit,),
            ).fetchall()
        return [
            ErrorRecord(
                category=row[0],
                command=row[1],
                probable_cause=row[2],
                affected_files=tuple(filter(None, row[3].splitlines())),
                free_model_prompt=row[4],
                manual_validation_steps=tuple(filter(None, row[5].splitlines())),
                created_at=row[6],
            )
            for row in rows
        ]

    def _initialize(self) -> None:
        with sqlite3.connect(self.settings.error_registry_path) as connection:
            connection.execute(
                """
                CREATE TABLE IF NOT EXISTS error_records (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    category TEXT NOT NULL,
                    command TEXT NOT NULL,
                    probable_cause TEXT NOT NULL,
                    affected_files TEXT NOT NULL,
                    free_model_prompt TEXT NOT NULL,
                    manual_validation_steps TEXT NOT NULL,
                    created_at TEXT NOT NULL
                )
                """
            )
            connection.commit()
