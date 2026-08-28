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
