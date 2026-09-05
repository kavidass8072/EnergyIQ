@echo off
echo ======================================================================
echo Starting Commercial Campus Equipment Energy Anomaly Detector System
echo ======================================================================

echo [1/2] Launching FastAPI Backend Server on http://localhost:8000 ...
start "FastAPI Backend" cmd /k "python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload"

timeout /t 3

echo [2/2] Launching React Vite Dashboard on http://localhost:5173 ...
cd frontend
start "React Dashboard" cmd /k "npm run dev"

echo ======================================================================
echo Both Backend and Dashboard servers launched successfully!
echo Open your browser at: http://localhost:5173
echo ======================================================================
pause
