# ⚡ EnergyIQ — Commercial Campus Energy Intelligence & Predictive Maintenance Platform

> **AI-Powered Campus Energy Monitoring, Equipment Anomaly Detection, Fault Linking, and Predictive Maintenance Platform**
> 
> *Production-style prototype evaluated on synthetic commercial campus telemetry data.*

---

## 1. Project Overview & Title

**EnergyIQ** is a full-stack, enterprise-grade energy intelligence and predictive maintenance platform built for commercial facilities, university campuses, and industrial sites operating multi-source microgrids (**Solar PV, Battery Energy Storage, Grid Supply**) and heavy equipment assets.

---

## 2. Short Description

EnergyIQ continuously monitors campus microgrid power vectors and equipment-level energy consumption, detects subtle power anomalies using a **Contextual Isolation Forest**, links detected energy anomalies to root-cause equipment faults via physical evidence rules, and automates predictive maintenance work orders.

---

## 3. Problem Statement

Commercial campus facility managers typically detect equipment degradation and electrical abnormalities only when:
- Electricity bills unexpectedly surge at the end of a billing cycle.
- Critical equipment suffers catastrophic mechanical failure causing facility downtime.
- Maintenance teams are overwhelmed by false alarms from naive Z-score thresholding.

Existing monitoring systems lack contextual awareness—failing to account for ambient temperature, production output rates, operating state (`ON`/`OFF`), or scheduled maintenance intervals when evaluating power draw.

---

## 4. Proposed Solution

EnergyIQ solves this challenge by implementing:
1. **Context-Aware ML Anomaly Detection**: Evaluates energy draw against a quantile baseline normalized for operating state, production output, and environmental variables.
2. **Physical Fault Linking Engine**: Translates high-dimensional anomaly signals into 10 explicit root-cause equipment fault categories with quantitative confidence scores and physical evidence lists.
3. **Closed-Loop Predictive Maintenance**: Directly converts verified alerts into maintenance work orders with technician assignments and priority tracking.
4. **Interactive Edge-Case & Fault Simulation Workbench**: Allows facility engineers to stress-test detection rules across extreme operational scenarios and inject real-time faults.

---

## 5. Key Features

- **Executive Dashboard (Overview)**: Real-time KPIs (Total Assets, Active Alerts, High Priority, Energy Waste, Grid Dependence %, Avoided Cost Savings) and dynamic Microgrid Power Vector (Solar ☀️, Battery 🔋, Grid ⚡, Campus Load 🏭).
- **Live Energy Monitor**: High-frequency power mix gauges, renewable contribution tracking, and real-time asset telemetry stream.
- **Equipment & Health Intelligence**: Inventory of 7 monitored commercial assets with explicit **Health Scores (0–100)** (`Healthy`, `Needs Attention`, `Action Required`), 72h actual vs baseline power curves, and asset maintenance history.
- **Alert Center & Inspector**: Filter alerts by status (`Active`, `Under Investigation`, `Reviewed`, `Resolved`, `False Positive`). Features dual **Operator View** (plain-language summary) and **Technical View** (ML feature signals & Isolation Forest decision tree output).
- **Maintenance Planning & AI Insights**: Predictive AI maintenance insights, work orders table (Upcoming, In-Progress, Completed, Overdue), and task creation/resolution workflows.
- **Analytics Workbench**: Equipment energy draw vs baseline comparisons, renewable solar vs battery vs grid source breakdown, and financial waste analysis in ₹ per asset.
- **ML Benchmark Evaluation**: Side-by-side performance matrix of Baseline (Z-Score) vs Proposed (Contextual Isolation Forest), confusion matrices, and False Positive / False Negative root-cause analysis.
- **Edge Case Workbench**: Automated test runner for 7 stress scenarios (Missing Data, Production Spikes, OFF State Leakage, Maintenance Suppression, Microgrid Transition, Extreme Heat, Electrical Spike).
- **Executive Reports**: Formal printable & downloadable reports (System Health, Anomaly Report, Evaluation Report, Maintenance Report, Cost Impact Report) with native `window.print()` support.
- **Settings & Tariff Configuration**: Persistent configuration of electricity tariff (₹/kWh), Z-score thresholds, window sizes, and auto-refresh intervals stored in SQLite.
- **Demo Center (Live Fault Simulator)**: Controlled fault injection buttons (`Inject Mechanical Resistance`, `Inject Standby Leakage`, `Inject Production Mismatch`, `Inject Electrical Spike`) and database reset controls.
- **Global Search**: Instant autocomplete search across equipment, alerts, fault categories, and maintenance tasks.

---

## 6. System Architecture

EnergyIQ uses a decoupled **6-Layer SaaS Architecture**:

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        LAYER 6: USER INTERFACE                         │
│   React 19 + Vite + Vanilla CSS Design System + Recharts + Lucide      │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ RESTful HTTP APIs
┌───────────────────────────────────▼────────────────────────────────────┐
│                        LAYER 5: APPLICATION API                        │
│ FastAPI (Dashboard, Equipment, Alerts, Maintenance, Analytics, etc)    │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ SQL Queries & Persistence
┌───────────────────────────────────▼────────────────────────────────────┐
│                      LAYER 4: PERSISTENCE LAYER                        │
│      SQLite (app.db: telemetry, alerts, maintenance_tasks, settings)   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Analyzed Evidence & Confidence
┌───────────────────────────────────▼────────────────────────────────────┐
│                   LAYER 3: FAULT LINKING ENGINE                        │
│   10 Root-Cause Fault Categories + Physical Evidence Matrix           │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Feature Matrices
┌───────────────────────────────────▼────────────────────────────────────┐
│                      LAYER 2: ML ANOMALY PIPELINE                      │
│   Contextual Isolation Forest Detector + Quantile Baseline Power       │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Telemetry Streams
┌───────────────────────────────────▼────────────────────────────────────┐
│                       LAYER 1: TELEMETRY ENGINE                        │
│ Synthetic Campus Generator (60 Days, 10,080 Hours, 7 Monitored Assets) │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 7. Technology Stack

- **Backend**: Python 3.11+, FastAPI, Uvicorn, Pydantic, PyTest
- **Machine Learning**: Scikit-Learn (Isolation Forest), NumPy, Pandas
- **Database & Storage**: SQLite 3 (`backend/data/app.db`)
- **Frontend**: React 19, Vite, Vanilla CSS Design System, Recharts, Lucide Icons, Axios
- **Containerization & Dev Tools**: Docker, Docker Compose, PowerShell / Bash automation scripts

---

## 8. Machine Learning Approach

EnergyIQ employs a two-stage anomaly detection and fault classification methodology:
1. **Quantile Baseline Power Estimation (`norm_expected_kw`)**: Computes the 25th percentile of `ON` operating state energy per asset over historical windows. This prevents multi-day continuous equipment degradation from skewing the rolling baseline mean.
2. **Context-Aware Isolation Forest**: An Isolation Forest ensemble (`n_estimators=100`, `contamination=0.05`) isolates out-of-distribution observations in high-dimensional feature space (`energy_kwh`, `operating_state`, `production_output`, `temperature`, `maintenance_days`, `solar_generation_kwh`, `battery_soc`, `grid_consumption_kwh`).
3. **Data Leakage Exclusion**: Ground-truth target fields (`is_anomaly`, `fault_label`) are strictly excluded from feature extraction and training matrices.

---

## 9. Monitored Assets & Fault Categories

### Monitored Commercial Campus Assets (7 Canonical Assets):
1. `HVAC-01` (Main Campus HVAC System)
2. `HVAC-02` (Secondary HVAC / Chiller)
3. `Motor-01` (Heavy Industrial Motor)
4. `Compressor-01` (Air Compressor Unit)
5. `Pump-01` (Primary Water Circulation Pump)
6. `Production-Line-01` (Main Production Line Assembly)
7. `Cooling-Unit-01` (Data Center / Facility Cooling Unit)

### Canonical Equipment Fault Categories (10 Root Causes):
1. **Motor Inefficiency**: Sustained energy draw +30% to +50% above expected with normal production load.
2. **Mechanical Resistance**: Energy draw > +50% above expected while production rate is normal/high (`ON`).
3. **Sensor Malfunction**: Energy consumption reads 0.0 kWh while equipment is reported ON with active production output.
4. **Unexpected Standby Consumption**: Non-zero energy draw (> 2.0 kWh) while operating state is `OFF`.
5. **Excessive Operating Duration**: Equipment running ON during non-production off-peak hours/weekends without production justification.
6. **Cooling/Heating Inefficiency**: High HVAC/Chiller power draw under elevated ambient temperature (> 30°C).
7. **Production-Related Abnormality**: High energy draw (+25%) despite reduced production output (< 40 units).
8. **Maintenance Overdue**: Service interval > 60 days with elevated energy draw (+25%).
9. **Electrical Abnormality**: Severe short-duration energy surge (+65% above baseline).
10. **Unknown Anomaly**: Low-confidence fallback when physical evidence is unclassified.

---

## 10. Database & Persistence Layer

EnergyIQ persists all operational state to an SQLite database located at `backend/data/app.db`:
- `telemetry`: 10,080 hourly records storing raw sensor values, quantile baselines, anomaly scores, and severity.
- `alerts`: Active and historical alerts with physical evidence lists, confidence scores, and status lifecycle (`ACTIVE`, `UNDER_INVESTIGATION`, `REVIEWED`, `RESOLVED`, `FALSE_POSITIVE`).
- `maintenance_tasks`: Work orders linked to alerts with assigned technicians, due dates, and status (`UPCOMING`, `IN_PROGRESS`, `COMPLETED`, `OVERDUE`).
- `app_settings`: Persistent system settings (tariff rates, detection sensitivity, refresh intervals).

---

## 11. Frontend Navigation & Pages (12 Pages)

1. **Overview**: Executive summary KPIs, System Health indicator, Microgrid power flow, 48h trend chart.
2. **Live Energy**: Real-time power mix gauges, renewable contribution, live telemetry table.
3. **Equipment**: Asset grid, Health Scores (0–100), asset detail modal with 72h actual vs expected curves.
4. **Alerts**: Alert inbox with status filter, dual-view Inspector modal (Operator View & Technical View).
5. **Analytics**: Equipment energy draw comparison, energy source breakdown, cost waste analysis.
6. **Maintenance**: Predictive AI insights, work orders table, work order creation modal.
7. **AI Insights**: AI-generated health warnings, risk predictions, recommended maintenance.
8. **ML Evaluation**: Baseline vs Proposed model benchmark matrix, confusion matrix, FPR/precision comparison.
9. **Edge Cases**: Interactive workbench for testing 7 extreme operational scenarios (EC-01 to EC-G).
10. **Reports**: Printable formal executive reports with `window.print()` styling.
11. **Demo Center**: Interactive fault injection workbench (`Inject Mechanical Resistance`, etc.) and system reset.
12. **Settings**: Platform configuration manager for tariff rates, detection parameters, and auto-refresh intervals.

---

## 12. API Overview

FastAPI provides full RESTful API coverage under `/api`:
- `GET /api/dashboard/summary` — Overview KPIs & microgrid state
- `GET /api/equipment` — Monitored asset health scores & metadata
- `GET /api/alerts` — Active & historical alert inbox
- `POST /api/alerts/{id}/review` — Update alert resolution status
- `GET /api/maintenance` — Maintenance work orders & AI insights
- `POST /api/maintenance` — Create work order
- `PUT /api/maintenance/{id}/status` — Update work order status
- `GET /api/evaluation/metrics` — Model benchmark evaluation results
- `GET /api/edge-cases/run-all` — Run 7 edge case stress tests
- `POST /api/demo/inject` — Inject synthetic fault anomaly
- `POST /api/demo/reset` — Reset database to clean baseline
- `GET /api/search?q={query}` — Global search API

Full interactive Swagger API documentation is available at `http://localhost:8000/docs`.

---

## 13. Project Structure

```text
EnergyIQ/
├── backend/
│   ├── main.py                     # FastAPI application entrypoint
│   ├── api/                        # REST API routers (dashboard, equipment, alerts, etc)
│   ├── config/                     # Threshold configurations
│   ├── data/                       # app.db SQLite storage location
│   ├── database/                   # SQLite schema & database connector
│   ├── fault_linking/              # Heuristic physical fault linking engine
│   ├── ml/                         # Feature engineering & Isolation Forest model
│   └── services/                   # Data loader & background seeding service
├── frontend/
│   ├── src/                        # React 19 component hierarchy & pages
│   │   ├── components/             # Reusable UI components (Sidebar, TopNav, Cards, Modals)
│   │   ├── pages/                  # 12 navigation page views
│   │   ├── services/               # Axios API client bindings
│   │   └── App.jsx                 # Main application router & shell
│   ├── public/                     # Static assets & icons
│   ├── package.json                # Frontend dependencies
│   └── vite.config.js              # Vite dev server configuration
├── docs/                           # Technical documentation (architecture, API, ML, data model)
├── reports/                        # Executive validation report
├── tests/                          # PyTest automated test suite
├── .env.example                    # Environment configuration template
├── .gitignore                      # GitHub repository exclusions
├── CONTRIBUTING.md                 # Contribution guidelines
├── LICENSE                         # MIT License
├── README.md                       # Main GitHub project repository documentation
├── requirements.txt                # Python dependencies
├── run_app.bat                     # Windows batch launch script
└── run_app.ps1                     # PowerShell launch script
```

---

## 14. Installation Instructions

### Prerequisites
- Python 3.11+
- Node.js 18+ & npm

### Setup Step-by-Step

1. **Clone Repository**:
   ```bash
   git clone https://github.com/your-username/EnergyIQ.git
   cd EnergyIQ
   ```

2. **Backend Setup**:
   ```bash
   python -m venv .venv
   # Windows activation:
   .venv\Scripts\activate
   # Linux/macOS activation:
   # source .venv/bin/activate
   pip install -r requirements.txt
   ```

3. **Frontend Setup**:
   ```bash
   cd frontend
   npm install
   cd ..
   ```

---

## 15. Backend Run Instructions

Start the FastAPI application server:
```bash
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```
Swagger UI Documentation: `http://localhost:8000/docs`  
ReDoc API Documentation: `http://localhost:8000/redoc`

---

## 16. Frontend Run Instructions

Start the Vite development server:
```bash
cd frontend
npm run dev
```
Open `http://localhost:5173` in your web browser.

---

## 17. Testing Instructions

Run the complete automated backend PyTest suite (17 unit and integration tests):
```bash
python -m pytest tests/ -v
```

Run the frontend production build verification:
```bash
cd frontend
npm run build
```

---

## 18. Machine Learning Evaluation Results

> **Note on Evaluation**: The metrics reported below represent **experimental evaluation results on synthetic/simulated commercial campus telemetry data** (60 days, 10,080 hourly records).

| Metric | Baseline Model (Rolling Z-Score) | Proposed Model (Contextual Isolation Forest) | Target | Result Status |
| :--- | :---: | :---: | :---: | :---: |
| **Precision** | 68.4% | **99.41%** | ≥ 80.0% | **PASSED** |
| **Recall (Detection Rate)** | 62.1% | **80.09%** | ≥ 75.0% | **PASSED** |
| **F1-Score** | 65.1% | **88.71%** | ≥ 77.0% | **PASSED** |
| **High-Priority Precision** | 72.0% | **98.80%** | ≥ 85.0% | **PASSED** |
| **False Alarm Rate (FPR)** | 8.2% | **0.03%** | ≤ 5.0% | **PASSED** |
| **Avg Detection Delay** | 4.2 hours | **0.0 hours** | < 2.0 hours | **PASSED** |

---

## 19. Edge-Case Validation

EnergyIQ includes an automated stress-testing engine covering 7 challenging operational edge cases:

| Case | Edge Case Scenario | Expected System Behavior | Result |
| :---: | :--- | :--- | :---: |
| **EC-01** | Missing / Null Telemetry | Mean imputation prevents pipeline crash | **PASS** |
| **EC-B** | Production Output Surge | Suppresses false alarms during rapid ramp-up | **PASS** |
| **EC-C** | Standby Power in OFF State | Detects non-zero power in OFF state as Standby Leakage | **PASS** |
| **EC-D** | Planned Maintenance Testing | Maintenance flag suppresses false anomaly alerts | **PASS** |
| **EC-E** | Microgrid Solar Transition | Grid takeover during cloud cover classified normal | **PASS** |
| **EC-F** | Extreme Ambient Heat | Compressor power scaling under 45°C heat handled | **PASS** |
| **EC-G** | Uncorrelated Electrical Surge | Identifies overcurrent/voltage spike abnormality | **PASS** |

**Total Pass Rate**: 7 / 7 (100%)

---

## 20. Demo Center (Fault Simulator)

The **Demo Center** is an interactive live fault injection workbench designed for live demonstrations and testing:
- **Inject Mechanical Resistance**: Increases active power draw by +62% while keeping production output constant on `Motor-01`.
- **Inject Standby Leakage**: Simulates 8.5 kWh continuous draw while asset state is `OFF`.
- **Inject Production Mismatch**: Sets energy draw high (+45%) with zero production output.
- **Inject Electrical Spike**: Injects a sudden short-duration +110% power spike.
- **Reset Demo Data**: Instantly reseeds the database back to clean baseline telemetry.

---

## 21. User Interface & Screenshots

> *Placeholder: Screenshots of EnergyIQ User Interface*

```text
[ Screenshot Placeholder: Executive Overview Dashboard & Microgrid Power Flow ]
[ Screenshot Placeholder: Equipment Health Cards & 72h Energy Draw Curves ]
[ Screenshot Placeholder: Alert Inspector Modal (Operator View vs Technical View) ]
[ Screenshot Placeholder: ML Evaluation Matrix & Edge Case Workbench ]
```

---

## 22. Future Enhancements

- **Real-Time MQTT / OPC-UA Ingestion**: Connect directly to physical industrial IoT gateways and building management systems (BMS).
- **Deep Learning Sequence Modeling**: Implement LSTM / Transformer autoencoders for multi-day temporal sequence pattern forecasting.
- **Automated BACnet / Modbus Controls**: Trigger automated HVAC setback control commands via industrial protocol integration.
- **Multi-Campus Fleet Analytics**: Support multi-tenant geographical campus portfolio aggregation and benchmarking.

---

## 23. Academic & Prototype Disclaimer

> **Disclaimer**: EnergyIQ is an **experimental production-style software prototype** developed for research, academic, and demonstration purposes. All benchmark evaluation metrics are derived from **simulated/synthetic telemetry datasets** modeled after commercial campus operational profiles. The system is not currently deployed in an operational commercial facility.

---

## 24. License

Distributed under the MIT License. See [`LICENSE`](file:///e:/coe%20project/LICENSE) for more information.
