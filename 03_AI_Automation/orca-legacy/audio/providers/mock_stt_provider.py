from __future__ import annotations

from orca.audio.stt_provider import STTResult


class MockSTTProvider:
    def __init__(self, transcripts: dict[str, str]) -> None:
        self.transcripts = transcripts

    def transcribe(self, audio_ref: str) -> STTResult:
        transcript = self.transcripts.get(audio_ref)
        if transcript is None:
            raise KeyError(f"No mock transcript registered for {audio_ref}")
        return STTResult(
            transcript=transcript,
            language="es",
            confidence=0.99,
            provider="mock",
            metadata={"audio_ref": audio_ref},
        )
