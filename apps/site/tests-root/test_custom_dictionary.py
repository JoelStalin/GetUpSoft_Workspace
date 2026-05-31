from __future__ import annotations

from orca.audio.custom_dictionary import CustomDictionary


def test_custom_dictionary_corrects_orca_term() -> None:
    dictionary = CustomDictionary(entries={"orka": "ORCA"})

    assert dictionary.apply("necesito ayuda con orka") == "necesito ayuda con ORCA"


def test_custom_dictionary_corrects_jarvis_variant() -> None:
    dictionary = CustomDictionary(entries={"jarbis": "Jarvis"})

    assert dictionary.apply("jarbis crea una tarea") == "Jarvis crea una tarea"


def test_custom_dictionary_corrects_n8n_variant() -> None:
    dictionary = CustomDictionary(entries={"en eight en": "n8n"})

    assert dictionary.apply("integra en eight en con backlog") == "integra n8n con backlog"
