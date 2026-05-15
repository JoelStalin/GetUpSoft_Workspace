# Prompt para Codex — Corregir `gunicorn: not found` y endurecer Docker/Compose

**Rol:** Eres un agente que edita código y abre PR.  
**Objetivo:** Hacer que el servicio `web` levante sin errores en Docker/Compose, instalando y usando `gunicorn` correctamente, haciendo la build autosuficiente (Poetry → requirements en la build), y previniendo errores similares por binarios faltantes.

## Reglas
- Aplica cambios **idempotentes**: si un archivo ya existe, modifícalo; si no, créalo.
- No elimines lógica de la app. Solo empaquetado/infra.
- Detecta el módulo ASGI automáticamente (ver “Detección ASGI”).
- Entrega un **PR** con título y descripción, y un único commit con **convencional commit**.

## Criterios de éxito (tests manuales que deben pasar)
1) `docker compose build` termina OK.  
2) `docker compose up -d web` arranca sin: `executable file not found in $PATH`.  
3) `docker compose run --rm web which gunicorn` imprime una ruta válida.  
4) `curl -sS http://localhost:8000/health || curl -sS http://localhost:8000/` devuelve 200.  
5) `docker compose logs web` no muestra tracebacks por módulos/binaries faltantes.

---

## Cambios requeridos

### 1) Dependencias (Poetry/requirements)
- Si el proyecto usa **Poetry** (`pyproject.toml` presente):
  - Asegura estas dependencias (agrega si faltan):
    - `fastapi` (si es FastAPI)
    - `uvicorn[standard]`
    - `gunicorn`
  - **No** confíes en `make requirements` local. Exporta `requirements.txt` **dentro** de la build (ver Dockerfile).

- Si **no** usa Poetry, asegura en `requirements.txt`:
  ```
  fastapi>=0.111,<1
  uvicorn[standard]>=0.30
  gunicorn>=22
  ```
  (Si ya existen, no dupliques: normaliza versiones mínimas).

### 2) Dockerfile (multi-stage, autosuficiente)
Crea o reemplaza `Dockerfile` con este contenido, ajustando solo si el proyecto no usa Poetry:

```dockerfile
# syntax=docker/dockerfile:1

FROM python:3.12-slim AS builder
WORKDIR /app
ENV PIP_DISABLE_PIP_VERSION_CHECK=1 PIP_NO_CACHE_DIR=1 POETRY_VIRTUALENVS_CREATE=false

# Copia archivos de deps primero
COPY pyproject.toml poetry.lock* ./
# Si hay Poetry, exporta requirements; si no hay, solo crea vacío para no fallar
RUN pip install --upgrade pip poetry || true
RUN if [ -f pyproject.toml ]; then \
      poetry export --without-hashes -f requirements.txt -o /app/requirements.txt; \
    else \
      echo "Using plain requirements.txt from repo"; \
    fi

FROM python:3.12-slim AS runtime
WORKDIR /app
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1 PIP_DISABLE_PIP_VERSION_CHECK=1 PIP_NO_CACHE_DIR=1

# Si existe requirements exportado desde builder úsalo; si no, espera que haya uno en el repo
COPY --from=builder /app/requirements.txt /app/requirements.txt
COPY requirements.txt /app/requirements.txt 2>/dev/null || true
RUN if [ -f /app/requirements.txt ]; then \
      pip install --no-cache-dir -r /app/requirements.txt; \
    fi

# Copia el resto
COPY . /app

# Usa módulo para evitar problemas de PATH
# El target asgi:app se corrige en docker-compose (ver abajo)
CMD ["python", "-m", "gunicorn", "-c", "gunicorn.conf.py", "app.main:app"]
```

### 3) docker-compose.yml
Modifica/crea el servicio `web` así:
```yaml
services:
  web:
    build: .
    ports:
      - "8000:8000"
    # Detecta el módulo ASGI automáticamente (ver “Detección ASGI”).
    # Codex: reemplaza app.main:app por el valor detectado si aplica.
    command: >
      python -m gunicorn
      -k uvicorn.workers.UvicornWorker
      -c gunicorn.conf.py
      app.main:app
    environment:
      - PYTHONUNBUFFERED=1
    healthcheck:
      test: ["CMD", "curl", "-fsS", "http://localhost:8000/health"]
      interval: 15s
      timeout: 5s
      retries: 10
      start_period: 10s
```

### 4) gunicorn.conf.py
Crea o ajusta `gunicorn.conf.py` con defaults seguros:
```python
import multiprocessing
bind = "0.0.0.0:8000"
workers = max(2, multiprocessing.cpu_count() // 2)
worker_class = "uvicorn.workers.UvicornWorker"
timeout = 60
graceful_timeout = 30
keepalive = 5
accesslog = "-"
errorlog = "-"
```

### 5) .dockerignore
Añade/actualiza:
```
.git
__pycache__/
*.pyc
*.pyo
*.pyd
.env
.venv
venv/
dist/
build/
.cache/
.idea/
.vscode/
```

### 6) Makefile (opcional pero útil)
Si existe `Makefile`, añade/normaliza:
```make
.PHONY: build up down logs sh rebuild check-bins

build:
	docker compose build

up:
	docker compose up -d

down:
	docker compose down

logs:
	docker compose logs -f web

sh:
	docker compose run --rm web sh

rebuild:
	docker compose build --no-cache web && docker compose up -d web

check-bins:
	docker compose run --rm web sh -lc 'which python && which gunicorn && python -c "import fastapi, uvicorn, gunicorn; print(\"OK deps\")"'
```

### 7) Endpoint de salud (si no existe)
- Si no hay endpoint `/health`, crea uno mínimo en el módulo ASGI detectado:
```python
# En el archivo donde vive la instancia `app = FastAPI(...)`
try:
    from fastapi import FastAPI
except Exception:
    pass

if "app" in globals() and isinstance(app, FastAPI):
    @app.get("/health")
    def health():
        return {"status": "ok"}
```

---

## Detección ASGI (automatiza antes de escribir `command`)
1. Busca en el repo `FastAPI(` y localiza la variable (normalmente `app`).
2. Determina el **módulo importable** donde se define (por ejemplo `app/main.py` → `app.main:app`).
3. Si no puedes detectar con certeza, conserva `app.main:app` y no falles.

---

## Validaciones automáticas (ejecútalas y pega resultados en el PR)
```bash
docker compose build
docker compose run --rm web which gunicorn
docker compose up -d web
docker compose ps
docker compose logs --no-color web | tail -n 200
curl -sS -o /dev/null -w "%{http_code}\n" http://localhost:8000/health || true
```

---

## Entregable (PR)
- **Título:** `fix(docker): instalar y usar gunicorn; build autosuficiente con Poetry export`
- **Descripción (incluye checklist):**
  - [x] Añadido `gunicorn` y `uvicorn[standard]` a dependencias
  - [x] Dockerfile multi-stage con export de `requirements.txt` en build
  - [x] `command` usa `python -m gunicorn` para evitar PATH issues
  - [x] Healthcheck en Compose y endpoint `/health` mínimo
  - [x] `.dockerignore` actualizado
  - [x] Makefile con `check-bins`
  - **Pruebas locales:** adjunta salida de los comandos de validación

**Commit message único:**
```
fix(docker): add gunicorn & self-contained build; compose runs python -m gunicorn; healthcheck

- Ensure gunicorn present and on PATH
- Poetry export to requirements inside image (multi-stage)
- Safe command via python -m gunicorn
- Healthcheck + optional /health endpoint
- .dockerignore & Makefile helpers
```
