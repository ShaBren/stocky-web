# Multi-stage build for optimal production image
FROM node:20-alpine AS build

# Build arguments for Vite environment variables
ARG VITE_API_BASE_URL
ARG VITE_APP_NAME
ARG VITE_APP_VERSION
ARG VITE_ENABLE_ANALYTICS
ARG VITE_ENABLE_DEBUG
ARG VITE_ENABLE_HTTPS_ONLY
ARG VITE_ENVIRONMENT

# Set environment variables from build args
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_APP_NAME=$VITE_APP_NAME
ENV VITE_APP_VERSION=$VITE_APP_VERSION
ENV VITE_ENABLE_ANALYTICS=$VITE_ENABLE_ANALYTICS
ENV VITE_ENABLE_DEBUG=$VITE_ENABLE_DEBUG
ENV VITE_ENABLE_HTTPS_ONLY=$VITE_ENABLE_HTTPS_ONLY
ENV VITE_ENVIRONMENT=$VITE_ENVIRONMENT

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production=false

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage with Nginx
FROM nginx:alpine

# Copy built assets from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
