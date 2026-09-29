# ENERGYIQ — 70% PROJECT COMPLETION EXECUTIVE SUMMARY

**Project Title**: EnergyIQ — Commercial Campus Energy Intelligence & Predictive Maintenance Platform  
**Student**: KAVIDASS M  
**Degree & Department**: B.E. Computer Science and Engineering  
**Institution**: Rathinam Technical Campus, Coimbatore, Tamil Nadu  
**Academic Phase**: 70% Project Completion Review  
**GitHub Repository**: [https://github.com/kavidass8072/EnergyIQ](https://github.com/kavidass8072/EnergyIQ)  

---

### 1. Problem Statement
Commercial campuses consume significant electrical energy across HVAC chillers, pumps, motors, and microgrids. Traditional monitoring relies on manual meter readings and delayed utility bills, failing to catch sub-optimal equipment behavior, energy drift, or thermal overheating in real time.

### 2. Project Objectives
1. Ingest campus energy and asset operational telemetry in real time.
2. Detect statistical energy anomalies using Context-Aware Isolation Forest algorithms.
3. Link anomaly signals to 10 physical equipment fault categories with telemetry evidence.
4. Provide prioritized alert inbox triage (`ACTIVE`, `UNDER_INVESTIGATION`, `RESOLVED`, `FALSE_POSITIVE`).
5. Enable direct one-click conversion of critical alerts into maintenance work orders.
6. Enforce security via JWT authentication and Role-Based Access Control (`ADMIN`, `OPERATOR`, `ENGINEER`).

### 3. Architecture & Technologies
- **Frontend**: React 19, Vite, Tailwind CSS, Recharts, Lucide React icons.
- **Backend**: Python 3.13, FastAPI REST API, Uvicorn ASGI server.
- **Database**: Embedded SQLite (`app.db`) with 10 relational tables.
- **Machine Learning**: Scikit-Learn Isolation Forest, rolling quantile baseline estimator.

```
React 19 SPA ➔ FastAPI REST API ➔ Isolation Forest & Fault Rules ➔ SQLite (app.db)
```

### 4. Completed 70% Phase Scope
- **Database Design**: 10 relational tables (`users`, `telemetry`, `equipment`, `alerts`, `maintenance_tasks`, etc.).
- **Backend API**: 21 FastAPI routers fully bound and tested.
- **Frontend Views**: 16 responsive SPA views (Dashboard, Live Energy, Equipment, Alerts, Maintenance, ML Eval, Reports, etc.).
- **ML & Fault Linking**: Isolation Forest anomaly detection + 10 physical fault classification rules.
- **Maintenance Workflow**: Predictive task creation, technician assignment, status updates.
- **Integration Testing**: **75 / 75 PyTest tests passed (100% pass rate)**.
- **Production Build**: **Vite build passed (2,179 modules, 0 errors)**.

### 5. Machine Learning Evaluation (Synthetic Ground Truth)
- **Precision**: 99.41%
- **Recall**: 80.09%
- **F1 Score**: 88.71%

### 6. Remaining / Future Work
- Production cloud deployment with live SSL/TLS certificate termination.
- Production PostgreSQL database migration.
- Expanded real-world energy dataset evaluation.
- Continuous 24-hour streaming burn-in tests in staging environment.

---
**Status**: **70% Academic Phase Scope Fully Implemented & Validated**
