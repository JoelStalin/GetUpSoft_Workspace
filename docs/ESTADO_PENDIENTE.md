# Estado pendiente — documento durable (sobrevive a la reorganización del repo)

**Fecha:** 2026-09-12. Consolidado desde `CHANGE_TIMELINE.md`, `~/.agents_shared_memory`
y `docs/` existentes, antes de reorganizar la estructura de directorios. Este documento
es la fuente de verdad de "qué falta" mientras se ejecuta la reorganización — si algo
se mueve de sitio, este documento debe seguir siendo cierto.

## 1. Las 5+5 candidaturas (correos con CV + formularios) — Fase 1 de CareerAI

Auditoría real del 2026-09-12, verificada en vivo (no solo código leído):

| # | Eslabón | Estado | Evidencia |
|---|---|---|---|
| 1 | Sesión LinkedIn | 🟢 Verde | Probado en vivo: feed cargó sin muro de login. Perfil real: `apps/orca/chrome_profile/careerai-migrated` (NO el Chrome Default del usuario) |
| 2 | CV disponible | 🟢 Verde | PDF real en `data/careerai/original_cvs/Joel_Stalin_Martinez_CV_ES_2026.pdf` + texto extraído. Defecto menor: artefactos de codificación en el texto extraído |
| 3 | Perfil estructurado / priorización | 🔴 Rojo | Catálogo de profesiones existe pero `"validated": false`. Ranking real de prioridades del usuario NO está persistido en ningún lado |
| 4 | Transporte de correo con adjunto | 🟡 Amarillo | Código real, Gmail API real, MIME multipart probado. Los 10 envíos "reales" fueron a la propia bandeja del usuario (autoprueba). Único destinatario externo real (`talenthive1@outlook.com`) quedó solo en borrador, sin evidencia de envío |
| 5 | Rellenado de formularios | 🟡 Amarillo | Greenhouse y Lever con adaptador real. Workday se detecta pero no tiene adaptador — pausa correctamente y pide revisión humana |
| 6 | OCR sobre imágenes reales | 🔴 Rojo | Sin score de confianza por diseño (limitación de `Windows.Media.Ocr`, documentada honestamente en el código). Sin evidencia de haberse corrido contra una imagen real |
| 7 | Personalización real por oferta | 🔴 Rojo | Módulo LLM real existe (`platform/orca/src/careerai/application-tailor.mjs`) pero NO fue el que generó las 10 candidaturas ya enviadas — esas usan una plantilla fija con un perfil genérico que ni coincide con el CV real |

**Conclusión:** 2 verdes, 2 amarillos, 3 rojos. Falta conectar piezas que YA existen
(el tailor LLM real, destinatarios reales, el paso de priorización), no construir
infraestructura nueva.

## 2. Portal `careerai.getupsoft.com`

Diseño completo en `docs/portal.md` (2026-08-28) — **sin código de portal implementado
todavía**, a propósito. Resumen:
- DNS de `getupsoft.com` ya configurado en Cloudflare, subdominio viable sin trabajo nuevo.
- Frontend candidato: `apps/site/getupsoft-site` (sitio real existente) o proyecto separado.
- **Decisión pendiente del usuario (punto 4 del diseño): dónde viven las sesiones del
  portal** — bloquea empezar a construir.
- Mecanismo de deploy real para `getupsoft.com` no verificado todavía.

## 3. Backlog: auto-registro en ATS + handoff de CAPTCHA

- **Auto-registro:** varios ATS exigen crear una cuenta para postular — crear cuentas
  está deliberadamente **fuera de lo que el agente hace** (decisión de diseño, no
  limitación técnica) — ver `CHANGE_TIMELINE.md:674`.
- **CAPTCHA / Challenge de Cloudflare:** el agente pausa y espera intervención humana
  (`CAREERAI_WALL_WAIT_MINUTES`, default 3 min) — comportamiento ya implementado y
  documentado como PASS en `docs/careerai-orca-acceptance-report.md`.
- **Login/consent/MFA/upload/submit:** mismo patrón — pausa con takeover humano visible,
  nunca improvisa.

## 4. Decisiones abiertas del usuario (bloquean trabajo real, no son "nice to have")

1. **CV en Google Drive:** NO existe conexión real — el CV se referencia por hash desde
   `C:/Users/yoeli/Downloads/`, `content_copied_to_repo: false`. El conector de Drive
   está limitado a solo lectura. Subir el CV requiere decisión explícita sobre carpeta
   y permisos de compartición.
2. **Display Name de Meta (WhatsApp Cloud API):** el número `+1 555-963-8117` no tiene
   Display Name aprobado — bloquea usar plantillas de Cloud API. Paso único, no
   recurrente: Meta Business Suite → Profiles → Edit Display Name → esperar aprobación.
3. **Dónde viven las sesiones del portal `careerai.getupsoft.com`** — bloquea iniciar
   construcción del portal (punto 4 de `docs/portal.md`).

## 5. WhatsApp — estado de ambos proveedores

Decisión ya tomada por el propietario (2026-08-28, `CHANGE_TIMELINE.md`):
- **WhatsApp Web (Playwright, gratis) = proveedor principal**, riesgo de baneo asumido
  conscientemente. Probado: `test_careerai_whatsapp_web_live.mjs`.
- **WhatsApp Cloud API oficial = alternativa de pago**, dejada lista pero NO activa por
  defecto — bloqueada por el Display Name de Meta sin aprobar (punto 4.2).
- Grupos: WhatsApp Web los soporta técnicamente pero **evaluados y descartados por
  ahora** (riesgo de baneo del número personal si no hay eSIM/SIM dedicada).

## 6. Cómo usar este documento durante la reorganización

Si un movimiento de carpetas cambia dónde vive algo mencionado aquí (por ejemplo,
`apps/site/getupsoft-site` → nueva ruta), **actualizar la ruta en este documento en el
mismo commit que mueve el archivo** — nunca dejar que este documento quede desactualizado
silenciosamente. Es la fuente de verdad de "qué falta", no un snapshot de un día.
