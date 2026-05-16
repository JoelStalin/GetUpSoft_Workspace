from __future__ import annotations

from orca.audio.voice_command_router import VoiceCommandRouter


def test_voice_command_router_detects_wake_word_and_bugfix() -> None:
    command = VoiceCommandRouter().route("Jarvis arregla el bug del login y crea pruebas")

    assert command.wake_word == "Jarvis"
    assert command.intent_hint == "bugfix"
    assert command.target_hint == "login"


def test_voice_command_router_detects_feature() -> None:
    command = VoiceCommandRouter().route("Jarvis implementa un modulo de exportacion")

    assert command.intent_hint == "feature"


def test_voice_command_router_detects_research() -> None:
    command = VoiceCommandRouter().route("Jarvis investiga opciones para historial local")

    assert command.intent_hint == "research"


def test_voice_command_router_detects_scrum_management() -> None:
    command = VoiceCommandRouter().route("Jarvis crea tarea para el sprint de voz")

    assert command.intent_hint == "scrum-management"


def test_voice_command_router_detects_prompt_generation() -> None:
    command = VoiceCommandRouter().route("Jarvis genera prompt para modelo gratuito")

    assert command.intent_hint == "prompt-generation"
