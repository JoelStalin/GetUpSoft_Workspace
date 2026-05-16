from __future__ import annotations

from pathlib import Path

import pytest

from orca.audio.jarvis_listener import JarvisListener, JarvisListenerError
from orca.config import OrcaSettings


def test_jarvis_listener_requires_model_path_when_vosk_available_or_not() -> None:
    listener = JarvisListener(OrcaSettings(vosk_model_path=None))

    with pytest.raises(JarvisListenerError):
        listener.transcribe("missing.wav")


def test_jarvis_listener_rejects_missing_model_path_file(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setattr("importlib.util.find_spec", lambda _: object())
    listener = JarvisListener(OrcaSettings(vosk_model_path=tmp_path / "missing-model"))

    with pytest.raises(JarvisListenerError):
        listener.transcribe(tmp_path / "audio.wav")
