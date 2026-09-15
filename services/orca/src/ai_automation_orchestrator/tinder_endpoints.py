from __future__ import annotations

from fastapi import FastAPI


def register_tinder_endpoints(app: FastAPI) -> None:
    @app.get("/api/tinder/status")
    def tinder_status() -> dict[str, str]:
        return {"status": "available"}

    @app.post("/api/tinder/action")
    def tinder_action() -> dict[str, str]:
        return {"status": "accepted"}
