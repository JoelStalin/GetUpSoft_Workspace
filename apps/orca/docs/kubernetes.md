# ORCA in Kubernetes — Complete Operations Guide

**Version:** 0.2.0  
**Last Updated:** 2026-05-19  
**Author:** DevOps Team

---

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Docker Image](#docker-image)
4. [Local Testing](#local-testing)
5. [Kubernetes Deployment](#kubernetes-deployment)
6. [Configuration](#configuration)
7. [Operations](#operations)
8. [Troubleshooting](#troubleshooting)
9. [Security Considerations](#security-considerations)
10. [Multi-Replica Setup](#multi-replica-setup)

---

## Overview

ORCA (AI Automation Orchestrator) is a FastAPI-based service for generating:
- Test flows
- Automation scripts
- Interaction scripts
- Workflow blueprints

This guide covers containerization and Kubernetes deployment for both development and production environments.

**Architecture:**
- Language: Python 3.11+
- Framework: FastAPI
- Server: Uvicorn (0.0.0.0:8787)
- State: Local (.artifacts directory with SQLite)
- Namespace: `getupsoft`

---

## Prerequisites

### Local Machine
- Docker 20.10+
- Docker Compose (optional)
- Kubernetes CLI (kubectl) 1.24+
- Kustomize 5.0+ (or kubectl with kustomize support)

### Kubernetes Cluster
- Kubernetes 1.24+
- PersistentVolume provisioner (local or network storage)
- An Ingress Controller (optional, for external access)

### Credentials (if using API models)
- OpenAI API key
- Anthropic API key
- NVIDIA API key
- Any other model provider credentials

---

## Docker Image

### Build the Image

```bash
cd 03_AI_Automation/orca
docker build -t getupsoft/orca:local .
```

**Build Output:**
```
[+] Building 45.2s (11/11) FINISHED
...
```

### Verify the Build

```bash
docker inspect getupsoft/orca:local | grep -A 5 '"Cmd"'
```

Expected output (non-root user):
```json
"User": "orca",
"Cmd": ["uvicorn", "--factory", "ai_automation_orchestrator.webapp:create_app", "--host", "0.0.0.0", "--port", "8787"]
```

---

## Local Testing

### Run Container Locally

```bash
docker run --rm \
  -p 8787:8787 \
  --name orca-dev \
  getupsoft/orca:local
```

### Test Health Endpoint

```bash
curl -s http://localhost:8787/health | jq .
```

Expected response:
```json
{
  "status": "ok"
}
```

### Test with Environment Variables

```bash
docker run --rm \
  -p 8787:8787 \
  -e ORCA_CANONICAL_LANGUAGE=en \
  -e LOG_LEVEL=DEBUG \
  -v $(pwd)/.artifacts:/app/.artifacts \
  getupsoft/orca:local
```

### Run Tests in Container

```bash
docker run --rm \
  -v $(pwd)/tests:/app/tests \
  getupsoft/orca:local \
  python -m pytest tests/ -v
```

---

## Kubernetes Deployment

### Deployment Structure

```
deploy/k8s/
├── base/
│   ├── namespace.yaml          # Namespace: getupsoft
│   ├── serviceaccount.yaml     # ServiceAccount: orca
│   ├── configmap.yaml          # Configuration
│   ├── secret.example.yaml     # Template for secrets
│   ├── pvc.yaml                # PersistentVolumeClaim: 10Gi
│   ├── deployment.yaml         # Main deployment
│   ├── service.yaml            # ClusterIP service
│   ├── ingress.yaml            # Optional ingress
│   ├── hpa.yaml                # Optional autoscaler
│   └── kustomization.yaml      # Base kustomization
└── overlays/
    ├── dev/
    │   └── kustomization.yaml  # Dev override (1 replica, low resources)
    └── prod/
        └── kustomization.yaml  # Prod override (1 replica, high resources)
```

### Deploy to Kubernetes

#### Development Environment

```bash
kubectl apply -k deploy/k8s/overlays/dev
```

Verify deployment:
```bash
kubectl -n getupsoft get pods -l app.kubernetes.io/name=orca
kubectl -n getupsoft logs -f deployment/orca-dev-orca
```

#### Production Environment

```bash
# 1. Create secrets (before deploying)
kubectl create namespace getupsoft 2>/dev/null || true
kubectl -n getupsoft create secret generic orca-secrets \
  --from-literal=OPENAI_API_KEY="sk-..." \
  --from-literal=ANTHROPIC_API_KEY="sk-ant-..." \
  --dry-run=client -o yaml | kubectl apply -f -

# 2. Deploy
kubectl apply -k deploy/k8s/overlays/prod
```

Verify deployment:
```bash
kubectl -n getupsoft get pods -l app.kubernetes.io/name=orca-prod-orca
kubectl -n getupsoft logs -f deployment/orca-prod-orca
```

---

## Configuration

### Environment Variables

All variables are optional and have sensible defaults.

| Variable | Default | Description |
|----------|---------|-------------|
| `ORCA_CANONICAL_LANGUAGE` | `es` | Canonical language for prompts |
| `ORCA_LOW_CONFIDENCE_THRESHOLD` | `0.7` | NLP confidence threshold |
| `ORCA_TRANSCRIPT_HISTORY_ENABLED` | `true` | Enable transcript history |
| `LOG_LEVEL` | `INFO` | Logging level (DEBUG, INFO, WARNING, ERROR) |
| `PYTHONUNBUFFERED` | `1` | Unbuffered Python output |
| `AI_ORCHESTRATOR_CONFIG_PATH` | `/app/config/models.json` | Path to models config |

### ConfigMap

The `configmap.yaml` contains non-sensitive configuration:

```yaml
data:
  ORCA_CANONICAL_LANGUAGE: "es"
  ORCA_LOW_CONFIDENCE_THRESHOLD: "0.7"
  LOG_LEVEL: "INFO"
```

### Secrets

Create a `secret.yaml` from `secret.example.yaml`:

```bash
cp deploy/k8s/base/secret.example.yaml deploy/k8s/base/secret.yaml
# Edit secret.yaml with real values
kubectl apply -f deploy/k8s/base/secret.yaml
```

Then uncomment the secretRef in deployment.yaml:

```yaml
envFrom:
  - configMapRef:
      name: orca-config
  - secretRef:
      name: orca-secrets
```

---

## Operations

### Check Deployment Status

```bash
# List all ORCA resources
kubectl -n getupsoft get all -l app.kubernetes.io/name=orca

# Get pod status
kubectl -n getupsoft get pods -o wide

# Describe deployment
kubectl -n getupsoft describe deployment orca-dev-orca
```

### View Logs

```bash
# Current logs
kubectl -n getupsoft logs deployment/orca-dev-orca

# Follow logs (tail -f)
kubectl -n getupsoft logs -f deployment/orca-dev-orca

# Last 100 lines
kubectl -n getupsoft logs deployment/orca-dev-orca --tail=100

# All containers
kubectl -n getupsoft logs deployment/orca-dev-orca --all-containers=true
```

### Execute Commands in Pod

```bash
# Get pod name
POD=$(kubectl -n getupsoft get pods -l app.kubernetes.io/name=orca -o jsonpath='{.items[0].metadata.name}')

# Execute command
kubectl -n getupsoft exec -it $POD -- python -c "import ai_automation_orchestrator; print('OK')"

# Interactive shell
kubectl -n getupsoft exec -it $POD -- /bin/bash
```

### Check Service and Ingress

```bash
# Service
kubectl -n getupsoft get svc orca

# Endpoints
kubectl -n getupsoft get endpoints orca

# Ingress (if enabled)
kubectl -n getupsoft get ingress
```

### Port Forwarding (Local Access)

```bash
# Forward local 8787 to pod 8787
kubectl -n getupsoft port-forward svc/orca 8787:8787

# Then in another terminal:
curl http://localhost:8787/health
```

### Test Health Endpoint

```bash
# Direct HTTP request (requires port-forward or LoadBalancer)
curl http://orca.getupsoft.svc.cluster.local:8787/health

# Via port-forward
kubectl -n getupsoft port-forward svc/orca 8787:8787 &
curl http://localhost:8787/health
pkill -f "port-forward"
```

---

## Rolling Updates & Rollback

### Update Image Version

```bash
# Edit deployment to use new image
kubectl -n getupsoft set image deployment/orca-dev-orca \
  orca=getupsoft/orca:v0.3.0

# Check rollout status
kubectl -n getupsoft rollout status deployment/orca-dev-orca
```

### View Rollout History

```bash
kubectl -n getupsoft rollout history deployment/orca-dev-orca
```

### Rollback to Previous Version

```bash
kubectl -n getupsoft rollout undo deployment/orca-dev-orca
kubectl -n getupsoft rollout status deployment/orca-dev-orca
```

### Rollback to Specific Revision

```bash
kubectl -n getupsoft rollout undo deployment/orca-dev-orca --to-revision=1
```

---

## Persistence

### Artifacts Directory

ORCA stores local data in `.artifacts`:
- Downloaded models
- SQLite databases
- Transcript history
- Job artifacts

**Volume Configuration:**
```yaml
volumeMounts:
  - name: artifacts
    mountPath: /app/.artifacts
volumes:
  - name: artifacts
    persistentVolumeClaim:
      claimName: orca-artifacts-pvc
```

**PVC Details:**
```bash
kubectl -n getupsoft get pvc
kubectl -n getupsoft describe pvc orca-artifacts-pvc
```

**Check PVC Usage:**

```bash
POD=$(kubectl -n getupsoft get pods -l app.kubernetes.io/name=orca -o jsonpath='{.items[0].metadata.name}')
kubectl -n getupsoft exec $POD -- du -sh /app/.artifacts
```

---

## Cleanup

### Delete Deployment (Keep PVC)

```bash
kubectl delete -k deploy/k8s/overlays/dev
# or
kubectl -n getupsoft delete deployment orca-dev-orca
```

### Delete Deployment + PVC

```bash
# Delete all ORCA resources including PVC
kubectl -n getupsoft delete all,pvc -l app.kubernetes.io/name=orca
```

### Delete Entire Namespace

```bash
# WARNING: This deletes everything in the namespace
kubectl delete namespace getupsoft
```

---

## Troubleshooting

### Pod Won't Start

```bash
# Check pod events
kubectl -n getupsoft describe pod <pod-name>

# Check logs
kubectl -n getupsoft logs <pod-name>

# Check image pull
kubectl -n getupsoft get pods -o jsonpath='{.items[*].status.containerStatuses[0].imageID}'
```

### Health Check Failing

```bash
# Test health endpoint directly
kubectl -n getupsoft port-forward svc/orca 8787:8787
curl -v http://localhost:8787/health

# Check probe configuration
kubectl -n getupsoft get deployment orca-dev-orca -o jsonpath='{.spec.template.spec.containers[0].livenessProbe}'
```

### PVC Not Available

```bash
# Check PVC status
kubectl -n getupsoft get pvc

# Check PersistentVolume
kubectl get pv

# Check storage class
kubectl get storageclass
```

### Out of Memory

```bash
# Check current resource usage
kubectl -n getupsoft top pods

# Check resource limits
kubectl -n getupsoft get deployment orca-dev-orca -o jsonpath='{.spec.template.spec.containers[0].resources}'

# Increase limits in kustomization.yaml
```

### Model Download Fails

**Symptom:** Pod crashes after startup with timeout downloading models.

**Solution:**
1. Pre-populate `.artifacts` with models before deployment
2. Use init container to download models
3. Use model cache from Docker layer

```bash
# Pre-populate locally
docker run --rm -v $(pwd)/.artifacts:/app/.artifacts getupsoft/orca:local \
  python -c "from ai_automation_orchestrator.service import OrchestratorService; OrchestratorService()"

# Then mount as PVC
```

---

## Security Considerations

### Non-Root User

The container runs as user `orca` (UID 1000):
```yaml
securityContext:
  runAsNonRoot: true
  runAsUser: 1000
  runAsGroup: 1000
```

### No Privilege Escalation

```yaml
securityContext:
  allowPrivilegeEscalation: false
  capabilities:
    drop: [ALL]
```

### Network Policies (Optional)

Restrict traffic to ORCA pod:

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: orca-network-policy
  namespace: getupsoft
spec:
  podSelector:
    matchLabels:
      app.kubernetes.io/name: orca
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - podSelector:
        matchLabels:
          app: internal-client
    ports:
    - protocol: TCP
      port: 8787
  egress:
  - to:
    - podSelector: {}
    ports:
    - protocol: TCP
      port: 443  # HTTPS for APIs
    - protocol: TCP
      port: 53   # DNS
```

### Secrets Management

**Options:**
1. **Sealed Secrets** — Encrypt secrets at rest
2. **External Secrets Operator** — Sync from external vaults (HashiCorp, AWS Secrets Manager)
3. **Kube-Secrets** — Encrypt etcd at rest

Example with Sealed Secrets:
```bash
# Install sealed-secrets controller
kubectl apply -f https://github.com/bitnami-labs/sealed-secrets/releases/download/v0.18.0/controller.yaml

# Create sealed secret
echo -n 'sk-...' | kubectl create secret generic orca-secrets --dry-run=client --from-file=OPENAI_API_KEY=/dev/stdin -o yaml | kubeseal -o yaml > sealed-secret.yaml

kubectl apply -f sealed-secret.yaml
```

### Image Scanning

Scan for vulnerabilities before pushing to registry:

```bash
# Using Trivy
trivy image getupsoft/orca:local

# Using Snyk
snyk container test getupsoft/orca:local
```

---

## Multi-Replica Setup

**Current Status:** Single replica (1 pod) due to local SQLite state.

### Prerequisites for Multi-Replica

1. **Shared Storage:** NFS, GlusterFS, or managed equivalent
2. **Database:** Migrate from SQLite to PostgreSQL/MySQL
3. **Session Store:** Redis for distributed sessions

### Migration Path

1. **Phase 1 (Current):** Single pod with local storage
2. **Phase 2:** Multi-pod with shared NFS
3. **Phase 3:** External database + distributed cache
4. **Phase 4:** Full horizontal scaling with HPA

### Example: NFS-backed Multi-Replica

```yaml
# PVC with NFS
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: orca-artifacts-nfs
spec:
  accessModes:
    - ReadWriteMany  # Multiple pods can read/write
  resources:
    requests:
      storage: 50Gi
  storageClassName: nfs

# Deployment with 3 replicas
replicas: 3

# Enable HPA
kubectl apply -f deploy/k8s/base/hpa.yaml
```

---

## References

- **ORCA Repository:** [Link to main repo]
- **FastAPI Documentation:** https://fastapi.tiangolo.com/
- **Kubernetes Documentation:** https://kubernetes.io/docs/
- **Kustomize Guide:** https://kustomize.io/
- **Security Best Practices:** https://kubernetes.io/docs/concepts/security/

---

## Support & Feedback

For issues or questions:
1. Check logs: `kubectl -n getupsoft logs deployment/orca-dev-orca`
2. Run diagnostics: `kubectl -n getupsoft describe pod <pod-name>`
3. Check status: `kubectl -n getupsoft get all`
4. Report issues to the DevOps team

---

**Last Updated:** 2026-05-19
**Maintained By:** DevOps Team
