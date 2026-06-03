# Khởi động Android emulator với wipe-data (xóa app, cache, onboarding đã xem...)
$adb = "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe"
$emu = "$env:LOCALAPPDATA\Android\Sdk\emulator\emulator.exe"
$avd = "flutter_emulator"

Write-Host "Dang tat emulator cu (neu co)..."
if (Test-Path $adb) {
  & $adb emu kill 2>$null
}
Get-Process -Name "qemu-system*","emulator" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 3

Write-Host "Khoi dong $avd voi -wipe-data (may ao sach)..."
Start-Process -FilePath $emu -ArgumentList "-avd", $avd, "-wipe-data"

Write-Host ""
Write-Host "Cho 30-60 giay den man hinh Android, roi chay:"
Write-Host "  flutter devices"
Write-Host "  flutter run -d emulator-5554"
