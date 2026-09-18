# ROADMAP TECNOLÓGICO: EVOLUCIÓN ORCA IA

## Fase 1: Control Telefónico Robusto (MVP - Actual)
- [x] Instalación de Asterisk 20 LTS.
- [x] Conector ARI en Python.
- [x] Respuestas de audio pre-grabadas.
- [x] Registro de eventos en logs.

## Fase 2: Percepción Auditiva (STT)
- **Objetivo:** Que el bot entienda lo que dice el usuario.
- **Tecnología:** Integración de **Deepgram** o **OpenAI Whisper** vía WebSocket.
- **Hito:** Transcripción en tiempo real con latencia inferior a 500ms.

## Fase 3: Inteligencia Cognitiva (LLM)
- **Objetivo:** Generar respuestas dinámicas y contextuales.
- **Tecnología:** Conexión con **Claude 3.5 Sonnet** o **GPT-4o** mediante el orquestador Orca.
- **Hito:** Manejo de interrupciones y turnos de palabra naturales.

## Fase 4: Voz Sintética Premium (TTS)
- **Objetivo:** Que el bot hable con una voz humana y profesional.
- **Tecnología:** **ElevenLabs** o **Azure Neural Voices**.
- **Hito:** Integración de audios dinámicos en el canal ARI sin cortes.

## Fase 5: Integración Operativa (CRM/ERP)
- **Objetivo:** Que el bot realice acciones reales (Citas, Tickets, Consultas).
- **Tecnología:** APIs de **Odoo** y CRM corporativo.
- **Hito:** Un bot que puede agendar una consultoría técnica automáticamente tras una llamada.

---
*Roadmap estratégico para el desarrollo del producto Orca 2026.*
