# Backup Script for GetUpSoft_Workspace
# Purpose: Create complete backup before deployment
# Date: 2026-05-25

param([string]$BackupDir = ".\.backup\$(Get-Date -Format 'yyyy-MM-dd_HHmmss')")

Write-Host "Backup Starting..." -ForegroundColor Cyan
New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null

# Git bundle
git bundle create "$BackupDir\repo.bundle" --all
git status > "$BackupDir\git-status.txt"
git log --oneline -50 > "$BackupDir\git-log.txt"

Write-Host "Backup Complete: $BackupDir" -ForegroundColor Green
