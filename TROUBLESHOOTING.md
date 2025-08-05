# Troubleshooting Guide

## Build Issues

### 1. TypeScript Module Not Found
**Error**: `Cannot find module 'typescript'`

**Solution**: The Dockerfile has been updated to install all dependencies (including devDependencies) during the build stage. This ensures TypeScript is available for the build process.

### 2. Build Cache Issues
**Error**: Build fails with unexpected errors

**Solution**: Clear Docker build cache:
```bash
docker-compose down
docker system prune -f
docker-compose up --build --no-cache
```

### 3. Port Already in Use
**Error**: `Port 3001 is already in use`

**Solution**: 
```bash
# Check what's using the port
netstat -tulpn | grep :3001

# Kill the process or change port in docker-compose.yml
```

### 4. Permission Issues
**Error**: Permission denied when running deploy script

**Solution**: Make script executable:
```bash
chmod +x deploy.sh
```

## Runtime Issues

### 1. Container Fails to Start
**Check logs**:
```bash
docker logs khabeer-panel
```

**Common causes**:
- Missing environment variables
- Port conflicts
- Insufficient memory

### 2. Application Not Responding
**Check health**:
```bash
# Check if container is running
docker ps

# Test HTTP response
curl http://localhost:3001

# Check container logs
docker logs khabeer-panel
```

### 3. Memory Issues
**Error**: Container runs out of memory during build

**Solution**: Increase Docker memory limit or use build optimization:
```bash
# Build with memory limit
docker-compose build --memory=2g
```

## Environment Issues

### 1. Node.js Version Mismatch
**Error**: Incompatible Node.js version

**Solution**: Update Dockerfile to use correct Node.js version:
```dockerfile
FROM node:18-alpine AS base
```

### 2. Missing Dependencies
**Error**: Module not found errors

**Solution**: Ensure all dependencies are in package.json and rebuild:
```bash
npm install
docker-compose up --build
```

## Performance Issues

### 1. Slow Build Times
**Solutions**:
- Use Docker layer caching
- Optimize .dockerignore
- Use multi-stage builds (already implemented)

### 2. Large Image Size
**Solutions**:
- Use .dockerignore to exclude unnecessary files
- Use multi-stage builds (already implemented)
- Use Alpine Linux base image (already implemented)

## Debugging Commands

```bash
# View container logs
docker logs khabeer-panel

# Access container shell
docker exec -it khabeer-panel sh

# Check container resources
docker stats khabeer-panel

# Inspect container
docker inspect khabeer-panel

# Check build history
docker history khabeer-panel
```

## Common Fixes

### 1. Complete Reset
```bash
# Stop and remove everything
docker-compose down
docker system prune -f
docker volume prune -f

# Rebuild from scratch
docker-compose up --build --no-cache
```

### 2. Update Dependencies
```bash
# Update npm dependencies
npm update

# Rebuild container
docker-compose up --build
```

### 3. Check System Resources
```bash
# Check available memory
free -h

# Check disk space
df -h

# Check Docker resources
docker system df
```