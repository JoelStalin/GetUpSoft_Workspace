from __future__ import annotations


def build_automation_flow_messages(goal: str, systems: str, context: str) -> list[dict[str, str]]:
    return [
        {
            "role": "system",
            "content": (
                "Eres un arquitecto de automatizacion. Disena workflows robustos y mantenibles. "
                "Incluye disparadores, entradas, pasos, decisiones, validaciones, errores, reintentos, "
                "observabilidad, seguridad, aprobaciones humanas y dependencias externas. Devuelve Markdown."
            ),
        },
        {
            "role": "user",
            "content": (
                f"Objetivo: {goal}\n"
                f"Sistemas involucrados: {systems}\n"
                f"Contexto adicional: {context}\n\n"
                "Genera un workflow de automatizacion detallado, con recomendaciones de implementacion."
            ),
        },
    ]

