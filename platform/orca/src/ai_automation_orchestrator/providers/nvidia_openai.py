from __future__ import annotations

import os

from ai_automation_orchestrator.config import ModelConfig
from ai_automation_orchestrator.providers.base import BaseProvider


def provider_timeout_seconds() -> float:
    raw = os.getenv("AI_PROVIDER_TIMEOUT_SECONDS", "60")
    try:
        return float(raw)
    except ValueError:
        return 60.0


class NvidiaOpenAICompatibleProvider(BaseProvider):
    def generate(self, model_config: ModelConfig, messages: list[dict[str, str]], **overrides: object) -> str:
        api_key_env = model_config.api_key_env
        if not api_key_env:
            raise ValueError(f"Model '{model_config.id}' is missing 'api_key_env'.")

        api_key = os.getenv(api_key_env)
        if not api_key:
            raise EnvironmentError(f"Environment variable '{api_key_env}' is required for model '{model_config.id}'.")

        from openai import OpenAI

        payload = dict(model_config.default_params)
        payload.update({key: value for key, value in overrides.items() if value is not None})

        client = OpenAI(
            base_url=model_config.base_url,
            api_key=api_key,
            timeout=provider_timeout_seconds(),
            max_retries=0,
        )
        completion = client.chat.completions.create(
            model=model_config.model,
            messages=messages,
            extra_body=model_config.extra_body or None,
            stream=False,
            **payload,
        )
        return completion.choices[0].message.content or ""

