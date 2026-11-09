@echo off
title AutoLearn AI Platform
cd /d "%~dp0"

echo ========================================================
echo   AutoLearn AI - Adaptive Learning Platform
echo ========================================================
echo.
echo Starting AutoLearn Server on port 5000...
echo.

start "AutoLearn Server (:5000)" cmd /k "cd /d ""%~dp0"" && py -3 app.py || python app.py"

echo Waiting 4 seconds for server to initialize...
timeout /t 4 /nobreak >nul

echo.
echo Opening AutoLearn at http://localhost:5000 in your browser...
start http://localhost:5000

echo.
echo ========================================================
echo   AutoLearn is running at: http://localhost:5000
echo   Both Frontend and Backend are active!
echo ========================================================
echo.
pause
