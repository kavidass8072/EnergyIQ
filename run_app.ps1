Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "Starting Commercial Campus Equipment Energy Anomaly Detector System" -ForegroundColor Cyan
Write-Host "======================================================================" -ForegroundColor Cyan

Write-Host "[1/2] Launching FastAPI Backend Server on http://localhost:8000 ..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload"

Start-Sleep -Seconds 3

Write-Host "[2/2] Launching React Vite Dashboard on http://localhost:5173 ..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location frontend; npm run dev"

Write-Host "======================================================================" -ForegroundColor Green
Write-Host "Both Backend and Dashboard servers launched successfully!" -ForegroundColor Green
Write-Host "Open your browser at: http://localhost:5173" -ForegroundColor Green
Write-Host "======================================================================" -ForegroundColor Green
