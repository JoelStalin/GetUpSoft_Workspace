import pytest
from bot.message_builder import MessageBuilder
from bot.models import ExtractionResult

def test_builder_with_name():
    builder = MessageBuilder()
    result = ExtractionResult(visible_name="Daniel")
    msg = builder.build(result)
    assert "Daniel" in msg
    assert "Galante's Jewelry" in msg

def test_builder_generic():
    builder = MessageBuilder()
    result = ExtractionResult(visible_name="Joyero/a")
    msg = builder.build(result)
    # En la versión genérica no debería aparecer "{nombre_persona}" literal, 
    # sino el texto sin personalización.
    assert "¡Hola!" in msg
    assert "{nombre_persona}" not in msg
