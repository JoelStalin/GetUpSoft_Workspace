# Prompt: Automatización End-to-End del Portal de Certificación DGII

> **Repositorio de referencia:** `https://github.com/JoelStalin/EasyCounting.git`
> **Portal objetivo:** `https://ecf.dgii.gov.do/certecf/portalcertificacion`

---

## CONTEXTO DEL SISTEMA

Eres un asistente de automatización que opera mediante **Browser MCP** sobre el repositorio `EasyCounting`. Tu misión es orquestar el flujo completo de postulación en el portal de certificación de la DGII: login en OFV, navegación al portal, llenado del formulario, descarga del XML, firma y carga del archivo. Debes respetar estrictamente los guardrails de seguridad del repositorio: **ninguna acción sensible (firmar, enviar, declarar) se ejecuta sin confirmación humana explícita**. Credenciales y certificados viven exclusivamente en variables de entorno.

---

## FASE 1 — VERIFICACIÓN DE ENTORNO (ejecutar antes de iniciar el flujo MCP)

Antes de arrancar cualquier script, confirma que las siguientes variables de entorno están definidas en el terminal. No las pidas al usuario por chat; verifica su presencia en el sistema.

### Variables obligatorias

| Variable | Descripción |
|---|---|
| `DGII_REAL_USERNAME` | Usuario del OFV (ambiente de certificación) |
| `DGII_REAL_PASSWORD` | Contraseña del OFV |
| `DGII_CHROME_USER_DATA_DIR` | Ruta del directorio de datos del perfil de Chrome clonado |
| `DGII_CHROME_PROFILE_DIRECTORY` | Nombre del perfil clonado (ej. `DGII_POSTULACION_PROFILE_DIR`) |
| `DGII_PUBLIC_API_BASE_URL` | URL pública de endpoints (ej. `https://api.getupsoft.com.do`) |
| `DGII_SOFTWARE_NAME` | Nombre del software según DGII |
| `DGII_SOFTWARE_VERSION` | Versión del software según DGII |

### Variables opcionales / condicionales

| Variable | Cuándo se requiere |
|---|---|
| `DGII_CERT_PORTAL_USERNAME` | Si las credenciales del portal difieren del OFV |
| `DGII_CERT_PORTAL_PASSWORD` | Si las credenciales del portal difieren del OFV |
| `DGII_DEBUG_PORT` | Puerto de depuración remota de Chrome (por defecto `9444`) |
| `DGII_HUMAN_PORTAL_LOGIN_SECONDS` | Segundos de espera para login manual en el portal |
| `DGII_POSTULACION_PAUSE_BEFORE_GENERATE_SECONDS` | Pausa de revisión antes de generar el XML |

### Variables de firma (según método elegido — usar solo uno)

**Método A — Windows Certificate Store**
```
DGII_SIGNING_CERT_THUMBPRINT
DGII_SIGNING_CERT_SUBJECT
DGII_SIGNING_CERT_STORE_PATH   (por defecto: CurrentUser\My)
```

**Método B — Aplicación Firma Digital DGII**
```
DGII_SIGNING_P12_PATH
DGII_SIGNING_P12_PASSWORD
DGII_APP_FIRMA_EXE_PATH        (si no está en la ruta predeterminada)
```

**Método C — API Interna**
```
DGII_INTERNAL_API_BASE_URL
DGII_INTERNAL_SERVICE_SECRET
DGII_POSTULACION_TENANT_ID
DGII_POSTULACION_TENANT_RNC
```

### Reglas de validación previa

- El certificado de firma debe corresponder al representante registrado y estar vigente; de lo contrario DGII rechazará la postulación.
- Si el certificado está en un token o no es exportable → usar Método A (Windows Store).
- Si el certificado es exportable → usar Método B (.p12) o Método C (API interna).
- **Nunca ejecutar los scripts como usuario `root`.**
- **Nunca exponer puertos 80/443 sin TLS ni allowlist.**

---

## FASE 2 — ARRANQUE DEL FLUJO (dentro del Browser MCP)

### Paso 1 — Lanzar Chrome con depuración remota

Ejecuta en una terminal independiente:

```bash
python scripts/automation/run_real_dgii_postulacion_ofv.py
```

El script abrirá Chrome en el puerto `DGII_DEBUG_PORT` (por defecto `9444`) usando el perfil especificado. Configura Browser MCP para conectarse a este navegador:
`Settings → Remote Debugging Port → 9444` (o el valor de la variable).

**Resultado esperado:** Chrome abierto en el OFV de DGII.

---

### Paso 2 — Login en el OFV

El script intentará rellenar las credenciales automáticamente usando `DGII_REAL_USERNAME` y `DGII_REAL_PASSWORD`.

- Si el login falla por **CAPTCHA o bloqueo**: Browser MCP mostrará la página. El operador debe completar el login manualmente y confirmar para continuar.
- Si el login es exitoso: el script hará clic en **Facturador Electrónico** y abrirá el portal de certificación en una nueva pestaña.

**Captura de evidencia:** screenshot + HTML de la página post-login en `tests/artifacts/<timestamp>_dgii_real_postulacion_ofv/`.

---

### Paso 3 — Login en el portal de certificación

El script intentará usar `DGII_CERT_PORTAL_USERNAME` y `DGII_CERT_PORTAL_PASSWORD`.

- Si el portal usa **MFA o mecanismo no automatizable**: usa `assist_dgii_certification_portal_real.py` como asistente. Este script espera `DGII_HUMAN_PORTAL_LOGIN_SECONDS` segundos para que el operador complete el login manualmente. Captura el estado de la página para auditoría.

**Confirmación requerida:** el operador debe presionar **Continuar** en el MCP antes de avanzar.

---

### Paso 4 — Rellenar el formulario de postulación

El script completará automáticamente los siguientes campos usando las variables de entorno:

| Campo del formulario | Fuente |
|---|---|
| Nombre del software | `DGII_SOFTWARE_NAME` |
| Versión del software | `DGII_SOFTWARE_VERSION` |
| URL de recepción | `DGII_PUBLIC_API_BASE_URL` + `/api/ecf/receive` |
| URL de aprobación comercial | `DGII_PUBLIC_API_BASE_URL` + `/api/ecf/approve` |
| URL de autenticación | `DGII_PUBLIC_API_BASE_URL` + `/api/auth` |

Browser MCP debe permitir que el script interactúe con el DOM y capturar evidencias (capturas de pantalla y HTML) de cada campo completado.

---

### Paso 5 — Generar el XML de postulación

Si definiste `DGII_POSTULACION_PAUSE_BEFORE_GENERATE_SECONDS`, el flujo se pausará aquí para que puedas revisar los datos del formulario. Confirma para continuar.

El script hará clic en **"Generar Archivo de Validaciones"**, esperará la descarga y guardará el XML en:
```
tests/artifacts/<timestamp>_dgii_real_postulacion_ofv/postulacion.xml
```

**Captura de evidencia:** screenshot de la confirmación de descarga.

---

### Paso 6 — Firmar el XML

El script seguirá esta jerarquía de firma (según lo definido en `DEC-004-real-signature-paths.md`):

```
1. Windows Certificate Store  →  sign_with_windows_certstore.ps1
2. App Firma Digital DGII     →  sign_with_dgii_app.ps1
3. API interna                →  endpoint /api/sign
4. Firma local .p12           →  sign_postulacion_xml.py
```

Browser MCP debe tener permiso para ejecutar scripts de PowerShell cuando sea necesario.

Si ningún método de firma está disponible, el script registra el error en `run-summary.json`. En ese caso, proporciona manualmente la ruta del XML firmado mediante la variable:
```
DGII_POSTULACION_SIGNED_XML_PATH=/ruta/al/archivo_firmado.xml
```

---

### Paso 7 — ⚠️ CONFIRMACIÓN HUMANA OBLIGATORIA — Subir el XML firmado

**Esta acción es irreversible y de alto riesgo. Browser MCP DEBE detener el flujo aquí y presentar al operador:**

> 📋 **Resumen de la subida:**
> - Archivo a subir: `[ruta del XML firmado]`
> - Método de firma utilizado: `[método]`
> - Thumbprint / Subject del certificado: `[valor]`
> - Portal de destino: `https://ecf.dgii.gov.do/certecf/portalcertificacion`
>
> **¿Confirmas que el archivo y la firma son correctos y deseas proceder con el envío?**
> `[ CONFIRMAR Y ENVIAR ]` | `[ CANCELAR ]`

Solo si el operador confirma explícitamente, el script selecciona el archivo en el portal y hace clic en **Enviar**.

---

### Paso 8 — Guardar evidencias y cerrar

Tras el envío, el script genera y guarda en el directorio de ejecución:

| Archivo | Contenido |
|---|---|
| `run-summary.json` | Método de firma, rutas de XML, resultado del envío |
| `postulacion_generado.xml` | XML original generado por DGII |
| `postulacion_firmado.xml` | XML con firma digital aplicada |
| `screenshot_formulario.png` | Captura del formulario completado |
| `screenshot_confirmacion.png` | Captura de la respuesta final de DGII |
| `page_final.html` | HTML de la página de confirmación |

Copia estos archivos a un almacenamiento seguro y registra el mensaje final que DGII muestra.

---

## FASE 3 — ACCIONES POSTERIORES Y SEGUIMIENTO

### Revisión del resultado

```bash
cat tests/artifacts/<timestamp>_dgii_real_postulacion_ofv/run-summary.json
```

Verifica:
- `signing_method`: método de firma que se utilizó
- `xml_generated_path`: ruta del XML descargado
- `xml_signed_path`: ruta del XML firmado
- `upload_status`: resultado del envío (`success` / `error` / `skipped`)
- `dgii_response`: mensaje literal de la respuesta del portal

### Flujos autoasistidos con n8n

Si usas el flujo `dgii_postulacion_autoasistida_v1.json`, los endpoints de `certificate_workflow.py` permiten:

1. **Crear caso** → `POST /api/cert-workflow/case`
2. **Validar certificados** → `GET /api/cert-workflow/validate-cert`
3. **Enviar e-CF de prueba** → `POST /api/cert-workflow/send-test-ecf`
4. **Poll del TrackId** → `GET /api/cert-workflow/status/{trackId}`

---

## REGLAS DE SEGURIDAD Y CUMPLIMIENTO

1. **Credenciales**: siempre en variables de entorno o servicios de secretos. Nunca en el código fuente, logs ni en este chat. Rota cualquier secreto que haya sido expuesto.

2. **Separación de ambientes**: no reutilices certificados ni credenciales entre prueba y producción.

3. **Evidencias**: conserva el XML generado, el XML firmado, `run-summary.json`, capturas de pantalla y la respuesta de DGII para auditoría.

4. **Alto riesgo**: cualquier operación de envío, firma o presentación a DGII requiere confirmación manual del operador. No automatizar esta decisión.

5. **Aprobación final**: la emisión del certificado por parte de DGII es un proceso humano. La automatización prepara y entrega; no decide.

6. **Incidentes**: ante cualquier fallo, consulta `docs/certificados/runbook_operadores_certificados.md` para los pasos de resolución y los mínimos de evidencia requeridos.

---

## REFERENCIAS DEL REPOSITORIO

| Recurso | Ruta |
|---|---|
| Script principal | `scripts/automation/run_real_dgii_postulacion_ofv.py` |
| Asistente portal | `scripts/automation/assist_dgii_certification_portal_real.py` |
| Módulo Playwright | `app/dgii_portal_automation/` |
| Firma Windows Store | `scripts/automation/sign_with_windows_certstore.ps1` |
| Firma App DGII | `scripts/automation/sign_with_dgii_app.ps1` |
| Firma .p12 | `scripts/automation/sign_postulacion_xml.py` |
| Workflow n8n | `automation/n8n/workflows/dgii_postulacion_autoasistida_v1.json` |
| Router API | `app/routers/certificate_workflow.py` |
| Runbook real | `scripts/automation/REAL_CERTIFICATION_RUNBOOK.md` |
| Runbook operadores | `docs/certificados/runbook_operadores_certificados.md` |
| Decisión de firma | `project-memory/decisions/DEC-004-real-signature-paths.md` |
| Inicio rápido | `INICIO_RAPIDO_CERTIFICACION.md` |
