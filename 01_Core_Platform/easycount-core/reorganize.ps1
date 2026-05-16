$ErrorActionPreference = "SilentlyContinue"
$docs = "C:\Users\yoeli\Documents"
$ws = "C:\Users\yoeli\Documents\GetUpSoft_Workspace"

# Crear estructura
New-Item -ItemType Directory -Force -Path "$ws"
New-Item -ItemType Directory -Force -Path "$ws\01_Core_Platform"
New-Item -ItemType Directory -Force -Path "$ws\02_Odoo_ERP"
New-Item -ItemType Directory -Force -Path "$ws\03_AI_Automation"
New-Item -ItemType Directory -Force -Path "$ws\04_Archive_Legacy"
New-Item -ItemType Directory -Force -Path "$ws\05_Backups"

# 1. CORE PLATFORM
Move-Item -Path "$docs\getupsoft-ops" -Destination "$ws\01_Core_Platform\getupsoft-ops"
Move-Item -Path "$docs\getupsoft-web" -Destination "$ws\01_Core_Platform\getupsoft-site"
Move-Item -Path "$docs\getupsoft-corporate-site" -Destination "$ws\04_Archive_Legacy\getupsoft-corporate-site"
Move-Item -Path "$docs\GetUpSoft" -Destination "$ws\04_Archive_Legacy\GetUpSoft_old_org"
Move-Item -Path "$docs\dgii_encf" -Destination "$ws\04_Archive_Legacy\dgii_encf_legacy"
Move-Item -Path "$docs\dgii_doc" -Destination "$ws\04_Archive_Legacy\dgii_doc"

# 2. ODOO ERP
Move-Item -Path "$docs\Odoo18-docker" -Destination "$ws\02_Odoo_ERP\odoo-docker-18"
Move-Item -Path "$docs\Odoo_mig" -Destination "$ws\02_Odoo_ERP\odoo-migrations"
Move-Item -Path "$docs\odoo_migf" -Destination "$ws\04_Archive_Legacy\odoo_migf_duplicado"
Move-Item -Path "$docs\odoocontability" -Destination "$ws\02_Odoo_ERP\odoocontability"
Move-Item -Path "$docs\odoocontability-main" -Destination "$ws\05_Backups\odoocontability-main"
Move-Item -Path "$docs\cell_odoo" -Destination "$ws\02_Odoo_ERP\cell_odoo"
Move-Item -Path "$docs\cell_odoo_bk" -Destination "$ws\05_Backups\cell_odoo_bk"
Move-Item -Path "$docs\Chefalitas" -Destination "$ws\02_Odoo_ERP\Chefalitas"
Move-Item -Path "$docs\odoo18" -Destination "$ws\02_Odoo_ERP\odoo18"
Move-Item -Path "$docs\odoo_origen" -Destination "$ws\02_Odoo_ERP\odoo_origen"
Move-Item -Path "$docs\odoo_upgrade" -Destination "$ws\02_Odoo_ERP\odoo_upgrade"
Move-Item -Path "$docs\l10n-dominicana-pro" -Destination "$ws\02_Odoo_ERP\l10n-dominicana-pro"
Move-Item -Path "$docs\l10n_do_accounting" -Destination "$ws\02_Odoo_ERP\l10n_do_accounting"

# 3. AI & AUTOMATION
Move-Item -Path "$docs\ai-automation-orchestrator" -Destination "$ws\03_AI_Automation\ai-automation-orchestrator"
Move-Item -Path "$docs\ai-automation-orchestrator+" -Destination "$ws\05_Backups\ai-automation-orchestrator_plus"
Move-Item -Path "$docs\AIHUB" -Destination "$ws\03_AI_Automation\AIHUB"
Move-Item -Path "$docs\TinderBot" -Destination "$ws\03_AI_Automation\TinderBot"
Move-Item -Path "$docs\TinderBotJ" -Destination "$ws\03_AI_Automation\TinderBotJ"
Move-Item -Path "$docs\insta-unfollow-bot-controlado" -Destination "$ws\03_AI_Automation\insta-unfollow-bot-controlado"
Move-Item -Path "$docs\insta-unfollow-bot-controlado - Copy" -Destination "$ws\05_Backups\insta-unfollow-bot-controlado_copy"
Move-Item -Path "$docs\n8n" -Destination "$ws\03_AI_Automation\n8n"
Move-Item -Path "$docs\undetected-chromedriver-j" -Destination "$ws\03_AI_Automation\undetected-chromedriver-j"

# 4. BACKUPS Y REDUNDANCIAS DETECTADAS
Move-Item -Path "$docs\Galantesjewelry-sanitize-20260423-114119" -Destination "$ws\05_Backups\Galantesjewelry-sanitize"
Move-Item -Path "$docs\Galantesjewelry-main-publish" -Destination "$ws\05_Backups\Galantesjewelry-main-publish"
Move-Item -Path "$docs\backup" -Destination "$ws\05_Backups\general_backup"
Move-Item -Path "$docs\re-build" -Destination "$ws\05_Backups\re-build"

Write-Host "Organización completada. Los proyectos activos están en C:\Users\yoeli\Documents\GetUpSoft_Workspace"
