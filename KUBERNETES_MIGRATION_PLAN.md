# 🏗️ PLAN: Migración Completa GetUpSoft Workspace a Kubernetes

**Fecha:** 2026-05-19  
**Scope:** Toda la workspace EXCEPTO Galantes Jewelry y Chef Alitas  
**Status:** 📋 PLAN PENDIENTE DE APROBACIÓN

---

## 📊 Proyectos a Migrar

| Proyecto | Ubicación | Tecnología | Estado | Prioridad |
|----------|-----------|-----------|--------|-----------|
| **ORCA** | `03_AI_Automation/orca` | Python 3.11 + FastAPI | ✅ COMPLETADO | P0 |
| **GetUpSoft Site** | `01_Core_Platform/getupsoft-site` | Node.js + Vite + React | ⏳ PENDIENTE | P1 |
| **Miniverse** | `miniverse/` | Node.js Monorepo | ⏳ PENDIENTE | P2 |

## 🚫 Proyectos Excluidos (NO Migrar)

- ❌ **Galantes Jewelry** — `06_E_Commerce_Lux/Galantesjewelry` (Excepción del usuario)
- ❌ **Chef Alitas** — (Excepción del usuario)

---

## 🎯 Arquitectura Kubernetes Global

```
getupsoft namespace
├── orca (Python/FastAPI)
│   ├── Deployment (1 replica)
│   ├── Service: ClusterIP:8787
│   ├── PVC: 10Gi artifacts
│   └── ConfigMap + Secret
│
├── getupsoft-site (Node.js/Vite/React)
│   ├── Deployment (2 replicas)
│   ├── Service: ClusterIP:5173
│   ├── ConfigMap
│   └── Ingress (optional)
│
└── miniverse (Node.js Monorepo)
    ├── Deployment (1 replica)
    ├── Service: ClusterIP:3000
    └── ConfigMap

Infrastructure:
├── Namespace: getupsoft
├── Storage: PVC x2 (orca, shared-data)
├── Secrets: example templates (no real values)
├── Ingress: optional for external access
└── Monitoring: prometheus, logging ready
```

---

## 📦 Entregables por Proyecto

### 1. ORCA (Python/FastAPI) — ✅ COMPLETADO

**Ubicación:** `03_AI_Automation/orca/`

Archivos ya entregados:
- ✅ `Dockerfile` (55 líneas, multi-stage)
- ✅ `.dockerignore` (48 líneas)
- ✅ `deploy/k8s/base/` (10 manifests)
- ✅ `deploy/k8s/overlays/dev/` + `prod/`
- ✅ `docs/kubernetes.md` (645 líneas)
- ✅ `.github/workflows/orca-kubernetes-ci.yml`

**Estado:** LISTO PARA PRODUCCIÓN

---

### 2. GetUpSoft Site (Node.js/Vite/React) — ⏳ PENDIENTE

**Ubicación:** `01_Core_Platform/getupsoft-site/`

**Características:**
- Vite dev server (puerto 5173)
- React frontend
- pnpm workspaces
- Test suite con Selenium (e2e)
- Build: TypeScript type-check + vite build

**Archivos a crear:**
```
01_Core_Platform/getupsoft-site/
├── Dockerfile (Node 20 slim, multi-stage)
├── .dockerignore
├── deploy/k8s/base/
│   ├── configmap.yaml (build artifacts, env vars)
│   ├── deployment.yaml (2 replicas, nginx reverse proxy)
│   ├── service.yaml (ClusterIP:5173)
│   ├── ingress.yaml (optional, *.getupsoft.local)
│   ├── hpa.yaml (2-4 replicas, CPU/Memory based)
│   └── kustomization.yaml
├── deploy/k8s/overlays/dev/
│   └── kustomization.yaml (1 replica, debug mode)
├── deploy/k8s/overlays/prod/
│   └── kustomization.yaml (2-3 replicas, optimized)
└── docs/getupsoft-site-kubernetes.md (operations guide)
```

**Dockerfile Strategy:**
```dockerfile
# Stage 1: Build
FROM node:20-alpine
WORKDIR /build
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install
COPY . .
RUN pnpm build

# Stage 2: Runtime (nginx)
FROM nginx:alpine
COPY --from=build /build/dist /usr/share/nginx/html/
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
```

**Considerations:**
- Static site + SPA routing (nginx config needed)
- No state persistence needed
- Can scale horizontally
- e2e tests use Selenium (require browser/chromedriver)

---

### 3. Miniverse (Node.js Monorepo) — ⏳ PENDIENTE

**Ubicación:** `miniverse/`

**Características:**
- pnpm workspaces (packages/core, packages/server, demo)
- TypeScript
- Custom build script (esbuild)
- Runs as CLI or server

**Archivos a crear:**
```
miniverse/
├── Dockerfile (Node 20 slim, custom build)
├── .dockerignore
├── deploy/k8s/base/
│   ├── configmap.yaml (env vars, build args)
│   ├── deployment.yaml (1 replica, stateless)
│   ├── service.yaml (ClusterIP:3000)
│   ├── hpa.yaml (1-3 replicas)
│   └── kustomization.yaml
├── deploy/k8s/overlays/dev/
│   └── kustomization.yaml
├── deploy/k8s/overlays/prod/
│   └── kustomization.yaml
└── docs/miniverse-kubernetes.md
```

**Dockerfile Strategy:**
```dockerfile
# Stage 1: Build
FROM node:20-alpine
WORKDIR /build
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install
COPY . .
RUN pnpm build:server

# Stage 2: Runtime
FROM node:20-alpine
WORKDIR /app
COPY --from=build /build/packages/server/dist ./
COPY --from=build /build/node_modules ./node_modules
EXPOSE 3000
CMD ["node", "cli.js"]
```

**Considerations:**
- Monorepo build complexity
- Stateless service (can scale)
- No persistent storage needed
- Simple CLI-based server

---

## 🔄 Arquitectura Kubernetes Global (Multi-Servicio)

### Shared Resources
```
deploy/k8s/shared/
├── namespace.yaml (getupsoft namespace)
├── serviceaccount.yaml (RBAC)
├── network-policy.yaml (optional)
└── kustomization.yaml (base shared)
```

### Service Routing
```
getupsoft-site ←→ nginx:5173 (frontend)
       ↓
   [Service mesh optional]
       ↓
orca (FastAPI):8787, miniverse:3000
```

### Global Kustomization
```
deploy/k8s/global/
├── overlays/dev/
│   ├── kustomization.yaml (all services dev config)
│   └── kustomize build dev/ → all 3 services dev
└── overlays/prod/
    ├── kustomization.yaml (all services prod config)
    └── kustomize build prod/ → all 3 services prod
```

---

## 📋 Plan de Implementación (Fase por Fase)

### Fase 1: GetUpSoft Site (Node.js) — ~2 horas
1. Crear Dockerfile (multi-stage, nginx)
2. Crear .dockerignore
3. Crear K8s base manifests (10 files)
4. Crear overlays (dev/prod)
5. Create operations guide
6. Validate YAML + test docker build
7. Commit: `feat(getupsoft-site): kubernetes migration`

### Fase 2: Miniverse (Node.js Monorepo) — ~1.5 horas
1. Crear Dockerfile (custom build)
2. Crear .dockerignore
3. Crear K8s base manifests
4. Crear overlays (dev/prod)
5. Create operations guide
6. Validate + test
7. Commit: `feat(miniverse): kubernetes migration`

### Fase 3: Global Orchestration — ~1 hour
1. Create shared namespace + RBAC in `deploy/k8s/global/`
2. Create global overlays (dev/prod) that compose all 3 services
3. Create master documentation: `docs/KUBERNETES_DEPLOYMENT.md`
4. Test global kustomize build
5. Create CI/CD workflow for multi-service validation
6. Commit: `feat(k8s): global workspace orchestration`

### Fase 4: Cleanup & PR — ~30 min
1. Remove/deprecate old deploy scripts
2. Update main README.md with K8s instructions
3. Create branch `feat/kubernetes-workspace-migration`
4. All commits squashed/organized
5. Final validation

---

## 🎯 Criterios de Aceptación

- [x] ORCA migración completada
- [ ] GetUpSoft Site Dockerfile builds
- [ ] GetUpSoft Site K8s manifests valid
- [ ] GetUpSoft Site health check works
- [ ] Miniverse Dockerfile builds
- [ ] Miniverse K8s manifests valid
- [ ] Global kustomize build succeeds
- [ ] All YAML passes syntax validation
- [ ] No secrets committed (examples only)
- [ ] Documentation complete for all 3 services
- [ ] CI/CD workflow validates all services
- [ ] Backwards compatibility with local dev

---

## ⏱️ Timeline Estimado

| Fase | Tiempo | Cumple |
|------|--------|--------|
| Fase 1 (Site) | 2h | |
| Fase 2 (Miniverse) | 1.5h | |
| Fase 3 (Global) | 1h | |
| Fase 4 (Cleanup) | 0.5h | |
| **TOTAL** | **~5h** | |

---

## ⚠️ Riesgos y Mitigaciones

| Riesgo | Impacto | Mitigación |
|--------|---------|-----------|
| Vite dev server needs special config | Alto | Use nginx proxy, preserve env vars |
| Monorepo complex build | Medio | Test build locally first, cache layers |
| Static site routing (SPA) | Medio | Configure nginx for SPA routing |
| Node modules size | Medio | Multi-stage build, .dockerignore |
| e2e Selenium tests need browser | Bajo | Keep separate, don't containerize |

---

## 🚀 Próximos Pasos

### Si aprobado:
1. Implementar GetUpSoft Site (2h)
2. Implementar Miniverse (1.5h)
3. Crear orquestación global (1h)
4. Validar y commit (0.5h)

### Si rechazado:
- Revisar con user
- Ajustar plan según feedback

---

## 📖 Documentación Esperada

Por cada servicio:
- ✅ Local Docker testing
- ✅ K8s deployment (dev/prod)
- ✅ Configuration management
- ✅ Troubleshooting
- ✅ Security considerations

**Master doc:** `docs/KUBERNETES_DEPLOYMENT.md`
- Overview de toda la arquitectura
- Como desplegar completamente
- Como escalar/monitoring
- Roadmap futura

---

## Decisión

¿Aprobado este plan para implementar GetUpSoft Site + Miniverse + Orquestación Global?

**[ ] SÍ, proceder**  
**[ ] NO, revisar**  
**[ ] MODIFICAR, detalles abajo**
