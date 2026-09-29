# EnergyIQ Observability, Health Probes & Metrics

## 1. Overview
EnergyIQ implements structured request correlation logging, application metrics monitoring, and separate liveness (`/api/system/health`) and readiness (`/api/system/readiness`) probes suitable for production orchestration (Docker Compose / Kubernetes).

## 2. Health & Readiness Probes
- **Liveness Probe**: `GET /api/system/health`
  - Validates that FastAPI application process is alive and responsive.
- **Readiness Probe**: `GET /api/system/readiness`
  - Checks connectivity to database (`app.db`), availability of ML engines, and WebSocket manager status. Returns `READY` or `NOT_READY`.

## 3. Observability & Application Metrics
Request latencies and request counters are tracked via middleware:
- **Metrics Endpoint**: `GET /api/system/metrics`
- **Tracked Metrics**:
  - `total_http_requests`: Cumulative request count.
  - `error_http_requests`: HTTP 4xx / 5xx error counter.
  - `average_http_latency_ms`: Rolling average response time in milliseconds.
  - `uptime_seconds`: Engine uptime since process initialization.

## 4. Structured Logging Policy
- All request logs contain timestamp, method, endpoint, HTTP status code, and process timing.
- **Security Rule**: Passwords, hashes, JWT bearer tokens, and secrets are NEVER logged.
