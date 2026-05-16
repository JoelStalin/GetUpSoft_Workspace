from __future__ import annotations

import json
from pathlib import Path

import typer

from orca.config import get_settings
from orca.core.prompt_interpreter import PromptInterpreter
from orca.integrations.n8n_contract import build_n8n_contract
from orca.memory.obsidian_vault import ObsidianVault
from orca.ml.train_intent_model import train_intent_model
from orca.storage.error_registry import ErrorRegistry

app = typer.Typer(help="ORCA offline prompt interpreter")
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


def main() -> None:
    app()
