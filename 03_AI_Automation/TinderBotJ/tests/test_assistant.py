from __future__ import annotations

import unittest

from tinderbotj.assistant.models import ConversationContext, ModelPricing
from tinderbotj.assistant.orchestrator import AssistedReplyOrchestrator
from tinderbotj.assistant.pricing import UsageEstimate, calculate_price
from tinderbotj.assistant.providers import parse_suggestions


class AssistantTests(unittest.TestCase):
    def test_calculate_price_adds_fifty_percent_service_fee(self) -> None:
        pricing = ModelPricing(
            model="demo",
            provider="openai",
            input_cost_per_1m=1.0,
            output_cost_per_1m=2.0,
            service_fee_ratio=0.5,
        )
        usage = UsageEstimate(prompt_tokens=1_000_000, completion_tokens=1_000_000)

        result = calculate_price(pricing, usage)

        self.assertAlmostEqual(result["provider_cost_usd"], 3.0)
        self.assertAlmostEqual(result["service_fee_usd"], 1.5)
        self.assertAlmostEqual(result["total_price_usd"], 4.5)

    def test_parse_suggestions_reads_json_payload(self) -> None:
        text = '{"suggestions":[{"label":"Opcion 1","message":"Hola, me llamo la atencion tu bio.","why_it_works":"Abre con algo especifico."}]}'

        parsed = parse_suggestions(text)

        self.assertEqual(parsed[0]["label"], "Opcion 1")
        self.assertIn("bio", parsed[0]["message"])

    def test_orchestrator_builds_cost_estimate(self) -> None:
        orchestrator = AssistedReplyOrchestrator(
            model_catalog={
                "balanced": ModelPricing(
                    model="demo-model",
                    provider="openai",
                    input_cost_per_1m=0.5,
                    output_cost_per_1m=1.0,
                    service_fee_ratio=0.5,
                )
            }
        )
        context = ConversationContext(
            chat_id="abc123",
            name="Ana",
            bio="Me gusta el cafe y viajar.",
            recent_messages=[{"sender": "match", "text": "Hola, como va tu noche?"}],
        )

        estimate = orchestrator.estimate_reply_cost(context)

        self.assertEqual(estimate["model"], "demo-model")
        self.assertGreater(int(estimate["prompt_tokens"]), 0)
        self.assertGreater(float(estimate["total_price_usd"]), 0.0)


if __name__ == "__main__":
    unittest.main()
