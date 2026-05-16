from __future__ import annotations

from dataclasses import dataclass

from .models import ModelPricing


@dataclass(slots=True)
class UsageEstimate:
    prompt_tokens: int
    completion_tokens: int


def estimate_tokens_from_text(text: str) -> int:
    normalized = " ".join(text.split())
    if not normalized:
        return 0
    return max(1, round(len(normalized) / 4))


def calculate_price(pricing: ModelPricing, usage: UsageEstimate) -> dict[str, float]:
    provider_cost = (
        (usage.prompt_tokens / 1_000_000) * pricing.input_cost_per_1m
        + (usage.completion_tokens / 1_000_000) * pricing.output_cost_per_1m
    )
    service_fee = provider_cost * pricing.service_fee_ratio
    return {
        "provider_cost_usd": provider_cost,
        "service_fee_usd": service_fee,
        "total_price_usd": provider_cost + service_fee,
    }
