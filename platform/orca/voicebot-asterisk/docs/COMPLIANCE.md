# Cumplimiento Normativo (Compliance)

La automatización de llamadas requiere el estricto cumplimiento de diversas leyes y normativas según la jurisdicción (TCPA en EE.UU., GDPR en Europa, leyes locales de telemarketing).

## 1. Grabación de Llamadas
- En muchas jurisdicciones, se requiere **consentimiento mutuo** (Two-Party Consent) para grabar llamadas.
- El bot debe reproducir una advertencia obligatoria al iniciar la llamada: "Esta llamada puede ser grabada para fines de calidad y entrenamiento".
- Si un usuario no acepta, el flujo debe tener una forma de proceder sin grabar, o finalizar la llamada de manera cordial.

## 2. Llamadas Salientes Automatizadas
- **No realice campañas masivas no solicitadas (Robocalls/Spam).**
- Asegúrese de filtrar las llamadas salientes usando Listas de No Llamar (Do Not Call - DNC).
- Mantenga mecanismos de "Opt-Out" claros (Ej. "Diga 'No me llamen' para ser removido de nuestra lista").

## 3. Protección de Datos (PII)
- Si el voicebot (especialmente con IA / LLMs integrados) recopila datos médicos (HIPAA), de tarjetas de pago (PCI-DSS), o información personal (GDPR/CCPA):
  - No envíe datos sensibles a proveedores de IA sin contratos BAA (Business Associate Agreement) o en modo "Zero Data Retention".
  - Anonimice los datos antes de transcribirlos o guardarlos.
  - Asegure bases de datos con encriptación en reposo y en tránsito.

*Este documento es una guía general técnica y no constituye asesoría legal.*
