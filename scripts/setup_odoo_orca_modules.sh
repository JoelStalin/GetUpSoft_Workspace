#!/bin/bash
#
# Setup Odoo ORCA Modules - Automatic Configuration
# Purpose: Copy/symlink v19 ORCA modules to Odoo addons directory
# Usage: ./setup_odoo_orca_modules.sh [copy|symlink|config]

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
REPO_MODULES="C:\Users\yoeli\Documents\GetUpSoft_Workspace\02_Odoo_ERP\Odoo_Consolidated_Library\v19\Modules"
ODOO_CONF="${1:-./../../../etc/odoo/odoo.conf}"
ACTION="${2:-copy}"

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}Odoo ORCA Modules Setup${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""
echo "Repository modules path: $REPO_MODULES"
echo "Odoo config file: $ODOO_CONF"
echo "Action: $ACTION"
echo ""

# Function to detect Odoo installation
detect_odoo() {
    echo -e "${YELLOW}🔍 Detecting Odoo installation...${NC}"

    # Try to find odoo-bin
    ODOO_BIN=$(which odoo-bin 2>/dev/null || echo "")

    if [ -z "$ODOO_BIN" ]; then
        echo -e "${RED}❌ odoo-bin not found in PATH${NC}"
        echo "Please ensure Odoo is installed and odoo-bin is in PATH"
        return 1
    fi

    echo -e "${GREEN}✅ odoo-bin found: $ODOO_BIN${NC}"

    # Try to extract addons path from config
    if [ -f "$ODOO_CONF" ]; then
        ADDONS_PATH=$(grep "^addons_path" "$ODOO_CONF" | cut -d= -f2 | tr -d ' ' | head -1)
        if [ -n "$ADDONS_PATH" ]; then
            echo -e "${GREEN}✅ Addons path from config: $ADDONS_PATH${NC}"
            return 0
        fi
    fi

    # Default paths
    for path in \
        "/opt/odoo/addons" \
        "/opt/odoo/extra-addons" \
        "/opt/odoo19/addons" \
        "/usr/lib/python3/dist-packages/odoo/addons" \
        "C:/Odoo/addons" \
        "C:/Odoo19/addons"; do

        if [ -d "$path" ]; then
            echo -e "${GREEN}✅ Found addons directory: $path${NC}"
            ADDONS_PATH="$path"
            return 0
        fi
    done

    echo -e "${RED}❌ Could not detect addons path${NC}"
    return 1
}

# Function to copy modules
copy_modules() {
    if [ ! -d "$REPO_MODULES" ]; then
        echo -e "${RED}❌ Repository modules not found at: $REPO_MODULES${NC}"
        return 1
    fi

    if [ -z "$ADDONS_PATH" ]; then
        echo -e "${RED}❌ Addons path not set${NC}"
        return 1
    fi

    echo ""
    echo -e "${YELLOW}📋 Copying modules to: $ADDONS_PATH${NC}"
    echo ""

    # List of modules to copy
    MODULES=(
        "base_orca_integration"
        "account_extended"
        "asset_extended"
        "bank_extended"
        "invoice_extended"
        "l10n_do_accounting"
        "l10n_do_accounting_report"
        "l10n_do_pos"
        "l10n_do_rnc_search"
        "payment_extended"
        "pos_extended"
        "sale_extended"
        "stock_extended"
    )

    for module in "${MODULES[@]}"; do
        src="$REPO_MODULES/$module"
        dst="$ADDONS_PATH/$module"

        if [ ! -d "$src" ]; then
            echo -e "${RED}❌ Module not found: $module${NC}"
            continue
        fi

        if [ -d "$dst" ]; then
            echo -e "${YELLOW}⚠️  Module already exists: $module (backing up)${NC}"
            mv "$dst" "$dst.backup.$(date +%s)"
        fi

        cp -r "$src" "$dst"
        echo -e "${GREEN}✅ Copied: $module${NC}"
    done

    echo ""
    echo -e "${GREEN}✅ All modules copied successfully${NC}"
}

# Function to create symlinks
create_symlinks() {
    if [ ! -d "$REPO_MODULES" ]; then
        echo -e "${RED}❌ Repository modules not found at: $REPO_MODULES${NC}"
        return 1
    fi

    if [ -z "$ADDONS_PATH" ]; then
        echo -e "${RED}❌ Addons path not set${NC}"
        return 1
    fi

    echo ""
    echo -e "${YELLOW}🔗 Creating symlinks in: $ADDONS_PATH${NC}"
    echo ""

    MODULES=(
        "base_orca_integration"
        "account_extended"
        "asset_extended"
        "bank_extended"
        "invoice_extended"
        "l10n_do_accounting"
        "l10n_do_accounting_report"
        "l10n_do_pos"
        "l10n_do_rnc_search"
        "payment_extended"
        "pos_extended"
        "sale_extended"
        "stock_extended"
    )

    for module in "${MODULES[@]}"; do
        src="$REPO_MODULES/$module"
        dst="$ADDONS_PATH/$module"

        if [ ! -d "$src" ]; then
            echo -e "${RED}❌ Module not found: $module${NC}"
            continue
        fi

        if [ -L "$dst" ]; then
            echo -e "${YELLOW}⚠️  Symlink already exists: $module${NC}"
            continue
        fi

        if [ -d "$dst" ]; then
            echo -e "${YELLOW}⚠️  Directory exists (moving to backup): $module${NC}"
            mv "$dst" "$dst.backup.$(date +%s)"
        fi

        ln -s "$src" "$dst"
        echo -e "${GREEN}✅ Symlinked: $module${NC}"
    done

    echo ""
    echo -e "${GREEN}✅ All symlinks created successfully${NC}"
}

# Function to configure odoo.conf
configure_odoo_conf() {
    if [ ! -f "$ODOO_CONF" ]; then
        echo -e "${RED}❌ Odoo config file not found: $ODOO_CONF${NC}"
        return 1
    fi

    echo ""
    echo -e "${YELLOW}📝 Configuring odoo.conf...${NC}"
    echo ""

    # Backup config
    cp "$ODOO_CONF" "$ODOO_CONF.backup.$(date +%s)"
    echo -e "${BLUE}Backup created: $ODOO_CONF.backup.$(date +%s)${NC}"

    # Get current addons_path
    CURRENT_PATH=$(grep "^addons_path" "$ODOO_CONF" | cut -d= -f2- || echo "/opt/odoo/addons")

    # Add repository path to addons_path
    NEW_PATH="$REPO_MODULES,$CURRENT_PATH"

    # Update config
    if grep -q "^addons_path" "$ODOO_CONF"; then
        sed -i "s|^addons_path.*|addons_path = $NEW_PATH|" "$ODOO_CONF"
    else
        echo "addons_path = $NEW_PATH" >> "$ODOO_CONF"
    fi

    echo -e "${GREEN}✅ odoo.conf updated${NC}"
    echo -e "${BLUE}New addons_path: $NEW_PATH${NC}"
}

# Main execution
case "$ACTION" in
    copy)
        detect_odoo && copy_modules
        ;;
    symlink)
        detect_odoo && create_symlinks
        ;;
    config)
        detect_odoo && configure_odoo_conf
        ;;
    all)
        detect_odoo && copy_modules && configure_odoo_conf
        ;;
    *)
        echo -e "${YELLOW}Usage: $0 [copy|symlink|config|all]${NC}"
        echo ""
        echo "Actions:"
        echo "  copy    - Copy modules to Odoo addons directory"
        echo "  symlink - Create symlinks (recommended for development)"
        echo "  config  - Update odoo.conf to include repository path"
        echo "  all     - Copy modules AND update config"
        echo ""
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}✅ Setup complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Restart Odoo: systemctl restart odoo"
echo "2. Refresh modules: odoo-bin -d <database> -u base --stop-after-init"
echo "3. Check Odoo UI: http://localhost:8069 → Modules"
echo ""
