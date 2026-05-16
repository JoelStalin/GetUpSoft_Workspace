$ErrorActionPreference = "SilentlyContinue"
$downloads = "C:\Users\yoeli\Downloads"
$ws = "C:\Users\yoeli\Documents\GetUpSoft_Workspace"

Write-Host "Organizando carpeta de Descargas..."

# Asegurar carpetas de destino
$secDest = "$ws\05_Backups\secrets_recovery"
$archDest = "$ws\05_Backups\archives"
$dataDest = "$ws\02_Odoo_ERP\data_exports"
$docDest = "$ws\_Knowledge_Center\Documents"
$imgDest = "$ws\05_Backups\images"
$clutterDest = "$ws\05_Backups\clutter"
$easySamples = "$ws\01_Core_Platform\easycount-core\samples"

New-Item -ItemType Directory -Force -Path $secDest, $archDest, $dataDest, $docDest, $imgDest, $clutterDest, $easySamples

# 1. SECRETOS Y CONFIGURACIÓN
$secrets = Get-ChildItem -Path $downloads -Include "*.p12", "*.pem", "*.json", "id_getupsoft_cloudflare", "config", "upstream.conf*" -File
foreach ($s in $secrets) {
    if ($s.Name -like "client_secret*" -or $s.Extension -eq ".p12" -or $s.Extension -eq ".pem") {
        Move-Item -Path $s.FullName -Destination $secDest -Force
    } elseif ($s.Name -like "upstream.conf*" -or $s.Name -eq "config" -or $s.Name -eq "id_getupsoft_cloudflare") {
        Move-Item -Path $s.FullName -Destination "$ws\01_Core_Platform\getupsoft-ops\scripts\" -Force
    }
}

# 2. DOCUMENTOS DGII Y XML
$dgiiFiles = Get-ChildItem -Path $downloads -Include "*.xml", "*DGII*", "*eCF*" -File
foreach ($f in $dgiiFiles) {
    if ($f.Extension -eq ".xml") {
        Move-Item -Path $f.FullName -Destination $easySamples -Force
    } else {
        Move-Item -Path $f.FullName -Destination "$ws\01_Core_Platform\easycount-core\docs\" -Force
    }
}

# 3. ARCHIVOS DE DATOS (XLSX, CSV) - ORGANIZAR Y ELIMINAR DUPLICADOS
$dataFiles = Get-ChildItem -Path $downloads -Include "*.xlsx", "*.csv", "*.xls" -File
foreach ($f in $dataFiles) {
    # Si tiene un (n) en el nombre, es probable que sea un duplicado
    if ($f.Name -match "\(\d+\)") {
        $cleanName = $f.Name -replace "\s\(\d+\)", ""
        if (Test-Path (Join-Path $downloads $cleanName)) {
            Write-Host "Eliminando duplicado detectado: $($f.Name)"
            Remove-Item -Path $f.FullName -Force
            continue
        }
    }
    Move-Item -Path $f.FullName -Destination $dataDest -Force
}

# 4. ARCHIVOS COMPRIMIDOS (PROYECTOS Y LIBRERIAS)
$archives = Get-ChildItem -Path $downloads -Include "*.zip", "*.rar", "*.tar.gz", "*.7z" -File
foreach ($a in $archives) {
    Move-Item -Path $a.FullName -Destination $archDest -Force
}

# 5. GUÍAS Y DOCUMENTOS ÚTILES
$docs_useful = Get-ChildItem -Path $downloads -Include "*.pdf", "*.docx", "*.htm", "*.html" -File
foreach ($d in $docs_useful) {
    Move-Item -Path $d.FullName -Destination $docDest -Force
}

# 6. IMÁGENES Y MULTIMEDIA
$media = Get-ChildItem -Path $downloads -Include "*.png", "*.jpg", "*.jpeg", "*.svg", "*.webp", "*.mkv", "*.avi" -File
foreach ($m in $media) {
    Move-Item -Path $m.FullName -Destination $imgDest -Force
}

# 7. INSTALADORES Y BASURA (CLUTTER)
$installers = Get-ChildItem -Path $downloads -Include "*.exe", "*.msi", "*.vsix", "*.apk", "*.iso" -File
foreach ($i in $installers) {
    # Si es un instalador común, lo movemos a clutter
    Move-Item -Path $i.FullName -Destination $clutterDest -Force
}

# 8. CARPETAS RESTANTES
Get-ChildItem -Path $downloads -Directory | ForEach-Object {
    Move-Item -Path $_.FullName -Destination "$ws\05_Backups\folders_recovery\" -Force
}

Write-Host "Organización de Descargas finalizada. La carpeta está limpia."
