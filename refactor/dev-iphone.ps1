# Launcher DEV untuk iPhone (Expo Go).
# API URL = IP LAN PC (iPhone di jaringan lokal).

$root = $PSScriptRoot

# Deteksi IP LAN otomatis
$ip = (Get-NetIPAddress -AddressFamily IPv4 |
  Where-Object { $_.IPAddress -notmatch '^127\.' -and $_.IPAddress -notmatch '^169\.' } |
  Select-Object -First 1).IPAddress

if (-not $ip) { $ip = "192.168.1.12" }  # fallback
Write-Host "IP LAN PC terdeteksi: $ip" -ForegroundColor Yellow
Write-Host "Pastikan iPhone & PC satu WiFi, lalu scan QR di terminal Expo." -ForegroundColor Yellow

Write-Host "Menjalankan Backend..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList @(
  '-NoExit', '-Command', "cd '$root\api'; npm run start:dev"
)

Start-Sleep -Seconds 2

Write-Host "Menjalankan Expo (iPhone)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList @(
  '-NoExit', '-Command',
  "cd '$root\mobile'; `$env:EXPO_PUBLIC_API_URL='http://${ip}:4000/api'; npx expo start --clear"
)

Write-Host ""
Write-Host "Scan QR dengan kamera iPhone → terbuka di Expo Go" -ForegroundColor Green
