$ErrorActionPreference = "SilentlyContinue"
$docs = "C:\Users\yoeli\Documents"
$ws = "C:\Users\yoeli\Documents\GetUpSoft_Workspace"

Write-Host "Iniciando limpieza profunda e integraciÃ³n final en el Workspace..."

# 1. INTEGRACIÃ“N CORE
Move-Item -Path "$docs\Easycouting" -Destination "$ws\01_Core_Platform\easycount-core"
Move-Item -Path "$docs\configure_cloudflare.py" -Destination "$ws\01_Core_Platform\getupsoft-ops\scripts\configure_cloudflare.py"
Move-Item -Path "$docs\get_cloudflare_token.py" -Destination "$ws\01_Core_Platform\getupsoft-ops\scripts\get_cloudflare_token.py"
Move-Item -Path "$docs\PROJECT_MANAGER_STABILITY_BRIEF.md" -Destination "$ws\_Knowledge_Center\Long_Term_Memory\PROJECT_MANAGER_STABILITY_BRIEF.md"
Move-Item -Path "$docs\logos_getupsoft" -Destination "$ws\01_Core_Platform\branding_assets"

# 2. INTEGRACIÃ“N ODOO / ERP
New-Item -ItemType Directory -Force -Path "$ws\02_Odoo_ERP\Jabiya_Project"
Move-Item -Path "$docs\jabiya*" -Destination "$ws\02_Odoo_ERP\Jabiya_Project\"
Move-Item -Path "$docs\jabiyaprod" -Destination "$ws\02_Odoo_ERP\Jabiya_Project\prod"
Move-Item -Path "$docs\sap" -Destination "$ws\02_Odoo_ERP\sap_integration"
Move-Item -Path "$docs\exo-odoo-18" -Destination "$ws\02_Odoo_ERP\exo-odoo-18"
Move-Item -Path "$docs\odoo-attrs-replace" -Destination "$ws\02_Odoo_ERP\tools\odoo-attrs-replace"
Move-Item -Path "$docs\l10n_do_rnc_search" -Destination "$ws\02_Odoo_ERP\modules\l10n_do_rnc_search"
Move-Item -Path "$docs\bhd" -Destination "$ws\02_Odoo_ERP\integrations\bhd_bank"
Move-Item -Path "$docs\*.sql" -Destination "$ws\02_Odoo_ERP\database_scripts\"
Move-Item -Path "$docs\*.csv" -Destination "$ws\02_Odoo_ERP\data_exports\"
Move-Item -Path "$docs\*.xlsx" -Destination "$ws\02_Odoo_ERP\business_data\"
Move-Item -Path "$docs\data_odoo" -Destination "$ws\02_Odoo_ERP\data_odoo"
Move-Item -Path "$docs\OLT DOC" -Destination "$ws\02_Odoo_ERP\documentation_olt"

# 3. INTEGRACIÃ“N AI / AUTOMATION
Move-Item -Path "$docs\Codex" -Destination "$ws\03_AI_Automation\Codex_Research"
Move-Item -Path "$docs\ISP_prompt" -Destination "$ws\_Knowledge_Center\Master_Prompts\GetUpNet\ISP_prompts"
Move-Item -Path "$docs\chatgpt" -Destination "$ws\03_AI_Automation\research\chatgpt"
Move-Item -Path "$docs\claude" -Destination "$ws\03_AI_Automation\research\claude"
Move-Item -Path "$docs\local_printer" -Destination "$ws\03_AI_Automation\local_printer_agent"

# 4. INTEGRACIÃ“N LUXURY / GALANTES
Move-Item -Path "$docs\Galantesjewelry" -Destination "$ws\06_E_Commerce_Lux\Galantesjewelry"
Move-Item -Path "$docs\Galantesjewelry-*.bundle" -Destination "$ws\05_Backups\Galantes_Git_Bundles\"

# 5. LIMPIEZA DE ZIPS Y CLUTTER (BACKUPS)
Move-Item -Path "$docs\*.zip" -Destination "$ws\05_Backups\archives_zip\"
Move-Item -Path "$docs\*.rar" -Destination "$ws\05_Backups\archives_zip\"
Move-Item -Path "$docs\evidencia" -Destination "$ws\05_Backups\evidence_logs"
Move-Item -Path "$docs\artifacts_live_dns" -Destination "$ws\05_Backups\dns_artifacts"
Move-Item -Path "$docs\script_test" -Destination "$ws\05_Backups\sandbox_scripts"
Move-Item -Path "$docs\api_test" -Destination "$ws\05_Backups\sandbox_scripts"
Move-Item -Path "$docs\adviser" -Destination "$ws\05_Backups\adviser_legacy"
Move-Item -Path "$docs\Count" -Destination "$ws\04_Archive_Legacy\Count_old"
Move-Item -Path "$docs\My Web Sites" -Destination "$ws\05_Backups\clutter\My Web Sites"
Move-Item -Path "$docs\IISExpress" -Destination "$ws\05_Backups\clutter\IISExpress"

# ELIMINAR ARCHIVOS TEMPORALES SIN VALOR (EXPLICITO)
Remove-Item -Path "$docs\New Microsoft Excel Worksheet.xlsx" -Force

Write-Host "Limpieza profunda finalizada. La carpeta Documentos estÃ¡ despejada."
