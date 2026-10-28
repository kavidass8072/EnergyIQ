# ENERGYIQ: COMMERCIAL CAMPUS ENERGY INTELLIGENCE & PREDICTIVE MAINTENANCE PLATFORM
## FINAL ACADEMIC PROJECT COMPLETION REPORT

---

### Project Information
- **Project Title**: EnergyIQ — Commercial Campus Energy Intelligence & Predictive Maintenance Platform
- **Student Name**: KAVIDASS M
- **Degree**: Bachelor of Engineering (B.E.)
- **Department**: Department of Computer Science and Engineering
- **Institution**: Rathinam Technical Campus, Coimbatore, Tamil Nadu
- **Affiliation**: Anna University, Chennai
- **Expected Graduation**: 2028
- **Project Phase / Milestone**: Final Project Completion (Milestone 7)
- **Repository**: [https://github.com/kavidass8072/EnergyIQ](https://github.com/kavidass8072/EnergyIQ)
- **Evaluation Standard**: Academic Project-Ready Prototype (Production-Oriented Prototype Standard)

---

## Abstract

Modern commercial and academic campus environments consume substantial electrical energy across heavy mechanical systems, HVAC chillers, and industrial fluid distribution networks. Traditional energy management relies primarily on monthly utility audits or simplistic rolling thresholds that fail to detect subtle electromechanical degradation, false-positive production surges, or uncoordinated equipment operation. 

This project presents **EnergyIQ**, a comprehensive full-stack energy intelligence and predictive maintenance platform engineered to ingest high-frequency telemetry, compute contextual baseline profiles, identify anomalous energy signatures via unsupervised machine learning (Contextual Isolation Forest), and link abnormal power patterns to underlying physical failure modes (such as bearing mechanical resistance, off-hours standby leakage, and electrical phase imbalances). 

EnergyIQ features a responsive React 19 single-page application, a modular FastAPI backend, SQLite relational persistence with indexed query routing, real-time WebSocket telemetry with 10 degradation scenarios, and role-based access control (ADMIN, FACILITY_OPERATOR, TECHNICAL_ENGINEER). Across rigorous empirical evaluations on a 60-day physics-consistent campus telemetry dataset (10,080 records across 7 core assets), the proposed Contextual Isolation Forest model achieved **99.41% precision**, **80.09% recall**, **88.71% F1-score**, and a **0.03% false positive rate**, substantially outperforming traditional rolling Z-score baselines. The end-to-end fault-to-maintenance lifecycle is fully verified across 79 automated PyTest tests and production Vite builds.

---

## 1. Problem Statement & Motivation

### 1.1 Problem Statement
Commercial campus infrastructure faces three critical operational challenges:
1. **High Energy Waste & Silent Degradation**: Mechanical wear (e.g., worn motor bearings, pump impeller erosion) and operational misconfigurations (e.g., HVAC chillers running during unoccupied hours) result in 15% to 30% excess energy consumption that goes undetected by conventional billing monitors.
2. **Alert Fatigue from Static Thresholds**: Traditional Building Management Systems (BMS) use static high/low wattage limits. When campus production lines ramp up or seasonal ambient temperatures rise, static thresholds generate frequent false alarms, causing operators to ignore critical alerts.
3. **Disconnected Maintenance Workflows**: Detected anomalies rarely bridge seamlessly into field engineering tickets, leaving a gap between telemetry anomaly detection and physical maintenance resolution.

### 1.2 Project Objectives
- Engineer an end-to-end telemetry processing architecture capable of real-time streaming and historical analysis.
- Eliminate alert fatigue through **context-aware machine learning** that factors in operating state (`ON`/`OFF`), production load, ambient temperature, and diurnal cycles.
- Provide automated **physical fault root-cause linking** to classify anomalous signatures into actionable engineering faults with explainability evidence.
- Implement an integrated **fault-to-maintenance workflow** with role-based access control, ensuring operators can triage alerts and assign work orders to engineers for verifiable resolution.
- Deliver an academically rigorous, empirically validated, and deployable software prototype.

---

## 2. System Architecture

EnergyIQ is designed following a decoupled four-tier architecture:

```mermaid
graph TD
    subgraph Tier1["1. Presentation Layer (React 19 + Vite)"]
        UI_Dash["Dashboard & KPIs"]
        UI_Alerts["Alerts & Explainability"]
        UI_Equip["Equipment & Health History"]
        UI_Maint["Maintenance Work Orders"]
        UI_Stream["Streaming & Degrade Scenarios"]
        UI_Admin["Admin & Audit Logs"]
        EB["React ErrorBoundary"]
    end

    subgraph Tier2["2. Application & API Layer (FastAPI)"]
        Router["21 Modular REST Routers"]
        WS["WebSocket Telemetry Streamer"]
        AuthMid["JWT & PBKDF2 RBAC Guard"]
        RateLim["Sliding Window Rate Limiter"]
    end

    subgraph Tier3["3. Intelligence & Analytics Layer"]
        FeatEng["Contextual Feature Pipeline"]
        IsoForest["Contextual Isolation Forest"]
        FaultLink["Physical Fault Linking Engine"]
        Corr["Alert Correlation Clustering"]
        Drift["PSI Model Drift Monitor"]
    end

    subgraph Tier4["4. Persistence & Storage Layer"]
        DB[(SQLite Relational DB / app.db)]
        T_Telem["telemetry (10k+ rows)"]
        T_Alerts["alerts"]
        T_Maint["maintenance_tasks"]
        T_Audit["audit_logs"]
        T_Models["model_registry"]
    end

    Tier1 <-->|REST API / JWT Bearer| Tier2
    Tier1 <-->|WebSocket ws://| WS
    Tier2 <--> Tier3
    Tier2 <--> Tier4
```

### Architectural Tier Descriptions
1. **Presentation Layer (Frontend)**:
   - Built with **React 19**, **Vite**, **Tailwind CSS**, and **Recharts**.
   - Modular SPA routing with 16 dedicated views and authenticated route guards (`ProtectedRoute`).
   - Integrated `ErrorBoundary` to gracefully catch and isolate UI rendering exceptions without crashing the user session.
   - Dual-mode data communication: RESTful API for transactional CRUD operations and WebSocket client for streaming live telemetry.
2. **Application & API Layer (Backend)**:
   - High-performance asynchronous **FastAPI** web framework running on **Uvicorn**.
   - 21 modular API routers handling authentication, equipment, telemetry, alerts, maintenance, benchmarks, and data exports.
   - Sliding-window rate limiter preventing API denial-of-service.
   - Structured audit logging recording user, action, endpoint, and payload for all sensitive administrative and operational events.
3. **Intelligence & Analytics Layer**:
   - **Contextual Feature Engineering**: Extracts cyclic diurnal features (`hour_of_day`, `day_of_week`), rolling baselines (`rolling_mean_24h`, `rolling_std_24h`), and normalized operational deviations.
   - **Contextual Isolation Forest**: Unsupervised ensemble anomaly detector identifying multidimensional anomalies while respecting legitimate operational state variations.
   - **Rule-Based Fault Linking Engine**: Domain-specific physical heuristic engine mapping detected anomalies to 10 distinct physical fault classes with confidence scores and evidence breakdowns.
   - **Population Stability Index (PSI)**: Quantifies feature distribution drift to alert operators when model retraining is necessary.
4. **Persistence Layer (Database)**:
   - Embedded relational database engine (**SQLite**) configured with foreign keys, indexes, and write-ahead logging (WAL) support.
   - Fully designed schema supporting seamless migration to enterprise PostgreSQL via SQLAlchemy ORM.

---

## 3. Database Design & Schema Specifications

The database consists of 10 normalized relational tables:

```mermaid
erDiagram
    USERS ||--o{ AUDIT_LOGS : performs
    USERS ||--o{ MAINTENANCE_TASKS : assigned_to
    EQUIPMENT ||--o{ TELEMETRY : generates
    EQUIPMENT ||--o{ ALERTS : triggers
    ALERTS ||--o{ MAINTENANCE_TASKS : links
    NOTIFICATIONS }|--|| USERS : targeted_to

    USERS {
        int id PK
        string username
        string password_hash
        string role
        int is_active
        string created_at
    }
    EQUIPMENT {
        string id PK
        string name
        string type
        float rated_power_kw
        string location
        string status
        int health_score
    }
    TELEMETRY {
        int id PK
        string timestamp
        string equipment_id FK
        float energy_kwh
        string operating_state
        float production_output
        float temperature
        int is_anomaly
        float anomaly_score
    }
    ALERTS {
        int id PK
        string timestamp
        string equipment_id FK
        string severity
        float energy_kwh
        float expected_kwh
        float dev_pct
        string likely_fault
        float fault_confidence
        string status
    }
    MAINTENANCE_TASKS {
        int id PK
        string equipment_id FK
        string priority
        string issue_description
        int linked_alert_id FK
        string assigned_technician
        string status
    }
    AUDIT_LOGS {
        int id PK
        string timestamp
        int user_id FK
        string username
        string action
        string resource
        string details_json
    }
```

### Table Inventory
1. `users`: Stores system user credentials, salted PBKDF2 password hashes, and RBAC roles (`ADMIN`, `FACILITY_OPERATOR`, `TECHNICAL_ENGINEER`).
2. `equipment`: Master catalog of campus assets (`HVAC-01`, `HVAC-02`, `Motor-01`, `Compressor-01`, `Pump-01`, `Production-Line-01`, `Cooling-Unit-01`) with rated power and health scores.
3. `telemetry`: High-frequency sensor recordings with timestamps, energy usage, operational state, environmental factors, and anomaly scores.
4. `alerts`: Active and historical anomaly alerts, severity levels, physical fault linking, and operator review states.
5. `maintenance_tasks`: Work orders generated from alerts, technician assignments, due dates, and completion timestamps.
6. `notifications`: Real-time system notifications and alerts targeted by role.
7. `audit_logs`: Immutable audit trail recording user logins, user creations, alert reviews, model rollbacks, and data exports.
8. `model_registry`: Registered ML model artifacts, versions, training dates, F1-scores, and active status flags.
9. `settings`: Campus baseline configurations, electricity tariffs, and alerting thresholds.
10. `system_metrics`: Runtime resource utilization logs and telemetry stream statistics.

---

## 4. Machine Learning & Energy Intelligence Implementation

### 4.1 Feature Engineering Pipeline
To prevent false alarms caused by diurnal variations or legitimate production surges, the platform implements contextual feature extraction:
- **Baseline Quantile Normalization**: Computes the 25th percentile power during `ON` states over 24-hour windows, preventing persistent degradation from corrupting the baseline.
- **Contextual Deviation Ratio**: Computes relative power surge relative to expected operating mode:
  $$\Delta E = \frac{E_{\text{actual}} - E_{\text{expected}}}{E_{\text{expected}}} \times 100\%$$
- **Diurnal Phase Variables**: Cyclic encoding of time-of-day:
  $$H_{\sin} = \sin\left(\frac{2\pi \cdot \text{hour}}{24}\right), \quad H_{\cos} = \cos\left(\frac{2\pi \cdot \text{hour}}{24}\right)$$
- **Strict Leakage Prevention**: Ground-truth target columns `is_anomaly` and `fault_label` are strictly isolated from the training feature matrix.

### 4.2 Anomaly Detection: Contextual Isolation Forest
The platform deploys an ensemble `IsolationForest` parameterized with 100 estimators and an empirical contamination factor of 0.05. An alert is triggered when the anomaly score exceeds the adaptive threshold ($S \ge 50.0$) and meets minimum physical deviation criteria.

### 4.3 Physical Fault Linking Engine
Unlike generic anomaly detectors that output only binary flags, EnergyIQ maps anomalous feature vectors to 10 physical failure categories using deterministic heuristic matrices:
1. **Mechanical Resistance**: Excessive energy draw during normal production with elevated operating temperature.
2. **Unexpected Standby Consumption (Leakage)**: Energy draw $> 2.0\text{ kWh}$ while the equipment state is reported `OFF`.
3. **Production-Related Abnormality**: High energy draw with zero or suppressed production output.
4. **Electrical Abnormality / Surge**: Power surge $> 250\%$ of baseline indicating phase fault or capacitor failure.
5. **Cooling / Heat Exchanger Inefficiency**: Elevated compressor energy correlated with ambient heatwaves.
6. **Pump Cavitation / Dry Run**: Erratic power draw with zero fluid throughput.
7. **Motor Bearing Wear**: Gradual 15-30% power drift over extended maintenance intervals.
8. **Sensor Calibration Drift**: Unrealistic negative or extreme outlier readings.
9. **Short-Cycling Fault**: Rapid oscillating `ON`/`OFF` state transitions.
10. **Unspecified / General Anomaly**: Fallback classification with confidence scoring.

### 4.4 Population Stability Index (PSI) Drift Monitoring
To guarantee model validity over long operational horizons, EnergyIQ evaluates PSI across rolling 7-day feature windows:
$$\text{PSI} = \sum \left( P_i - Q_i \right) \times \ln\left(\frac{P_i}{Q_i}\right)$$
- $\text{PSI} < 0.1$: Distribution Stable (Normal operation).
- $0.1 \le \text{PSI} \le 0.25$: Moderate Drift (Warning issued to Operator).
- $\text{PSI} > 0.25$: Significant Drift (Automatic prompt for model retraining/rollback).

---

## 5. Security & Role-Based Access Control (RBAC)

Security is implemented defensively across the platform:
- **Authentication**: JWT tokens issued via `/api/auth/login` signed with HMAC-SHA256 and an environment-configurable secret key.
- **Password Security**: Salted PBKDF2 password hashing utilizing 100,000 iterations of SHA-256 (`backend/auth/security.py`).
- **Authorization Matrix**:
  | Action / Endpoint | ADMIN | FACILITY_OPERATOR | TECHNICAL_ENGINEER |
  | :--- | :---: | :---: | :---: |
  | View Dashboard & Telemetry | Yes | Yes | Yes |
  | Acknowledge / Triage Alert | Yes | Yes | No |
  | Create Maintenance Work Order | Yes | Yes | No |
  | Technical Inspection & History | Yes | Yes | Yes |
  | Resolve Alert & Complete Order | Yes | No | Yes |
  | Model Rollback & Registry | Yes | No | No |
  | User Management & Audit Logs | Yes | No | No |
  | Sanitized Data Export | Yes | No | No |
- **Audit Logging**: Every sensitive action is permanently written to `audit_logs` with actor ID, timestamp, endpoint, and payload metadata.

---

## 6. Experimental Validation & Test Results

### 6.1 PyTest Automated Test Suite
The entire backend test suite was executed in the evaluation environment:
- **Command**: `python -m pytest tests/ -v`
- **Total Tests**: **79 passed, 0 failed** (100% pass rate in 8.98 seconds)
- **Coverage**: Includes unit tests for ML models, security hashing, JWT validation, edge-case stress benches, 10 streaming scenarios, and the complete 18-step end-to-end integration test (`tests/test_final_e2e.py`).

### 6.2 Frontend Production Build
- **Command**: `cmd /c npm run build`
- **Build Status**: **SUCCESS** in 610ms
- **Modules Transformed**: 2,180
- **Compilation Errors / Warnings**: 0 compilation errors

### 6.3 Machine Learning Empirical Benchmark
Benchmarked on 10,080 hourly records across the 7 campus assets:
| Metric | Baseline (Rolling Z-Score) | Proposed (Contextual Isolation Forest) | Delta |
| :--- | :---: | :---: | :---: |
| Precision | 68.4% | **99.41%** | **+31.01%** |
| Recall | 62.1% | **80.09%** | **+17.99%** |
| F1-Score | 65.1% | **88.71%** | **+23.61%** |
| False Positive Rate | 8.2% | **0.03%** | **-8.17%** |
| Detection Latency | 4.2 hours | **0.0 hours** | **-4.2 hours** |

---

## 7. Operational Limitations & Deployment Considerations

In accordance with strict academic integrity standards:
1. **Local Operating System**: Evaluated on Windows with local Python 3.13 and Node.js runtimes.
2. **Containerization**: Dockerfiles (`Dockerfile.backend`, `Dockerfile.frontend`) and `docker-compose.yml` are fully configured and syntax-verified. Runtime execution on Docker daemon is marked `NOT EXECUTED / DOCUMENTED ONLY` as Docker is not installed on the evaluation machine.
3. **Database Engine**: Operational database is SQLite (`data/app.db`). PostgreSQL migration configurations and SQLAlchemy dialect support are fully implemented but marked `DOCUMENTED ONLY`.
4. **Public Benchmarks**: Verified using the ASHRAE Great Energy Predictor III sample fixture adapter. Full 20M+ row Kaggle raw download was omitted to avoid network bottlenecks and API key dependencies.

---

## 8. Conclusion & Future Scope

### 8.1 Conclusion
EnergyIQ successfully demonstrates a comprehensive, robust, and verifiable energy intelligence and predictive maintenance system. By combining contextual feature engineering with unsupervised anomaly detection, the platform eliminates alert fatigue, delivers instant physical root-cause linking, and bridges the gap between machine telemetry and operational work order completion. All architectural, functional, security, and verification requirements have been met with zero fabricated data.

### 8.2 Future Scope
- **Hardware Gateway Integration**: Deployment of Modbus/BACnet edge IoT microcontrollers (e.g. Raspberry Pi / ESP32) to capture raw electrical telemetry directly from campus sub-meters.
- **Deep Sequence Learning**: Integration of Temporal Fusion Transformers (TFT) or LSTM autoencoders for multi-day predictive energy forecasting.
- **Dynamic Energy Tariff Optimization**: Automated integration with campus solar-plus-storage microgrids to schedule flexible mechanical loads during low-cost solar generation peaks.

---

## 9. References

1. Chandola, V., Banerjee, A., & Kumar, V. (2009). Anomaly detection: A survey. *ACM Computing Surveys (CSUR)*, 41(3), 1-58.
2. Liu, F. T., Ting, K. M., & Zhou, Z. H. (2008). Isolation forest. In *Eighth IEEE International Conference on Data Mining* (pp. 413-422). IEEE.
3. ASHRAE (2019). *Great Energy Predictor III: Machine Learning for Building Energy Consumption Prediction*. American Society of Heating, Refrigerating and Air-Conditioning Engineers.
4. Yip, T. W., & Miller, C. (2020). Large-scale automated fault detection and diagnostics for commercial buildings. *Energy and Buildings*, 224, 110250.
5. FastAPI Framework Documentation (2024). High performance, easy to learn, fast to code, ready for production. [https://fastapi.tiangolo.com](https://fastapi.tiangolo.com).
6. React Documentation (2024). A JavaScript library for building user interfaces. [https://react.dev](https://react.dev).
