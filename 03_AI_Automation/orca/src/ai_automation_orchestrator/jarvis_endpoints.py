"""Jarvis voice command endpoints for FastAPI."""

from __future__ import annotations

from typing import Any

from fastapi import FastAPI, HTTPException

from ai_automation_orchestrator.jarvis_integration import (
    JarvisCommandRequest,
    JarvisIntegration,
)


def register_jarvis_endpoints(app: FastAPI) -> None:
    """Register Jarvis voice command endpoints."""

    jarvis = JarvisIntegration()

    @app.get("/api/jarvis/status")
    def jarvis_status() -> dict[str, Any]:
        """Get Jarvis integration status."""
        return jarvis.get_status()

    @app.post("/api/jarvis/command")
    def process_voice_command(request: JarvisCommandRequest) -> dict[str, Any]:
        """Process a voice command through Jarvis."""
        response = jarvis.process_command(request)

        if response.errors:
            raise HTTPException(status_code=400, detail=response.errors[0])

        return {
            "raw_input": response.raw_input,
            "transcript": response.transcript,
            "normalized_transcript": response.normalized_transcript,
            "wake_word": response.wake_word,
            "command_text": response.command_text,
            "intent_hint": response.intent_hint,
            "target_hint": response.target_hint,
            "should_send_to_orca": response.should_send_to_orca,
            "action": response.action,
            "success": not response.errors,
        }

    @app.post("/api/jarvis/webhook")
    def jarvis_webhook(request: JarvisCommandRequest) -> dict[str, Any]:
        """Webhook endpoint for Jarvis to send commands."""
        response = jarvis.process_command(request)

        if not response.should_send_to_orca:
            return {"received": True, "processed": False, "reason": "Not a valid command"}

        # Log the command
        print(
            f"[JARVIS] Intent: {response.intent_hint} | Target: {response.target_hint} | Command: {response.command_text}"
        )

        return {
            "received": True,
            "processed": True,
            "intent": response.intent_hint,
            "action": response.action,
            "target": response.target_hint,
        }

    @app.get("/api/jarvis/commands")
    def list_intents() -> dict[str, Any]:
        """List available voice command intents."""
        return {
            "wake_words": ["jarvis"],
            "intents": [
                {
                    "intent": "prompt-generation",
                    "keywords": ["genera prompt", "genera un prompt"],
                    "action": "create_prompt",
                    "description": "Generate an AI prompt based on voice description",
                },
                {
                    "intent": "scrum-management",
                    "keywords": [
                        "crea tarea",
                        "agrega al backlog",
                        "backlog",
                        "sprint",
                    ],
                    "action": "manage_task",
                    "description": "Create or manage tasks in SCRUM workflow",
                },
                {
                    "intent": "bugfix",
                    "keywords": ["arregla", "corrige", "bug", "error"],
                    "action": "create_bugfix_workflow",
                    "description": "Create a bug fix workflow",
                },
                {
                    "intent": "feature",
                    "keywords": [
                        "implementa",
                        "crea modulo",
                        "crea módulo",
                        "agrega feature",
                    ],
                    "action": "create_feature_workflow",
                    "description": "Create a new feature workflow",
                },
                {
                    "intent": "research",
                    "keywords": ["investiga", "analiza", "compara"],
                    "action": "start_research",
                    "description": "Start a research task",
                },
                {
                    "intent": "documentation",
                    "keywords": ["documenta", "readme", "adr"],
                    "action": "generate_documentation",
                    "description": "Generate documentation",
                },
            ],
        }
