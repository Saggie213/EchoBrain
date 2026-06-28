@echo off
echo Starting EchoBrain AI...

:: Start Backend
start cmd /k "cd backend && .\venv\Scripts\activate && uvicorn main:app --reload --port 8000"

:: Start Frontend
start cmd /k "cd frontend && npm run dev -- -p 3000"

echo Servers started!
echo Frontend: http://localhost:3000
echo Backend API: http://localhost:8000
