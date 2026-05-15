
# 🚀 PROMPT MAESTRO — GetUpNet / ENCF Framework (Python/FastAPI) — **CODEx-READY**

> **Rol del generador**: Arquitecto y Desarrollador Full-Stack Senior experto en **redes, pagos, DevOps y ERP Odoo**.  
> **Objetivo**: Generar **código completo, modular y production-ready** para una plataforma **independiente y multi-tenant** que **genere y gestione e-CF** (DGII República Dominicana) para **cualquier empresa**, con **integración opcional** con Odoo 18.  
> **Normas y seguridad**: **ISO/IEC 25010**, **PCI DSS 4.0**, **OWASP 2025**, **TLS 1.3**, **XMLDSig (RSA-SHA256)**, **AES-256-GCM**, **Argon2id**.  
> **Nombre del proyecto**: **GetUpNet** (GetUpSoft).  
> **Aclaración**: Este proyecto **no depende** de Odoo, pero **incluye un microservicio opcional** de integración vía JSON-RPC.

---

## 0) Stack y lineamientos globales

- **Lenguaje & Framework**: Python 3.11+, **FastAPI**, Uvicorn/Gunicorn.
- **DB**: PostgreSQL 14+, **SQLAlchemy 2** (Declarative) + **Alembic** (migraciones).
- **Cache/Colas**: Redis (Dramatiq/RQ) para jobs asíncronos y caching selectivo.
- **Mensajería opcional**: RabbitMQ (para picos y desacople de flujos DGII).
- **Autenticación**: JWT (Access/Refresh), MFA TOTP, **RBAC** multi-tenant; HMAC interno entre servicios.
- **Cripto**: **Argon2id** para contraseñas; **AES-256-GCM** para secretos y `.env.production` cifrado; **RSA-SHA256** en **XMLDSig**.
- **Infra**: Docker + docker-compose, **Nginx** (TLS 1.3, HTTP/2), Certbot (Let's Encrypt).
- **Observabilidad**: Prometheus (métricas), Grafana (dashboards), Loki (logs), endpoints `/healthz` y `/readyz` (readiness/liveness).
- **Logs**: JSON estructurado, `X-Trace-ID`, `X-Request-ID`, y **auditoría con hash encadenado SHA-512**.
- **Testing**: Pytest (>90% cobertura), e2e con mocks DGII y Odoo, Cypress para UI si aplica.
- **CI/CD**: GitHub Actions (o GitLab CI) con build de imágenes, pruebas, SAST/DAST (OWASP Dependency-Check + ZAP).
- **Licencia**: MIT o equivalente; definir en `LICENSE`.
- **Idioma del código/comentarios**: Español técnico claro, con docstrings y referencias a estándares.

---

## 1) Arquitectura lógica — Microservicios

> Todos **REST** internos con **HMAC** y `X-Trace-ID`; multi-tenant (cada empresa = **tenant**).  
> A futuro se puede habilitar gRPC; por ahora, REST + firma HMAC es suficiente.

1. **auth_service**
   - Registro/login, **MFA TOTP**, **RBAC** (roles: `tenant_admin`, `signer`, `approver`, `operator`).
   - Delegaciones DGII mapeadas a RBAC interno: **Administrador**, **Solicitante**, **Firmante**, **Aprobador Comercial**.
   - Gestión de sesiones y rotación JWT; CSRF doble cookie para panel si se agrega UI.
2. **sign_service**
   - Carga segura de certificados **.p12** (contraseña).
   - **XMLDSig**: `enveloped-signature`, `Reference URI=""`, **RSA-SHA256**, **Digest SHA-256**, **c14n**. Incluye `<KeyInfo><X509Data>`.
   - Validación y verificación de firma; API `POST /api/{tenant}/sign/xml`.
3. **dgii_client**
   - **Autenticación**: semilla → firma → **token Bearer**.
   - **Recepción e-CF** completo (≥ 250k) → `trackId`.
   - **Recepción RFCE** (< 250k) → `{codigo, estado, mensajes, encf, secuenciaUtilizada}`.
   - **Consulta resultado** por `trackId` (e-CF) y **Consulta RFCE** por `RNC + ENCF + CódigoSeguridad` (6 primeros del hash de firma).
   - **Ambientes**: `testecf | certecf | ecf` con rutas base configurables.
   - Retries con backoff exponencial, timeouts, persistencia request/response.
4. **receiver_api** (pruebas de comunicación)
   - Endpoints estilo DGII: **Recepción e-CF**, **Aprobación Comercial (ACECF)**, **Acuse de Recibo (ARECF)**.
   - Valida XML con XSD, firma, codificación UTF-8, nombres de archivo, sin tags vacíos.
5. **approval_flow**
   - **ARECF**: `estado` (0 Recibido, 1 No Recibido) + `codigoMotivo` si aplica.
   - **ACECF**: `estado` (1 Aceptado, 2 Rechazado) + `detalleMotivo` si aplica.
   - Sellado de tiempo, notificaciones y reflejo de estado en DB.
6. **billing_service**
   - Emisión **e-CF** (todos tipos), **RFCE** (<250k), **ANECF** (anulación de secuencias e-NCF).
   - **RI** (Representación Impresa) PDF (HTML → PDF), soporta **modo diferido** y **contingencia (tipo B)**.
7. **plans_service / payment_service (opcional para HotSpot/Comercial)**
   - Catálogo de planes, vouchers, tokens; integración con Visa/MasterCard sandbox; PCI DSS 4.0.
8. **odoo_integration (opcional)**
   - JSON-RPC: `ensure_partner`, `ensure_product`, `create_invoice`, `register_payment`.
   - Campos extra `x_getupnet_*` y sincronización con `sale.subscription` (si aplica).
9. **logger_service / compliance**
   - Auditoría WORM (XML/RI), **hash encadenado**, export legal y retención configurable por tenant.

---

## 2) Modelo de datos (PostgreSQL, SQLAlchemy)

Tablas principales (campos esenciales):
- `tenants(id, name, rnc, env, dgii_base_ecf, dgii_base_fc, cert_ref, p12_kms_key, created_at, updated_at)`
- `delegations(id, tenant_id, role, subject_rnc, xml_signed, status, created_at)`
- `certificates(id, tenant_id, alias, p12_path|kms_ref, not_before, not_after, issuer, subject, created_at)`
- `users(id, tenant_id, email, phone, password_hash, mfa_secret, role, status, created_at)`
- `invoices(id, tenant_id, encf, tipo_ecf, xml_path, xml_hash, estado_dgii, track_id, codigo_seguridad, total, fecha_emision, created_at)`
- `rfce_submissions(id, tenant_id, encf, resumen_xml_path, estado, mensajes, secuencia_utilizada, created_at)`
- `approvals(id, tenant_id, encf, rnc_emisor, rnc_comprador, estado, motivo, ts)`
- `receipts(id, tenant_id, encf, rnc_emisor, rnc_comprador, estado, motivo_codigo, ts)`
- `anecf(id, tenant_id, tipo_ecf, desde, hasta, cantidad, xml_path, estado_envio, ts)`
- `ri_store(id, tenant_id, encf, pdf_path, mode, hash, ts)`
- `xml_store(id, tenant_id, encf, kind, path, sha256, ts)`
- `audit_logs(id, tenant_id, actor, action, resource, hash_prev, hash_curr, ts)`

Índices: `tenant_id + encf`, `tenant_id + track_id`, `encf UNIQUE per tenant`, `created_at DESC`.

---

## 3) Especificaciones DGII incorporadas (operativas)

### 3.1 Autenticación DGII
- `GET /api/autenticacion/semilla` → SEMILLA
- Firmar SEMILLA con **XMLDSig (RSA-SHA256)** usando el **.p12** del tenant.
- `POST /api/autenticacion/validarsemilla` → Bearer **token** con expiración.

### 3.2 Recepción e-CF completo (≥ RD$250,000)
- `POST /recepcion/api/facturaselectronicas` (adjuntar XML **firmado**).
- Respuesta incluye **trackId**; guardar request/response + `trackId`.

### 3.3 Recepción **RFCE** (< RD$250,000)
- `POST /recepcionfc/api/recepcion/ecf` con **resumen** (no el e-CF completo).
- Respuesta con `{codigo, estado, mensajes, encf, secuenciaUtilizada}`.
- Conservar **e-CF íntegro** internamente (xml_store).

### 3.4 Consultas
- e-CF completo: `GET /consultaresultado/api/consultas/estado?trackid=...`
- RFCE: `GET /consultarfce/api/Consultas/Consulta?RNC=&eNCF=&CodigoSeguridad=`  
  **CódigoSeguridad** = **6 primeros** del hash de la **firma**.

### 3.5 ARECF (Acuse de Recibo) & ACECF (Aprobación Comercial)
- ARECF: Estado `0: Recibido`, `1: No Recibido`; motivos (`1: Especificación`, `2: Firma`, `3: Duplicado`, `4: RNC no corresponde`).
- ACECF: Estado `1: Aceptado`, `2: Rechazado` + motivo detallado.

### 3.6 ANECF (Anulación de secuencias)
- Encabezado: versión, RNC emisor, cantidad, fecha/hora.
- Detalle: tipo e-CF, ranges `Desde/Hasta`, cantidad (suma validada); firma del archivo.

### 3.7 Representación Impresa (RI)
- Plantillas para consumo ≥/< 250k; variantes de ITBIS; paginación y totales.
- **Modos**: **diferido** y **contingencia (tipo B)**.
- Incluir **QR** con el **Código de Seguridad** (6 primeros del hash de la firma).

---

## 4) Firmado **XMLDSig** — Reglas y verificación (sign_service)

- **Tipo**: **Enveloped Signature** (firma embebida).
- **Referencia**: `<Reference URI="">` (documento completo).
- **DigestMethod**: SHA-256.
- **SignatureMethod**: RSA-SHA256.
- **Canonicalization**: `http://www.w3.org/TR/2001/REC-xml-c14n-20010315` (C14N clásica).
- **KeyInfo**: incluir `<X509Certificate>` (sin encabezados PEM).
- Validaciones unitarias:
  - Recalcular `DigestValue` y `SignatureValue` con fixtures.
  - Validar fechas de validez del certificado (`notBefore`, `notAfter`).
  - Firmeza de cadena y algoritmo.

---

## 5) Endpoints (OpenAPI) — por tenant

- **Auth & Tenants**
  - `POST /auth/login`
  - `POST /auth/mfa/verify`
  - `GET  /me`
  - `POST /tenants/{tenant_id}/certificates` → subir **.p12** (almacen seguro).
  - `POST /tenants/{tenant_id}/delegations` → registrar XML de delegación + estado.

- **Firmado**
  - `POST /api/{tenant}/sign/xml` → retorna XML firmado (RSA-SHA256, c14n, enveloped).

- **DGII**
  - `GET  /api/{tenant}/dgii/token` → semilla→firma→token (flujo completo).
  - `POST /api/{tenant}/dgii/ecf/send` → e-CF completo firmado → `trackId`.
  - `POST /api/{tenant}/dgii/rfce/send` → RFCE (resumen) → `{codigo, estado, mensajes, encf, secuenciaUtilizada}`.
  - `GET  /api/{tenant}/dgii/ecf/result/{trackId}` → estado e-CF.
  - `GET  /api/{tenant}/dgii/rfce/lookup` → RFCE por `rnc, encf, codigoSeguridad`.

- **Recepción (pruebas de comunicación)**
  - `POST /api/{tenant}/recv/ecf`
  - `POST /api/{tenant}/recv/ack`  (ARECF)
  - `POST /api/{tenant}/recv/approval` (ACECF)

- **ANECF & RI**
  - `POST /api/{tenant}/dgii/anecf/cancel-range`
  - `POST /api/{tenant}/ri/render` (HTML→PDF)
  - `POST /api/{tenant}/ri/upload`

- **Infra**
  - `GET /healthz` (liveness), `GET /readyz` (readiness), `GET /metrics` (Prometheus)

---

## 6) Validaciones de negocio clave

- **RNC**: formato 9 u 11 dígitos según corresponda; emisor/ receptor consistentes.
- **ENCF**: 13 caracteres: `Serie(E-Z sin P)` + `Tipo(2)` + `Secuencial(10)`.
- **RFCE**: para monto < 250k; si ≥ 250k, enviar e-CF completo por Recepción.
- **ARECF/ACECF**: estados válidos y reglas de motivos condicionales.
- **ANECF**: ranges consecutivos; `Desde ≤ Hasta > 0`.
- **RI**: totales, ITBIS, QR con código de seguridad (6 chars del hash).

---

## 7) Seguridad y cumplimiento

- **TLS 1.3** obligatorio (Nginx).
- **CORS** estricto por tenant; HSTS, CSP, X-Content-Type-Options, Referrer-Policy.
- **Rate limiting** por IP/usuario para subida de XML y RFCE.
- **Secrets** en Vault/KMS; **.env.production** cifrado AES-256-GCM.
- **Passwords** con Argon2id (parámetros de memoria/tiempo balanceados).
- **Auditoría**: logs firmados y **WORM** para XML/RI (retención por política).
- **PCI DSS 4.0**: segmentación de red, no almacenar PAN, monitoreo y alertas, gestión de vulnerabilidades.

---

## 8) Testing y Aceptación

- **Unit**:
  - Firmado XML (digest/signature).
  - Validaciones XSD/estructura.
  - Normalización de estados DGII.
- **E2E (mocks)**:
  - `send_ecf` → `trackId` → `result` (todos los estados).
  - `send_rfce` → `estado` + `secuenciaUtilizada`.
  - `ARECF` y `ACECF` round-trip.
  - `ANECF` por rango.
  - `RI` en **diferido** y **contingencia**.
- **OWASP**: Dependency-Check, ZAP baseline, SAST en CI.
- **Cobertura**: objetivo >90% en módulos críticos.

---

## 9) Variables de entorno y scripts

`.env.example`:
```
DGII_ENV=testecf
DGII_BASE_ECF=https://ecf.dgii.gov.do
DGII_BASE_FC=https://fc.dgii.gov.do
DGII_RNC=#########
P12_PATH=/secrets/cert.p12
P12_PASSWORD=********
DB_URL=postgresql+psycopg://user:pass@db:5432/getupnet
REDIS_URL=redis://redis:6379/0
JWT_SECRET=...
HMAC_SERVICE_SECRET=...
LOG_LEVEL=info
```

Scripts:
- `python scripts/setup_env.py` → guía para completar `.env.development` y colocar `.p12`.
- `python scripts/encrypt_env.py` → genera `.env.production.enc` (AES-GCM) + `KEY_ID`.
- `scripts/sample_curl.sh` → cURL de **semilla → validar → token → recepción → RFCE → consultas**.

---

## 10) Representación impresa (RI)

- `docs/guide/11-plantillas-ri/base.html` y `estilos.css`.
- HTML accesible y paginado (A4/Letter), totales e ITBIS claros.
- **QR**: URL de consulta RFCE + **Código de Seguridad** (6 chars del hash de firma).

---

## 11) Carpeta de guía (documentación operativa)

Estructura:
```
docs/
└─ guide/
   ├─ 00-overview.md
   ├─ 01-dgii-ambientes-y-servicios.md
   ├─ 02-firmado-xmldsig.md
   ├─ 03-modelos-ecf-rfce-arecf-acecf.md
   ├─ 04-representacion-impresa.md
   ├─ 05-delegaciones-roles.md
   ├─ 06-certificacion-checklist.md
   ├─ 07-endpoints-spec.md
   ├─ 08-estructura-proyecto.md
   ├─ 09-seguridad-cumplimiento.md
   ├─ 10-testing-aceptacion.md
   ├─ 11-plantillas-ri/
   │   ├─ base.html
   │   └─ estilos.css
   └─ 12-scripts-operativos.md
```

Cada archivo debe incluir: explicación, ejemplos cURL, pseudocódigo y enlaces internos.

---

## 12) Estructura del proyecto (scaffolding)

```
/app
  /auth
    routes.py, schemas.py, service.py, repository.py, deps.py
  /sign
    routes.py, service.py, utils_xmlsig.py, schemas.py
  /dgii
    routes.py, client.py, adapters.py, schemas.py
  /receiver
    routes.py, validators.py, schemas.py
  /billing
    routes.py, ecf_builder.py, rfce_builder.py, anecf_builder.py, arecf_builder.py, acecf_builder.py, validators.py
  /ri
    routes.py, render.py (weasyprint/wkhtmltopdf), templates/
  /shared
    settings.py, crypto.py, hmac.py, tracing.py, storage.py (S3/MinIO/local), security.py, exceptions.py, utils.py
  /models
    base.py, tenant.py, user.py, invoice.py, rfce.py, approval.py, receipt.py, anecf.py, storage.py, audit.py
  /tests
    /unit, /e2e, fixtures (xml/xsd), factories
/deploy
  docker-compose.yml, Dockerfile.api, Dockerfile.nginx, nginx.conf, grafana/, prom/alerts.yml
/scripts
  setup_env.py, encrypt_env.py, sample_curl.sh
docs/guide/...
```

---

## 13) RUNBOOK (operación)

1. **Levantamiento local**
   ```bash
   docker compose up -d db redis
   python scripts/setup_env.py
   alembic upgrade head
   docker compose up -d api nginx
   ```

2. **Generar token DGII y enviar e-CF**
   ```bash
   bash scripts/sample_curl.sh   # semilla -> validar -> token
   curl -H "Authorization: Bearer $TOKEN" -F "xml=@ecf_firmado.xml" \
     "$DGII_BASE_ECF/$DGII_ENV/recepcion/api/facturaselectronicas"
   ```

3. **Enviar RFCE (<250k)**
   ```bash
   curl -H "Authorization: Bearer $TOKEN" -F "xml=@rfce.xml" \
     "$DGII_BASE_FC/$DGII_ENV/recepcionfc/api/recepcion/ecf"
   ```

4. **Consultar**
   ```bash
   # Resultado e-CF:
   curl "$DGII_BASE_ECF/$DGII_ENV/consultaresultado/api/consultas/estado?trackid=$TRACKID"
   # RFCE:
   curl "$DGII_BASE_FC/$DGII_ENV/consultarfce/api/Consultas/Consulta?RNC=$RNC&eNCF=$ENCF&CodigoSeguridad=$CS6"
   ```

---

## 14) Criterios de aceptación (DGII + negocio)

- e-CF completo: **aceptado** en DGII; trackId y estados manejados.
- RFCE: **aceptado** (<250k) con recuperación por `RNC+ENCF+CS`.
- ARECF, ACECF: round-trip válido; reglas de motivos aplicadas.
- ANECF: anulación por **rango** con firmas y conteos consistentes.
- RI: render correcto en **diferido** y **contingencia (tipo B)**; QR válido.
- Auditoría y retención: XML/RI resguardados, integridad verificable.
- Seguridad: TLS 1.3, headers, rate-limits, secrets cifrados, no-PAN en logs.
- Tests: unitarios y e2e >90% cobertura en módulos críticos.

---

## 15) Entregables del generador (obligatorios)

- Código FastAPI modular (módulos listados).
- Esquemas SQLAlchemy + migraciones Alembic.
- **XMLDSig** implementado y probado (fixtures).
- Cliente DGII completo (autenticación, recepción, consultas).
- Endpoints de **recepción/aprobación/acuse** (sandbox interno).
- **ANECF**, **ARECF**, **ACECF**, **RFCE** generadores/validadoras.
- **RI** HTML→PDF (plantillas).
- **Guía** completa en `docs/guide/`.
- Docker + Nginx + TLS + CI/CD + Observabilidad.
- Scripts `.env` y cifrado `.env.production`.
- Suite de tests unit/e2e y pipelines con SAST/DAST.

> **Instrucción final al generador**: Produce un **repositorio completo** con la estructura indicada, **código funcional y probado**, documentación en `docs/guide`, pipelines de CI, y make targets/scripts para preparar entornos. El resultado debe estar **listo para despliegue en producción**, multi-tenant, seguro, auditable y conforme a DGII (**e-CF**, **RFCE**, **ARECF**, **ACECF**, **ANECF**) y buenas prácticas de la industria.
