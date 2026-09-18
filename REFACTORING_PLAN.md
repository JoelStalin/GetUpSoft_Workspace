# 🔄 Plan de Refactorización: Desvinculación FLAI + Normalización MVC

## Resumen Ejecutivo

El workspace GetUpSoft_Workspace está actualmente acoplado a infraestructura FLAI. Este plan propone:

1. ✅ **Desvinculación completa de FLAI** - Eliminar todas las referencias
2. ✅ **Normalización MVC** - Reorganizar estructura de directorios
3. ✅ **Instalación de Node.js en servidor** - Para futuros builds

---

## FASE 1: Desvinculación de FLAI

### 1.1 Directorios actuales con referencias FLAI

```
/home/ubuntu/workspaces/GetUpSoft_Workspace
  └─ (ISSUE: Mixed naming, no clear separation)

/home/ubuntu/GetUpSoft_Workspace_K8s_Deploy/
  └─ 04_Archive_Legacy/GetUpSoft_old_org/
  └─ (ISSUE: K8s specific, should be modular)

/home/ubuntu/.workspace-cli/flai-getupsoft/
  └─ profiles/
  └─ (ISSUE: Hardcoded FLAI coupling)
```

### 1.2 Acciones de Desvinculación

**A. En Servidor Local**
```bash
# Paso 1: Backup actual
cp -r /home/ubuntu/workspaces/GetUpSoft_Workspace \
      /home/ubuntu/GetUpSoft_Workspace.backup-$(date +%Y%m%d)

# Paso 2: Renombrar directorio principal
mv /home/ubuntu/workspaces/GetUpSoft_Workspace \
   /home/ubuntu/GetUpSoft_Workspace

# Paso 3: Limpiar referencias FLAI en .workspace-cli
rm -rf /home/ubuntu/.workspace-cli/flai-getupsoft/
# Usar solo: /home/ubuntu/.workspace-cli/getupsoft/

# Paso 4: Actualizar configuraciones
find /home/ubuntu/GetUpSoft_Workspace -type f -name "*.json" -o -name "*.yaml" -o -name "*.yml" \
  | xargs sed -i 's|flai-getupsoft|getupsoft|g'
  | xargs sed -i 's|flai\.com\.do|getupsoft.com.do|g'
```

**B. En GitHub (Actualizar referencias)**
```bash
# Paso 1: Update README, docs pointing to correct path
# Paso 2: Update CI/CD workflows - quitar FLAI context
# Paso 3: Update docker-compose.prod.yml - rutas limpias
```

### 1.3 Rutas Finales Post-Desvinculación

```
✅ ANTES (Acoplado)
/home/ubuntu/.workspace-cli/flai-getupsoft/
/home/ubuntu/workspaces/GetUpSoft_Workspace/
/app/getupsoft-workspace/  ← inconsistente

✅ DESPUÉS (Limpio)
/home/ubuntu/GetUpSoft_Workspace/
/home/ubuntu/.workspace-cli/getupsoft/
/opt/getupsoft/  ← estándar para apps
```

---

## FASE 2: Normalización de Directorios (Patrón MVC Mejorado)

### 2.1 Estructura Actual (Caótica)

```
GetUpSoft_Workspace/
├─ 01_Core_Platform/
│  ├─ getupsoft-site/
│  ├─ easycount-api/
│  └─ auth-service/
├─ 02_Cloud_Infrastructure/  ← Kubernetes stuff
├─ 03_AI_Automation/
│  └─ orca/
├─ 04_Archives/  ← Basura de FLAI
├─ 05_Documentation/
├─ 06_E_Commerce_Lux/
├─ _Knowledge_Center/
├─ deploy/
└─ migration/  ← Archivos old
```

**Problemas:**
- ❌ Números 01-09 poco semánticos
- ❌ Proyectos en ubicaciones random
- ❌ No hay separación clara entre apps/libs/config
- ❌ Archivos de "migración/archive" mezclados

### 2.2 Estructura Normalizada (MVC + Modular)

```
GetUpSoft_Workspace/
├─ apps/                          ← Aplicaciones principales
│  ├─ site/                       ← (ex 01_Core_Platform/getupsoft-site)
│  │  ├─ src/
│  │  │  ├─ pages/              ← V (Views)
│  │  │  ├─ components/         ← V (View Components)
│  │  │  ├─ hooks/              ← C (Controllers)
│  │  │  ├─ services/           ← M (Models)
│  │  │  └─ utils/
│  │  ├─ public/
│  │  ├─ tests/
│  │  └─ docker-compose.prod.yml
│  │
│  ├─ easycount/                 ← (ex 01_Core_Platform/easycount-api)
│  │  ├─ src/
│  │  │  ├─ controllers/        ← C
│  │  │  ├─ models/             ← M
│  │  │  ├─ services/           ← C/S
│  │  │  ├─ middleware/         ← C
│  │  │  └─ db/
│  │  └─ tests/
│  │
│  ├─ orca/                      ← (ex 03_AI_Automation/orca)
│  │  ├─ src/
│  │  │  ├─ ai_automation_orchestrator/
│  │  │  │  ├─ api/            ← C (endpoints/controllers)
│  │  │  │  ├─ models/         ← M (domain)
│  │  │  │  ├─ services/       ← S (business logic)
│  │  │  │  └─ utils/
│  │  │  └─ config/
│  │  └─ tests/
│  │
│  └─ chatbot/                   ← Nueva app
│     ├─ src/
│     └─ tests/
│
├─ libs/                          ← Librerías compartidas
│  ├─ auth/                       ← (ex shared auth)
│  │  ├─ src/
│  │  │  ├─ models/
│  │  │  ├─ providers/
│  │  │  └─ utils/
│  │  └─ tests/
│  │
│  ├─ database/
│  │  ├─ migrations/
│  │  ├─ seeds/
│  │  └─ models/
│  │
│  └─ common/
│     ├─ types/
│     ├─ utils/
│     └─ constants/
│
├─ infra/                         ← Infraestructura
│  ├─ kubernetes/                ← (ex 02_Cloud_Infrastructure)
│  │  ├─ manifests/
│  │  ├─ helm/
│  │  └─ kustomize/
│  │
│  ├─ docker/
│  │  ├─ site.Dockerfile
│  │  ├─ orca.Dockerfile
│  │  └─ docker-compose.yml
│  │
│  ├─ terraform/
│  ├─ ansible/
│  └─ ci-cd/                      ← (ex .github/workflows)
│     └─ github-actions/
│
├─ docs/                          ← (ex _Knowledge_Center)
│  ├─ architecture/
│  ├─ api/
│  ├─ deployment/
│  ├─ getting-started/
│  └─ workflows/
│
├─ scripts/                       ← Útiles
│  ├─ deploy/
│  ├─ setup/
│  ├─ migrate/
│  └─ maintenance/
│
├─ archive/                       ← (ex 09_Archives, 04_Archive_Legacy)
│  ├─ research/
│  └─ deprecated/
│
├─ root config files
├─ .gitignore
├─ .dockerignore
├─ docker-compose.yml            ← desarrollo
├─ docker-compose.prod.yml       ← producción
├─ CLAUDE.md                      ← instrucciones
├─ README.md
└─ CONTRIBUTING.md
```

### 2.3 Mapeo de Migración

| Directorio Actual | Nuevo Directorio | Tipo |
|---|---|---|
| `01_Core_Platform/getupsoft-site` | `apps/site` | App Frontend |
| `01_Core_Platform/easycount-api` | `apps/easycount` | App Backend |
| `03_AI_Automation/orca` | `apps/orca` | App Backend |
| `02_Cloud_Infrastructure` | `infra/kubernetes` | Infra Config |
| `04_Archives` | `archive/deprecated` | Archive |
| `_Knowledge_Center` | `docs` | Documentación |
| `deploy/` | `infra/docker` | Docker Config |
| `scripts/` | `scripts/` | (reorganizar internamente) |

### 2.4 Pasos de Migración

```bash
# Paso 1: Crear nueva estructura
mkdir -p apps libs infra docs scripts archive

# Paso 2: Mover directorios
mv 01_Core_Platform/getupsoft-site apps/site
mv 01_Core_Platform/easycount-api apps/easycount
mv 03_AI_Automation/orca apps/orca
mv 02_Cloud_Infrastructure infra/kubernetes
mv 04_Archives archive/deprecated
mv _Knowledge_Center docs
mv deploy infra/docker

# Paso 3: Limpiar directorios vacíos
rmdir 01_Core_Platform 02_Cloud_Infrastructure 03_AI_Automation 04_Archives 05_* 06_* 07_* 08_* 09_*

# Paso 4: Actualizar referencias en archivos
# (Ejecutar script de busca-reemplaza)

# Paso 5: Commit a Git
git add -A
git commit -m "refactor: normalize directory structure with MVC pattern and remove FLAI coupling"
```

---

## FASE 3: Instalación de Node.js en Servidor

### 3.1 Instalación de Node.js + npm

```bash
# Opción 1: NodeSource Repository (Recomendado)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verificar instalación
node --version      # v20.x.x
npm --version       # 10.x.x
npx --version       # 10.x.x

# Opción 2: NVM (Alternativo, better for development)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 20
nvm use 20
```

### 3.2 Setup Global npm packages

```bash
# Tools útiles
npm install -g pnpm yarn typescript ts-node

# Verificar
npm list -g --depth=0
```

### 3.3 Configurar npm para producción

```bash
# Crear .npmrc global
mkdir -p ~/.npm
cat > ~/.npmrc << EOF
registry=https://registry.npmjs.org/
npm-tag-version-prefix=
legacy-peer-deps=true
EOF

# Limitar permisos
chmod 600 ~/.npmrc
```

---

## Cronograma de Implementación

### Semana 1
- [ ] **Día 1-2**: Backup y desvinculación FLAI
- [ ] **Día 3-4**: Crear estructura MVC en local
- [ ] **Día 5**: Mover archivos y actualizar referencias

### Semana 2
- [ ] **Día 1-2**: Instalar Node.js en servidor
- [ ] **Día 3-4**: Testing de builds en servidor
- [ ] **Día 5**: Deploy de cambios

---

## Checklist Pre-Implementación

### En Local
- [ ] Crear rama: `git checkout -b refactor/normalize-directories`
- [ ] Hacer backup: `tar czf GetUpSoft_Workspace.backup.tar.gz GetUpSoft_Workspace/`
- [ ] Revisar .gitignore para nuevas rutas
- [ ] Actualizar paths en:
  - [ ] `CLAUDE.md`
  - [ ] `README.md`
  - [ ] `docker-compose.yml`
  - [ ] `docker-compose.prod.yml`
  - [ ] `.github/workflows/*`

### En Servidor
- [ ] Backup: `cp -r GetUpSoft_Workspace GetUpSoft_Workspace.backup-20260519`
- [ ] Verificar espacio: `df -h`
- [ ] Stop containers: `docker compose down`
- [ ] Pull cambios: `git pull`
- [ ] Test: `npm install && npm run build`

---

## Riesgos y Mitigación

| Riesgo | Probabilidad | Impacto | Mitigación |
|---|---|---|---|
| Rutas rotas en CI/CD | Alta | Alto | Actualizar todos workflows primero |
| Docker builds fallan | Media | Alto | Test local antes de push |
| Pérdida de datos | Baja | Crítico | Múltiples backups |
| Downtime de servicios | Media | Alto | Deploy durante mantenimiento |

---

## Rollback Plan

Si algo va mal:

```bash
# En servidor
cd /home/ubuntu
rm -rf GetUpSoft_Workspace
mv GetUpSoft_Workspace.backup-20260519 GetUpSoft_Workspace
docker compose up -d

# En local
git reset --hard HEAD~1
git push --force origin main  # ⚠ Solo si necesario
```

---

## Success Criteria

✅ **FASE 1**: Todas referencias a FLAI eliminadas
```bash
grep -r "flai" . --exclude-dir=.git || echo "✓ No FLAI references"
```

✅ **FASE 2**: Estructura normalizada
```bash
tree -L 2 -d
# apps/, libs/, infra/, docs/ existen
# Proyectos movidos correctamente
```

✅ **FASE 3**: Node.js funcional
```bash
node --version && npm --version
cd apps/site && npm install && npm run build
# ✓ Build exitoso
```

---

## Contacto y Soporte

Para preguntas:
- `CLAUDE.md` - Instrucciones del workspace
- `docs/` - Documentación interna
- Logs de deployment en `infra/ci-cd/`

---

**Próximo Paso**: Confirmar con usuario antes de implementar
