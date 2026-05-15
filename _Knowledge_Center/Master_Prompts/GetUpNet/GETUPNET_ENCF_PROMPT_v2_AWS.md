# 🚀 PROMPT MAESTRO v3 — GetUpNet / ENCF Framework (Python/FastAPI + React) — Arquitectura Detallada y Plan de Despliegue en AWS EKS

> **Rol del generador:** Arquitecto y Desarrollador Full-Stack Senior (especialista en redes, pagos, DevOps y ERP).
> **Objetivo:** Generar el **código fuente completo, modular y listo para producción** para la plataforma **GetUpNet**. Esta es una solución de software como servicio (SaaS) **independiente y multi-tenant** diseñada para la **generación, gestión y cumplimiento normativo de Comprobantes Fiscales Electrónicos (e-CF)** según las especificaciones de la DGII de la República Dominicana. El sistema está diseñado para servir a **cualquier empresa**, independientemente de su ERP, e incluye un **microservicio de integración opcional y desacoplado** para Odoo 18.
> **Normas y seguridad:** El diseño se adhiere estrictamente a **ISO/IEC 25010** (calidad de software), **PCI DSS 4.0** (seguridad de datos financieros), **OWASP Top 10 2025**, y exige el uso de **TLS 1.3**, **XMLDSig (RSA-SHA256)**, **AES-256-GCM** y **Argon2id**.
> **Frontend:** La solución incluye dos portales distintos: un **Admin Portal** para la gestión de la plataforma y un **Client Portal** para los tenants, ambos construidos con un stack moderno: React, Vite, Tailwind CSS, y el ecosistema de componentes de shadcn/ui.
> **Nombre del proyecto:** **GetUpNet** (por GetUpSoft).

---

### **0. Stack Tecnológico y Principios Globales**

* **Backend:** Python 3.11+, **FastAPI** con inyección de dependencias, Uvicorn/Gunicorn para el servicio.
* **Base de Datos:** PostgreSQL 14+, con **SQLAlchemy 2.0** (ORM declarativo) y **Alembic** para migraciones.
* **Cache y Colas:** **Amazon ElastiCache for Redis** para tareas asíncronas con Dramatiq y caching de sesiones/configuraciones.
* **Autenticación y Autorización:** JWT (Access/Refresh Tokens), MFA con TOTP, y un robusto sistema **RBAC** multi-tenant. La comunicación entre servicios internos se asegura con tokens HMAC.
* **Criptografía:** **Argon2id** para hashes de contraseñas, **AES-256-GCM** para cifrar secretos en reposo (ej. `.env.production`), y **RSA-SHA256** para las firmas digitales XMLDSig.
* **Infraestructura como Código (IaC):** **Terraform** para aprovisionar y gestionar toda la infraestructura en AWS de manera declarativa y auditable.
* **Orquestación:** **Amazon EKS (Kubernetes)** para el despliegue, escalado y gestión de la arquitectura de microservicios en contenedores.
* **Manifiestos de Kubernetes:** **Kustomize** para gestionar las configuraciones específicas de cada entorno (staging, production) sobre una base común.
* **Observabilidad:** Una pila nativa de Kubernetes con **Prometheus** (métricas), **Grafana** (dashboards) y **Loki** (logs). Cada servicio expondrá endpoints estándar: `/healthz`, `/readyz`, `/metrics`.
* **Logging:** Logs estructurados en formato JSON, propagación de `X-Trace-ID` y `X-Request-ID` entre servicios, y logs de auditoría inmutables con hash encadenado (SHA-512).
* **Testing:** Cobertura de pruebas unitarias superior al 90% con **Pytest**, pruebas de integración (E2E) con mocks de las APIs externas (DGII/Odoo), y pruebas de UI con **Cypress**.
* **CI/CD:** Pipelines automatizados con **GitHub Actions** para build, test, linting, y análisis de seguridad (SAST con Semgrep/Bandit, análisis de dependencias con OWASP Dependency-Check, y DAST con OWASP ZAP).

---

### **1. Arquitectura Lógica de Microservicios (REST, Multi-Tenant, HMAC-secured)**

1.  **auth\_service:** Gestión de identidades y acceso.
    * Registro/login, MFA, RBAC con permisos granulares.
    * Mapeo de las delegaciones DGII a roles RBAC internos: **Administrador**, **Solicitante**, **Firmante**, **Aprobador Comercial**.
    * Gestión de sesiones, rotación de JWTs.
2.  **sign\_service:** Microservicio de alta seguridad y rendimiento para operaciones criptográficas.
    * Carga segura de certificados **.p12** y sus contraseñas desde **AWS Secrets Manager**.
    * Implementación precisa de **XMLDSig** según la norma DGII: `enveloped-signature`, `Reference URI=""`, `SignatureMethod` (rsa-sha256), `DigestMethod` (sha256), Canonicalización (c14n), e inclusión de `<KeyInfo><X509Data><X509Certificate>`.
    * Utiliza la biblioteca `xmlsec` de Python para un rendimiento óptimo.
3.  **dgii\_client:** Cliente resiliente y con estado para la integración con la DGII.
    * **Flujo de Autenticación con Estado:**
        1.  **Obtener Semilla:** `GET /api/Autenticacion/Semilla`.
        2.  **Firmar Semilla:** Firma el valor de la semilla con el certificado del tenant.
        3.  **Obtener Token:** `POST /api/Autenticacion/ValidarSemilla` con la semilla firmada para obtener un token JWT de 1 hora.
        4.  **Cachear Token:** Almacena el token en Redis con un TTL de ~55 minutos para reutilizarlo en llamadas posteriores, evitando la reautenticación constante.
    * Implementa los endpoints de **Recepción de e-CF**, **Recepción de RFCE**, y las **Consultas de Estado** correspondientes, con reintentos (backoff exponencial) y timeouts configurables.
4.  **billing\_service:** Orquesta la lógica de negocio principal.
    * Genera el XML para todos los tipos de e-CF, validándolo contra los esquemas XSD oficiales de la DGII usando `lxml`.
    * Coordina el flujo completo: `generar_xml` → `sign_service` → `dgii_client` → `persistir_resultado`.
    * Encola una tarea asíncrona (Dramatiq) para generar la **Representación Impresa (RI)** en PDF, incluyendo el código QR requerido.
5.  **approval\_flow:** Gestiona el flujo de aprobación del receptor.
    * Construye y envía los documentos de **Acuse de Recibo (ARECF)** y **Aprobación Comercial (ACECF)**.
6.  **plans\_service:** Gestiona la lógica de monetización.
    * Catálogo de **planes tarifarios** (FIJO, PORCENTAJE, MIXTO, ESCALONADO, con MÍNIMO).
    * Calcula la comisión por cada comprobante exitoso y la registra para facturación.
7.  **admin\_service:** Backend para el portal de administración de la plataforma.
    * Endpoints para la gestión de tenants, planes, auditoría y métricas globales.
8.  **client\_service:** Backend para el portal del cliente (tenant).
    * Endpoints para la emisión, consulta y descarga de comprobantes propios.
9.  **odoo\_integration (Opcional):** Conector desacoplado vía JSON-RPC.
10. **logger\_service / compliance:** Servicio de auditoría centralizado y seguro.

---

### **2. Modelo de Datos (PostgreSQL, SQLAlchemy)**

Las entidades clave son las siguientes, con índices estratégicos en `(tenant_id, encf)`, `(tenant_id, track_id)` y `(encf)` para garantizar unicidad y rendimiento en las consultas por tenant.

* `tenants(id, name, rnc, env, dgii_base_ecf, dgii_base_fc, ...)`
* `certificates(id, tenant_id, alias, secret_manager_arn, not_before, not_after, issuer, subject, ...)`
* `users(id, tenant_id|null, email, phone, password_hash, mfa_secret, ...)`
* `roles(id, code, scope)` — `scope`: `PLATFORM` o `TENANT`
* `permissions(id, code)`
* `user_roles(user_id, role_id, tenant_id|null)`
* `role_permissions(role_id, permission_id)`
* `plans(id, name, type, fixed_value, percent_value, minimum, tiers_json, ...)`
* `tenant_plans(id, tenant_id, plan_id, assigned_at, ...)`
* `invoices(id, tenant_id, encf, tipo_ecf, xml_path, xml_hash, estado_dgii, track_id, codigo_seguridad, total, fecha_emision, tarifa_plan, monto_tarifa, plan_id, ...)`
* `approvals(id, tenant_id, encf, rnc_emisor, rnc_comprador, estado, ...)`
* `audit_logs(id, tenant_id|null, actor, action, resource, hash_prev, hash_curr, ts)`

---

### **3. RBAC Extendido: Matriz de Roles y Permisos**

El sistema de autorización es un pilar de la arquitectura multi-tenant.

#### **Roles de Plataforma (scope=PLATFORM)**
* `super_admin`: Control total del sistema.
* `platform_admin`: Gestiona tenants, planes y auditorías.
* `platform_viewer`: Acceso de solo lectura a reportes y métricas.

#### **Roles de Tenant (scope=TENANT)**
* `tenant_admin`: Administra usuarios, certificados y configuraciones del tenant.
* `billing_manager`: Emite comprobantes y gestiona la facturación.
* `signer`: Rol técnico para firmar documentos XML.
* `approver`: Gestiona el flujo de aprobación (ARECF/ACECF).
* `operator`: Emite comprobantes pero no gestiona usuarios ni certificados.
* `viewer`: Solo lectura de comprobantes y reportes del tenant.

#### **Matriz de Permisos (Ejemplo)**
| Permiso                       | `super_admin` | `platform_admin` | `tenant_admin` | `billing_manager` | `approver` | `operator` | `viewer` |
| :---------------------------- | :-----------: | :--------------: | :------------: | :---------------: | :--------: | :--------: | :------: |
| `PLATFORM_TENANT_CREATE`      |       ✅       |        ✅        |                |                   |            |            |          |
| `PLATFORM_TENANT_PLAN_ASSIGN` |       ✅       |        ✅        |                |                   |            |            |          |
| `PLATFORM_PLAN_CRUD`          |       ✅       |        ✅        |                |                   |            |            |          |
| `TENANT_USER_MANAGE`          |       ✅       |                  |       ✅       |                   |            |            |          |
| `TENANT_CERT_UPLOAD`          |       ✅       |                  |       ✅       |                   |            |            |          |
| `TENANT_INVOICE_EMIT`         |       ✅       |                  |       ✅       |         ✅        |            |     ✅     |          |
| `TENANT_APPROVAL_SEND`        |       ✅       |                  |       ✅       |                   |     ✅     |            |          |
| `TENANT_INVOICE_READ`         |       ✅       |        ✅        |       ✅       |         ✅        |     ✅     |     ✅     |    ✅    |
| `TENANT_RI_DOWNLOAD`          |       ✅       |        ✅        |       ✅       |         ✅        |     ✅     |     ✅     |    ✅    |

---

### **4. Planes Tarifarios: Lógica de Cálculo**

El `plans_service` implementará una función pura para calcular la tarifa de cada comprobante aceptado por la DGII.

* **Tipos Soportados:** `FIJO`, `PORCENTAJE`, `MIXTO`, `ESCALONADO`.
* **Modificadores:** `MÍNIMO` opcional por plan y `overrides` por asignación a tenant.
* **Lógica de Cálculo:**
    ```python
    def calculate_fee(plan, tenant_plan, invoice_total: Decimal) -> Decimal:
        # Lógica para FIJO, PORCENTAJE, MIXTO, ESCALONADO
        # ...
        fee = ...
        
        # Aplicar mínimo del plan
        if plan.minimum and fee < plan.minimum:
            fee = plan.minimum
            
        # Aplicar overrides específicos del tenant
        if tenant_plan.override_fixed:
            fee += tenant_plan.override_fixed
        if tenant_plan.override_percent:
            fee += invoice_total * (tenant_plan.override_percent / 100)
            
        return fee
    ```
* **Persistencia:** El resultado (`tarifa_plan`, `monto_tarifa`, `plan_id`) se almacena en la tabla `invoices` para auditoría y facturación.

---

### **5. Arquitectura Frontend: Portales Admin y Cliente**

Se utilizará un **monorepo (`pnpm`)** para maximizar la reutilización de código entre los dos portales.

* **Estructura del Monorepo:**
    * `/frontend/apps/admin-portal`: Código del portal de administración.
    * `/frontend/apps/client-portal`: Código del portal del cliente.
    * `/frontend/packages/ui`: Componentes base de **shadcn/ui** personalizados y compartidos. La filosofía de shadcn/ui de "poseer el código del componente" es ideal para un sistema de diseño consistente y a largo plazo.
    * `/frontend/packages/api-client`: Cliente de API y hooks de **React Query** compartidos.
* **Gestión de Estado:**
    * **Zustand:** Para el estado global del cliente (sesión de usuario, token, permisos, tema UI). Simple y de bajo boilerplate.
    * **React Query:** Para todo el estado del servidor. Gestiona fetching, caching, invalidación y sincronización de datos con el backend de forma automática y eficiente.
* **RBAC en la UI:**
    * **Route Guards:** Un componente de orden superior `<RequirePermission permission="...">` protegerá rutas completas.
    * **Renderizado Condicional:** Un hook `useAuth()` expondrá los permisos del usuario para renderizar o deshabilitar componentes (botones, menús) de forma dinámica, evitando mostrar acciones no permitidas.

---

### **6. Contrato de API Consolidado (Endpoints Clave)**

Esta tabla define el contrato entre el frontend y el backend.

| Endpoint                            | Método | Descripción                                  | Permiso Requerido              |
| :---------------------------------- | :----- | :------------------------------------------- | :----------------------------- |
| `/auth/login`                       | `POST` | Inicia sesión de usuario.                    | Público                        |
| `/auth/mfa/verify`                  | `POST` | Verifica el código TOTP para 2FA.            | Público (pre-MFA)              |
| `/me`                               | `GET`  | Obtiene el perfil del usuario autenticado.   | Autenticado                    |
| `/admin/companies`                  | `POST` | Crea un nuevo tenant en la plataforma.       | `PLATFORM_TENANT_CREATE`       |
| `/admin/companies`                  | `GET`  | Lista todos los tenants.                     | `PLATFORM_TENANT_READ`         |
| `/admin/companies/{id}/assign-plan` | `POST` | Asigna un plan tarifario a un tenant.        | `PLATFORM_TENANT_PLAN_ASSIGN`  |
| `/admin/plans`                      | `POST` | Crea un nuevo plan tarifario global.         | `PLATFORM_PLAN_CRUD`           |
| `/tenant/invoices`                  | `GET`  | Lista los comprobantes emitidos por el tenant. | `TENANT_INVOICE_READ`          |
| `/tenant/emit/ecf`                  | `POST` | Emite un nuevo e-CF (genera, firma, envía).  | `TENANT_INVOICE_EMIT`          |
| `/tenant/certificates`              | `POST` | Carga un nuevo certificado .p12 para el tenant.| `TENANT_CERT_UPLOAD`           |
| `/download/ri/{invoice_id}`         | `GET`  | Descarga la Representación Impresa (PDF).    | `TENANT_RI_DOWNLOAD`           |

---

### **7. Arquitectura Fundacional en AWS con Terraform y EKS**

La infraestructura se provisionará en AWS de forma segura, escalable y resiliente, gestionada 100% como código.

* **1. Estrategia de Infraestructura como Código (IaC): Terraform**
    * **Justificación:** Se elige Terraform sobre CloudFormation por su agilidad, ecosistema multi-proveedor y modularidad superior, ideal para una arquitectura de microservicios.
    * **Gestión del Estado Remoto:** El estado de Terraform se almacenará de forma segura en un **bucket S3** con cifrado y versionado, utilizando una tabla de **DynamoDB** para el bloqueo de estado y evitar conflictos.
* **2. Red y Seguridad: VPC preparada para PCI DSS**
    * **Diseño Multi-AZ:** Una VPC que abarca al menos dos Zonas de Disponibilidad para alta disponibilidad.
    * **Segmentación:**
        * **Subredes Públicas:** Para Application Load Balancers (ALB) y NAT Gateways.
        * **Subredes Privadas:** Para los contenedores de los microservicios y la base de datos, sin acceso directo desde internet.
* **3. Orquestación de Contenedores: Amazon EKS (Kubernetes)**
    * **Justificación:** Se elige EKS sobre ECS por su alineación con el estándar de la industria, su vasto ecosistema de herramientas (Prometheus, Helm, Istio) y su portabilidad, evitando el "vendor lock-in".
    * **Implementación:**
        * **Plano de control de EKS** gestionado por AWS.
        * **Nodos de trabajo** gestionados a través de **EKS Managed Node Groups**.
        * **Nginx Ingress Controller** para gestionar el acceso externo y la terminación TLS.
        * **IAM Roles for Service Accounts (IRSA)** para asignar permisos de AWS granulares a nivel de pod, adhiriéndose al principio de mínimo privilegio.
* **4. Servicios de Base de Datos y Estado**
    * **Base de Datos:** **Amazon Aurora (PostgreSQL)** por su rendimiento superior, autoescalado y alta disponibilidad.
    * **Caché/Colas:** **Amazon ElastiCache for Redis** como broker de mensajes y capa de caché.
    * **Gestión de Secretos:** **AWS Secrets Manager** por su capacidad de rotación automática de secretos y políticas de acceso granulares, esencial para el cumplimiento normativo.

---

### **8. Despliegue de Extremo a Extremo y Operaciones (RUNBOOK)**

Esta sección sirve como la guía maestra para el equipo de operaciones.

* **1. Pipelines de CI/CD con GitHub Actions**
    * **Backend Pipeline:** Ejecuta `linting` -> `pruebas unitarias` -> `análisis SAST` -> `construcción de imagen Docker` -> `push a Amazon ECR` -> `despliegue en EKS`.
    * **Frontend Pipeline:** Ejecuta `linting` -> `pruebas de componentes` -> `build de activos estáticos` -> `sincronización con S3` e `invalidación de caché en CloudFront`.
    * **Pipeline DAST:** Un workflow programado ejecuta **OWASP ZAP** contra el entorno de staging para análisis de seguridad dinámico.
* **2. Manifiestos de Kubernetes con Kustomize**
    * Se utiliza una estructura de `base` y `overlays` para gestionar las configuraciones de cada entorno (staging, production) de forma limpia y sin duplicación.
    * Los secretos se gestionan con el **External Secrets Operator**, que sincroniza los valores de AWS Secrets Manager directamente en el clúster de Kubernetes como secretos nativos.
* **3. Script de Despliegue Automatizado (`deploy.sh`)**
    * Un script único y auditable que orquesta el despliegue completo:
        1.  Autentica con AWS.
        2.  Ejecuta `terraform apply` para asegurar que la infraestructura esté en el estado deseado.
        3.  Configura `kubectl` para apuntar al clúster correcto.
        4.  Ejecuta `kubectl apply -k` para desplegar las aplicaciones.
        5.  Verifica el estado del despliegue antes de finalizar.
* **4. Procedimientos Operativos**
    * **Configuración Local:** Guía para levantar el entorno de desarrollo con Docker Compose.
    * **Monitoreo y Alertas:** URLs y guías para usar los dashboards de Grafana y consultar logs en Loki.
    * **Troubleshooting:** Pasos para diagnosticar problemas comunes (fallos de comunicación con DGII, base de datos sobrecargada, errores de firma).
    * **Escalado:** Cómo modificar los manifiestos de `HorizontalPodAutoscaler` para ajustar la capacidad de los microservicios.
    * **Rotación de Certificados:** Procedimiento seguro para que los tenants actualicen sus certificados .p12 a través del portal.