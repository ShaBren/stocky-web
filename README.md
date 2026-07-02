# StockyWeb

A modern React TypeScript frontend for the [Stocky Backend](https://github.com/ShaBren/stocky-backend) — a home kitchen inventory management system.

## Documentation

- **[Architecture & Design](docs/architecture/)** - Project architecture, component diagrams, and design decisions
- **[Deployment](docs/deployment/)** - Docker and production deployment guides
- **[Testing](docs/testing/)** - Testing strategies and guides
- **[Release Notes](docs/release/)** - Changelog and release notes

## Quick Start

```bash
git clone https://github.com/ShaBren/stocky-web.git
cd stocky-web
npm install
npm run dev
```

## Docker

Pre-built multi-arch images published to `ghcr.io/shabren/stocky-web` on every tagged release.

```bash
docker pull ghcr.io/shabren/stocky-web:latest
docker run -p 3000:80 ghcr.io/shabren/stocky-web:latest
```

Or with Docker Compose:
```bash
docker compose up -d
```

## Development Commands

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run test` | Vitest (unit + integration) |
| `npm run test:e2e` | Playwright E2E tests (**run locally before tagging a release**) |
| `make docker-image` | Build & push multi-arch GHCR image |

## Tech Stack

- **React 19** + TypeScript
- **Vite 7** for build tooling
- **TanStack React Query** for server state
- **React Router 7** for routing
- **Tailwind CSS 4** for styling
- **Vitest 3** + Playwright for testing
- **Nginx** for production serving

## Configuration

Build-time environment variables (passed via Docker build args or `.env`):

| Variable | Default | Description |
|---|---|---|
| `VITE_API_BASE_URL` | `/api/v1` | Backend API base URL |
| `VITE_APP_NAME` | `StockyWeb` | Application name |
| `VITE_ENVIRONMENT` | `production` | Deployment environment |

## License

MIT — see [LICENSE](LICENSE).
