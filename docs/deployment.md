# EnergyIQ Deployment & Operations Guide

## 1. Local Development Setup
```bash
# Clone repository
git clone https://github.com/kavidass8072/EnergyIQ.git
cd EnergyIQ

# Install backend Python dependencies
pip install -r requirements.txt

# Initialize database
python -m backend.database.db

# Start backend server
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```

## 2. Production Docker Compose Deployment
```bash
# Copy production environment template
cp .env.production.example .env

# Edit .env and set strong JWT_SECRET and SECRET_KEY
# Start production container stack
docker-compose -f docker-compose.prod.yml up --build -d
```

## 3. Reverse Proxy & HTTPS Setup
In production, place an Nginx reverse proxy or TLS termination balancer (Cloudflare, AWS ALB, Certbot) in front of port 80.
Refer to [`deploy/nginx.conf`](file:///e:/coe%20project/deploy/nginx.conf) for WebSocket upgrade and API proxy headers.

## 4. Health & Readiness Probes
- **Liveness Probe**: `http://localhost:8000/api/system/health`
- **Readiness Probe**: `http://localhost:8000/api/system/readiness`

## 5. Troubleshooting & Rollback
To rollback an active ML anomaly detection engine:
```bash
curl -X POST http://localhost:8000/api/ml/models/mod-cif-v120/rollback \
  -H "Authorization: Bearer <ADMIN_JWT_TOKEN>"
```
To restore the SQLite database from a hot-backup snapshot:
```bash
python scripts/backup_db.py restore backups/app_backup_YYYYMMDD_HHMMSS.db
```
