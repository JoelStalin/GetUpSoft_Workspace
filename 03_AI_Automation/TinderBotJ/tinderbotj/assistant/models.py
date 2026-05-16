from __future__ import annotations

from dataclasses import asdict, dataclass, field
from typing import Any


@dataclass(slots=True)
class ModelPricing:
    model: str
    provider: str
    input_cost_per_1m: float
    output_cost_per_1m: float
    service_fee_ratio: float = 0.5
    api_key_env: str = ""
    base_url: str | None = None

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


@dataclass(slots=True)
class ConversationContext:
    chat_id: str
    name: str | None = None
    age: int | None = None
    bio: str | None = None
    work: str | None = None
    study: str | None = None
    home: str | None = None
    gender: str | None = None
    distance: int | None = None
    passions: list[str] = field(default_factory=list)
    recent_messages: list[dict[str, str]] = field(default_factory=list)
    user_goal: str = "Mantener una conversacion autentica y respetuosa."
    tone: str = "natural, amable y directo"
    user_notes: str = ""

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


@dataclass(slots=True)
class ReplySuggestion:
    label: str
    message: str
    why_it_works: str

    def to_dict(self) -> dict[str, str]:
        return asdict(self)


@dataclass(slots=True)
class ReplySuggestionResult:
    model: str
    provider: str
    strategy: str
    suggestions: list[ReplySuggestion]
    prompt_tokens: int
    completion_tokens: int
    provider_cost_usd: float
    service_fee_usd: float
    total_price_usd: float
    raw_text: str

    def to_dict(self) -> dict[str, Any]:
        return {
            "model": self.model,
            "provider": self.provider,
            "strategy": self.strategy,
            "suggestions": [item.to_dict() for item in self.suggestions],
            "usage": {
                "prompt_tokens": self.prompt_tokens,
                "completion_tokens": self.completion_tokens,
            },
            "pricing": {
                "provider_cost_usd": round(self.provider_cost_usd, 6),
                "service_fee_usd": round(self.service_fee_usd, 6),
                "total_price_usd": round(self.total_price_usd, 6),
            },
            "raw_text": self.raw_text,
        }
