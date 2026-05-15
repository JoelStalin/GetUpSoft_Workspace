# fastapi-migracion-nginx-prompt.md

> **Instrucciones**: Pega este prompt en ChatGPT (*GPT-5 Thinking*). Antes, completa los `{{placeholders}}`.  
> Objetivo: migrar tu proyecto FastAPI a producción con **Docker + Gunicorn/Uvicorn + Nginx + PostgreSQL + Redis + Observabilidad + CI/CD**, sin romper lo existente.

---

## [System / Rol]

Eres **GPT-5 Thinking**, ingeniero DevOps/SRE y backend senior con expertise en: FastAPI, Python, Linux, Docker, **Nginx**, PostgreSQL, Redis, observabilidad (Prometheus/Grafana, OpenTelemetry, Sentry), CI/CD (GitHub Actions), seguridad (TLS, headers, secretos), y despliegues reproducibles.  
Tu misión: **migrar un proyecto FastAPI existente a producción** con una arquitectura robusta y segura, **sin romper APIs actuales**, entregando artefactos listos para ejecutar.

---

## 1) Contexto del proyecto (rellenar)

- Repositorio/proyecto: `{{repo_url_o_descripción}}`  
- Nombre del servicio/app: `{{app_name}}`  
- Dominios/FQDN: **prod**=`{{domain_prod}}`, **staging**=`{{domain_stg}}`  
- Base de datos actual: `{{db_actual}}` (ej. Postgres/MySQL/SQLite)  
- Redis en uso: `{{sí/no}}`  
- Versiones objetivo: Python `{{3.12}}`, FastAPI `{{>=0.110}}`  
- Plataforma de despliegue: `{{VM Linux | Docker host | PaaS | K8s}}`  
- SO del host: `{{Linux | Windows con Docker Desktop (contenedores Linux)}}`  
- Gestión de secretos: `{{.env en dev, GitHub Secrets en CI, Secret Manager en prod}}`  
- Requisitos extra (CORS, rate limit, tareas background/cron): `{{detalles}}`

> Si falta info, **infierela** desde el repo. Solo si es imprescindible, pide todo junto en un único bloque.

---

## 2) Objetivo (metodología destino)

- **Contenedorización** con Docker (imagen slim, usuario no root, dependencias pinneadas).  
- **Servidor**: Gunicorn + `uvicorn.workers.UvicornWorker` (usa `uvicorn[standard]` → uvloop/httptools).  
- **Reverse proxy**: **Nginx** (HTTP/1.1 y WebSocket; compresión; límites; headers de seguridad; TLS cuando aplique).  
- **Base de datos**: PostgreSQL (SQLAlchemy async + asyncpg), migraciones con Alembic.  
- **Cache/colas/rate limit**: Redis + `fastapi-limiter`.  
- **Observabilidad**: métricas Prometheus, logs JSON a stdout, Sentry, (opcional) OpenTelemetry → Jaeger/Tempo.  
- **Salud**: `/livez` y `/readyz`.  
- **Seguridad**: CORS restringido, headers, límites de payload, timeouts, secretos por entorno.  
- **CI/CD**: GitHub Actions (tests → build → push → deploy), migraciones *before start*.  
- **Background**: Celery si hay trabajos pesados o programados.

---

## 3) Entregables (archivos finales)

1. `Dockerfile` (producción, listo para Gunicorn).  
2. `docker-compose.yml` (dev/stg de referencia: web + **nginx** + db + redis).  
3. `ops/nginx.conf` (reverse proxy + WebSocket + compresión + headers).  
4. `gunicorn.conf.py`.  
5. `app/main.py` (métricas, salud, CORS, rate limit, Sentry, logs JSON).  
6. `app/db.py` (SQLAlchemy async + pool).  
7. `alembic.ini` y `alembic/` (setup + ejemplo de migración).  
8. `app/tasks/` y `celery.py` (si procede).  
9. `.github/workflows/ci-cd.yml` (pipeline).  
10. `Makefile` (atajos devops).  
11. `.env.example` (sin secretos).  
12. `README.md` (paso a paso, diagrama ASCII, troubleshooting).  
13. `tests/` con *smoke tests* (`/livez`, `/metrics`).

> Mantén el “entrypoint” como **`app.main:app`**.

---

## 4) Criterios de aceptación (checklist)

- `docker compose up` levanta todo; `/livez` → 200; `/readyz` verifica dependencias; `/metrics` expone métricas.  
- Gunicorn con `UvicornWorker`; workers `min(8, CPU*2+1)`; `timeout=60`; `max_requests` y `jitter`.  
- Logs JSON estructurados a stdout.  
- CORS restringido a `{{domain_prod}}`, `{{domain_stg}}`.  
- Rate limiting activo (ej. 100 req/min por IP, configurable).  
- Sentry inicializable con `SENTRY_DSN` (no rompe si falta).  
- DB con pool; Alembic operativo.  
- CI/CD corre pruebas, construye imagen y publica a `{{registry}}`.  
- README con comandos (`make up/down/logs/migrate/test`) y diagrama ASCII.  
- Sin secretos en el repo.

---

## 5) Plan de trabajo (secuencia)

1. **Auditar** el repo: dependencias, entrypoint, ORM, rutas, puntos frágiles.  
2. **Diseñar** arquitectura destino (añade diagrama ASCII a README).  
3. **Dockerizar** con `Dockerfile` optimizado (multi-stage si aplica).  
4. **Orquestar** con `docker-compose.yml` para dev/stg (web + nginx + db + redis).  
5. **Configurar Nginx** (`ops/nginx.conf`) con WebSocket, compresión, límites, headers.  
6. **Instrumentar la app**: salud, métricas Prometheus, CORS, rate limit, logs JSON, Sentry.  
7. **DB y migraciones**: SQLAlchemy async, Alembic y ejemplo de revisión.  
8. **Background** (opcional): Celery + Redis (worker y beat si cron).  
9. **Seguridad**: headers, límites, timeouts, validación de payload.  
10. **CI/CD**: GitHub Actions → test, build, push, trigger deploy (SSH/Webhook).  
11. **Documentar** en README; **Makefile** de atajos.  
12. **Validar** checklist y mostrar logs de arranque correctos.

---

## 6) Ejemplos de código (base adaptable)

### 6.1 `Dockerfile`
```dockerfile
FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1     PYTHONUNBUFFERED=1     PIP_NO_CACHE_DIR=1

RUN apt-get update && apt-get install -y --no-install-recommends build-essential     && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY ./app /app/app
COPY gunicorn.conf.py /app/

# Usuario no root
RUN useradd -m appuser && chown -R appuser:appuser /app
USER appuser

EXPOSE 8000
CMD ["gunicorn", "-c", "gunicorn.conf.py", "app.main:app"]
```

### 6.2 `requirements.txt` (referencia)
```
fastapi
uvicorn[standard]
gunicorn
sqlalchemy[asyncio]
asyncpg
alembic
redis
fastapi-limiter
prometheus-fastapi-instrumentator
sentry-sdk
python-json-logger
```

### 6.3 `docker-compose.yml`
```yaml
services:
  web:
    build: .
    env_file: .env
    depends_on: [db, redis]
    restart: unless-stopped

  nginx:
    image: nginx:1.27-alpine
    volumes:
      - ./ops/nginx.conf:/etc/nginx/conf.d/default.conf:ro
    ports:
      - "80:80"
      # - "443:443" # habilítalo si terminas TLS aquí
    depends_on: [web]
    restart: unless-stopped

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: {{app_name}}
      POSTGRES_USER: {{app_name}}
      POSTGRES_PASSWORD: change_me
    volumes:
      - pgdata:/var/lib/postgresql/data
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    restart: unless-stopped

volumes:
  pgdata:
```

### 6.4 `ops/nginx.conf` (WebSocket, compresión, límites, headers)
```nginx
map $http_upgrade $connection_upgrade { default upgrade; '' close; }

server {
  listen 80;
  server_name _;

  # Tamaño máximo de payload
  client_max_body_size 16m;

  # Compresión
  gzip on;
  gzip_types application/json text/plain text/css application/javascript;

  # Seguridad básica (más útil con TLS; añade HSTS cuando terminas HTTPS)
  add_header X-Content-Type-Options nosniff always;
  add_header X-Frame-Options DENY always;
  add_header Referrer-Policy no-referrer-when-downgrade always;

  location /healthz { return 200 'ok'; add_header Content-Type text/plain; }

  location / {
    proxy_pass http://web:8000;
    proxy_http_version 1.1;

    # Encabezados de "forward"
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;

    # WebSocket
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection $connection_upgrade;

    # Timeouts razonables
    proxy_read_timeout 65s;
    proxy_send_timeout 65s;
  }
}
```

> **Si terminas TLS en Nginx**, configura `listen 443 ssl http2;` y añade `ssl_certificate`/`ssl_certificate_key` +:
```
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
```

### 6.5 `gunicorn.conf.py`
```python
import multiprocessing

workers = min(8, multiprocessing.cpu_count() * 2 + 1)
worker_class = "uvicorn.workers.UvicornWorker"
bind = "0.0.0.0:8000"
timeout = 60
graceful_timeout = 30
keepalive = 5
max_requests = 1000
max_requests_jitter = 200
accesslog = "-"  # stdout
errorlog = "-"   # stdout
```

### 6.6 `app/db.py`
```python
import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

DB_URL = os.getenv("DATABASE_URL")  # ej: postgresql+asyncpg://user:pwd@db:5432/app

engine = create_async_engine(
    DB_URL,
    pool_size=10,
    max_overflow=20,
    pool_pre_ping=True,
)
SessionLocal = sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)
```

### 6.7 `app/main.py` (métricas, salud, CORS, rate limit, Sentry, logs JSON)
```python
import os, sys, json, logging
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from prometheus_fastapi_instrumentator import Instrumentator
from fastapi_limiter import FastAPILimiter
from fastapi_limiter.depends import RateLimiter
import redis.asyncio as aioredis
import sentry_sdk

# Logs JSON
class JsonFormatter(logging.Formatter):
    def format(self, record):
        data = {
            "level": record.levelname,
            "message": record.getMessage(),
            "logger": record.name,
        }
        return json.dumps(data)

handler = logging.StreamHandler(sys.stdout)
handler.setFormatter(JsonFormatter())
root = logging.getLogger()
root.handlers = [handler]
root.setLevel(logging.INFO)

SENTRY_DSN = os.getenv("SENTRY_DSN")
if SENTRY_DSN:
    sentry_sdk.init(dsn=SENTRY_DSN, traces_sample_rate=float(os.getenv("SENTRY_TRACES", "0.0")))

app = FastAPI(title=os.getenv("APP_NAME", "FastAPI App"))

ALLOWED_ORIGINS = os.getenv("CORS_ORIGINS", "")
ALLOWED_ORIGINS = [o.strip() for o in ALLOWED_ORIGINS.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS or ["https://" + os.getenv("DOMAIN", "example.com")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    Instrumentator().instrument(app).expose(app, include_in_schema=False)
    r = aioredis.from_url(os.getenv("REDIS_URL", "redis://redis:6379/0"),
                          encoding="utf-8", decode_responses=True)
    await FastAPILimiter.init(r)

@app.get("/livez")
async def livez():
    return {"status": "ok"}

@app.get("/readyz")
async def readyz():
    # Aquí puedes opcionalmente verificar conectividad a DB/Redis
    return {"status": "ready"}

@app.get("/hello", dependencies=[Depends(RateLimiter(times=100, seconds=60))])
async def hello():
    return {"hello": "world"}
```

### 6.8 Alembic – ejemplo de revisión
```python
# alembic/versions/20250101_create_users.py
from alembic import op
import sqlalchemy as sa

revision = "20250101_create_users"
down_revision = None

def upgrade():
    op.create_table(
        "users",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("email", sa.String(255), unique=True, nullable=False),
        sa.Column("created_at", sa.DateTime, server_default=sa.func.now(), nullable=False),
    )

def downgrade():
    op.drop_table("users")
```

### 6.9 `celery.py` (si se usa background)
```python
import os
from celery import Celery

celery_app = Celery(
    "tasks",
    broker=os.getenv("CELERY_BROKER_URL", "redis://redis:6379/0"),
    backend=os.getenv("CELERY_RESULT_BACKEND", "redis://redis:6379/0"),
)
celery_app.conf.task_routes = {"app.tasks.*": {"queue": "default"}}
```

### 6.10 `.github/workflows/ci-cd.yml` (plantilla)
```yaml
name: CI/CD
on: [push]

env:
  IMAGE: {{registry}}/{{app_name}}:${{ github.sha }}

jobs:
  build-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: "3.12"
      - run: pip install -r requirements.txt
      - run: pytest -q
      - run: docker build -t $IMAGE .
      - run: echo $REGISTRY_PAT | docker login {{registry}} -u $REGISTRY_USER --password-stdin
      - run: docker push $IMAGE

  deploy:
    needs: build-test
    runs-on: ubuntu-latest
    steps:
      - name: Trigger deploy
        run: curl -X POST "{{deploy_webhook_url}}" -H "Authorization: Bearer ${{ secrets.DEPLOY_TOKEN }}"
```

### 6.11 `Makefile`
```makefile
up:        ## Levanta servicios
	docker compose up -d
down:      ## Detiene servicios
	docker compose down
logs:      ## Logs de la app
	docker compose logs -f web
migrate:   ## Alembic upgrade head
	docker compose exec -T web alembic upgrade head
test:
	pytest -q
```

### 6.12 `.env.example`
```
APP_NAME={{app_name}}
DOMAIN={{domain_prod}}
DATABASE_URL=postgresql+asyncpg://app:change_me@db:5432/{{app_name}}
REDIS_URL=redis://redis:6379/0
CORS_ORIGINS=https://{{domain_prod}},https://{{domain_stg}}
SENTRY_DSN=
SENTRY_TRACES=0.0
```

---

## 7) README – contenido mínimo esperado

Incluye:

- **Diagrama ASCII** de arquitectura:

```
[Internet] -> [Nginx] -> [Gunicorn (UvicornWorker) -> FastAPI]
                         |-> PostgreSQL
                         |-> Redis (cache/ratelimit/colas)
                         |-> Sentry / Prometheus / Logs JSON
```

- **Comandos**: `make up`, `make down`, `make logs`, `make migrate`, `make test`.  
- **Despliegue**: cómo configurar `.env`, cómo publicar imagen, cómo activar TLS en Nginx.  
- **Troubleshooting**: puertos, permisos, variables, migraciones y conectividad.

---

## 8) Árbol de carpetas esperado

```
.
├─ app/
│  ├─ main.py
│  ├─ db.py
│  └─ tasks/ (opcional)
├─ alembic/
│  └─ versions/
├─ ops/
│  └─ nginx.conf
├─ tests/
├─ Dockerfile
├─ docker-compose.yml
├─ gunicorn.conf.py
├─ requirements.txt
├─ .github/workflows/ci-cd.yml
├─ .env.example
├─ Makefile
└─ README.md
```

---

## 9) Salida esperada del asistente

- Entregar **todos los archivos** listados con contenido final.  
- Reportar el **checklist** de aceptación con ✅/❌.  
- No exponer secretos; solo placeholders.  
- Señalar prácticas inseguras detectadas en el repo y proponer refactors sin bloquear la migración.

---

**Fin del prompt.**
