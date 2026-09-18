from __future__ import annotations

import importlib.util
import sys
import types
import unittest
from pathlib import Path
from unittest.mock import patch


SCRIPT_PATH = Path(__file__).resolve().parents[2] / "scripts" / "scrapling_stealth_fetch.py"
SPEC = importlib.util.spec_from_file_location("scrapling_stealth_fetch", SCRIPT_PATH)
scrapling_stealth_fetch = importlib.util.module_from_spec(SPEC)
assert SPEC and SPEC.loader
sys.modules[SPEC.name] = scrapling_stealth_fetch
SPEC.loader.exec_module(scrapling_stealth_fetch)


class FakeSelection:
    def __init__(self, values: list[str]) -> None:
        self.values = values

    def getall(self) -> list[str]:
        return self.values


class FakePage:
    def __init__(self, values: list[str]) -> None:
        self.values = values

    def css(self, selector: str) -> FakeSelection:
        self.selector = selector
        return FakeSelection(self.values)


class ScraplingStealthFetchTests(unittest.TestCase):
    def test_extract_css_normalizes_and_limits_values(self) -> None:
        page = FakePage([" /one ", "", " /two ", "   "])

        items = scrapling_stealth_fetch.extract_css(page, "a::attr(href)", limit=1)

        self.assertEqual(items, ["/one"])
        self.assertEqual(page.selector, "a::attr(href)")

    def test_scrape_css_uses_stealth_defaults(self) -> None:
        fake_page = FakePage(["A", "B"])

        with patch.object(scrapling_stealth_fetch, "fetch_with_scrapling", return_value=fake_page) as fetch:
            result = scrapling_stealth_fetch.scrape_css("https://example.com", "h1::text")

        fetch.assert_called_once_with(
            "https://example.com",
            solve_cloudflare=True,
            headless=True,
            network_idle=True,
        )
        self.assertEqual(result.count, 2)
        self.assertEqual(result.items, ["A", "B"])

    def test_load_stealthy_fetcher_reports_install_hint(self) -> None:
        with patch.dict(sys.modules, {"scrapling": None, "scrapling.fetchers": None}):
            with self.assertRaises(RuntimeError) as raised:
                scrapling_stealth_fetch.load_stealthy_fetcher()

        self.assertIn("pip install", str(raised.exception))


if __name__ == "__main__":
    unittest.main()
