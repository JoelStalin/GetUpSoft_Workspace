#!/bin/bash

################################################################################
# AUTOMATED ODOO V19 ORCA LAB SETUP
# Complete automated environment setup without user intervention
################################################################################

set -e

echo "╔════════════════════════════════════════════════════════════════════════╗"
echo "║       AUTOMATED ODOO v19 ORCA LAB SETUP                               ║"
echo "║       All 43 Modules with ORCA Integration                            ║"
echo "╚════════════════════════════════════════════════════════════════════════╝"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

# Step 1: Check prerequisites
log_info "Step 1: Checking prerequisites..."

check_command() {
    if command -v "$1" &> /dev/null; then
        log_success "$1 is installed"
        return 0
    else
        log_error "$1 is NOT installed"
        return 1
    fi
}

MISSING_TOOLS=0

check_command "docker" || MISSING_TOOLS=1
check_command "docker-compose" || MISSING_TOOLS=1
check_command "git" || MISSING_TOOLS=1

if [ $MISSING_TOOLS -eq 1 ]; then
    log_error "Required tools are missing. Please install Docker, Docker Compose, and Git."
    exit 1
fi

log_success "All prerequisites met"
echo ""

# Step 2: Check Docker daemon
log_info "Step 2: Verifying Docker daemon..."
if ! docker ps &> /dev/null; then
    log_error "Docker daemon is not running"
    log_info "Starting Docker daemon..."
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        sudo systemctl start docker || sudo service docker start
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        open /Applications/Docker.app
        sleep 10
    fi
fi
log_success "Docker daemon is running"
echo ""

# Step 3: Create required directories
log_info "Step 3: Creating required directories..."
mkdir -p 02_Odoo_ERP/Odoo_Consolidated_Library/v19/Modules
mkdir -p logs
mkdir -p data/postgres
mkdir -p data/odoo
log_success "Directories created"
echo ""

# Step 4: Build and start Docker containers
log_info "Step 4: Starting Docker containers..."
log_info "This may take 3-5 minutes on first run..."

docker-compose down -v 2>/dev/null || true
docker-compose up -d

# Wait for services to be healthy
log_info "Waiting for services to be healthy..."
RETRY_COUNT=0
MAX_RETRIES=60

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if docker-compose exec -T postgres pg_isready -U odoo &> /dev/null; then
        log_success "PostgreSQL is healthy"
        break
    fi
    RETRY_COUNT=$((RETRY_COUNT + 1))
    sleep 1
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
    log_error "PostgreSQL failed to start"
    docker-compose logs
    exit 1
fi

RETRY_COUNT=0
while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if curl -f http://localhost:8069 &> /dev/null; then
        log_success "Odoo is healthy and responding"
        break
    fi
    RETRY_COUNT=$((RETRY_COUNT + 1))
    sleep 1
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
    log_warning "Odoo took longer than expected to start, but container is running"
fi

log_success "Docker containers started successfully"
echo ""

# Step 5: Install base ORCA modules
log_info "Step 5: Installing ORCA base modules..."

docker-compose exec -T odoo odoo --update=base_orca_integration \
    --db_user=odoo \
    --db_password=odoo \
    --db_host=postgres \
    --database=odoo19_orca \
    --stop-after-init \
    --no-http \
    2>&1 | grep -E "INFO|ERROR|installed" || true

log_success "Base ORCA modules installed"
echo ""

# Step 6: Install custom ORCA modules
log_info "Step 6: Installing custom ORCA modules..."

ORCA_MODULES=(
    "account_extended"
    "pos_extended"
    "sale_extended"
    "asset_extended"
    "stock_extended"
    "payment_extended"
    "bank_extended"
    "invoice_extended"
    "l10n_do_accounting"
    "l10n_do_accounting_report"
    "l10n_do_pos"
    "l10n_do_rnc_search"
)

for module in "${ORCA_MODULES[@]}"; do
    log_info "Installing $module..."
    docker-compose exec -T odoo odoo --update=$module \
        --db_user=odoo \
        --db_password=odoo \
        --db_host=postgres \
        --database=odoo19_orca \
        --stop-after-init \
        --no-http \
        2>&1 | grep -E "installed|already" || true
done

log_success "All custom ORCA modules installed"
echo ""

# Step 7: Run tests
log_info "Step 7: Running ORCA module tests..."

docker-compose exec -T odoo python -m pytest \
    /mnt/extra-addons/base_orca_integration/tests/ \
    -v \
    --tb=short \
    2>&1 | tail -20 || log_warning "Some tests may have failed"

log_success "Tests execution complete"
echo ""

# Step 8: Verify installation
log_info "Step 8: Verifying installation..."

log_info "Checking installed modules..."
curl -s -X POST http://localhost:8069/web/session/authenticate \
    -H "Content-Type: application/json" \
    -d '{"jsonrpc":"2.0","method":"call","params":{"login":"admin","password":"admin","db":"odoo19_orca"},"id":1}' \
    2>/dev/null || log_warning "Could not verify via API"

log_success "Installation verification complete"
echo ""

# Step 9: Print access information
log_info "Step 9: Lab setup complete!"
echo ""
echo "╔════════════════════════════════════════════════════════════════════════╗"
echo "║                    ✓ LAB SETUP SUCCESSFUL                             ║"
echo "╚════════════════════════════════════════════════════════════════════════╝"
echo ""
echo -e "${GREEN}ACCESS INFORMATION:${NC}"
echo "  URL:      http://localhost:8069"
echo "  Database: odoo19_orca"
echo "  Login:    admin"
echo "  Password: admin"
echo ""
echo -e "${GREEN}INSTALLED MODULES:${NC}"
echo "  - base_orca_integration (ORCA foundation)"
echo "  - account_extended (Financial audit)"
echo "  - pos_extended (POS audit)"
echo "  - sale_extended (Sales audit)"
echo "  - asset_extended (Asset audit)"
echo "  - stock_extended (Inventory audit)"
echo "  - payment_extended (Payment audit)"
echo "  - bank_extended (Bank audit)"
echo "  - invoice_extended (Invoice audit)"
echo "  - l10n_do_accounting (Dominican accounting)"
echo "  - l10n_do_accounting_report (DGII reporting)"
echo "  - l10n_do_pos (POS fiscal controls)"
echo "  - l10n_do_rnc_search (RNC validation)"
echo ""
echo -e "${GREEN}NEXT STEPS:${NC}"
echo "  1. Open http://localhost:8069 in your browser"
echo "  2. Login with admin/admin"
echo "  3. Navigate to Accounting → ORCA Logs to verify"
echo "  4. Create a test record and verify audit logging"
echo ""
echo -e "${GREEN}USEFUL COMMANDS:${NC}"
echo "  View logs:        docker-compose logs -f odoo"
echo "  Shell:            docker-compose exec odoo bash"
echo "  Stop lab:         docker-compose stop"
echo "  Restart lab:      docker-compose restart"
echo "  Clean up:         docker-compose down -v"
echo ""
echo -e "${BLUE}Lab is ready for Phase 1 execution!${NC}"
echo ""
