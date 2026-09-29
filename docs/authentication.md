# 🔐 EnergyIQ Authentication & Security Specification

## 1. Overview
EnergyIQ incorporates FastAPI-compatible JSON Web Token (JWT) authentication and Password Hashing (PBKDF2-HMAC-SHA256 with 100,000 iterations and salt).

---

## 2. Authentication Flow

```text
User Submits Credentials (username, password)
                     │
                     ▼
          POST /api/auth/login
                     │
                     ▼
      PBKDF2 Salt-Hash Verification
                     │
         ┌───────────┴───────────┐
      SUCCESS                 FAILURE
         │                       │
         ▼                       ▼
  Issue JWT Token          HTTP 401 Unauthorized
(sub, role, exp 24h)     + Log Audit Action
         │
         ▼
Include Bearer Token
in HTTP Requests Header
```

---

## 3. Pre-Seeded Default Demo Credentials

| Username | Password | Role | Description |
| :--- | :--- | :--- | :--- |
| `admin` | `admin123` | `ADMIN` | System administrator with complete access to all controls, user management, and settings. |
| `operator` | `operator123` | `FACILITY_OPERATOR` | Facility operator monitoring real-time power, alerts, work orders, and executive reports. |
| `engineer` | `engineer123` | `TECHNICAL_ENGINEER` | ML engineer inspecting diagnostics, benchmark pipelines, data quality, and edge cases. |

---

## 4. Environment Configuration
- `JWT_SECRET`: Secret signing key (defaults to fallback for local development).
- `ACCESS_TOKEN_EXPIRE_MINUTES`: Token expiration duration (default 1440 mins / 24 hours).
