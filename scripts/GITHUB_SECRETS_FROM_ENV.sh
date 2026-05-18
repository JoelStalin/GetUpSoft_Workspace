#!/bin/bash
# Extract and set GitHub secrets from .env file

set -e

echo "📋 GitHub Actions Secrets Setup from .env"
echo "=========================================="
echo ""

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "❌ .env file not found"
    exit 1
fi

# Source the .env file
source .env

# Validate required variables
REQUIRED_VARS=(
    "GITHUB_TOKEN"
    "DEPLOY_HOST"
    "DEPLOY_USER"
    "DEPLOY_SSH_PRIVATE_KEY"
    "CLOUDFLARE_ZONE_ID"
    "CLOUDFLARE_API_TOKEN"
)

echo "🔍 Checking .env variables:"
MISSING_VARS=()
for VAR in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!VAR}" ]; then
        MISSING_VARS+=("$VAR")
        echo "  ❌ $VAR (missing)"
    else
        echo "  ✅ $VAR (found)"
    fi
done

if [ ${#MISSING_VARS[@]} -gt 0 ]; then
    echo ""
    echo "❌ Missing variables in .env:"
    for VAR in "${MISSING_VARS[@]}"; do
        echo "  - $VAR"
    done
    exit 1
fi

echo ""
echo "✅ All variables found in .env"
echo ""

# Check GitHub CLI
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) not found"
    echo "Install from: https://cli.github.com/"
    exit 1
fi

# Authenticate with GitHub
if ! gh auth status > /dev/null 2>&1; then
    echo "⚠️  Not authenticated to GitHub"
    echo "Run: gh auth login"
    exit 1
fi

REPO="JoelStalin/GetUpSoft_Workspace"

echo "📤 Setting GitHub secrets for: $REPO"
echo ""

# Add secrets
gh secret set DEPLOY_HOST --repo "$REPO" --body "$DEPLOY_HOST"
echo "✅ DEPLOY_HOST = $DEPLOY_HOST"

gh secret set DEPLOY_USER --repo "$REPO" --body "$DEPLOY_USER"
echo "✅ DEPLOY_USER = $DEPLOY_USER"

gh secret set DEPLOY_SSH_PRIVATE_KEY --repo "$REPO" --body "$DEPLOY_SSH_PRIVATE_KEY"
echo "✅ DEPLOY_SSH_PRIVATE_KEY ($(echo "$DEPLOY_SSH_PRIVATE_KEY" | wc -c) chars)"

gh secret set CLOUDFLARE_ZONE_ID --repo "$REPO" --body "$CLOUDFLARE_ZONE_ID"
echo "✅ CLOUDFLARE_ZONE_ID = $CLOUDFLARE_ZONE_ID"

gh secret set CLOUDFLARE_API_TOKEN --repo "$REPO" --body "$CLOUDFLARE_API_TOKEN"
echo "✅ CLOUDFLARE_API_TOKEN (hidden)"

echo ""
echo "✅ All GitHub secrets configured!"
echo ""
echo "Verify with:"
echo "  ./scripts/validate-github-actions-secrets.sh"
