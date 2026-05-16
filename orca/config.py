from __future__ import annotations

from pathlib import Path

from pydantic import BaseModel, ConfigDict, Field


class OrcaSettings(BaseModel):
    model_config = ConfigDict(frozen=True)

    project_root: Path = Field(default_factory=lambda: Path(__file__).resolve().parent.parent)
    canonical_language: str = "es"
    low_confidence_threshold: float = 0.55
    argos_package_dir: Path | None = None
    vosk_model_path: Path | None = None
    service_host: str = "127.0.0.1"
    service_port: int = 8787

    @property
    def docs_dir(self) -> Path:
        return self.project_root / "docs"

    @property
    def backlog_dir(self) -> Path:
        return self.project_root / "orca" / "backlog"

    @property
    def skills_dir(self) -> Path:
        return self.project_root / "orca" / "skills"

    @property
    def templates_dir(self) -> Path:
        return self.project_root / "orca" / "templates"

    @property
    def sample_training_data_path(self) -> Path:
        return self.project_root / "orca" / "ml" / "sample_training_data.csv"

    @property
    def intent_model_path(self) -> Path:
        return self.project_root / ".artifacts" / "intent_classifier.joblib"

    @property
    def sqlite_dir(self) -> Path:
        return self.project_root / ".artifacts"

    @property
    def error_registry_path(self) -> Path:
        return self.sqlite_dir / "orca_errors.sqlite3"

    @property
    def obsidian_vault_dir(self) -> Path:
        return self.docs_dir / "obsidian-vault"

    @property
    def n8n_dir(self) -> Path:
        return self.project_root / "orca" / "integrations"

    @property
    def deploy_dir(self) -> Path:
        return self.project_root / "deploy"


def get_settings() -> OrcaSettings:
    return OrcaSettings()
