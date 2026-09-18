$dirs = @(".agents\skills", "_Knowledge_Center\Agents_Skills", "03_AI_Automation\hyperframes\skills")
$results = foreach ($dir in $dirs) {
    if (Test-Path $dir) {
        $skills = Get-ChildItem -Path $dir -Recurse -Filter "SKILL.md"
        foreach ($skill in $skills) {
            $content = Get-Content $skill.FullName -TotalCount 20
            $nameLine = $content | Where-Object { $_ -match "^name:\s*" }
            if ($nameLine) {
                $name = ($nameLine -split ":", 2)[1].Trim().Trim("'").Trim('"')
                [PSCustomObject]@{
                    Name = $name
                    Path = $skill.FullName
                }
            }
        }
    }
}
$results | Sort-Object Name | Format-Table -AutoSize | Out-String | Write-Host
