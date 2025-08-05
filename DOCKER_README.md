# Khabeer Panel - Docker Deployment

This document explains how to deploy the Khabeer Panel application using Docker.

## Prerequisites

- Docker installed and running
- Docker Compose installed
- At least 2GB of available RAM

## Quick Start

### 1. Using the Deployment Script (Recommended)

```bash
# Make the script executable (Linux/Mac)
chmod +x deploy.sh

# Run the deployment script
./deploy.sh
```

### 2. Manual Deployment

```bash
# Build and start the application
docker-compose up --build -d

# Check if the container is running
docker ps

# View logs
docker logs khabeer-panel
```

## Configuration

### Port Configuration
The application runs on port **3001** by default. You can change this by modifying:
- `docker-compose.yml` - Change the port mapping
- `Dockerfile` - Update the EXPOSE and ENV PORT values

### Environment Variables
The following environment variables are set in the container:
- `NODE_ENV=production`
- `PORT=3001`
- `HOSTNAME=0.0.0.0`

## Docker Commands

### Basic Operations
```bash
# Start the application
docker-compose up -d

# Stop the application
docker-compose down

# View logs
docker logs khabeer-panel

# Restart the application
docker restart khabeer-panel

# Remove the container
docker rm -f khabeer-panel
```

### Development
```bash
# Build without cache
docker-compose build --no-cache

# Run in foreground (for debugging)
docker-compose up

# Access container shell
docker exec -it khabeer-panel sh
```

## File Structure

```
khabeer-panel/
├── Dockerfile                 # Multi-stage Docker build
├── docker-compose.yml         # Development deployment
├── docker-compose.prod.yml    # Production deployment
├── deploy.sh                  # Automated deployment script
├── .dockerignore             # Docker build exclusions
└── DOCKER_README.md          # This file
```

## Production Deployment

For production deployment, use the production compose file:

```bash
# Deploy to production
docker-compose -f docker-compose.prod.yml up --build -d

# Check production logs
docker logs khabeer-panel-prod
```

## Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   # Check what's using port 3001
   netstat -tulpn | grep :3001
   
   # Kill the process or change the port in docker-compose.yml
   ```

2. **Container fails to start**
   ```bash
   # Check container logs
   docker logs khabeer-panel
   
   # Check container status
   docker ps -a
   ```

3. **Build fails**
   ```bash
   # Clean up and rebuild
   docker-compose down
   docker system prune -f
   docker-compose up --build
   ```

### Health Check

The application should be accessible at `http://localhost:3001` after deployment.

```bash
# Test the application
curl http://localhost:3001

# Or open in browser
open http://localhost:3001
```

## Performance Optimization

The Dockerfile uses multi-stage builds to optimize image size:
- **deps stage**: Installs only production dependencies
- **builder stage**: Builds the Next.js application
- **runner stage**: Creates the final lightweight image

## Security

- The application runs as a non-root user (`nextjs`)
- Only necessary files are copied to the final image
- Production environment variables are set
- Health checks are configured for production

## Monitoring

```bash
# Monitor container resources
docker stats khabeer-panel

# Monitor logs in real-time
docker logs -f khabeer-panel

# Check container health
docker inspect khabeer-panel | grep Health -A 10
```

## Backup and Restore

```bash
# Create a backup of the container
docker commit khabeer-panel khabeer-panel-backup

# Restore from backup
docker run -d -p 3001:3001 --name khabeer-panel-restored khabeer-panel-backup
```