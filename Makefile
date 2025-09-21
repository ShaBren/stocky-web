# StockyWeb Development Makefile
# Provides convenient shortcuts for common development tasks

.PHONY: help install dev build test test-unit test-e2e test-watch lint format clean preview docker-build docker-run docker-image

# Default target
help:
	@echo "StockyWeb Development Commands:"
	@echo ""
	@echo "Development:"
	@echo "  make install     - Install dependencies"
	@echo "  make dev         - Start development server"
	@echo "  make build       - Build for production"
	@echo "  make preview     - Preview production build"
	@echo "  make clean       - Clean build artifacts"
	@echo ""
	@echo "Testing:"
	@echo "  make test        - Run all tests (unit + e2e)"
	@echo "  make test-unit   - Run unit tests"
	@echo "  make test-e2e    - Run E2E tests"
	@echo "  make test-watch  - Run tests in watch mode"
	@echo ""
	@echo "Code Quality:"
	@echo "  make lint        - Run ESLint"
	@echo "  make format      - Format code with Prettier"
	@echo "  make type-check  - Run TypeScript type checking"
	@echo ""
	@echo "Docker:"
	@echo "  make docker-build  - Build Docker image locally"
	@echo "  make docker-run    - Run Docker container"
	@echo "  make docker-image  - Build and push to registry"
	@echo ""
	@echo "Git:"
	@echo "  make status      - Show git status"
	@echo "  make push        - Push to origin"
	@echo ""

# Development commands
install:
	@echo "Installing dependencies..."
	npm install

dev:
	@echo "Starting development server..."
	npm run dev

build:
	@echo "Building for production..."
	npm run build

preview:
	@echo "Starting preview server..."
	npm run preview

clean:
	@echo "Cleaning build artifacts..."
	rm -rf dist
	rm -rf node_modules/.vite
	rm -rf .vite

# Testing commands
test:
	@echo "Running all tests..."
	npm run test -- --run
	npm run test:e2e

test-unit:
	@echo "Running unit tests..."
	npm run test -- --run

test-e2e:
	@echo "Running E2E tests..."
	npm run test:e2e

test-watch:
	@echo "Running tests in watch mode..."
	npm run test

test-unit-watch:
	@echo "Running unit tests in watch mode..."
	npm run test

test-e2e-ui:
	@echo "Running E2E tests with UI..."
	npm run test:e2e -- --ui

test-e2e-debug:
	@echo "Running E2E tests in debug mode..."
	npm run test:e2e -- --debug

# Code quality commands
lint:
	@echo "Running ESLint..."
	npm run lint

format:
	@echo "Formatting code..."
	@echo "Note: Add prettier script to package.json if needed"
	npx prettier --write "src/**/*.{ts,tsx,js,jsx,json,css,md}"

type-check:
	@echo "Running TypeScript type checking..."
	npx tsc --noEmit

# Docker commands
docker-build:
	@echo "Building Docker image locally..."
	docker build -t stocky-web .

docker-run:
	@echo "Running Docker container..."
	docker run -p 3000:3000 stocky-web

docker-dev:
	@echo "Running development with Docker Compose..."
	docker-compose up

# Original registry build command
docker-image:
	docker buildx build --platform linux/amd64,linux/arm64 -t docker-registry.eruditio.net/stocky-web:latest --push .

# Git commands
status:
	@echo "Git status:"
	git status

push:
	@echo "Pushing to origin..."
	git push origin main

# Utility commands
deps-update:
	@echo "Updating dependencies..."
	npm update

deps-audit:
	@echo "Auditing dependencies..."
	npm audit

deps-fix:
	@echo "Fixing dependency vulnerabilities..."
	npm audit fix

# Release commands
version-patch:
	@echo "Bumping patch version..."
	npm version patch

version-minor:
	@echo "Bumping minor version..."
	npm version minor

version-major:
	@echo "Bumping major version..."
	npm version major

# Database/API commands (for when backend is integrated)
db-reset:
	@echo "Note: Backend database reset - run this on the backend project"
	@echo "This is a frontend project, no database to reset"

api-docs:
	@echo "Opening API documentation..."
	@echo "API docs should be available at backend URL/docs"

# Convenience aliases
start: dev
serve: preview
tests: test
check: lint type-check
all: install lint type-check build test
