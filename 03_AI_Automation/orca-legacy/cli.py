from __future__ import annotations

import json
from pathlib import Path
from typing import Literal

import typer
import yaml

from orca.audio.jarvis_listener import JarvisListener
from orca.audio.providers.mock_stt_provider import MockSTTProvider
from orca.audio.providers.vosk_stt_provider import VoskSTTProvider
from orca.audio.stt_provider import STTProvider
from orca.audio.transcript_history import TranscriptHistory
from orca.config import get_settings
from orca.core.prompt_interpreter import PromptInterpreter
from orca.integrations.n8n_contract import build_n8n_contract
from orca.integrations.tinder import handle_tinder_command
from orca.memory.obsidian_vault import ObsidianVault
from orca.ml.train_intent_model import train_intent_model
from orca.output.output_adapter import OutputAdapter
from orca.service_health import build_health_response
from orca.storage.error_registry import ErrorRegistry

app = typer.Typer(help="ORCA offline prompt interpreter")
prompt_app = typer.Typer(help="Prompt interpretation commands")
jarvis_app = typer.Typer(help="Jarvis voice-oriented commands")
jarvis_history_app = typer.Typer(help="Manage local Jarvis transcript history")
backlog_app = typer.Typer(help="Inspect ORCA backlog and sprint status")
skills_app = typer.Typer(help="Inspect available ORCA skills")
service_app = typer.Typer(help="Run or inspect the local ORCA HTTP service")
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


@app.command("tinder-automation")
def tinder_automation(action: str, headless: bool = False, extra_args: list[str] = typer.Argument(None)) -> None:
    """Control the integrated Tinder automation service."""
    if action == "logs":
        from orca.storage.activity_registry import ActivityRegistry
        registry = ActivityRegistry(get_settings())
        logs = registry.recent(service="Tinder", limit=50)
        typer.echo(json.dumps([log.__dict__ for log in logs], ensure_ascii=False))
        return

    if action == "stats":
        from orca.storage.activity_registry import ActivityRegistry
        registry = ActivityRegistry(get_settings())
        stats = registry.get_stats(service="Tinder")
        typer.echo(json.dumps(stats, ensure_ascii=False))
        return

    if action == "matches":
        result = handle_tinder_command(action, headless=headless)
        typer.echo(json.dumps(result, ensure_ascii=False))
        return

    if action == "ai-reply":
        if not extra_args:
            typer.echo(json.dumps({"error": "Missing chat_id"}, ensure_ascii=False))
            return
        result = handle_tinder_command(action, headless=headless, extra_args=extra_args)
        typer.echo(json.dumps(result, ensure_ascii=False))
        return

    result = handle_tinder_command(action, headless=headless, extra_args=extra_args)
    typer.echo(json.dumps(result, ensure_ascii=False))


def _resolve_transcript_history(*, enabled: bool) -> TranscriptHistory:
    settings = get_settings()
    return TranscriptHistory(settings.transcript_history_path, enabled=enabled)


def _load_yaml(path: Path) -> dict[str, object]:
    data = yaml.safe_load(path.read_text(encoding="utf-8"))
    if not isinstance(data, dict):
        raise ValueError(f"Expected YAML mapping in {path}")
    return data


def _load_product_backlog() -> dict[str, object]:
    settings = get_settings()
    return _load_yaml(settings.backlog_dir / "product_backlog.yaml")


def _load_sprint_backlog() -> dict[str, object]:
    settings = get_settings()
    return _load_yaml(settings.backlog_dir / "sprint_backlog.yaml")


def _list_skill_files() -> list[Path]:
    settings = get_settings()
    return sorted(
        path
        for path in settings.skills_dir.glob("*.yaml")
        if path.name != "skill_schema.yaml"
    )


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


@app.callback(invoke_without_command=True)
def root(ctx: typer.Context) -> None:
    """ORCA CLI entrypoint."""
    if ctx.invoked_subcommand is None:
        typer.echo("ORCA CLI")
        typer.echo("Use one of: doctor, prompt, jarvis, backlog, skills, service")
        typer.echo("Examples:")
        typer.echo('  orca prompt text "arregla el bug del login"')
        typer.echo('  orca jarvis transcript "Jarvis crea tarea para backlog"')
        typer.echo("  orca backlog status")
        typer.echo("  orca doctor")


@app.command("doctor")
def doctor() -> None:
    """Show runtime diagnostics for the local ORCA installation."""
    settings = get_settings()
    payload = {
        "project_root": str(settings.project_root),
        "canonical_language": settings.canonical_language,
        "low_confidence_threshold": settings.low_confidence_threshold,
        "intent_model_exists": settings.intent_model_path.exists(),
        "transcript_history_path": str(settings.transcript_history_path),
        "transcript_history_exists": settings.transcript_history_path.exists(),
        "skills_count": len(_list_skill_files()),
        "service_host": settings.service_host,
        "service_port": settings.service_port,
        "vosk_model_path": str(settings.vosk_model_path) if settings.vosk_model_path else None,
    }
    OutputAdapter().to_terminal(payload)


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


@prompt_app.command("text")
def prompt_text(text: str) -> None:
    """Interpret plain text through the ORCA prompt pipeline."""
    interpret(text)


@prompt_app.command("file")
def prompt_file(path: Path) -> None:
    """Interpret a text or script file through the ORCA prompt pipeline."""
    interpret_file(path)


@prompt_app.command("audio")
def prompt_audio(path: Path) -> None:
    """Interpret an audio file through the ORCA prompt pipeline."""
    interpret_audio(path)


@backlog_app.command("status")
def backlog_status() -> None:
    """Summarize product backlog and sprint status."""
    product_backlog = _load_product_backlog()
    sprint_backlog = _load_sprint_backlog()
    epics_raw = product_backlog.get("epics", [])
    sprints_raw = sprint_backlog.get("sprints", [])
    epics = epics_raw if isinstance(epics_raw, list) else []
    sprints = sprints_raw if isinstance(sprints_raw, list) else []
    done = 0
    in_progress = 0
    planned = 0
    for epic in epics:
        if not isinstance(epic, dict):
            continue
        stories = epic.get("stories", [])
        if not isinstance(stories, list):
            continue
        for story in stories:
            if not isinstance(story, dict):
                continue
            status = story.get("status")
            if status == "done":
                done += 1
            elif status == "in_progress":
                in_progress += 1
            else:
                planned += 1
    payload = {
        "epics": len(epics),
        "sprints": len(sprints),
        "stories_done": done,
        "stories_in_progress": in_progress,
        "stories_planned": planned,
    }
    OutputAdapter().to_terminal(payload)


@backlog_app.command("stories")
def backlog_stories(status: str = "all") -> None:
    """List backlog stories filtered by status."""
    product_backlog = _load_product_backlog()
    rows: list[dict[str, object]] = []
    epics = product_backlog.get("epics", [])
    if isinstance(epics, list):
        for epic in epics:
            if not isinstance(epic, dict):
                continue
            stories = epic.get("stories", [])
            if not isinstance(stories, list):
                continue
            for story in stories:
                if not isinstance(story, dict):
                    continue
                story_status = str(story.get("status", "unknown"))
                if status != "all" and story_status != status:
                    continue
                rows.append(
                    {
                        "epic": epic.get("id"),
                        "story": story.get("id"),
                        "title": story.get("title"),
                        "status": story_status,
                        "priority": story.get("priority"),
                    }
                )
    OutputAdapter().to_terminal(rows)


@skills_app.command("list")
def skills_list() -> None:
    """List ORCA skills available for routing."""
    rows: list[dict[str, object]] = []
    for skill_file in _list_skill_files():
        payload = _load_yaml(skill_file)
        rows.append(
            {
                "name": payload.get("name"),
                "intents": payload.get("intents", []),
                "summary": payload.get("summary"),
                "file": skill_file.name,
            }
        )
    OutputAdapter().to_terminal(rows)


@service_app.command("health")
def service_health() -> None:
    """Show the local service health payload without starting the server."""
    OutputAdapter().to_terminal(build_health_response().model_dump(mode="json"))


@service_app.command("run")
def service_run(host: str | None = None, port: int | None = None) -> None:
    """Run the migrated ORCA backend service."""
    del host, port
    typer.echo(
        "ORCA FastAPI service was migrated. Use apps/backend-nest instead (npm run start:dev in apps/backend-nest)."
    )


app.add_typer(jarvis_app, name="jarvis")
jarvis_app.add_typer(jarvis_history_app, name="history")
app.add_typer(prompt_app, name="prompt")
app.add_typer(backlog_app, name="backlog")
app.add_typer(skills_app, name="skills")
app.add_typer(service_app, name="service")


def main() -> None:
    app()


if __name__ == "__main__":
    main()
