# WhatsApp en CareerAI — arquitectura, riesgo y precios

Fecha de investigación: 2026-08-28. Todos los precios y políticas están verificados con
fuentes actuales de esa fecha (documentación oficial de Meta cuando existía, si no la mejor
fuente disponible) — el pricing de WhatsApp cambió varias veces, no asumir nada de memoria.

## 1. Arquitectura: dos proveedores, un contrato común

```
apps/orca/src/careerai/whatsapp-provider.mjs        <- interfaz común + guardas anti-baneo
apps/orca/src/careerai/whatsapp-web-provider.mjs    <- WhatsAppWebProvider (Playwright, gratis)
apps/orca/src/careerai/whatsapp-cloud-api.mjs       <- WhatsAppCloudApiProvider (oficial, de pago)
apps/orca/src/careerai/whatsapp.mjs                 <- conector previo (Evolution API/Baileys) — sin tocar
scripts/careerai_whatsapp_login_handoff.mjs         <- login por QR, perfil de Chromium persistente
```

Selección por variable de entorno, **sin default implícito** (`selectProviderName` en
`whatsapp-provider.mjs` falla explícitamente si no está configurada):

```
WHATSAPP_PROVIDER=web     # WhatsApp Web automatizado, gratis, riesgo de baneo real
WHATSAPP_PROVIDER=cloud   # API oficial de Meta, de pago, riesgo de baneo cero
```

Ambos proveedores comparten el mismo patrón de guardas que el resto de CareerAI
(`checkApproval`, idempotencia, `confirm: true` explícito para el envío real): preparar nunca
envía.

### ¿Por qué no until MCP de navegador?

Esta sesión de Claude Code tiene herramientas de navegador MCP (`mcp__Claude_Browser__*`),
pero son para la navegación interactiva de **esta conversación**, no una librería que el
proceso Node.js de CareerAI pueda invocar de forma desatendida en producción. El pipeline
real sigue con **Playwright directo** (ya está en `apps/orca/workflow-editor/node_modules`),
igual que el patrón ya existente para el login de LinkedIn/Indeed.

### Grupos: evaluado y descartado por ahora

WhatsApp Web sí soporta crear grupos y escribir en ellos (a diferencia de la Cloud API, que
lo restringe a cuentas OBA). Pero no se implementó: automatizar creación/gestión de grupos
añade superficie de detección (WhatsApp vigila especialmente patrones de creación de grupos
para lucha contra spam) sin beneficio real sobre 1-a-1 — el resultado que pedía el
propietario ("el cliente y yo enterados") se logra igual con dos mensajes 1-a-1 (uno al
cliente, uno al admin). Si más adelante se necesita de verdad un grupo, es una extensión
acotada de `whatsapp-web-provider.mjs`, no un rediseño.

## 2. `WHATSAPP_PROVIDER=web` — WhatsApp Web automatizado (gratis)

Mismo patrón que `careerai_login_handoff.mjs` (LinkedIn/Indeed): perfil de Chromium
persistente **separado** (`apps/orca/chrome_profile/whatsapp-web`, no se mezcla con el de
LinkedIn/Indeed), el usuario escanea el QR una vez con
`node scripts/careerai_whatsapp_login_handoff.mjs`, la sesión queda persistida.

### ⚠️ Riesgo real — léelo antes de usar este módulo

**Automatizar WhatsApp Web viola los Términos de Servicio de WhatsApp.** No es un detalle
legal abstracto: WhatsApp corre modelos de detección que analizan ratio de respuesta,
distancia en el grafo de contactos y patrones temporales. Investigación 2026 sobre bots de
WhatsApp reporta baneo típico del número vinculado en **2 a 8 semanas**, sin patrón
predecible, **sin aviso previo**. Puede durar meses sin problema, o caer en una semana.

**Recomendación explícita: usa un número SECUNDARIO, nunca tu número personal.** Si el número
vinculado a este perfil se banea, solo se pierde ese número — no tu WhatsApp personal ni de
negocio real.

Mitigaciones aplicadas en el código (reducen el riesgo, no lo eliminan):

| Mitigación | Dónde |
|---|---|
| Opt-in obligatorio: nunca se escribe a un número sin confirmación previa | `checkOptIn` |
| Límite diario configurable (40 mensajes/día por defecto) | `checkDailyLimit` |
| Espaciado mínimo entre envíos (15s + jitter aleatorio 0.8–2.5s) | `checkRateLimit('whatsapp_web', ...)` + `randomJitterMs` |
| Nunca ráfagas: un mensaje a la vez, con espera humana antes de escribir | `sendWebMessage` |

## 3. `WHATSAPP_PROVIDER=cloud` — API oficial de Meta (de pago, cero riesgo)

`whatsapp-cloud-api.mjs` ya está implementado y probado (commit `da341af023`), no es un
esqueleto: `prepareCloudApiMessage` / `sendCloudApiMessage` / `cloudApiStatus`, mismas
guardas. Falta, si algún día se activa en producción con volumen real: soporte de plantillas
(`template`) para mensajes fuera de la ventana de servicio de 24h — hoy solo envía texto
libre, que solo funciona dentro de esa ventana.

## 4. Pricing actual (verificado agosto 2026, no de memoria)

**No existe nivel gratuito mensual de mensajes** desde julio de 2025 (el mito de "1,000
conversaciones gratis/mes" es de un modelo que Meta retiró). Lo gratis hoy:

- Mensajes que no son plantilla: **siempre gratis**.
- Plantillas de utilidad, **dentro de una ventana de servicio de 24h ya abierta** (el
  destinatario escribió primero): **gratis**.
- Todo dentro de una ventana de entrada gratuita de 72h (p. ej. clic en un anuncio "Click to
  WhatsApp"): **gratis**.
- Fuera de esas ventanas: **cualquier mensaje debe ser una plantilla aprobada, y se cobra**
  según categoría, país del destinatario y volumen mensual.

**Cambio que viene:** desde el **1 de octubre de 2026** (~5 semanas), los mensajes de
servicio dentro de la ventana de 24h dejan de ser gratis. No afecta arrancar esta semana.

### Categorías y tarifas de referencia (por mensaje entregado, USD)

| Categoría | Rango típico | España | México |
|---|---|---|---|
| Utilidad (utility) | $0.004 – $0.046 | ~$0.02–0.03 (estimado, ver nota) | ~$0.0085 |
| Autenticación (authentication) | $0.004 – $0.046 | similar a utilidad | ~$0.0085 |
| Marketing | $0.025 – $0.1365 | ~$0.0615 | ~$0.0436 |
| Servicio (dentro de ventana 24h) | gratis hoy → de pago desde 2026-10-01 | — | — |

*Nota: Meta publica las tarifas exactas por país en archivos CSV/PDF descargables por
moneda desde su portal de developers, no como tabla HTML pública — los valores de España
para utilidad/autenticación son una estimación por rango, no la cifra exacta del rate card;
antes de presupuestar en firme, descargar el CSV oficial (EUR) desde WhatsApp Manager.*

Además del precio de Meta, si se usa un BSP (Business Solution Provider) intermediario se
suma su margen (~$0.003–$0.010/mensaje) — usando la Cloud API directo (como ya está
configurado en `.env.local`) no aplica ese sobrecosto.

### Estimación de costo mensual para CareerAI

Notificaciones de estado de postulación = categoría **utilidad**, mayormente fuera de la
ventana de 24h (son avisos que el agente inicia, no respuestas a un mensaje reciente del
cliente), así que se cobran desde ya (no dependen del cambio de octubre).

| Volumen/mes | Tarifa México (~$0.0085) | Tarifa España (~$0.02–0.03, estimado) |
|---|---|---|
| 100 | ~$0.85 | ~$2–3 |
| 1,000 | ~$8.50 | ~$20–30 |
| 10,000 | ~$85 | ~$200–300 |

Para el volumen actual de CareerAI (Joel, uso personal, unas pocas notificaciones/semana:
~10-20/mes), el costo real es **centavos al mes** — prácticamente gratis en la práctica,
aunque no sea "$0" contractual.

## 5. La pregunta del número principal — respuesta directa

**Con WhatsApp Web (`WHATSAPP_PROVIDER=web`):** si usas tu número personal, el riesgo es
perder el acceso a WhatsApp en ese número si Meta detecta la automatización. Es tu WhatsApp
del día a día, con todos tus contactos y chats — no se puede "reintentar con cuidado", el
baneo típico llega sin aviso. **No lo hagas con tu número principal.**

**Con la Cloud API (`WHATSAPP_PROVIDER=cloud`):** confirmado con múltiples fuentes — **un
número registrado en la Cloud API deja de funcionar en la app normal de WhatsApp** (móvil o
Business), en cualquier teléfono. La migración es de un solo sentido: para revertirla hay
que des-registrar el número de la plataforma API y volver a registrarlo como app normal, un
proceso separado, no instantáneo, y que además exige que el número esté completamente libre
de cualquier cuenta activa antes de re-registrarse. **Sería un error grave hacer esto con tu
número personal:** dejarías de poder usar WhatsApp normal en él mientras dure la migración
inversa (si es que se hace).

### Cómo probar seguro, sin arriesgar ningún número tuyo

1. **Cloud API — número de prueba gratis de Meta.** Ya lo tienes: el número
   `+1 555-963-8117` en `.env.local` es exactamente ese número de prueba del portal de
   desarrolladores. Sirve para mandarte mensajes a ti mismo (hasta 5 destinatarios
   pre-verificados en la consola) sin gastar nada ni arriesgar ningún número real. Es el
   camino más rápido para probar la Cloud API hoy mismo.
2. **WhatsApp Web — SIM secundaria o eSIM barata.** Para el proveedor `web`, no hay
   equivalente a un "número de prueba" de Meta (es tu WhatsApp real, automatizado). La
   opción segura es una eSIM prepago barata (varios operadores las venden por unos pocos
   dólares/euros, algunas 100% digitales sin ir a una tienda) dedicada solo a este bot. Si
   se banea, se pierde una SIM de bajo costo, no tu número.

## 6. Próxima acción segura

1. Configurar `WHATSAPP_PROVIDER=web` o `cloud` explícitamente en `.env.local` (no hay
   default).
2. Si `web`: conseguir una eSIM/SIM secundaria antes de correr
   `scripts/careerai_whatsapp_login_handoff.mjs`.
3. Si `cloud`: probar hoy mismo con el número de prueba ya provisionado, sin coste ni riesgo.
4. Ejecutar la regresión: `node scripts/test_careerai_whatsapp_provider.mjs && node scripts/test_careerai_whatsapp_web_provider.mjs && node scripts/test_careerai_whatsapp_cloud_api.mjs`.
