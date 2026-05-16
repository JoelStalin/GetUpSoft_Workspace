from __future__ import annotations

import os

from .models import ConversationContext, ModelPricing, ReplySuggestion, ReplySuggestionResult
from .playbooks import ASSISTED_REPLY_GUARDRAILS, build_playbook_summary
from .pricing import UsageEstimate, calculate_price, estimate_tokens_from_text
from .providers import build_provider, parse_suggestions

DEFAULT_MODEL_CATALOG = {
    "cheap": ModelPricing(
        model="gemini-2.5-flash",
        provider="gemini",
        input_cost_per_1m=0.15,
        output_cost_per_1m=0.60,
        api_key_env="GOOGLE_API_KEY",
    ),
    "balanced": ModelPricing(
        model="gpt-4.1-mini",
        provider="openai",
        input_cost_per_1m=0.40,
        output_cost_per_1m=1.60,
        api_key_env="OPENAI_API_KEY",
    ),
    "premium": ModelPricing(
        model="claude-sonnet-4-5",
        provider="anthropic",
        input_cost_per_1m=3.00,
        output_cost_per_1m=15.00,
        api_key_env="ANTHROPIC_API_KEY",
    ),
}


class AssistedReplyOrchestrator:
    def __init__(self, model_catalog: dict[str, ModelPricing] | None = None) -> None:
        self.model_catalog = model_catalog or DEFAULT_MODEL_CATALOG

    def suggest_replies(
        self,
        context: ConversationContext,
        *,
        strategy: str = "balanced",
    ) -> ReplySuggestionResult:
        pricing = self._select_model(strategy)
        system_prompt, user_prompt = self._build_prompts(context)
        provider = build_provider(pricing)
        raw_text, usage = provider.generate(system_prompt, user_prompt)
        suggestions_data = parse_suggestions(raw_text)
        suggestions = [
            ReplySuggestion(
                label=item["label"],
                message=item["message"],
                why_it_works=item["why_it_works"],
            )
            for item in suggestions_data
            if item["message"]
        ]
        if not suggestions:
            raise RuntimeError("El modelo no devolvio sugerencias utilizables.")

        pricing_breakdown = calculate_price(pricing, usage)
        return ReplySuggestionResult(
            model=pricing.model,
            provider=pricing.provider,
            strategy=strategy,
            suggestions=suggestions,
            prompt_tokens=usage.prompt_tokens,
            completion_tokens=usage.completion_tokens,
            provider_cost_usd=pricing_breakdown["provider_cost_usd"],
            service_fee_usd=pricing_breakdown["service_fee_usd"],
            total_price_usd=pricing_breakdown["total_price_usd"],
            raw_text=raw_text,
        )

    def estimate_reply_cost(
        self,
        context: ConversationContext,
        *,
        strategy: str = "balanced",
        estimated_completion_tokens: int = 250,
    ) -> dict[str, float | str | int]:
        pricing = self._select_model(strategy)
        _, user_prompt = self._build_prompts(context)
        usage = UsageEstimate(
            prompt_tokens=estimate_tokens_from_text(user_prompt),
            completion_tokens=estimated_completion_tokens,
        )
        pricing_breakdown = calculate_price(pricing, usage)
        return {
            "model": pricing.model,
            "provider": pricing.provider,
            "prompt_tokens": usage.prompt_tokens,
            "completion_tokens": usage.completion_tokens,
            **pricing_breakdown,
        }

    def _select_model(self, strategy: str) -> ModelPricing:
        if strategy in self.model_catalog:
            return self.model_catalog[strategy]

        for pricing in self.model_catalog.values():
            if pricing.model == strategy:
                return pricing

        raise KeyError(f"Estrategia o modelo desconocido: {strategy}")

    def _build_prompts(self, context: ConversationContext) -> tuple[str, str]:
        system_prompt = (
            "Eres un asistente de redaccion para respuestas de Tinder. "
            "Tu trabajo es proponer respuestas que un humano revisara antes de enviar. "
            "No actues como bot autonomo ni manipules emocionalmente.\n\n"
            "Guardrails:\n- "
            + "\n- ".join(ASSISTED_REPLY_GUARDRAILS)
            + "\n\nReferencias de conversacion etica:\n"
            + build_playbook_summary()
            + "\n\nDevuelve JSON con esta forma exacta:\n"
            + '{"suggestions":[{"label":"Opcion 1","message":"...","why_it_works":"..."}]}'
        )

        recent_messages = context.recent_messages[-8:]
        transcript_lines = [
            f"{item.get('sender', 'unknown')}: {item.get('text', '').strip()}"
            for item in recent_messages
            if item.get("text")
        ]
        transcript = "\n".join(transcript_lines) if transcript_lines else "Sin historial visible."
        profile_summary = (
            f"Nombre: {context.name or 'N/D'}\n"
            f"Edad: {context.age or 'N/D'}\n"
            f"Bio: {context.bio or 'N/D'}\n"
            f"Trabajo: {context.work or 'N/D'}\n"
            f"Estudio: {context.study or 'N/D'}\n"
            f"Hogar: {context.home or 'N/D'}\n"
            f"Genero: {context.gender or 'N/D'}\n"
            f"Distancia: {context.distance or 'N/D'}\n"
            f"Pasiones: {', '.join(context.passions) if context.passions else 'N/D'}"
        )
        user_prompt = (
            f"Objetivo del usuario: {context.user_goal}\n"
            f"Tono deseado: {context.tone}\n"
            f"Notas adicionales del usuario: {context.user_notes or 'Ninguna'}\n\n"
            f"Perfil del match:\n{profile_summary}\n\n"
            f"Historial reciente:\n{transcript}\n\n"
            "Genera 3 respuestas alternativas, cortas y naturales. "
            "Cada opcion debe ser distinta: una ligera, una curiosa y una mas directa pero respetuosa."
        )
        return system_prompt, user_prompt

    def available_strategies(self) -> list[str]:
        return list(self.model_catalog.keys())

    def configured_models(self) -> list[dict[str, object]]:
        return [item.to_dict() for item in self.model_catalog.values()]
