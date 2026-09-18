from __future__ import annotations

import importlib.util
import sys
import unittest
from pathlib import Path
from unittest.mock import patch


SCRIPT_PATH = Path(__file__).resolve().parents[2] / "scripts" / "getupsoft_portals_scrapling_smoke.py"
SPEC = importlib.util.spec_from_file_location("getupsoft_portals_scrapling_smoke", SCRIPT_PATH)
module = importlib.util.module_from_spec(SPEC)
assert SPEC and SPEC.loader
sys.modules[SPEC.name] = module
SPEC.loader.exec_module(module)


class FakeSelection:
    def __init__(self, values: list[str]) -> None:
        self.values = values

    def get(self):
        return self.values[0] if self.values else None

    def getall(self):
        return self.values


class FakePage:
    def __init__(self, mapping: dict[str, list[str]]) -> None:
        self.mapping = mapping

    def css(self, selector: str):
        return FakeSelection(self.mapping.get(selector, []))


class GetUpSoftPortalsScraplingSmokeTests(unittest.TestCase):
    def test_inspect_target_passes_when_title_root_and_assets_match(self) -> None:
        fake_page = FakePage(
            {
                "title::text": ["Certia | Plataforma Corporativa"],
                "#root": ["root"],
                "script[src], link[rel='stylesheet']": ["app.js", "app.css"],
            }
        )

        with patch.object(module, "fetch_with_scrapling", return_value=fake_page), patch.object(
            module, "select_url", return_value=(module.DEFAULT_PORTAL_TARGETS[0].url, False)
        ):
            result = module.inspect_target(module.DEFAULT_PORTAL_TARGETS[0])

        self.assertEqual(result["status"], "pass")
        self.assertEqual(result["asset_count"], 2)
        self.assertEqual(result["root_count"], 1)

    def test_inspect_target_fails_when_title_does_not_match(self) -> None:
        fake_page = FakePage(
            {
                "title::text": ["Wrong Title"],
                "#root": ["root"],
                "script[src], link[rel='stylesheet']": ["app.js"],
            }
        )

        with patch.object(module, "fetch_with_scrapling", return_value=fake_page), patch.object(
            module, "select_url", return_value=(module.DEFAULT_PORTAL_TARGETS[0].url, False)
        ):
            result = module.inspect_target(module.DEFAULT_PORTAL_TARGETS[0])

        self.assertEqual(result["status"], "fail")
        self.assertEqual(result["actual_title"], "Wrong Title")

    def test_select_url_uses_fallback_when_primary_does_not_resolve(self) -> None:
        target = module.DEFAULT_PORTAL_TARGETS[2]
        with patch.object(module, "url_reachable", side_effect=[False, True]):
            selected_url, fallback_used = module.select_url(target)

        self.assertEqual(selected_url, target.fallback_url)
        self.assertTrue(fallback_used)

    def test_inspect_target_reports_blocked_when_no_url_is_reachable(self) -> None:
        target = module.DEFAULT_PORTAL_TARGETS[2]
        with patch.object(module, "select_url", return_value=(None, False)):
            result = module.inspect_target(target)

        self.assertEqual(result["status"], "blocked")
        self.assertIsNone(result["checked_url"])


if __name__ == "__main__":
    unittest.main()
