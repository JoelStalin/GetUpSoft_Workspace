from __future__ import annotations

import importlib.util
from pathlib import Path


class JarvisListenerError(RuntimeError):
    """Raised when offline audio transcription is not available."""


class JarvisListener:
    def transcribe(self, audio_path: str | Path) -> str:
        if importlib.util.find_spec("vosk") is None:  # pragma: no cover - dependency is optional
            raise JarvisListenerError(
                "Vosk is not installed. Install the audio extra to enable offline transcription."
            )

        raise JarvisListenerError(
            "Audio transcription requires a local Vosk model. Mock this interface in tests or "
            "provide a project-specific implementation."
        )
