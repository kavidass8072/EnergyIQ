# 🏗️ EnergyIQ System Architecture Document

**EnergyIQ** is an enterprise-grade AI-powered **Campus Energy Intelligence & Predictive Maintenance Platform** designed for commercial facilities using Solar Photovoltaics (PV), Battery Energy Storage Systems (BESS), Grid electricity, and heavy electrical/production assets.

---

## 1. High-Level Architecture Overview

EnergyIQ is constructed using a decoupled **6-Layer Product Architecture**:

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        LAYER 6: USER INTERFACE                         │
│   React 19 + Vite + Tailwind CSS + Recharts + Lucide Icons (Dark/Light)  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTP / REST APIs
┌───────────────────────────────────▼────────────────────────────────────┐
│                        LAYER 5: APPLICATION API                        │
│ FastAPI (Routers: dashboard, equipment, alerts, maintenance, demo, etc)│
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ SQL Queries / Mutations
┌───────────────────────────────────▼────────────────────────────────────┐
│                      LAYER 4: PERSISTENCE LAYER                        │
│            SQLite (app.db: telemetry, alerts, maintenance, settings)   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Analyzed Evidence & Labels
┌───────────────────────────────────▼────────────────────────────────────┐
│                   LAYER 3: FAULT LINKING ENGINE                        │
│   Heuristic Evidence Matrix + Confidence Calculation (10 Fault Types)   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Feature Matrices
┌───────────────────────────────────▼────────────────────────────────────┐
│                      LAYER 2: ML ANOMALY PIPELINE                      │
│   Contextual Isolation Forest Detector + Quantile Baseline Power       │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Telemetry Streams
┌───────────────────────────────────▼────────────────────────────────────┐
│                       LAYER 1: TELEMETRY ENGINE                        │
│ Synthetic Campus Generator (60 Days, 10,080 Hours, 7 Assets)          │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Detailed Layer Specifications

### Layer 1: Telemetry Stream Engine (`ml/synthetic_generator.py`)
- Generates 60 days of hourly telemetry (10,080 records) across 7 commercial campus assets (`HVAC-01`, `HVAC-02`, `Motor-01`, `Compressor-01`, `Pump-01`, `Production-Line-01`, `Cooling-Unit-01`).
- Features captured per timestamp:
  - `timestamp`, `equipment_id`, `equipment_type`, `operating_state` (`ON`/`OFF`), `production_output`, `temperature`, `maintenance_days`, `solar_generation_kwh`, `battery_soc`, `grid_consumption_kwh`.
- Controlled ground-truth fault injections for benchmark evaluation.

---

### Layer 2: ML Anomaly Detection Pipeline (`ml/feature_engineering.py` & `ml/anomaly_detector.py`)
- **Baseline Feature Engineering**:
  - `norm_expected_kw`: 25th percentile of `ON` operating state energy per asset to prevent multi-day continuous degradation from corrupting rolling baseline.
  - `historical_dev_pct`: Quantile-normalized baseline deviation.
  - `rolling_mean_24h` & `rolling_std_24h`.
  - Zero Target Leakage: `is_anomaly` and `fault_label` are explicitly excluded from feature matrices.
- **Contextual Isolation Forest Detector**:
  - Scikit-Learn `IsolationForest` initialized with contamination ratio `0.05`.
  - Identifies out-of-distribution telemetry points in high-dimensional feature space.

---

### Layer 3: Fault Linking & Evidence Engine (`backend/fault_linking/engine.py`)
Links detected tree-isolation anomaly signals to physical equipment failure mechanisms:
1. `Mechanical Resistance`: Energy draw > +50% above expected while production rate is normal/high (`ON`).
2. `Motor Inefficiency`: Sustained energy draw +30% to +50% above expected with normal production output (`ON`).
3. `Sensor Malfunction`: Energy consumption reads 0.0 kWh while equipment is reported ON with active production output.
4. `Unexpected Standby Consumption`: Non-zero energy draw (> 2.0 kWh) while operating state is `OFF`.
5. `Excessive Operating Duration`: Running in active state `ON` during non-production off-peak hours/weekends.
6. `Cooling/Heating Inefficiency`: High HVAC/Chiller power draw under elevated ambient temperature (> 30°C).
7. `Production-Related Abnormality`: High energy draw (+25%) despite reduced production output (< 40 units).
8. `Maintenance Overdue`: Service interval > 60 days with elevated energy draw (+25%).
9. `Electrical Abnormality`: Severe short-duration energy spike (+65% above baseline).
10. `Unknown Anomaly`: Low-confidence fallback when physical evidence is unclassified.

---

### Layer 4: SQLite Database Persistence (`backend/database/db.py`)
Resides at `backend/data/app.db`.
Tables:
- `telemetry`: Historical raw and engineered telemetry records.
- `alerts`: Anomaly alerts with status (`ACTIVE`, `UNDER_INVESTIGATION`, `REVIEWED`, `RESOLVED`, `FALSE_POSITIVE`), calculated evidence JSON, and recommendations.
- `maintenance_tasks`: Work orders linked to equipment and anomaly alerts.
- `app_settings`: Persistent system configurations (tariff rates, thresholds, window sizes).

---

### Layer 5: RESTful Application API (`backend/main.py` & `backend/api/`)
FastAPI application mounting modular routers:
- `/api/dashboard`: Summary KPIs, dynamic system health state, live microgrid power flow snapshot.
- `/api/equipment`: Asset inventory, health score (0-100), 72h historical curves.
- `/api/alerts`: Alert inbox, filtering, status transition workflows.
- `/api/maintenance`: Maintenance schedule, work orders, AI predictive insights.
- `/api/analytics`: Asset efficiency comparison, renewable energy contribution, energy waste cost.
- `/api/evaluation`: Baseline vs Proposed model evaluation benchmark metrics.
- `/api/edge-cases`: Interactive stress test suite (Cases A through G).
- `/api/reports`: Executive printable/exportable report generator.
- `/api/demo`: Controlled fault injection (`/api/demo/inject`) and database reset (`/api/demo/reset`).
- `/api/settings`: System configuration CRUD.
- `/api/search`: Global search autocomplete engine.

---

### Layer 6: Frontend User Interface (`frontend/src/`)
Built with React 19, Vite, Recharts, and Lucide Icons:
- Responsive desktop sidebar shell with collapse mode and top navbar.
- Dark & Light mode theme support.
- Real-time power mix monitor with animated energy flow.
- Interactive Alert Inspector modal featuring **Operator View** and **Technical View** modes.
- Printable report generator with native `window.print()` styling.
