import pytest
from bot.message_builder import MessageBuilder
from bot.models import ExtractionResult

def test_facebook_to_instagram_message():
    builder = MessageBuilder()
    # Simular perfil de Facebook
    result = ExtractionResult(
        visible_name="Juan Perez",
        url="https://www.facebook.com/juan.perez"
    )
    msg = builder.build(result)
    assert "Instagram" in msg
    assert "https://www.instagram.com/galantesjewelrybythesea/" in msg
    assert "Juan" in msg

def test_instagram_to_facebook_message():
    builder = MessageBuilder()
    # Simular perfil de Instagram
    result = ExtractionResult(
        visible_name="Maria Lopez",
        url="https://www.instagram.com/marialopez/"
    )
    msg = builder.build(result)
    assert "Facebook" in msg
    assert "https://www.facebook.com/profile.php?id=61574429843836" in msg
    assert "Maria" in msg
