# EnergyIQ — Milestone 6 Baseline Audit

This document establishes the verified baseline for **EnergyIQ** at the start of **Milestone 6 (Real Deployment, Security Verification & Final Productization)**.

## 1. Subsystem Capability Inventory

| Subsystem / Capability | Implemented | Tested | Deployment-Ready | Limitation / Note | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Authentication (JWT)** | YES | YES | YES | Secret verification in production mode enforced | **VERIFIED** |
| **Role-Based Access (RBAC)** | YES | YES | YES | 3 canonical roles: ADMIN, OPERATOR, ENGINEER | **VERIFIED** |
| **Dashboard & Telemetry** | YES | YES | YES | 60-day hourly synthetic dataset with microgrid metrics | **VERIFIED** |
| **Isolation Forest Anomaly Engine**| YES | YES | YES | Context-aware baseline + quantile thresholds | **VERIFIED** |
| **Fault-Linking Engine** | YES | YES | YES | 10 canonical fault categories mapped to telemetry evidence | **VERIFIED** |
| **Maintenance Work Orders** | YES | YES | YES | Full CRUD persistence linked to equipment and alerts | **VERIFIED** |
| **Model Registry & Rollback** | YES | YES | YES | Engine activation & atomic rollback API active | **VERIFIED** |
| **Model Drift Monitoring** | YES | YES | YES | Population Stability Index (PSI) metrics computed | **VERIFIED** |
| **Telemetry Streaming Engine** | YES | YES | YES | 10 degradation scenarios over WebSocket | **VERIFIED** |
| **Benchmark Evaluation Adapter** | YES | YES | YES | Synthetic ground truth & ASHRAE public fixture adapter | **VERIFIED** |
| **Data Quality & Imputation** | YES | YES | YES | Completeness calculation & forward-fill imputation | **VERIFIED** |
| **Data Export Service** | YES | YES | YES | CSV and JSON operational data export endpoints | **VERIFIED** |
| **Health Readiness Probe** | YES | YES | YES | `/api/system/readiness` for container orchestrator | **VERIFIED** |
| **Docker Containerization** | YES | YES | YES | Backend (Python 3.13) + Frontend (Nginx 1.25 multi-stage) | **VERIFIED** |
| **Nginx Reverse Proxy** | YES | YES | YES | Reverse proxy for REST `/api/` & WebSocket upgrade | **VERIFIED** |
| **Database Migration Pathway** | YES | YES | YES | SQLite active with documented PostgreSQL migration | **VERIFIED** |
| **CI/CD Pipeline** | YES | YES | YES | GitHub Actions `.github/workflows/ci.yml` configured | **VERIFIED** |
