
# 🚀 PROMPT MAESTRO v2 — GetUpNet / ENCF Framework (Python/FastAPI + React) — **CODEx-READY**

> **Rol del generador:** Arquitecto y Desarrollador Full‑Stack Senior (redes, pagos, DevOps y ERP Odoo).  
> **Objetivo:** Generar **código completo, modular y production‑ready** para una plataforma **independiente y multi‑tenant** que **genere y gestione e‑CF** (DGII, RD) para **cualquier empresa**, con **integración opcional** con Odoo 18.  
> **Normas y seguridad:** **ISO/IEC 25010**, **PCI DSS 4.0**, **OWASP 2025**, **TLS 1.3**, **XMLDSig (RSA‑SHA256)**, **AES‑256‑GCM**, **Argon2id**.  
> **Frontend:** **Admin Portal** + **Client Portal** (React + Vite + Tailwind + shadcn/ui + Zustand/React‑Query).  
> **Nombre del proyecto:** **GetUpNet** (GetUpSoft).  
> **Aclaración:** Proyecto **no depende de Odoo**; **incluye microservicio opcional** de integración JSON‑RPC.

---

## 0) Stack y lineamientos globales

- **Backend:** Python 3.11+, **FastAPI**, Uvicorn/Gunicorn, Pydantic v2.
- **DB:** PostgreSQL 14+, **SQLAlchemy 2** (Declarative) + **Alembic**.
- **Cache/Colas:** Redis (Dramatiq/RQ) para jobs asíncronos y caching selectivo.
- **Mensajería opcional:** RabbitMQ.
- **Auth:** JWT (Access/Refresh), MFA TOTP, **RBAC** multi‑tenant; HMAC entre servicios; CSRF doble‑cookie para paneles.
- **Cripto:** Argon2id (passwords), AES‑256‑GCM (.env prod y secretos), RSA‑SHA256 (XMLDSig).
- **Infra:** Docker + docker‑compose, **Nginx** (TLS 1.3, HTTP/2), Certbot.
- **Observabilidad:** Prometheus + Grafana + Loki; endpoints `/healthz`, `/readyz`, `/metrics`.
- **Logs:** JSON, `X‑Trace‑ID`, `X‑Request‑ID`, auditoría con hash encadenado SHA‑512.
- **Testing:** Pytest (unit >90%), e2e con mocks DGII/Odoo, Cypress para UI.
- **CI/CD:** GitHub Actions (o GitLab CI): build, test, lint, SAST/DAST (OWASP Dep‑Check + ZAP).

---

## 1) Arquitectura lógica — Microservicios (REST con HMAC, multi‑tenant)

1. **auth_service**
   - Registro/login, MFA, **RBAC** con permisos granulares.
   - Delegaciones DGII mapeadas a RBAC: **Administrador**, **Solicitante**, **Firmante**, **Aprobador Comercial**.
   - Gestión de sesiones y rotación JWT; soporte SSO (OIDC) opcional.
2. **sign_service**
   - Carga segura de certificado **.p12** (contraseña).
   - **XMLDSig**: `enveloped-signature`, `Reference URI=""`, RSA‑SHA256, Digest SHA‑256, c14n, `<KeyInfo><X509Data>`.
   - Verificación de firmas y validez (`notBefore`, `notAfter`).
3. **dgii_client**
   - **Autenticación DGII:** semilla → firma → token Bearer.
   - **Recepción e‑CF** completo (≥ 250k) → `trackId`.
   - **Recepción RFCE** (< 250k) → `{codigo, estado, mensajes, encf, secuenciaUtilizada}`.
   - **Consultas** por `trackId` (e‑CF) y por `RNC + ENCF + CodigoSeguridad` (RFCE).
   - Ambientes: `testecf | certecf | ecf`, backoff y timeouts.
4. **receiver_api** (sandbox emisor↔receptor)
   - Endpoints DGII‑like: **Recepción e‑CF**, **ARECF**, **ACECF**; validación XSD y firma.
5. **approval_flow**
   - **ARECF:** 0=Recibido, 1=No recibido (con motivos).
   - **ACECF:** 1=Aceptado, 2=Rechazado (detalle motivo).
6. **billing_service**
   - Emisión **e‑CF** (todos), **RFCE** (<250k), **ANECF** (anulación de secuencias).
   - **RI** HTML→PDF (diferido/contingencia tipo B) + QR.
7. **plans_service**
   - Catálogo de **planes tarifarios** (FIJO, %, MIXTO, ESCALONADO, con MÍNIMO), asignación por compañía, cálculo automático por comprobante.
8. **admin_service (UI/Backoffice)**
   - Portal **Super‑Admin/Platform**: compañías, planes, comprobantes por compañía, descargas (XML/RI), métricas.
9. **client_service (UI Cliente/Tenant)**
   - Portal **Cliente/Tenant**: emisión, listado de comprobantes propios, RI/XML, estados DGII, perfil y certificados.
10. **odoo_integration (opcional)**
   - JSON‑RPC: `ensure_partner`, `ensure_product`, `create_invoice`, `register_payment`.
11. **logger_service / compliance**
   - Auditoría WORM, hash encadenado, export legal y retención por política.

---

## 2) Modelo de datos (PostgreSQL, SQLAlchemy) — entidades clave

- `tenants(id, name, rnc, env, dgii_base_ecf, dgii_base_fc, created_at, updated_at)`
- `certificates(id, tenant_id, alias, p12_ref|kms_ref, not_before, not_after, issuer, subject, created_at)`
- `users(id, tenant_id|null, email, phone, password_hash, mfa_secret, status, created_at)`
- `roles(id, code, scope)` — scope: `PLATFORM` o `TENANT`
- `permissions(id, code)`
- `user_roles(user_id, role_id, tenant_id|null)`
- `role_permissions(role_id, permission_id)`
- `delegations(id, tenant_id, role, subject_rnc, xml_signed, status, created_at)`
- `plans(id, name, type, fixed_value, percent_value, minimum, tiers_json, active, start_at, end_at, created_at)`
- `tenant_plans(id, tenant_id, plan_id, assigned_at, ended_at|null, override_percent|null, override_fixed|null)`
- `invoices(id, tenant_id, encf, tipo_ecf, xml_path, xml_hash, estado_dgii, track_id, codigo_seguridad, total, fecha_emision, tarifa_plan, monto_tarifa, plan_id, created_at)`
- `rfce_submissions(id, tenant_id, encf, resumen_xml_path, estado, mensajes, secuencia_utilizada, created_at)`
- `approvals(id, tenant_id, encf, rnc_emisor, rnc_comprador, estado, motivo, ts)`
- `receipts(id, tenant_id, encf, rnc_emisor, rnc_comprador, estado, motivo_codigo, ts)`
- `anecf(id, tenant_id, tipo_ecf, desde, hasta, cantidad, xml_path, estado_envio, ts)`
- `ri_store(id, tenant_id, encf, pdf_path, mode, hash, ts)`
- `xml_store(id, tenant_id, encf, kind, path, sha256, ts)`
- `audit_logs(id, tenant_id|null, actor, action, resource, hash_prev, hash_curr, ts)`

Índices: `tenant_id + encf`, `tenant_id + track_id`, `encf UNIQUE per tenant`, `created_at DESC`.

---

## 3) **RBAC extendido** — Roles y permisos (plataforma + tenant)

### Roles de Plataforma (scope=PLATFORM)
- `super_admin`: control total del sistema (usuarios plataforma, planes globales, tenants).
- `platform_admin`: gestiona compañías/tenants, planes, auditorías; sin acceso a secretos.
- `platform_viewer`: lectura (reportes, métricas).

### Roles de Tenant (scope=TENANT)
- `tenant_admin`: administrar usuarios del tenant, certificados, emisión, consultar comprobantes.
- `billing_manager`: emisión y conciliación; ver y exportar RI/XML; ver planes asignados.
- `signer`: firmar XML (usa certificado del tenant).
- `approver`: aprobar/rechazar (ACECF), emitir ARECF.
- `operator`: emitir RFCE/e‑CF, ver estados.
- `viewer`: solo lectura de comprobantes/RI.

### Permisos (ejemplos)
- `PLATFORM_TENANT_CREATE`, `PLATFORM_TENANT_PLAN_ASSIGN`, `PLATFORM_PLAN_CRUD`, `PLATFORM_AUDIT_VIEW`
- `TENANT_CERT_UPLOAD`, `TENANT_SIGN_XML`, `TENANT_INVOICE_EMIT`, `TENANT_RFCE_SUBMIT`
- `TENANT_APPROVAL_SEND`, `TENANT_ACK_SEND`, `TENANT_INVOICE_READ`, `TENANT_RI_DOWNLOAD`

**Matriz**: mapear roles→permisos en `role_permissions`. En JWT incluir `scope`, `tenant_id` y `permissions`. Middleware en API y **Route Guards** en frontend.

---

## 4) **Planes tarifarios** — Tipos y cálculo

Tipos soportados: `FIJO`, `PORCENTAJE`, `MIXTO`, `ESCALONADO`, con **mínimo** opcional.  
Cálculo (pseudocódigo):
```
tarifa = 0
if plan.tipo == FIJO: tarifa = plan.fixed_value
elif plan.tipo == PORCENTAJE: tarifa = M * (plan.percent_value/100)
elif plan.tipo == MIXTO: tarifa = plan.fixed_value + M*(plan.percent_value/100)
elif plan.tipo == ESCALONADO: tarifa = porcentaje_por_tramo(M)*M
if plan.minimum and tarifa < plan.minimum: tarifa = plan.minimum
if override_fixed: tarifa += override_fixed
if override_percent: tarifa += M * (override_percent/100)
```
Donde `M` es el **monto total** de la factura. Persistir `tarifa_plan`, `monto_tarifa`, `plan_id` en `invoices`.

---

## 5) **Frontend** — Admin Portal & Client Portal (React + Vite + Tailwind + shadcn/ui)

### Librerías y estándares
- React 18, React Router, **Zustand** (estado) + **React‑Query** (datos remotos).
- **shadcn/ui** (Cards, Tables, Dialogs, Dropdowns), **lucide-react** (iconos).
- Validación formularios: **react‑hook‑form** + **zod**.
- Gráficos (opcional): **recharts**.
- i18n opcional: **react‑i18next**.
- Seguridad UI: CSRF double submit, **route guards** por **role/permission**.

### Estructura UI
```
/frontend
  /apps
    /admin-portal
      src/
        main.tsx, App.tsx, routes.tsx
        /pages
          Dashboard.tsx
          Companies.tsx
          CompanyDetail.tsx   # pestañas: Comprobantes, Certificados, Planes
          Plans.tsx
          PlanEditor.tsx
          AuditLogs.tsx
          Users.tsx
        /components
          DataTable.tsx, CardKPI.tsx, FileDownloader.tsx, JsonView.tsx
        /store (zustand)
        /api (react-query hooks)
        /auth (guards, login, mfa)
        /ui (shadcn components wrappers)
    /client-portal
      src/
        main.tsx, App.tsx, routes.tsx
        /pages
          Dashboard.tsx
          Invoices.tsx
          InvoiceDetail.tsx
          EmitECF.tsx
          EmitRFCE.tsx
          Certificates.tsx
          Approvals.tsx   # ARECF/ACECF
          Profile.tsx
        /components, /store, /api, /auth, /ui
```

### Rutas (Admin Portal)
- `/login`, `/mfa`
- `/dashboard` (KPIs globales: compañías, comprobantes del mes, ingresos por planes)
- `/companies` (lista + crear)
- `/companies/:id` → **tabs**:
  - `Overview` (info RNC, ambiente, salud integración)
  - `Comprobantes` (tabla: fecha, ENCF, estado DGII, total, plan, comisión; descargas XML/RI)
  - `Planes` (asignar/cambiar plan, overrides)
  - `Certificados` (gestionar .p12)
  - `Usuarios` (miembros del tenant, roles)
- `/plans` (CRUD planes, editor de tramos escalonados)
- `/audit-logs`, `/users` (usuarios plataforma)

### Rutas (Client Portal)
- `/login`, `/mfa`
- `/dashboard` (KPIs del tenant)
- `/invoices` (tabla comprobantes; filtros y descargas)
- `/invoices/:id` (detalle: XML, RI, estados DGII, auditoría)
- `/emit/ecf` (subir/generar XML, firmar y enviar)
- `/emit/rfce` (generar RFCE y enviar)
- `/approvals` (ARECF/ACECF)
- `/certificates` (subir .p12, validar)
- `/profile`

### Guards y permisos en Frontend
- Hook `useAuth()` retorna `user, permissions, scope, tenantId`.
- Componente `RequirePermission({anyOf: []})` para proteger rutas o botones.
- Menús dinámicos según permisos; no renderizar acciones no permitidas.

### UX de tablas y descargas
- Tabla con paginación/orden/filter; **export CSV/Excel** (lado UI) y descarga de **XML/RI** (servidor).
- Visualización JSON de payloads DGII y respuestas (colapsable).

---

## 6) **API Contracts** (FastAPI) para Frontend

- **Auth**
  - `POST /auth/login` → {access, refresh}
  - `POST /auth/mfa/verify`
  - `POST /auth/refresh`
  - `GET /me` → {user, roles, permissions, scope, tenant_id}

- **Plataforma / Admin**
  - `GET /admin/companies` / `POST /admin/companies`
  - `GET /admin/companies/:id` (+ `/invoices`, `/plans`, `/users`, `/certificates`)
  - `POST /admin/companies/:id/assign-plan`
  - `GET /admin/plans` / `POST|PUT|DELETE /admin/plans/:id`
  - `GET /admin/audit-logs`

- **Tenant / Cliente**
  - `GET /tenant/invoices` / `GET /tenant/invoices/:id`
  - `POST /tenant/emit/ecf` (sube/genera, firma, envía; retorna trackId)
  - `POST /tenant/emit/rfce`
  - `POST /tenant/approvals/arecf` / `POST /tenant/approvals/acecf`
  - `POST /tenant/certificates` (subir .p12)
  - `GET /tenant/settings` (ambiente, endpoints DGII, plan vigente)

- **Descargas**
  - `GET /download/xml/:invoice_id`
  - `GET /download/ri/:invoice_id`

Respuestas: JSON; errores con `trace_id`; validadores Pydantic; límites de tamaño y tipo de archivos.

---

## 7) Validaciones DGII — Resumen operativo

- **Autenticación**: semilla→firma→token (Bearer).  
- **Recepción e‑CF** (≥ 250k): XML firmado; respuesta `trackId`; consulta por `trackId`.
- **RFCE** (< 250k): resumen; respuesta con `encf` y `secuenciaUtilizada`; consulta por RNC+ENCF+CódigoSeguridad (6 chars del hash).
- **ARECF/ACECF**: estados y motivos; validaciones de campos (RNC/ENCF/fecha/monto).
- **ANECF**: anulación por rango (Desde/Hasta), conteo y firma.
- **RI**: HTML→PDF, paginación, QR con **Código de Seguridad**.

---

## 8) Seguridad y cumplimiento

- **TLS 1.3**, HSTS, CSP, Referrer‑Policy, X‑Frame‑Options, X‑Content‑Type‑Options.
- **CORS** por allowlist de dominios; cookies `SameSite=Strict`, `Secure`.
- **Rate limiting** por IP/usuario en subida de XML/RI y endpoints sensibles.
- **Secrets** en Vault/KMS; `.env.production` cifrado AES‑GCM.
- **Passwords** con Argon2id (parámetros seguros).
- **Logs** firmados y WORM; retención por política (legal y auditoría).
- **PCI DSS 4.0**: segmentación, no log PAN, monitoreo/alertas, gestión vulnerabilidades.

---

## 9) Testing & Aceptación

- **Unit**: firmado XML (digest/signature), validaciones XSD, cálculo de planes.
- **E2E**: emisión e‑CF/RFCE, consultas, ARECF/ACECF, ANECF, RI (diferido/contingencia), flujos de portal Admin/Client con RBAC.
- **UI (Cypress)**: auth, route guards, CRUD de compañías/planes, listados y descargas.
- **OWASP**: Dependency‑Check, ZAP; cobertura >90% módulos críticos.

---

## 10) Variables de entorno y scripts

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
FRONTEND_ADMIN_URL=https://admin.local
FRONTEND_CLIENT_URL=https://app.local
```

Scripts:
- `python scripts/setup_env.py` (genera `.env.development` + guía .p12).
- `python scripts/encrypt_env.py` (produce `.env.production.enc` + `KEY_ID`).
- `scripts/sample_curl.sh` (semilla→validar→token→recepción→RFCE→consultas).

---

## 11) Documentación (docs/guide)

```
docs/guide/
  00-overview.md
  01-dgii-ambientes-y-servicios.md
  02-firmado-xmldsig.md
  03-modelos-ecf-rfce-arecf-acecf.md
  04-representacion-impresa.md
  05-delegaciones-roles.md
  06-certificacion-checklist.md
  07-endpoints-spec.md
  08-estructura-proyecto.md
  09-seguridad-cumplimiento.md
  10-testing-aceptacion.md
  11-plantillas-ri/base.html
  11-plantillas-ri/estilos.css
  12-scripts-operativos.md
  13-planes-tarifas.md            # NUEVO (modelos, fórmulas, ejemplos, UI)
  14-frontend-rbac.md             # NUEVO (roles/permisos, route guards, UX)
```

---

## 12) Estructura del proyecto

```
/app
  /auth        # login, MFA, RBAC
  /sign        # XMLDSig
  /dgii        # cliente DGII
  /receiver    # sandbox emisor↔receptor (ARECF/ACECF)
  /billing     # eCF/RFCE/ANECF + validadores + RI
  /plans       # cálculo tarifas y asignación
  /admin       # endpoints admin (companies, plans, audit, users)
  /tenant      # endpoints tenant (emitir, listar, descargar)
  /shared      # settings, storage, crypto, tracing, security, utils
  /models      # SQLAlchemy
  /tests       # unit + e2e
/deploy
  docker-compose.yml, Dockerfile.api, Dockerfile.nginx, nginx.conf, grafana/, prom/alerts.yml
/frontend
  /apps/admin-portal   # React + Vite + Tailwind + shadcn/ui
  /apps/client-portal  # React + Vite + Tailwind + shadcn/ui
/scripts
  setup_env.py, encrypt_env.py, sample_curl.sh
docs/guide/...
```

---

## 13) RUNBOOK

1. **Levantamiento local**
```bash
docker compose up -d db redis
python scripts/setup_env.py
alembic upgrade head
docker compose up -d api nginx
pnpm -C frontend/apps/admin-portal dev
pnpm -C frontend/apps/client-portal dev
```

2. **DGII (token y envíos)**
```bash
bash scripts/sample_curl.sh   # semilla -> validar -> token
curl -H "Authorization: Bearer $TOKEN" -F "xml=@ecf_firmado.xml" \
  "$DGII_BASE_ECF/$DGII_ENV/recepcion/api/facturaselectronicas"
curl -H "Authorization: Bearer $TOKEN" -F "xml=@rfce.xml" \
  "$DGII_BASE_FC/$DGII_ENV/recepcionfc/api/recepcion/ecf"
```

3. **Consultas**
```bash
curl "$DGII_BASE_ECF/$DGII_ENV/consultaresultado/api/consultas/estado?trackid=$TRACKID"
curl "$DGII_BASE_FC/$DGII_ENV/consultarfce/api/Consultas/Consulta?RNC=$RNC&eNCF=$ENCF&CodigoSeguridad=$CS6"
```

---

## 14) Criterios de aceptación

- **Portal Admin**: CRUD compañías, asignar planes, ver comprobantes por compañía (filtros, descargas), métricas.
- **Portal Cliente**: emitir e‑CF/RFCE, ARECF/ACECF, ANECF; ver/descargar RI/XML; estados DGII.
- **RBAC**: route guards correctos; acciones ocultas a roles sin permiso.
- **Planes**: cálculo correcto (fijo, %, mixto, escalonado, mínimo) y persistencia en `invoices`.
- **DGII**: autenticación, recepción, consultas operativas; RI (diferido/contingencia) correcta.
- **Seguridad**: TLS 1.3, headers, rate‑limits, secretos cifrados, no‑PAN en logs.
- **Pruebas**: unit/e2e UI y backend; cobertura >90% en módulos críticos.

---

## 15) Entregables del generador (obligatorios)

- Backend FastAPI modular (módulos listados) + OpenAPI.
- Esquemas SQLAlchemy + Alembic.
- **XMLDSig** implementado y probado (fixtures).
- Cliente DGII completo (auth, recepción eCF/RFCE, consultas).
- **Admin Service** (endpoints plataforma) y **Tenant Service** (endpoints cliente).
- **Plans Service** (cálculo y asignación).
- **Frontends**: Admin Portal & Client Portal (React + Vite + Tailwind + shadcn/ui), con RBAC/guards.
- **RI** HTML→PDF (plantillas) + QR.
- **Documentación** en `docs/guide/` (incluyendo 13 y 14 nuevas).
- **Docker + Nginx + TLS + CI/CD + Observabilidad**.
- **Scripts** `.env` y cifrado `.env.production`.
- **Suite de tests** unit/e2e (backend y UI) + pipelines SAST/DAST.

> **Instrucción final al generador:** Produce un **repositorio completo** con la estructura indicada, **código funcional** y **documentación**. Entregar listos para producción, multi‑tenant, seguros, auditables y conformes a DGII (e‑CF, RFCE, ARECF, ACECF, ANECF) y mejores prácticas.
