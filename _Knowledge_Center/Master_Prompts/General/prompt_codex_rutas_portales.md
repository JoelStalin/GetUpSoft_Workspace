# Prompt para Codex — **Agregar rutas de Portal Cliente y Administrador** (FastAPI + Docker/Nginx)

**Rol:** Eres un agente que edita código y abre PR.  
**Objetivo:** Crear rutas separadas para **portal cliente** y **portal administrador** en la API (FastAPI), con seguridad básica por rol para **desarrollo local**, y asegurar compatibilidad con el proxy/Nginx (dominio cloud: `fc.getupsot.com.do`). Cambios **idempotentes** y sin romper lo existente.

---

## Criterios de éxito
1) La app expone **`/cliente/*`** y **`/admin/*`** con endpoints de ejemplo y documentación en OpenAPI.  
2) En local (`docker-compose.override.yml`), hot-reload funciona y los endpoints responden 200.  
3) Seguridad mínima por rol (solo dev): `Bearer <rol>:<usuario>` o headers `X-User-Role`.  
4) Nginx enruta `/cliente` y `/admin` sin perder el prefijo.  
5) Cloud listo para `https://fc.getupsot.com.do` (CORS/hosts ya contemplados por prompts previos).

---

## Archivos a **crear/modificar**

### 1) `app/core/auth.py` — dependencia de auth **dev-only**
> Si ya existe, **extiéndelo** con una dependencia simple de rol; no rompas la verificación real si la hay.

```python
# app/core/auth.py
from fastapi import Depends, HTTPException, status, Request

def get_current_user(request: Request):
    """
    DEV-ONLY: Stub de autenticación para pruebas locales.
    - Authorization: Bearer <rol>:<usuario>  (ej: 'Bearer admin:bob')
    - o headers: X-User-Role, X-User-Id
    """
    role = None
    user_id = None

    auth = request.headers.get("authorization", "")
    if auth.lower().startswith("bearer "):
        token = auth.split()[1]
        if ":" in token:
            role, user_id = token.split(":", 1)

    role = role or request.headers.get("X-User-Role") or "cliente"
    user_id = user_id or request.headers.get("X-User-Id") or "local-user"

    return {"id": user_id, "role": role}

def require_role(required: str):
    def _dep(user = Depends(get_current_user)):
        if user.get("role") != required:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions"
            )
        return user
    return _dep
```

### 2) `app/routers/cliente.py` — rutas del portal cliente
```python
# app/routers/cliente.py
from fastapi import APIRouter, Depends
from app.core.auth import get_current_user

router = APIRouter(prefix="/cliente", tags=["Cliente"])

@router.get("/health")
def health():
    return {"status": "ok", "scope": "cliente"}

@router.get("/me")
def me(user = Depends(get_current_user)):
    return {"user": user}

# Ejemplos de recursos típicos
@router.get("/facturas")
def listar_facturas(user = Depends(get_current_user)):
    # DEV: devuelve mock
    return {"items": [], "owner": user["id"]}

@router.post("/facturas/validar")
def validar_factura(payload: dict, user = Depends(get_current_user)):
    return {"ok": True, "input": payload, "validated_by": user["id"]}
```

### 3) `app/routers/admin.py` — rutas del portal administrador
```python
# app/routers/admin.py
from fastapi import APIRouter, Depends
from app.core.auth import get_current_user, require_role

router = APIRouter(prefix="/admin", tags=["Administrador"])

@router.get("/health", dependencies=[Depends(require_role("admin"))])
def health():
    return {"status": "ok", "scope": "admin"}

@router.get("/usuarios", dependencies=[Depends(require_role("admin"))])
def listar_usuarios():
    # DEV: mock
    return {"items": [{"id": "alice"}, {"id": "bob"}]}

@router.post("/facturas/aprobar", dependencies=[Depends(require_role("admin"))])
def aprobar_factura(payload: dict, user = Depends(get_current_user)):
    return {"approved": True, "by": user["id"], "input": payload}
```

### 4) `app/main.py` — incluir routers (sin duplicar `app`)
> Detecta el archivo donde vive `app = FastAPI(...)`. Si no es `app/main.py`, ajusta rutas al módulo correcto.

```python
# app/main.py (fragmento)
from fastapi import FastAPI
# importa routers (usa import relativo según layout real)
from app.routers import cliente
from app.routers import admin as admin_router

app = FastAPI(title="DGII e-CF API", version="0.1.0")

# ... middlewares, CORS, etc. (no dupliques)

app.include_router(cliente.router)
app.include_router(admin_router.router)

@app.get("/health")
def health_root():
    return {"status": "ok", "root": True}
```

### 5) Nginx — preservar prefijo `/cliente` y `/admin` en cloud
> Si ya existe `infra/nginx/app.conf`, **modifícalo**; si no, créalo. Mantén también el `location /` general.

```nginx
# infra/nginx/app.conf (fragmento)
server {
    listen 80;
    server_name fc.getupsot.com.do;

    # rutas específicas (el proxy_pass SIN slash final preserva el prefijo)
    location /cliente {
        proxy_pass http://web:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /admin {
        proxy_pass http://web:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # catch-all
    location / {
        proxy_pass http://web:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

> **Nota Nginx:** En `location /cliente` usamos `proxy_pass http://web:8000;` (sin `/` final) para **conservar** `/cliente` en la URL hacia el backend.

---

## README — ejemplos de uso rápido
Añade a la sección “Desarrollo local”:

```
### Rutas de prueba
# Cliente
curl -sS http://localhost:8000/cliente/health | jq
curl -sS -H "Authorization: Bearer cliente:alice" http://localhost:8000/cliente/me | jq
curl -sS -H "Authorization: Bearer cliente:alice" http://localhost:8000/cliente/facturas | jq

# Administrador (requiere rol admin)
curl -sS -H "Authorization: Bearer admin:bob" http://localhost:8000/admin/health | jq
curl -sS -H "Authorization: Bearer admin:bob" http://localhost:8000/admin/usuarios | jq
curl -sS -H "Authorization: Bearer admin:bob" -H "Content-Type: application/json"      -d '{"ncf":"E3100000001"}' http://localhost:8000/admin/facturas/aprobar | jq
```

---

## Validaciones automáticas (ejecutar y pegar en el PR)
```bash
docker compose -f docker-compose.yml -f docker-compose.override.yml up -d --build
sleep 2
curl -sS -o /dev/null -w "%{http_code}\n" http://localhost:8000/cliente/health
curl -sS -o /dev/null -w "%{http_code}\n" -H "Authorization: Bearer admin:bob" http://localhost:8000/admin/health
```

---

## Entregable (PR)
- **Título:** `feat(api): rutas /cliente y /admin con auth de rol (dev)`
- **Descripción:**
  - [x] Routers `cliente` y `admin` con endpoints base
  - [x] Auth stub dev: `Bearer <rol>:<usuario>` / headers `X-User-Role`
  - [x] Inclusión en `main.py` y docs OpenAPI por tags
  - [x] Nginx preserva prefijos `/cliente` y `/admin`
  - [x] README: ejemplos de curl
- **Commit (único):**
```
feat(api): add /cliente and /admin routers with dev role auth; nginx path routing

- APIRouter para cliente y admin, con endpoints de ejemplo
- Dependencias de auth dev-only por rol
- Inclusión de routers en main y documentación por tags
- Nginx mantiene prefijos de ruta para cloud fc.getupsot.com.do
```
