# 🌐 EnergyIQ API Reference Documentation

**Base API URL**: `http://localhost:8000/api`  
**Interactive Swagger UI**: `http://localhost:8000/docs`  
**ReDoc Specification**: `http://localhost:8000/redoc`  

EnergyIQ exposes a comprehensive, RESTful API backed by FastAPI and SQLite/PostgreSQL. All protected endpoints require a stateless JWT bearer token passed in the `Authorization: Bearer <token>` HTTP header.

---

## 1. Authentication Router (`/api/auth`)

### `POST /api/auth/login`
- **Purpose**: Authenticates user credentials and returns a signed JWT access token and user profile.
- **Auth Required**: Public
- **Rate Limit**: Applied via sliding-window rate limiter (10 attempts / minute).
- **Request Body**:
  ```json
  {
    "username": "admin",
    "password": "admin123"
  }
  ```
- **Response Codes**:
  - `200 OK`: Access token generated successfully.
  - `401 Unauthorized`: Invalid username or password.
- **Response Body**:
  ```json
  {
    "access_token": "eyJhbGciOiJIUzI1Ni...",
    "token_type": "bearer",
    "user": {
      "id": 1,
      "username": "admin",
      "role": "ADMIN",
      "active_status": true
    }
  }
  ```

### `GET /api/auth/me`
- **Purpose**: Retrieves current authenticated user's profile and permissions.
- **Auth Required**: Bearer JWT Token
- **Required Role**: ALL (`ADMIN`, `FACILITY_OPERATOR`, `TECHNICAL_ENGINEER`)
- **Response Codes**: `200 OK`, `401 Unauthorized`

### `GET /api/auth/users` & `POST /api/auth/users`
- **Purpose**: List system users or provision a new user account.
- **Auth Required**: Bearer JWT Token
- **Required Role**: `ADMIN`
- **Response Codes**: `200 OK`, `201 Created`, `403 Forbidden`

### `GET /api/auth/audit-logs`
- **Purpose**: Retrieves system audit trails and login history.
- **Auth Required**: Bearer JWT Token
- **Required Role**: `ADMIN`
- **Response Codes**: `200 OK`, `403 Forbidden`

---

## 2. Dashboard Router (`/api/dashboard`)

### `GET /api/dashboard/summary`
- **Purpose**: Returns campus-wide energy KPIs, active alert counts, system health badge, and microgrid power snapshot.
- **Auth Required**: Bearer JWT Token
- **Response Codes**: `200 OK`, `401 Unauthorized`

### `GET /api/dashboard/power-flow`
- **Purpose**: Returns time-series power vectors (Solar generation, Battery SoC, Grid import, Campus load).
- **Query Parameters**: `hours` (integer, default `48`)
- **Response Codes**: `200 OK`, `401 Unauthorized`

---

## 3. Equipment Router (`/api/equipment`)

### `GET /api/equipment`
- **Purpose**: Lists all 7 monitored campus physical building assets with real-time health scores and status.
- **Auth Required**: Bearer JWT Token
- **Response Codes**: `200 OK`, `401 Unauthorized`

### `GET /api/equipment/{equipment_id}/history`
- **Purpose**: Returns historical energy draw, expected rolling baseline, and state history for a specific asset.
- **Query Parameters**: `hours` (integer, default `72`)
- **Response Codes**: `200 OK`, `404 Not Found`

### `GET /api/equipment/{equipment_id}/health-history`
- **Purpose**: Returns 30-day health score trend for predictive degradation tracking.
- **Query Parameters**: `days` (integer, default `30`)
- **Response Codes**: `200 OK`, `404 Not Found`

---

## 4. Alerts Router (`/api/alerts`)

### `GET /api/alerts`
- **Purpose**: Returns filterable alert inbox logs.
- **Query Parameters**: `status` (`ACTIVE`, `RESOLVED`, `FALSE_POSITIVE`), `severity` (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`), `equipment_id`
- **Response Codes**: `200 OK`, `401 Unauthorized`

### `GET /api/alerts/correlated`
- **Purpose**: Returns clusters of co-occurring equipment alerts across facility cooling and production lines.
- **Auth Required**: Bearer JWT Token
- **Response Codes**: `200 OK`, `401 Unauthorized`

### `POST /api/alerts/{alert_id}/review`
- **Purpose**: Updates alert status and appends resolution notes.
- **Request Body**:
  ```json
  {
    "status": "RESOLVED",
    "resolution_notes": "Replaced worn bearing on HVAC motor shaft."
  }
  ```
- **Response Codes**: `200 OK`, `400 Bad Request`, `404 Not Found`

---

## 5. Maintenance Router (`/api/maintenance`)

### `GET /api/maintenance`
- **Purpose**: Returns upcoming, overdue, and completed maintenance tasks alongside AI predictive work order recommendations.
- **Auth Required**: Bearer JWT Token
- **Response Codes**: `200 OK`, `401 Unauthorized`

### `POST /api/maintenance`
- **Purpose**: Provisions a new predictive maintenance work order.
- **Request Body**:
  ```json
  {
    "equipment_id": "HVAC-01",
    "equipment_type": "HVAC",
    "priority": "HIGH",
    "issue_description": "Refrigerant leak deviation +42% under full load.",
    "assigned_technician": "Rajesh Kumar",
    "linked_alert_id": 12
  }
  ```
- **Response Codes**: `200 OK`, `422 Unprocessable Entity`

### `PUT /api/maintenance/{task_id}/status`
- **Purpose**: Updates maintenance task status (`UPCOMING`, `IN_PROGRESS`, `COMPLETED`).
- **Request Body**: `{"status": "COMPLETED"}`
- **Response Codes**: `200 OK`, `400 Bad Request`, `404 Not Found`

---

## 6. Analytics Router (`/api/analytics`)

### `GET /api/analytics/summary`
- **Purpose**: Returns long-term energy consumption trends, peak power demand, and tariff cost analytics.
- **Auth Required**: Bearer JWT Token
- **Response Codes**: `200 OK`, `401 Unauthorized`

---

## 7. Machine Learning & Model Registry Router (`/api/ml`)

### `GET /api/ml/models`
- **Purpose**: Lists registered ML anomaly detection algorithms (`mod-cif-v120`, `mod-zscore-v100`, `mod-lof-v090`) and hyperparameters.
- **Auth Required**: Bearer JWT Token
- **Response Codes**: `200 OK`, `401 Unauthorized`

### `POST /api/ml/models/{model_id}/activate`
- **Purpose**: Switches active production anomaly detection model.
- **Required Role**: `ADMIN`
- **Response Codes**: `200 OK`, `403 Forbidden`, `404 Not Found`

### `POST /api/ml/models/{model_id}/rollback`
- **Purpose**: Reverts active production anomaly detection model to previous version.
- **Required Role**: `ADMIN`
- **Response Codes**: `200 OK`, `403 Forbidden`, `404 Not Found`

### `GET /api/ml/drift`
- **Purpose**: Returns Population Stability Index (PSI) feature drift metrics comparing streaming data to baseline.
- **Auth Required**: Bearer JWT Token
- **Response Codes**: `200 OK`, `401 Unauthorized`

---

## 8. Benchmark Evaluation Router (`/api/benchmark`)

### `GET /api/benchmark/adapters`
- **Purpose**: Lists available benchmark adapters (`synthetic`, `ashrae`).
- **Response Codes**: `200 OK`

### `GET /api/benchmark/evaluate`
- **Purpose**: Runs benchmark evaluation suite against specified adapter.
- **Query Parameters**: `adapter_id` (`synthetic`, `ashrae`)
- **Response Codes**: `200 OK`, `400 Bad Request`

---

## 9. Streaming & WebSocket Router (`/api/streaming`)

### `GET /api/streaming/status`
- **Purpose**: Returns current live telemetry ingestion statistics (ticks/sec, active scenario).
- **Response Codes**: `200 OK`

### `POST /api/streaming/start` & `POST /api/streaming/stop`
- **Purpose**: Starts or stops the live telemetry simulator background loop.
- **Response Codes**: `200 OK`

### `POST /api/streaming/scenario`
- **Purpose**: Sets active streaming degradation scenario (`MISSING_PACKET`, `SUDDEN_POWER_SPIKE`, etc.).
- **Request Body**: `{"scenario": "SUDDEN_POWER_SPIKE"}`
- **Response Codes**: `200 OK`, `400 Bad Request`

### `WebSocket /api/streaming/ws`
- **Purpose**: Real-time WebSocket connection emitting `TELEMETRY_TICK` frames and alert notifications.
- **Protocol**: `ws://` / `wss://`

---

## 10. Data Export Router (`/api/export`)

### `GET /api/export/{resource}`
- **Purpose**: Exports operational data snapshots.
- **Path Parameters**: `resource` (`alerts`, `telemetry`, `maintenance`)
- **Query Parameters**: `format` (`json`, `csv`)
- **Response Codes**: `200 OK`, `400 Bad Request`, `401 Unauthorized`

---

## 11. Reports, Settings, Notifications & System Health Routers

- **`GET /api/reports/generate?type={type}`**: Generates executive report document.
- **`GET /api/settings` & `POST /api/settings`**: Retrieves and updates system settings.
- **`GET /api/notifications` & `POST /api/notifications/{id}/read`**: Manages real-time notifications.
- **`GET /api/search?q={query}`**: Global search endpoint across assets, alerts, and tasks.
- **`GET /api/system/health`**: Liveness probe returning server status and database connectivity.
- **`GET /api/system/readiness`**: Readiness probe for container orchestrators.
