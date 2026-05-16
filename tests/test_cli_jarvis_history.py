from __future__ import annotations

import json
from pathlib import Path

from typer.testing import CliRunner

import orca.cli
from orca.audio.transcript_history import TranscriptHistory

runner = CliRunner()


def test_jarvis_transcript_can_store_history(tmp_path: Path, monkeypatch) -> None:
    history = TranscriptHistory(
        tmp_path / "jarvis_transcript_history.jsonl",
        enabled=True,
    )
    monkeypatch.setattr(
        orca.cli,
        "_resolve_transcript_history",
        lambda *, enabled: TranscriptHistory(history.storage_path, enabled=enabled),
    )

    result = runner.invoke(
        orca.cli.app,
        ["jarvis", "transcript", "Jarvis crea tarea para backlog", "--store-history"],
    )

    assert result.exit_code == 0
    history_path = history.storage_path
    assert history_path.exists()
    payload = json.loads(history_path.read_text(encoding="utf-8").splitlines()[0])
    assert payload["event"]["normalized_transcript"] == "Jarvis crea tarea para backlog"


def test_jarvis_history_list_and_clear_commands(tmp_path: Path, monkeypatch) -> None:
    history_path = tmp_path / "jarvis_transcript_history.jsonl"
    monkeypatch.setattr(
        orca.cli,
        "_resolve_transcript_history",
        lambda *, enabled: TranscriptHistory(history_path, enabled=enabled),
    )
    history_path.parent.mkdir(parents=True, exist_ok=True)
    history_path.write_text(
        json.dumps({"timestamp": "2026-05-16T00:00:00Z", "event": {"transcript": "hola"}}) + "\n",
        encoding="utf-8",
    )

    list_result = runner.invoke(orca.cli.app, ["jarvis", "history", "list", "--limit", "1"])
    clear_result = runner.invoke(orca.cli.app, ["jarvis", "history", "clear"])

    assert list_result.exit_code == 0
    assert "hola" in list_result.stdout
    assert clear_result.exit_code == 0
    assert not history_path.exists()
