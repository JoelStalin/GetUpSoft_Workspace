# Recompile GetUpSoft-Orca-Agent executable
# This script rebuilds the PyInstaller executable with the latest code changes

param(
    [string]$OutputPath = "C:\Users\yoeli\AppData\Local\Programs\GetUpSoft-Orca-Agent",
    [switch]$CleanBuild = $false
)

Write-Host "🔨 GetUpSoft-Orca-Agent Recompilation" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

# Navigate to workspace
Set-Location "C:\Users\yoeli\Documents\GetUpSoft_Workspace"

# Check if PyInstaller is installed
Write-Host "Checking PyInstaller installation..." -ForegroundColor Yellow
try {
    pyinstaller --version | Out-Null
    $pyinstallerPath = (Get-Command pyinstaller).Source
    Write-Host "✅ PyInstaller found: $pyinstallerPath" -ForegroundColor Green
} catch {
    Write-Host "❌ PyInstaller not found. Installing..." -ForegroundColor Red
    pip install pyinstaller --quiet
    Write-Host "✅ PyInstaller installed" -ForegroundColor Green
}

# Clean build if requested
if ($CleanBuild) {
    Write-Host "Cleaning previous builds..." -ForegroundColor Yellow
    Remove-Item -Path ".\build" -Recurse -Force -ErrorAction SilentlyContinue
    Remove-Item -Path ".\dist" -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "✅ Clean completed" -ForegroundColor Green
}

# Build the executable
Write-Host "Building GetUpSoft-Orca-Agent executable..." -ForegroundColor Yellow
Write-Host "Using spec file: OrcaAgentServer.spec" -ForegroundColor Cyan

try {
    # Run PyInstaller with the spec file (no --specpath when using .spec file)
    pyinstaller OrcaAgentServer.spec --distpath "$OutputPath\dist" --workpath ".\build" 2>&1 | Tee-Object -Variable buildOutput

    # Check if build was successful
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Build completed successfully" -ForegroundColor Green

        # Find the generated executable
        $exePath = Get-ChildItem -Path "$OutputPath\dist" -Filter "OrcaAgentServer.exe" -Recurse -ErrorAction SilentlyContinue | Select-Object -First 1 -ExpandProperty FullName

        if ($exePath) {
            Write-Host "📦 Executable location: $exePath" -ForegroundColor Cyan
            Write-Host "📊 Executable size: $((Get-Item $exePath).Length / 1MB -as [int]) MB" -ForegroundColor Cyan

            # Verify executable exists and is executable
            if (Test-Path $exePath) {
                Write-Host "✅ Executable verified and ready" -ForegroundColor Green
                Write-Host ""
                Write-Host "🚀 Next Steps:" -ForegroundColor Green
                Write-Host "1. Start the agent: & '$exePath'" -ForegroundColor White
                Write-Host "2. Access at: http://localhost:8000" -ForegroundColor White
                Write-Host "3. Check health: curl http://localhost:8000/api/health" -ForegroundColor White
            }
        } else {
            Write-Host "⚠️  Executable not found in $OutputPath\dist" -ForegroundColor Yellow
        }
    } else {
        Write-Host "❌ Build failed with exit code: $LASTEXITCODE" -ForegroundColor Red
        Write-Host "Error details:" -ForegroundColor Red
        Write-Host $buildOutput -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Build error: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✅ Recompilation Complete!" -ForegroundColor Green
