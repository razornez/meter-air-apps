## Meter Air — Start semua service sekaligus
## Cukup jalankan: powershell -ExecutionPolicy Bypass -File .\start.ps1
##
## Backend  : http://localhost:4000/api
## Web      : http://localhost:8081
##
## Kedua service auto-reload saat kode berubah. Tutup window ini = hentikan semua.

Set-Location $PSScriptRoot

# Pastikan MySQL XAMPP hidup
Write-Host "Cek MySQL..." -ForegroundColor Yellow
$mysql = Get-Process mysqld -ErrorAction SilentlyContinue
if (-not $mysql) {
  Write-Host "PERINGATAN: MySQL tidak jalan. Pastikan XAMPP MySQL aktif." -ForegroundColor Red
}

# Jalankan backend di background job
Write-Host "Memulai Backend (port 4000)..." -ForegroundColor Cyan
$apiJob = Start-Job -ScriptBlock {
  Set-Location "$using:PSScriptRoot\api"
  npm run start:dev
}

# Tunggu backend siap (maks 30 detik)
Write-Host "Menunggu backend siap..." -ForegroundColor Gray
$ready = $false
for ($i = 0; $i -lt 30; $i++) {
  Start-Sleep -Seconds 1
  $out = Receive-Job $apiJob 2>$null
  if ($out -match "berjalan di http") { $ready = $true; break }
  if ($out -match "Error|EADDRINUSE") { Write-Host "ERROR: $out" -ForegroundColor Red; break }
}

if ($ready) {
  Write-Host "Backend siap di http://localhost:4000/api" -ForegroundColor Green
} else {
  Write-Host "Backend belum siap — lanjut tetap mencoba..." -ForegroundColor Yellow
}

# Jalankan Expo web
Write-Host "Memulai Expo Web (port 8081)..." -ForegroundColor Magenta
$env:EXPO_PUBLIC_API_URL = "http://localhost:4000/api"
Set-Location "$PSScriptRoot\mobile"
npm run web 2>&1 | ForEach-Object {
  # Cetak output expo ke terminal
  Write-Host "[EXPO] $_"
  # Buka browser otomatis saat Expo siap
  if ($_ -match "8081" -and -not $browserOpened) {
    Start-Process "http://localhost:8081"
    $script:browserOpened = $true
  }
}
