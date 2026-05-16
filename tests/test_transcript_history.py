from __future__ import annotations

from pathlib import Path

from orca.audio.transcript_history import TranscriptHistory


def test_transcript_history_redacts_sensitive_patterns(tmp_path: Path) -> None:
    history = TranscriptHistory(tmp_path / "history.jsonl", enabled=True)

    history.add(
        {
            "transcript": "token: abc123456 password=secret user@example.com",
            "normalized_transcript": "token: abc123456",
        }
    )

    payload = history.list_recent(limit=1)[0]

    assert "[REDACTED_EMAIL]" in str(payload)
    assert "password=[REDACTED]" in str(payload)


def test_transcript_history_clear_removes_storage(tmp_path: Path) -> None:
    history = TranscriptHistory(tmp_path / "history.jsonl", enabled=True)
    history.add({"transcript": "hola"})

    history.clear()

    assert history.list_recent() == []
