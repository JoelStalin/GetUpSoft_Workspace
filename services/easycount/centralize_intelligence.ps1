$ErrorActionPreference = "SilentlyContinue"
$ws = "C:\Users\yoeli\Documents\GetUpSoft_Workspace"
$easy = "C:\Users\yoeli\Documents\Easycouting"

# 1. Crear directorios de Inteligencia
New-Item -ItemType Directory -Force -Path "$ws\_Knowledge_Center"
New-Item -ItemType Directory -Force -Path "$ws\_Knowledge_Center\Agents_Skills"
New-Item -ItemType Directory -Force -Path "$ws\_Knowledge_Center\Master_Prompts"
New-Item -ItemType Directory -Force -Path "$ws\_Knowledge_Center\Shared_Tests"
New-Item -ItemType Directory -Force -Path "$ws\_Knowledge_Center\Long_Term_Memory"

# 2. Centralizar Skills (Copia de seguridad y unificación)
Copy-Item -Path "C:\Users\yoeli\.gemini\skills\*" -Destination "$ws\_Knowledge_Center\Agents_Skills" -Recurse

# 3. Migrar Inteligencia de EasyCount
Move-Item -Path "$easy\docs\prompts" -Destination "$ws\_Knowledge_Center\Master_Prompts\EasyCount"
Move-Item -Path "$easy\project-memory" -Destination "$ws\_Knowledge_Center\Long_Term_Memory\EasyCount"
Move-Item -Path "$easy\tests" -Destination "$ws\_Knowledge_Center\Shared_Tests\EasyCount"

# 4. Escanear otros proyectos en busca de inteligencia para centralizar
# Odoo ERP (odoocontability)
Move-Item -Path "$ws\02_Odoo_ERP\odoocontability\project-memory" -Destination "$ws\_Knowledge_Center\Long_Term_Memory\OdooContability"

# AI Automation
Move-Item -Path "$ws\03_AI_Automation\ai-automation-orchestrator\docs\prompts" -Destination "$ws\_Knowledge_Center\Master_Prompts\AI-Orchestrator"

Write-Host "Cerebro Centralizado Creado en $ws\_Knowledge_Center"
