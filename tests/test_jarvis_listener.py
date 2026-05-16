from __future__ import annotations

from pathlib import Path

import pytest

from orca.audio.jarvis_listener import JarvisListener, JarvisListenerError
from orca.audio.providers.mock_stt_provider import MockSTTProvider
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


def test_jarvis_listener_listen_normalizes_transcript() -> None:
    listener = JarvisListener()

    event = listener.listen("jarbis crea tarea para integrar orka", source_type="transcript")

    assert event.transcript == "jarbis crea tarea para integrar orka"
    assert event.normalized_transcript == "Jarvis crea tarea para integrar ORCA"
    assert event.voice_command.intent_hint == "scrum-management"


def test_jarvis_listener_listen_uses_mock_provider_for_audio_ref() -> None:
    listener = JarvisListener(
        stt_provider=MockSTTProvider(
            {
                "sample_bug.wav": "Jarvis arregla el bug del login y crea pruebas",
            }
        )
    )

    event = listener.listen("sample_bug.wav", source_type="audio_ref")

    assert event.transcript.startswith("Jarvis")
    assert event.stt_result is not None
    assert event.stt_result.provider == "mock"
