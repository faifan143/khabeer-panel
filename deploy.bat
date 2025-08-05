@echo off
REM Khabeer Panel Deployment Script for Windows
setlocal enabledelayedexpansion

echo 🚀 Starting Khabeer Panel deployment...

REM Check if Docker is installed
docker --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker is not installed or not in PATH
    exit /b 1
)

echo [INFO] Docker is available

REM Cleanup existing containers
echo [INFO] Cleaning up existing containers...
docker stop khabeer-panel 2>nul
docker rm khabeer-panel 2>nul

REM Build and start
echo [INFO] Building and starting Khabeer Panel...
docker-compose down 2>nul
docker-compose up --build -d

REM Wait and check health
echo [INFO] Checking application health...
timeout /t 10 /nobreak >nul

REM Check if container is running
docker ps --format "table {{.Names}}" | findstr "khabeer-panel" >nul
if errorlevel 1 (
    echo [ERROR] Container failed to start
    exit /b 1
) else (
    echo [SUCCESS] Container is running
)

echo [SUCCESS] Deployment completed!
echo.
echo 📋 Application URL: http://localhost:3001
echo 🔧 View logs: docker logs khabeer-panel
echo.
pause