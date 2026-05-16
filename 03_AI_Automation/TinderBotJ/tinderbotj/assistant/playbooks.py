from __future__ import annotations

ETHICAL_CONVERSATION_REFERENCES = [
    {
        "title": "Crucial Conversations",
        "principles": [
            "crear seguridad",
            "buscar proposito mutuo",
            "ser claro sin agresividad",
        ],
    },
    {
        "title": "Nonviolent Communication",
        "principles": [
            "observar sin juzgar",
            "expresar interes genuino",
            "hacer peticiones en lugar de presionar",
        ],
    },
    {
        "title": "Difficult Conversations",
        "principles": [
            "hacer una pregunta a la vez",
            "mostrar curiosidad",
            "no asumir intenciones",
        ],
    },
]


ASSISTED_REPLY_GUARDRAILS = [
    "Actua como asistente de sugerencias para un humano, no como bot autonomo.",
    "No manipules, no engañes y no prometas nada falso.",
    "Prioriza autenticidad, consentimiento, respeto y claridad.",
    "Usa un tono natural, breve y conversacional.",
    "No sexualices ni presiones.",
    "Sugiere una sola pregunta abierta si aporta valor.",
    "Aprovecha detalles reales del perfil o del historial reciente.",
]


def build_playbook_summary() -> str:
    lines: list[str] = []
    for item in ETHICAL_CONVERSATION_REFERENCES:
        lines.append(f"- {item['title']}: {', '.join(item['principles'])}")
    return "\n".join(lines)
