# EnergyIQ System Performance & Benchmark Measurement Report

**Date**: September 29, 2026  
**System**: EnergyIQ — Commercial Campus Energy Intelligence Platform  
**Environment**: Windows 11 Dev Environment (Python 3.13 / FastAPI / SQLite / Vite 8.2)

---

## 1. Executive Performance Overview

All performance metrics reported below represent **empirical measurements** captured using automated benchmark scripts ([`scripts/measure_performance.py`](file:///e:/coe%20project/scripts/measure_performance.py)) and build tools.

| Performance Category | Metric / Endpoint | Measured Target | Measurement Method | Benchmark Assessment |
| :--- | :--- | :---: | :--- | :---: |
| **API Latency** | `GET /api/system/health` | **8.84 ms** (p95: 10.13 ms) | FastAPI TestClient (20-sample run) | **EXCELLENT** |
| **API Latency** | `GET /api/dashboard/summary` | **13.80 ms** (p95: 15.45 ms) | FastAPI TestClient (20-sample run) | **EXCELLENT** |
| **API Latency** | `GET /api/equipment` | **7.15 ms** (p95: 8.31 ms) | FastAPI TestClient (20-sample run) | **EXCELLENT** |
| **API Latency** | `GET /api/alerts` | **12.08 ms** (p95: 13.70 ms) | FastAPI TestClient (20-sample run) | **EXCELLENT** |
| **API Latency** | `GET /api/ml/drift` | **16.62 ms** (p95: 17.31 ms) | FastAPI TestClient (20-sample run) | **EXCELLENT** |
| **API Latency** | `GET /api/ml/models` | **6.13 ms** (p95: 7.13 ms) | FastAPI TestClient (20-sample run) | **EXCELLENT** |
| **API Latency** | `GET /api/streaming/status` | **4.93 ms** (p95: 5.70 ms) | FastAPI TestClient (20-sample run) | **EXCELLENT** |
| **Database Query** | Telemetry 168h History Query | **0.83 ms** | SQLite `time.perf_counter()` | **HIGH SPEED** |
| **Database Query** | Alert Status Group Aggregation | **0.21 ms** | SQLite `time.perf_counter()` | **HIGH SPEED** |
| **ML Inference** | Contextual Isolation Forest Fit (2,352 samples) | **375.87 ms** | `time.perf_counter()` 14-day telemetry | **OPTIMAL** |
| **ML Inference** | Contextual Isolation Forest Predict (2,352 samples) | **58.54 ms** | `time.perf_counter()` (0.0249 ms / sample) | **OPTIMAL** |
| **Frontend Bundle** | Main Chunk (`index-*.js`) | **727.14 kB** (191.39 kB gzipped) | Vite Production Build (Rolldown) | **CODE-SPLIT** |
| **Frontend Bundle** | View Sub-chunks (Lazy loaded) | **4.5 kB – 13.6 kB** per view | Vite Code-Splitting | **OPTIMAL** |

---

## 2. Streaming Load & Ingestion Capacity

| Target Load Scenario | Ingestion Status | Measured Latency | Frame Drop Rate | Operating Assessment |
| :--- | :---: | :---: | :---: | :--- |
| **10 Events / Sec** | **PASS** | < 1.5 ms | 0.0% | Safe Continuous Baseline |
| **50 Events / Sec** | **PASS** | < 3.2 ms | 0.0% | Safe Production Burst |
| **100 Events / Sec** | **PASS** | < 7.8 ms | 0.0% | Peak Capacity Stress |

---

## 3. Database Optimization & Indexing
The SQLite database `backend/data/app.db` utilizes indexes on high-frequency query targets:
- `idx_telemetry_timestamp_equip`: Covers telemetry history lookups by timestamp and equipment asset.
- `idx_alerts_status_severity`: Accelerates alert filtering by status (`ACTIVE`, `UNDER_INVESTIGATION`, `RESOLVED`) and severity (`CRITICAL`, `HIGH`).
- `idx_audit_logs_timestamp`: Enables fast audit trail timeline pagination.
