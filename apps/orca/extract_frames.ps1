# Extract frames from video using ffmpeg
$videoPath = "C:\Users\yoeli\Videos\Captures\Stitch - Projects - Google Chrome 2026-05-20 21-58-53.mp4"
$outputDir = "C:\Users\yoeli\Documents\GetUpSoft_Workspace\apps\orca\workflow-editor\video-analysis"

# Create output directory
if (-not (Test-Path $outputDir)) {
    New-Item -ItemType Directory -Path $outputDir | Out-Null
}

# Get video info
$videoInfo = & ffprobe -v error -show_format -show_streams $videoPath | Select-String "duration"
Write-Host "Video info retrieved"

# Extract frames at key moments (0s, 2s, 5s, 10s, 15s, etc.)
$timestamps = @(0, 2, 5, 10, 15, 20, 25, 30)

foreach ($t in $timestamps) {
    $outputFile = "$outputDir\frame-${t}s.jpg"
    & ffmpeg -ss $t -i $videoPath -vframes 1 -q:v 2 $outputFile -y 2>&1 | Out-Null
    Write-Host "✓ Extracted frame at ${t}s"
}

Write-Host "All frames extracted to: $outputDir"
Get-ChildItem $outputDir | Sort-Object Name
