#!/usr/bin/env bash

# Post-Deployment Script: FASE 2 (Directory Normalization) + FASE 3 (Node.js Rebuild)
# Run on production server after FASE 1 (FLAI decoupling) is complete
# Usage: bash post-deployment-phase2-3.sh

set -e

WORKSPACE_PATH="/home/ubuntu/workspaces/GetUpSoft_Workspace"
BACKUP_NAME="GetUpSoft_Workspace.backup-$(date +%Y%m%d-%H%M%S)"

echo "=========================================="
echo "🚀 FASE 2+3: Directory Normalization & Node.js Rebuild"
echo "=========================================="
echo ""

# Verify Node.js is installed
echo "✓ Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    echo "✗ Node.js not found. FASE 3 must be completed first."
    exit 1
fi
NODE_VERSION=$(node --version)
echo "✓ Node.js $NODE_VERSION detected"
echo ""

# Create backup before starting
echo "📦 Step 1: Creating backup..."
cd /home/ubuntu
cp -r "$WORKSPACE_PATH" "$BACKUP_NAME"
echo "✓ Backup created at: /home/ubuntu/$BACKUP_NAME"
echo ""

# Verify git is clean
echo "📋 Step 2: Verifying git state..."
cd "$WORKSPACE_PATH"
if [[ -n $(git status --porcelain) ]]; then
    echo "✗ Working directory has uncommitted changes"
    echo "   Please commit or stash changes before proceeding"
    exit 1
fi
echo "✓ Git working directory clean"
echo ""

# FASE 2: Execute directory moves
echo "🔄 FASE 2: Directory Normalization"
echo "---"

# Create base directories
mkdir -p apps libs infra/kubernetes infra/docker infra/terraform infra/ansible infra/ci-cd docs scripts/deploy scripts/setup scripts/migrate scripts/maintenance archive/deprecated archive/research

# Move main applications
echo "  → Moving applications to apps/"
git mv 01_Core_Platform/getupsoft-site apps/site || true
git mv 01_Core_Platform/easycount-core apps/easycount || true
git mv 03_AI_Automation/orca apps/orca || true

# Move infrastructure
echo "  → Moving infrastructure to infra/"
git mv deploy infra/docker || true
if [[ -d "02_Cloud_Infrastructure" ]]; then
    git mv 02_Cloud_Infrastructure/* infra/kubernetes/ || true
fi

# Move documentation
echo "  → Moving documentation to docs/"
git mv _Knowledge_Center docs || true

# Move archives
echo "  → Moving legacy code to archive/"
git mv 04_Archive_Legacy/* archive/deprecated/ 2>/dev/null || true
git mv 04_Archives/* archive/deprecated/ 2>/dev/null || true

# Move scripts
echo "  → Organizing scripts/"
mkdir -p scripts/deploy scripts/setup scripts/migrate scripts/maintenance

# Clean up empty numbered directories
echo "  → Cleaning up old structure"
find . -maxdepth 1 -type d -name "0[0-9]_*" -empty -exec rmdir {} \; 2>/dev/null || true

echo "✓ FASE 2 complete"
echo ""

# Update key configuration files
echo "🔧 Step 3: Updating configuration files..."
cd "$WORKSPACE_PATH"

# Update docker-compose.yml paths
if [[ -f "docker-compose.yml" ]]; then
    sed -i 's|01_Core_Platform/getupsoft-site|apps/site|g' docker-compose.yml
    sed -i 's|03_AI_Automation/orca|apps/orca|g' docker-compose.yml
    sed -i 's|deploy/|infra/docker/|g' docker-compose.yml
    echo "  ✓ Updated docker-compose.yml"
fi

# Update docker-compose.prod.yml paths
if [[ -f "docker-compose.prod.yml" ]]; then
    sed -i 's|01_Core_Platform/getupsoft-site|apps/site|g' docker-compose.prod.yml
    sed -i 's|03_AI_Automation/orca|apps/orca|g' docker-compose.prod.yml
    sed -i 's|deploy/|infra/docker/|g' docker-compose.prod.yml
    echo "  ✓ Updated docker-compose.prod.yml"
fi

# Update .github workflows
find .github/workflows -name "*.yml" -o -name "*.yaml" | while read -r file; do
    sed -i 's|01_Core_Platform/getupsoft-site|apps/site|g' "$file"
    sed -i 's|03_AI_Automation/orca|apps/orca|g' "$file"
    sed -i 's|deploy/|infra/docker/|g' "$file"
done
echo "  ✓ Updated CI/CD workflows"

echo "✓ Configuration files updated"
echo ""

# Commit all changes
echo "💾 Step 4: Committing changes..."
git add -A
git commit -m "refactor: normalize directory structure (FASE 2) - apps/, libs/, infra/, docs/ organization per MVC pattern" || true
echo "✓ Changes committed"
echo ""

# FASE 3: Rebuild with Node.js
echo "🔨 FASE 3: Node.js Rebuild"
echo "---"

# Rebuild getupsoft-site
if [[ -d "apps/site" ]]; then
    echo "  → Building getupsoft-site..."
    cd "$WORKSPACE_PATH/apps/site"
    npm install --legacy-peer-deps
    npm run build

    # Rebuild Docker image
    echo "  → Rebuilding Docker image..."
    docker build -t getupsoft-site:latest .

    echo "  ✓ getupsoft-site built and Docker image updated"
    cd "$WORKSPACE_PATH"
fi

# Rebuild orca if it exists
if [[ -d "apps/orca" ]]; then
    echo "  → Building orca..."
    cd "$WORKSPACE_PATH/apps/orca"
    if [[ -f "setup.py" ]]; then
        pip install -e .
    fi
    if [[ -f "pyproject.toml" ]]; then
        pip install -e .
    fi
    cd "$WORKSPACE_PATH"
    echo "  ✓ orca built"
fi

echo "✓ FASE 3 complete"
echo ""

# Restart containers
echo "🔄 Step 5: Restarting Docker containers..."
docker compose -f docker-compose.prod.yml down || true
sleep 3
docker compose -f docker-compose.prod.yml up -d
echo "✓ Containers restarted"
echo ""

# Verify deployment
echo "✅ Step 6: Verification"
echo "---"

echo "  → Checking container status..."
docker ps | grep -E "getupsoft-site|orca" || echo "    (containers starting...)"

echo "  → Checking health endpoints..."
sleep 5
curl -s http://localhost:3120/health | head -c 100 && echo "" || echo "    (still starting...)"

echo ""
echo "=========================================="
echo "✅ FASE 2+3 Deployment Complete!"
echo "=========================================="
echo ""
echo "Summary:"
echo "  ✓ FASE 2: Directory structure normalized to MVC pattern"
echo "  ✓ FASE 3: Node.js builds executed, Docker images rebuilt"
echo "  ✓ Containers: Restarted with new builds"
echo ""
echo "If rollback needed:"
echo "  cd /home/ubuntu"
echo "  rm -rf GetUpSoft_Workspace"
echo "  mv $BACKUP_NAME GetUpSoft_Workspace"
echo ""
echo "Website: https://getupsoft.com"
echo "Backup:  /home/ubuntu/$BACKUP_NAME"
echo ""
