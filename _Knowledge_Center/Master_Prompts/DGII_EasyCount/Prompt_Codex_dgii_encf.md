# 🎯 Objetivo
Eres un **ingeniero senior** en Python 3.12/FastAPI con foco en seguridad y cumplimiento para e-CF (DGII). Debes **arreglar y optimizar** el proyecto `dgii_encf` (FastAPI + SQLAlchemy/Alembic + Poetry) y **cerrar vulnerabilidades**. Entrega **código listo para commit** (por archivo), **tests**, **CI**, y **docs** mínimos.

Repo (referencia): https://github.com/JoelStalin/dgii_encf

---

## 🔐 Requisitos de seguridad y cumplimiento (obligatorios)
1) **XML seguro**
   - Prohibir DTD/entidades externas (mitigar **XXE** y “billion laughs”).
   - Límite de tamaño/profundidad de XML y **time-box** de parsing.
   - Centralizar parsing en un helper único.

2) **Validación XSD**
   - Validar **e-CF/ARECF/ACECF/RFCE** contra sus **XSD** antes de firmar/enviar.
   - Colocar XSDs en `xsd/` y exponer `validate_with_xsd(xml_bytes, xsd_path)`.

3) **Firma digital**
   - **RSA-SHA256**, **enveloped**, `Reference URI=""`, **C14N**.
   - Cargar `PKCS#12 (.p12/.pfx)` desde secreto/entorno (no en el repo).
   - Sello de tiempo (si no hay TSA real, deja interfaz y mock).

4) **SSRF y cliente HTTP**
   - **Allow-list** de hosts de DGII, **timeouts** estrictos, **no redirects**.
   - Rechazar IPs privadas/loopback/link-local tras resolución DNS.
   - Retries con backoff y **circuit breaker**.

5) **API & app**
   - CORS con orígenes explícitos; JWT corto con refresh; **rate-limit** por IP/tenant.
   - Security headers (CSP, XFO, X-CTO, RP) y `/healthz` `/readyz` `/metrics`.
   - Logging estructurado (JSON) y trazas.

6) **Datos e índices**
   - Índices en claves de búsqueda (RNC, eNCF, estado).
   - Migración Alembic correspondiente.

7) **Pruebas & CI**
   - Tests de XSD, firma y SSRF/HTTP.
   - **GitHub Actions**: lint, tests, SAST/dep scan, build imagen y escaneo.
   - Artefactos de prueba (XMLs mínimos válidos) en `tests/assets/`.

8) **Docker/Nginx**
   - Dockerfile multi-stage, imagen final mínima (distroless si es viable).
   - Nginx con headers de seguridad.

---

## 📦 Dependencias sugeridas
- `defusedxml`, `lxml`, `signxml`, `cryptography`, `httpx`, `tenacity`, `structlog`, `python-json-logger`, `slowapi`, `pydantic>=2`, `pytest`, `pytest-asyncio`.
- Mantener compatibilidad con FastAPI/Starlette.

---

## 🧱 Estructura esperada (nueva o ajustada)
```
dgii_encf/
  app/
    api/
    domain/
      models/
        ecf.py
        arecf.py
        acecf.py
        rfce.py
    security/
      xml.py
      signing.py
      http_client.py
      auth.py
      rate_limit.py
    services/
      dgii_client.py
    infra/
      logging.py
      settings.py
  xsd/      # (coloca aquí los XSD)
  tests/
    test_xsd_validation.py
    test_signing.py
    test_http_ssrf.py
    assets/
      sample_ecf_32.xml
      sample_arecf.xml
      sample_acecf.xml
      sample_rfce.xml
  alembic/ (migraciones)
  docker/
    nginx.conf
.github/
  workflows/ci.yml
```

---

## 🧪 Ejemplos de código (guía de implementación)

### 1) Parser XML seguro + validación XSD
```python
# app/security/xml.py
from defusedxml.lxml import fromstring
from lxml import etree

MAX_XML_BYTES = 2_000_000  # 2 MB
MAX_DEPTH = 64

def secure_fromstring(xml_bytes: bytes) -> etree._Element:
    if len(xml_bytes) > MAX_XML_BYTES:
        raise ValueError("XML too large")
    # defusedxml ya desactiva DTD/entidades externas
    root = fromstring(xml_bytes)
    if _depth(root) > MAX_DEPTH:
        raise ValueError("XML too deep")
    return root

def _depth(node, level=0):
    return max([level] + [_depth(c, level + 1) for c in node])

def validate_with_xsd(xml_bytes: bytes, xsd_path: str) -> None:
    parser = etree.XMLParser(load_dtd=False, resolve_entities=False, no_network=True)
    schema_doc = etree.parse(xsd_path, parser)
    schema = etree.XMLSchema(schema_doc)
    schema.assertValid(secure_fromstring(xml_bytes))
```

### 2) Modelos Pydantic → XML (ejemplo e-CF tipo 32)
```python
# app/domain/models/ecf.py
from pydantic import BaseModel, Field
from lxml.builder import E
from lxml import etree

class ECFHeader(BaseModel):
    RNCEmisor: str
    RNCComprador: str
    TipoECF: str = Field(default="32")
    ENCF: str
    MontoTotal: float

class ECF(BaseModel):
    Encabezado: ECFHeader
    # Detalle, Totales, etc. (agrega campos mínimos necesarios)

    def to_xml(self) -> bytes:
        enc = self.Encabezado
        doc = E.eCF(
            E.Encabezado(
                E.RNCEmisor(enc.RNCEmisor),
                E.RNCComprador(enc.RNCComprador),
                E.TipoECF(enc.TipoECF),
                E.ENCF(enc.ENCF),
                E.MontoTotal(f"{enc.MontoTotal:.2f}"),
            ),
            # E.Detalle(...), E.Totales(...), etc.
        )
        return etree.tostring(doc, encoding="UTF-8", xml_declaration=True)
```

### 3) Firma RSA-SHA256 (XMLDSig enveloped, `URI=""`, C14N)
```python
# app/security/signing.py
from typing import Optional
from lxml import etree
from cryptography.hazmat.primitives.serialization import pkcs12, Encoding
from signxml import XMLSigner, methods

def sign_xml_enveloped(xml_bytes: bytes, p12_path: str, p12_password: Optional[bytes], reference_uri: str = "") -> bytes:
    root = etree.fromstring(xml_bytes)  # firmamos sobre bytes ya generados (controlados)
    with open(p12_path, "rb") as f:
        private_key, certificate, _ = pkcs12.load_key_and_certificates(f.read(), p12_password)
    cert_pem = certificate.public_bytes(Encoding.PEM)

    signer = XMLSigner(
        method=methods.enveloped,
        signature_algorithm="rsa-sha256",
        digest_algorithm="sha256",
        c14n_algorithm="http://www.w3.org/TR/2001/REC-xml-c14n-20010315",
    )
    signed = signer.sign(
        root,
        key=private_key,
        cert=cert_pem,
        reference_uri=reference_uri,  # "" => todo el documento
    )
    return etree.tostring(signed, encoding="UTF-8", xml_declaration=True)
```

### 4) Cliente HTTP endurecido (SSRF-safe) + allow-list
```python
# app/security/http_client.py
import ipaddress, socket, httpx
from typing import Iterable
from tenacity import retry, stop_after_attempt, wait_exponential

ALLOWED_HOSTS = {"servicios.dgii.gov.do", "ecf.dgii.gov.do"}

def _is_public_host(host: str) -> bool:
    infos = socket.getaddrinfo(host, None)
    ips = {ipaddress.ip_address(info[4][0]) for info in infos}
    return all(not (ip.is_private or ip.is_loopback or ip.is_link_local) for ip in ips)

def _check_host(url: str) -> None:
    host = httpx.URL(url).host
    if host not in ALLOWED_HOSTS:
        raise ValueError("Host not allowed")
    if not _is_public_host(host):
        raise ValueError("Non-public IP resolved")

@retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=0.5, max=4))
async def post_json_safe(url: str, payload: dict, headers: dict | None = None) -> httpx.Response:
    _check_host(url)
    async with httpx.AsyncClient(timeout=httpx.Timeout(5.0, connect=2.0), follow_redirects=False) as client:
        return await client.post(url, json=payload, headers=headers)
```

### 5) Rate-limit, CORS y headers de seguridad
```python
# app/security/auth.py (ejemplo CORS/JWT minimal)
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

def setup_security(app: FastAPI):
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["https://tu-frontend.com"],  # <-- ajustar
        allow_methods=["POST", "GET"],
        allow_headers=["Authorization", "Content-Type"],
    )

# app/security/rate_limit.py
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

def setup_rate_limit(app: FastAPI):
    limiter = Limiter(key_func=get_remote_address)
    app.state.limiter = limiter

    @app.exception_handler(RateLimitExceeded)
    def ratelimit_handler(request: Request, exc: RateLimitExceeded):
        return JSONResponse({"detail": "Rate limit exceeded"}, status_code=429)

# app/infra/logging.py
import logging, structlog

def setup_logging():
    logging.basicConfig(level=logging.INFO)
    structlog.configure(processors=[structlog.processors.TimeStamper(fmt="iso"), structlog.processors.JSONRenderer()])

# app/main.py (fragmento)
from fastapi import FastAPI
from .security.auth import setup_security
from .security.rate_limit import setup_rate_limit
from .infra.logging import setup_logging

app = FastAPI()
setup_logging()
setup_security(app)
setup_rate_limit(app)

@app.get("/healthz")
def healthz(): return {"ok": True}
@app.get("/readyz")
def readyz(): return {"ok": True}
```

### 6) Migración Alembic (índices de búsqueda)
```python
# alembic/versions/2025_01_01_add_indexes.py
from alembic import op

revision = "2025_01_01_add_indexes"
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    op.create_index("ix_docs_encf", "documentos", ["encf"], unique=True)
    op.create_index("ix_docs_rnc", "documentos", ["rnc_emisor"])
    op.create_index("ix_docs_estado", "documentos", ["estado"])

def downgrade():
    op.drop_index("ix_docs_estado", table_name="documentos")
    op.drop_index("ix_docs_rnc", table_name="documentos")
    op.drop_index("ix_docs_encf", table_name="documentos")
```

### 7) Tests claves
```python
# tests/test_xsd_validation.py
from app.security.xml import validate_with_xsd
from pathlib import Path

def test_ecf_validates_against_xsd():
    xml = Path("tests/assets/sample_ecf_32.xml").read_bytes()
    xsd = "xsd/e_cf_v1_0.xsd"
    validate_with_xsd(xml, xsd)

# tests/test_signing.py
from app.security.signing import sign_xml_enveloped
from lxml import etree

def test_sign_enveloped_smoke(tmp_path):
    xml = b'<?xml version="1.0" encoding="UTF-8"?><eCF><Encabezado/></eCF>'
    # usa un .p12 de prueba (fixture) y password vacío/“pass”
    p12 = "tests/assets/test_cert.p12"
    signed = sign_xml_enveloped(xml, p12, b"pass")
    assert b"<Signature" in signed

# tests/test_http_ssrf.py
import pytest
import asyncio
from app.security.http_client import post_json_safe

@pytest.mark.asyncio
async def test_disallow_unknown_host():
    with pytest.raises(ValueError):
        await post_json_safe("https://127.0.0.1/echo", {"x": 1})
```

### 8) Dockerfile multi-stage y Nginx
```Dockerfile
# Dockerfile
FROM python:3.12-slim AS builder
WORKDIR /app
COPY pyproject.toml poetry.lock* /app/
RUN pip install --no-cache-dir poetry && poetry export -f requirements.txt --output requirements.txt --without-hashes
RUN pip install --no-cache-dir -r requirements.txt
COPY . /app

FROM gcr.io/distroless/python3-debian12
WORKDIR /app
COPY --from=builder /usr/local /usr/local
COPY . /app
ENV PYTHONUNBUFFERED=1
CMD ["-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080"]
```

```nginx
# docker/nginx.conf
server {
  listen 80;
  location / {
    proxy_pass http://app:8080;
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header Referrer-Policy no-referrer;
    add_header Content-Security-Policy "default-src 'self'";
  }
}
```

### 9) CI (GitHub Actions)
```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  build-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with: { python-version: "3.12" }
      - run: pip install --upgrade pip
      - run: pip install -r <(python - <<'PY'\nimport tomllib,sys\nprint('\\n'.join(['fastapi','uvicorn','pytest','pytest-asyncio','lxml','defusedxml','signxml','cryptography','httpx','tenacity','structlog','slowapi','pydantic']))\nPY)
      - run: pytest -q
```

---

## ✅ Entregables
1) Archivos nuevos/modificados **listos para commit**, agrupados por ruta, con su **contenido completo**.
2) Tests pasando localmente (`pytest -q`).
3) Indicaciones breves en README para variables sensibles (`P12_PATH`, `P12_PASSWORD`, URLs DGII, ALLOWED_HOSTS).

---

## 📤 Formato de salida (obligatorio)
- **No escribas explicaciones**, solo bloques de código por **archivo**.
- Para cada archivo, usa este encabezado como comentario en la primera línea del bloque:

```text
# FILE: <ruta/archivo.ext>
```

- Si reemplazas un archivo completo, muestra el **contenido completo**. Si es nuevo, **créalo**.
- Incluye **al menos**: `app/security/xml.py`, `app/security/signing.py`, `app/security/http_client.py`, `app/domain/models/ecf.py`, una migración Alembic, `tests/*`, `docker/nginx.conf`, `.github/workflows/ci.yml`.

---

## 📌 Notas
- Usa **typing** estricto y docstrings.
- No expongas secretos. Lee credenciales desde entorno/secret manager.
- Si falta un XSD real, crea **stubs** y deja claro el path (para ser reemplazado luego).

> Ahora entrega los **archivos completos** siguiendo el formato indicado.
