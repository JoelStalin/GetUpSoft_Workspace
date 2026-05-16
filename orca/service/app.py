from __future__ import annotations

from typing import Literal

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

from orca.config import get_settings
from orca.core.completion_policy import AUTONOMOUS_COMPLETION_POLICY
from orca.core.prompt_interpreter import InterpretationOutput, PromptInterpreter
from orca.integrations.n8n_contract import N8NContract, build_n8n_contract


class InterpretRequest(BaseModel):
    source_type: Literal["text", "script", "audio"] = "text"
    content: str = Field(min_length=1)


class HealthResponse(BaseModel):
    status: str
    canonical_language: str
    low_confidence_threshold: float
    completion_policy: str


def create_app() -> FastAPI:
    settings = get_settings()
    interpreter = PromptInterpreter(settings)

    app = FastAPI(
        title="GetUpSoft ORCA",
        version="0.1.0",
        summary="Offline-first prompt interpreter service for GetUpSoft Workspace",
    )

    @app.get("/health", response_model=HealthResponse)
    def health() -> HealthResponse:
        return HealthResponse(
            status="ok",
            canonical_language=settings.canonical_language,
            low_confidence_threshold=settings.low_confidence_threshold,
            completion_policy=AUTONOMOUS_COMPLETION_POLICY,
        )

    @app.post("/interpret", response_model=InterpretationOutput)
    def interpret(request: InterpretRequest) -> InterpretationOutput:
        if request.source_type == "text":
            return interpreter.interpret_text(request.content, source_type="text")
        if request.source_type == "script":
            return interpreter.interpret_script(request.content)
        if request.source_type == "audio":
            return interpreter.interpret_audio(request.content)
        raise HTTPException(status_code=400, detail="Unsupported source_type")

    @app.post("/n8n-payload", response_model=N8NContract)
    def n8n_payload(request: InterpretRequest) -> N8NContract:
        payload = interpret(request)
        return build_n8n_contract(payload)

    return app
