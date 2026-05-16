from __future__ import annotations

from orca.audio.providers.mock_stt_provider import MockSTTProvider


def test_mock_stt_provider_returns_registered_transcript() -> None:
    provider = MockSTTProvider(
        {
            "sample_bug.wav": "Jarvis arregla el bug del login y crea pruebas",
        }
    )

    result = provider.transcribe("sample_bug.wav")

    assert result.provider == "mock"
    assert result.transcript.startswith("Jarvis")
    assert result.metadata["audio_ref"] == "sample_bug.wav"
