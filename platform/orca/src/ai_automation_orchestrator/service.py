from __future__ import annotations

from typing import Protocol

from ai_automation_orchestrator.config import AppConfig, ModelConfig
from ai_automation_orchestrator.providers.nvidia_openai import NvidiaOpenAICompatibleProvider
from ai_automation_orchestrator.providers.openai_native import OpenAINativeProvider
from ai_automation_orchestrator.providers.anthropic_provider import AnthropicProvider


class Provider(Protocol):
    def generate(self, model_config: ModelConfig, messages: list[dict[str, str]], **overrides: object) -> str:
        ...


class OrchestratorService:
    def __init__(self, config: AppConfig) -> None:
        self.config = config
        self.providers: dict[str, Provider] = {
            "nvidia-openai-compatible": NvidiaOpenAICompatibleProvider(),
            "openai-native": OpenAINativeProvider(),
            "anthropic": AnthropicProvider(),
        }

    def list_models(self) -> list[ModelConfig]:
        return self.config.models

    def list_models_by_role(self, role: str) -> list[ModelConfig]:
        return [m for m in self.config.models if role in m.roles]

    def generate(
        self,
        *,
        messages: list[dict[str, str]],
        model_id: str | None = None,
        **overrides: object,
    ) -> str:
        model_config = self.config.get_model(model_id)
        provider = self.providers.get(model_config.provider)
        if provider is None:
            raise KeyError(f"Provider '{model_config.provider}' is not supported yet.")
        return provider.generate(model_config, messages, **overrides)

