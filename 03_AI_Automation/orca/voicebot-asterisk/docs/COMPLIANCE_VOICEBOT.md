# CUMPLIMIENTO NORMATIVO Y LEGAL: ORCA VOICEBOT

## 1. Grabación de Llamadas y Consentimiento
Para operar legalmente en República Dominicana (Ley 172-13) y mercados internacionales (GDPR/TCPA), el Voicebot debe seguir este protocolo:
- **Aviso Obligatorio:** Toda llamada iniciada por el bot o recibida debe comenzar con: *"Esta llamada será grabada para fines de calidad y entrenamiento"*.
- **Opción de Opt-out:** El usuario debe poder solicitar que no se le grabe, en cuyo caso el bot debe colgar o transferir a un canal no grabado (si está configurado).

## 2. Protección de Datos Personales (PII)
- **Minimización:** El bot solo debe solicitar los datos estrictamente necesarios para completar la tarea (ej. ID de cliente, Nombre).
- **Encriptación:** Todos los logs y transcripciones deben almacenarse encriptados en reposo.
- **Retención:** Se establece un periodo máximo de retención de 90 días para audios y transcripciones, tras el cual serán eliminados automáticamente.

## 3. Llamadas Salientes (Outbound)
- **Listas DNC (Do Not Call):** Antes de originar una llamada, el sistema debe verificar que el número no esté en la lista de exclusión.
- **Horarios Permitidos:** Las llamadas automáticas solo se realizarán de lunes a viernes en horario comercial (09:00 - 18:00 AST).

## 4. Transparencia de Identidad
- El bot debe identificarse claramente como un asistente de inteligencia artificial: *"Hola, soy el asistente virtual de Getupsoft..."*.

---
*Este documento es una guía técnica y requiere revisión por un equipo legal antes de la puesta en producción masiva.*
