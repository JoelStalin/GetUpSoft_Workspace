# 📡 Prompt: Añadir endpoints DGII (ENFC) para validación en `dgii_encf` (FastAPI)

Eres un **ingeniero backend senior** (FastAPI/Python 3.12) con foco en **seguridad y cumplimiento DGII**. Debes **crear e integrar** los endpoints requeridos por DGII (ENFC) para validación en el proyecto `dgii_encf`.

> Host de referencia: `https://enfc.getupsoft.com.do` (solo para ilustrar rutas).  
> Debes implementar los paths **exactos** en la app, con **prefijos y contratos** descritos abajo.

---

## 🔗 Endpoints requeridos (método y path)

1) **Recepción e-CF**
   - `POST /fe/recepcion/api/ecf`  
   - Recibe un e-CF **firmado** (XML o JSON→XML), valida XSD y firma; persiste y devuelve acuse (ARECF-like).

2) **Aprobación comercial**
   - `POST /fe/aprobacioncomercial/api/ecf`  
   - Recibe estructura de **Aprobación Comercial** relacionada a un e-CF; valida y persiste.

3) **Autenticación**
   - `GET  /fe/autenticacion/api/semilla`  
   - Retorna una **semilla** (string) con expiración corta (ej. 300s).
   - `POST /fe/autenticacion/api/validacioncertificado`  
   - Recibe un certificado (Base64 PEM/DER o P12+password opcional) y **valida**: vigencia, emisor, huella (SHA-256), sujeto (RNC). Responde estatus y metadatos.

---

## 🛡️ Requisitos de seguridad (obligatorios)
- **CORS**: orígenes explícitos (no `*`).
- **Rate-limit** por IP/tenant (usa `slowapi` si ya existe).
- **Logging** estructurado y trazas (usa `structlog`).
- **Idempotencia** en `POST` (`Idempotency-Key` header): si se repite, devolver el mismo result.
- **Validación XML segura**: `defusedxml` y límites de tamaño/profundidad.
- **Validación XSD**: e-CF / Aprobación Comercial (colocar XSD en `xsd/`).
- **Verificación de firma** del e-CF firmado.
- **Schemas** Pydantic v2 para requests/responses.
- **Content negotiation**: aceptar `application/xml` y `application/json` (convertir JSON→XML para validación/firma).

---

## 📦 Archivos a crear/modificar

### 1) `app/api/enfc_routes.py` (nuevo)
- Crear un `APIRouter` con **tags=["ENFC"]** y prefijo `/fe`.
- Rutas exactas:  
  - `POST /recepcion/api/ecf`
  - `POST /aprobacioncomercial/api/ecf`
  - `GET  /autenticacion/api/semilla`
  - `POST /autenticacion/api/validacioncertificado`
- Validar headers (`Content-Type`, `Idempotency-Key`), registrar logs y métricas.

### 2) `app/services/recepcion_service.py` (nuevo)
- Función `procesar_ecf(payload: Union[str, bytes, dict]) -> dict`
  - Si `dict`: serializa a XML.
  - `validate_with_xsd(xml, xsd_path)`
  - `verify_xml_signature(xml)`
  - persistencia + devolver `{ "acuseId": "...", "estado": "RECIBIDO", "detalle": "...", "timestamp": "..." }`

### 3) `app/services/aprobacion_service.py` (nuevo)
- Función `procesar_aprobacion(payload: Union[str, bytes, dict]) -> dict`
  - Validación XSD (aprobación comercial).
  - Persistencia + respuesta `{ "acuseId": "...", "estado": "ACEPTADO" | "RECHAZADO", "detalle": "..." }`

### 4) `app/services/auth_service.py` (nuevo)
- `emitir_semilla() -> dict`: genera semilla (ej. `base64url(now_iso + nonce)`), guarda con TTL (ej. en DB/redis o memoria para demo).
- `validar_certificado(input) -> dict`: recibe `cert_b64` (PEM/DER) o `p12_b64` + `password`; devuelve huella SHA-256, issuer, subject, fechas, y `valido: bool`.

### 5) `app/security/xml_verify.py` (nuevo o integrar en `security/xml.py`)
- `verify_xml_signature(xml_bytes: bytes) -> bool` usando `signxml`.
- Reutiliza `secure_fromstring` y `validate_with_xsd` si ya existen.

### 6) `app/main.py` (modificar)
- Incluir el router `enfc_routes`.
- Añadir tags OpenAPI para sección ENFC.

### 7) `tests/test_enfc_endpoints.py` (nuevo)
- Tests **async** para los cuatro endpoints con `httpx.AsyncClient`/`pytest-asyncio`.
- Casos felices y de error (XML inválido, firma inválida, certificado vencido, idempotencia repetida, content-type incorrecto).

### 8) (Opcional) `docker/nginx.conf`
- Asegurar `proxy_buffering off;` para cargas grandes (si aplica) y **headers** de seguridad.

> Si ya existen utilidades (`security/xml.py`, `security/signing.py`), **reutilízalas**. Si no, crea stubs mínimos.

---

## 📄 Contratos de entrada/salida (JSON de referencia)

### `POST /fe/recepcion/api/ecf`
- **Request** (JSON o XML):
```json
{
  "formato": "XML",            // o "JSON"
  "ecf_xml_b64": "PD94bWwgdmVyc2lvbj0iMS4wIj8+PGVD...",
  "metadata": { "rncEmisor": "101010101", "encf": "E310000000000" }
}
```
- **Response** (200):
```json
{ "acuseId": "ARC-2025-000001", "estado": "RECIBIDO", "detalle": "OK", "timestamp": "2025-10-31T12:34:56Z" }
```

### `POST /fe/aprobacioncomercial/api/ecf`
- **Request**:
```json
{
  "aprobacion_xml_b64": "PD94bWwgdmVyc2lvbj0iMS4wIj8+PEFST0I+Li4u",
  "metadata": { "encf": "E310000000000", "rncComprador": "102030405" }
}
```
- **Response**:
```json
{ "acuseId": "AC-2025-000123", "estado": "ACEPTADO", "detalle": "OK" }
```

### `GET /fe/autenticacion/api/semilla`
- **Response**:
```json
{ "semilla": "MjAyNS0xMC0zMVQxMjozNDo1Nlo6b25jZQ", "expiraEn": 300 }
```

### `POST /fe/autenticacion/api/validacioncertificado`
- **Request** (uno de los dos formatos):
```json
{ "cert_b64": "LS0tLS1CRUdJTiBDRVJUSUZJQ0FURS0tLS0t..." }
```
o
```json
{ "p12_b64": "MIIJowIBAzCCCY8GCSqGSIb3DQEHAaCCCXAEgglw...", "password": "pass" }
```
- **Response**:
```json
{
  "valido": true,
  "huellaSha256": "ABCD...",
  "subject": "CN=Proveedor S.A.,RNC=101010101",
  "issuer": "AC X",
  "notBefore": "2025-01-01T00:00:00Z",
  "notAfter": "2027-01-01T00:00:00Z",
  "detalle": "OK"
}
```

---

## 🧪 Snippets de referencia (guía de implementación)

### `app/api/enfc_routes.py`
```python
# FILE: app/api/enfc_routes.py
from fastapi import APIRouter, Header, Request, Response, HTTPException, Depends
from typing import Optional
from pydantic import BaseModel
from ..services.recepcion_service import procesar_ecf
from ..services.aprobacion_service import procesar_aprobacion
from ..services.auth_service import emitir_semilla, validar_certificado

router = APIRouter(prefix="/fe", tags=["ENFC"])

class RecepcionReq(BaseModel):
    formato: str
    ecf_xml_b64: Optional[str] = None
    ecf_json: Optional[dict] = None
    metadata: Optional[dict] = None

class AprobacionReq(BaseModel):
    aprobacion_xml_b64: Optional[str] = None
    aprobacion_json: Optional[dict] = None
    metadata: Optional[dict] = None

@router.post("/recepcion/api/ecf")
async def recepcion_ecf(req: RecepcionReq, idempotency_key: Optional[str] = Header(default=None, alias="Idempotency-Key")):
    if not idempotency_key:
        raise HTTPException(400, "Falta Idempotency-Key")
    return await procesar_ecf(req.model_dump())

@router.post("/aprobacioncomercial/api/ecf")
async def aprobacion_ecf(req: AprobacionReq, idempotency_key: Optional[str] = Header(default=None, alias="Idempotency-Key")):
    if not idempotency_key:
        raise HTTPException(400, "Falta Idempotency-Key")
    return await procesar_aprobacion(req.model_dump())

@router.get("/autenticacion/api/semilla")
async def semilla():
    return emitir_semilla()

class CertReq(BaseModel):
    cert_b64: Optional[str] = None
    p12_b64: Optional[str] = None
    password: Optional[str] = None

@router.post("/autenticacion/api/validacioncertificado")
async def validacion_cert(req: CertReq):
    return validar_certificado(req.model_dump())
```

### `app/services/auth_service.py`
```python
# FILE: app/services/auth_service.py
import base64, os, time, hashlib
from datetime import datetime, timezone
from cryptography import x509
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.serialization import pkcs12
from cryptography.hazmat.backends import default_backend

TTL = 300  # 5 min

def _now_iso():
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()

def emitir_semilla() -> dict:
    nonce = base64.urlsafe_b64encode(os.urandom(12)).decode().rstrip("=")
    payload = f"{_now_iso()}:{nonce}".encode()
    semilla = base64.urlsafe_b64encode(payload).decode().rstrip("=")
    return {"semilla": semilla, "expiraEn": TTL}

def _fingerprint_sha256(cert: x509.Certificate) -> str:
    return cert.fingerprint(hashes.SHA256()).hex().upper()

def validar_certificado(data: dict) -> dict:
    try:
        if data.get("cert_b64"):
            raw = base64.b64decode(data["cert_b64"])
            try:
                cert = x509.load_pem_x509_certificate(raw, default_backend())
            except Exception:
                cert = x509.load_der_x509_certificate(raw, default_backend())
        elif data.get("p12_b64"):
            raw = base64.b64decode(data["p12_b64"])
            key, cert, _ = pkcs12.load_key_and_certificates(
                raw, (data.get("password") or "").encode() or None
            )
            if not cert:
                return {"valido": False, "detalle": "P12 sin certificado"}
        else:
            return {"valido": False, "detalle": "Entrada vacía"}

        not_before = cert.not_valid_before.replace(tzinfo=timezone.utc).isoformat()
        not_after = cert.not_valid_after.replace(tzinfo=timezone.utc).isoformat()
        valido = datetime.now(timezone.utc) < cert.not_valid_after
        return {
            "valido": bool(valido),
            "huellaSha256": _fingerprint_sha256(cert),
            "subject": cert.subject.rfc4514_string(),
            "issuer": cert.issuer.rfc4514_string(),
            "notBefore": not_before,
            "notAfter": not_after,
            "detalle": "OK" if valido else "Certificado vencido"
        }
    except Exception as e:
        return {"valido": False, "detalle": f"Error: {e}"}
```

### `app/services/recepcion_service.py` (esqueleto)
```python
# FILE: app/services/recepcion_service.py
import base64
from typing import Union
from datetime import datetime, timezone
from ..security.xml import validate_with_xsd  # si existe
from ..security.xml_verify import verify_xml_signature  # crear si no existe

async def procesar_ecf(payload: Union[str, bytes, dict]) -> dict:
    # Simplificado: asume JSON con ecf_xml_b64
    if isinstance(payload, dict) and payload.get("ecf_xml_b64"):
        xml = base64.b64decode(payload["ecf_xml_b64"])
    else:
        return {"error": "Payload inválido"}
    # TODO: ruta real del XSD
    validate_with_xsd(xml, "xsd/e_cf_v1_0.xsd")
    if not verify_xml_signature(xml):
        return {"error": "Firma inválida"}
    # TODO: persistencia/idempotencia real
    acuse = f"ARC-{datetime.now(timezone.utc).strftime('%Y%m%d-%H%M%S')}"
    return {"acuseId": acuse, "estado": "RECIBIDO", "detalle": "OK", "timestamp": datetime.now(timezone.utc).isoformat()}
```

### `app/services/aprobacion_service.py` (esqueleto)
```python
# FILE: app/services/aprobacion_service.py
import base64
from typing import Union
from ..security.xml import validate_with_xsd  # si existe

async def procesar_aprobacion(payload: Union[str, bytes, dict]) -> dict:
    if isinstance(payload, dict) and payload.get("aprobacion_xml_b64"):
        xml = base64.b64decode(payload["aprobacion_xml_b64"])
    else:
        return {"error": "Payload inválido"}
    # TODO: ruta real del XSD de aprobación comercial
    validate_with_xsd(xml, "xsd/aprobacion_v1_0.xsd")
    # TODO: lógica de negocio/persistencia
    return {"acuseId": "AC-001", "estado": "ACEPTADO", "detalle": "OK"}
```

### `app/security/xml_verify.py`
```python
# FILE: app/security/xml_verify.py
from lxml import etree
from signxml import XMLVerifier

def verify_xml_signature(xml_bytes: bytes) -> bool:
    try:
        XMLVerifier().verify(xml_bytes)
        return True
    except Exception:
        return False
```

### `app/main.py` (agregar router)
```python
# FILE: app/main.py  (fragmento)
from fastapi import FastAPI
from .api.enfc_routes import router as enfc_router

app = FastAPI(title="dgii_encf")
app.include_router(enfc_router)
```

### `tests/test_enfc_endpoints.py`
```python
# FILE: tests/test_enfc_endpoints.py
import base64, pytest
from httpx import AsyncClient
from app.main import app

@pytest.mark.asyncio
async def test_semilla():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        res = await ac.get("/fe/autenticacion/api/semilla")
        assert res.status_code == 200
        assert "semilla" in res.json()

@pytest.mark.asyncio
async def test_validacion_cert_input_vacio():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        res = await ac.post("/fe/autenticacion/api/validacioncertificado", json={})
        assert res.status_code == 200
        assert res.json()["valido"] is False

@pytest.mark.asyncio
async def test_recepcion_ecf_requiere_idempotency():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        res = await ac.post("/fe/recepcion/api/ecf", json={"formato":"XML","ecf_xml_b64":"PEU+"})
        assert res.status_code == 400
```
---

## ✅ Entrega (formato estricto)
- **Sin explicaciones**, solo bloques de código completos con el encabezado:
```
# FILE: <ruta/archivo>
<contenido>
```
- Debes incluir **al menos** los archivos listados arriba y compilar sin errores (puedes crear XSD stubs si faltan).
- Ajusta imports/rutas para el layout real del repo si difiere.
- No expongas secretos. Maneja certificados solo como entrada de prueba.
- Asegura compatibilidad con `pytest -q`.

> Entrega ahora los archivos completos siguiendo este formato.
