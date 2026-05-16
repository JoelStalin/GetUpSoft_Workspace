from __future__ import annotations

import json
from pathlib import Path

import typer

from orca.config import get_settings
from orca.core.prompt_interpreter import PromptInterpreter
from orca.ml.train_intent_model import train_intent_model

app = typer.Typer(help="ORCA offline prompt interpreter")


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


def main() -> None:
    app()
