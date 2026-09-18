# OpenTypeless Analysis

## Fuente revisada

- Repositorio público: https://github.com/tover0314-w/opentypeless

## Hallazgos relevantes

El README público de OpenTypeless describe:

- producto desktop de voice input open-source;
- hotkey global y modos hold-to-record/toggle;
- múltiples STT providers;
- polish de texto con LLM;
- translation mode;
- diccionario personalizado;
- historial local;
- output por teclado o clipboard;
- arquitectura `React + Tauri/Rust`;
- pipeline `Microphone → Audio Capture → STT Provider → Raw Transcript → LLM Polish → Keyboard/Clipboard Output`.

## Patrones reutilizables en ORCA

- separar captura, STT, transcript y output;
- aislar providers bajo una interfaz estable;
- aplicar diccionario antes del resto del pipeline;
- mantener historial local con foco en privacidad;
- desacoplar modos futuros de output.

## Patrones que NO se adoptan ahora

- polish con LLM;
- dependencias Tauri/React/Rust;
- captura global de teclado;
- envío por defecto a servicios cloud;
- simulación de teclado/clipboard como pieza core.

## Traducción al contexto ORCA

El pipeline objetivo de ORCA queda así:

`Microphone / Audio File / Jarvis Command → Audio Capture → STT Provider local o configurable → Raw Transcript → ORCA Prompt Interpreter → Skill Router → Scrum Mapper → Prompt Builder → Output Adapter → Backlog / Obsidian / GitHub / n8n futuro`

## Riesgos

- contaminar ORCA con una arquitectura desktop que no necesita aún;
- introducir expectativas de grabación real antes de tener contratos sólidos;
- mezclar interpretación local con polish remoto y romper la restricción `no tokens`.

## Recomendación

Adoptar integración por contratos en Python, con providers mockeados y CLI, y dejar la capa desktop como sprint futuro.
