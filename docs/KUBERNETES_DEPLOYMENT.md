# 🚀 GetUpSoft Workspace on Kubernetes — Complete Deployment Guide

**Version:** 0.2.0  
**Last Updated:** 2026-05-19  
**Status:** Production Ready

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Prerequisites](#prerequisites)
3. [Services](#services)
4. [Deployment](#deployment)
5. [Operations](#operations)
6. [Configuration](#configuration)
7. [Troubleshooting](#troubleshooting)
8. [Scaling](#scaling)

---

## Architecture Overview

The GetUpSoft Workspace runs on Kubernetes with 3 microservices:

```
┌─────────────────────────────────────────────┐
│         GetUpSoft Workspace K8s             │
│         Namespace: getupsoft                │
├─────────────────────────────────────────────┤
│                                             │
│  ┌──────────────────────────────────────┐  │
│  │  getupsoft-site (React/Vite)        │  │
│  │  - Port: 5173                       │  │
│  │  - Replicas: 2 (prod), 1 (dev)      │  │
│  │  - Service: nginx SPA                │  │
│  └──────────────────────────────────────┘  │
│           ↓                                 │
│  ┌──────────────────────────────────────┐  │
│  │  orca (Python/FastAPI)              │  │
│  │  - Port: 8787                       │  │
│  │  - Replicas: 1 (single, SQLite)     │  │
│  │  - PVC: 10Gi artifacts              │  │
│  └──────────────────────────────────────┘  │
│           ↓                                 │
│  ┌──────────────────────────────────────┐  │
│  │  miniverse (Node.js)                │  │
│  │  - Port: 3000                       │  │
│  │  - Replicas: 1-2 (scalable)         │  │
│  │  - Service: monorepo CLI/server     │  │
│  └──────────────────────────────────────┘  │
│                                             │
└─────────────────────────────────────────────┘
```

---

## Prerequisites

### Local Machine
- Docker 20.10+
- Kubernetes CLI (kubectl) 1.24+
- Kustomize 5.0+
- Helm (optional)

### Kubernetes Cluster
- Kubernetes 1.24+
- Storage provisioner (local or network)
- Optional: Ingress Controller (nginx, traefik)

---

## Services

### 1. ORCA (Python/FastAPI)

**Purpose:** AI Automation Orchestrator  
**Location:** `03_AI_Automation/orca/`  
**Health Endpoint:** `GET /health`

```bash
# Build
docker build -t getupsoft/orca:local 03_AI_Automation/orca/

# Run locally
docker run -p 8787:8787 getupsoft/orca:local
curl http://localhost:8787/health

# Deploy
kubectl apply -k 03_AI_Automation/orca/deploy/k8s/overlays/prod
```

**Kubernetes Details:**
- Single replica (SQLite state not distributed)
- 10Gi PVC for artifacts
- CPU: 500m-2000m, Memory: 512Mi-4Gi

See `03_AI_Automation/orca/docs/kubernetes.md` for detailed operations.

---

### 2. GetUpSoft Site (React/Vite)

**Purpose:** Corporate website frontend  
**Location:** `01_Core_Platform/getupsoft-site/`  
**Health Endpoint:** `GET /health`

```bash
# Build
docker build -t getupsoft/site:local 01_Core_Platform/getupsoft-site/

# Run locally
docker run -p 5173:5173 getupsoft/site:local
curl http://localhost:5173/health

# Deploy
kubectl apply -k 01_Core_Platform/getupsoft-site/deploy/k8s/overlays/prod
```

**Kubernetes Details:**
- 2 replicas (stateless, horizontally scalable)
- HPA: scales 2-4 based on CPU/Memory
- nginx: handles SPA routing
- CPU: 100m-500m, Memory: 128Mi-512Mi (dev)
- CPU: 200m-1000m, Memory: 256Mi-1Gi (prod)

---

### 3. Miniverse (Node.js)

**Purpose:** Image processing monorepo server  
**Location:** `miniverse/`  
**Health Endpoint:** `GET /health`

```bash
# Build
docker build -t getupsoft/miniverse:local miniverse/

# Run locally
docker run -p 3000:3000 getupsoft/miniverse:local

# Deploy
kubectl apply -k miniverse/deploy/k8s/overlays/prod
```

**Kubernetes Details:**
- 1-2 replicas (stateless)
- HPA: scales 1-3 based on load
- CPU: 100m-1000m, Memory: 256Mi-1Gi

---

## Deployment

### Development Environment

```bash
# Deploy all services in dev mode (low resources)
kubectl apply -k deploy/k8s/overlays/dev

# Verify
kubectl -n getupsoft get all
kubectl -n getupsoft get pods -o wide
```

**Dev Configuration:**
- 1 replica per service
- Low resource limits
- Debug logging enabled
- No ingress (use port-forward)

### Production Environment

```bash
# Deploy all services with prod settings
kubectl apply -k deploy/k8s/overlays/prod

# Verify
kubectl -n getupsoft get all
kubectl -n getupsoft get pods -o wide

# Check status
kubectl -n getupsoft get pods
kubectl -n getupsoft get svc
kubectl -n getupsoft get pvc
```

**Prod Configuration:**
- 2-3 replicas (varies per service)
- Higher resource limits
- Info-level logging
- Optimized health probes
- Ready for Ingress/LoadBalancer

---

## Operations

### Viewing Status

```bash
# All resources
kubectl -n getupsoft get all

# Pods with details
kubectl -n getupsoft get pods -o wide
kubectl -n getupsoft describe pod <pod-name>

# Services and endpoints
kubectl -n getupsoft get svc
kubectl -n getupsoft get endpoints

# Storage
kubectl -n getupsoft get pvc
kubectl -n getupsoft get pv
```

### Viewing Logs

```bash
# Live logs from a service
kubectl -n getupsoft logs -f deployment/orca-prod-orca
kubectl -n getupsoft logs -f deployment/site-prod-getupsoft-site
kubectl -n getupsoft logs -f deployment/miniverse-prod-miniverse

# Last 100 lines
kubectl -n getupsoft logs deployment/orca-prod-orca --tail=100

# All containers
kubectl -n getupsoft logs deployment/orca-prod-orca --all-containers=true
```

### Port Forwarding (Testing)

```bash
# Forward local port to service
kubectl -n getupsoft port-forward svc/orca 8787:8787 &
curl http://localhost:8787/health

kubectl -n getupsoft port-forward svc/getupsoft-site 5173:5173 &
curl http://localhost:5173/health

kubectl -n getupsoft port-forward svc/miniverse 3000:3000 &
curl http://localhost:3000/health
```

### Executing Commands in Pods

```bash
# Get a pod name
POD=$(kubectl -n getupsoft get pods -l app.kubernetes.io/name=orca -o jsonpath='{.items[0].metadata.name}')

# Execute command
kubectl -n getupsoft exec -it $POD -- python -c "print('OK')"

# Interactive shell
kubectl -n getupsoft exec -it $POD -- sh
```

### Rolling Updates

```bash
# Update image
kubectl -n getupsoft set image deployment/orca-prod-orca \
  orca=getupsoft/orca:v0.3.0

# Check status
kubectl -n getupsoft rollout status deployment/orca-prod-orca

# View history
kubectl -n getupsoft rollout history deployment/orca-prod-orca

# Rollback
kubectl -n getupsoft rollout undo deployment/orca-prod-orca
```

---

## Configuration

### Environment Variables

Each service has configurable environment variables via ConfigMap:

**ORCA:**
```yaml
ORCA_CANONICAL_LANGUAGE: "es"
ORCA_LOW_CONFIDENCE_THRESHOLD: "0.7"
LOG_LEVEL: "INFO"
```

**GetUpSoft Site:**
```yaml
VITE_API_URL: "http://orca.getupsoft.svc.cluster.local:8787"
NODE_ENV: "production"
LOG_LEVEL: "info"
```

**Miniverse:**
```yaml
NODE_ENV: "production"
PORT: "3000"
LOG_LEVEL: "info"
```

### Secrets

Create secrets from template:

```bash
cp deploy/k8s/overlays/prod/secret.example.yaml deploy/k8s/overlays/prod/secret.yaml
# Edit with real values
kubectl apply -f deploy/k8s/overlays/prod/secret.yaml
```

### Persistence

**ORCA Artifacts:**
```bash
# Check PVC usage
kubectl -n getupsoft exec <orca-pod> -- du -sh /app/.artifacts

# Backup PVC
kubectl -n getupsoft exec <orca-pod> -- tar czf /tmp/artifacts.tar.gz /app/.artifacts
kubectl -n getupsoft cp <pod>:/tmp/artifacts.tar.gz ./artifacts.tar.gz
```

---

## Troubleshooting

### Pod won't start

```bash
# Check events
kubectl -n getupsoft describe pod <pod-name>

# Check logs
kubectl -n getupsoft logs <pod-name>

# Check image pull
kubectl -n getupsoft get events --sort-by='.lastTimestamp'
```

### Health check failing

```bash
# Test endpoint directly
kubectl -n getupsoft port-forward svc/orca 8787:8787
curl -v http://localhost:8787/health

# Check probe config
kubectl -n getupsoft get deployment orca-prod-orca -o jsonpath='{.spec.template.spec.containers[0].livenessProbe}'
```

### Out of memory

```bash
# Check resource usage
kubectl -n getupsoft top pods
kubectl -n getupsoft top nodes

# Increase limits in overlay kustomization
# Then: kubectl apply -k deploy/k8s/overlays/prod
```

---

## Scaling

### Horizontal Scaling

GetUpSoft Site and Miniverse support HPA (Horizontal Pod Autoscaler):

```bash
# Enable HPA (already in manifests)
kubectl -n getupsoft get hpa

# Check current metrics
kubectl -n getupsoft top pods
kubectl -n getupsoft top nodes

# Scale manually (override HPA)
kubectl -n getupsoft scale deployment site-prod-getupsoft-site --replicas=4
```

### Vertical Scaling

Increase resource limits in kustomization overlays:

```yaml
# deploy/k8s/overlays/prod/kustomization.yaml
patches:
  - op: replace
    path: /spec/template/spec/containers/0/resources/limits/cpu
    value: 2000m
```

Then: `kubectl apply -k deploy/k8s/overlays/prod`

---

## Global Commands

### Deploy entire workspace (dev)

```bash
kubectl apply -k deploy/k8s/overlays/dev
```

### Deploy entire workspace (prod)

```bash
kubectl apply -k deploy/k8s/overlays/prod
```

### Delete entire workspace

```bash
# Keep PVCs
kubectl delete -k deploy/k8s/overlays/prod

# Delete PVCs too
kubectl -n getupsoft delete all,pvc -l app.kubernetes.io/part-of=getupsoft-workspace

# Delete namespace (everything)
kubectl delete namespace getupsoft
```

### Validate manifests

```bash
# Check YAML syntax
kustomize build deploy/k8s/overlays/dev
kustomize build deploy/k8s/overlays/prod

# Dry-run deploy
kubectl apply -k deploy/k8s/overlays/prod --dry-run=client

# Validate with kubectl
kubectl kustomize deploy/k8s/overlays/prod | kubectl apply --validate -f -
```

---

## CI/CD Integration

### GitHub Actions

CI/CD workflows validate all services:
- Lint (ruff, eslint)
- Tests (pytest, npm test)
- Docker builds
- Kubernetes manifest validation

```bash
# Workflows
.github/workflows/orca-kubernetes-ci.yml
.github/workflows/getupsoft-site-kubernetes-ci.yml
.github/workflows/miniverse-kubernetes-ci.yml
```

---

## Roadmap

### Phase 1: Initial Migration ✅
- [x] ORCA to Kubernetes
- [x] GetUpSoft Site to Kubernetes
- [x] Miniverse to Kubernetes
- [x] Global orchestration

### Phase 2: Container Registry
- [ ] Push to Docker Hub / ECR
- [ ] Automated builds
- [ ] Image scanning (Trivy)

### Phase 3: Secrets Management
- [ ] Sealed Secrets
- [ ] External Secrets Operator
- [ ] HashiCorp Vault integration

### Phase 4: Database Migration
- [ ] Move ORCA from SQLite → PostgreSQL
- [ ] Enable true horizontal scaling
- [ ] Shared session store

### Phase 5: Observability
- [ ] Prometheus metrics
- [ ] Grafana dashboards
- [ ] ELK stack (Elasticsearch, Logstash, Kibana)
- [ ] Distributed tracing (Jaeger)

### Phase 6: Advanced Features
- [ ] Service mesh (Istio)
- [ ] API gateway (Kong)
- [ ] Certificate management (cert-manager)
- [ ] Multi-cluster federation

---

## References

- **ORCA:** `03_AI_Automation/orca/docs/kubernetes.md`
- **GetUpSoft Site:** `01_Core_Platform/getupsoft-site/docs/kubernetes.md`
- **Kubernetes Docs:** https://kubernetes.io/docs/
- **Kustomize:** https://kustomize.io/

---

**Support:** For issues or questions, check service-specific docs or open an issue on GitHub.

