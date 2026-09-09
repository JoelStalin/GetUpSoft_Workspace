# Portal `careerai.getupsoft.com` — diseño (NO construir hasta decidir el punto 4)

Fecha: 2026-08-28. Diseño únicamente — no hay código de portal implementado todavía, tal como
se pidió.

## 1. Inventario real (verificado, no asumido)

- **Frontend existente:** `apps/site/getupsoft-site` — proyecto real con `dist/`, `src/`,
  `tests/`, ya en el repo. Es el sitio de GetUpSoft, no un portal de CareerAI — se podría
  añadir una sección/subapp nueva ahí, o crear un proyecto separado.
- **DNS:** `getupsoft.com` ya tiene zona configurada en Cloudflare (`ZONED_ID_GETUPSOFT_COM` en
  `.env`, con token de API asociado). Crear el subdominio `careerai.getupsoft.com` es viable
  sin trabajo de DNS nuevo — un registro más en una zona que ya existe.
- **Despliegue:** no verifiqué en este pase un pipeline de deploy activo específico para
  `apps/site` (hay scripts de deploy dispersos en el repo para otros proyectos —
  `orca-client-gateway-deploy.tar.gz`, `deploy/` en `apps/orca`). Antes de construir, habría
  que confirmar cuál mecanismo de deploy real se usa para `getupsoft.com` hoy.

## 2. Diseño del portal

Pantalla única de conexiones + cola de aprobación:

```
┌─────────────────────────────────────────────┐
│  CareerAI — Conexiones                       │
├─────────────────────────────────────────────┤
│  Google Drive        ● Conectado    [Reconectar] │
│  LinkedIn             ○ No conectado [Conectar]   │
│  Indeed                ⚠ Sesión caducada [Reconectar] │
│  WhatsApp (Cloud API)  ● Conectado    [Ver estado]│
│  WhatsApp (Web)         ○ No conectado [Conectar] │
├─────────────────────────────────────────────┤
│  Candidaturas pendientes de aprobar (12)     │
│  ┌───────────────────────────────────────┐  │
│  │ ☑ AS400 Dev — Empresa X — LinkedIn     │  │
│  │ ☑ RPGLE — Empresa Y — Correo (OCR 92%) │  │
│  │ ☐ ...                                  │  │
│  └───────────────────────────────────────┘  │
│              [Aprobar seleccionadas]          │
└─────────────────────────────────────────────┘
```

Reemplaza el flujo actual de aprobación por WhatsApp (o lo complementa — WhatsApp sigue
siendo útil para notificar "tienes candidaturas esperando", el portal es donde se revisan y
aprueban de verdad).

## 3. Realidad de cada conector (honesto, sin vender nada)

| Plataforma | Tipo real | Detalle |
|---|---|---|
| **Google Drive** | OAuth estándar, viable | Scopes de Drive son "sensibles" — Google exige verificación de la app para producción con usuarios externos. En modo test: límite de ~100 usuarios de prueba, pantalla de consentimiento con aviso "app no verificada". Verificación de Google puede tardar semanas y pide evidencia de uso legítimo de los scopes. |
| **LinkedIn** | **NO es OAuth** | La API oficial de LinkedIn no permite postularse a ofertas ni leer el feed de empleos para terceros. Todo lo que hace este agente en LinkedIn es vía navegador con la sesión real del usuario. El "conector" en el portal es: botón que dispara un flujo de login en navegador (headed, visible) y guarda la sesión — no un OAuth. No presentarlo como conexión OAuth al usuario final. |
| **Indeed** | Igual que LinkedIn | Sesión de navegador, no OAuth. Mismo patrón, mismo aviso. |
| **WhatsApp Cloud API** | OAuth/token oficial, viable | Ya implementado (`whatsapp-cloud-api.mjs`). El portal solo necesita mostrar estado (token válido/expirado, número de prueba vs. producción). |
| **WhatsApp Web** | No es OAuth | Sesión de navegador vía QR, igual que LinkedIn/Indeed. Mismo patrón de "conectar" = disparar login visible. |
| **Email/SMTP** | Depende | Si se usa Gmail API: OAuth viable (mismo caveat de scopes sensibles que Drive). Si se usa SMTP directo con contraseña de aplicación: no es OAuth, es una credencial que el usuario pega una vez — riesgo de manejo de secreto, no de sesión de navegador. |

## 4. Arquitectura de sesiones — LA DECISIÓN QUE FALTA

Hoy los perfiles de navegador (LinkedIn, Indeed, WhatsApp Web) viven como carpetas en la
máquina del usuario (`apps/orca/chrome_profile/*`). Un portal hospedado en un servidor cambia
esto. Dos opciones:

**Opción A — Agente local + portal remoto.** El portal (en `careerai.getupsoft.com`) es solo
la interfaz: cuando el usuario pulsa "Conectar LinkedIn", el portal le indica que corra (o ya
tiene corriendo) un agente local en su propia máquina, que es quien abre el navegador y
guarda la sesión localmente — igual que hoy. El portal solo ve "conectado sí/no" vía un canal
seguro con el agente local (websocket/polling autenticado).
- Seguridad: las sesiones autenticadas nunca salen de la máquina del usuario. El servidor
  remoto nunca las toca.
- Costo: requiere que el agente local esté corriendo para que el pipeline avance; no es "todo
  en la nube" — el usuario sigue necesitando su propia máquina prendida.

**Opción B — Todo en servidor.** El servidor mismo ejecuta los navegadores (Playwright en el
servidor) y guarda los perfiles ahí.
- Seguridad: las sesiones autenticadas de LinkedIn/Indeed/WhatsApp del usuario quedan
  almacenadas en un servidor de terceros (aunque sea propio) — compromiso de ese servidor =
  compromiso de todas las cuentas conectadas de todos los usuarios. Superficie de ataque
  mucho mayor que la Opción A.
- Beneficio: funciona sin que el usuario tenga nada corriendo localmente; más parecido a un
  SaaS real.

**Recomendación (a decidir por el propietario, no implementada):** para el caso de uso actual
(un solo usuario, Joel, no un SaaS multi-cliente todavía), la Opción A es más segura y no
añade complejidad de infraestructura de guarda de secretos ajenos. La Opción B solo se
justifica si el objetivo real es ofrecer esto como servicio a terceros — y en ese caso el
diseño de seguridad tiene que ser mucho más riguroso desde el día uno (ver sección 5).

## 5. Seguridad

- **Cifrado de tokens en reposo:** cualquier token OAuth (Google Drive, WhatsApp Cloud API)
  que el portal guarde debe cifrarse en reposo (p. ej. libsodium/AES-GCM con clave fuera del
  repo, en un vault o variable de entorno del servidor — nunca en texto plano en disco ni en
  base de datos sin cifrar).
- **Nada de credenciales en el repo.** Ya es la práctica actual (`.env.local`, nunca
  commiteado) — se mantiene igual para el portal.
- **Si alguien accede al portal (cuenta comprometida del usuario):** con la Opción A, el
  atacante ve estado de conexión pero no puede operar las sesiones de navegador (viven en la
  máquina del usuario, no accesibles remotamente sin acceso a esa máquina). Con la Opción B,
  un acceso comprometido al portal (o al servidor que lo hospeda) expondría las sesiones
  reales de LinkedIn/Indeed/WhatsApp — impacto mucho mayor. Esto refuerza la recomendación de
  la Opción A mientras el proyecto siga siendo de un solo usuario.
- **Google Drive en modo test:** mientras la app no esté verificada por Google, cualquier
  cuenta de Google que se conecte tiene que estar en la lista de "test users" del proyecto en
  Google Cloud Console — no es un portal público hasta pasar verificación.

## 6. Resumen para decidir

1. Frontend: reutilizar `apps/site/getupsoft-site` o proyecto nuevo — a decidir.
2. DNS: sin trabajo extra, la zona ya existe.
3. LinkedIn/Indeed/WhatsApp Web: nunca se presentan como "OAuth" en la UI — son "conectar via
   login de navegador".
4. **Decisión pendiente y bloqueante: Opción A (agente local) vs. Opción B (todo servidor).**
   Recomendación: A, mientras el uso sea de un solo usuario.
5. Seguridad ya delineada arriba, aplica en ambas opciones con distinto nivel de riesgo.

No se empieza a construir nada de esto hasta que el propietario elija el punto 4.

## 7. Inventario de cuentas/accesos (2026-08-28, verificado, sin cambios en consolas)

Cuenta de referencia pedida: `joelstalin2105@gmail.com`.

| Sistema | Estado verificado | Detalle |
|---|---|---|
| **Chrome perfil Default** | ✅ Coincide | El perfil `Default` de `C:\Users\yoeli` tiene sesión de Google iniciada con `joelstalin2105@gmail.com` como cuenta primaria (confirmado leyendo `Preferences` del perfil). Hay una segunda cuenta secundaria (`ing.joelstalinmartinez@gmail.com`) en el mismo navegador — no es un problema, solo a tener en cuenta si algún flujo pregunta "¿con qué cuenta?". |
| **Sesión LinkedIn en ese perfil** | ⚠️ No verificado todavía | El perfil Default estuvo bloqueado por Chrome abierto durante toda esta verificación (se reabrió varias veces). No se pudo confirmar login real de LinkedIn en este pase — pendiente de reintentar con Chrome cerrado. |
| **Google Cloud (gcloud)** | 🔴 No coincide | `gcloud auth list` / `gcloud config list` muestran la cuenta activa **`ceo@galantesjewelry.com`**, proyecto `deft-haven-493016-m4` — no es `joelstalin2105@gmail.com`, y no hay proyecto dedicado a CareerAI. Para el OAuth de Google Drive de CareerAI hace falta: `gcloud config set account joelstalin2105@gmail.com` (o `gcloud auth login` con esa cuenta) y decidir si se reutiliza `deft-haven-493016-m4` o se crea un proyecto nuevo. |
| **Cloudflare (wrangler)** | ⚠️ No concluyente | `npx wrangler whoami` no devolvió respuesta en el tiempo de esta verificación (puede requerir login interactivo la primera vez, o estar descargando el paquete). El `ZONED_ID_GETUPSOFT_COM` ya está en `.env` con un `CLOUDFLARE_API_TOKEN` asociado — el acceso por API parece existir independientemente de si `wrangler` CLI está autenticado localmente. Pendiente confirmar con `wrangler login` si hace falta crear `careerai.getupsoft.com` con la CLI. |
| **Meta / WhatsApp Cloud API** | ✅ Nombre coincide, cuenta Google no verificable | El WABA en `.env.local` pertenece a la cuenta de negocio **"Joel Stalin Martínez"** (confirmado con `debug_whatsapp_token.mjs`). No hay forma de confirmar desde aquí si esa cuenta de Meta Business está vinculada específicamente a `joelstalin2105@gmail.com` (Meta no expone esa relación vía la Graph API) — para confirmarlo hay que entrar a Meta Business Suite con esa cuenta y verlo directamente. El error 131037 (Display Name sin aprobar) es independiente de qué cuenta Google esté detrás — es de la app de Meta, no se resuelve cambiando de cuenta Google.

**Lo que falta para dejar todo bajo la misma identidad:**
1. `gcloud config set account joelstalin2105@gmail.com` — pendiente, requiere que el propietario lo autorice (login interactivo de Google).
2. Confirmar sesión de LinkedIn en el perfil Default — pendiente de que Chrome se mantenga cerrado el tiempo suficiente para verificar.
3. `wrangler login` si se decide crear el subdominio por CLI en vez de API directa.
4. Confirmar en Meta Business Suite que el WABA está bajo `joelstalin2105@gmail.com` (no verificable por API).

## 8. Puntos de intervención humana en el flujo — auditoría (mínima interacción posible)

Orca ya existe: es el motor de workflow visual de este mismo repo
(`apps/orca/data/workflow_blueprints.json`, workflow `careerai-indeed-agent`, servido con
`npm run orca:start`). No hace falta inventar otro motor — cada pieza nueva ya se modela como
nodo ahí (ver `data/careerai/node-inventory.json`).

| # | Punto de intervención | Motivo | ¿Eliminable? |
|---|---|---|---|
| 1 | Escanear el QR / login inicial (LinkedIn, Indeed, WhatsApp Web) | Sesión de navegador, no hay API oficial para esto | **No, inherente.** Una sola vez por plataforma; la sesión persiste después. |
| 2 | Aprobación antes de enviar cada candidatura | Pedido explícito del propietario — nunca se envía nada sin aprobación | **No, inherente y deseado.** Es una decisión de producto, no una limitación técnica. |
| 3 | Cerrar Chrome para liberar el perfil Default | El perfil Default del usuario solo admite una instancia de Chrome a la vez | **Sí, eliminable.** Cambiando a un perfil de automatización dedicado (como ya se hace con WhatsApp Web/LinkedIn-Indeed hoy) se evita depender de que el usuario cierre su navegador — el costo es no reutilizar directamente las cookies del navegador diario. Es un trade-off, no una limitación dura. |
| 4 | CAPTCHA / verificación anti-bot en un portal | Política del proyecto: nunca se intenta resolver automáticamente (ver `docs/backlog.md`) | **No, inherente por diseño de seguridad**, aunque la *frecuencia* con la que aparece sí se puede reducir (throttling, evitar patrones que lo disparen). |
| 5 | Aprobar Display Name en Meta para plantillas de Cloud API | Requisito administrativo de Meta, una sola vez por número | **No, inherente**, pero es un paso único, no recurrente. |
| 6 | Verificación de la app de Google (scopes sensibles de Drive/Gmail) | Requisito de Google para producción con usuarios externos | **No, inherente** mientras el proyecto use esos scopes; en modo test no aplica (límite de usuarios de prueba). |
| 7 | Confirmar identidad de cuenta (gcloud/Meta/Chrome) | Verificado en la sección 7 — hoy hay cuentas mezcladas (gcloud en `ceo@galantesjewelry.com`) | **Sí, eliminable** una vez se alinee todo a `joelstalin2105@gmail.com` (tarea de configuración única, no un punto recurrente del pipeline). |

**Objetivo real de "mínima interacción":** de los 7 puntos, **2 son inherentes y deseados por diseño** (aprobación de candidaturas, nunca resolver CAPTCHA solo), **2 son inherentes pero de una sola vez** (login inicial, aprobaciones administrativas de Meta/Google), y **2 son eliminables con trabajo de ingeniería** (perfil dedicado en vez de Default, alineación de cuentas). Ningún nodo del flujo debería pedir intervención humana repetida más allá de estos.
