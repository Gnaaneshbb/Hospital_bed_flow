@echo off
echo ===================================================
echo Starting Hospital Flow AI Services...
echo ===================================================

echo [1/3] Starting AI Service (FastAPI / LangGraph) on port 8000...
start "Hospital Flow - AI Service (8000)" cmd /k "cd /d %~dp0ai-service && .\.venv\Scripts\python.exe main.py"

echo [2/3] Starting Backend (Spring Boot) on port 8080...
start "Hospital Flow - Backend (8080)" cmd /k "cd /d %~dp0backend && .\mvn-bin\apache-maven-3.9.6\bin\mvn.cmd spring-boot:run"

echo [3/3] Starting Frontend (React / Vite) on port 5173...
start "Hospital Flow - Frontend (5173)" cmd /k "cd /d %~dp0frontend && npm run dev"

echo ===================================================
echo All services launched in separate windows!
echo - Frontend:    http://localhost:5173
echo - Backend API: http://localhost:8080/api/hospital/state
echo - AI Service:  http://localhost:8000/docs
echo ===================================================
