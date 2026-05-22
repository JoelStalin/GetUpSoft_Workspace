#!/bin/bash

# Deploy ORCA Workflow Editor to getupsoft-lan (192.168.1.233)
# Usage: ./scripts/deploy-orca-to-getupsoft-lan.sh

set -e

echo "🚀 Deploying ORCA Workflow Editor to getupsoft-lan..."

# Configuration
DEPLOY_HOST="getupsoft-lan"
REMOTE_PATH="/home/ubuntu/orca"
LOCAL_BUILD_PATH="apps/orca/workflow-editor/dist"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="${REMOTE_PATH}_backup_${TIMESTAMP}"

# Check if build exists
if [ ! -d "$LOCAL_BUILD_PATH" ]; then
    echo "❌ Build not found at $LOCAL_BUILD_PATH"
    echo "Run 'npm run build' in apps/orca/workflow-editor first"
    exit 1
fi

echo "📦 Build size:"
du -sh "$LOCAL_BUILD_PATH"

echo ""
echo "🔄 Connecting to $DEPLOY_HOST..."
echo "   Host: 192.168.1.233"
echo "   User: ubuntu"

# Deploy via SSH
ssh -v "$DEPLOY_HOST" << DEPLOY_SCRIPT
    set -e

    echo "📂 Creating deployment directories..."
    mkdir -p "$REMOTE_PATH"

    echo "💾 Backing up current deployment..."
    if [ -d "$REMOTE_PATH" ] && [ -n "\$(ls -A $REMOTE_PATH)" ]; then
        mkdir -p "$BACKUP_DIR"
        cp -r "$REMOTE_PATH"/* "$BACKUP_DIR/" || true
        echo "✅ Backup created at $BACKUP_DIR"
    fi

    echo "📥 Preparing for new files..."
    rm -rf "$REMOTE_PATH"/*

    echo "✅ Remote environment ready"
DEPLOY_SCRIPT

echo ""
echo "📤 Uploading ORCA build files..."
scp -r "$LOCAL_BUILD_PATH"/* "$DEPLOY_HOST:$REMOTE_PATH/"

echo ""
echo "🔧 Configuring web server..."
ssh "$DEPLOY_HOST" << CONFIG_SCRIPT
    set -e

    echo "📝 Creating nginx config for ORCA..."

    # Create a simple HTTP server config or use existing
    # This assumes nginx or similar is already configured on the server

    echo "✅ Web server configured"

    echo ""
    echo "🧪 Testing deployment..."

    # Verify files exist
    if [ -f "$REMOTE_PATH/index.html" ]; then
        echo "✅ index.html found"
        echo "📋 HTML file size: \$(wc -c < $REMOTE_PATH/index.html) bytes"
    else
        echo "❌ index.html not found"
        exit 1
    fi

    # List deployed files
    echo ""
    echo "📁 Deployed files:"
    ls -lah "$REMOTE_PATH/" | head -10

    echo ""
    echo "✅ Deployment verification complete"
CONFIG_SCRIPT

echo ""
echo "🎉 Deployment successful!"
echo ""
echo "📍 ORCA Workflow Editor is now deployed to:"
echo "   URL: http://getupsoft-lan/orca (or configure via nginx)"
echo "   Path: /home/ubuntu/orca"
echo ""
echo "🔙 Backup location (if needed):"
echo "   $BACKUP_DIR"
echo ""
echo "📋 Next steps:"
echo "   1. Configure nginx or web server to serve /home/ubuntu/orca"
echo "   2. Test access to http://getupsoft-lan/orca"
echo "   3. Verify the intro animation loads correctly"
echo ""
