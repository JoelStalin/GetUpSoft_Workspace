from __future__ import annotations

from dataclasses import dataclass, field
import json
import os
from pathlib import Path
from typing import Any


@dataclass(slots=True)
class ModelConfig:
    id: str
    provider: str
    model: str
    base_url: str | None = None
    api_key_env: str | None = None
    default_params: dict[str, Any] = field(default_factory=dict)
    extra_body: dict[str, Any] = field(default_factory=dict)
    # Pipeline role classification
    tier: str = "free"       # "free" | "paid"
    roles: list[str] = field(default_factory=lambda: ["worker"])
    # Roles: "worker" | "reviewer" | "tester" | "qa"


@dataclass(slots=True)
class AppConfig:
    default_model: str
    models: list[ModelConfig]

    def get_model(self, model_id: str | None = None) -> ModelConfig:
        target = model_id or self.default_model
        for model in self.models:
            if model.id == target:
                return model
        raise KeyError(f"Model '{target}' is not configured.")


def repository_root() -> Path:
    candidates = [
        Path.cwd(),
        Path(__file__).resolve().parents[2],
        Path(__file__).resolve().parents[3],
    ]
    for candidate in candidates:
        if (candidate / "config").exists():
            return candidate
    return Path.cwd()


def default_config_path() -> Path:
    configured_path = os.getenv("AI_ORCHESTRATOR_CONFIG_PATH")
    if configured_path:
        return Path(configured_path)

    root = repository_root()
    preferred = root / "config" / "models.json"
    if preferred.exists():
        return preferred
    return root / "config" / "models.example.json"


def load_config(config_path: str | Path | None = None) -> AppConfig:
    path = Path(config_path) if config_path else default_config_path()
    data = json.loads(path.read_text(encoding="utf-8"))
    models = [ModelConfig(**item) for item in data["models"]]
    return AppConfig(default_model=data["default_model"], models=models)

