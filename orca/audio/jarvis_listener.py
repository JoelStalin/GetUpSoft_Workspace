from __future__ import annotations

from pathlib import Path
from typing import Literal

from pydantic import BaseModel

from orca.audio.custom_dictionary import CustomDictionary
from orca.audio.providers.vosk_stt_provider import VoskSTTProvider, VoskSTTProviderError
from orca.audio.stt_provider import STTProvider, STTResult
from orca.audio.transcript_history import TranscriptHistory
from orca.audio.voice_command_router import VoiceCommand, VoiceCommandRouter
from orca.config import OrcaSettings, get_settings


class JarvisListenerError(RuntimeError):
    """Raised when offline audio transcription is not available."""


class JarvisEvent(BaseModel):
    source_type: Literal["transcript", "audio_ref"]
    raw_input: str
    transcript: str
    normalized_transcript: str
    voice_command: VoiceCommand
    stt_result: STTResult | None = None
    errors: list[str] = []


class JarvisListener:
    def __init__(
        self,
        settings: OrcaSettings | None = None,
        *,
        stt_provider: STTProvider | None = None,
        dictionary: CustomDictionary | None = None,
        router: VoiceCommandRouter | None = None,
        transcript_history: TranscriptHistory | None = None,
    ) -> None:
        self.settings = settings or get_settings()
        self.stt_provider = stt_provider
        self.dictionary = dictionary or CustomDictionary()
        self.router = router or VoiceCommandRouter()
        self.transcript_history = transcript_history or TranscriptHistory(
            self.settings.transcript_history_path,
            enabled=self.settings.transcript_history_enabled,
        )

    def listen(
        self,
        input_value: str,
        source_type: Literal["transcript", "audio_ref"],
    ) -> JarvisEvent:
        stt_result: STTResult | None = None
        errors: list[str] = []
        transcript = input_value

        if source_type == "audio_ref":
            try:
                stt_result = self._transcribe_audio_ref(input_value)
                transcript = stt_result.transcript
            except Exception as exc:
                errors.append(str(exc))
                transcript = input_value

        normalized_transcript = self.dictionary.apply(transcript)
        voice_command = self.router.route(normalized_transcript)
        event = JarvisEvent(
            source_type=source_type,
            raw_input=input_value,
            transcript=transcript,
            normalized_transcript=normalized_transcript,
            voice_command=voice_command,
            stt_result=stt_result,
            errors=errors,
        )
        self.transcript_history.add(event)
        return event

    def _transcribe_audio_ref(self, audio_ref: str) -> STTResult:
        if self.stt_provider is not None:
            return self.stt_provider.transcribe(audio_ref)
        return VoskSTTProvider(self.settings).transcribe(audio_ref)

    def transcribe(self, audio_path: str | Path) -> str:
        try:
            return VoskSTTProvider(self.settings).transcribe(str(audio_path)).transcript
        except VoskSTTProviderError as exc:
            raise JarvisListenerError(str(exc)) from exc
