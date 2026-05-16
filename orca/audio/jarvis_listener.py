from __future__ import annotations

import importlib.util
import json
import wave
from pathlib import Path
from typing import Literal

from pydantic import BaseModel

from orca.audio.custom_dictionary import CustomDictionary
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
        transcript = self.transcribe(audio_ref)
        return STTResult(
            transcript=transcript,
            language=self.settings.canonical_language,
            confidence=None,
            provider="vosk-wrapper",
            metadata={"audio_ref": audio_ref},
        )

    def transcribe(self, audio_path: str | Path) -> str:
        if importlib.util.find_spec("vosk") is None:  # pragma: no cover - dependency is optional
            raise JarvisListenerError(
                "Vosk is not installed. Install the audio extra to enable offline transcription."
            )

        if self.settings.vosk_model_path is None:
            raise JarvisListenerError(
                "No Vosk model path configured. Set OrcaSettings.vosk_model_path to enable offline "
                "audio transcription."
            )
        if not self.settings.vosk_model_path.exists():
            raise JarvisListenerError(
                f"Configured Vosk model path does not exist: {self.settings.vosk_model_path}"
            )

        audio_file = Path(audio_path)
        if not audio_file.exists():
            raise JarvisListenerError(f"Audio file does not exist: {audio_file}")

        try:  # pragma: no cover - depends on optional local packages and local model
            from vosk import KaldiRecognizer, Model
        except ImportError as exc:  # pragma: no cover
            raise JarvisListenerError("Vosk import failed after availability check.") from exc

        with wave.open(str(audio_file), "rb") as wav_file:
            if wav_file.getnchannels() != 1 or wav_file.getsampwidth() != 2:
                raise JarvisListenerError(
                    "Only mono 16-bit PCM WAV files are supported by the default Jarvis listener."
                )
            model = Model(str(self.settings.vosk_model_path))
            recognizer = KaldiRecognizer(model, wav_file.getframerate())
            transcript_parts: list[str] = []
            while True:
                chunk = wav_file.readframes(4_000)
                if not chunk:
                    break
                if recognizer.AcceptWaveform(chunk):
                    transcript_parts.append(json.loads(recognizer.Result()).get("text", ""))
            transcript_parts.append(json.loads(recognizer.FinalResult()).get("text", ""))

        transcript = " ".join(part.strip() for part in transcript_parts if part.strip()).strip()
        if not transcript:
            raise JarvisListenerError("Audio transcription produced no text.")
        return transcript
