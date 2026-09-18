# 🛠️ Prompt: Auto-crear script de dependencias del sistema y actualizar `scripts/install.sh` para ejecutarlo primero

Eres un **ingeniero DevOps senior**. En el repo `dgii_encf` debes:
1) **Crear un archivo** `scripts/system_deps.sh` con **todas las dependencias del sistema** necesarias para compilar y correr el proyecto (Ubuntu/Debian por defecto; si detectas otras distros/macOS añade ramas).
2) **Crear un archivo** `scripts/python_deps.txt` con la lista de **dependencias de Python** mínimas (para *fallback* sin Poetry).
3) **Modificar** `scripts/install.sh` para que **ejecute `scripts/system_deps.sh` antes** de intentar instalar herramientas y dependencias del proyecto, resolviendo el error PEP 668 (entornos gestionados externamente). Debe usar **pipx** para instalar **Poetry** (evitar `pip install poetry` en sistema) y tener *fallback* a `venv + pip -r scripts/python_deps.txt` si no hay `pyproject.toml` o si el usuario prefiere no usar Poetry.

### Requisitos
- Scripts Bash con `#!/usr/bin/env bash` y `set -Eeuo pipefail`.
- Idempotentes: no deben fallar si ya se ejecutaron.
- Comentar cada paso brevemente.
- No uses `--break-system-packages`.
- Añadir `pipx ensurepath` y exportar `~/.local/bin` al `PATH` durante la ejecución para no requerir reinicio de la shell.
- Detectar Ubuntu/Debian leyendo `/etc/os-release` (por defecto). Si es otra distro, imprimir aviso y sugerir paquetes equivalentes.
- Para Ubuntu/Debian instalar (si faltan): `python3-full`, `python3-venv`, `python3-pip`, `pipx`, `build-essential`, `libxml2-dev`, `libxslt1-dev`, `libffi-dev`, `libssl-dev`, `pkg-config`, `git`, `curl`, `ca-certificates`, `openssl`.
- Usar `pipx install poetry` (o `pipx upgrade poetry` si ya existe).
- Crear y usar entorno virtual **solo si** no se usa Poetry: `.venv` con `python3 -m venv .venv` y `pip install -r scripts/python_deps.txt`.
- Al final, mostrar un **resumen** de versiones: `python --version`, `poetry --version` (si aplica), `pipx --version`.
- Salida **solo archivos** completos, sin explicaciones, usando el formato:
  ```
  # FILE: <ruta/archivo>
  <contenido>
  ```

---

## Archivos a generar/modificar

### 1) `scripts/system_deps.sh`
- Objetivo: instalar dependencias del sistema. Debe:
  - Pedir privilegios `sudo` si es necesario (`sudo -v`).
  - Detectar Ubuntu/Debian y correr `apt-get update` + `apt-get install -y` solo de lo faltante.
  - Añadir `pipx ensurepath` y exportar `~/.local/bin` al `PATH`.
  - Ser seguro para re-ejecución (idempotente).

**Contenido esperado (guía):**
- Función `have_cmd()` para chequear comandos.
- Función `apt_install_if_missing()` que chequea paquetes y los instala si faltan.
- Bloques condicionales por distro (mínimo Ubuntu/Debian).

### 2) `scripts/python_deps.txt`
- Listado simple, una dependencia por línea, pensado como *fallback* si no se usa Poetry. Incluye (ajusta según el repo si ya existe `pyproject.toml`):
  - `fastapi`
  - `uvicorn`
  - `sqlalchemy`
  - `alembic`
  - `lxml`
  - `defusedxml`
  - `signxml`
  - `cryptography`
  - `httpx`
  - `tenacity`
  - `structlog`
  - `python-json-logger`
  - `slowapi`
  - `pydantic>=2`
  - `pytest`
  - `pytest-asyncio`

### 3) `scripts/install.sh` (reemplazo completo)
- Debe ejecutar **primero** `scripts/system_deps.sh`.
- Solucionar el problema PEP 668:
  - **NO** `pip install poetry` en sistema.
  - Usar `pipx` para instalar/actualizar `poetry`.
  - Exportar `~/.local/bin` a `PATH` en runtime.
- Si hay `pyproject.toml`: `poetry install --no-interaction --no-ansi`.
- Si no hay `pyproject.toml` o el usuario exporta `USE_PIP_FALLBACK=1`: crear `.venv` y `pip install -r scripts/python_deps.txt`.
- Imprimir resumen final.

---

## 📤 Entrega (sin explicaciones, solo archivos)

Entrega exactamente estos tres bloques:

```bash
# FILE: scripts/system_deps.sh
#!/usr/bin/env bash
set -Eeuo pipefail

# --- utilidades ---
have_cmd() { command -v "$1" &>/dev/null; }
need_sudo() { [ "$(id -u)" -ne 0 ]; }

log() { printf "\033[1;34m[deps]\033[0m %s\n" "$*"; }
warn() { printf "\033[1;33m[warn]\033[0m %s\n" "$*"; }
err() { printf "\033[1;31m[err]\033[0m %s\n" "$*"; }

if need_sudo; then
  if have_cmd sudo; then
    sudo -v || { err "Se requieren permisos sudo."; exit 1; }
  else
    err "Instala sudo o ejecuta como root."; exit 1
  fi
fi

# --- detectar distro ---
OS_ID=""
OS_LIKE=""
if [ -f /etc/os-release ]; then
  # shellcheck disable=SC1091
  . /etc/os-release
  OS_ID="${ID:-}"
  OS_LIKE="${ID_LIKE:-}"
fi

is_debian_like() {
  [[ "$OS_ID" == "debian" || "$OS_ID" == "ubuntu" ]] || [[ "$OS_LIKE" == *"debian"* ]]
}

apt_install_if_missing() {
  local pkg="$1"
  dpkg -s "$pkg" &>/dev/null || sudo apt-get install -y "$pkg"
}

if is_debian_like; then
  log "Detectado Ubuntu/Debian. Instalando dependencias del sistema…"
  sudo apt-get update -y

  for pkg in ca-certificates curl git openssl pkg-config build-essential \
             libxml2-dev libxslt1-dev libffi-dev libssl-dev \
             python3-full python3-venv python3-pip pipx; do
    apt_install_if_missing "$pkg"
  done

  # Asegurar pipx en PATH en esta sesión
  if ! have_cmd pipx; then
    err "pipx no quedó disponible. Revisa instalación."
    exit 1
  fi
  pipx ensurepath || true
  export PATH="$HOME/.local/bin:$PATH"

else
  warn "Distro no detectada como Debian/Ubuntu."
  warn "Instala manualmente los equivalentes a: python3-full python3-venv python3-pip pipx build-essential libxml2-dev libxslt1-dev libffi-dev libssl-dev pkg-config git curl ca-certificates openssl"
fi

log "Dependencias del sistema listas."
```

```text
# FILE: scripts/python_deps.txt
fastapi
uvicorn
sqlalchemy
alembic
lxml
defusedxml
signxml
cryptography
httpx
tenacity
structlog
python-json-logger
slowapi
pydantic>=2
pytest
pytest-asyncio
```

```bash
# FILE: scripts/install.sh
#!/usr/bin/env bash
set -Eeuo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

log() { printf "\033[1;36m[install]\033[0m %s\n" "$*"; }
err() { printf "\033[1;31m[err]\033[0m %s\n" "$*"; }

log "==> Preparando dependencias del sistema"
if [ -f "scripts/system_deps.sh" ]; then
  bash scripts/system_deps.sh
else
  err "scripts/system_deps.sh no existe. Aborta."; exit 1
fi

# Asegurar PATH a pipx en esta sesión
export PATH="$HOME/.local/bin:$PATH"

# ---- Poetry via pipx (evita PEP 668) ----
if ! command -v pipx &>/dev/null; then
  err "pipx no disponible tras system_deps.sh"; exit 1
fi
pipx ensurepath || true
export PATH="$HOME/.local/bin:$PATH"

if command -v poetry &>/dev/null; then
  log "Poetry encontrado. Actualizando…"
  pipx upgrade poetry || true
else
  log "Instalando Poetry con pipx…"
  pipx install poetry
fi

USE_PIP_FALLBACK="${USE_PIP_FALLBACK:-0}"

if [ -f "pyproject.toml" ] && [ "$USE_PIP_FALLBACK" != "1" ]; then
  log "==> Instalando dependencias con Poetry"
  poetry --version || { err "Poetry no disponible"; exit 1; }
  poetry install --no-interaction --no-ansi
else
  log "==> Modo fallback: venv + pip"
  if ! command -v python3 &>/dev/null; then
    err "python3 no encontrado"; exit 1
  fi
  python3 -m venv .venv
  # shellcheck disable=SC1091
  source .venv/bin/activate
  python -m pip install --upgrade pip
  if [ -f "scripts/python_deps.txt" ]; then
    python -m pip install -r scripts/python_deps.txt
  else
    err "scripts/python_deps.txt no existe"; exit 1
  fi
fi

# ---- Resumen ----
PYV="$(python3 --version 2>/dev/null || true)"
POEV="$(poetry --version 2>/dev/null || true)"
PXV="$(pipx --version 2>/dev/null || true)"
log "Listo. Versiones -> $PYV | $POEV | pipx $PXV"
log "Puedes iniciar con: poetry run uvicorn app.main:app --reload (o activar .venv en modo fallback)"
```

> Entrega **solo** los tres bloques anteriores, con el contenido completo.
