# Preflight replay postulacion real (2026-03-27)

## Objetivo
Repetir prueba historica hasta `after_signed_upload` con trazabilidad y control de errores.

## Estado base confirmado
- Run historico que llego a upload: `tests/artifacts/2026-03-26_04-01-53_dgii_real_postulacion_ofv/`.
- Evidencia de upload: `after_signed_upload.json` (resultado: `Error XML. Firma Inválida`).

## Riesgos evaluados antes de correr
1. **Login OFV intermitente**: el submit devuelve a login sin mensaje visible.
2. **Popup Acceder**: puede no abrir portal en modo automatizado.
3. **Portal login separado**: puede requerir credenciales diferentes a OFV.
4. **Firma XML**: aunque suba, DGII puede rechazar por identidad de firmante.

## Mitigaciones aplicadas
- Timeout extendido y captura explícita de popup en `run_real_dgii_postulacion_ofv.py`.
- Flag Chrome `--disable-popup-blocking` en launcher debug.
- Capturas automáticas en cada etapa (`*.png/*.html/*.json`).

## Credenciales y firma validadas
- OFV user: ver `DGII_REAL_USERNAME` (vault/gestor de secretos, no en este repo)
- OFV pass: ver `DGII_REAL_PASSWORD` (vault/gestor de secretos, no en este repo)
- P12 path: `app/dgii/certf/` (archivo `.p12` real excluido del repo, ver `.gitignore`)
- P12 pass: ver `DGII_SIGNING_P12_PASSWORD` (vault/gestor de secretos, no en este repo)

**Nota de seguridad (2026-09-18):** este archivo contenia originalmente el
usuario/contrasena reales del Portal OFV de DGII y la contrasena del
certificado `.p12` en texto plano. Fueron redactados tras un hallazgo de
seguridad P1 en el PR #16 (revision automatica de Codex). Esas credenciales
**deben considerarse comprometidas** porque ya fueron pusheadas al remoto
antes de esta redaccion -- requieren rotacion inmediata en el portal DGII y
reemision del certificado, independientemente de este cambio.
