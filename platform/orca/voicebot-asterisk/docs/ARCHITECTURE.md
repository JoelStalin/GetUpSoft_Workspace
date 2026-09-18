# Arquitectura del Voicebot (Asterisk + ARI + Python)

Este documento detalla la arquitectura técnica del sistema para recibir, procesar y contestar llamadas telefónicas automatizadas.

## Flujo de Llamada Entrante
1. **PSTN / Red Pública**: Un usuario marca un número DID.
2. **SIP Trunk Provider**: El proveedor encamina la llamada al servidor Asterisk.
3. **Asterisk (PJSIP)**: Recibe el INVITE de SIP y lo procesa según `pjsip.conf`.
4. **Dialplan (extensions.conf)**: La llamada entra al contexto definido (ej. `voicebot-from-trunk`). Se ejecuta la aplicación `Stasis()`.
5. **ARI (Asterisk REST Interface)**: Notifica al bot Python sobre el evento `StasisStart`.
6. **Python Bot**: 
   - Llama al endpoint de ARI para hacer `Answer()`.
   - Llama al endpoint de ARI para hacer `Play()` reproduciendo un audio.
   - (Futuro) Encamina el audio a STT/TTS o pasa el control a un LLM.
7. **Finalización**: Cuando termina el flujo, el bot hace `Hangup()` a través de ARI.

## Flujo de Llamada Saliente (Outbound)
1. **Python Bot / CRM**: Un evento dispara la necesidad de llamar.
2. **ARI Originate**: El bot usa `client.channels.originate(...)` o un POST REST a `/ari/channels`.
3. **Asterisk**: Llama a través del trunk PJSIP configurado.
4. **PSTN**: Ringing en el dispositivo destino.
5. **Respuesta**: Al contestar, la llamada entra inmediatamente en la aplicación Stasis y el bot asume el control.

## Componentes Futuros (Roadmap de IA)
- **STT (Speech-to-Text)**: Se usarán herramientas locales (Whisper) o en la nube (Google/Deepgram) para transcribir en tiempo real obteniendo el stream de audio (vía Audiosocket o grabación temporal).
- **LLM (Large Language Model)**: OpenAI, Claude o similar recibirán el texto y generarán una respuesta contextualizada.
- **TTS (Text-to-Speech)**: ElevenLabs, Azure o similar convertirán la respuesta del LLM a audio para que Asterisk lo reproduzca.
- **CRM**: Integración mediante webhooks o API para registrar interacciones o crear tickets.
