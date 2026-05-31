# Simple ORCA Workflow Editor Deploy Script
# Target: https://orca.getupsoft.com/
# Method: Package for Cloudflare Pages Upload

param(
    [switch]$Package = $false
)

Write-Host "🚀 ORCA Workflow Editor - Deployment Helper" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

$workdir = "C:\Users\yoeli\Documents\GetUpSoft_Workspace\apps\orca\workflow-editor"
$distPath = "$workdir\dist"
$deployPackage = "C:\Users\yoeli\Documents\GetUpSoft_Workspace\orca-deploy-package.zip"

# Verify build exists
Write-Host "Verifying build artifacts..." -ForegroundColor Yellow
if (-not (Test-Path $distPath)) {
    Write-Host "ERROR: dist/ folder not found at $distPath" -ForegroundColor Red
    exit 1
}

$files = Get-ChildItem $distPath -Recurse
$sizeKB = [math]::Round(($files | Measure-Object -Property Length -Sum).Sum / 1024, 2)
Write-Host "OK: Found $($files.Count) files, $sizeKB KB total" -ForegroundColor Green
Write-Host ""

# List artifacts
Write-Host "Build Artifacts:" -ForegroundColor Cyan
Get-ChildItem $distPath -Recurse | ForEach-Object {
    $size = if ($_.PSIsContainer) { "-" } else { [math]::Round($_.Length / 1024, 2) }
    Write-Host "  $($_.Name) ... $size KB" -ForegroundColor Gray
}
Write-Host ""

# Show deployment options
Write-Host "Deployment Options:" -ForegroundColor Cyan
Write-Host "===================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Option A: Cloudflare Pages (RECOMMENDED)" -ForegroundColor Green
Write-Host "  1. Go to https://dash.cloudflare.com" -ForegroundColor Gray
Write-Host "  2. Select GetUpSoft account" -ForegroundColor Gray
Write-Host "  3. Pages -> Create project -> Direct Upload" -ForegroundColor Gray
Write-Host "  4. Drag & drop the dist/ folder from:" -ForegroundColor Gray
Write-Host "     $distPath" -ForegroundColor Cyan
Write-Host "  5. Set domain to orca.getupsoft.com" -ForegroundColor Gray
Write-Host "  6. Deploy (30 seconds)" -ForegroundColor Gray
Write-Host ""

Write-Host "Option B: Manual Server (SCP)" -ForegroundColor Yellow
Write-Host "  ssh getupsoft" -ForegroundColor Cyan
Write-Host "  scp -r $distPath/* user@orca.getupsoft.com:/var/www/orca.getupsoft.com/html/" -ForegroundColor Cyan
Write-Host ""

Write-Host "Option C: Docker Container" -ForegroundColor Yellow
Write-Host "  docker build -t orca-editor:latest ." -ForegroundColor Cyan
Write-Host "  docker run -d -p 80:80 orca-editor:latest" -ForegroundColor Cyan
Write-Host ""

# Offer to package
if ($Package) {
    Write-Host "Creating deployment package..." -ForegroundColor Yellow
    if (Test-Path $deployPackage) {
        Remove-Item $deployPackage -Force
    }
    Compress-Archive -Path $distPath -DestinationPath $deployPackage -CompressionLevel Optimal
    Write-Host "OK: Package created at $deployPackage" -ForegroundColor Green
    Write-Host "Size: $([math]::Round((Get-Item $deployPackage).Length / 1024 / 1024, 2)) MB" -ForegroundColor Gray
    Write-Host ""
}

Write-Host "Next Steps:" -ForegroundColor White
Write-Host "==========" -ForegroundColor White
Write-Host "1. Choose one of the 3 deployment methods above" -ForegroundColor Gray
Write-Host "2. Deploy to orca.getupsoft.com" -ForegroundColor Gray
Write-Host "3. Run: .\scripts\test-orca-production.ps1 -BaseUrl 'https://orca.getupsoft.com'" -ForegroundColor Cyan
Write-Host ""
Write-Host "Status: READY FOR DEPLOYMENT ✅" -ForegroundColor Green
