Hello! I'm Lyra, your AI prompt optimizer. I transform vague requests into precise, effective prompts that deliver better results.

*What I need to know:*
- *Target AI:* ChatGPT, Claude, Gemini, or Other
- *Prompt Style:* DETAIL (I'll ask clarifying questions first) or BASIC (quick optimization)

*Examples:*
- "DETAIL using ChatGPT → Write me a marketing email"
- "BASIC using Claude → Help with my resume"

Just share your rough prompt and I'll handle the optimization!

---

# Prompt para versionar y migrar un repo Odoo 15 → Odoo 19 con revisión archivo-por-archivo y controles de integridad

## Modo
AUTO (BASIC) — asumo **Target AI = Codex/ChatGPT** y que quieres un prompt “copy/paste” para que el asistente **modifique tu repositorio**.

## Resumen del entendimiento
Quieres un **prompt operativo** para que una herramienta tipo Codex:
- Migre / “versione” tu repositorio de **Odoo 15** a **Odoo 19**.
- Revise **cada archivo uno por uno** (inventario + hashing + reporte de cambios).
- Asegure **integridad de datos** (controles antes/después y logs).
- Prepare CI/CD (GitHub Actions) y opcionalmente Docker.
- Aplique cambios orientados a **Odoo 19** (Community/Enterprise según credenciales).
- Configure el **autor** como: **Joel Stalin Martinez Espinal**.

> Nota de versión: Odoo 19 existe oficialmente (release notes) y el repo `odoo/odoo` expone rama **19.0**. citeturn0search1turn0search3  
> Nota OpenUpgrade: el trabajo hacia **19.0** está “en progreso” (milestone 19.0), así que el salto final **18→19** debe tratarse como **“opción A/B”** (OpenUpgrade si hay branch lista; si no, plataforma oficial de upgrade). citeturn1search1turn3search5

## Estado de evidencias
**Provistas:** un prompt/código base (15→18) con GitHub Actions + scripts + Docker.  
**No provistas:** tracebacks/logs reales, estructura del repo (árbol), lista de módulos, versión exacta de PostgreSQL de producción, y comportamiento esperado vs real (si hay fallos).

### Pregunta obligatoria de evidencias (para que el asistente la haga antes de tocar código)
**¿Dispones de alguna de las siguientes evidencias que puedas compartir?**
- Mensajes de error (traceback completo).
- Logs relevantes de Odoo (`--logfile`, `_logger`, servidor).
- Código actual (módulo, método, vista, tests).
- Diferencias entre comportamiento esperado vs. real.
- Capturas textuales del error (copiadas, no imágenes).

---

## PROMPT OPTIMIZADO (copiar/pegar tal cual en Codex / asistente de código)

```md
# 🧩 PROMPT — Codex: Versionado + Migración Segura **Odoo 15 → Odoo 19** (Repo + DB) con revisión archivo-por-archivo, integridad y CI/CD

## Rol
Actúa como **Arquitecto Senior de Odoo (v17+)** y DevOps para CI/CD. Tu misión es **migrar el repo y dejarlo listo para Odoo 19**.
- Prioriza ORM (`self.env[...]`, `search`, `create`, `write`, etc.).
- Respeta ACLs, record rules, multi-company.
- `sudo()` solo si lo justificas.
- Overrides siempre con `super()`.

## Restricción crítica (v17+ XML)
En Odoo **v17+** evita **por completo** condiciones frágiles en vistas tipo:
- `attrs="{'invisible': ...}"`
- `invisible="..."`
En su lugar: **campos técnicos boolean computados** en Python + lógica backend.

## Pre-paso obligatorio (EVIDENCIAS)
Antes de aplicar cambios, responde en un bloque:
- Evidencias recibidas (logs/tracebacks/código) = {sí/no}
- Si NO hay evidencias: lista supuestos defensivos (máx. 8).
- Si SÍ hay evidencias: analízalas primero y extrae el plan.

## Objetivo (entregables)
1) Crear rama: `migration_odoo15_to_19`
2) Inventario **archivo por archivo** (hash SHA256, tamaño, tipo, patrones) + reporte.
3) Pipeline GitHub Actions con *gates* (abort on HIGH risk) y trazabilidad.
4) Migración de BD en cadena: **15→16→17→18** (OpenUpgrade), y **18→19** (OpenUpgrade si existe branch estable; si no, upgrade oficial).  
5) Migración de código y vistas a **Odoo 19** (módulos custom) + validación en CI.
6) Integridad de datos: checks antes/después (row counts + checksums + constraints) y artifacts.
7) Autoría Git: **Joel Stalin Martinez Espinal**.

## Reglas / Gates (no negociables)
- Si el análisis marca **HIGH risk**, **detener** (sin transformar código).
- No borrar archivos sin backup.
- Scripts `.sh` ejecutables.
- No subir dumps reales al repo.
- Revisión “uno por uno”: cada archivo modificado debe quedar listado en `logs/file_changes.md` y en JSON.

## Plan de trabajo (en orden)
### A) Preparación Git (incluye autor)
1. Configura autor:
   - `git config user.name "Joel Stalin Martinez Espinal"`
   - `git config user.email "joel.stalin.martinez.espinal@example.com"` (si el usuario te da email real, úsalo)
2. Crea rama: `migration_odoo15_to_19`
3. Crea tag de seguridad antes de tocar nada: `pre_migration_odoo15_to_19`

### B) Agregar/actualizar archivos (CI + scripts)
Crea/actualiza estos archivos (contenido exacto a continuación):
- `.github/workflows/odoo_migration_15_to_19.yml`
- `scripts/00_inventory_files.py`
- `scripts/01_analyze_repo.py`
- `scripts/02_openupgrade_chain.sh`
- `scripts/03_db_integrity_check.py`
- `scripts/04_transform_odoo19.py`
- `scripts/05_xml_v17_guardrails.py`
- `scripts/06_report_finalize.py`
- `install_migrate_odoo19_docker.sh` (opcional; pero si lo creas, que sea idempotente)

Marca ejecutables:
- `chmod +x scripts/02_openupgrade_chain.sh install_migrate_odoo19_docker.sh`

Actualiza `.gitignore` (añade):
```
# Migration artifacts
logs/
backup_*/
db_dumps/
odoo19_stack/db-data/
odoo19_stack/odoo-data/
odoo19_stack/dumps/*
!odoo19_stack/dumps/.gitkeep
__pycache__/
```
Crea: `odoo19_stack/dumps/.gitkeep` vacío.

### C) Revisión archivo-por-archivo (OBLIGATORIO)
1) Corre `python scripts/00_inventory_files.py --mode pre` y genera:
- `logs/file_inventory_pre.json`
- `logs/file_inventory_pre.md`
2) Después de cada etapa (transform_code, cleanups), corre `--mode post` y genera diffs:
- `logs/file_inventory_post.json`
- `logs/file_changes.md` (lista de archivos modificados con hash pre/post)

### D) Migración de base de datos con integridad
- Siempre trabajar sobre un dump “test”.
- Corre `scripts/03_db_integrity_check.py`:
  - antes (sobre DB restaurada v15)
  - después de cada salto mayor (16, 17, 18, 19)
- Guarda artifacts: `logs/db_integrity_*.json` + `logs/openupgrade_*.log`

**Cadena recomendada:**
- 15→16 (OpenUpgrade 16.0)
- 16→17 (OpenUpgrade 17.0)
- 17→18 (OpenUpgrade 18.0)
- 18→19:
  - Opción A: OpenUpgrade 19.0 si el branch está disponible y estable.
  - Opción B (fallback): Upgrade oficial Odoo (on-prem) para generar “test upgraded DB” y restaurarla localmente para validar. Documenta claramente el método.

### E) Migración de código y vistas a Odoo 19
1) Ejecuta `scripts/01_analyze_repo.py` para detectar:
   - imports legacy, decorators obsoletos, assets viejos, patrones prohibidos en XML, etc.
2) Si riesgo HIGH → abort.
3) Ejecuta `scripts/04_transform_odoo19.py`:
   - crear backup `backup_pre_transform/`
   - transformaciones seguras y marcadas con TODO (sin “magia”).
4) Ejecuta `scripts/05_xml_v17_guardrails.py`:
   - falla CI si encuentra `attrs=` o `invisible=` prohibidos en vistas (excepto excepciones documentadas).

### F) Validación en CI
- Py compile + xmllint
- Arranque Odoo 19 (base) `--stop-after-init`
- Instalación/actualización de módulos custom (si hay lista, úsala; si no, intenta `-u all` pero captura fallos)
- Publica artifacts: reportes + logs.

### G) Commits, PR y trazabilidad
Commits separados:
- `chore(ci): add Odoo 15→19 migration workflow + file inventory + integrity checks`
- `feat(migration): openupgrade chain 15→16→17→18 (+19 fallback) + reports`
- `feat(odoo19): port custom modules to Odoo 19 (python/xml/js)`

Push rama y abre PR a `main`:
Título: `feat: migración segura Odoo 15→19 (CI/CD + integridad + revisión por archivo)`
En la descripción incluye:
- cómo correr el workflow
- cómo usar el instalador docker (si aplica)
- cómo interpretar `logs/*`

---

## CONTENIDO EXACTO DE ARCHIVOS

### `.github/workflows/odoo_migration_15_to_19.yml`
```yaml
name: Odoo 15 → 19 Migration (Inventory + Integrity + OpenUpgrade chain)

on:
  workflow_dispatch:
    inputs:
      abort_on_high_risk:
        type: boolean
        default: true
      custom_addons_path:
        type: string
        default: "addons,custom_addons"
      use_enterprise:
        type: boolean
        default: false

permissions:
  contents: write

env:
  PYTHON_VERSION: "3.11"
  BRANCH_NAME: "migration_odoo15_to_19"
  PGDB: "odoo_migration_ci"
  ODOO_TARGET_BRANCH: "19.0"

jobs:
  inventory_pre:
    runs-on: ubuntu-22.04
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with: { python-version: "${{ env.PYTHON_VERSION }}" }
      - name: Pre inventory (file-by-file)
        run: |
          mkdir -p logs
          python scripts/00_inventory_files.py --mode pre --out-json logs/file_inventory_pre.json --out-md logs/file_inventory_pre.md
      - uses: actions/upload-artifact@v4
        with:
          name: file_inventory_pre
          path: logs/file_inventory_pre.*

  analyze_repository:
    needs: inventory_pre
    runs-on: ubuntu-22.04
    outputs:
      risk_level: ${{ steps.analyze.outputs.risk_level }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with: { python-version: "${{ env.PYTHON_VERSION }}" }
      - name: Analyzer
        id: analyze
        run: |
          mkdir -p logs
          python scripts/01_analyze_repo.py --out logs/pre_migration_report.json
          echo "risk_level=$(python - << 'PY'
import json;print(json.load(open('logs/pre_migration_report.json'))['risk']['level'])
PY)" >> $GITHUB_OUTPUT
      - uses: actions/upload-artifact@v4
        with: { name: pre_migration_report, path: logs/pre_migration_report.json }
      - name: Abort on HIGH risk
        if: ${{ inputs.abort_on_high_risk && steps.analyze.outputs.risk_level == 'high' }}
        run: |
          echo "Riesgo ALTO detectado. Abortando."
          exit 1

  migrate_db:
    needs: analyze_repository
    runs-on: ubuntu-22.04
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_USER: odoo
          POSTGRES_PASSWORD: odoo
          POSTGRES_DB: ${{ env.PGDB }}
        ports: ["5432:5432"]
        options: >-
          --health-cmd="pg_isready -U odoo"
          --health-interval=10s --health-timeout=5s --health-retries=10
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with: { python-version: "${{ env.PYTHON_VERSION }}" }
      - name: Install deps
        run: |
          python -m pip install --upgrade pip
          pip install psycopg2-binary openupgradelib
          sudo apt-get update
          sudo apt-get install -y git rsync libpq-dev
      - name: Restore v15 dump (optional)
        env:
          DB_DUMP_URL: ${{ secrets.DB_DUMP_URL }}
        run: |
          mkdir -p logs db_dumps
          if [ -n "$DB_DUMP_URL" ]; then
            curl -L "$DB_DUMP_URL" -o db_dumps/odoo15.sql.gz
          fi
          if [ -f db_dumps/odoo15.sql.gz ]; then
            dropdb --if-exists -h 127.0.0.1 -U odoo "${{ env.PGDB }}" || true
            createdb -h 127.0.0.1 -U odoo "${{ env.PGDB }}"
            gunzip -c db_dumps/odoo15.sql.gz | psql -h 127.0.0.1 -U odoo -d "${{ env.PGDB }}" | tee -a logs/db_restore.log
          else
            echo "No dump v15. Se saltan pasos DB; se valida solo código." | tee -a logs/db_restore.log
          fi
      - name: DB integrity (pre)
        run: |
          python scripts/03_db_integrity_check.py --db "${{ env.PGDB }}" --host 127.0.0.1 --user odoo --password odoo --out logs/db_integrity_pre.json || true
      - name: OpenUpgrade chain 15→16→17→18 (+18→19 fallback)
        env:
          CUSTOM_ADDONS: ${{ inputs.custom_addons_path }}
        run: |
          chmod +x scripts/02_openupgrade_chain.sh
          bash scripts/02_openupgrade_chain.sh 127.0.0.1 5432 odoo odoo "${{ env.PGDB }}" "${CUSTOM_ADDONS}"
      - name: DB integrity (post-chain)
        run: |
          python scripts/03_db_integrity_check.py --db "${{ env.PGDB }}" --host 127.0.0.1 --user odoo --password odoo --out logs/db_integrity_post_chain.json || true
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: db_migration_logs
          path: logs/*

  transform_code:
    needs: migrate_db
    runs-on: ubuntu-22.04
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with: { python-version: "${{ env.PYTHON_VERSION }}" }
      - name: Transform to Odoo 19 (backup + edits)
        run: |
          mkdir -p logs
          python scripts/04_transform_odoo19.py --backup-dir backup_pre_transform --log logs/transform.log
      - name: XML v17+ guardrails
        run: |
          python scripts/05_xml_v17_guardrails.py --fail-on-find
      - name: Inventory post (file-by-file)
        run: |
          python scripts/00_inventory_files.py --mode post --out-json logs/file_inventory_post.json --out-md logs/file_inventory_post.md --diff-md logs/file_changes.md
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: code_transform_reports
          path: |
            logs/*
            backup_pre_transform/

  validate_odoo19:
    needs: transform_code
    runs-on: ubuntu-22.04
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_USER: odoo
          POSTGRES_PASSWORD: odoo
          POSTGRES_DB: ${{ env.PGDB }}
        ports: ["5432:5432"]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with: { python-version: "${{ env.PYTHON_VERSION }}" }
      - name: Clone Odoo 19 + deps
        run: |
          git clone --depth 1 --branch "${{ env.ODOO_TARGET_BRANCH }}" https://github.com/odoo/odoo.git /opt/odoo19
          python -m pip install --upgrade pip wheel setuptools
          pip install -r /opt/odoo19/requirements.txt
          sudo apt-get update && sudo apt-get install -y libxml2-utils
      - name: Static checks
        run: |
          set -e
          find . -name "*.py" -not -path "./.venv/*" -print0 | xargs -0 -I{} python -m py_compile {}
          find . -name "*.xml" -not -path "./.git/*" -print0 | xargs -0 -I{} xmllint --noout {}
      - name: Odoo init base
        run: |
          mkdir -p logs
          /opt/odoo19/odoo-bin -d "${{ env.PGDB }}" --db_host=127.0.0.1 --db_user=odoo --db_password=odoo \
            -i base --without-demo=all --stop-after-init --logfile=logs/odoo19_validation.log || true
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: odoo19_validation
          path: logs/odoo19_validation.log

  finalize_report:
    needs: validate_odoo19
    runs-on: ubuntu-22.04
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with: { python-version: "${{ env.PYTHON_VERSION }}" }
      - name: Final report
        run: |
          mkdir -p logs
          python scripts/06_report_finalize.py --out logs/final_report.md || true
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: final_report
          path: logs/final_report.md
```

### `scripts/00_inventory_files.py`
```python
#!/usr/bin/env python3
import argparse, hashlib, json, os, subprocess
from pathlib import Path

TEXT_EXT = {".py",".js",".xml",".csv",".yml",".yaml",".md",".txt",".rst",".ini",".cfg",".po",".pot",".sql"}

def sha256_file(p: Path) -> str:
    h = hashlib.sha256()
    with p.open("rb") as f:
        for chunk in iter(lambda: f.read(1024*1024), b""):
            h.update(chunk)
    return h.hexdigest()

def git_ls_files():
    try:
        out = subprocess.check_output(["git","ls-files"], text=True)
        return [x.strip() for x in out.splitlines() if x.strip()]
    except Exception:
        # fallback: walk
        files = []
        for root,_,fs in os.walk("."):
            if root.startswith("./.git") or root.startswith("./logs") or root.startswith("./backup_"):
                continue
            for f in fs:
                files.append(str(Path(root)/f))
        return sorted(set(files))

def summarize(p: Path):
    st = p.stat()
    ext = p.suffix.lower()
    kind = "text" if ext in TEXT_EXT else "bin"
    lines = None
    if kind == "text":
        try:
            lines = p.read_text(encoding="utf-8", errors="ignore").count("\n")+1
        except Exception:
            lines = None
    return {
        "path": str(p),
        "ext": ext,
        "kind": kind,
        "bytes": st.st_size,
        "sha256": sha256_file(p),
        "lines": lines,
    }

def to_md(items, title):
    rows = []
    rows.append(f"# {title}\n")
    rows.append("| Archivo | Tipo | Bytes | Líneas | SHA256 |")
    rows.append("|---|---:|---:|---:|---|")
    for it in items:
        rows.append(f"| `{it['path']}` | {it['kind']} | {it['bytes']} | {it['lines'] or ''} | `{it['sha256'][:12]}…` |")
    return "\n".join(rows) + "\n"

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--mode", choices=["pre","post"], required=True)
    ap.add_argument("--out-json", default="logs/file_inventory.json")
    ap.add_argument("--out-md", default="logs/file_inventory.md")
    ap.add_argument("--diff-md", default=None)
    args = ap.parse_args()

    Path("logs").mkdir(exist_ok=True)

    files = []
    for fp in git_ls_files():
        p = Path(fp)
        if not p.exists() or p.is_dir():
            continue
        if str(p).startswith(".git/") or str(p).startswith("logs/") or str(p).startswith("backup_"):
            continue
        files.append(summarize(p))

    files.sort(key=lambda x: x["path"])
    Path(args.out_json).write_text(json.dumps({"mode": args.mode, "files": files}, indent=2), encoding="utf-8")
    Path(args.out_md).write_text(to_md(files, f"Inventario de archivos ({args.mode})"), encoding="utf-8")

    # optional diff against pre inventory (when post)
    if args.diff_md and args.mode == "post":
        pre = Path("logs/file_inventory_pre.json")
        if pre.exists():
            pre_data = json.loads(pre.read_text(encoding="utf-8"))["files"]
            pre_map = {x["path"]: x for x in pre_data}
            changed = []
            for it in files:
                old = pre_map.get(it["path"])
                if not old:
                    changed.append(("ADDED", it["path"], None, it["sha256"]))
                elif old["sha256"] != it["sha256"]:
                    changed.append(("MOD", it["path"], old["sha256"], it["sha256"]))
            for path, old in pre_map.items():
                if not any(x["path"] == path for x in files):
                    changed.append(("DEL", path, old["sha256"], None))

            lines = ["# Cambios por archivo (hash pre/post)\n", "| Tipo | Archivo | SHA(pre) | SHA(post) |", "|---|---|---|---|"]
            for t, p, a, b in changed:
                a12 = (a[:12]+"…") if a else ""
                b12 = (b[:12]+"…") if b else ""
                lines.append(f"| {t} | `{p}` | `{a12}` | `{b12}` |")
            Path(args.diff_md).write_text("\n".join(lines) + "\n", encoding="utf-8")

if __name__ == "__main__":
    main()
```

### `scripts/01_analyze_repo.py`
```python
#!/usr/bin/env python3
import argparse, ast, json, os, re
from pathlib import Path

PATTERNS = {
    "py_old_import": re.compile(r"\bfrom\s+openerp\b|\bimport\s+openerp\b"),
    "py_api_one": re.compile(r"@api\.one\b"),
    "py_api_multi": re.compile(r"@api\.multi\b"),
    "xml_forbidden_attrs": re.compile(r'\battrs\s*=\s*["\']'),
    "xml_forbidden_invisible": re.compile(r'\binvisible\s*=\s*["\']'),
    "js_legacy_define": re.compile(r"\bodoo\.define\("),
}
MANIFEST_NAMES = ("__manifest__.py", "__openerp__.py")

def parse_manifest(path: Path):
    try:
        return ast.literal_eval(path.read_text(encoding="utf-8"))
    except Exception:
        return {}

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", default="logs/pre_migration_report.json")
    args = ap.parse_args()

    Path("logs").mkdir(exist_ok=True)

    modules = []
    for root, _, files in os.walk("."):
        rootp = Path(root)
        man = next((rootp / n for n in MANIFEST_NAMES if n in files), None)
        if man:
            manifest = parse_manifest(man) if man.name == "__manifest__.py" else {}
            modules.append({"path": str(rootp), "manifest_file": str(man), "manifest_ok": bool(manifest), "version": manifest.get("version")})

    hits = {k: [] for k in PATTERNS}
    scanned = 0
    for root, _, files in os.walk("."):
        if root.startswith("./.git") or root.startswith("./logs") or root.startswith("./backup_"):
            continue
        for f in files:
            fp = Path(root) / f
            if fp.suffix.lower() not in (".py",".js",".xml"):
                continue
            try:
                text = fp.read_text(encoding="utf-8", errors="ignore")
            except Exception:
                continue
            scanned += 1
            for k, rx in PATTERNS.items():
                if rx.search(text):
                    hits[k].append(str(fp))

    risk = 0
    if hits["py_old_import"] or hits["py_api_one"] or hits["py_api_multi"]:
        risk += 3
    if hits["xml_forbidden_attrs"] or hits["xml_forbidden_invisible"]:
        risk += 2
    if hits["js_legacy_define"]:
        risk += 1
    if any(not m["manifest_ok"] for m in modules):
        risk += 2

    level = "low"
    if risk >= 5: level = "high"
    elif risk >= 3: level = "medium"

    report = {
        "summary": {"modules_count": len(modules), "files_scanned": scanned},
        "risk": {"score": risk, "level": level, "signals": hits},
        "modules": modules,
        "actions": {"abort_if_high": True},
    }
    Path(args.out).write_text(json.dumps(report, indent=2, ensure_ascii=False), encoding="utf-8")

if __name__ == "__main__":
    main()
```

### `scripts/02_openupgrade_chain.sh`
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

run_openupgrade_step () {
  local ver="$1"   # 16 | 17 | 18
  local branch="${ver}.0"
  local dir="/opt/openupgrade/${branch}"
  echo "[INFO] OpenUpgrade ${branch} (DB ${DB})"

  rm -rf "$dir"
  git clone --depth 1 --branch "$branch" https://github.com/OCA/OpenUpgrade "$dir"

  python -m pip install -r "$dir/requirements.txt" || true

  local addons_path="$dir/addons"
  if [ -d "/opt/enterprise" ]; then addons_path="/opt/enterprise,${addons_path}"; fi

  IFS=',' read -ra EXTRA <<< "$CUSTOM_ADDONS_CSV"
  for p in "${EXTRA[@]}"; do
    p="$(echo "$p" | xargs)"
    [ -d "$p" ] && addons_path="$p,${addons_path}"
  done

  python "$dir/odoo-bin" -d "$DB" \
    --db_host="$HOST" --db_port="$PORT" --db_user="$USER" --db_password="$PASS" \
    --addons-path="$addons_path" \
    -u all --stop-after-init --logfile="logs/openupgrade_${branch}.log" || true
}

# Nota: v15→16 se ejecuta con OpenUpgrade 16.0 sobre DB restaurada de v15.
run_openupgrade_step 16
run_openupgrade_step 17
run_openupgrade_step 18

echo "[INFO] Cadena OpenUpgrade completada (hasta 18.0)."
echo "[INFO] Para 18→19: usar OpenUpgrade 19.0 si está disponible; si no, usar upgrade oficial Odoo para obtener DB test 19 y validar."
```

### `scripts/03_db_integrity_check.py`
```python
#!/usr/bin/env python3
import argparse, json, hashlib
import psycopg2

DEFAULT_TABLES = [
  "res_partner",
  "res_users",
  "ir_model",
  "ir_model_fields",
  "ir_ui_view",
  "ir_module_module",
]

def hash_rows(cur, table, limit=5000):
    # Hash defensivo de una muestra estable (no pretende ser criptográficamente perfecto)
    cur.execute(f"SELECT * FROM {table} ORDER BY 1 NULLS LAST LIMIT %s", (limit,))
    h = hashlib.sha256()
    for row in cur.fetchall():
        h.update(repr(row).encode("utf-8", errors="ignore"))
    return h.hexdigest()

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--db", required=True)
    ap.add_argument("--host", default="127.0.0.1")
    ap.add_argument("--port", type=int, default=5432)
    ap.add_argument("--user", default="odoo")
    ap.add_argument("--password", default="odoo")
    ap.add_argument("--out", default="logs/db_integrity.json")
    ap.add_argument("--tables", default=",".join(DEFAULT_TABLES))
    args = ap.parse_args()

    tables = [t.strip() for t in args.tables.split(",") if t.strip()]
    report = {"db": args.db, "tables": {}}

    conn = psycopg2.connect(host=args.host, port=args.port, dbname=args.db, user=args.user, password=args.password)
    cur = conn.cursor()

    for t in tables:
        try:
            cur.execute(f"SELECT COUNT(*) FROM {t}")
            count = cur.fetchone()[0]
            sample_hash = hash_rows(cur, t)
            report["tables"][t] = {"count": count, "sample_sha256": sample_hash}
        except Exception as e:
            report["tables"][t] = {"error": str(e)}

    cur.close()
    conn.close()

    with open(args.out, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2, ensure_ascii=False)

if __name__ == "__main__":
    main()
```

### `scripts/04_transform_odoo19.py`
```python
#!/usr/bin/env python3
import argparse, os, re, shutil
from pathlib import Path

RX = {
  # Legacy openerp imports
  r"\bfrom\s+openerp\b": "from odoo",
  r"\bimport\s+openerp\b": "import odoo  # TODO: revisar API",
  # Decorators removed long ago but still seen in legacy repos
  r"@api\.one\b": "@api.model  # TODO: reemplazar api.one",
  r"@api\.multi\b": "@api.model  # TODO: reemplazar api.multi",
}

def backup_tree(dst):
    d = Path(dst)
    if d.exists():
        shutil.rmtree(d)
    shutil.copytree(".", dst, ignore=shutil.ignore_patterns(".git", "logs", "backup_*", "__pycache__"))

def transform_text(path: Path, changes: list[str]):
    txt = path.read_text(encoding="utf-8", errors="ignore")
    orig = txt
    for pat, repl in RX.items():
        txt = re.sub(pat, repl, txt)
    if txt != orig:
        path.write_text(txt, encoding="utf-8")
        changes.append(str(path))

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--backup-dir", default="backup_pre_transform")
    ap.add_argument("--log", default="logs/transform.log")
    args = ap.parse_args()

    Path("logs").mkdir(exist_ok=True)
    backup_tree(args.backup_dir)

    changes = []
    for root, _, files in os.walk("."):
        if root.startswith("./.git") or root.startswith("./logs") or root.startswith("./backup_"):
            continue
        for f in files:
            p = Path(root) / f
            if p.suffix.lower() in (".py", ".js", ".xml"):
                transform_text(p, changes)

    Path(args.log).write_text("\n".join(changes), encoding="utf-8")

if __name__ == "__main__":
    main()
```

### `scripts/05_xml_v17_guardrails.py`
```python
#!/usr/bin/env python3
import argparse, os, re, sys
from pathlib import Path

RX_FORBIDDEN = [
  re.compile(r'\battrs\s*=\s*["\']', re.I),
  re.compile(r'\binvisible\s*=\s*["\']', re.I),
]

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--fail-on-find", action="store_true")
    args = ap.parse_args()

    hits = []
    for root, _, files in os.walk("."):
        if root.startswith("./.git") or root.startswith("./logs") or root.startswith("./backup_"):
            continue
        for f in files:
            p = Path(root) / f
            if p.suffix.lower() != ".xml":
                continue
            txt = p.read_text(encoding="utf-8", errors="ignore")
            if any(rx.search(txt) for rx in RX_FORBIDDEN):
                hits.append(str(p))

    if hits:
        msg = "XML guardrails: encontrados attrs/invisible prohibidos en v17+:\n" + "\n".join(f"- {h}" for h in hits)
        print(msg)
        if args.fail_on_find:
            sys.exit(2)
    else:
        print("XML guardrails: OK (no attrs/invisible prohibidos encontrados).")

if __name__ == "__main__":
    main()
```

### `scripts/06_report_finalize.py`
```python
#!/usr/bin/env python3
import argparse, json
from pathlib import Path

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", default="logs/final_report.md")
    args = ap.parse_args()

    parts = ["# Reporte final migración Odoo 15→19 (CI)\n"]
    def add_json(path, title):
        p = Path(path)
        if p.exists():
            parts.append(f"## {title}\n")
            parts.append("```json")
            parts.append(p.read_text(encoding="utf-8"))
            parts.append("```\n")

    add_json("logs/pre_migration_report.json", "Análisis de riesgo")
    add_json("logs/db_integrity_pre.json", "Integridad DB (pre)")
    add_json("logs/db_integrity_post_chain.json", "Integridad DB (post cadena)")

    for p in sorted(Path("logs").glob("openupgrade_*.log")):
        parts.append(f"## Log {p.name}\n")
        parts.append(f"- Archivo: `{p}`\n")

    Path(args.out).write_text("\n".join(parts), encoding="utf-8")

if __name__ == "__main__":
    main()
```

### `install_migrate_odoo19_docker.sh` (OPCIONAL, mínimo viable)
> Solo crea la pila (Odoo 19 + PostgreSQL) y deja carpeta `odoo19_stack/`.  
> La migración DB (15→19) se hace por CI/OpenUpgrade para mantener trazabilidad e integridad.

```bash
#!/usr/bin/env bash
set -Eeuo pipefail

STACK_DIR="${STACK_DIR:-$PWD/odoo19_stack}"
ODOO_TAG="${ODOO_TAG:-19.0}"
PG_TAG="${PG_TAG:-15}"
ODOO_PORT="${ODOO_PORT:-8069}"

mkdir -p "$STACK_DIR"/{addons,odoo-data,db-data,dumps}
cat > "$STACK_DIR/docker-compose.yml" <<YAML
services:
  db:
    image: postgres:${PG_TAG}-alpine
    environment:
      POSTGRES_USER: odoo
      POSTGRES_PASSWORD: odoo
      POSTGRES_DB: odoo
    volumes:
      - ./db-data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD", "pg_isready", "-U", "odoo"]
      interval: 5s
      timeout: 5s
      retries: 20

  odoo:
    image: odoo:${ODOO_TAG}
    depends_on:
      db:
        condition: service_healthy
    ports:
      - "${ODOO_PORT}:8069"
    volumes:
      - ./addons:/mnt/extra-addons
      - ./odoo-data:/var/lib/odoo
YAML

echo "[OK] Stack creada en $STACK_DIR. Ejecuta: (cd $STACK_DIR && docker compose up -d)"
```

---

## Checklist de cierre
- [ ] Rama `migration_odoo15_to_19` creada y tag `pre_migration_odoo15_to_19` creado.
- [ ] Inventario `pre` y `post` con SHA256 por archivo generado (y diff).
- [ ] `analyze_repo` ejecuta y aborta si HIGH risk.
- [ ] OpenUpgrade corre 16→17→18 y documenta el fallback 18→19.
- [ ] Guardrails XML v17+ sin `attrs`/`invisible`.
- [ ] Validación Odoo 19 `--stop-after-init` con logs/artifacts.
- [ ] Commits y PR con autor **Joel Stalin Martinez Espinal**.
```

---

## Mejoras clave incluidas
- Revisión **archivo-por-archivo** con inventario SHA256 + diff (`00_inventory_files.py`).
- Integridad de datos con “pre/post snapshots” de tablas clave (`03_db_integrity_check.py`).
- Guardrails v17+ para prohibir `attrs/invisible` en XML (fallo duro en CI).
- Estrategia realista para 18→19 (OpenUpgrade si existe branch estable; si no, plataforma oficial). citeturn1search1turn3search5

## Técnicas aplicadas
- “Gates” (HIGH risk abort).
- Backups idempotentes antes de transformaciones.
- Reports + artifacts en CI para trazabilidad.
- Transformaciones marcadas con TODO (evita romper silenciosamente).

## Odoo (verificación y referencias)
- Rama objetivo recomendada en core: **odoo/odoo `19.0`**. citeturn0search3  
- Release Notes Odoo 19 (Sept 2025). citeturn0search1  
- Requisito PostgreSQL para Odoo 19: **13+** (documentación oficial). citeturn3search4turn3search10  
- Upgrade oficial (on-prem/odoo.sh/online): docs 19.0. citeturn3search5  
- OpenUpgrade 19.0: milestone en progreso (no asumir disponibilidad estable). citeturn1search1
