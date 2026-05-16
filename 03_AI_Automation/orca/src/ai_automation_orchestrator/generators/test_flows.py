from __future__ import annotations


def build_test_flow_messages(project: str, context: str) -> list[dict[str, str]]:
    return [
        {
            "role": "system",
            "content": (
                "Eres un arquitecto QA senior. Genera un flujo de pruebas completo y accionable. "
                "Incluye alcance, supuestos, precondiciones, riesgos, casos criticos, pruebas funcionales, "
                "no funcionales, integracion, regresion, datos de prueba, automatizacion sugerida y criterios de salida. "
                "Devuelve el resultado en Markdown claro."
            ),
        },
        {
            "role": "user",
            "content": (
                f"Proyecto: {project}\n"
                f"Contexto: {context}\n\n"
                "Quiero un flujo de pruebas reutilizable para el proyecto, con enfoque practico para ejecucion manual y automatizada."
            ),
        },
    ]

