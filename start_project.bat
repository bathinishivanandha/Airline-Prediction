@echo off
echo ==========================================
echo   Smart Airfare Price Prediction System
echo ==========================================
echo.

echo Starting ML Service...
start "ML Service" cmd /c "cd Airline_prediction\ml-service && .\venv\Scripts\python.exe app.py"

echo Starting Backend Server...
start "Backend" cmd /c "cd Airline_prediction\backend && npm install && node server.js"

echo Starting Frontend Dev Server...
start "Frontend" cmd /c "cd Airline_prediction\frontend && npm install && npm run dev"

echo.
echo All services are starting in separate windows.
echo Please wait a few seconds for them to initialize.
echo.
pause
