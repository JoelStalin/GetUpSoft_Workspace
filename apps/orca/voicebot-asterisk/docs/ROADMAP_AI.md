# Roadmap: Evolución hacia un Voicebot con Inteligencia Artificial

Este MVP establece el control telefónico. Para convertirlo en un agente conversacional inteligente, se deben seguir estas fases:

## Fase 1: STT y TTS Básico
- **Objetivo**: Integrar transcripción en tiempo real y síntesis de voz.
- **Implementación**: Usar Google Speech-to-Text / TTS, o Deepgram + ElevenLabs.
- **Cambio en Python**: Sustituir el `play('sound:hello-world')` por la grabación del canal (`client.channels.record()`) o usar un bridge/audiosocket para capturar el stream en bytes, mandarlo al STT, recibir el texto, enviarlo a un LLM, generar el TTS, y hacer `play('media:URL_DEL_AUDIO_GENERADO')`.

## Fase 2: Integración de LLM (GPT-4 / Claude)
- **Objetivo**: Añadir un "cerebro" al bot.
- **Implementación**: Crear un estado conversacional por `call_id`. Mantener el historial de la conversación (system prompt + histórico usuario/bot).
- **Manejo de Latencia**: Generar "filler words" (Ej. "Entiendo...", "Un momento por favor...") mientras el LLM y el TTS procesan la respuesta para evitar silencios incómodos.

## Fase 3: Integración a CRM y Acciones
- **Objetivo**: El bot puede hacer consultas a APIs, agendar citas, o crear tickets.
- **Implementación**: Utilizar "Function Calling" o "Tools" en la API del LLM.

## Fase 4: Transferencia a Agente Humano
- **Objetivo**: Si la IA no sabe qué hacer, pasa la llamada a un asesor humano.
- **Implementación**: Usar la API de ARI para conectar el canal actual con un nuevo canal SIP usando un bridge (`client.bridges.create()`, `bridge.addChannel()`).

## Fase 5: Concurrencia y Escalabilidad
- **Objetivo**: Soportar múltiples llamadas al mismo tiempo.
- **Implementación**: Refactorizar `bot.py` para usar programación asíncrona (`asyncio`, `aiohttp` y una librería ARI asíncrona) o usar manejo de threads por evento para evitar bloqueos durante las consultas de red al LLM/TTS.
