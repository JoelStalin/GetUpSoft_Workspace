param(
    [Parameter(Mandatory = $true)]
    [string]$Request,

    [Parameter(Mandatory = $true)]
    [string]$Action,

    [Parameter(Mandatory = $true)]
    [string]$Result
)

$repoRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$memoryPath = Join-Path $repoRoot "context\\LONG_TERM_MEMORY.md"

if (-not (Test-Path $memoryPath)) {
    throw "Memory file not found: $memoryPath"
}

$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss K"
$safeRequest = $Request.Replace("|", "/")
$safeAction = $Action.Replace("|", "/")
$safeResult = $Result.Replace("|", "/")

$line = "| $timestamp | $safeRequest | $safeAction | $safeResult |"
Add-Content -Path $memoryPath -Value $line

Write-Output "Appended memory entry to $memoryPath"

