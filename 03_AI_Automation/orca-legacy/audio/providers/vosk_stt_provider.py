from __future__ import annotations

import importlib.util
import json
import wave
from pathlib import Path

from orca.audio.stt_provider import STTResult
from orca.config import OrcaSettings, get_settings


class VoskSTTProviderError(RuntimeError):
    """Raised when the local Vosk provider cannot transcribe audio."""


class VoskSTTProvider:
    def __init__(self, settings: OrcaSettings | None = None) -> None:
        self.settings = settings or get_settings()

    def transcribe(self, audio_ref: str) -> STTResult:
        if importlib.util.find_spec("vosk") is None:  # pragma: no cover
            raise VoskSTTProviderError(
                "Vosk is not installed. Install the audio extra to enable offline transcription."
            )

        model_path = self.settings.vosk_model_path
        if model_path is None:
            raise VoskSTTProviderError(
                "No Vosk model path configured. Set OrcaSettings.vosk_model_path to enable offline "
                "audio transcription."
            )
        if not model_path.exists():
            raise VoskSTTProviderError(f"Configured Vosk model path does not exist: {model_path}")

        audio_file = Path(audio_ref)
        if not audio_file.exists():
            raise VoskSTTProviderError(f"Audio file does not exist: {audio_file}")

        try:  # pragma: no cover
            from vosk import KaldiRecognizer, Model
        except ImportError as exc:  # pragma: no cover
            raise VoskSTTProviderError("Vosk import failed after availability check.") from exc

        with wave.open(str(audio_file), "rb") as wav_file:
            if wav_file.getnchannels() != 1 or wav_file.getsampwidth() != 2:
                raise VoskSTTProviderError(
                    "Only mono 16-bit PCM WAV files are supported by the default Vosk provider."
                )
            model = Model(str(model_path))
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
            raise VoskSTTProviderError("Audio transcription produced no text.")

        return STTResult(
            transcript=transcript,
            language=self.settings.canonical_language,
            confidence=None,
            provider="vosk",
            metadata={"audio_ref": audio_ref, "model_path": str(model_path)},
        )
