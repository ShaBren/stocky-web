# StockyWeb Docker Deployment Guide

## Quick Start

### Development
```bash
# Start development environment
npm run dev
```

### Production Build & Deploy

#### Option 1: Docker Compose (Recommended)
```bash
# Build and run with Docker Compose
npm run docker:dev

# Production deployment
npm run docker:prod
```

#### Option 2: Manual Docker Build
```bash
# Build the Docker image
npm run docker:build

# Run the container
npm run docker:run
```

## Runtime Configuration

StockyWeb supports runtime configuration, allowing you to deploy the same Docker image to different environments without rebuilding. The application will load configuration from `/config.js` at runtime, which is automatically generated from environment variables.

### Environment Variables

#### Build-time Variables (Optional Fallbacks)
These are used during the Docker build process and serve as fallbacks if runtime variables are not provided:

- `VITE_API_BASE_URL` - Default API endpoint
- `VITE_APP_NAME` - Application name  
- `VITE_APP_VERSION` - Application version
- `VITE_ENABLE_ANALYTICS` - Enable analytics (true/false)
- `VITE_ENABLE_DEBUG` - Enable debug mode (true/false)
- `VITE_ENABLE_HTTPS_ONLY` - Enforce HTTPS (true/false)
- `VITE_ENVIRONMENT` - Environment name

#### Runtime Variables (Recommended)
These take precedence over build-time variables and allow the same image to work in different environments:

- `RUNTIME_API_BASE_URL` - API endpoint for this deployment
- `RUNTIME_APP_NAME` - Application name for this deployment
- `RUNTIME_APP_VERSION` - Application version for this deployment  
- `RUNTIME_ENABLE_ANALYTICS` - Enable analytics for this deployment
- `RUNTIME_ENABLE_DEBUG` - Enable debug mode for this deployment
- `RUNTIME_ENABLE_HTTPS_ONLY` - Enforce HTTPS for this deployment
- `RUNTIME_ENVIRONMENT` - Environment name for this deployment

### Deployment Examples

#### Development Environment
```bash
docker run -d -p 3000:80 \
  -e RUNTIME_API_BASE_URL=http://localhost:8000/api/v1 \
  -e RUNTIME_ENVIRONMENT=development \
  -e RUNTIME_ENABLE_DEBUG=true \
  stocky-web:latest
```

#### Staging Environment  
```bash
docker run -d -p 3000:80 \
  -e RUNTIME_API_BASE_URL=https://api-staging.yourdomain.com/api/v1 \
  -e RUNTIME_ENVIRONMENT=staging \
  -e RUNTIME_ENABLE_DEBUG=true \
  stocky-web:latest
```

#### Production Environment
```bash
docker run -d -p 3000:80 \
  -e RUNTIME_API_BASE_URL=https://api.yourdomain.com/api/v1 \
  -e RUNTIME_ENVIRONMENT=production \
  -e RUNTIME_ENABLE_DEBUG=false \
  -e RUNTIME_ENABLE_HTTPS_ONLY=true \
  stocky-web:latest
```

#### Using Docker Compose
Create environment-specific `.env` files:

**.env.development**
```env
RUNTIME_API_BASE_URL=http://localhost:8000/api/v1
RUNTIME_ENVIRONMENT=development
RUNTIME_ENABLE_DEBUG=true
```

**.env.production**
```env
RUNTIME_API_BASE_URL=https://api.yourdomain.com/api/v1  
RUNTIME_ENVIRONMENT=production
RUNTIME_ENABLE_DEBUG=false
RUNTIME_ENABLE_HTTPS_ONLY=true
```

Then deploy:
```bash
# Development
docker-compose --env-file .env.development up -d

# Production  
docker-compose --env-file .env.production up -d
```

#### Option 3: Release Script
```bash
# Complete release build with validation
/scripts/build-release.sh stocky-web:0.0.1
```

## Configuration

### Environment Variables
Copy `.env.production.example` to `.env.production` and configure:

```bash
cp .env.production.example .env.production
```

Key variables:
- `VITE_API_BASE_URL`: Backend API endpoint
- `VITE_APP_NAME`: Application name
- `VITE_APP_VERSION`: Version number

### Docker Configuration

The Docker setup uses:
- **Build Stage**: Node.js 20 Alpine for building
- **Runtime Stage**: Nginx Alpine for serving
- **Port**: 80 (mapped to host port 3000)
- **Health Check**: `/health` endpoint

### Nginx Features
- Gzip compression enabled
- Security headers configured
- Client-side routing support (SPA)
- Static asset caching (1 year)
- HTML caching (1 hour)

## Docker Compose Deployment

### Prerequisites
- Docker and Docker Compose installed
- Backend API service running (for full functionality)

### Environment Setup
1. Copy the environment example file:
```bash
cp .env.example .env
```

2. Edit `.env` with your configuration:
```bash
# Frontend Configuration
VITE_API_BASE_URL=http://localhost:8000/api/v1  # Your backend API URL
VITE_APP_NAME=StockyWeb
VITE_APP_VERSION=0.0.1

# Service Ports
WEB_PORT=3000    # Port to access the web frontend
API_PORT=8000    # Port for backend API (if deploying together)
DB_PORT=5432     # Port for database (if using PostgreSQL)

# Backend Configuration (optional)
DATABASE_URL=sqlite:///app/data/stocky.db
SECRET_KEY=your-secret-key-here-change-in-production
CORS_ORIGINS=http://localhost:3000
```

### Deployment Commands

#### Frontend Only (Default)
```bash
# Build and start the frontend service
docker-compose up -d stocky-web

# View logs
docker-compose logs -f stocky-web

# Stop the service
docker-compose down
```

#### Full Stack Deployment
Uncomment the backend and database services in `docker-compose.yml`, then:

```bash
# Start all services
docker-compose up -d

# Check service status
docker-compose ps

# View all logs
docker-compose logs -f

# Stop all services
docker-compose down
```

### Service URLs
- **Frontend**: http://localhost:3000 (or your WEB_PORT)
- **Backend API**: http://localhost:8000 (or your API_PORT)
- **Database**: localhost:5432 (or your DB_PORT)

### Volume Management
```bash
# View volumes
docker volume ls

# Backup database volume (if using PostgreSQL)
docker run --rm -v stocky-web_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/db-backup.tar.gz -C /data .

# Restore database volume
docker run --rm -v stocky-web_postgres_data:/data -v $(pwd):/backup alpine tar xzf /backup/db-backup.tar.gz -C /data
```

### Health Checks
The frontend container includes health checks:
```bash
# Check container health
docker-compose ps

# Manual health check
curl http://localhost:3000
```

## Production Deployment

### 1. Registry Deployment
```bash
# Tag for your registry
docker tag stocky-web:0.0.1 your-registry.com/stocky-web:0.0.1

# Push to registry
docker push your-registry.com/stocky-web:0.0.1
```

### 2. Kubernetes Deployment
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: stocky-web
spec:
  replicas: 3
  selector:
    matchLabels:
      app: stocky-web
  template:
    metadata:
      labels:
        app: stocky-web
    spec:
      containers:
      - name: stocky-web
        image: your-registry.com/stocky-web:0.0.1
        ports:
        - containerPort: 80
        livenessProbe:
          httpGet:
            path: /health
            port: 80
          initialDelaySeconds: 30
          periodSeconds: 10
```

### 3. Cloud Platform Deployment
- **AWS**: Use ECS, EKS, or App Runner
- **Google Cloud**: Use Cloud Run or GKE
- **Azure**: Use Container Instances or AKS
- **DigitalOcean**: Use App Platform or Kubernetes

## Monitoring & Health Checks

The application includes:
- Health check endpoint: `GET /health`
- Nginx access logs
- Container health checks in Docker Compose

## Security Considerations

- Nginx security headers configured
- No sensitive data in Docker image
- Environment variables for configuration
- HTTPS enforcement available
- Content Security Policy ready

## Troubleshooting

### Common Issues
1. **Build Fails**: Check TypeScript errors with `npm run lint`
2. **Container Won't Start**: Check Docker logs with `docker logs <container-id>`
3. **API Connection**: Verify `VITE_API_BASE_URL` in environment config
4. **Static Assets 404**: Ensure nginx.conf is properly copied

### Debug Commands
```bash
# Check container logs
docker logs stocky-web

# Access container shell
docker exec -it stocky-web sh

# Test health endpoint
curl http://localhost:3000/health
```
