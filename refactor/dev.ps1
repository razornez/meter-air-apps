# Launcher dev: jalankan Backend (watch) + Mobile (Fast Refresh) sekaligus.
# Keduanya AUTO-RELOAD saat ada perubahan kode — tidak perlu restart manual.
#
# Pakai (dari folder refactor): powershell -ExecutionPolicy Bypass -File .\dev.ps1
#
# Backend  : nest start --watch  → recompile + restart otomatis tiap file berubah.
# Mobile   : expo start          → Fast Refresh (perubahan langsung tampil).
#            (di jendela Expo, tekan 'w' untuk web, atau scan QR utk iPhone)

$root = $PSScriptRoot

Write-Host "Menjalankan Backend (watch) di jendela baru..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList @(
  '-NoExit', '-Command', "cd '$root\api'; npm run start:dev"
)

Start-Sleep -Seconds 2

Write-Host "Menjalankan Mobile/Expo (Fast Refresh) di jendela baru..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList @(
  '-NoExit', '-Command', "cd '$root\mobile'; npx expo start"
)

Write-Host ""
Write-Host "Selesai. Dua jendela terbuka — keduanya auto-reload saat kode berubah." -ForegroundColor Green
Write-Host "Backend: http://localhost:4000/api  |  Expo: tekan 'w' untuk web." -ForegroundColor Green
Write-Host "Catatan: perubahan file .env perlu restart manual (Ctrl+C lalu jalankan lagi)." -ForegroundColor Yellow
