# 70% PROJECT COMPLETION REPORT

**PROJECT TITLE:**  
EnergyIQ — Commercial Campus Energy Intelligence & Predictive Maintenance Platform

**STUDENT NAME:**  
KAVIDASS M

**DEGREE & DEPARTMENT:**  
B.E. Computer Science and Engineering  
Department of Computer Science and Engineering

**INSTITUTION:**  
Rathinam Technical Campus, Coimbatore, Tamil Nadu

**EXPECTED GRADUATION:**  
2028

**PROJECT TYPE & PHASE:**  
Academic Phase Project — 70% Project Completion Review

**GITHUB REPOSITORY:**  
https://github.com/kavidass8072/EnergyIQ

**SUPERVISION & EVALUATION PLACEHOLDERS:**  
Project Guide: [Project Guide Name]  
Department Coordinator: [Project Coordinator Name]  
Academic Year: [Academic Year]  
Register / Roll Number: [Register Number]  

---

## 1. ABSTRACT
Commercial and institutional campuses consume substantial electrical energy across distributed assets including HVAC chillers, air handling units, pumps, motors, and lighting networks. Traditional campus energy monitoring relies heavily on periodic manual meter readings or simple monthly utility bills, which fail to detect operational degradation, sub-optimal equipment behavior, or excessive energy drift in real time. Consequently, equipment faults often remain unnoticed until severe breakdown occurs, causing unexpected operational downtime, inflated energy costs, and increased carbon footprint.

**EnergyIQ** is a Commercial Campus Energy Intelligence and Predictive Maintenance Platform designed to address these challenges. The platform integrates real-time synthetic campus energy telemetry collection, contextual baseline estimation, machine learning-based anomaly detection using Isolation Forest, rule-based physical fault correlation, an alert inbox with severity triage, and an integrated maintenance work-order management workflow. EnergyIQ is built on a modern decoupled architecture consisting of a FastAPI Python backend, a React 19 single-page frontend styled with Tailwind CSS and Recharts, an embedded SQLite database, and stateless JWT authentication with Role-Based Access Control (RBAC).

This 70% Project Completion Report presents the design, architecture, implementation status, and verification metrics for the academic 70% phase evaluation. Core functional modules — including database schema design, RESTful API endpoint development, telemetry simulation, anomaly detection pipelines, alert lifecycle handling, and UI dashboard visualization — have been successfully completed and validated through a 75-test automated PyTest integration suite and production Vite build compilation.

---

## 2. INTRODUCTION

### 2.1 Background
Commercial educational institutions and commercial campuses operate continuously with substantial energy overhead. Equipment assets like HVAC units, electric motors, and microgrid solar/battery systems account for over 60% of total campus energy usage. Efficient management of these physical assets requires continuous monitoring of power consumption, operating state, production output, and temperature parameters.

### 2.2 Problem Statement
Existing campus facility management faces three major bottlenecks:
1. **Lack of High-Frequency Energy Telemetry**: Consumption is recorded manually or at coarse interval levels, concealing transient spikes and off-schedule energy wastage.
2. **Delayed Fault Detection**: Physical faults such as mechanical resistance, refrigerant leaks, short-cycling, and thermal overheating are identified only after catastrophic failure occurs.
3. **Disconnected Maintenance Workflows**: Anomaly detection systems and facility maintenance ticketing operate in silos, delaying corrective technician dispatch.

### 2.3 Motivation
Developing an automated, intelligence-driven platform enables early fault identification, reduces campus energy waste, extends asset operational lifespans, and provides facility operators with actionable insights to maintain optimal energy performance.

### 2.4 Proposed Solution
EnergyIQ offers a centralized digital platform that continuously ingests campus microgrid and equipment energy telemetry, evaluates current power consumption against contextual rolling baselines, flags statistical anomalies using an Isolation Forest ML model, links anomaly signals to root-cause fault categories, generates prioritized alerts, and enables direct conversion of alerts into predictive maintenance work orders.

### 2.5 Project Objectives
1. Continuous monitoring of campus energy consumption across microgrid solar, battery, grid, and asset loads.
2. Tracking asset-level operational energy parameters (energy kWh, state, temperature, production context).
3. Statistical baseline computation and Context-Aware Isolation Forest anomaly detection.
4. Linking anomaly signals to physical fault categories (e.g., Mechanical Resistance, Refrigerant Leak).
5. Prioritized alert generation and lifecycle management (`ACTIVE`, `UNDER_INVESTIGATION`, `RESOLVED`, `FALSE_POSITIVE`).
6. Integrated predictive maintenance task creation and tracking.
7. Centralized interactive dashboard for facility operators and technical engineers.
8. Role-Based Access Control (`ADMIN`, `FACILITY_OPERATOR`, `TECHNICAL_ENGINEER`) via JWT.
9. Historical energy telemetry and audit log persistence in SQLite.
10. System verification via automated integration testing.

---

## 3. EXISTING SYSTEM
Conventional facility energy monitoring systems typically suffer from:
- Manual, paper-based, or spreadsheet-driven meter reading collection.
- Delayed notification of energy wastage, often detected only during monthly utility bill audits.
- Fragmented operational data across isolated building management sub-systems.
- Lack of predictive machine learning capabilities to distinguish normal peak usage from abnormal energy drift.
- Reactive maintenance practices ("run-to-failure"), leading to costly emergency repairs and unscheduled downtime.

---

## 4. PROPOSED SYSTEM
EnergyIQ presents a fully integrated energy intelligence platform. Key components include:
- **Telemetry Ingestion**: Ingesting high-frequency energy metrics (kWh, temperature, state, production output).
- **Contextual Baseline & ML Pipeline**: Combining quantile rolling baselines with Isolation Forest anomaly detection.
- **Physical Fault Correlation Engine**: Mapping statistical anomaly scores to explicit physical fault classifications.
- **Alert Triage & Maintenance Engine**: Enabling operators to review evidence logs and convert critical alerts directly into maintenance tickets.
- **Role-Based Web Dashboard**: Delivering intuitive visual analytics tailored to Operators, Engineers, and Administrators.

---

## 5. OBJECTIVES
1. Provide real-time visibility into campus energy consumption.
2. Detect equipment energy anomalies before hardware breakdown.
3. Classify physical equipment fault categories with physical telemetry evidence.
4. Streamline maintenance dispatching through integrated work orders.
5. Enforce security and role-based permissions across system APIs.
6. Verify platform reliability using automated test suites.

---

## 6. SYSTEM ARCHITECTURE

### 6.1 Application Flow Diagram
```
User / Client
    │
    ▼
React 19 Frontend SPA (Vite + Tailwind CSS + Recharts)
    │
    ├─────────── HTTP REST API (/api/*) ───────────┐
    │                                             │
    ▼                                             ▼
FastAPI Python Backend                    WebSocket Server
 (Auth, Dashboard, Equipment, Alerts,      (Live Telemetry Streaming)
  Maintenance, Analytics, ML, Reports)            │
    │                                             │
    ├──────────────────────┬──────────────────────┘
    ▼                      ▼
ML Anomaly Detector    Fault-Linking Engine
 (Isolation Forest)     (Rule-Based Interpretation)
    │                      │
    └──────────┬───────────┘
               ▼
    SQLite Database (app.db)
```

### 6.2 Data Pipeline Flow
`Telemetry Collection` ➔ `Feature Engineering` ➔ `Isolation Forest Scoring` ➔ `Fault Linkage` ➔ `Alert Inbox` ➔ `Maintenance Work Order`

---

## 7. TECHNOLOGIES USED

| Category | Technology | Usage in EnergyIQ |
| :--- | :--- | :--- |
| **Frontend Framework** | React 19 | Single-page application UI component rendering |
| **Build Tool** | Vite | Rapid frontend development and production bundling |
| **Styling** | Tailwind CSS | SaaS styling and responsive UI layout |
| **Data Visualization** | Recharts | Interactive time-series energy charts |
| **UI Icons** | Lucide React | Clean, intuitive status and navigation icons |
| **Backend Framework** | Python 3.13 / FastAPI | High-performance RESTful API endpoints |
| **Database** | SQLite | Lightweight embedded relational database persistence |
| **Machine Learning** | Scikit-Learn (Isolation Forest) | Context-aware energy anomaly detection |
| **Data Processing** | NumPy, Pandas | Telemetry array processing and feature scaling |
| **Security & Auth** | PyJWT, Passlib (PBKDF2-HMAC-SHA256) | Stateless authentication and password hashing |
| **Testing** | PyTest | Automated backend unit, API, and workflow testing |
| **Environment** | VS Code, Git, GitHub | Code editing, version control, and repository hosting |

---

## 8. DATABASE DESIGN

### 8.1 Database Overview
EnergyIQ utilizes SQLite (`backend/data/app.db`) for lightweight local persistence and fast relational queries.

### 8.2 Primary Database Tables
1. **`users`**: Stores user credentials, hashed passwords, assigned role (`ADMIN`, `FACILITY_OPERATOR`, `TECHNICAL_ENGINEER`), and status.
2. **`telemetry`**: Stores hourly asset energy metrics (kWh, temperature, operating state, production output, solar, battery, grid, anomaly score, severity).
3. **`equipment`**: Catalog of monitored campus physical assets (`HVAC-01`, `Motor-01`, `Chiller-01`, `Transformer-01`, etc.).
4. **`alerts`**: Stores generated anomaly alerts, linked equipment IDs, deviation percentages, severity, likely fault type, evidence notes, and review status (`ACTIVE`, `UNDER_INVESTIGATION`, `RESOLVED`, `FALSE_POSITIVE`).
5. **`maintenance_tasks`**: Stores scheduled work orders, assigned technician names, priority, description, status (`PENDING`, `IN_PROGRESS`, `COMPLETED`), and linked alert IDs.
6. **`notifications`**: Stores real-time system alerts and user notifications.
7. **`audit_logs`**: Logs user authentication events and administrative system actions.
8. **`models`**: Tracks registered ML model metadata, algorithm names, version tags, and active status.
9. **`model_drift_logs`**: Logs Population Stability Index (PSI) drift metrics over time.
10. **`settings`**: Persists system configuration parameters and notification thresholds.

---

## 9. BACKEND DEVELOPMENT

### 9.1 FastAPI API Routers
The FastAPI backend (`backend/main.py`) organizes endpoint logic across dedicated router modules:
- **`auth.py`** (`/api/auth`): User login, JWT token generation, user profile inspection, audit logging.
- **`dashboard.py`** (`/api/dashboard`): High-level KPI summaries, power-flow time-series history.
- **`equipment.py`** (`/api/equipment`): Equipment catalog listing, historical telemetry, health trends.
- **`alerts.py`** (`/api/alerts`): Alert inbox queries, correlated alert clustering, status review updates.
- **`analytics.py`** (`/api/analytics`): Aggregated energy metrics, cost impact calculations.
- **`maintenance.py`** (`/api/maintenance`): Work order retrieval, task creation, status updates.
- **`evaluation.py`** (`/api/evaluation`): Synthetic model evaluation comparison.
- **`data_quality.py`** (`/api/data-quality`): Completeness metrics, forward-fill imputation statistics.
- **`ml_registry.py`** (`/api/ml`): Model registry listing, model activation, engine rollback.
- **`streaming.py`** (`/api/streaming`): Telemetry simulator controls and WebSocket endpoint (`/api/streaming/ws`).
- **`reports.py`** (`/api/reports`): Report document generation.
- **`settings.py`** (`/api/settings`): Threshold and system settings management.
- **`notifications.py`** (`/api/notifications`): Real-time notification list and read-status updates.
- **`system_health.py`** & **`system_metrics.py`** (`/api/system`): System health checks, readiness probes, request metrics.
- **`export.py`** (`/api/export`): Operational data export (CSV/JSON).

---

## 10. FRONTEND DEVELOPMENT

### 10.1 Interface Views
The React 19 frontend (`frontend/src/App.jsx`) implements a responsive layout with 16 functional view modules:
- **Dashboard Overview**: Microgrid solar/grid/battery cards, energy KPIs, power flow chart, active alert list.
- **Live Energy**: Real-time campus microgrid telemetry chart and live streaming status.
- **Equipment View**: Asset health scores, historical telemetry charts, equipment status grid.
- **Alert Center**: Filterable alert table by status, severity, or asset ID with detail inspection modal.
- **Analytics View**: Long-term energy usage trends and cost consumption analytics.
- **Maintenance Planning**: Predictive work order task list, status update buttons, create task modal.
- **AI Insights**: Equipment risk predictions, energy drift highlights, preventive maintenance recommendations.
- **ML Evaluation**: Synthetic precision/recall evaluation metrics.
- **Benchmark ML**: Comparative benchmark diagnostics.
- **Data Quality**: Telemetry data completeness and outlier metrics.
- **Model Registry**: Model version management and activation switches.
- **Edge Case Workbench**: 7 canonical anomaly edge-case test executions.
- **Streaming Health**: Live telemetry stream feed, scenario selector, fault injection controls.
- **Executive Reports**: Formatted report document generator with print/PDF capability.
- **Demo Center**: Fault injection and demo data reset control panel.
- **Settings**: System threshold sliders and notification preferences.

---

## 11. ENERGY TELEMETRY
EnergyIQ generates and processes synthetic hourly campus telemetry covering 60 days across 7 canonical physical building assets:
1. `HVAC-01` (Campus HVAC Chiller)
2. `Motor-01` (Main Water Pump Motor)
3. `Chiller-01` (Central Chilled Water System)
4. `Transformer-01` (Main Campus Substation Transformer)
5. `AHU-02` (Air Handling Unit Building B)
6. `Lighting-BldA` (Main Academic Block Lighting Network)
7. `Elevator-Core` (Central Administration Elevator Bank)

Telemetry attributes include timestamp, equipment ID, equipment type, energy consumption (kWh), operating state (`ON`/`OFF`/`DEGRADED`), production context output, solar generation, battery state of charge (SoC), grid consumption, temperature (°C), maintenance status, ground truth anomaly flags, and assigned fault labels.

---

## 12. MACHINE LEARNING

### 12.1 Anomaly Detection Pipeline
- **Feature Engineering**: Calculates rolling 24-hour mean, rolling standard deviation, temperature deviation, and production context ratios.
- **Contextual Baseline**: Computes rolling quantile baselines (15th to 85th percentiles) conditioned on operating state.
- **Isolation Forest Model**: Scikit-Learn `IsolationForest` configured with `n_estimators=100`, `contamination=0.08`, and `random_state=42`.
- **Anomaly Score Thresholding**: Decision function outputs normalized anomaly scores where scores > 0.65 trigger high-severity alert candidates.

### 12.2 Synthetic Dataset Evaluation Metrics
*Note: Evaluated on synthetic campus ground-truth dataset.*
- **Precision**: **99.41%**
- **Recall**: **80.09%**
- **F1 Score**: **88.71%**

---

## 13. FAULT DETECTION
EnergyIQ maps statistical machine learning anomaly signals to 10 canonical physical equipment fault categories using physical rule correlation:
1. `MECHANICAL_RESISTANCE` (Increased power + elevated motor temperature)
2. `REFRIGERANT_LEAK` (High energy kWh + low cooling efficiency)
3. `SHORT_CYCLING` (Rapid state toggling + irregular spikes)
4. `THERMAL_OVERHEATING` (Temperature > 85.0°C under load)
5. `BEARING_WEAR` (Vibration & steady energy drift)
6. `SENSOR_CALIBRATION_DRIFT` (Discrepancy between power and production output)
7. `CAPACITOR_DEGRADATION` (Power factor drop + voltage imbalance)
8. `INSULATION_FAILURE` (Leakage current + temperature surge)
9. `BELT_SLIPPAGE` (Decreased production output under nominal power)
10. `FILTER_CLOGGING` (Increased fan power + pressure drop)

---

## 14. ALERT MANAGEMENT
- **Alert Inbox**: Displays generated anomaly alerts with equipment IDs, timestamp, deviation percentage, likely fault category, and severity (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`).
- **Review Workflow**: Facility operators can review physical evidence, add resolution notes, and update status to `RESOLVED`, `FALSE_POSITIVE`, or `UNDER_INVESTIGATION`.
- **Co-Occurring Alert Correlation**: Clusters co-occurring alerts across related equipment assets to identify campus-wide cascade faults.

---

## 15. MAINTENANCE MANAGEMENT
- **Work Order Generation**: Facility operators can convert active alerts into maintenance work orders with one click.
- **Task Lifecycle**: Tasks track priority, description, technician assignment (`Rajesh Kumar`, `On-Call Maintenance Tech`), and status transitions (`PENDING` -> `IN_PROGRESS` -> `COMPLETED`).
- **Database Persistence**: Work orders persist in SQLite and update equipment health scores upon completion.

---

## 16. AUTHENTICATION AND ROLE-BASED ACCESS
- **Stateless JWT**: Authentication uses JSON Web Tokens signed with `HS256`.
- **Password Security**: Passwords are hashed using PBKDF2-HMAC-SHA256 with 100,000 iterations and unique 16-byte random salts.
- **Defined System Roles**:
  - `ADMIN`: Full system access, model activation, engine rollback, settings, and user management.
  - `FACILITY_OPERATOR`: Operational monitoring, live energy tracking, alert review, streaming, and maintenance task management.
  - `TECHNICAL_ENGINEER`: Diagnostic investigation, ML model evaluation, benchmark analysis, and data quality inspection.

---

## 17. USER INTERFACE
- **Design Identity**: Clean white background with red (`#DC2626`) and green (`#059669`) accent status indicators, modern typography, card containers, and subtle shadows.
- **Navigation**: Collapsible sidebar navigation categorized into `MONITOR`, `INTELLIGENCE`, `OPERATIONS`, and `SYSTEM` groups.
- **Data Visualization**: Recharts time-series energy charts with responsive containers and tooltips.
- **Feedback**: Non-intrusive toast notifications for real-time status updates and alert triggers.

---

## 18. TESTING

### 18.1 Integration Test Suite
EnergyIQ includes an automated test suite executed via PyTest:
- **Test Result**: **75 / 75 PASSED (100% pass rate)** in **10.56 seconds**.
- **Coverage Areas**:
  - `test_auth.py`: Password hashing, JWT creation/decoding, valid/invalid logins, RBAC restrictions.
  - `test_api.py`: FastAPI endpoints (Dashboard, Equipment, Alerts, Maintenance, Analytics, Reports, Settings, Search).
  - `test_anomaly_detector.py`: Isolation Forest predictions, fault-linking logic, edge case handling.
  - `test_streaming.py`: WebSocket server status, telemetry validation, imputation.
  - `test_scenarios.py`: Telemetry degradation scenario engine.
  - `test_model_registry.py`: Model listing, model activation, engine rollback.
  - `test_drift_monitor.py`: Population Stability Index (PSI) calculations.
  - `test_data_quality.py`: Data completeness metrics and notifications API.
  - `test_alert_correlation.py`: Co-occurring alert clustering algorithm.
  - `test_benchmark.py`: Synthetic and ASHRAE benchmark adapters.
  - `test_health_score.py`: Equipment health trends, system metrics, backup script checks.
  - `test_milestone5.py`: Readiness probes, CSV/JSON data export, rate limiting, reproducible experiment runner.
  - `test_e2e_workflow.py`: Full multi-role end-to-end lifecycle workflow.
  - `test_failure_recovery.py`: Failure recovery checks (invalid JWT, malformed telemetry, invalid scenario).

---

## 19. 70% COMPLETION STATUS

| Academic Project Phase | Scope Description | Completion Status | Phase Share |
| :--- | :--- | :---: | :---: |
| **Phase 1 — Requirement Analysis** | Campus energy problem identification, feature requirements | **COMPLETED** | 100% |
| **Phase 2 — System Design** | Decoupled React-FastAPI architecture, API contract design | **COMPLETED** | 100% |
| **Phase 3 — Database Design** | Relational schema design (10 tables), SQLite persistence | **COMPLETED** | 100% |
| **Phase 4 — Core Backend** | FastAPI routers (Auth, Dashboard, Equipment, Alerts, Maintenance) | **COMPLETED** | 100% |
| **Phase 5 — Core Frontend** | Responsive UI components, sidebar navigation, Recharts charts | **COMPLETED** | 100% |
| **Phase 6 — Energy Telemetry** | 60-day hourly synthetic microgrid & asset dataset generation | **COMPLETED** | 100% |
| **Phase 7 — ML Anomaly Detection**| Context-aware Isolation Forest pipeline & baseline scoring | **COMPLETED** | 100% |
| **Phase 8 — Fault Detection & Alerts**| Rule-based physical fault interpretation & alert review inbox | **COMPLETED** | 100% |
| **Phase 9 — Maintenance Workflow** | Predictive work order creation, task updates, status tracking | **COMPLETED** | 100% |
| **Phase 10 — Integration Testing** | Automated PyTest integration test suite (75 passing tests) | **COMPLETED** | 100% |

**Academic Phase Evaluation Status**: **70% Phase Scope Fully Implemented & Validated**.

---

## 20. CURRENT IMPLEMENTATION STATUS
At the current 70% academic review stage, the core functional software of EnergyIQ has been successfully built, integrated, and validated. The core functional modules required for the academic milestone are fully operational. Furthermore, foundational work has also been initiated on advanced capabilities (such as model registry rollback, streaming scenarios, and Docker container configurations) which will be further refined in subsequent project phases.

---

## 21. REMAINING & FUTURE WORK

### Core Phase Focus (Completed)
- Core telemetry ingestion, Isolation Forest ML anomaly detection, fault-linking rules, alert triage, maintenance tasks, JWT/RBAC, and primary dashboard interfaces.

### Subsequent Development & Future Enhancements
1. **Production Infrastructure Deployment**: Full live deployment on cloud infrastructure with SSL/TLS certificate termination.
2. **PostgreSQL Production Migration**: Production database migration from SQLite to PostgreSQL.
3. **Expanded Public Dataset Validation**: Integrating larger real-world energy datasets (e.g., full 20M+ row Kaggle ASHRAE dataset).
4. **Long-Duration Continuous Soak Testing**: Running continuous 24-hour live streaming burn-in tests in staging environment.
5. **Advanced Model Refinement**: Enhancing deep-learning time-series forecasting models (LSTM / Transformer-based anomaly scoring).

---

## 22. RESULTS
- **System Stability**: 75/75 PyTest integration tests passing with 100% success rate.
- **Frontend Build**: Vite production build transforms 2,179 modules with 0 compilation errors.
- **Detection Accuracy (Synthetic Benchmark)**: Precision 99.41%, Recall 80.09%, F1 Score 88.71%.
- **Database Query Latency**: Sub-millisecond execution times (0.83 ms for 24h telemetry query, 0.21 ms for alert queries).
- **Streaming Capacity**: Ingestion load tests verified throughput up to 500 EPS with 0.0% frame drops.

---

## 23. LIMITATIONS
1. **Synthetic Telemetry Baseline**: Primary anomaly detection evaluation relies on generated 60-day campus microgrid telemetry; real-world hardware integration is simulated.
2. **Local Machine Environment**: PostgreSQL production runtime and cloud Docker container execution were verified via syntax and schema abstraction, as the local evaluation host lacks active PostgreSQL and Docker daemons.
3. **Public Dataset Scope**: Public dataset evaluation was performed using a 100-sample building meter fixture rather than full multi-gigabyte Kaggle downloads due to local bandwidth constraints.

---

## 24. CONCLUSION
EnergyIQ successfully demonstrates the application of computer science principles, machine learning algorithms, and modern web software engineering to solve commercial campus energy monitoring and predictive maintenance challenges. The platform successfully bridges the gap between statistical anomaly detection and practical facility maintenance dispatch.

The core functional requirements for the 70% academic phase review — including database architecture, REST APIs, ML anomaly detection, fault interpretation, alert management, maintenance workflows, and UI dashboards — have been fully implemented, integrated, and verified through automated test suites.

---

## 25. GITHUB REPOSITORY
- **Repository URL**: [https://github.com/kavidass8072/EnergyIQ](https://github.com/kavidass8072/EnergyIQ)
- **Repository Contents**:
  - `backend/`: FastAPI API routers, database models, ML detectors, fault linking rules, streaming simulator.
  - `frontend/`: React 19 SPA view modules, components, services, and Vite config.
  - `tests/`: 75 PyTest integration test modules.
  - `docs/`: Technical documentation covering architecture, database, deployment, and security.
  - `reports/`: Audit reports, validation metrics, and milestone benchmarks.
  - `experiments/`: Reproducible benchmark execution scripts and serialized JSON results.

---

## 26. RECOMMENDED SCREENSHOT LOCATIONS FOR REPORT

1. `[Insert Screenshot 01: Login Screen — JWT Authentication & Quick Login Buttons]`
2. `[Insert Screenshot 02: Dashboard Overview — Campus Microgrid KPIs & Power Flow Chart]`
3. `[Insert Screenshot 03: Live Energy View — Real-time Telemetry & Microgrid Stream]`
4. `[Insert Screenshot 04: Equipment View — Asset Health Scores & Telemetry History]`
5. `[Insert Screenshot 05: Alert Inbox — AI Anomaly & Fault Linkage Table]`
6. `[Insert Screenshot 06: Alert Detail Modal — Physical Evidence & Maintenance Task Creation]`
7. `[Insert Screenshot 07: Analytics View — Energy Drift & Consumption Analytics]`
8. `[Insert Screenshot 08: Maintenance View — Predictive Work Orders & Status Updates]`
9. `[Insert Screenshot 09: AI Insights View — Risk Equipment & Preventive Action Plan]`
10. `[Insert Screenshot 10: ML Evaluation View — Synthetic Benchmark Precision/Recall Metrics]`
11. `[Insert Screenshot 11: Model Registry View — Active ML Models & Population Stability Index]`
12. `[Insert Screenshot 12: Streaming Health View — Telemetry Degradation Scenarios]`
13. `[Insert Screenshot 13: Executive Reports View — Printable Campus Energy Audit Report]`

---

## 27. REFERENCES
1. FastAPI Framework Documentation — [https://fastapi.tiangolo.com/](https://fastapi.tiangolo.com/)
2. React 19 Documentation — [https://react.dev/](https://react.dev/)
3. Scikit-Learn Isolation Forest Guide — [https://scikit-learn.org/stable/modules/generated/sklearn.ensemble.IsolationForest.html](https://scikit-learn.org/stable/modules/generated/sklearn.ensemble.IsolationForest.html)
4. SQLite Database Engine Documentation — [https://www.sqlite.org/docs.html](https://www.sqlite.org/docs.html)
5. ASHRAE Great Energy Predictor III Dataset Reference — Kaggle Energy Diagnostics Benchmark.
6. Vite Build Tool Documentation — [https://vite.dev/](https://vite.dev/)
7. PyTest Testing Framework — [https://docs.pytest.org/](https://docs.pytest.org/)

---

## 28. FINAL 70% PHASE SUMMARY MATRIX

| Parameter | Project Details / Verified Metric |
| :--- | :--- |
| **Project Title** | EnergyIQ — Commercial Campus Energy Intelligence & Predictive Maintenance Platform |
| **Student Name** | KAVIDASS M |
| **Degree & Dept** | B.E. Computer Science and Engineering |
| **Institution** | Rathinam Technical Campus, Coimbatore, Tamil Nadu |
| **Academic Phase**| **70% Project Completion Review** |
| **Core Software Status**| **Core Functional Modules Fully Implemented & Integrated** |
| **Automated Tests** | **75 / 75 PASSED (100% Pass Rate)** |
| **Frontend Build** | **Vite Build PASS (0 compilation errors, 2,179 modules transformed)** |
| **ML Performance** | **Precision 99.41%, Recall 80.09%, F1 88.71% (Synthetic Ground Truth)** |
| **GitHub Repository**| [https://github.com/kavidass8072/EnergyIQ](https://github.com/kavidass8072/EnergyIQ) |
