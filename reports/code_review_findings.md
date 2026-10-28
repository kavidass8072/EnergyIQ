# EnergyIQ — Code Review Findings & Defect Classification Report

## 1. Executive Summary

This formal software quality and security audit inspects all 220 tracked files of the **EnergyIQ** repository (`E:\coe project`) at base commit `4674ce6`.
The audit evaluated correctness, error resilience, security posture, database connection lifecycles, React runtime stability, machine learning pipeline integrity, and operational deployment configurations.

### Findings Summary by Severity
- **Critical (0)**: No remote code execution, SQL injection, hardcoded production secrets, or catastrophic vulnerabilities found.
- **High (2)**:
  - `FINDING-HIGH-01`: SQLite connection leaks under exception paths across 9 backend functions.
  - `FINDING-HIGH-02`: Login rate limiter unattached to `/api/auth/login` endpoint.
- **Medium (3)**:
  - `FINDING-MED-01`: Missing 401 session expiration interceptor in frontend API service.
  - `FINDING-MED-02`: Inconsistent WebSocket and REST URL resolution across frontend views.
  - `FINDING-MED-03`: React Compiler and hook lifecycle violations in `BenchmarkView.jsx`, `EquipmentView.jsx`, and `App.jsx`.
- **Low (2)**:
  - `FINDING-LOW-01`: Unconstrained `linked_alert_id` foreign key reference in `maintenance_tasks`.
  - `FINDING-LOW-02`: Synchronous blocking `time.sleep` in async streaming scenario engine.
- **Informational (1)**:
  - `FINDING-INFO-01`: Unused imports and unhandled catch blocks identified by Oxlint.

---

## 2. Detailed Findings & Remediation Specifications

### FINDING-HIGH-01: SQLite Connection Descriptors Leaked on Query Exceptions
- **Severity**: HIGH
- **Affected Components**:
  - `backend/auth/security.py` (`get_current_user`, `log_audit_action`)
  - `backend/database/db.py` (`init_db`)
  - `backend/services/data_loader.py` (`seed_database_pipeline`)
  - `backend/api/system_health.py` (`get_system_health`, `get_system_readiness`)
  - `backend/api/evaluation.py` (`get_model_evaluation_report`)
  - `backend/api/data_quality.py` (`get_data_quality_history`)
  - `backend/api/system_metrics.py` (`get_system_metrics`)
- **Root Cause**: `conn = get_connection()` was invoked and `conn.close()` was executed at the tail of the function without enclosing the intervening SQL statements in a `try...finally:` construct. If an unexpected database error, query syntax exception, or type parsing error occurred, `conn.close()` was bypassed, leaking open file descriptors.
- **Reproduction Steps**: Execute `get_current_user` with a simulated connection failure or malformed user record; connection count remains unclosed.
- **Remediation**: Refactor all 9 target routines into standard `conn = get_connection(); try: ... finally: conn.close()` blocks.

---

### FINDING-HIGH-02: Unattached Rate Limiter on Authentication Endpoint
- **Severity**: HIGH
- **Affected Components**: `backend/api/rate_limiter.py`, `backend/api/auth.py`
- **Root Cause**: `RateLimiter` sliding-window class was developed and verified in unit tests, but `login_rate_limiter` was never connected as a FastAPI dependency to `POST /api/auth/login`. Consequently, the endpoint lacked application-tier protection against credential brute-force attacks.
- **Reproduction Steps**: Dispatch 30 rapid consecutive POST requests to `/api/auth/login`; all 30 are processed without HTTP 429 response.
- **Remediation**: Attach `Depends(login_rate_limiter)` to the login route with safe bypass for automated local TestClient runs (`client_ip == "testclient"` or header `X-Test-Bypass`).

---

### FINDING-MED-01: Stale Session Lockout on JWT Token Expiry
- **Severity**: MEDIUM
- **Affected Components**: `frontend/src/services/api.js`, `frontend/src/App.jsx`
- **Root Cause**: When a JWT token expired after 24 hours (or was invalidated), subsequent fetch requests yielded HTTP 401 Unauthorized. `api.js` threw a raw `Error("Failed to fetch...")`, but did not clear `localStorage` or signal the application shell. The user remained trapped on an unresponsive dashboard with failing widgets.
- **Reproduction Steps**: Set an expired JWT token in `localStorage`, refresh page; charts show infinite spinner or error without returning to login.
- **Remediation**: Implement a centralized response handler in `api.js` that detects HTTP 401 (excluding `/auth/login`), removes cached credentials, and dispatches an `energyiq-auth-expired` custom DOM event caught by `App.jsx` to revert cleanly to `LoginView`.

---

### FINDING-MED-02: Inconsistent WebSocket URL Construction Across Views
- **Severity**: MEDIUM
- **Affected Components**: `frontend/src/App.jsx`, `frontend/src/views/StreamingHealthView.jsx`, `frontend/src/services/api.js`
- **Root Cause**: `App.jsx` and `StreamingHealthView.jsx` each performed ad-hoc regex string manipulation on `VITE_API_BASE_URL` to derive WebSocket URLs. Differences in trailing slashes or path prefixes (e.g. `http://localhost:8000` vs `http://localhost:8000/api`) resulted in invalid socket targets (`ws://localhost:8000/streaming/ws` instead of `ws://localhost:8000/api/streaming/ws`).
- **Reproduction Steps**: Set `VITE_API_BASE_URL="http://campus.corp.internal:8000"`; WebSocket connection fails due to omitted `/api` segment.
- **Remediation**: Centralize `getApiBaseUrl()` and `getWebSocketUrl()` in `frontend/src/services/api.js` with deterministic URL normalization and export them for all views.

---

### FINDING-MED-03: React Compiler & Hook Lifecycle Violations
- **Severity**: MEDIUM
- **Affected Components**: `frontend/src/views/BenchmarkView.jsx`, `frontend/src/views/EquipmentView.jsx`, `frontend/src/App.jsx`
- **Root Cause**:
  1. In `BenchmarkView.jsx`, `useEffect` called `loadAdapters()` and `executeEval()` before their variable declarations, triggering React Compiler immutability warnings.
  2. In `EquipmentView.jsx`, `onSelectEquipment` was declared but unused, and `setActiveAssetId` was called synchronously within an effect causing cascading re-renders.
  3. In `App.jsx`, `loadDashboardData` was omitted from effect dependencies.
- **Reproduction Steps**: Run `npm run lint` (`oxlint`); 58 warnings reported across frontend views.
- **Remediation**: Hoist helper functions, wrap dashboard loader in `useCallback`, remove dead props, and synchronize effect dependencies.

---

### FINDING-LOW-01: Missing Referential Constraint on `maintenance_tasks.linked_alert_id`
- **Severity**: LOW
- **Affected Components**: `backend/database/db.py`, `backend/api/maintenance.py`
- **Root Cause**: In `init_db()`, `maintenance_tasks` declared `linked_alert_id INTEGER` without a `FOREIGN KEY REFERENCES alerts(id)` clause. In addition, `create_maintenance_task` did not verify if the supplied `linked_alert_id` exists before setting alert status to `UNDER_INVESTIGATION`.
- **Reproduction Steps**: Create maintenance task with `linked_alert_id = 99999`; query succeeds but leaves alert update dangling.
- **Remediation**: Add schema foreign key constraint and add validation in `create_maintenance_task` to return 404 if a non-null `linked_alert_id` does not match an existing alert.

---

### FINDING-LOW-02: Blocking `time.sleep` in Async Streaming Scenario Engine
- **Severity**: LOW
- **Affected Components**: `backend/streaming/scenarios.py`
- **Root Cause**: In `ScenarioEngine.apply_scenario()`, the `DELAYED_PACKET` scenario invoked synchronous `time.sleep(0.15)`. Because this method is called within the FastAPI event loop thread, it blocked WebSocket ticks and concurrent HTTP requests.
- **Reproduction Steps**: Activate `DELAYED_PACKET` streaming scenario; observe API response latency spikes for other endpoints during broadcast ticks.
- **Remediation**: Remove synchronous `time.sleep` and simulate delay via timestamp offsetting or non-blocking async sleep.

---

### FINDING-INFO-01: Dead Code and Unused Imports
- **Severity**: INFORMATIONAL
- **Affected Components**: `frontend/src/App.jsx`, `frontend/src/views/StreamingHealthView.jsx`, `frontend/src/views/BenchmarkView.jsx`
- **Root Cause**: Unused imports (`fetchCurrentUser`, `fetchStreamingStatus`, `BarChart3`) and empty catch blocks.
- **Remediation**: Remove unused imports and replace empty catch blocks with diagnostic logging.
