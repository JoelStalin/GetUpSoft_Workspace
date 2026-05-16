from __future__ import annotations

import json
from pathlib import Path
from typing import Literal

import typer

from orca.audio.jarvis_listener import JarvisListener
from orca.audio.providers.mock_stt_provider import MockSTTProvider
from orca.audio.providers.vosk_stt_provider import VoskSTTProvider
from orca.audio.stt_provider import STTProvider
from orca.audio.transcript_history import TranscriptHistory
from orca.config import get_settings
from orca.core.prompt_interpreter import PromptInterpreter
from orca.integrations.n8n_contract import build_n8n_contract
from orca.memory.obsidian_vault import ObsidianVault
from orca.ml.train_intent_model import train_intent_model
from orca.output.output_adapter import OutputAdapter
from orca.storage.error_registry import ErrorRegistry

app = typer.Typer(help="ORCA offline prompt interpreter")
jarvis_app = typer.Typer(help="Jarvis voice-oriented commands")
jarvis_history_app = typer.Typer(help="Manage local Jarvis transcript history")
affected_file_option = typer.Option([], "--affected-file")
validation_step_option = typer.Option([], "--validation-step")


@app.command("interpret")
def interpret(text: str) -> None:
    """Interpret free text into structured Scrum JSON."""
    interpreter = PromptInterpreter(get_settings())
    payload = interpreter.interpret_text(text)
    typer.echo(json.dumps(payload.model_dump(mode="json"), ensure_ascii=False, indent=2))


@app.command("interpret-file")
def interpret_file(path: Path) -> None:
    """Interpret a script or plain text file."""
    interpreter = PromptInterpreter(get_settings())
    payload = interpreter.interpret_script(path)
    typer.echo(json.dumps(payload.model_dump(mode="json"), ensure_ascii=False, indent=2))


@app.command("interpret-audio")
def interpret_audio(path: Path) -> None:
    """Interpret an audio file using the offline wrapper."""
    interpreter = PromptInterpreter(get_settings())
    payload = interpreter.interpret_audio(path)
    typer.echo(json.dumps(payload.model_dump(mode="json"), ensure_ascii=False, indent=2))


@app.command("train-intent-model")
def train_model() -> None:
    """Train and persist the local intent classifier."""
    output_path = train_intent_model()
    typer.echo(f"Model written to {output_path}")


@app.command("export-obsidian")
def export_obsidian(text: str, note_name: str) -> None:
    """Interpret text and export the result as an Obsidian-compatible note."""
    interpreter = PromptInterpreter(get_settings())
    payload = interpreter.interpret_text(text)
    note_path = ObsidianVault(get_settings()).write_interpretation(note_name, payload)
    typer.echo(str(note_path))


@app.command("build-n8n-payload")
def build_n8n_payload(text: str) -> None:
    """Interpret text and output the n8n contract JSON."""
    interpreter = PromptInterpreter(get_settings())
    payload = interpreter.interpret_text(text)
    contract = build_n8n_contract(payload)
    typer.echo(json.dumps(contract.model_dump(mode="json"), ensure_ascii=False, indent=2))


@app.command("record-error")
def record_error(
    category: str,
    command: str,
    probable_cause: str,
    affected_file: list[str] = affected_file_option,
    validation_step: list[str] = validation_step_option,
    free_model_prompt: str = "",
) -> None:
    """Persist an error entry in the local SQLite registry."""
    registry = ErrorRegistry(get_settings())
    record = registry.record(
        category=category,
        command=command,
        probable_cause=probable_cause,
        affected_files=affected_file,
        free_model_prompt=free_model_prompt,
        manual_validation_steps=validation_step,
    )
    typer.echo(json.dumps(record.__dict__, ensure_ascii=False, indent=2))


def _resolve_transcript_history(*, enabled: bool) -> TranscriptHistory:
    settings = get_settings()
    return TranscriptHistory(settings.transcript_history_path, enabled=enabled)


def _build_jarvis_result_payload(
    interpreter: PromptInterpreter,
    listener: JarvisListener,
    input_value: str,
    source_type: Literal["transcript", "audio_ref"],
) -> dict[str, object]:
    event = listener.listen(input_value, source_type=source_type)
    interpreted = interpreter.process_jarvis_event(event)
    return {
        "transcript": event.transcript,
        "normalized_transcript": event.normalized_transcript,
        "voice_command": event.voice_command.model_dump(mode="json"),
        "orca_interpreter_result": interpreted.model_dump(mode="json"),
    }


@jarvis_app.command("transcript")
def jarvis_transcript(text: str, store_history: bool = False) -> None:
    """Process an already transcribed Jarvis command."""
    settings = get_settings()
    listener = JarvisListener(
        settings,
        transcript_history=_resolve_transcript_history(enabled=store_history),
    )
    interpreter = PromptInterpreter(settings, jarvis_listener=listener)
    payload = _build_jarvis_result_payload(interpreter, listener, text, "transcript")
    OutputAdapter().to_terminal(payload)


@jarvis_app.command("audio")
def jarvis_audio(path: str, provider: str = "mock", store_history: bool = False) -> None:
    """Process a Jarvis audio reference using a configured provider."""
    settings = get_settings()
    stt_provider: STTProvider | None = None
    if provider == "mock":
        stt_provider = MockSTTProvider(
            {
                "sample_bug.wav": "Jarvis arregla el bug del login y crea pruebas",
                "sample_task.wav": "Jarvis crea una tarea para integrar Obsidian",
            }
        )
    elif provider == "vosk":
        stt_provider = VoskSTTProvider(settings)
    listener = JarvisListener(
        settings,
        stt_provider=stt_provider,
        transcript_history=_resolve_transcript_history(enabled=store_history),
    )
    interpreter = PromptInterpreter(settings, jarvis_listener=listener)
    payload = _build_jarvis_result_payload(interpreter, listener, path, "audio_ref")
    OutputAdapter().to_terminal(payload)


@jarvis_history_app.command("list")
def jarvis_history_list(limit: int = 10) -> None:
    """List recent Jarvis transcript history entries."""
    history = _resolve_transcript_history(enabled=True)
    OutputAdapter().to_terminal(history.list_recent(limit=limit))


@jarvis_history_app.command("clear")
def jarvis_history_clear() -> None:
    """Clear local Jarvis transcript history."""
    history = _resolve_transcript_history(enabled=True)
    history.clear()
    typer.echo("Jarvis transcript history cleared.")


app.add_typer(jarvis_app, name="jarvis")
jarvis_app.add_typer(jarvis_history_app, name="history")


def main() -> None:
    app()


if __name__ == "__main__":
    main()
