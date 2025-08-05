#!/bin/bash

# Khabeer Panel Deployment Script
set -e

echo "🚀 Starting Khabeer Panel deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check Docker
print_status "Checking Docker..."
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed"
    exit 1
fi

# Cleanup existing containers
print_status "Cleaning up existing containers..."
docker stop khabeer-panel 2>/dev/null || true
docker rm khabeer-panel 2>/dev/null || true

# Build and start
print_status "Building and starting Khabeer Panel..."
docker-compose up --build -d

# Wait and check health
print_status "Checking application health..."
sleep 10

if docker ps --format "table {{.Names}}" | grep -q "khabeer-panel"; then
    print_success "Container is running"
else
    print_error "Container failed to start"
    exit 1
fi

print_success "Deployment completed!"
echo ""
echo "📋 Application URL: http://localhost:3001"
echo "🔧 View logs: docker logs khabeer-panel"