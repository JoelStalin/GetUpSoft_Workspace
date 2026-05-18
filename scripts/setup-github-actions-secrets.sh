#!/bin/bash
# Interactive setup of GitHub Actions secrets

set -e

REPO="JoelStalin/GetUpSoft_Workspace"

echo "🔐 GitHub Actions Secrets Setup"
echo "================================"
echo ""
echo "Repository: $REPO"
echo ""

# Check if gh CLI is available
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) not found."
    echo "Install from: https://cli.github.com/"
    exit 1
fi

# Check authentication
if ! gh auth status &> /dev/null; then
    echo "❌ Not authenticated to GitHub."
    echo "Run: gh auth login"
    exit 1
fi

echo "✅ GitHub CLI ready"
echo ""

# Collect secrets
read -p "Enter DEPLOY_HOST (e.g., code.getupsoft.com): " DEPLOY_HOST
read -p "Enter DEPLOY_USER (e.g., ubuntu): " DEPLOY_USER

echo ""
echo "SSH Private Key:"
read -p "Enter path to SSH private key (e.g., ~/.ssh/github_deploy_key): " SSH_KEY_PATH
SSH_KEY_PATH="${SSH_KEY_PATH/#\~/$HOME}"

if [ ! -f "$SSH_KEY_PATH" ]; then
    echo "❌ SSH key not found at: $SSH_KEY_PATH"
    exit 1
fi

DEPLOY_SSH_PRIVATE_KEY=$(cat "$SSH_KEY_PATH")

echo ""
echo "Cloudflare:"
read -p "Enter CLOUDFLARE_ZONE_ID: " CLOUDFLARE_ZONE_ID
read -sp "Enter CLOUDFLARE_API_TOKEN: " CLOUDFLARE_API_TOKEN
echo ""

# Validate inputs
if [ -z "$DEPLOY_HOST" ] || [ -z "$DEPLOY_USER" ] || [ -z "$CLOUDFLARE_ZONE_ID" ] || [ -z "$CLOUDFLARE_API_TOKEN" ]; then
    echo "❌ Missing required values"
    exit 1
fi

# Confirm
echo ""
echo "📋 Secrets to be added:"
echo "  DEPLOY_HOST: $DEPLOY_HOST"
echo "  DEPLOY_USER: $DEPLOY_USER"
echo "  DEPLOY_SSH_PRIVATE_KEY: (from $SSH_KEY_PATH)"
echo "  CLOUDFLARE_ZONE_ID: $CLOUDFLARE_ZONE_ID"
echo "  CLOUDFLARE_API_TOKEN: (hidden)"
echo ""
read -p "Continue? (y/n): " CONFIRM

if [ "$CONFIRM" != "y" ]; then
    echo "Cancelled."
    exit 0
fi

# Add secrets
echo ""
echo "📤 Adding secrets to GitHub..."

gh secret set DEPLOY_HOST --repo "$REPO" --body "$DEPLOY_HOST"
echo "✅ DEPLOY_HOST added"

gh secret set DEPLOY_USER --repo "$REPO" --body "$DEPLOY_USER"
echo "✅ DEPLOY_USER added"

gh secret set DEPLOY_SSH_PRIVATE_KEY --repo "$REPO" --body "$DEPLOY_SSH_PRIVATE_KEY"
echo "✅ DEPLOY_SSH_PRIVATE_KEY added"

gh secret set CLOUDFLARE_ZONE_ID --repo "$REPO" --body "$CLOUDFLARE_ZONE_ID"
echo "✅ CLOUDFLARE_ZONE_ID added"

gh secret set CLOUDFLARE_API_TOKEN --repo "$REPO" --body "$CLOUDFLARE_API_TOKEN"
echo "✅ CLOUDFLARE_API_TOKEN added"

echo ""
echo "✅ All secrets added successfully!"
echo ""
echo "Next step: Run ./scripts/validate-github-actions-secrets.sh to verify"
