# 1. Inicia automatización para INSTAGRAM (@galantesjewelrybythesea)
# Usa config_instagram.json -> perfil_instagram
Write-Host "Lanzando Instagram (@galantesjewelrybythesea)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "python -m bot.followers_loop config_instagram.json" -WindowStyle Normal

# Pequeña pausa para no saturar al abrir Chrome
Start-Sleep -Seconds 15

# 2. Inicia automatización para FACEBOOK
# Usa config_facebook.json -> perfil_bot
Write-Host "Lanzando Facebook..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "python -m bot.followers_loop config_facebook.json" -WindowStyle Normal

Write-Host "----------------------------------------------------"
Write-Host "¡Automatización DUAL lanzada con éxito!" -ForegroundColor White -BackgroundColor Blue
Write-Host "Monitorea las dos ventanas de Chrome abiertas." -ForegroundColor Yellow
Write-Host "----------------------------------------------------"
