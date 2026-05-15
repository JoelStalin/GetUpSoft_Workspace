
# 🧠 Prompt para Codex — Poner `JoelStalin/dgii_encf` en cumplimiento DGII e‑CF (end‑to‑end)

Eres un **agente de refactor y entrega** para un backend **FastAPI (Python 3.12+)**. Tu objetivo es **llevar el repo a cumplimiento DGII e‑CF**, implementando contratos, firma, clientes y pruebas **end‑to‑end**, con **documentación clara** y **CI/CD**. Entregarás **un único Pull Request** con *código, docs, tests, Docker y workflows* listos.

---

## 0) Contexto de negocio (resumen)
Debes soportar la facturación electrónica **e‑CF** de la DGII (Rep. Dom.) y sus procesos relacionados: **Autenticación (semilla → token)**, **Recepción e‑CF**, **Resumen FC < RD$250k (RFCE)**, **Acuse (ARECF)**, **Aprobación Comercial (ACECF)**, **Anulación de secuencias (ANECF)**, y **Representación Impresa (RI con QR)**. El sistema debe funcionar en **tres ambientes** (Pre‑Certificación, Certificación y Producción) mediante **variables de entorno**.

> Referencias internas (ya disponibles en el proyecto/uploader):  
> - “7. tablas - Formato Comprobante Fiscal Electrónico (e-CF) V1.0.pdf”  
> - “8. -Url de Servicios- Descripcion-tecnica-de-facturacion-electronica.pdf”  
> - “9. Firmado de e-CF En Lenguajes de Prog.pdf”  
> - “11. Formato Acuse de Recibo v 1.0.pdf”, “12. Formato Aprobación Comercial v1.0.pdf”, “13. Formato Anulación de e-NCF v1.0.pdf”, “14. Formato Resumen Factura Consumo Electrónica v1.0.pdf”  
> - Guías de certificación/FAQ correspondientes.  

No hardcodees URLs ni credenciales; **todo** debe venir por `.env`/secrets. Mantén **compatibilidad con el estilo y estructura actuales** del repo, pero puedes reorganizar si mejora la trazabilidad.

---

## 1) Entregables (todo en un solo PR)
1. **Código**:
   - Cliente DGII (HTTPX o `requests`) con flujos: `get_seed() → sign_seed() → get_token()`; `send_ecf()`, `send_rfce()`, `send_anecf()`, `send_acecf()`, `send_arecf()`, `get_status(track_id)`.
   - **Firma XMLDSig (SHA‑256)** para e‑CF: `SignatureMethod` y `DigestMethod` **SHA‑256**. Implementa con `signxml` o `xmlsec` + `lxml`. Soporta certificados **.p12**/**.pfx** y password. Función: `sign_ecf(xml_bytes, p12_path, p12_password) -> xml_bytes`.
   - **Validación XSD**: carpeta `schemas/` con XSDs (placeholders si no están aún). Función `validate_xml(xml_bytes, xsd_name)`; tests deben fallar si no pasa XSD.
   - **RI (Representación Impresa)**: plantilla Jinja2 en `ri/templates/` + endpoint `/ri/render` que genera PDF/HTML con **QR** y valida restricciones de contenido/longitud. Genera el **QR** con `qrcode` lib.
   - **Routers FastAPI**: `auth`, `recepcion`, `rfce`, `aprobacion`, `anulacion`, `acuse`, `ri`. Montados bajo `/api/dgii/*` y `/ri/*`.
   - **OpenAPI 3.1**: `openapi/dgii.yaml` completo y en sync con los routers.
   - **Jobs internos**: soporte de colas simples o tareas async para reintentos de recepción/consulta de estado.

2. **Infra & DevOps**:
   - **Dockerfile** (slim, non‑root, healthcheck), `docker-compose.yaml` (app + db opcional).
   - **GitHub Actions**: `ci.yml` con matrix `3.12`, pasos: lint (`ruff`), type‑check (`mypy`), tests (`pytest` + coverage ≥ 85%), build docker, trivy scan (opcional), publicación de artefactos.  
   - **Makefile**: `make setup|lint|typecheck|test|run|docker-build|docker-up`.
   - **.env.example** completo con todas las variables requeridas (ver sección 3).

3. **Pruebas**:
   - **Unitarias** para firma, validación XSD, mapeos de modelos/XML.
   - **Contract tests** de clientes (simula DGII con `responses`/`respx` o `httpretty`).  
   - **E2E local**: flujo happy‑path: `seed → token → send_ecf → trackId → status` usando *mocks* (no llames servicios reales en CI).
   - **Datos de ejemplo**: `samples/ecf_valid.xml`, `samples/rfce_valid.xml`, etc., conformes a los formatos.

4. **Documentación** (en español):
   - `docs/DGII-Guia-Implementacion.md`: guía paso a paso (setup, llaves, firma, endpoints, ejemplos cURL/HTTPie).
   - `README.md` actualizado con sección **“DGII e‑CF (Cumplimiento)”**: qué hace, cómo probar, límites.
   - `docs/SEGURIDAD-PROVEEDOR.md`: bitácoras, backups, gestión de incidentes, protección de datos, canales de soporte.
   - `CHANGELOG.md` con entradas del PR.

---

## 2) Reglas y arquitectura (obligatorio)
- **Python ≥ 3.12**. ESM no aplica; mantén tipado estático con `mypy --strict` en core DGII.
- **Sin hardcode** de URLs/tokens/certs. Usa `pydantic-settings` o `dotenv`.
- **Logs estructurados** (JSON) con `structlog` o `logging` + extra dict; incluye `track_id`, `rnc`, `tipo_ecf`, `ambiente`.
- **Errores**: excepciones específicas `DGIIAuthError`, `DGIISignError`, `DGIIReceiptError` y *retryable vs non‑retryable*.
- **Time‑out/retry**: clientes HTTP con `timeout` y `backoff` exponencial; idempotencia en envíos.
- **Seguridad**: archivos `.p12/.pfx` nunca en repo; leer de ruta segura/secret. Enmascara secretos en logs.
- **RI**: valida restricciones de longitud/caracteres de campos; si se excede, error 422 con detalle.
- **Trazabilidad**: todas las operaciones DGII deben registrar `request_id` y `track_id` (si aplica).

---

## 3) Variables de entorno (mínimas)
```
ENV=PRECERT|CERT|PROD
DGII_AUTH_BASE_URL_PRECERT=...
DGII_RECEPCION_BASE_URL_PRECERT=...
DGII_RECEPCION_FC_BASE_URL_PRECERT=...
DGII_DIRECTORIO_BASE_URL_PRECERT=...
# (repetir CERT/PROD)

DGII_RNC=
DGII_CERT_P12_PATH=/secrets/company_cert.p12
DGII_CERT_P12_PASSWORD=
DGII_HTTP_TIMEOUT_SECONDS=30
DGII_HTTP_RETRIES=3
RI_QR_BASE_URL=...   # base del URL del QR impreso
```
Crea helper para resolver la base URL según `ENV`.

---

## 4) Cambios de código requeridos
Crea/ajusta los siguientes módulos (nombres orientativos, respeta el estilo del repo si ya existen):

```
app/
  core/config.py                # pydantic-settings, resolve URLs por ENV
  core/logging.py               # logger estructurado
  dgii/clients.py               # clase DGIIClient con métodos: get_seed, sign_seed, get_token, send_ecf, send_rfce, send_anecf, send_acecf, send_arecf, get_status
  dgii/signing.py               # sign_ecf(xml_bytes, p12_path, p12_password) -> xml_bytes (XMLDSig SHA-256)
  dgii/validation.py            # validate_xml(xml_bytes, xsd_name) -> None or raises
  dgii/models/                  # pydantic models -> XML mappers (ECF, ARECF, ACECF, ANECF, RFCE)
  routers/auth.py               # /api/dgii/auth/*
  routers/recepcion.py          # /api/dgii/recepcion/*
  routers/rfce.py               # /api/dgii/rfce/*
  routers/aprobacion.py         # /api/dgii/aprobacion/*
  routers/anulacion.py          # /api/dgii/anulacion/*
  routers/acuse.py              # /api/dgii/acuse/*
  ri/templates/ri_default.html  # Jinja2
  ri/router.py                  # /ri/render
  openapi/dgii.yaml             # OpenAPI 3.1
schemas/
  ECF.xsd  ARECF.xsd  ACECF.xsd  ANECF.xsd  RFCE.xsd  # placeholders si aún no están
samples/
  ecf_valid.xml  rfce_valid.xml  arecf_valid.xml  acecf_valid.xml  anecf_valid.xml
tests/
  test_signing.py  test_validation.py  test_clients_contract.py  test_e2e_local.py
```

### 4.1 Firma XML (ejemplo de interfaz)
```python
# app/dgii/signing.py
from typing import Union
def sign_ecf(xml_bytes: Union[bytes, bytearray], p12_path: str, p12_password: str) -> bytes:
    """
    Genera ds:Signature (XMLDSig) con SignatureMethod=RSA-SHA256 y DigestMethod=SHA256.
    Debe firmar el documento raíz (Reference URI="") y retornar el XML firmado.
    """
    ...
```

### 4.2 Cliente DGII (interfaces)
```python
# app/dgii/clients.py
class DGIIClient:
    def get_seed(self) -> str: ...
    def sign_seed(self, seed_xml: bytes) -> bytes: ...
    def get_token(self, signed_seed_xml: bytes) -> str: ...
    def send_ecf(self, xml_bytes: bytes, token: str) -> dict: ...
    def send_rfce(self, xml_bytes: bytes, token: str) -> dict: ...
    def send_anecf(self, xml_bytes: bytes, token: str) -> dict: ...
    def send_acecf(self, xml_bytes: bytes, token: str) -> dict: ...
    def send_arecf(self, xml_bytes: bytes, token: str) -> dict: ...
    def get_status(self, track_id: str, token: str) -> dict: ...
```

### 4.3 Validación XSD
```python
# app/dgii/validation.py
def validate_xml(xml_bytes: bytes, xsd_name: str) -> None:
    """Carga schemas/{xsd_name} y valida; si es inválido, lanza ValueError con lista de errores."""
    ...
```

### 4.4 Routers (contratos REST)
- `POST /api/dgii/auth/token` → obtiene semilla, la firma con el certificado, y retorna `{access_token, expires_at}`.
- `POST /api/dgii/recepcion/ecf` → recibe JSON o XML, genera XML ECF, **valida XSD**, **firma**, envía a DGII y retorna `{track_id, status}`.
- Rutas equivalentes para `rfce`, `anecf`, `acecf`, `arecef`.
- `GET /api/dgii/recepcion/status/{track_id}` → consulta estado.
- Errores HTTP claros (422 validación, 502 DGII upstream, 500 internos).

---

## 5) Tests y criterios de aceptación
- **Firma**: prueba que `ds:Signature` existe, `SignatureMethod` y `DigestMethod` son **SHA‑256**, y la verificación de firma pasa (usa `signxml` verify).
- **XSD**: XMLs de `samples/` validan contra sus XSDs; añade casos negativos.
- **Contract tests**: stubs devuelven `trackId` y estados; el cliente reintenta con backoff en 5xx.
- **E2E local**: simula `seed → token → send_ecf → status` y genera **RI** con QR; guarda el HTML/PDF en artefactos de CI.
- **Coverage ≥ 85%** en `app/dgii/*`.
- **OpenAPI** compila sin errores y refleja los routers.
- **Docker**: `docker compose up` levanta app y healthcheck pasa en `localhost:8000/healthz`.

---

## 6) Documentación a producir
- `docs/DGII-Guia-Implementacion.md` con:
  1) Requisitos previos (Python 3.12, OpenSSL, certificado .p12),  
  2) Configurar `.env`,  
  3) Firmar y verificar un e‑CF (ejemplos),  
  4) Consumir endpoints DGII (cURL),  
  5) Generar RI con QR,  
  6) Flujo de certificación (checklist),  
  7) Troubleshooting común.
- `docs/SEGURIDAD-PROVEEDOR.md`: bitácoras, respaldo, monitoreo, incidentes, canales de soporte, **no almacenar secretos en repo**.
- `README.md`: resumen, quickstart, variables, make targets, enlaces a docs.

---

## 7) Calidad, estilo y seguridad
- Linters: `ruff` (PEP8/flake), `mypy --strict` en core DGII, `pyproject.toml` consolidado.
- Logs **sin PII** sensible; nunca imprimir certificados/llaves; ocultar contraseñas.
- Maneja **timezones** y formatos de fechas ISO‑8601.
- **Retries** con jitter; tiempo de espera configurable; circuit breaker simple opcional.

---

## 8) Plan de trabajo (pasos que debes ejecutar)
1. Analizar el repo actual y preservar lo que sirva.
2. Crear módulos y routers listados (4.x) con pruebas unitarias mínimas.
3. Integrar firma XMLDSig (SHA‑256) y validación XSD con tests.
4. Implementar cliente DGII y contract tests con *mocks*.
5. Añadir RI (Jinja2 + QR) y prueba e2e local.
6. Agregar OpenAPI, Docker, Makefile y CI (coverage gate 85%).
7. Escribir documentación (sección 6) y ejemplos cURL.
8. Ejecutar `pre-commit` (si existe) y asegurar linters verdes.
9. Entregar PR con descripción detallada, checklist de aceptación y capturas de RI.

---

## 9) Formato de entrega (PR)
- Título: `DGII e‑CF: firma SHA‑256, clientes, XSD, RI, CI y guía`
- Descripción: Resumen + lista de cambios + cómo correr + evidencia (salida de tests, captura RI, artefactos CI).
- Etiquetas: `compliance`, `dgii`, `e-cf`.
- Checklist marcada con todos los criterios de aceptación.

**Ahora realiza los cambios descritos y produce el PR con todos los entregables.**
