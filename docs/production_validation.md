# EnergyIQ — Production Validation Guide

## 1. Environment Verification
Ensure production environment variables are configured in `.env` (derived from `.env.production.example`):
- `APP_ENV=production`
- `JWT_SECRET` must be set to a strong 32+ character key.
- `DATABASE_URL` configured for PostgreSQL or SQLite.
- `CORS_ORIGINS` bound to your domain origin.

## 2. Health & Readiness Probes
- **Liveness Probe**: `GET http://localhost:8000/api/system/health` (Returns HTTP 200 with uptime and subsystem status).
- **Readiness Probe**: `GET http://localhost:8000/api/system/readiness` (Returns HTTP 200 with DB readiness, ML model availability, and filesystem checks).

## 3. Production Deployment Commands
```bash
# Build and launch Docker container stack
docker compose -f docker-compose.prod.yml up --build -d

# Verify container status
docker compose -f docker-compose.prod.yml ps
```

## 4. Verification Checkpoints
1. Open `http://localhost/` in browser.
2. Sign in as `admin` / `admin123`.
3. Verify live WebSocket telemetry tick badge in TopNavbar ("Connected (1.0 tick/s)").
4. Navigate through Overview, Live Energy, Equipment, Alerts, Maintenance, Model Registry, and Reports.
5. Export alerts via `GET /api/export/alerts?format=csv`.
