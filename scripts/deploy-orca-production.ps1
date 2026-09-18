# Deploy ORCA Workflow Editor to Production
# Target: https://orca.getupsoft.com/
# Method: CloudFlare Pages / Static Hosting

param(
    [string]$Environment = "production",
    [string]$CloudflareAccountId = $env:CLOUDFLARE_ACCOUNT_ID,
    [string]$CloudflareApiToken = $env:CLOUDFLARE_API_TOKEN,
    [string]$CloudflareProjectName = "orca-workflow-editor",
    [switch]$SkipBuild = $false,
    [switch]$DryRun = $false
)

Write-Host "🚀 ORCA Workflow Editor - Production Deployment" -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Cyan

$workdir = "C:\Users\yoeli\Documents\GetUpSoft_Workspace\apps\orca\workflow-editor"
Set-Location $workdir

# Step 1: Build if needed
if (-not $SkipBuild) {
    Write-Host ""
    Write-Host "Step 1: Building for production..." -ForegroundColor Yellow

    # Clean
    Remove-Item -Path "dist" -Recurse -Force -ErrorAction SilentlyContinue

    # Build
    npm run build 2>&1 | Tee-Object -Variable buildOutput

    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Build failed!" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Build completed" -ForegroundColor Green
}

# Step 2: Verify build artifacts
Write-Host ""
Write-Host "Step 2: Verifying build artifacts..." -ForegroundColor Yellow

if (-not (Test-Path "dist/index.html")) {
    Write-Host "❌ Missing dist/index.html" -ForegroundColor Red
    exit 1
}

$distSize = (Get-ChildItem -Path "dist" -Recurse | Measure-Object -Property Length -Sum).Sum
Write-Host "✅ Build size: $("{0:N2}" -f ($distSize / 1024 / 1024))MB" -ForegroundColor Green

# Step 3: Create deployment package
Write-Host ""
Write-Host "Step 3: Creating deployment package..." -ForegroundColor Yellow

$timestamp = Get-Date -Format "yyyyMMdd_HHmm"
$packageName = "orca-workflow-editor-$timestamp.zip"

if (Test-Path $packageName) {
    Remove-Item $packageName -Force
}

Compress-Archive -Path "dist/*" -DestinationPath $packageName -Force
Write-Host "✅ Package created: $packageName" -ForegroundColor Green

# Step 4: Configuration
Write-Host ""
Write-Host "Step 4: Deployment configuration..." -ForegroundColor Yellow
Write-Host "  Environment: $Environment" -ForegroundColor Gray
Write-Host "  Domain: orca.getupsoft.com" -ForegroundColor Gray
Write-Host "  Package: $packageName" -ForegroundColor Gray

# Step 5: Deployment instructions
Write-Host ""
Write-Host "Step 5: Deployment Methods" -ForegroundColor Yellow
Write-Host ""
Write-Host "📌 METHOD A: Cloudflare Pages (Recommended)" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

Write-Host ""
Write-Host "1. Login to Cloudflare Dashboard" -ForegroundColor White
Write-Host "   → https://dash.cloudflare.com" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Select Account: GetUpSoft" -ForegroundColor White
Write-Host "   → Pages section → Create project" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Connect repository or upload files" -ForegroundColor White
Write-Host "   Current build:" -ForegroundColor Gray
Write-Host "   - Source: $workdir/dist" -ForegroundColor Gray
Write-Host "   - Size: $("{0:N2}" -f ($distSize / 1024 / 1024))MB" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Configure:" -ForegroundColor White
Write-Host "   - Production branch: main" -ForegroundColor Gray
Write-Host "   - Build command: npm run build" -ForegroundColor Gray
Write-Host "   - Build output directory: dist" -ForegroundColor Gray
Write-Host ""
Write-Host "5. Set custom domain:" -ForegroundColor White
Write-Host "   - Domain: orca.getupsoft.com" -ForegroundColor Gray
Write-Host "   - Enable HTTPS (automatic with Cloudflare)" -ForegroundColor Gray

Write-Host ""
Write-Host ""
Write-Host "📌 METHOD B: Manual Upload to Server" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

Write-Host ""
Write-Host "1. Upload dist folder to server:" -ForegroundColor White
Write-Host "   \`scp -r dist/* user@orca.getupsoft.com:/var/www/html/\`" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Or use FTP:" -ForegroundColor White
Write-Host "   - Host: orca.getupsoft.com" -ForegroundColor Gray
Write-Host "   - Directory: /public_html or /html" -ForegroundColor Gray
Write-Host "   - Upload: contents of dist/" -ForegroundColor Gray

Write-Host ""
Write-Host ""
Write-Host "📌 METHOD C: Docker Container (Optional)" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

Write-Host ""
Write-Host "1. Create Dockerfile (if needed):" -ForegroundColor White
Write-Host ""
Write-Host "   FROM nginx:latest" -ForegroundColor Gray
Write-Host "   COPY dist/ /usr/share/nginx/html/" -ForegroundColor Gray
Write-Host "   EXPOSE 80" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Build:" -ForegroundColor White
Write-Host "   \`docker build -t orca-editor .\`" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Run:" -ForegroundColor White
Write-Host "   \`docker run -d -p 80:80 orca-editor\`" -ForegroundColor Gray

# Step 6: Verification
Write-Host ""
Write-Host ""
Write-Host "✅ DEPLOYMENT READY" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor White
Write-Host "1. Choose deployment method (A, B, or C above)" -ForegroundColor Gray
Write-Host "2. Deploy the dist/ folder" -ForegroundColor Gray
Write-Host "3. Test at https://orca.getupsoft.com/" -ForegroundColor Gray
Write-Host "4. Run functional tests" -ForegroundColor Gray
Write-Host ""
Write-Host "Build package location: $pwd\$packageName" -ForegroundColor Cyan
Write-Host "Ready to deploy: YES ✅" -ForegroundColor Green
