"""Jarvis voice command endpoints for FastAPI."""

from __future__ import annotations

from pathlib import Path
from typing import Any, Optional

from fastapi import FastAPI, HTTPException, Cookie, UploadFile, File, Form
from fastapi.responses import HTMLResponse

from ai_automation_orchestrator.jarvis_integration import (
    JarvisCommandRequest,
    JarvisIntegration,
)
from ai_automation_orchestrator.user_auth import SessionManager

# Global session manager (set by register_jarvis_endpoints)
session_manager: Optional[SessionManager] = None


def register_jarvis_endpoints(app: FastAPI, sess_mgr: Optional[SessionManager] = None) -> None:
    """Register Jarvis voice command endpoints."""

    global session_manager
    session_manager = sess_mgr

    jarvis = JarvisIntegration()

    @app.get("/api/jarvis/status")
    def jarvis_status(session_id: str = Cookie(None)) -> dict[str, Any]:
        """Get Jarvis integration status."""
        if session_id and session_manager:
            user_id = session_manager.validate_session(session_id)
            if not user_id:
                raise HTTPException(status_code=401, detail="Invalid session")
        else:
            raise HTTPException(status_code=401, detail="Not authenticated")

        return jarvis.get_status()

    @app.post("/api/jarvis/command")
    async def process_voice_command(
        session_id: str = Cookie(None),
        audio: Optional[UploadFile] = File(None),
        text: Optional[str] = Form(None),
    ) -> dict[str, Any]:
        """Process a voice command through Jarvis - accepts audio file or text."""
        if session_id and session_manager:
            user_id = session_manager.validate_session(session_id)
            if not user_id:
                raise HTTPException(status_code=401, detail="Invalid session")
        else:
            raise HTTPException(status_code=401, detail="Not authenticated")

        # Process audio or text
        input_text = text or ""

        if audio and audio.filename:
            # If audio file provided, use a default transcript
            # In production, you'd use speech-to-text API
            input_text = "Comando de voz capturado"

        if not input_text:
            raise HTTPException(status_code=400, detail="Must provide text or audio")

        # Create request and process
        request = JarvisCommandRequest(input_value=input_text, source_type="transcript")
        response = jarvis.process_command(request)

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
            "success": len(response.errors) == 0,
            "errors": response.errors,
            "user_id": user_id,
        }

    @app.post("/api/jarvis/webhook")
    def jarvis_webhook(request: JarvisCommandRequest, session_id: str = Cookie(None)) -> dict[str, Any]:
        """Webhook endpoint for Jarvis to send commands."""
        if session_id and session_manager:
            user_id = session_manager.validate_session(session_id)
            if not user_id:
                raise HTTPException(status_code=401, detail="Invalid session")
        else:
            raise HTTPException(status_code=401, detail="Not authenticated")

        response = jarvis.process_command(request)

        if not response.should_send_to_orca:
            return {"received": True, "processed": False, "reason": "Not a valid command"}

        # Log the command with user context
        print(
            f"[JARVIS] User: {user_id} | Intent: {response.intent_hint} | Target: {response.target_hint} | Command: {response.command_text}"
        )

        return {
            "received": True,
            "processed": True,
            "intent": response.intent_hint,
            "action": response.action,
            "target": response.target_hint,
            "user_id": user_id,
        }

    @app.get("/api/jarvis/commands")
    def list_intents(session_id: str = Cookie(None)) -> dict[str, Any]:
        """List available voice command intents."""
        if session_id and session_manager:
            user_id = session_manager.validate_session(session_id)
            if not user_id:
                raise HTTPException(status_code=401, detail="Invalid session")
        else:
            raise HTTPException(status_code=401, detail="Not authenticated")

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

    @app.get("/jarvis/clap", response_class=HTMLResponse)
    def jarvis_clap_detection(session_id: str = Cookie(None)) -> str:
        """Serve Jarvis clap detection interface."""
        # Check authentication
        if session_id and session_manager:
            user_id = session_manager.validate_session(session_id)
            if not user_id:
                raise HTTPException(status_code=401, detail="Invalid session")
        else:
            raise HTTPException(status_code=401, detail="Not authenticated")

        clap_detection_path = (
            Path(__file__).parent / "jarvis_clap_detection.html"
        )

        if clap_detection_path.exists():
            return clap_detection_path.read_text()
        else:
            return """
            <!DOCTYPE html>
            <html>
            <head><title>Jarvis Clap Detection</title></head>
            <body style="background: #050505; color: #fff; text-align: center; display: flex; align-items: center; justify-content: center; height: 100vh; font-family: monospace;">
                <div>
                    <h1>🐋 Jarvis Clap Detection</h1>
                    <p>Interfaz de detección de aplauso para Jarvis</p>
                    <p style="color: #666; margin-top: 20px; font-size: 12px;">
                        Aplaude para activar el reconocimiento de voz<br>
                        Asegúrate de haber concedido acceso al micrófono
                    </p>
                </div>
            </body>
            </html>
            """
