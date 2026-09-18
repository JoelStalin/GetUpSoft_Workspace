from __future__ import annotations

from orca.translation.offline_translator import OfflineTranslator


def test_offline_translator_uses_dictionary_fallback_for_english() -> None:
    translator = OfflineTranslator()

    result = translator.canonicalize("fix login bug and add tests")

    assert result.detected_language == "en"
    assert result.canonical_language == "es"
    assert "arreglar" in result.text
    assert "pruebas" in result.text
