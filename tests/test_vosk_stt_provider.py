from __future__ import annotations

from pathlib import Path

import pytest

from orca.audio.jarvis_listener import JarvisListener
from orca.audio.providers.vosk_stt_provider import VoskSTTProvider, VoskSTTProviderError
from orca.audio.stt_provider import STTResult
from orca.config import OrcaSettings


def test_vosk_stt_provider_requires_model_path_when_dependency_missing_or_not() -> None:
    provider = VoskSTTProvider(OrcaSettings(vosk_model_path=None))

    with pytest.raises(VoskSTTProviderError):
        provider.transcribe("missing.wav")


def test_vosk_stt_provider_rejects_missing_model_directory(
    tmp_path: Path,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setattr("importlib.util.find_spec", lambda _: object())
    provider = VoskSTTProvider(OrcaSettings(vosk_model_path=tmp_path / "missing-model"))

    with pytest.raises(VoskSTTProviderError):
        provider.transcribe(str(tmp_path / "audio.wav"))


def test_jarvis_listener_audio_ref_uses_explicit_vosk_provider_when_none_injected(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    def fake_transcribe(self: VoskSTTProvider, audio_ref: str) -> STTResult:
        return STTResult(
            transcript="Jarvis crea una tarea para backlog",
            language="es",
            confidence=0.88,
            provider="vosk",
            metadata={"audio_ref": audio_ref},
        )

    monkeypatch.setattr(VoskSTTProvider, "transcribe", fake_transcribe)
    listener = JarvisListener()

    event = listener.listen("sample_task.wav", source_type="audio_ref")

    assert event.stt_result is not None
    assert event.stt_result.provider == "vosk"
    assert event.voice_command.intent_hint == "scrum-management"
