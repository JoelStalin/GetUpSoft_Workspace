from __future__ import annotations

import json
import os
from abc import ABC, abstractmethod

import requests

from .models import ModelPricing
from .pricing import UsageEstimate, estimate_tokens_from_text


class ProviderError(RuntimeError):
    pass


class BaseProvider(ABC):
    def __init__(self, pricing: ModelPricing) -> None:
        self.pricing = pricing

    @abstractmethod
    def generate(self, system_prompt: str, user_prompt: str) -> tuple[str, UsageEstimate]:
        raise NotImplementedError

    def _require_api_key(self) -> str:
        api_key = os.getenv(self.pricing.api_key_env, "").strip()
        if not api_key:
            raise ProviderError(
                f"No se encontro la variable de entorno requerida: {self.pricing.api_key_env}"
            )
        return api_key


class OpenAICompatibleProvider(BaseProvider):
    def generate(self, system_prompt: str, user_prompt: str) -> tuple[str, UsageEstimate]:
        api_key = self._require_api_key()
        base_url = self.pricing.base_url or "https://api.openai.com/v1/chat/completions"
        payload = {
            "model": self.pricing.model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            "temperature": 0.8,
        }
        response = requests.post(
            base_url,
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
            json=payload,
            timeout=60,
        )
        response.raise_for_status()
        data = response.json()
        text = data["choices"][0]["message"]["content"].strip()
        usage = data.get("usage", {})
        return text, UsageEstimate(
            prompt_tokens=int(usage.get("prompt_tokens", estimate_tokens_from_text(system_prompt + user_prompt))),
            completion_tokens=int(usage.get("completion_tokens", estimate_tokens_from_text(text))),
        )


class AnthropicProvider(BaseProvider):
    def generate(self, system_prompt: str, user_prompt: str) -> tuple[str, UsageEstimate]:
        api_key = self._require_api_key()
        base_url = self.pricing.base_url or "https://api.anthropic.com/v1/messages"
        payload = {
            "model": self.pricing.model,
            "max_tokens": 500,
            "temperature": 0.8,
            "system": system_prompt,
            "messages": [{"role": "user", "content": user_prompt}],
        }
        response = requests.post(
            base_url,
            headers={
                "x-api-key": api_key,
                "anthropic-version": "2023-06-01",
                "Content-Type": "application/json",
            },
            json=payload,
            timeout=60,
        )
        response.raise_for_status()
        data = response.json()
        text = "".join(
            block.get("text", "")
            for block in data.get("content", [])
            if block.get("type") == "text"
        ).strip()
        usage = data.get("usage", {})
        return text, UsageEstimate(
            prompt_tokens=int(usage.get("input_tokens", estimate_tokens_from_text(system_prompt + user_prompt))),
            completion_tokens=int(usage.get("output_tokens", estimate_tokens_from_text(text))),
        )


class GeminiProvider(BaseProvider):
    def generate(self, system_prompt: str, user_prompt: str) -> tuple[str, UsageEstimate]:
        api_key = self._require_api_key()
        model_name = self.pricing.model
        base_url = self.pricing.base_url or (
            f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={api_key}"
        )
        payload = {
            "systemInstruction": {"parts": [{"text": system_prompt}]},
            "contents": [{"parts": [{"text": user_prompt}]}],
            "generationConfig": {"temperature": 0.8},
        }
        response = requests.post(
            base_url,
            headers={"Content-Type": "application/json"},
            json=payload,
            timeout=60,
        )
        response.raise_for_status()
        data = response.json()
        candidates = data.get("candidates", [])
        if not candidates:
            raise ProviderError("Gemini no devolvio candidatos.")
        parts = candidates[0].get("content", {}).get("parts", [])
        text = "".join(part.get("text", "") for part in parts).strip()
        usage = data.get("usageMetadata", {})
        return text, UsageEstimate(
            prompt_tokens=int(usage.get("promptTokenCount", estimate_tokens_from_text(system_prompt + user_prompt))),
            completion_tokens=int(usage.get("candidatesTokenCount", estimate_tokens_from_text(text))),
        )


def build_provider(pricing: ModelPricing) -> BaseProvider:
    provider = pricing.provider.lower()
    if provider in {"openai", "openrouter"}:
        return OpenAICompatibleProvider(pricing)
    if provider == "anthropic":
        return AnthropicProvider(pricing)
    if provider == "gemini":
        return GeminiProvider(pricing)
    raise ProviderError(f"Proveedor no soportado: {pricing.provider}")


def parse_suggestions(text: str) -> list[dict[str, str]]:
    try:
        data = json.loads(text)
        if isinstance(data, dict) and isinstance(data.get("suggestions"), list):
            suggestions = []
            for index, item in enumerate(data["suggestions"], start=1):
                if not isinstance(item, dict):
                    continue
                suggestions.append(
                    {
                        "label": str(item.get("label") or f"Opcion {index}"),
                        "message": str(item.get("message") or "").strip(),
                        "why_it_works": str(item.get("why_it_works") or "").strip(),
                    }
                )
            if suggestions:
                return suggestions
    except json.JSONDecodeError:
        pass

    blocks = [block.strip() for block in text.split("\n\n") if block.strip()]
    suggestions: list[dict[str, str]] = []
    for index, block in enumerate(blocks[:3], start=1):
        lines = [line.strip("- ").strip() for line in block.splitlines() if line.strip()]
        message = lines[1] if len(lines) > 1 else lines[0]
        why = lines[2] if len(lines) > 2 else "Mantiene un tono natural y conversacional."
        suggestions.append(
            {
                "label": lines[0] if lines else f"Opcion {index}",
                "message": message,
                "why_it_works": why,
            }
        )
    return suggestions
