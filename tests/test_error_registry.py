from __future__ import annotations

from pathlib import Path

from orca.config import OrcaSettings
from orca.storage.error_registry import ErrorRegistry


def test_error_registry_persists_and_reads_records(tmp_path: Path) -> None:
    settings = OrcaSettings(project_root=tmp_path)
    registry = ErrorRegistry(settings)

    registry.record(
        category="recoverable",
        command="pytest tests",
        probable_cause="missing fixture",
        affected_files=["tests/test_sample.py"],
        free_model_prompt="repair the fixture",
        manual_validation_steps=["run pytest again"],
    )

    records = registry.recent()

    assert len(records) == 1
    assert records[0].category == "recoverable"
    assert records[0].affected_files == ("tests/test_sample.py",)
