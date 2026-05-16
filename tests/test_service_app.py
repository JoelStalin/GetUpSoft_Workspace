from __future__ import annotations

from fastapi.testclient import TestClient

from orca.service.app import create_app


def test_service_health_endpoint_reports_runtime_policy() -> None:
    client = TestClient(create_app())

    response = client.get("/health")

    assert response.status_code == 200
    payload = response.json()
    assert payload["status"] == "ok"
    assert "Work autonomously" in payload["completion_policy"]


def test_service_interpret_endpoint_returns_structured_payload() -> None:
    client = TestClient(create_app())

    response = client.post(
        "/interpret",
        json={"source_type": "text", "content": "arregla el error del login y agrega pruebas"},
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["detected_intent"] == "bugfix"
    assert payload["selected_skill"] == "bugfix_skill"
