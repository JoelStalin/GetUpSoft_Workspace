# 🚀 PROMPT MAESTRO v4 — GetUpNet / ENCF Framework (FastAPI + React) — **CODEx-READY** con AWS (ECS/EKS), IaC y Compliance

> **Rol del generador:** Arquitecto & Full-Stack Senior (redes, pagos, DevOps, ERP/Odoo).
> **Objetivo:** Entregar **repo completo** (backend + frontends + IaC + DevOps) para una plataforma **SaaS independiente y multi-tenant** que **genere y gestione e-CF** (DGII, RD) para **cualquier empresa**, con **microservicio opcional** de integración a **Odoo 18** por **JSON-RPC**.
> **Estándares y seguridad obligatorios:** **ISO/IEC 25010**, **PCI DSS 4.0**, **OWASP Top 10 2025**, **TLS 1.3**, **XMLDSig (RSA-SHA256)**, **AES-256-GCM**, **Argon2id**.
> **Frontends:** **Admin Portal** y **Client Portal** en **React + Vite + Tailwind + shadcn/ui + Zustand + React-Query**.
> **Nombre del proyecto:** **GetUpNet** (GetUpSoft).
> **Aclaración clave:** La plataforma **no depende** de Odoo; la integración es **opcional y desacoplada**.

---

## 0) Stack y principios globales

- **Backend:** Python 3.11+, **FastAPI**, Uvicorn/Gunicorn, Pydantic v2, SQLAlchemy 2 + Alembic.
- **DB:** PostgreSQL 14+ (Aurora Postgres en prod).
- **Cache/Colas:** Redis (ElastiCache) + Dramatiq o RQ; **RabbitMQ** opcional.
- **Auth:** JWT access/refresh, MFA TOTP, **RBAC** multi-tenant; HMAC inter-servicios; CSRF doble-cookie para paneles.
- **Cripto:** Argon2id (passwords), AES-256-GCM (secrets y `.env.production.enc`), XMLDSig con RSA-SHA256 (c14n, `Reference URI=""`, `<KeyInfo><X509Data>`).
- **Observabilidad:** Prometheus + Grafana + Loki; endpoints `/healthz`, `/readyz`, `/metrics`.
- **Logs:** JSON estructurado, `X-Trace-ID` / `X-Request-ID`, **auditoría WORM con hash encadenado SHA-512**.
- **Testing:** Pytest (>90% en módulos críticos), E2E con mocks DGII/Odoo, Cypress para UI, SAST/DAST (Semgrep/Bandit/OWASP DC/ZAP).
- **CI/CD:** GitHub Actions (o GitLab CI).
- **Infra & Despliegue (elige al generar):**
  - **Opción A — ECS Fargate**: ALB + Fargate + RDS + ElastiCache + Secrets Manager + Route53 + ACM.
  - **Opción B — EKS (Kubernetes)**: Terraform + EKS + Kustomize (base/overlays), NGINX Ingress, IRSA, External Secrets Operator.
- **IaC:** **Terraform** (estado S3 + DynamoDB lock, módulos por VPC, ECR, RDS/Aurora, ElastiCache, EKS/ECS, ALB, Route53/ACM, Secrets).
- **Frontends (SPA):** S3 + CloudFront (recomendado) o Nginx.

---

## 1) Arquitectura de microservicios (REST + HMAC, multi-tenant)

1) **auth_service**  
   - Registro/login, MFA TOTP, rotación JWT.  
   - **RBAC** granular con scopes `PLATFORM` y `TENANT`.  
   - Delegaciones DGII → RBAC: **Administrador, Solicitante, Firmante, Aprobador Comercial**.  
   - OIDC SSO (opcional).

2) **sign_service**  
   - Carga segura de `.p12` (password) desde Secrets Manager o almacenamiento cifrado.  
   - **XMLDSig** `enveloped-signature`, `rsa-sha256`, digest sha256, c14n, `<KeyInfo><X509Data>`.  
   - Validación `notBefore/notAfter`, cadena de certificados.

3) **dgii_client**  
   - **Autenticación DGII:** `semilla → firma → token (Bearer)`; cache TTL ~55 min en Redis.  
   - **Recepción e-CF** (≥250k) devuelve `trackId`; **RFCE** (<250k) devuelve `{codigo, estado, mensajes, encf, secuenciaUtilizada}`.  
   - Consultas por `trackId` (e-CF) y por `RNC + ENCF + CodigoSeguridad` (RFCE).  
   - Ambientes: `testecf | certecf | ecf`; timeouts y backoff con Tenacity.

4) **receiver_api** (sandbox emisor↔receptor)  
   - Endpoints DGII-like para **Recepción e-CF**, **ARECF**, **ACECF**, con validación XSD + firma.

5) **approval_flow**  
   - **ARECF:** 0=Recibido, 1=No recibido (motivo).  
   - **ACECF:** 1=Aceptado, 2=Rechazado (detalle motivo).

6) **billing_service**  
   - Emisión **e-CF** (todos), **RFCE** (<250k), **ANECF** (anulación de secuencias).  
   - **RI**: HTML→PDF (WeasyPrint/wkhtmltopdf), **QR con Código de Seguridad**.  
   - Persistencia de estados DGII y cálculo de tarifas por plan.

7) **plans_service**  
   - Planes: `FIJO | PORCENTAJE | MIXTO | ESCALONADO (+mínimo)` y overrides por tenant.

8) **admin_service (backoffice)**  
   - Tenants/compañías, planes, usuarios plataforma, descargas, métricas, auditoría.

9) **client_service (portal tenant)**  
   - Emisión, listado/descargas (XML/RI), estados DGII, certificados, perfil.

10) **odoo_integration** (opcional)  
   - JSON-RPC: `ensure_partner`, `ensure_product`, `create_invoice`, `register_payment`.

11) **logger_service / compliance**  
   - Auditoría WORM, export legal, retención por política.

---

## 2) Modelo de datos (PostgreSQL, SQLAlchemy)

- `tenants(id, name, rnc, env, dgii_base_ecf, dgii_base_fc, created_at, updated_at)`  
- `certificates(id, tenant_id, alias, p12_ref|kms_ref|secret_arn, not_before, not_after, issuer, subject, created_at)`  
- `users(id, tenant_id|null, email, phone, password_hash, mfa_secret, status, created_at)`  
- `roles(id, code, scope)` (`PLATFORM` | `TENANT`)  
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

**Índices:** `(tenant_id, encf) UNIQUE`, `(tenant_id, track_id)`, `created_at DESC`.

---

## 3) RBAC extendido (roles → permisos)

**Plataforma (scope=PLATFORM):**  
- `super_admin`, `platform_admin`, `platform_viewer`.

**Tenant (scope=TENANT):**  
- `tenant_admin`, `billing_manager`, `signer`, `approver`, `operator`, `viewer`.

**Permisos clave (muestra):**  
- Plataforma: `PLATFORM_TENANT_CREATE`, `PLATFORM_TENANT_PLAN_ASSIGN`, `PLATFORM_PLAN_CRUD`, `PLATFORM_AUDIT_VIEW`.  
- Tenant: `TENANT_CERT_UPLOAD`, `TENANT_SIGN_XML`, `TENANT_INVOICE_EMIT`, `TENANT_RFCE_SUBMIT`, `TENANT_APPROVAL_SEND`, `TENANT_ACK_SEND`, `TENANT_INVOICE_READ`, `TENANT_RI_DOWNLOAD`.

JWT incluye `scope`, `tenant_id`, `permissions`. Middlewares + **Route Guards** frontend.

---

## 4) Planes tarifarios (cálculo)

Tipos: `FIJO`, `PORCENTAJE`, `MIXTO`, `ESCALONADO`, con **mínimo**; `override_fixed/percent` por tenant.  
Persistir en `invoices`: `tarifa_plan`, `monto_tarifa`, `plan_id`.

---

## 5) Frontend — Admin & Client (React + Vite)

**Librerías:** React 18, React Router, Zustand, React-Query, RHF + Zod, shadcn/ui, lucide-react, Recharts (opcional), i18n (opcional).  
**Seguridad UI:** CSRF double-submit, route guards por permiso/rol; menús dinámicos.  
**Monorepo (`pnpm`):**
```
/frontend
  /apps/admin-portal
  /apps/client-portal
  /packages/ui         # componentes shadcn/ui adaptados
  /packages/api-client # fetcher + hooks React-Query
```
**Rutas Admin:** `/login`, `/mfa`, `/dashboard`, `/companies`, `/companies/:id{Overview|Comprobantes|Planes|Certificados|Usuarios}`, `/plans`, `/audit-logs`, `/users`.  
**Rutas Client:** `/login`, `/mfa`, `/dashboard`, `/invoices`, `/invoices/:id`, `/emit/ecf`, `/emit/rfce`, `/approvals`, `/certificates`, `/profile`.  
**Tablas:** filtros, paginado, export CSV/Excel; descargas **XML/RI**.

---

## 6) API Contracts (FastAPI)

- **Auth**  
  - `POST /auth/login` → { access, refresh }  
  - `POST /auth/mfa/verify`  
  - `POST /auth/refresh`  
  - `GET /me` → {user, roles, permissions, scope, tenant_id}
- **Admin (plataforma)**  
  - `GET/POST /admin/companies`  
  - `GET /admin/companies/:id` (+ `/invoices|/plans|/users|/certificates`)  
  - `POST /admin/companies/:id/assign-plan`  
  - `GET/POST/PUT/DELETE /admin/plans/:id?`  
  - `GET /admin/audit-logs`
- **Tenant (cliente)**  
  - `GET /tenant/invoices` / `GET /tenant/invoices/:id`  
  - `POST /tenant/emit/ecf` (genera+firma+envía → trackId)  
  - `POST /tenant/emit/rfce`  
  - `POST /tenant/approvals/arecf` / `POST /tenant/approvals/acecf`  
  - `POST /tenant/certificates` (.p12)  
  - `GET /tenant/settings`
- **Descargas:** `GET /download/xml/:invoice_id`, `GET /download/ri/:invoice_id`  
- **Convenciones:** JSON, errores con `trace_id`, validadores Pydantic, límites de tamaño/tipo.

---

## 7) Validaciones DGII (operativa)

- **Auth DGII:** semilla → firma → token.  
- **Recepción e-CF:** XML firmado → `trackId` → consulta por `trackId`.  
- **RFCE:** resumen (<250k) → `{encf, secuenciaUtilizada}` → consulta por `RNC+ENCF+CodigoSeguridad`.  
- **ARECF/ACECF:** reglas y motivos; validar RNC/ENCF/fecha/monto.  
- **ANECF:** anulación por rango; conteo y firma.  
- **RI:** HTML→PDF, paginado, **QR** con **Código de Seguridad**.

---

## 8) Seguridad & cumplimiento

- **TLS 1.3**, HSTS, CSP estricta, Referrer-Policy, X-Frame-Options, X-Content-Type-Options.  
- **CORS** por allowlist; cookies `Secure` + `SameSite=Strict`.  
- **Rate limiting** por IP/usuario (Redis) en endpoints sensibles.  
- **Secrets** en Vault/KMS/Secrets Manager; `.env.production` cifrado **AES-GCM**.  
- **Passwords** con **Argon2id** (parámetros seguros).  
- **Logs** firmados (WORM), retención y export legal; alertas de seguridad.  
- **PCI DSS 4.0:** segmentación, no log PAN, monitoreo/patching, gestión de vulnerabilidades.

---

## 9) Testing & aceptación

- **Unit:** firmado XML (digest/signature), XSD, planes, RBAC.  
- **E2E:** e-CF / RFCE / consultas / ARECF / ACECF / ANECF / RI / portales.  
- **UI (Cypress):** auth, guards, CRUD, listados, descargas.  
- **Seguridad:** Dependency-Check, Bandit/Semgrep, ZAP (baseline).  
- **Cobertura:** >90% en módulos críticos.

---

## 10) Variables de entorno & scripts

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

**Scripts (carpeta `/scripts`):**  
- `setup_env.py` (genera `.env.development` + guía .p12).  
- `encrypt_env.py` (produce `.env.production.enc` + `KEY_ID`).  
- `sample_curl.sh` (semilla → token → recepción → RFCE → consultas).

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
  13-planes-tarifas.md
  14-frontend-rbac.md
```

---

## 12) Estructura del repositorio

```
/app
  /auth
  /sign
  /dgii
  /receiver
  /billing
  /plans
  /admin
  /tenant
  /shared        # settings, storage, crypto, tracing, security, utils
  /models
  /tests
/deploy
  docker-compose.yml
  Dockerfile.api
  Dockerfile.nginx
  nginx.conf
  grafana/
  prom/alerts.yml
  deploy.sh               # build/push + update (ECS o EKS según selección)
/infra
  /terraform
    /modules (vpc, rds/aurora, elasticache, ecr, ecs, eks, alb, route53, acm, secrets)
    /envs/{staging,prod}
  /k8s
    /base       # Deployments, Services, Ingress, HPA, ServiceAccount, PodMonitor
    /overlays/{staging,prod} # Kustomize
/frontend
  /apps/admin-portal
  /apps/client-portal
  /packages/ui
  /packages/api-client
/scripts
  setup_env.py
  encrypt_env.py
  sample_curl.sh
docs/guide/...
.github/workflows/
  backend-ci.yml
  frontend-ci.yml
  dast-zap.yml
```

---

## 13) Despliegue AWS (elige A o B)

### A) **ECS Fargate (resumen operativo)**
- **VPC** (2 AZ), Subnets públicas (ALB/NAT) y privadas (Fargate/RDS/Redis).  
- **ECR** repos para api y nginx.  
- **ALB** (TLS ACM) → target group (api), health `/readyz`.  
- **RDS Postgres** (Multi-AZ, KMS, backups, rotación secrets).  
- **ElastiCache Redis** (subnets privadas, SG restringido).  
- **Secrets Manager** (DB_URL, JWT, HMAC, SMTP, etc.).  
- **Route53 + ACM** (dominios).  
- **GitHub Actions**: build → ECR → actualizar TaskDefinition → ECS Service.  
- **taskdef.json** con `healthCheck`, `awslogs`, `secrets`, `port 8080`.

### B) **EKS (Terraform + Kustomize)**
- **Terraform**: EKS (control plane), Node Groups, VPC, IRSA, ECR, Aurora, ElastiCache, Route53, ACM.  
- **External Secrets Operator** (sync con Secrets Manager a `Secret` de k8s).  
- **NGINX Ingress Controller**, TLS en Ingress, `HPA` por CPU/latencia.  
- **Kustomize**: `base` + `overlays/staging|prod` (réplicas, dominios, recursos).  
- **CI/CD**: push a ECR → `kubectl apply -k overlays/<env>` (con OIDC GitHub→AWS).

---

## 14) CI/CD (GitHub Actions)

- **Backend:** lint + tests + SAST + build Docker + push ECR + (ECS deploy **o** `kubectl apply -k`).  
- **Frontend:** lint + unit + build + **S3 sync + CloudFront invalidation** (o Nginx).  
- **DAST:** job programado con **OWASP ZAP** contra `staging`.

---

## 15) README (ejecución local)

```bash
# Infra local
docker compose up -d db redis
python scripts/setup_env.py
alembic upgrade head

# API
uvicorn app.main:app --host 0.0.0.0 --port 8080 --reload

# Frontends
pnpm -C frontend/apps/admin-portal dev
pnpm -C frontend/apps/client-portal dev

# Pruebas
pytest -q --cov=app
```

Health: `/healthz` • Ready: `/readyz` • Métricas: `/metrics`.

---

## 16) Dependencias (pin-friendly)

**Backend:**
```
fastapi uvicorn[standard] httpx pydantic>=2 sqlalchemy>=2 alembic
psycopg[binary] redis rq dramatiq tenacity
python-jose[cryptography] argon2-cffi cryptography xmlsec lxml
structlog python-dotenv qrcode[pil] weasyprint prometheus-client
opentelemetry-sdk opentelemetry-instrumentation-fastapi opentelemetry-exporter-otlp
```

**Frontend:**
```
react react-dom react-router-dom @tanstack/react-query zustand
react-hook-form zod @hookform/resolvers tailwindcss postcss autoprefixer
lucide-react shadcn/ui recharts
```

**Dev/QA:**
```
pytest pytest-cov httpx[http2] respx ruff bandit safety
owasp-dependency-check zap-cli semgrep
```

---

## 17) Criterios de aceptación (done-definition)

- **Repo compila y levanta** localmente (compose) y despliega en la opción elegida (**ECS o EKS**).  
- **Multi-tenant real** (aislamiento por `tenant_id` en datos, JWT con scope y permisos).  
- **DGII end-to-end**: emitir e-CF/RFCE, consultar estados, ARECF/ACECF, ANECF; RI con QR.  
- **Seguridad**: TLS 1.3, Argon2id, XMLDSig OK, secrets cifrados, CSP/HSTS, rate limits, auditoría WORM.  
- **Observabilidad**: `/metrics`, dashboards de Grafana, logs en Loki, trazas/IDs.  
- **CI/CD** funcionando: build, tests, SAST/DAST, deploy.  
- **Cobertura** >90% en módulos críticos (auth, sign, dgii, billing, plans).  
- **Documentación** en `docs/guide` actualizada y operable.

---

### 🧠 Instrucción final al generador
Produce un **repositorio completo** con la **estructura indicada**, **código funcional**, **migraciones Alembic**, **tests** y **documentación**. Incluye **Dockerfiles**, **docker-compose**, **Terraform** (ECS **y** EKS con módulos), **Kustomize** (base/overlays), **workflows de GitHub Actions**, y **plantillas de RI**. Implementa **multi-tenant, seguridad y cumplimiento**; soporta **DGII** (e-CF/RFCE/ARECF/ACECF/ANECF) y **conector Odoo** opcional por JSON-RPC.  
Elige en build **ECS Fargate o EKS** según variable de entorno/flag, pero **incluye ambos** en el repo. Entrega **CODEx-READY**.

