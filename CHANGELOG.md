# EnergyIQ Changelog

All notable changes to the EnergyIQ project will be documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [v1.0.0-m6] - 2026-09-29

### Added
- **Deployment Verification**: Verified dynamic environment base URL resolution (`VITE_API_BASE_URL`) and WebSocket URI adaptivity across all views.
- **Security Audit & Dependency Verification**: Performed full hardcoded secret scan and dependency security audit (`npm audit` verified 0 vulnerabilities).
- **PostgreSQL Readiness Report**: Documented PostgreSQL schema compatibility and driver abstraction in `reports/postgresql_validation.md`.
- **Disaster Recovery & Failure Drills**: Completed backup/restore drill and server/connection recovery validation (`reports/disaster_recovery_validation.md`).
- **Reproducible ML Experiment Execution**: Automated benchmark experiment runner (`experiments/run_benchmark.py`) with timestamped JSON artifacts.
- **Architecture & System Documentation**: Generated formal architecture diagrams in `docs/architecture/` and production validation guide in `docs/production_validation.md`.

## [v1.0.0-m5] - 2026-09-29

### Added
- **Production Containerization**: Multi-stage `frontend/Dockerfile` (Node 20 + Nginx 1.25), non-root `Dockerfile` for FastAPI backend, and `docker-compose.prod.yml`.
- **Nginx Reverse Proxy**: Production reverse proxy configuration (`deploy/nginx.conf`) handling static assets, API routing (`/api/`), WebSocket proxying (`/api/streaming/ws`), and security headers.
- **Environment Security**: Multi-environment support (`.env.example`, `.env.production.example`) with mandatory production JWT secret verification.
- **Readiness Probes & Observability**: Endpoint `/api/system/readiness` for container orchestrator health checks and structured request correlation logging (`docs/observability.md`).
- **Rate Limiting Middleware**: `RateLimiter` sliding-window protector on authentication (`POST /api/auth/login`) and mutation endpoints.
- **Data Export Service**: Endpoint `GET /api/export/{resource}` exporting alerts, maintenance, and telemetry in JSON or CSV formats.
- **ML Rollback Endpoint**: Endpoint `POST /api/ml/models/{model_id}/rollback` for atomic model engine reversion.
- **Reproducible Experiments**: Experiment runner `experiments/run_benchmark.py` generating JSON artifacts in `experiments/results/`.
- **Streaming Load Test**: Ingestion load benchmark (`scripts/load_test_streaming.py`) verifying 100–500 EPS capacity.
- **PostgreSQL Migration Guide**: Schema DDL and database migration documentation (`docs/database_migration.md`).
- **CI/CD Automation**: GitHub Actions workflow (`.github/workflows/ci.yml`) running backend PyTest and frontend Vite builds.

### Security & Hardening
- Enforced PBKDF2 password hashing and stateless JWT bearer token authentication.
- Added sliding-window rate limiting on login and sensitive mutation routes.
- Sanitized all production logging to guarantee no passwords or secret tokens are printed.

### Performance & Optimization
- Applied `React.lazy()` route-level code-splitting, reducing main JS bundle from 779 kB to 727 kB.
- Database index optimization maintaining sub-millisecond query latencies (0.83ms 24h telemetry query).
