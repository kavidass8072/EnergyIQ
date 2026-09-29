# EnergyIQ — Security & Dependency Audit Report

## 1. Defensive Application Security Overview
EnergyIQ incorporates security controls at every layer:
- **Authentication**: JWT tokens signed with `HS256`, PBKDF2-HMAC-SHA256 password hashing with 100,000 iterations and unique 16-byte random salts.
- **Production Secret Guard**: In `backend/auth/security.py`, if `APP_ENV=production` and `JWT_SECRET` is missing, unconfigured, or set to a default developer key, backend startup fails safely with `RuntimeError`.
- **RBAC**: Strict role enforcement (`ADMIN`, `FACILITY_OPERATOR`, `TECHNICAL_ENGINEER`) on protected API endpoints.
- **Sliding-Window Rate Limiter**: In-memory rate limiting applied to `POST /api/auth/login` and mutation routes in `backend/api/rate_limiter.py`.
- **CORS Policy**: Configurable origin whitelist in `backend/main.py`.

## 2. Hardcoded Secrets Audit
- Repository Scan for `SECRET_KEY`, `JWT_SECRET`, `PRIVATE KEY`, `BEGIN RSA`: **0 hardcoded production secrets found**.
- Environment configurations use `.env.example` and `.env.production.example`.

## 3. Dependency Security Scan Results

### Frontend (npm)
- Command executed: `npm audit` inside `frontend/`
- Result: **0 vulnerabilities** (0 Critical, 0 High, 0 Moderate, 0 Low).

### Backend (Python / pip)
- Python 3.13 standard libraries & pinned PyPI dependencies (`fastapi`, `uvicorn`, `scikit-learn`, `numpy`, `pandas`, `pyjwt`).
- Result: **0 critical vulnerabilities identified**.

## 4. Container Security
- Non-root `appuser` (UID 10001) execution in `Dockerfile`.
- Multi-stage Nginx 1.25 build in `frontend/Dockerfile` serving static assets as `nginx` user.
