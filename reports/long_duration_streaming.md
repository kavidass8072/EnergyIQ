# EnergyIQ — Long-Duration & High-Throughput Streaming Report

## 1. Overview
The EnergyIQ streaming ingestion pipeline validates telemetry frames via `StreamingValidator` (`backend/streaming/validator.py`), checks 10 degradation scenarios (`backend/streaming/scenarios.py`), and dispatches ticks via WebSocket to connected frontend clients.

## 2. Ingestion Benchmark Results

| Target Throughput (EPS) | Batch Count | Total Duration (s) | Measured Throughput (EPS) | Avg Ingestion Latency | Frame Drop Rate | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **10 EPS** | 20 events | 0.0001 s | 273,972 EPS | 0.0037 ms/event | 0.0% | **PASS** |
| **50 EPS** | 100 events | 0.0002 s | 448,430 EPS | 0.0022 ms/event | 0.0% | **PASS** |
| **100 EPS** | 200 events | 0.0004 s | 468,603 EPS | 0.0021 ms/event | 0.0% | **PASS** |
| **250 EPS** | 500 events | 0.0011 s | 466,809 EPS | 0.0021 ms/event | 0.0% | **PASS** |
| **500 EPS** | 1000 events | 0.0022 s | 460,002 EPS | 0.0022 ms/event | 0.0% | **PASS** |

## 3. Long-Duration Stability Note
- **24-Hour Continuous Live Soak Test**: **LONG_DURATION_SOAK = NOT EXECUTED** (Local test environment executed high-throughput burst loads up to 1,000 events; 24-hour continuous burn-in is documented for staging environment deployment).
