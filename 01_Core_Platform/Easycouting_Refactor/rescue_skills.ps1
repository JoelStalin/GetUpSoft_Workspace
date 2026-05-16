$ErrorActionPreference = "SilentlyContinue"
$ws = "C:\Users\yoeli\Documents\GetUpSoft_Workspace"
$kc = "$ws\_Knowledge_Center\Agents_Skills"

Write-Host "Buscando skills ocultas en proyectos y backups..."

$agentFolders = Get-ChildItem -Path $ws -Recurse -Directory -Filter ".agents"

foreach ($folder in $agentFolders) {
    if ($folder.FullName -like "*_Knowledge_Center*") { continue }
    
    Write-Host "Explorando: $($folder.FullName)"
    $foundSkills = Get-ChildItem -Path $folder.FullName -Directory
    
    foreach ($skill in $foundSkills) {
        $dest = Join-Path $kc $skill.Name
        if (!(Test-Path $dest)) {
            Write-Host "  -> Rescatando skill única: $($skill.Name)"
            Copy-Item -Path $skill.FullName -Destination $dest -Recurse -Force
        }
    }
}
