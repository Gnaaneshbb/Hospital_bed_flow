Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "Starting Hospital Flow AI Services..." -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan

$root = $PSScriptRoot

Write-Host "[1/3] Starting AI Service (FastAPI / LangGraph) on port 8000..." -ForegroundColor Green
Start-Process cmd -ArgumentList "/k cd /d `"$root\ai-service`" && .\.venv\Scripts\python.exe main.py"

Write-Host "[2/3] Starting Backend (Spring Boot) on port 8080..." -ForegroundColor Green
Start-Process cmd -ArgumentList "/k cd /d `"$root\backend`" && .\mvn-bin\apache-maven-3.9.6\bin\mvn.cmd spring-boot:run"

Write-Host "[3/3] Starting Frontend (React / Vite) on port 5173..." -ForegroundColor Green
Start-Process cmd -ArgumentList "/k cd /d `"$root\frontend`" && npm run dev"

Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "All services launched in separate windows!" -ForegroundColor Green
Write-Host "- Frontend:    http://localhost:5173"
Write-Host "- Backend API: http://localhost:8080/api/hospital/state"
Write-Host "- AI Service:  http://localhost:8000/docs"
Write-Host "===================================================" -ForegroundColor Cyan
