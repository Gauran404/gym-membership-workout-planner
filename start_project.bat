@echo off
echo ========================================================
echo   Starting Gym Membership and Workout Planner
echo ========================================================
echo.
echo [1/2] Starting Backend Server (Port 5000)...
start "Fitness Backend (Port 5000)" cmd /k "cd /d "%~dp0backend developer A" && npm start"

timeout /t 3 /nobreak >nul

echo [2/2] Starting Frontend React App (Port 3000)...
start "Fitness Frontend (Port 3000)" cmd /k "cd /d "%~dp0frontend developer B" && npm start"

echo.
echo ========================================================
echo   System launched!
echo   Frontend: http://localhost:3000
echo   Backend:  http://localhost:5000
echo   Blackbox Test Accounts:
echo     - Active Member:  member@gymfit.com  / Gym@1234
echo     - Expired Member: expired@gymfit.com / Gym@1234
echo     - Trainer:        trainer@gym.com    / password123
echo ========================================================
