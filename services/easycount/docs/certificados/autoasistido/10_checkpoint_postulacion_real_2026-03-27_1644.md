# Checkpoint postulacion real DGII (2026-03-27 16:44)

## Estado alcanzado
- OFV autenticado correctamente (`/OFV/home.aspx`).
- Acceso a pantalla de solicitud de emisor electronico en OFV completado.
- Navegacion al Portal de Certificacion realizada.
- Punto de bloqueo actual: login en `https://ecf.dgii.gov.do/certecf/portalcertificacion/Login?...`.

## Evidencia grafica
- PDF consolidado: `docs/evidence/dgii_postulacion_visual_evidence_20260327_164434.pdf`
- Carpeta de corrida: `tests/artifacts/2026-03-27_16-44-34_dgii_real_postulacion_ofv/`

## Variables validadas
- `DGII_REAL_USERNAME=<ver gestor de secretos>`
- `DGII_REAL_PASSWORD=<ver gestor de secretos>`
- `DGII_SIGNING_P12_PATH=app/dgii/certf/` (archivo `.p12` real excluido del repo)
- `DGII_SIGNING_P12_PASSWORD=<ver gestor de secretos>` (validada)

**Nota de seguridad (2026-09-18):** este archivo contenia originalmente el
usuario/contrasena reales del Portal OFV de DGII, la ruta local del
certificado, y la contrasena del `.p12` en texto plano -- redactado tras
hallazgo de seguridad P1 en PR #16 (Codex). Esas credenciales ya fueron
pusheadas al remoto antes de esta redaccion y **deben considerarse
comprometidas**: requieren rotacion inmediata en el portal DGII y
reemision del certificado.

## Causa tecnica actual
El script usa las credenciales OFV para intentar login del Portal de Certificacion. Ese portal no esta aceptando esas credenciales de forma automatica (timeout de transicion post-submit).

## Siguiente paso para completarlo 100% automatico
1. Integrar credenciales propias del Portal de Certificacion (si son distintas a OFV):
   - `DGII_CERT_PORTAL_USERNAME`
   - `DGII_CERT_PORTAL_PASSWORD`
2. Reintentar flujo; al entrar a Postulacion:
   - generar XML
   - firmar con p12 validado
   - subir XML firmado
   - capturar respuesta final DGII
