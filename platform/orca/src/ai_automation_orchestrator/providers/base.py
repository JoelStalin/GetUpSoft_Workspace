from __future__ import annotations

from abc import ABC, abstractmethod

from ai_automation_orchestrator.config import ModelConfig


class BaseProvider(ABC):
    @abstractmethod
    def generate(self, model_config: ModelConfig, messages: list[dict[str, str]], **overrides: object) -> str:
        raise NotImplementedError

