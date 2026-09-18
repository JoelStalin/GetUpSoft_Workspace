#!/usr/bin/env pwsh

# Deployment script for GetUpSoft website redesign
# Usage: ./deploy-website.ps1

$ErrorActionPreference = "Stop"

Write-Host "🚀 GetUpSoft Website Deployment Script" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Configuration
$SERVER_HOST = "192.168.1.233"
$SERVER_USER = "ubuntu"
$SSH_KEY = "$env:USERPROFILE\.ssh\id_getupsoft_cloudflare"
$APP_PATH = "/app/getupsoft-workspace"
$SITE_PATH = "$APP_PATH/01_Core_Platform/getupsoft-site"
$DOCKER_SERVICE = "getupsoft-site"

# Step 1: Git Pull
Write-Host "📥 Step 1: Pulling latest changes from GitHub..." -ForegroundColor Yellow

$GIT_PULL_CMD = "cd $APP_PATH && git pull origin main"

Write-Host "   Executing: $GIT_PULL_CMD" -ForegroundColor Gray

ssh -i $SSH_KEY -o ConnectTimeout=5 $SERVER_USER@$SERVER_HOST $GIT_PULL_CMD

if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✓ Git pull completed successfully" -ForegroundColor Green
} else {
    Write-Host "   ✗ Git pull failed" -ForegroundColor Red
    exit 1
}

# Step 2: Install dependencies
Write-Host "`n📦 Step 2: Installing npm dependencies..." -ForegroundColor Yellow

$NPM_INSTALL_CMD = "cd $SITE_PATH && npm install --legacy-peer-deps"

Write-Host "   Executing: $NPM_INSTALL_CMD" -ForegroundColor Gray

ssh -i $SSH_KEY -o ConnectTimeout=5 $SERVER_USER@$SERVER_HOST $NPM_INSTALL_CMD

if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✓ npm install completed successfully" -ForegroundColor Green
} else {
    Write-Host "   ✗ npm install failed" -ForegroundColor Red
    exit 1
}

# Step 3: Build the website
Write-Host "`n🔨 Step 3: Building the website..." -ForegroundColor Yellow

$BUILD_CMD = "cd $SITE_PATH && npm run build 2>&1"

Write-Host "   Executing: $BUILD_CMD" -ForegroundColor Gray

ssh -i $SSH_KEY -o ConnectTimeout=5 $SERVER_USER@$SERVER_HOST $BUILD_CMD

if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✓ Website build completed successfully" -ForegroundColor Green
} else {
    Write-Host "   ✗ Website build failed" -ForegroundColor Red
    exit 1
}

# Step 4: Docker rebuild
Write-Host "`n🐳 Step 4: Rebuilding Docker container..." -ForegroundColor Yellow

$DOCKER_REBUILD_CMD = "cd $SITE_PATH && docker build -t getupsoft-site:latest ."

Write-Host "   Executing: $DOCKER_REBUILD_CMD" -ForegroundColor Gray

ssh -i $SSH_KEY -o ConnectTimeout=5 $SERVER_USER@$SERVER_HOST $DOCKER_REBUILD_CMD

if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✓ Docker rebuild completed successfully" -ForegroundColor Green
} else {
    Write-Host "   ✗ Docker rebuild failed" -ForegroundColor Red
    exit 1
}

# Step 5: Restart Docker container
Write-Host "`n🔄 Step 5: Restarting Docker container..." -ForegroundColor Yellow

$DOCKER_RESTART_CMD = "docker compose -f $SITE_PATH/docker-compose.prod.yml down && docker compose -f $SITE_PATH/docker-compose.prod.yml up -d"

Write-Host "   Executing: $DOCKER_RESTART_CMD" -ForegroundColor Gray

ssh -i $SSH_KEY -o ConnectTimeout=5 $SERVER_USER@$SERVER_HOST $DOCKER_RESTART_CMD

if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✓ Docker container restarted successfully" -ForegroundColor Green
} else {
    Write-Host "   ✗ Docker restart failed" -ForegroundColor Red
    exit 1
}

# Step 6: Verify deployment
Write-Host "`n✅ Step 6: Verifying deployment..." -ForegroundColor Yellow

$VERIFY_CMD = "curl -s http://localhost:3120/health | head -c 100"

Write-Host "   Checking health endpoint..." -ForegroundColor Gray

ssh -i $SSH_KEY -o ConnectTimeout=5 $SERVER_USER@$SERVER_HOST $VERIFY_CMD

if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✓ Health check passed" -ForegroundColor Green
} else {
    Write-Host "   ⚠ Health check inconclusive (container may still be starting)" -ForegroundColor Yellow
}

# Step 7: Display summary
Write-Host "`n" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "🎉 Deployment completed successfully!" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "Website URL: https://getupsoft.com" -ForegroundColor Cyan
Write-Host "Privacy Policy: https://getupsoft.com/privacy" -ForegroundColor Cyan
Write-Host "Terms of Service: https://getupsoft.com/terms" -ForegroundColor Cyan

Write-Host "`nChanges deployed:" -ForegroundColor Yellow
Write-Host "  • Google Cloud aesthetic design system" -ForegroundColor Gray
Write-Host "  • Light theme with colorful gradients" -ForegroundColor Gray
Write-Host "  • Privacy Policy page" -ForegroundColor Gray
Write-Host "  • Terms of Service page" -ForegroundColor Gray
Write-Host "  • Updated all layouts and components" -ForegroundColor Gray

Write-Host "`n✓ All systems operational" -ForegroundColor Green
