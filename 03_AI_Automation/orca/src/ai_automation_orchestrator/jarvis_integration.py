"""Jarvis voice command integration with Orca."""

from __future__ import annotations

import sys
from pathlib import Path
from typing import Any

from pydantic import BaseModel, Field

# Add orca/audio to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent.parent.parent / "orca" / "audio"))

try:
    from jarvis_listener import JarvisListener, JarvisEvent
except ImportError:
    JarvisListener = None
    JarvisEvent = None


class JarvisCommandRequest(BaseModel):
    """Request to process a voice command through Jarvis."""

    input_value: str = Field(min_length=1)
    source_type: str = Field(default="transcript")  # 'transcript' or 'audio_ref'


class JarvisCommandResponse(BaseModel):
    """Response from Jarvis processing."""

    raw_input: str
    transcript: str
    normalized_transcript: str
    wake_word: str | None
    command_text: str
    intent_hint: str | None
    target_hint: str | None
    should_send_to_orca: bool
    errors: list[str] = []
    action: str | None = None


class JarvisIntegration:
    """Integration point for Jarvis voice commands with Orca."""

    def __init__(self) -> None:
        self.listener: JarvisListener | None = None
        self._initialize_listener()

    def _initialize_listener(self) -> None:
        """Initialize Jarvis listener if available."""
        if JarvisListener is not None:
            try:
                self.listener = JarvisListener()
            except Exception as e:
                print(f"Warning: Failed to initialize JarvisListener: {e}")

    def process_command(
        self, request: JarvisCommandRequest
    ) -> JarvisCommandResponse:
        """Process a voice command through Jarvis."""
        if not self.listener:
            return JarvisCommandResponse(
                raw_input=request.input_value,
                transcript=request.input_value,
                normalized_transcript=request.input_value,
                wake_word=None,
                command_text="",
                intent_hint=None,
                target_hint=None,
                should_send_to_orca=False,
                errors=["Jarvis listener not initialized"],
            )

        try:
            event: JarvisEvent = self.listener.listen(
                request.input_value,
                source_type=request.source_type,  # type: ignore
            )

            action = self._determine_action(event)

            return JarvisCommandResponse(
                raw_input=event.raw_input,
                transcript=event.transcript,
                normalized_transcript=event.normalized_transcript,
                wake_word=event.voice_command.wake_word,
                command_text=event.voice_command.command_text,
                intent_hint=event.voice_command.intent_hint,
                target_hint=event.voice_command.target_hint,
                should_send_to_orca=event.voice_command.should_send_to_orca,
                errors=event.errors,
                action=action,
            )
        except Exception as e:
            return JarvisCommandResponse(
                raw_input=request.input_value,
                transcript=request.input_value,
                normalized_transcript=request.input_value,
                wake_word=None,
                command_text="",
                intent_hint=None,
                target_hint=None,
                should_send_to_orca=False,
                errors=[str(e)],
            )

    def _determine_action(self, event: JarvisEvent) -> str | None:
        """Determine what action to take based on voice command."""
        if not event.voice_command.should_send_to_orca:
            return None

        intent = event.voice_command.intent_hint
        if intent == "prompt-generation":
            return "create_prompt"
        elif intent == "scrum-management":
            return "manage_task"
        elif intent == "bugfix":
            return "create_bugfix_workflow"
        elif intent == "feature":
            return "create_feature_workflow"
        elif intent == "research":
            return "start_research"
        elif intent == "documentation":
            return "generate_documentation"

        return None

    def get_status(self) -> dict[str, Any]:
        """Get status of Jarvis integration."""
        return {
            "available": self.listener is not None,
            "status": "ready" if self.listener is not None else "not_initialized",
            "supported_intents": [
                "prompt-generation",
                "scrum-management",
                "bugfix",
                "feature",
                "research",
                "documentation",
            ],
            "wake_words": ["jarvis"],
        }
