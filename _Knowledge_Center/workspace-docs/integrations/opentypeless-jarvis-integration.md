# OpenTypeless + ORCA Jarvis Integration

## Objetivo

Reforzar Jarvis usando un pipeline inspirado en OpenTypeless:

- captura de audio,
- STT,
- transcripción,
- diccionario personalizado,
- detección de intención,
- comandos de voz,
- salida estructurada,
- historial local,
- integración futura con Obsidian, GitHub y n8n.

## Decisión

No se hará vendoring completo de OpenTypeless.
Se implementará una capa ORCA compatible por contratos.

## Pipeline ORCA Jarvis

Microphone / Audio File
→ Jarvis Listener
→ STT Provider
→ Transcript Normalizer
→ Voice Command Router
→ ORCA Prompt Interpreter
→ Skill Router
→ Scrum Mapper
→ Prompt Builder
→ Output Adapter

## Capacidades inspiradas en OpenTypeless

- Global hotkey, futuro.
- Hold-to-record, futuro.
- Toggle recording, futuro.
- Floating capsule, futuro.
- STT provider abstraction.
- Translation mode.
- Custom dictionary.
- Per-app detection, futuro.
- Local transcript history.
- Keyboard/clipboard output, futuro.
- Scenes / prompt templates.
- Self-hostable/local-first mode.

## MVP

El MVP no graba audio real todavía.
El MVP procesa:

- texto transcrito,
- archivo de audio simulado,
- provider mock de STT,
- salida JSON compatible con ORCA.

## Límites del sprint

- no se integra Tauri ni Rust al core;
- no se activan hotkeys globales;
- no se envía audio a la nube por defecto;
- no se guarda ninguna API key en el repo;
- no se agrega polish con LLM al pipeline local.
