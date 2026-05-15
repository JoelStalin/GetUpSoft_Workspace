param(
    [string]$WorkspaceRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path,
    [string]$OutputJson = (Join-Path (Resolve-Path (Join-Path $PSScriptRoot "..")).Path "task-ledger/skill-recommendations.json"),
    [string]$OutputMd = (Join-Path (Resolve-Path (Join-Path $PSScriptRoot "..")).Path "task-ledger/skill-recommendations.md"),
    [int]$Top = 5
)

$ErrorActionPreference = 'Stop'

function Get-ProjectEntries {
    param([string]$Root)

    Get-ChildItem -LiteralPath $Root -Directory |
        Where-Object {
            $_.Name -notin @(
                '.git', '.agents', '.codex', 'node_modules', 'dist', 'build', 'coverage',
                'tmp', 'tmp_sync_placeholder', 'scratch', 'task-ledger', '05_Backups'
            )
        } |
        Sort-Object Name
}

function Get-ProjectSignals {
    param([System.IO.DirectoryInfo]$Project)

    $signals = New-Object System.Collections.Generic.List[string]
    $name = $Project.Name.ToLowerInvariant()
    $path = $Project.FullName.ToLowerInvariant()

    $markers = @{
        'package-json' = 'package.json'
        'python' = 'pyproject.toml'
        'docker' = 'Dockerfile'
        'nextjs' = 'next.config'
        'javascript-ui' = 'src'
        'browser-testing' = 'playwright'
        'documentation' = 'README.md'
        'hyperframes' = 'hyperframes'
        'erp' = 'odoo'
        'security' = 'security'
        'automation' = 'workflow'
        'agents' = 'agents'
    }

    foreach ($key in $markers.Keys) {
        if ($path -match [regex]::Escape($markers[$key])) {
            [void]$signals.Add($key)
        }
    }

    switch -Regex ($name) {
        'hyperframes' { [void]$signals.Add('hyperframes') }
        'odoo|erp|contabilidad' { [void]$signals.Add('erp') }
        'web|site|app|frontend|ui' { [void]$signals.Add('javascript-ui') }
        'docs|knowledge|wiki|notes|legal' { [void]$signals.Add('documentation') }
        'security|audit|pentest' { [void]$signals.Add('security') }
        'ai|orca|automation|agent' { [void]$signals.Add('automation') }
        'script|tool|scripts' { [void]$signals.Add('automation') }
    }

    $signals | Sort-Object -Unique
}

function Get-ProjectFamily {
    param(
        [System.IO.DirectoryInfo]$Project,
        [string[]]$Signals
    )

    $name = $Project.Name.ToLowerInvariant()
    $path = $Project.FullName.ToLowerInvariant()

    if ($path -match 'hyperframes' -or $Signals -contains 'hyperframes') {
        return 'hyperframes'
    }

    if ($name -match 'odoo|erp|contabilidad' -or $Signals -contains 'erp') {
        return 'erp-odoo'
    }

    if ($name -match 'legal|knowledge|wiki|docs' -or $Signals -contains 'documentation') {
        return 'docs-knowledge'
    }

    if ($name -eq 'scripts' -or $name -match 'tooling|tools|automation-scripts') {
        return 'tooling'
    }

    if ($name -match 'ai|orca|automation|agent' -or $Signals -contains 'automation') {
        return 'ai-automation'
    }

    if ($name -match 'web|site|app|frontend|ui' -or $Signals -contains 'javascript-ui') {
        return 'web-app'
    }

    if ($Signals -contains 'python' -and $Signals -contains 'docker') {
        return 'python-service'
    }

    if ($Project.Name -match '^0[1-6]_' -or $name -match 'platform|core') {
        return 'platform-core'
    }

    return 'general'
}

function Get-FamilyDescription {
    param([string]$Family)

    switch ($Family) {
        'hyperframes' { 'Video, motion, composition, animation, and rendering work.' }
        'erp-odoo' { 'ERP, back-office, accounting, database, and workflow work.' }
        'docs-knowledge' { 'Documentation, knowledge base, policy, and research work.' }
        'ai-automation' { 'Agent orchestration, automation, and AI workflow work.' }
        'tooling' { 'Workspace tooling, scripts, and operational automation work.' }
        'web-app' { 'Frontend, browser, UI, and interactive web application work.' }
        'python-service' { 'Python service, backend, and containerized service work.' }
        'platform-core' { 'Core platform, shared libraries, and foundation work.' }
        default { 'Mixed or uncategorized project work.' }
    }
}

function Get-FamilySeedSkills {
    param([string]$Family)

    switch ($Family) {
        'hyperframes' { @('hyperframes', 'hyperframes-cli', 'hyperframes-media', 'css-animations', 'waapi', 'animejs', 'gsap', 'lottie', 'three', 'typegpu') }
        'erp-odoo' { @('create-plan', 'support-ticket-triage', 'spreadsheet-formula-helper', 'internal-comms', 'authorized-security-testing') }
        'docs-knowledge' { @('content-research-writer', 'notion-research-documentation', 'notion-knowledge-capture', 'internal-comms', 'create-plan') }
        'ai-automation' { @('agency-agents', 'mcp-builder', 'connect', 'skill-share', 'create-plan') }
        'tooling' { @('create-plan', 'skill-share', 'agency-agents', 'skill-installer') }
        'web-app' { @('webapp-testing', 'components-build', 'theme-factory', 'browser-use:browser', 'create-plan') }
        'python-service' { @('create-plan', 'mcp-builder', 'authorized-security-testing', 'connect') }
        'platform-core' { @('create-plan', 'agency-agents', 'components-build', 'mcp-builder') }
        default { @('create-plan', 'agency-agents') }
    }
}

function Get-ProjectPrompt {
    param(
        [System.IO.DirectoryInfo]$Project,
        [string]$Family,
        [string[]]$Signals
    )

    $seedSkills = Get-FamilySeedSkills -Family $Family

@"
Workspace project family: $Family
Project: $($Project.Name)
Path: $($Project.FullName)
Signals: $($Signals -join ', ')
Family seed skills: $($seedSkills -join ', ')

Select the best Codex skills for this project. Prefer the most specific skills first. Consider the workspace policy:
- normalize the request with caveman before selecting skills
- use the shared skill bundle in .agents/skills
- use agency-agents when multiagent coordination helps
- include webapp-testing for browser/UI verification when relevant
"@
}

function Parse-CavemanOutput {
    param([string]$Text)

    $lines = $Text -split "`r?`n"
    $skills = New-Object System.Collections.Generic.List[string]
    foreach ($line in $lines) {
        if ($line -match '^\s*-\s*(.+?)\s*$') {
            $candidate = $matches[1].Trim()
            if ($candidate -and $candidate -notmatch '^(CAVEMAN BRIEF|Recommended skills)') {
                [void]$skills.Add($candidate)
            }
        }
    }

    $skills | Select-Object -Unique
}

function New-ProjectRecord {
    param([System.IO.DirectoryInfo]$Project)

    $signals = Get-ProjectSignals -Project $Project
    $family = Get-ProjectFamily -Project $Project -Signals $signals
    $prompt = Get-ProjectPrompt -Project $Project -Family $family -Signals $signals
    $raw = & "$PSScriptRoot/caveman_route.ps1" -Prompt $prompt -Top $Top
    $skills = Parse-CavemanOutput -Text $raw

    [pscustomobject]@{
        name = $Project.Name
        path = $Project.FullName
        family = $family
        familyDescription = Get-FamilyDescription -Family $family
        familySeedSkills = @(Get-FamilySeedSkills -Family $family)
        signals = @($signals)
        recommendedSkills = @($skills)
        cavemanBrief = $raw.Trim()
    }
}

$projects = Get-ProjectEntries -Root $WorkspaceRoot
$records = foreach ($project in $projects) {
    New-ProjectRecord -Project $project
}

$familyGroups = $records | Group-Object family | Sort-Object Name

$report = [ordered]@{
    generatedAt = (Get-Date).ToString('o')
    workspaceRoot = $WorkspaceRoot
    top = $Top
    projectCount = $records.Count
    familyCount = $familyGroups.Count
    families = @()
    projects = @($records)
}

foreach ($group in $familyGroups) {
    $familyProjects = @($group.Group)
    $report.families += [ordered]@{
        family = $group.Name
        description = Get-FamilyDescription -Family $group.Name
        projectCount = $familyProjects.Count
        projects = $familyProjects
    }
}

$json = $report | ConvertTo-Json -Depth 8
Set-Content -LiteralPath $OutputJson -Value $json -Encoding UTF8

$md = New-Object System.Text.StringBuilder
[void]$md.AppendLine('# Workspace Skill Recommendations')
[void]$md.AppendLine()
[void]$md.AppendLine(('*Generated:* ' + $report.generatedAt))
[void]$md.AppendLine(('*Workspace:* `' + $WorkspaceRoot + '`'))
[void]$md.AppendLine(('*Projects analyzed:* ' + $report.projectCount))
[void]$md.AppendLine()

foreach ($family in $report.families) {
    [void]$md.AppendLine("## $($family.family)")
    [void]$md.AppendLine($family.description)
    [void]$md.AppendLine()

    foreach ($project in $family.projects) {
        [void]$md.AppendLine("### $($project.name)")
        [void]$md.AppendLine("*Signals:* $($project.signals -join ', ')")
        [void]$md.AppendLine("*Family seed skills:* $($project.familySeedSkills -join ', ')")
        [void]$md.AppendLine("*Recommended skills:* $($project.recommendedSkills -join ', ')")
        if ($project.cavemanBrief) {
            [void]$md.AppendLine()
            [void]$md.AppendLine('```')
            [void]$md.AppendLine($project.cavemanBrief)
            [void]$md.AppendLine('```')
        }
        [void]$md.AppendLine()
    }
}

Set-Content -LiteralPath $OutputMd -Value $md.ToString() -Encoding UTF8

Write-Host "Generated $($records.Count) project recommendations across $($familyGroups.Count) families."
Write-Host "JSON: $OutputJson"
Write-Host "Markdown: $OutputMd"
