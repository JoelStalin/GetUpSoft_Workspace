from __future__ import annotations

import importlib.util
import json
import wave
from pathlib import Path

from orca.config import OrcaSettings, get_settings


class JarvisListenerError(RuntimeError):
    """Raised when offline audio transcription is not available."""


class JarvisListener:
    def __init__(self, settings: OrcaSettings | None = None) -> None:
        self.settings = settings or get_settings()

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
