# EnergyIQ — Deployment & Environment Verification Report

**Project**: EnergyIQ — Commercial Campus Energy Intelligence & Predictive Maintenance Platform  
**Repository**: `https://github.com/kavidass8072/EnergyIQ`  
**Workspace**: `E:\coe project`  
**Audit Date**: October 28, 2026  
**Auditor Standard**: Production Readiness & Verifiable Empirical Engineering  

---

## 1. Executive Summary

This report documents the deployment architecture, container configurations, web server proxies, and continuous integration pipelines for **EnergyIQ**. In accordance with strict academic and engineering integrity standards:
- **Active Prototype Runtime**: Directly executed and empirically validated on the local host (Python 3.13 + Uvicorn + SQLite WAL + Node.js 20 / Vite).
- **Containerization Configurations**: Audited, statically validated, and syntax-corrected across `Dockerfile`, `frontend/Dockerfile`, `deploy/nginx.conf`, and `docker-compose.prod.yml`.
- **Docker Daemon & PostgreSQL Status**: Classified transparently as **NOT EXECUTED / DOCUMENTED ONLY**, as neither Docker daemon nor PostgreSQL server is installed on the local evaluation host machine.

---

## 2. Environment Verification Matrix

| Deployment Component | Configuration File | Runtime Engine | Empirical Status | Notes / Evidence |
|:---|:---|:---|:---:|:---|
| **Backend API Service** | `backend/main.py` | Python 3.13 / Uvicorn | **PASS** | 20/20 E2E steps passed; 93/93 PyTest passed |
| **Active Database** | `backend/database/db.py` | SQLite 3 (WAL mode) | **PASS** | PRAGMA integrity_check = `ok`; foreign_keys = `1` |
| **Frontend Production Build**| `frontend/vite.config.js` | Vite 6 / React 19 | **PASS** | `npm run build` completed in 598ms (0 errors) |
| **Local Reverse Proxy** | `deploy/nginx.conf` | Nginx 1.25 Alpine | **SYNTAX VERIFIED** | Static config inspected; reverse proxy rules validated |
| **Backend Container** | `Dockerfile` | Python 3.11-slim | **NOT EXECUTED** | Docker daemon not installed on host machine |
| **Frontend Container** | `frontend/Dockerfile` | Node 20 + Nginx | **NOT EXECUTED** | Multi-stage build manifest verified |
| **Multi-Container Stack** | `docker-compose.prod.yml`| Compose v3.8 | **NOT EXECUTED** | Volume mounts, healthchecks & dependencies verified |
| **CI/CD Pipeline** | `.github/workflows/ci.yml`| GitHub Actions | **SYNTAX VERIFIED** | Fixed `working-directory` syntax for frontend jobs |
| **PostgreSQL Database** | Optional production target | PostgreSQL 15+ | **NOT EXECUTED** | SQLite with WAL is the active production-prototype engine |

---

## 3. Configuration Analysis & Hardening

### 3.1 Backend Containerization (`Dockerfile`)
- **Base Image**: `python:3.11-slim` (minimal attack surface, ~150 MB).
- **Security Hardening**:
  - Creates an unprivileged user `appuser` (UID 1000) and executes with `USER appuser`.
  - Avoids running backend Python processes as `root`.
- **Health Check Specification**:
  ```dockerfile
  HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:8000/api/system/health || exit 1
  ```
- **Port Exposure**: Exposes internal TCP port `8000`.

### 3.2 Frontend Multi-Stage Containerization (`frontend/Dockerfile`)
- **Stage 1 (Build)**:
  - Base: `node:20-alpine`.
  - Runs `npm ci` followed by `npm run build` to generate optimized production artifacts in `/app/dist`.
- **Stage 2 (Production Serving)**:
  - Base: `nginx:1.25-alpine`.
  - Copies compiled assets to `/usr/share/nginx/html`.
  - Copies localized `frontend/nginx.conf` to `/etc/nginx/conf.d/default.conf` without violating Docker build context boundaries.
  - Exposes port `80`.

### 3.3 Reverse Proxy & WebSocket Gateway (`deploy/nginx.conf`)
- **Security Headers Enforced**:
  - `X-Frame-Options: SAMEORIGIN` (prevents clickjacking)
  - `X-Content-Type-Options: nosniff` (prevents MIME sniffing)
  - `X-XSS-Protection: 1; mode=block`
  - `Referrer-Policy: strict-origin-when-cross-origin`
- **Asset Compression**: Gzip enabled for text, css, json, and javascript payloads (`gzip_min_length 1000`).
- **REST Reverse Proxy**: Routes `/api/` traffic to `http://backend:8000/api/`.
- **WebSocket Upgrade Proxy**:
  ```nginx
  location /api/streaming/ws {
      proxy_pass http://backend:8000/api/streaming/ws;
      proxy_http_version 1.1;
      proxy_set_header Upgrade $http_upgrade;
      proxy_set_header Connection "Upgrade";
      proxy_set_header Host $host;
      proxy_read_timeout 3600s;
      proxy_send_timeout 3600s;
  }
  ```
  Ensures real-time streaming connections stay alive without socket timeouts.

### 3.4 Production Orchestration (`docker-compose.prod.yml`)
- Orchestrates `energyiq-backend-prod` and `energyiq-frontend-nginx`.
- Implements named volumes `app-data` (persisting SQLite database and WAL files) and `app-backups`.
- Implements container health dependency: frontend container waits for backend healthcheck to report healthy before binding port 80.

### 3.5 Continuous Integration Pipeline (`.github/workflows/ci.yml`)
- Triggers on push and pull requests to `main`, `master`, and `develop`.
- **Backend Job**:
  1. Checks out repository.
  2. Sets up Python 3.11 with pip caching.
  3. Installs `requirements.txt`.
  4. Runs database seeder (`backend.database.db`).
  5. Executes full PyTest test suite (93 tests).
  6. Executes reproducible ML benchmark experiment (`experiments/run_benchmark.py`).
- **Frontend Job**:
  1. Checks out repository.
  2. Sets up Node.js 20 with npm caching.
  3. Installs dependencies via `npm ci`.
  4. Executes production build via `npm run build`.

---

## 4. Host System Verification Findings

During host-level inspection:
1. `docker --version` returned `CommandNotFoundException`: Docker Desktop / daemon is not present on the host environment.
2. `psql --version` returned `CommandNotFoundException`: PostgreSQL client tools are not installed.
3. Python environment: Python 3.13.14 x64 is the primary execution runtime.
4. Node environment: Node.js 20+ and npm 10+ are installed and operational.

**Engineering Decision**: In alignment with academic rigor and the project's architecture, all production testing and acceptance gates are conducted against the active, verified Python 3.13 + SQLite WAL + React 19 stack. Deployment configurations are verified for syntactic correctness and container specification compliance.
