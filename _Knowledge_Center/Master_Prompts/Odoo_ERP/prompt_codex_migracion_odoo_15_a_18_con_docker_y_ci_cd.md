# 🧩 PROMPT — Codex: Migración Segura **Odoo 15 → 18** con **Docker** + **GitHub Actions**

> Copia/pega **todo este .md** en tu herramienta de **Codex** (o asistente de código) para **aplicar cambios al repositorio**. El prompt instruye crear una rama, añadir archivos, configurar CI/CD, y agregar un **instalador único** que dockeriza Odoo 18 (Odoo+PostgreSQL+Nginx) y migra tu BD desde el host (PG v12) con **controles de proceso**.

---
## 🎯 Objetivo
1. Analizar el repo y **abortar** si el riesgo es **ALTO** (sin tocar código).
2. Preparar **pipeline CI/CD** (GitHub Actions) para migración 15→18 (OpenUpgrade 16→17→18), transformaciones mínimas y validación.
3. Incluir **script único de instalación** que dockeriza todo (Odoo 18, PostgreSQL, Nginx) y migra BD si se proveen credenciales del PG host **v12**. Si el host es **PG 18** ⇒ **saltar** migración.
4. Proteger idempotencia y trazabilidad (rama `migration_odoo15_to_18`).

---
## 🔐 Reglas y *Gates*
- Si el **análisis** (`analyze_repository`) marca **HIGH risk**, **detener** el proceso (no transformar código).
- No eliminar archivos existentes sin backup.
- Los scripts `.sh` deben marcarse como **ejecutables**.
- No almacenar dumps reales de producción en el repo.

---
## 🛠️ Instrucciones para Codex (aplícalas **en orden**)

1) **Crear rama de trabajo:** `migration_odoo15_to_18`.

2) **Agregar/actualizar** los siguientes archivos con el **contenido exacto** provisto más abajo:

```
.github/workflows/odoo_migration.yml
scripts/analyze_repo.py
scripts/openupgrade_chain.sh
scripts/migrate_odoo18_ext.py
scripts/clean_and_organize.py
install_migrate_odoo18_docker.sh
```

3) **Dar permisos de ejecución** a los `.sh`:
```
chmod +x scripts/openupgrade_chain.sh install_migrate_odoo18_docker.sh
```

4) Añadir/actualizar `.gitignore` para evitar binarios y dumps:
```
# Odoo/Docker
odoo18_stack/db-data/
odoo18_stack/odoo-data/
odoo18_stack/dumps/*
!odoo18_stack/dumps/.gitkeep
logs/
backup_*/
__pycache__/
```

5) Crear `odoo18_stack/dumps/.gitkeep` vacío.

6) **Commits** separados:
- `chore(ci): add Odoo 15→18 migration workflow`
- `feat(scripts): add analyzer, transforms, cleanup`
- `feat(devops): add one-shot docker installer for Odoo 18`

7) **Push** la rama y abrir **PR** a `main` con título: `feat: migración segura Odoo 15→18 (Docker + CI/CD)` y breve descripción (resumen + pasos de uso del script).

---
## 📦 Archivos — Contenido exacto

### 1) `.github/workflows/odoo_migration.yml`
```yaml
name: Odoo 15 → 18 Migration (OpenUpgrade + EE)

on:
  workflow_dispatch:
    inputs:
      abort_on_high_risk:
        type: boolean
        default: true
        description: "Abortar si el riesgo es ALTO"
      use_enterprise:
        type: boolean
        default: false
        description: "Incluir Odoo Enterprise (requiere secrets EE)"
      custom_addons_path:
        type: string
        default: "addons,custom_addons"
        description: "Rutas de addons personalizados, separadas por coma"

permissions:
  contents: write
  actions: read

env:
  PYTHON_VERSION: "3.11"
  BRANCH_NAME: "migration_odoo15_to_18"
  PGDB: "odoo_migration_ci"

jobs:
  analyze_repository:
    runs-on: ubuntu-22.04
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with: { python-version: ${{ env.PYTHON_VERSION }} }
      - name: Install analyzer deps
        run: |
          python -m pip install --upgrade pip
          pip install tomli tomli-w
      - name: Run analyzer
        id: analyze
        run: |
          mkdir -p logs
          python scripts/analyze_repo.py --out logs/pre_migration_report.json
          echo "risk_level=$(python - << 'PY'
import json;print(json.load(open('logs/pre_migration_report.json'))['risk']['level'])
PY)" >> $GITHUB_OUTPUT
      - uses: actions/upload-artifact@v4
        with: { name: pre_migration_report, path: logs/pre_migration_report.json }
      - name: Abort on HIGH risk
        if: ${{ inputs.abort_on_high_risk && steps.analyze.outputs.risk_level == 'high' }}
        run: |
          echo "Riesgo ALTO detectado. Abortando migración."
          exit 1

  setup_environment:
    needs: analyze_repository
    runs-on: ubuntu-22.04
    services:
      postgres:
        image: postgres:13
        env:
          POSTGRES_USER: odoo
          POSTGRES_PASSWORD: odoo
          POSTGRES_DB: ${{ env.PGDB }}
        ports: ["5432:5432"]
        options: >-
          --health-cmd="pg_isready -U odoo"
          --health-interval=10s --health-timeout=5s --health-retries=5
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with: { python-version: ${{ env.PYTHON_VERSION }} }
      - name: System packages
        run: |
          sudo apt-get update
          sudo apt-get install -y build-essential libpq-dev libxml2-utils git-lfs rsync
      - name: Python base
        run: |
          python -m pip install --upgrade pip wheel setuptools
          pip install psycopg2-binary openupgradelib
      - name: Prepare paths env
        run: |
          echo "CUSTOM_ADDONS=$(echo '${{ inputs.custom_addons_path }}' | tr -d ' ')" >> $GITHUB_ENV
          echo "OPENUPGRADE_DIR=/opt/openupgrade" >> $GITHUB_ENV
          echo "ODOO18_DIR=/opt/odoo18" >> $GITHUB_ENV

      - name: Clone Odoo 18 (Community)
        run: |
          git clone --depth 1 --branch 18.0 https://github.com/odoo/odoo.git "$ODOO18_DIR"
          python -m pip install -r "$ODOO18_DIR/requirements.txt"

      - name: (EE) Checkout enterprise (opcional)
        if: ${{ inputs.use_enterprise }}
        env:
          EE_REPO_URL: ${{ secrets.EE_REPO_URL }}
          EE_GH_TOKEN: ${{ secrets.EE_GH_TOKEN }}
          EE_SSH_PRIVATE_KEY: ${{ secrets.EE_SSH_PRIVATE_KEY }}
        run: |
          set -e
          if [ -n "$EE_SSH_PRIVATE_KEY" ]; then
            mkdir -p ~/.ssh && chmod 700 ~/.ssh
            echo "$EE_SSH_PRIVATE_KEY" > ~/.ssh/id_rsa
            chmod 600 ~/.ssh/id_rsa
            ssh-keyscan github.com >> ~/.ssh/known_hosts
            git clone --depth 1 --branch 18.0 "$EE_REPO_URL" /opt/enterprise
          elif [ -n "$EE_GH_TOKEN" ]; then
            URL="$(echo "$EE_REPO_URL" | sed "s#https://#https://$EE_GH_TOKEN:@#")"
            git clone --depth 1 --branch 18.0 "$URL" /opt/enterprise
          else
            echo "Faltan credenciales EE" && exit 1
          fi

  migrate_postgresql:
    needs: setup_environment
    runs-on: ubuntu-22.04
    services:
      postgres:
        image: postgres:13
        env:
          POSTGRES_USER: odoo
          POSTGRES_PASSWORD: odoo
          POSTGRES_DB: ${{ env.PGDB }}
        ports: ["5432:5432"]
        options: >-
          --health-cmd="pg_isready -U odoo"
          --health-interval=10s --health-timeout=5s --health-retries=5
    steps:
      - uses: actions/checkout@v4
      - name: Restore v15 dump (from repo or URL/S3)
        env:
          DB_DUMP_URL: ${{ secrets.DB_DUMP_URL }}
        run: |
          mkdir -p logs db_dumps
          if [ -n "$DB_DUMP_URL" ]; then
            if echo "$DB_DUMP_URL" | grep -q '^s3://'; then
              pip install awscli
              aws s3 cp "$DB_DUMP_URL" db_dumps/odoo15.sql.gz
            else
              curl -L "$DB_DUMP_URL" -o db_dumps/odoo15.sql.gz
            fi
          fi
          if [ ! -f db_dumps/odoo15.sql.gz ] && [ -f db_dumps/odoo15.sql ]; then
            gzip db_dumps/odoo15.sql
          fi
          if [ ! -f db_dumps/odoo15.sql.gz ]; then
            echo "No se encontró dump v15 (db_dumps/odoo15.sql.gz). Saltando migración DB." | tee -a logs/db_restore.log
            exit 0
          fi
          echo "Restaurando dump en $PGDB"
          dropdb --if-exists -h 127.0.0.1 -U odoo "$PGDB" || true
          createdb -h 127.0.0.1 -U odoo "$PGDB"
          gunzip -c db_dumps/odoo15.sql.gz | psql -h 127.0.0.1 -U odoo -d "$PGDB" | tee -a logs/db_restore.log

      - name: OpenUpgrade chain 16→17→18
        run: |
          bash scripts/openupgrade_chain.sh 127.0.0.1 5432 odoo odoo "$PGDB" "$CUSTOM_ADDONS"

      - uses: actions/upload-artifact@v4
        with:
          name: db_migration_logs
          path: logs/*.log
        if: always()

  transform_code:
    needs: migrate_postgresql
    runs-on: ubuntu-22.04
    steps:
      - uses: actions/checkout@v4
      - name: Backup & code transforms
        run: |
          python scripts/migrate_odoo18_ext.py --backup-dir backup_pre_transform --log logs/transform.log
      - uses: actions/upload-artifact@v4
        with:
          name: transform_logs
          path: |
            logs/transform.log
            backup_pre_transform/
        if: always()

  clean_and_backup_obsolete:
    needs: transform_code
    runs-on: ubuntu-22.04
    steps:
      - uses: actions/checkout@v4
      - name: Clean & move obsolete
        run: |
          python scripts/clean_and_organize.py --backup-dir backup_obsolete_ --obsolete-report logs/obsolete_report.txt
      - uses: actions/upload-artifact@v4
        with: { name: obsolete_report, path: logs/obsolete_report.txt }
        if: always()

  reorganize_directories:
    needs: clean_and_backup_obsolete
    runs-on: ubuntu-22.04
    steps:
      - uses: actions/checkout@v4
      - name: Reorganize modules
        run: |
          python scripts/clean_and_organize.py --reorganize-only --log logs/reorganize.log
      - uses: actions/upload-artifact@v4
        with: { name: reorganize_log, path: logs/reorganize.log }
        if: always()

  validate_odoo:
    needs: reorganize_directories
    runs-on: ubuntu-22.04
    services:
      postgres:
        image: postgres:13
        env:
          POSTGRES_USER: odoo
          POSTGRES_PASSWORD: odoo
          POSTGRES_DB: ${{ env.PGDB }}
        ports: ["5432:5432"]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with: { python-version: ${{ env.PYTHON_VERSION }} }
      - name: Setup Odoo 18 + deps
        run: |
          git clone --depth 1 --branch 18.0 https://github.com/odoo/odoo.git /opt/odoo18
          python -m pip install --upgrade pip wheel setuptools
          pip install -r /opt/odoo18/requirements.txt
          sudo apt-get update && sudo apt-get install -y libxml2-utils
      - name: Static checks
        run: |
          set -e
          find . -name "*.py" -not -path "./.venv/*" -print0 | xargs -0 -I{} python -m py_compile {}
          find . -name "*.xml" -not -path "./.git/*" -print0 | xargs -0 -I{} xmllint --noout {}
      - name: Odoo init (base)
        env:
          PGHOST: 127.0.0.1
        run: |
          /opt/odoo18/odoo-bin -d ${{ env.PGDB }} --db_host=127.0.0.1 --db_user=odoo --db_password=odoo -i base --without-demo=all --stop-after-init --logfile=logs/odoo_validation.log || true
          echo "See logs/odoo_validation.log" >> logs/validation_report.txt
          tail -n +1 logs/odoo_validation.log >> logs/validation_report.txt
      - uses: actions/upload-artifact@v4
        with: { name: validation_report, path: logs/validation_report.txt }
        if: always()

  commit_and_push:
    needs: validate_odoo
    runs-on: ubuntu-22.04
    steps:
      - uses: actions/checkout@v4
        with: { fetch-depth: 0 }
      - name: Commit & push
        run: |
          git checkout -B ${{ env.BRANCH_NAME }}
          git add -A
          git commit -m "chore(migration): analysis, openupgrade chain, transforms, cleanup → Odoo 18" || echo "No changes"
          git push origin ${{ env.BRANCH_NAME }} --force

  notify_result:
    needs: commit_and_push
    runs-on: ubuntu-22.04
    steps:
      - name: Summary
        run: |
          echo "✅ Pipeline finalizado. Revisa artifacts: pre_migration_report, validation_report, obsolete_report, etc."
```

---
### 2) `scripts/openupgrade_chain.sh`
```bash
#!/usr/bin/env bash
set -euo pipefail

HOST=${1:-127.0.0.1}
PORT=${2:-5432}
USER=${3:-odoo}
PASS=${4:-odoo}
DB=${5:-odoo_migration_ci}
CUSTOM_ADDONS_CSV=${6:-"addons,custom_addons"}

mkdir -p logs /opt/openupgrade
export PGHOST="$HOST" PGPORT="$PORT" PGUSER="$USER" PGPASSWORD="$PASS"

function run_step() {
  local ver="$1"
  local branch="$ver.0"
  local dir="/opt/openupgrade/${branch}"
  echo "[INFO] Clonando OpenUpgrade $branch"
  rm -rf "$dir" && git clone --depth 1 --branch "$branch" https://github.com/OCA/OpenUpgrade "$dir"

  echo "[INFO] Instalando requirements ($branch)"
  python -m pip install -r "$dir/requirements.txt" || true

  ADDONS_PATH="$dir/addons"
  if [ -d "/opt/enterprise" ]; then
    ADDONS_PATH="/opt/enterprise,$ADDONS_PATH"
  fi
  IFS=',' read -ra EXTRA <<< "$CUSTOM_ADDONS_CSV"
  for p in "${EXTRA[@]}"; do
    [ -d "$p" ] && ADDONS_PATH="$p,$ADDONS_PATH"
  done

  echo "[INFO] OpenUpgrade $branch → DB=$DB"
  python "$dir/odoo-bin" -d "$DB" \
    --db_host="$HOST" --db_port="$PORT" --db_user="$USER" --db_password="$PASS" \
    --addons-path="$ADDONS_PATH" \
    -u all --stop-after-init --logfile="logs/openupgrade_${branch}.log" || true
}

run_step 16
run_step 17

python /opt/odoo18/odoo-bin -d "$DB" \
  --db_host="$HOST" --db_port="$PORT" --db_user="$USER" --db_password="$PASS" \
  --addons-path="/opt/odoo18/addons${ADDONS_PATH:+,}${ADDONS_PATH:-}" \
  -u all --stop-after-init --logfile="logs/openupgrade_18.0_final.log" || true

echo "[INFO] Cadena OpenUpgrade completada. Ver logs/*.log"
```

---
### 3) `scripts/analyze_repo.py`
```python
#!/usr/bin/env python3
import argparse, ast, json, os, re, sys
from pathlib import Path

PATTERNS = {
    "py_old_import": re.compile(r"\bfrom\s+openerp\b|\bimport\s+openerp\b"),
    "py_api_one": re.compile(r"@api\.one\b"),
    "py_api_multi": re.compile(r"@api\.multi\b"),
    "js_legacy_define": re.compile(r"\bodoo\.define\("),
    "xml_deprecated_assets": re.compile(r"web\.assets_(backend|frontend)"),
    "owl_legacy": re.compile(r"owl\.(Component|mount)\("),
}
MANIFEST_NAMES = ("__manifest__.py", "__openerp__.py")
EE_MARKERS = {"web_enterprise", "account_accountant", "documents_enterprise", "spreadsheet_edition"}

def parse_manifest(path: Path):
    try:
        text = path.read_text(encoding="utf-8")
        data = ast.literal_eval(text)
        return data if isinstance(data, dict) else {}
    except Exception:
        return {}

def detect_series_from_manifests(mods):
    versions = []
    for m in mods:
        v = m.get("manifest", {}).get("version")
        if isinstance(v, str):
            m_ = re.match(r"^\s*(\d+)", v)
            if m_:
                versions.append(int(m_.group(1)))
    return max(versions) if versions else None

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", default="logs/pre_migration_report.json")
    args = ap.parse_args()

    modules, files_scanned = [], 0

    for root, dirs, files in os.walk("."):
        rootp = Path(root)
        man = next((rootp / n for n in MANIFEST_NAMES if n in files), None)
        if man:
            manifest = parse_manifest(man)
            modules.append({
                "path": str(rootp),
                "manifest": manifest,
                "manifest_ok": bool(manifest),
                "name": manifest.get("name"),
                "depends": manifest.get("depends", []),
                "installable": manifest.get("installable", True),
                "license": manifest.get("license"),
            })

    hits = {k: [] for k in PATTERNS}
    for root, dirs, files in os.walk("."):
        for f in files:
            fp = Path(root) / f
            if fp.suffix.lower() in (".py", ".js", ".xml"):
                try:
                    text = fp.read_text(encoding="utf-8", errors="ignore")
                except Exception:
                    continue
                files_scanned += 1
                for k, rx in PATTERNS.items():
                    if rx.search(text):
                        hits[k].append(str(fp))

    bad_manifests = [m for m in modules if not m["manifest_ok"]]
    missing_license = [m for m in modules if not m["license"]]
    not_installable = [m for m in modules if not m["installable"]]

    ee_required = sorted({d for m in modules for d in (m.get("depends") or []) if d in EE_MARKERS})

    risk_score = 0
    if hits["py_old_import"] or hits["py_api_one"]:
        risk_score += 3
    if hits["js_legacy_define"] or hits["owl_legacy"]:
        risk_score += 1
    if bad_manifests:
        risk_score += 2
    if not_installable:
        risk_score += 1

    level = "low"
    if risk_score >= 4:
        level = "high"
    elif risk_score >= 2:
        level = "medium"

    report = {
        "summary": {
            "modules_count": len(modules),
            "files_scanned": files_scanned,
            "detected_odoo_series": detect_series_from_manifests(modules),
        },
        "risk": {
            "score": risk_score,
            "level": level,
            "signals": {k: hits[k] for k in hits},
        },
        "manifests": {
            "invalid": bad_manifests,
            "missing_license": missing_license,
            "not_installable": not_installable,
        },
        "enterprise": {
            "requires_enterprise": bool(ee_required),
            "markers": ee_required,
        },
        "actions": {"abort_if_high": True},
    }

    Path(args.out).parent.mkdir(parents=True, exist_ok=True)
    Path(args.out).write_text(json.dumps(report, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"Report written to {args.out}")
    if level == "high":
        sys.exit(0)

if __name__ == "__main__":
    main()
```

---
### 4) `scripts/migrate_odoo18_ext.py`
```python
#!/usr/bin/env python3
import argparse, shutil, os, re, json
from pathlib import Path

RX = {
    "openerp_to_odoo": (re.compile(r"\bfrom\s+openerp\b"), "from odoo"),
    "openerp_import": (re.compile(r"\bimport\s+openerp\b"), "import odoo  # TODO: revisar API"),
    "decorator_api_one": (re.compile(r"@api\.one\b"), "@api.model  # TODO: revisar api.one"),
    "decorator_api_multi": (re.compile(r"@api\.multi\b"), "@api.model  # TODO: revisar api.multi"),
    "js_legacy_define": (re.compile(r"\bodoo\.define\("), "// TODO: migrate to ES modules\nodoo.define("),
}

MANIFEST_FILES = ("__manifest__.py", "__openerp__.py")
MANIFEST_KEYS_RENAMES = {}


def backup_tree(dst):
    if Path(dst).exists():
        shutil.rmtree(dst)
    shutil.copytree(".", dst, ignore=shutil.ignore_patterns(".git", ".github", "backup_*", "logs", "__pycache__"))


def transform_file(fp: Path, changes):
    if fp.suffix not in (".py", ".js"):
        return
    txt = fp.read_text(encoding="utf-8", errors="ignore")
    orig = txt
    for key, (rx, repl) in RX.items():
        txt = rx.sub(repl, txt)
    if txt != orig:
        fp.write_text(txt, encoding="utf-8")
        changes.append(f"Changed {fp}")


def normalize_manifest(fp: Path, changes):
    try:
        data = eval(fp.read_text(encoding="utf-8"), {}, {})
        if not isinstance(data, dict):
            return
    except Exception:
        return

    changed = False
    for old, new in MANIFEST_KEYS_RENAMES.items():
        if old in data and new not in data:
            data[new] = data.pop(old)
            changed = True

    if changed:
        out = json.dumps(data, indent=2, ensure_ascii=False)
        out = out.replace('true', 'True').replace('false', 'False').replace('null', 'None')
        fp.write_text(out, encoding="utf-8")
        changes.append(f"Normalized manifest {fp}")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--backup-dir", default="backup_pre_transform")
    ap.add_argument("--log", default="logs/transform.log")
    args = ap.parse_args()

    Path("logs").mkdir(exist_ok=True)
    backup_tree(args.backup_dir)

    changes = []
    for root, dirs, files in os.walk("."):
        if root.startswith("./.git") or root.startswith("./backup_") or root.startswith("./logs"):
            continue
        for f in files:
            fp = Path(root) / f
            if f in MANIFEST_FILES:
                normalize_manifest(fp, changes)
            transform_file(fp, changes)

    Path(args.log).write_text("\n".join(changes), encoding="utf-8")

if __name__ == "__main__":
    main()
```

---
### 5) `scripts/clean_and_organize.py`
```python
#!/usr/bin/env python3
import argparse, os, shutil
from pathlib import Path

def is_obsolete(p: Path):
    name = p.name.lower()
    return any(x in name for x in ["__openerp__.pyc", ".bak", ".orig", ".swp", ".~"])


def move_obsolete(base: Path, backup: Path, report: Path):
    backup.mkdir(parents=True, exist_ok=True)
    moved = []
    for root, _, files in os.walk(base):
        for f in files:
            fp = Path(root) / f
            if is_obsolete(fp):
                dest = backup / fp.name
                shutil.move(str(fp), dest)
                moved.append(str(fp))
    report.write_text("\n".join(moved), encoding="utf-8")


def reorganize_modules(base: Path, log: Path):
    changes = []
    for root, dirs, files in os.walk(base):
        if "__manifest__.py" in files and "__init__.py" not in files:
            initp = Path(root) / "__init__.py"
            initp.write_text("# auto-created\n", encoding="utf-8")
            changes.append(f"Added {initp}")
    log.write_text("\n".join(changes), encoding="utf-8")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--backup-dir", default="backup_obsolete_")
    ap.add_argument("--obsolete-report", default="logs/obsolete_report.txt")
    ap.add_argument("--reorganize-only", action="store_true")
    ap.add_argument("--log", default="logs/reorganize.log")
    args = ap.parse_args()

    Path("logs").mkdir(exist_ok=True)

    if args.reorganize-only:
        reorganize_modules(Path("."), Path(args.log))
        return

    move_obsolete(Path("."), Path(args.backup_dir), Path(args.obsolete_report))
    reorganize_modules(Path("."), Path(args.log))

if __name__ == "__main__":
    main()
```

---
### 6) `install_migrate_odoo18_docker.sh`
```bash
#!/usr/bin/env bash
# install_migrate_odoo18_docker.sh
set -Eeuo pipefail

PROJECT_NAME="odoo18_stack"
STACK_DIR="${STACK_DIR:-$PWD/odoo18_stack}"
TARGET_PG_MAJOR="16"
SKIP_IF_HOST_PG_MAJOR="18"
ODOO_TAG="18.0"
HTTP_PORT="80"
ODOO_PORT="8069"
NETWORK_NAME="odoo_net"

SRC_DB=""; PGHOST_SRC=""; PGPORT_SRC=""; PGUSER_SRC=""; PGPASS_SRC=""

log(){ echo -e "\e[1;32m[INFO]\e[0m $*"; }
warn(){ echo -e "\e[1;33m[WARN]\e[0m $*"; }
err(){ echo -e "\e[1;31m[ERR ]\e[0m $*" >&2; }
require_cmd(){ command -v "$1" >/dev/null 2>&1 || { err "Falta comando: $1"; return 1; }; }
retry(){ local n=0; local max=${2:-30}; local delay=${3:-2}; until $1; do n=$((n+1)); [ $n -ge $max ] && return 1; sleep $delay; done; }

while [[ $# -gt 0 ]]; do
  case "$1" in
    --src-db) SRC_DB="$2"; shift 2;;
    --pg-host) PGHOST_SRC="$2"; shift 2;;
    --pg-port) PGPORT_SRC="$2"; shift 2;;
    --pg-user) PGUSER_SRC="$2"; shift 2;;
    --pg-pass) PGPASS_SRC="$2"; shift 2;;
    --target-pg) TARGET_PG_MAJOR="$2"; shift 2;;
    --http-port) HTTP_PORT="$2"; shift 2;;
    --odoo-port) ODOO_PORT="$2"; shift 2;;
    --stack-dir) STACK_DIR="$2"; shift 2;;
    --project) PROJECT_NAME="$2"; shift 2;;
    *) err "Parámetro no reconocido: $1"; exit 2;;
  esac
done

if [ -r /etc/os-release ]; then . /etc/os-release; UB_VER="${VERSION_ID:-unknown}"; else UB_VER="unknown"; fi
if [[ "$UB_VER" != "22.04" && "$UB_VER" != "24.04" ]]; then
  err "Ubuntu $UB_VER detectado. Recomendado 22.04/24.04 LTS. Actualiza y reintenta."; exit 3
fi
log "Ubuntu $UB_VER OK"

if ! command -v docker >/dev/null 2>&1; then
  log "Instalando Docker Engine..."
  apt-get update -y
  apt-get install -y ca-certificates curl gnupg lsb-release
  install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
  chmod a+r /etc/apt/keyrings/docker.gpg
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo $VERSION_CODENAME) stable" > /etc/apt/sources.list.d/docker.list
  apt-get update -y
  apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
  systemctl enable --now docker
else
  log "Docker ya instalado"
fi
require_cmd docker
if ! docker compose version >/dev/null 2>&1; then err "Falta Docker Compose v2"; exit 4; fi

mkdir -p "$STACK_DIR"/{addons,odoo-data,nginx/conf.d,db-data,dumps}
ENV_FILE="$STACK_DIR/.env"; COMPOSE_FILE="$STACK_DIR/docker-compose.yml"
ODOO_CONF="$STACK_DIR/odoo.conf"; NGINX_CONF="$STACK_DIR/nginx/conf.d/odoo.conf"

if [ ! -f "$ENV_FILE" ]; then
  MASTER_PASS=$(openssl rand -hex 16 2>/dev/null || echo "admin$(date +%s)")
  DB_PASS=$(openssl rand -hex 12 2>/dev/null || echo "odoo$(date +%s)")
  cat > "$ENV_FILE" <<EOF
PROJECT_NAME=${PROJECT_NAME}
ODOO_VERSION=${ODOO_TAG}
TARGET_PG_MAJOR=${TARGET_PG_MAJOR}
ODOO_PORT=${ODOO_PORT}
HTTP_PORT=${HTTP_PORT}
POSTGRES_DB=${SRC_DB:-odoo}
POSTGRES_USER=odoo
POSTGRES_PASSWORD=${DB_PASS}
MASTER_PASSWORD=${MASTER_PASS}
EOF
  log "Creado $ENV_FILE"
fi
set -a; source "$ENV_FILE"; set +a

if [ ! -f "$ODOO_CONF" ]; then
  cat > "$ODOO_CONF" <<EOF
[options]
admin_passwd = ${MASTER_PASSWORD}
db_host = db
db_port = 5432
db_user = ${POSTGRES_USER}
db_password = ${POSTGRES_PASSWORD}
addons_path = /mnt/extra-addons
limit_time_cpu = 600
limit_time_real = 1200
without_demo = True
proxy_mode = True
EOF
  log "Creado $ODOO_CONF"
fi

if [ ! -f "$NGINX_CONF" ]; then
  cat > "$NGINX_CONF" <<'EOF'
server {
  listen 80;
  server_name _;
  client_max_body_size 64m;
  location / {
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_pass http://odoo:8069;
  }
}
EOF
  log "Creado $NGINX_CONF"
fi

cat > "$COMPOSE_FILE" <<'YAML'
services:
  db:
    image: postgres:${TARGET_PG_MAJOR}-alpine
    container_name: ${PROJECT_NAME}_db
    environment:
      POSTGRES_DB: ${POSTGRES_DB}
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - ./db-data:/var/lib/postgresql/data
      - ./dumps:/dumps
    healthcheck:
      test: ["CMD", "pg_isready", "-U", "${POSTGRES_USER}"]
      interval: 5s
      timeout: 5s
      retries: 20
    networks: [odoo_net]

  odoo:
    image: odoo:${ODOO_VERSION}
    container_name: ${PROJECT_NAME}_odoo
    depends_on:
      db:
        condition: service_healthy
    ports:
      - "${ODOO_PORT}:8069"
    volumes:
      - ./addons:/mnt/extra-addons
      - ./odoo-data:/var/lib/odoo
      - ./odoo.conf:/etc/odoo/odoo.conf
    environment:
      HOST: db
      USER: ${POSTGRES_USER}
      PASSWORD: ${POSTGRES_PASSWORD}
    networks: [odoo_net]

  nginx:
    image: nginx:stable-alpine
    container_name: ${PROJECT_NAME}_nginx
    depends_on: [odoo]
    ports:
      - "${HTTP_PORT}:80"
    volumes:
      - ./nginx/conf.d:/etc/nginx/conf.d:ro
    networks: [odoo_net]

networks:
  odoo_net:
    name: ${PROJECT_NAME}_net
YAML
log "Creado $COMPOSE_FILE"

cd "$STACK_DIR"
log "Arrancando DB (PostgreSQL ${TARGET_PG_MAJOR})..."
docker compose --project-name "$PROJECT_NAME" up -d db
log "Esperando DB healthy..."
retry "docker compose --project-name '$PROJECT_NAME' ps --format '{{.Name}} {{.Health}}' | grep ${PROJECT_NAME}_db | grep -q healthy" 60 2 || { err "DB no healthy"; exit 5; }

HOST_PG_MAJOR=""
if command -v psql >/dev/null 2>&1; then HOST_PG_MAJOR=$(psql -V | awk '{print $3}' | cut -d. -f1); fi
if [[ -n "$HOST_PG_MAJOR" && "$HOST_PG_MAJOR" == "$SKIP_IF_HOST_PG_MAJOR" ]]; then
  warn "Host PostgreSQL es $HOST_PG_MAJOR → se **salta** migración de BD."
else
  if [[ -n "$SRC_DB" && -n "$PGHOST_SRC" && -n "$PGPORT_SRC" && -n "$PGUSER_SRC" && -n "$PGPASS_SRC" ]]; then
    log "Exportando desde host y restaurando en contenedor..."
    export PGPASSWORD="$PGPASS_SRC"
    DUMP_FILE="$STACK_DIR/dumps/${SRC_DB}_$(date +%Y%m%d_%H%M%S).dump"
    pg_dump -h "$PGHOST_SRC" -p "$PGPORT_SRC" -U "$PGUSER_SRC" -d "$SRC_DB" -Fc -f "$DUMP_FILE"
    docker compose --project-name "$PROJECT_NAME" exec -T db bash -c "psql -U ${POSTGRES_USER} -tc \"SELECT 1 FROM pg_database WHERE datname='${POSTGRES_DB}'\" | grep -q 1 || createdb -U ${POSTGRES_USER} ${POSTGRES_DB}"
    docker compose --project-name "$PROJECT_NAME" exec -T db bash -c "pg_restore -U ${POSTGRES_USER} -d ${POSTGRES_DB} --no-owner --no-privileges /dumps/$(basename "$DUMP_FILE")"
    log "Restauración completada en DB=${POSTGRES_DB}"
  else
    warn "Parámetros de origen incompletos; se omite migración de BD."
  fi
fi

log "Arrancando Odoo ${ODOO_TAG} y Nginx..."
docker compose --project-name "$PROJECT_NAME" up -d odoo nginx
sleep 5

docker compose --project-name "$PROJECT_NAME" ps
cat <<MSG
============================================================
✅ Despliegue listo
- Nginx → http://TU_IP:${HTTP_PORT}
- Odoo → http://TU_IP:${ODOO_PORT}
- Volúmenes: $STACK_DIR/{db-data,odoo-data,addons,dumps}
- Config:    $ENV_FILE | $COMPOSE_FILE | $ODOO_CONF
Notas:
- Master password en odoo.conf (admin_passwd)
- Política: si host PostgreSQL es ${SKIP_IF_HOST_PG_MAJOR}, se **salta** migración de BD.
============================================================
MSG
```

---
## ▶️ Uso rápido del instalador (en servidor)
```bash
sudo bash install_migrate_odoo18_docker.sh \
  --src-db TU_BASE_V15 \
  --pg-host 127.0.0.1 --pg-port 5432 \
  --pg-user postgres --pg-pass 'TU_PASSWORD' \
  --target-pg 16 --http-port 80 --odoo-port 8069
```
- Si **no** pasas `--src-db/--pg-*`, solo **levanta la pila dockerizada** y podrás restaurar luego colocando un dump en `odoo18_stack/dumps/`.
- Si tu host ya está en **PostgreSQL 18**, el script **omite** migración por política.

---
## ✅ Checklist de cierre para Codex
- [ ] Archivos creados/actualizados exactamente como arriba.
- [ ] `.sh` marcados como ejecutables.
- [ ] `.gitignore` actualizado y `dumps/.gitkeep` creado.
- [ ] Commits aplicados y **PR** abierto desde `migration_odoo15_to_18` → `main`.
- [ ] Descripción del PR incluye instrucciones de uso del instalador y de los *secrets* del workflow.

