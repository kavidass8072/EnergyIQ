# 📋 EnergyIQ — Milestone 2 Baseline Audit Report

**Project**: EnergyIQ — Commercial Campus Energy Intelligence & Predictive Maintenance Platform  
**Date**: September 29, 2026  
**Auditor**: Senior Full-Stack & ML Systems Architect  

---

## 1. Current Architecture

EnergyIQ currently operates as a decoupled 6-layer application stack:
1. **Layer 1: Synthetic Telemetry Generator** (`ml/synthetic_generator.py`) — Generates 60 days of hourly telemetry (10,080 records) across 7 commercial campus assets (`HVAC-01`, `HVAC-02`, `Motor-01`, `Compressor-01`, `Pump-01`, `Production-Line-01`, `Cooling-Unit-01`).
2. **Layer 2: ML Feature Engineering & Isolation Forest Detector** (`ml/feature_engineering.py`, `ml/anomaly_detector.py`) — Computes quantile baseline power (`norm_expected_kw`), deviation percentages, and trains a Contextual Isolation Forest model.
3. **Layer 3: Fault Linking & Evidence Engine** (`backend/fault_linking/engine.py`) — Translates model anomaly signals into 10 canonical equipment fault categories with quantitative confidence scores and physical evidence.
4. **Layer 4: SQLite Database Layer** (`backend/database/db.py`, `backend/data/app.db`) — SQLite database storing raw telemetry, generated alerts, maintenance work orders, and app settings.
5. **Layer 5: RESTful Application API** (`backend/main.py`, `backend/api/*.py`) — FastAPI backend serving REST endpoints for overview KPIs, asset health, alert inbox, work orders, ML evaluation metrics, edge case runner, and demo fault simulation.
6. **Layer 6: React Frontend Interface** (`frontend/src/`) — React 19 + Vite single-page application with Tailwind CSS, Recharts visualizations, and Lucide icons featuring 12 navigation views.

---

## 2. Existing Working Features

- **Executive Overview & Microgrid Flow**: Live KPIs, microgrid power vector, and 48-hour actual vs expected consumption curves.
- **Equipment Digital Cards**: 7 monitored assets with explicit Health Scores (0-100), 72h baseline history, and status logging.
- **Alert Inbox & Dual-View Inspector**: Status filtering (`Active`, `Under Investigation`, `Reviewed`, `Resolved`, `False Positive`) with dual **Operator View** and **Technical View** inspection modals.
- **Predictive Maintenance & Work Orders**: AI predictive insight cards, work orders table, and work order creation/resolution workflows.
- **Analytics & Cost Impact**: Asset energy draw comparison, energy source breakdown, and financial waste analysis in ₹ per asset.
- **ML Evaluation Matrix**: Side-by-side performance comparison of Baseline (Z-Score) vs Proposed (Contextual Isolation Forest).
- **Edge Case Workbench**: Automated test runner for 7 stress scenarios (EC-01 to EC-G).
- **Executive Printable Reports**: System Health, Anomaly Report, Evaluation Report, Maintenance Report, and Cost Impact Report with native `window.print()` support.
- **Demo Fault Simulator**: Interactive fault injection (`Inject Mechanical Resistance`, `Inject Standby Leakage`, etc.) and system reset.
- **Automated Test Suite**: 17 PyTest unit and integration tests passing cleanly.

---

## 3. Current Limitations & Target Milestone 2 Upgrades

| Functional Area | Current Baseline Implementation | Milestone 2 Target Upgrade |
| :--- | :--- | :--- |
| **Authentication & RBAC** | None (Public application access) | FastAPI JWT Authentication + 3 Roles (`ADMIN`, `FACILITY_OPERATOR`, `TECHNICAL_ENGINEER`) with backend enforcement |
| **Telemetry Ingestion** | Static batch database loading | Real-time WebSocket streaming telemetry simulator with validation & graceful fallback |
| **Real-Time Live Dashboard** | Polling static API endpoints | Live streaming stats, real-time charts, WebSocket reconnection indicator, and memory-bounded history |
| **Real-Time Alert Pipeline** | Polled alert queries | Real-time streaming anomaly detection, fault linking, alert deduplication, and WebSocket alert push |
| **Real-World Dataset Benchmark**| Synthetic telemetry dataset only | Benchmark pipeline evaluating public real-world datasets (e.g. ASHRAE Great Energy Predictor III) with dataset adapters |
| **Data Quality Monitoring** | Simple completeness checks | Dedicated Data Quality service monitoring null rate, duplicate rate, out-of-order events, and schema violations |
| **Notifications** | Static alert notifications | Persisted user notification center with unread counts and severity filtering |
| **System Health** | Simple `/api/health` static response | Comprehensive system health endpoint (`HEALTHY`, `DEGRADED`, `CRITICAL`) checking API, DB, streaming, and ML pipeline |
| **User & Action Auditing** | None | SQLite `users`, `roles`, and `audit_logs` tables logging security and operational state changes |

---

## 4. Files to be Modified & New Files to be Added

### Files to be Modified:
- `requirements.txt` — Add `pyjwt`, `passlib[bcrypt]`, `websockets`, `python-multipart`
- `backend/main.py` — Add authentication middleware, CORS environment configuration, WebSocket routes, structured logging
- `backend/database/db.py` — Add `users`, `roles`, `audit_logs`, `notifications`, `data_quality_logs` tables and indexes
- `backend/api/*.py` — Add RBAC dependency protections across existing routers
- `frontend/src/App.jsx` — Add AuthProvider context, Login View, Protected Routes, User Profile Menu, and WebSocket listener
- `frontend/src/services/api.js` — Add JWT token headers and Auth API endpoints
- `frontend/src/components/Sidebar.jsx` — Add role-aware navigation rendering
- `docs/architecture.md`, `docs/api.md`, `docs/ml_pipeline.md`, `README.md` — Expand with Milestone 2 architecture & capabilities

### New Files to be Added:
- **Auth**: `backend/auth/security.py`, `backend/models/user.py`, `backend/api/auth.py`, `frontend/src/components/LoginView.jsx`
- **Streaming**: `backend/streaming/simulator.py`, `backend/streaming/validator.py`, `backend/api/streaming.py`
- **Benchmark Evaluation**: `data/benchmark/`, `ml/benchmark/adapters.py`, `ml/benchmark/evaluator.py`, `backend/api/benchmark.py`, `reports/benchmark_evaluation_report.md`
- **Data Quality**: `backend/services/data_quality.py`, `backend/api/data_quality.py`
- **Notifications & System Health**: `backend/api/notifications.py`, `backend/api/system_health.py`
- **Documentation & Reports**: `docs/authentication.md`, `docs/streaming.md`, `docs/benchmark_evaluation.md`, `docs/rbac.md`, `docs/observability.md`, `reports/milestone2_validation_report.md`, `reports/project_completion_matrix.md`

---

## 5. Risk Assessment & Migration Strategy

1. **Risk 1: Breaking Existing Local Workflows with Mandatory Auth**:
   - *Mitigation*: Seed default demo credentials (`admin` / `admin123`, `operator` / `operator123`, `engineer` / `engineer123`) automatically during database startup. Include quick login options on the Login page.
2. **Risk 2: High Memory Consumption from Continuous Streaming**:
   - *Mitigation*: Limit streaming history retained in memory/frontend arrays to 100 data points per asset. Persist streaming events cleanly into SQLite with indexed timestamps.
3. **Risk 3: Concurrency and Race Conditions in WebSocket Streaming**:
   - *Mitigation*: Use asyncio locks and background task managers within FastAPI. Provide clean startup/shutdown hooks for WebSocket managers.
4. **Risk 4: Benchmark Dataset Schema Mismatches**:
   - *Mitigation*: Implement object-oriented Dataset Adapters (`BaseDatasetAdapter`, `ASHRAEDatasetAdapter`, `SyntheticDatasetAdapter`) that map raw external columns into EnergyIQ canonical telemetry schema.

---

## 6. Audit Conclusion

The existing EnergyIQ repository is healthy, modular, and 100% test-passing. Milestone 2 enhancements will build directly upon this foundation without deleting any core functionality or corrupting existing APIs.
