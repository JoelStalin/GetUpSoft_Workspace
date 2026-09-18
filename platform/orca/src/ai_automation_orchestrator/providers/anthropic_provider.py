from __future__ import annotations

import os

from ai_automation_orchestrator.config import ModelConfig
from ai_automation_orchestrator.providers.base import BaseProvider
from ai_automation_orchestrator.providers.nvidia_openai import provider_timeout_seconds


class AnthropicProvider(BaseProvider):
    """Anthropic Claude provider for paid reviewer/QA models."""

    def generate(self, model_config: ModelConfig, messages: list[dict[str, str]], **overrides: object) -> str:
        api_key_env = model_config.api_key_env or "ANTHROPIC_API_KEY"
        api_key = os.getenv(api_key_env)
        if not api_key:
            raise EnvironmentError(f"Environment variable '{api_key_env}' is required for model '{model_config.id}'.")

        import anthropic

        payload = dict(model_config.default_params)
        payload.update({key: value for key, value in overrides.items() if value is not None})

        # Anthropic separates system prompt from messages
        system_prompt = ""
        chat_messages: list[dict[str, str]] = []
        for msg in messages:
            if msg["role"] == "system":
                system_prompt = msg["content"]
            else:
                chat_messages.append(msg)

        client = anthropic.Anthropic(
            api_key=api_key,
            timeout=provider_timeout_seconds(),
        )
        response = client.messages.create(
            model=model_config.model,
            system=system_prompt or anthropic.NOT_GIVEN,
            messages=chat_messages,
            **payload,
        )
        return response.content[0].text if response.content else ""
