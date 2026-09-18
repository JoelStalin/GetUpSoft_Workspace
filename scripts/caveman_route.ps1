param(
    [string]$Prompt,
    [int]$Top = 5
)

$ErrorActionPreference = 'Stop'

$rawPrompt = $Prompt
if ([string]::IsNullOrWhiteSpace($rawPrompt)) {
    $rawPrompt = ''
}
$rawPrompt = $rawPrompt.Trim()

$workspaceRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$skillsRoot = Join-Path $workspaceRoot '.agents/skills'

function Get-SkillMeta {
    param([string]$SkillPath)

    $name = Split-Path $SkillPath -Parent | Split-Path -Leaf
    $description = ''
    $content = Get-Content -LiteralPath $SkillPath -ErrorAction SilentlyContinue
    $inFrontmatter = $false

    foreach ($line in $content) {
        if ($line -eq '---') {
            $inFrontmatter = -not $inFrontmatter
            continue
        }
        if ($inFrontmatter -and $line -match '^\s*description:\s*(.+)\s*$') {
            $description = $matches[1].Trim().Trim('"')
            break
        }
        if ($inFrontmatter -and $line -match '^\s*name:\s*(.+)\s*$') {
            $name = $matches[1].Trim().Trim('"')
        }
    }

    [pscustomobject]@{
        Name = $name
        Description = $description
        Path = $SkillPath
    }
}

function Tokenize {
    param([string]$Text)

    ($Text.ToLowerInvariant() -split '[^a-z0-9\-\+:]+') |
        Where-Object { $_ -and $_.Length -gt 1 } |
        Select-Object -Unique
}

function Score-Skill {
    param(
        [pscustomobject]$Skill,
        [string[]]$Tokens,
        [string]$PromptText
    )

    $score = 0
    $haystack = (($Skill.Name + ' ' + $Skill.Description + ' ' + $PromptText).ToLowerInvariant())

    foreach ($token in $Tokens) {
        if ($haystack -like ('*' + $token + '*')) {
            $score += 1
        }
    }

    switch -Regex ($PromptText.ToLowerInvariant()) {
        'web|browser|frontend|ui|selenium|playwright|click|login|form' {
            if ($Skill.Name -match 'webapp-testing|browser|theme-factory|components-build') { $score += 6 }
        }
        'security|audit|csrf|cors|header|tls|auth' {
            if ($Skill.Name -match 'authorized-security-testing') { $score += 6 }
        }
        'agent|multiagent|skills|workflow|orchestr|coord' {
            if ($Skill.Name -match 'agency-agents|skill-share|mcp-builder') { $score += 6 }
        }
        'hyperframes|animation|video|motion|timeline|caption|voice' {
            if ($Skill.Name -match 'hyperframes|hyperframes-cli|hyperframes-media|css-animations|waapi|animejs|gsap|lottie|three|typegpu') { $score += 6 }
        }
        'notion|docs|documentation|research|knowledge|wiki' {
            if ($Skill.Name -match 'notion|content-research-writer|internal-comms') { $score += 6 }
        }
    }

    switch ($Skill.Name) {
        'skill-installer' {
            if ($PromptText -match 'install|installa|repo|github|skill|plugin') { $score += 4 }
            else { $score -= 3 }
        }
        'skill-share' {
            if ($PromptText -match 'share|sync|mirror|bundle|workspace|export|installa|copiar') { $score += 4 }
            else { $score -= 3 }
        }
        'agency-agents' {
            if ($PromptText -match 'agent|agents|multiagent|coord|hand-off|handoff|review|roles|orchestr') { $score += 7 }
        }
        'webapp-testing' {
            if ($PromptText -match 'browser|selenium|playwright|ui|frontend|click|render|visual') { $score += 7 }
        }
    }

    $score
}

$skillFiles = Get-ChildItem -LiteralPath $skillsRoot -Recurse -Filter SKILL.md -File | Sort-Object FullName
$skills = foreach ($file in $skillFiles) {
    Get-SkillMeta -SkillPath $file.FullName
}

$tokens = Tokenize -Text $rawPrompt
$ranked = foreach ($skill in $skills) {
    $score = Score-Skill -Skill $skill -Tokens $tokens -PromptText $rawPrompt
    if ($score -gt 0) {
        [pscustomobject]@{
            Name = $skill.Name
            Description = $skill.Description
            Path = $skill.Path
            Score = $score
        }
    }
}

$uniqueRanked = $ranked | Group-Object Name | ForEach-Object {
    $_.Group | Sort-Object Score -Descending | Select-Object -First 1
}

$ordered = $uniqueRanked | Sort-Object -Property @{Expression='Score';Descending=$true}, @{Expression='Name';Descending=$false} | Select-Object -First $Top

$sb = New-Object System.Text.StringBuilder
[void]$sb.AppendLine('CAVEMAN BRIEF')
[void]$sb.AppendLine(('Prompt tokens: ' + ($tokens -join ', ')))
[void]$sb.AppendLine(('Workspace skill count: ' + $skills.Count))
[void]$sb.AppendLine('')
[void]$sb.AppendLine('Recommended skills')

foreach ($skill in $ordered) {
    [void]$sb.AppendLine(('- ' + $skill.Name + ' [' + $skill.Score + '] - ' + $skill.Description))
}

$sb.ToString()
