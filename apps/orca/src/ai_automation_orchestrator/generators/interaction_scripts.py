from __future__ import annotations


def build_interaction_script_messages(audience: str, objective: str, tone: str, context: str) -> list[dict[str, str]]:
    return [
        {
            "role": "system",
            "content": (
                "Eres un estratega de experiencia de cliente. Crea scripts conversacionales claros, utiles y persuasivos. "
                "Incluye apertura, descubrimiento, manejo de objeciones, respuestas frecuentes, cierres y siguientes pasos. "
                "Adapta el lenguaje al contexto y devuelve Markdown."
            ),
        },
        {
            "role": "user",
            "content": (
                f"Audiencia: {audience}\n"
                f"Objetivo: {objective}\n"
                f"Tono: {tone}\n"
                f"Contexto adicional: {context}\n\n"
                "Necesito un guion util para interacciones con usuarios o clientes."
            ),
        },
    ]

