# Khabeer Panel Deployment Test Script for PowerShell
Write-Host "🧪 Testing Khabeer Panel Deployment..." -ForegroundColor Blue

# Check if Docker is running
try {
    docker info | Out-Null
    Write-Host "[SUCCESS] Docker is running" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Docker is not running" -ForegroundColor Red
    exit 1
}

# Check if container exists and is running
$containerStatus = docker ps --format "table {{.Names}},{{.Status}}" | Select-String "khabeer-panel"
if ($containerStatus) {
    Write-Host "[SUCCESS] Container is running" -ForegroundColor Green
    Write-Host $containerStatus
} else {
    Write-Host "[WARNING] Container is not running" -ForegroundColor Yellow
}

# Test HTTP connection
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001" -TimeoutSec 10 -UseBasicParsing
    Write-Host "[SUCCESS] Application is responding on port 3001" -ForegroundColor Green
    Write-Host "Status Code: $($response.StatusCode)" -ForegroundColor Cyan
} catch {
    Write-Host "[WARNING] Application is not responding on port 3001" -ForegroundColor Yellow
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Show container logs (last 10 lines)
Write-Host "`n📋 Recent container logs:" -ForegroundColor Blue
docker logs --tail 10 khabeer-panel

Write-Host "`n✅ Test completed!" -ForegroundColor Green