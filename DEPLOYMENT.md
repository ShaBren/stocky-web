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

#### Option 3: Release Script
```bash
# Complete release build with validation
./scripts/build-release.sh stocky-web:0.0.1
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
