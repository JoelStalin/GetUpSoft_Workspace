from __future__ import annotations

import os

from ai_automation_orchestrator.config import ModelConfig
from ai_automation_orchestrator.providers.base import BaseProvider
from ai_automation_orchestrator.providers.nvidia_openai import provider_timeout_seconds


class OpenAINativeProvider(BaseProvider):
    """Direct OpenAI API provider for paid models (gpt-4o, o1, etc.)."""

    def generate(self, model_config: ModelConfig, messages: list[dict[str, str]], **overrides: object) -> str:
        api_key_env = model_config.api_key_env or "OPENAI_API_KEY"
        api_key = os.getenv(api_key_env)
        if not api_key:
            raise EnvironmentError(f"Environment variable '{api_key_env}' is required for model '{model_config.id}'.")

        from openai import OpenAI

        payload = dict(model_config.default_params)
        payload.update({key: value for key, value in overrides.items() if value is not None})

        client = OpenAI(
            api_key=api_key,
            timeout=provider_timeout_seconds(),
            max_retries=1,
        )
        completion = client.chat.completions.create(
            model=model_config.model,
            messages=messages,
            stream=False,
            **payload,
        )
        return completion.choices[0].message.content or ""
