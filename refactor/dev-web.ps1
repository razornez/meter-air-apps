# Launcher DEV untuk Browser (web).
# API URL = localhost (browser di PC yang sama dengan server).

$root = $PSScriptRoot

Write-Host "Menjalankan Backend..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList @(
  '-NoExit', '-Command', "cd '$root\api'; npm run start:dev"
)

Start-Sleep -Seconds 2

Write-Host "Menjalankan Expo WEB (browser)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList @(
  '-NoExit', '-Command',
  "cd '$root\mobile'; `$env:EXPO_PUBLIC_API_URL='http://localhost:4000/api'; npx expo start --web --clear"
)

Write-Host "Browser: http://localhost:8081" -ForegroundColor Green
