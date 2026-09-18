#!/bin/bash
# Validate GitHub Actions Secrets Configuration

set -e

echo "🔍 GitHub Actions Secrets Validation"
echo "===================================="
echo ""

REPO="JoelStalin/GetUpSoft_Workspace"
REQUIRED_SECRETS=(
    "DEPLOY_HOST"
    "DEPLOY_USER"
    "DEPLOY_SSH_PRIVATE_KEY"
    "CLOUDFLARE_ZONE_ID"
    "CLOUDFLARE_API_TOKEN"
)

echo "📦 Repository: $REPO"
echo ""

# Check if gh CLI is available
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) not found. Install with: brew install gh"
    exit 1
fi

# Check if authenticated
if ! gh auth status &> /dev/null; then
    echo "❌ Not authenticated to GitHub. Run: gh auth login"
    exit 1
fi

echo "✅ GitHub CLI authenticated"
echo ""

# Check secrets
echo "🔐 Checking secrets:"
MISSING_SECRETS=()
FOUND_SECRETS=()

for SECRET in "${REQUIRED_SECRETS[@]}"; do
    # Try to get secret value (will return error if doesn't exist)
    if gh secret list --repo "$REPO" | grep -q "^$SECRET"; then
        FOUND_SECRETS+=("$SECRET")
        echo "  ✅ $SECRET (configured)"
    else
        MISSING_SECRETS+=("$SECRET")
        echo "  ❌ $SECRET (MISSING)"
    fi
done

echo ""
echo "📊 Summary:"
echo "  Found: ${#FOUND_SECRETS[@]}/${#REQUIRED_SECRETS[@]}"
echo "  Missing: ${#MISSING_SECRETS[@]}"

if [ ${#MISSING_SECRETS[@]} -gt 0 ]; then
    echo ""
    echo "❌ Configuration Incomplete!"
    echo ""
    echo "Missing secrets:"
    for SECRET in "${MISSING_SECRETS[@]}"; do
        echo "  - $SECRET"
    done
    echo ""
    echo "To add secrets:"
    echo "  gh secret set SECRET_NAME --repo $REPO --body 'secret-value'"
    echo ""
    exit 1
fi

echo ""
echo "✅ All required secrets are configured!"
echo ""

# Check if workflows exist
echo "📋 Checking workflows:"
if gh workflow list --repo "$REPO" | grep -q "deploy-getupsoft-site"; then
    echo "  ✅ deploy-getupsoft-site.yml exists"
else
    echo "  ❌ deploy-getupsoft-site.yml not found"
fi

echo ""
echo "🚀 Ready for GitHub Actions deployment!"
echo ""
echo "Next steps:"
echo "  1. Push a change to 01_Core_Platform/getupsoft-site/"
echo "  2. Monitor at: https://github.com/$REPO/actions"
echo "  3. Or run: gh run list --workflow deploy-getupsoft-site.yml"
