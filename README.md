# ⚡ EnergyIQ — Commercial Campus Energy Intelligence & Predictive Maintenance Platform

> **AI-Powered Campus Energy Monitoring, Real-Time WebSocket Telemetry Streaming, Context-Aware Anomaly Detection, ML Model Registry, PSI Drift Monitoring, Fault Linking, and Predictive Maintenance SaaS Platform**
> 
> *Production-Oriented Prototype Standard evaluated on synthetic commercial campus microgrid telemetry and public building energy benchmark schemas (ASHRAE).*

---

## 1. Executive Summary & Capabilities

**EnergyIQ** is an enterprise-grade full-stack SaaS platform designed for commercial facility management, university campuses, and industrial plants operating multi-source microgrids (**Solar PV, Battery Storage, Grid Supply**) and heavy equipment assets.

### Verified Core Capabilities:
- 🔐 **JWT Authentication & RBAC**: Stateless JWT authentication with PBKDF2 password hashing and role enforcement across 3 accounts (`ADMIN`, `FACILITY_OPERATOR`, `TECHNICAL_ENGINEER`).
- 📡 **Real-Time WebSocket Telemetry Ingestion**: High-throughput telemetry streaming engine supporting 10 network/sensor degradation scenarios (`MISSING_PACKET`, `DELAYED_PACKET`, `DUPLICATE_PACKET`, `OUT_OF_ORDER_PACKET`, `SENSOR_MALFUNCTION`, `SUDDEN_POWER_SPIKE`, `GRADUAL_POWER_DRIFT`, `EXTREME_TEMPERATURE`, `BURST_TRAFFIC`).
- 🤖 **ML Model Registry & Zero-Downtime Activation**: Model registry managing `mod-cif-v120` (Context-Aware Isolation Forest v1.2), `mod-zscore-v100` (Rolling Quantile Z-Score Baseline v1.0), and `mod-lof-v090` (Local Outlier Factor Detector v0.9) with atomic activation API.
- 📉 **Population Stability Index (PSI) Drift Monitor**: Real-time statistical distribution drift monitoring comparing live 24h streaming data against 60-day baseline data across all features.
- 🔗 **Root-Cause Fault Linking & Alert Correlation**: Deterministic physical evidence calculation and temporal co-occurrence alert clustering across facility cooling and production lines.
- 📊 **Dual Benchmark Evaluation Framework**: Distinct evaluation pipelines separating ground-truth labeled evaluation (Precision: 99.41%, Recall: 80.09%, F1: 88.71%) from unsupervised real-world public datasets (ASHRAE Great Energy Predictor III sample fixture).
- 💾 **SQLite Hot-Backup & Recovery**: Non-blocking online hot-backup (`scripts/backup_db.py`) creating timestamped database snapshots.
- 🧪 **Comprehensive Automated Verification**: **66 / 66 PyTest unit and integration tests passing cleanly (100% pass rate)** and Vite production build with route-level code-splitting (0 errors).

---

## 2. Pre-Seeded System Credentials

| Username | Password | Role | Access Level & Scope |
| :--- | :--- | :--- | :--- |
| `admin` | `admin123` | `ADMIN` | Full access to all 14 modules, model activation, streaming control, reseed DB, user management, audit logs, settings, and demo panel. |
| `operator` | `operator123` | `FACILITY_OPERATOR` | Access to overview, live energy, equipment status, alert center, maintenance work orders, streaming health, reports, and settings. |
| `engineer` | `engineer123` | `TECHNICAL_ENGINEER` | Access to equipment, alerts, analytics, AI insights, ML evaluation, benchmark ML, data quality, model registry, and edge cases. |

---

## 3. Product Architecture

EnergyIQ uses a decoupled **6-Layer SaaS Architecture**:

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        LAYER 6: USER INTERFACE                         │
│   React 19 + Vite + Tailwind CSS + Recharts + Lucide Icons             │
│   (Route-Level Lazy Loading, JWT Auth, Real-Time WebSocket Feeds)      │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ RESTful APIs & WebSockets
┌───────────────────────────────────▼────────────────────────────────────┐
│                        LAYER 5: APPLICATION API                        │
│   FastAPI (Auth, RBAC, Streaming, Equipment, Alerts, ML, System)       │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ SQL Queries & Audit Trail
┌───────────────────────────────────▼────────────────────────────────────┐
│                      LAYER 4: PERSISTENCE LAYER                        │
│   SQLite (app.db: telemetry, alerts, ml_models, drift_logs, audit_logs)│
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Analyzed Physical Evidence
┌───────────────────────────────────▼────────────────────────────────────┐
│                   LAYER 3: FAULT LINKING ENGINE                        │
│   10 Physical Fault Categories + Evidence Calculation + Co-Occurrence  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Feature Matrices
┌───────────────────────────────────▼────────────────────────────────────┐
│                     LAYER 2: ML ANOMALY PIPELINE                       │
│   Contextual Isolation Forest Detector + ML Model Registry + PSI Drift │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Telemetry Streams
┌───────────────────────────────────▼────────────────────────────────────┐
│                      LAYER 1: TELEMETRY ENGINE                         │
│   WebSocket Ingestion Server + 10 Degradation Scenarios + 60-Day Telemetry │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Local Quick Start (Windows / Linux / macOS)

### Prerequisites:
- Python 3.10+
- Node.js 18+ and `npm`

### Step 1: Backend Setup
```bash
# Clone repository
git clone https://github.com/kavidass8072/EnergyIQ.git
cd EnergyIQ

# Install Python dependencies
pip install -r requirements.txt

# Run database initialization
python -m backend.database.db

# Start FastAPI application server
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```
Backend server will start at: `http://localhost:8000` (Swagger docs at `http://localhost:8000/docs`).

### Step 2: Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install Node dependencies
npm install

# Start Vite development server
npm run dev
```
Frontend UI will start at: `http://localhost:5173`.

---

## 5. Automated Testing & Production Build

### Run Backend PyTest Suite (66 Tests)
```bash
python -m pytest tests/ -v
```
Expected output: `66 passed in ~8.7s (100% PASS RATE)`.

### Run Frontend Production Build
```bash
cd frontend
npm run build
```
Expected output: `✓ built in ~0.5s` with 0 syntax errors and route-level code-split JavaScript chunks.

---

## 6. Performance Benchmarks

| Performance Metric | Measured Value | Benchmark Method |
| :--- | :---: | :--- |
| **API `GET /api/system/health`** | **8.84 ms** | FastAPI TestClient (20 runs) |
| **API `GET /api/dashboard/summary`** | **13.80 ms** | FastAPI TestClient (20 runs) |
| **API `GET /api/equipment`** | **7.15 ms** | FastAPI TestClient (20 runs) |
| **API `GET /api/alerts`** | **12.08 ms** | FastAPI TestClient (20 runs) |
| **API `GET /api/ml/drift`** | **16.62 ms** | FastAPI TestClient (20 runs) |
| **Telemetry History Query (168h)** | **0.83 ms** | SQLite `time.perf_counter()` |
| **ML Inference (2,352 samples)** | **58.54 ms** (**0.0249 ms / sample**) | Contextual Isolation Forest Predict |
| **Streaming Throughput Capacity** | **100 events / sec** | Local WebSocket stress test |
| **Frontend Bundle Size** | **727.14 kB** (191.39 kB gzipped) | Vite production build |

---

## 7. Database Backup & Recovery

EnergyIQ includes an online SQLite hot-backup utility ([`scripts/backup_db.py`](file:///e:/coe%20project/scripts/backup_db.py)) and documentation ([`docs/backup_recovery.md`](file:///e:/coe%20project/docs/backup_recovery.md)):

```bash
# Create a timestamped hot backup
python scripts/backup_db.py

# Restore from a backup snapshot
python scripts/backup_db.py restore backups/app_backup_YYYYMMDD_HHMMSS.db
```

---

## 8. Docker Deployment

EnergyIQ includes complete Docker containerization configuration via [`docker-compose.yml`](file:///e:/coe%20project/docker-compose.yml):

```bash
# Build and start services
docker-compose up --build -d
```

---

## 9. Monitored Assets & Fault Categories

### Monitored Commercial Assets (7 Canonical Assets):
1. `HVAC-01` (Main Campus HVAC System)
2. `HVAC-02` (Secondary HVAC / Chiller)
3. `Motor-01` (Heavy Industrial Motor)
4. `Compressor-01` (Air Compressor Unit)
5. `Pump-01` (Primary Water Circulation Pump)
6. `Production-Line-01` (Main Production Line Assembly)
7. `Cooling-Unit-01` (Facility Cooling Unit)

### Canonical Equipment Fault Categories (10 Root Causes):
1. `MECHANICAL_RESISTANCE`: Bearing wear and shaft misalignment (+62% power draw).
2. `STANDBY_LEAKAGE`: Phantom power draw during OFF state.
3. `PRODUCTION_ANOMALY`: Low yield per kWh consumed.
4. `ELECTRICAL_SPIKE`: Short-duration power surge.
5. `SHORT_CYCLING`: Rapid ON/OFF cycle frequency.
6. `OVERCOOLING_LEAKAGE`: Excessive chiller runtime under low thermal load.
7. `PHASE_IMBALANCE`: Unbalanced electrical current draw.
8. `BELT_SLIPPAGE`: Fan motor speed drop with high current.
9. `SENSOR_CALIBRATION_DRIFT`: Unrealistic telemetry drift.
10. `THERMAL_RUNAWAY`: Uncontrolled heating under normal load.

---

## 10. Development Status & Limitations

- **Current Maturity Standard**: **Production-Oriented Prototype Standard (90.0% Completion)**.
- **Data Scope**: E2E telemetry is generated synthetically with ground-truth fault injection, supplemented by local public dataset adapters (ASHRAE sample fixture).
- **Security Scope**: Configured with production-ready JWT, PBKDF2 hashing, and RBAC middleware. Secrets can be overridden via environment variables (`JWT_SECRET`).
