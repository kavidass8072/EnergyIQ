# EnergyIQ v1.0.0-m5 Release Notes

**Release Version**: `v1.0.0-m5`  
**Release Date**: September 29, 2026  
**Classification**: Production-Oriented Prototype Standard  
**Verified Milestone Completion**: **95.0%**

---

## 🚀 Key Release Highlights

### 1. Hardened Production Containerization & Nginx Proxy
- Multi-stage Node 20 build and Nginx static web server for React 19 frontend.
- Non-root Python 3.11 slim backend container with automated health check probes.
- Nginx reverse proxy configuration ([`deploy/nginx.conf`](file:///e:/coe%20project/deploy/nginx.conf)) with Gzip compression, WebSocket upgrade headers, and HTTP security headers (`X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`).

### 2. Environment Configuration & Secret Protection
- Strict startup checks verifying `JWT_SECRET` in production mode.
- Environment templates: `.env.example` (development) and `.env.production.example` (production).

### 3. Application Security & Rate Limiting
- In-memory sliding-window rate limiter protecting login (`POST /api/auth/login`), model activation, and fault injection endpoints against brute force attacks.
- Role-based authorization (`ADMIN`, `FACILITY_OPERATOR`, `TECHNICAL_ENGINEER`) with immutable audit logging.

### 4. Data Export & Model Governance
- Secure CSV and JSON data export (`GET /api/export/{resource}`).
- Atomic ML model engine rollback API (`POST /api/ml/models/{id}/rollback`).
- Reproducible ML experiment runner (`experiments/run_benchmark.py`).

### 5. Automated Verification Suite
- **75 / 75 Automated PyTest Integration Tests Passing (100% Pass Rate)**.
- Vite production build passing with 0 syntax errors and route-level lazy loading.
