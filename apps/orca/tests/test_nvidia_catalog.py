from __future__ import annotations

import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))

from ai_automation_orchestrator.nvidia_catalog import (
    NvidiaModelSnapshot,
    build_generated_catalog,
    decide_compatibility,
    parse_model_cards,
    slugify_model_id,
)


class NvidiaCatalogTests(unittest.TestCase):
    def test_slugify_model_id(self) -> None:
        self.assertEqual(slugify_model_id("moonshotai/kimi-k2.6"), "moonshotai-kimi-k2-6")

    def test_parse_cards_keeps_unique_model_paths(self) -> None:
        raw = [
            {
                "href": "https://build.nvidia.com/deepseek-ai/deepseek-v4-pro",
                "name": "deepseek-v4-pro",
                "text": "DeepSeek AI\nDownloadable\ndeepseek-v4-pro\nDeepSeek V4 for coding\ncoding\n+3\n7.15M\n2w",
            },
            {
                "href": "https://build.nvidia.com/deepseek-ai/deepseek-v4-pro",
                "name": "deepseek-v4-pro",
                "text": "DeepSeek AI\nDownloadable\ndeepseek-v4-pro\nDeepSeek V4 for coding\ncoding\n+3\n7.15M\n2w",
            },
        ]
        parsed = parse_model_cards(raw)
        self.assertEqual(len(parsed), 1)
        self.assertEqual(parsed[0].slug_path, "deepseek-ai/deepseek-v4-pro")

    def test_compatibility_rules_include_llm_and_exclude_specialized_endpoints(self) -> None:
        llm_item = NvidiaModelSnapshot(
            publisher="DeepSeek AI",
            name="deepseek-v4-pro",
            href="https://build.nvidia.com/deepseek-ai/deepseek-v4-pro",
            slug_path="deepseek-ai/deepseek-v4-pro",
            badges=["Free Endpoint"],
            summary="DeepSeek V4 for coding and agentic reasoning.",
            tags=["coding"],
        )
        detector_item = NvidiaModelSnapshot(
            publisher="NVIDIA",
            name="synthetic-video-detector",
            href="https://build.nvidia.com/nvidia/synthetic-video-detector",
            slug_path="nvidia/synthetic-video-detector",
            badges=["Free Endpoint"],
            summary="Detect AI-generated synthetic videos.",
            tags=["broadcast"],
        )

        self.assertTrue(decide_compatibility(llm_item).compatible)
        self.assertFalse(decide_compatibility(detector_item).compatible)

    def test_generated_catalog_uses_orca_provider_shape(self) -> None:
        items = [
            NvidiaModelSnapshot(
                publisher="DeepSeek AI",
                name="deepseek-v4-pro",
                href="https://build.nvidia.com/deepseek-ai/deepseek-v4-pro",
                slug_path="deepseek-ai/deepseek-v4-pro",
                badges=["Free Endpoint"],
                summary="DeepSeek V4 for coding and agentic reasoning.",
                tags=["coding"],
            ),
            NvidiaModelSnapshot(
                publisher="NVIDIA",
                name="synthetic-video-detector",
                href="https://build.nvidia.com/nvidia/synthetic-video-detector",
                slug_path="nvidia/synthetic-video-detector",
                badges=["Free Endpoint"],
                summary="Detect AI-generated synthetic videos.",
                tags=["broadcast"],
            ),
        ]
        catalog = build_generated_catalog(items)

        self.assertEqual(catalog["default_model"], "deepseek-v4-pro")
        self.assertEqual(len(catalog["models"]), 1)
        self.assertEqual(catalog["models"][0]["provider"], "nvidia-openai-compatible")
        self.assertEqual(catalog["models"][0]["base_url"], "https://integrate.api.nvidia.com/v1")
        self.assertEqual(catalog["models"][0]["api_key_env"], "NVIDIA_API_KEY")
        self.assertEqual(len(catalog["excluded_models"]), 1)


if __name__ == "__main__":
    unittest.main()
