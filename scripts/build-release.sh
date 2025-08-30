#!/bin/bash

# StockyWeb Release Build Script
# Creates production-ready Docker image for deployment

set -e  # Exit on any error

echo "🚀 StockyWeb Release Builder v0.0.1"
echo "==================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DOCKER_TAG=${1:-"stocky-web:0.0.1"}
BUILD_ENV=${2:-"production"}

echo -e "${BLUE}📋 Build Configuration:${NC}"
echo -e "   Docker Tag: ${YELLOW}$DOCKER_TAG${NC}"
echo -e "   Environment: ${YELLOW}$BUILD_ENV${NC}"
echo ""

# Step 1: Clean previous builds
echo -e "${BLUE}🧹 Cleaning previous builds...${NC}"
rm -rf dist/
echo "✅ Cleaned dist directory"

# Step 2: Run linting
echo -e "${BLUE}🔍 Running ESLint...${NC}"
if npm run lint; then
    echo -e "${GREEN}✅ Linting passed${NC}"
else
    echo -e "${RED}❌ Linting failed - please fix errors before building${NC}"
    exit 1
fi

# Step 3: Type checking
echo -e "${BLUE}🔧 Running TypeScript compilation...${NC}"
if npm run build; then
    echo -e "${GREEN}✅ Build completed successfully${NC}"
else
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
fi

# Step 4: Build Docker image
echo -e "${BLUE}🐳 Building Docker image...${NC}"
if docker build -t "$DOCKER_TAG" .; then
    echo -e "${GREEN}✅ Docker image built successfully${NC}"
else
    echo -e "${RED}❌ Docker build failed${NC}"
    exit 1
fi

# Step 5: Image information
echo -e "${BLUE}📊 Docker Image Information:${NC}"
docker images "$DOCKER_TAG" --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}\t{{.CreatedAt}}"

echo ""
echo -e "${GREEN}🎉 Release build completed successfully!${NC}"
echo ""
echo -e "${BLUE}📝 Next steps:${NC}"
echo -e "   • Test locally: ${YELLOW}docker run -p 3000:80 $DOCKER_TAG${NC}"
echo -e "   • Tag for registry: ${YELLOW}docker tag $DOCKER_TAG your-registry.com/$DOCKER_TAG${NC}"
echo -e "   • Push to registry: ${YELLOW}docker push your-registry.com/$DOCKER_TAG${NC}"
echo ""
echo -e "${BLUE}🚀 Ready for deployment!${NC}"
