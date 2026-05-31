from __future__ import annotations

from typing import Protocol

from pydantic import BaseModel, Field


class STTResult(BaseModel):
    transcript: str = Field(min_length=1)
    language: str | None = None
    confidence: float | None = Field(default=None, ge=0.0, le=1.0)
    provider: str
    metadata: dict[str, str | float | int | bool | None] = Field(default_factory=dict)


class STTProvider(Protocol):
    def transcribe(self, audio_ref: str) -> STTResult:
        """Transcribe an audio reference into a structured result."""
