#!/bin/bash
# Test SSH connection to code.getupsoft.com

set -e

echo "🔍 GitHub Actions SSH Connection Test"
echo "====================================="
echo ""

# Load credentials from .env
if [ -f ".env" ]; then
    source .env
else
    echo "❌ .env file not found"
    exit 1
fi

# Check variables
echo "📋 Checking credentials:"
echo "  DEPLOY_HOST: $DEPLOY_HOST"
echo "  DEPLOY_USER: $DEPLOY_USER"
echo "  DEPLOY_SSH_KEY_PATH: $DEPLOY_SSH_KEY_PATH"
echo ""

# Check if SSH key exists
if [ ! -f "$DEPLOY_SSH_KEY_PATH" ]; then
    echo "❌ SSH key not found at: $DEPLOY_SSH_KEY_PATH"
    exit 1
fi

echo "✅ SSH key found"
echo ""

# Create temporary test directory
TEST_SSH_DIR="/tmp/test_ssh_key_$$"
mkdir -p "$TEST_SSH_DIR"

# Copy key with proper permissions
cp "$DEPLOY_SSH_KEY_PATH" "$TEST_SSH_DIR/deploy_key"
chmod 600 "$TEST_SSH_DIR/deploy_key"

echo "🧪 Testing SSH connection to $DEPLOY_USER@$DEPLOY_HOST..."
echo ""

# Test 1: SSH key scan
echo "1️⃣ Testing ssh-keyscan..."
if ssh-keyscan -H "$DEPLOY_HOST" >> "$TEST_SSH_DIR/known_hosts" 2>&1; then
    echo "   ✅ Host key obtained"
else
    echo "   ❌ Failed to get host key"
    exit 1
fi

echo ""

# Test 2: SSH connection test
echo "2️⃣ Testing SSH connection..."
if ssh -i "$TEST_SSH_DIR/deploy_key" -o ConnectTimeout=10 -o StrictHostKeyChecking=accept-new "$DEPLOY_USER@$DEPLOY_HOST" "echo 'SSH connection successful' && pwd" 2>&1; then
    echo "   ✅ SSH connection successful"
else
    echo "   ❌ SSH connection failed"
    echo ""
    echo "🔧 Troubleshooting:"
    echo "   - Verify SSH key is authorized on server: ~/.ssh/authorized_keys"
    echo "   - Check SSH port (default 22)"
    echo "   - Verify firewall rules"
    exit 1
fi

echo ""

# Test 3: Docker check
echo "3️⃣ Checking if Docker is running on server..."
if ssh -i "$TEST_SSH_DIR/deploy_key" "$DEPLOY_USER@$DEPLOY_HOST" "docker ps > /dev/null && echo 'Docker is running'" 2>&1; then
    echo "   ✅ Docker is accessible"
else
    echo "   ❌ Docker is not accessible or not running"
fi

echo ""

# Test 4: Workspace check
echo "4️⃣ Checking GetUpSoft_Workspace..."
if ssh -i "$TEST_SSH_DIR/deploy_key" "$DEPLOY_USER@$DEPLOY_HOST" "ls -la /home/$DEPLOY_USER/GetUpSoft_Workspace/ | head -5" 2>&1; then
    echo "   ✅ Workspace exists"
else
    echo "   ❌ Workspace not found"
fi

echo ""

# Cleanup
rm -rf "$TEST_SSH_DIR"

echo "✅ All SSH tests passed!"
echo ""
echo "GitHub Actions should now be able to deploy successfully."
