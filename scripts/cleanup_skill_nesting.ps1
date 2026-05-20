$skillsDir = ".agents\skills"
$skills = Get-ChildItem -Path $skillsDir -Directory
foreach ($skill in $skills) {
    $parentName = $skill.Name
    $nestedPath = Join-Path $skill.FullName $parentName
    if (Test-Path $nestedPath -PathType Container) {
        Write-Host "Found nested duplicate for $parentName at $nestedPath"
        # Move all items from nested folder up one level
        Get-ChildItem -Path $nestedPath | ForEach-Object {
            $destPath = Join-Path $skill.FullName $_.Name
            if (Test-Path $destPath) {
                # If it's a file, we can compare or just overwrite if we are sure
                # Based on my check, they are identical
                Move-Item -Path $_.FullName -Destination $destPath -Force
            } else {
                Move-Item -Path $_.FullName -Destination $destPath
            }
        }
        # Remove the nested folder
        Remove-Item -Path $nestedPath -Recurse -Force
        Write-Host "  Successfully deduplicated $parentName"
    }
}
