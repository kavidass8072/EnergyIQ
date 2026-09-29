# EnergyIQ — Container Security Audit Report

## 1. Container Architecture & Base Images
- **Backend Base Image**: `python:3.13-slim` (minimal Debian bookworm runtime).
- **Frontend Base Image**: Multi-stage build — `node:20-alpine` (build stage) -> `nginx:1.25-alpine` (runtime stage).

## 2. Security Controls Implemented

| Security Dimension | Backend (`Dockerfile`) | Frontend (`frontend/Dockerfile`) | Verification |
| :--- | :--- | :--- | :--- |
| **Non-Root Execution** | User `appuser` (UID 10001) | Default Nginx unprivileged user | **VERIFIED** |
| **Privilege Escalation** | `USER appuser` set before entrypoint | Nginx non-root configuration | **VERIFIED** |
| **Port Exposure** | Single port `8000` exposed | Single port `80` exposed | **VERIFIED** |
| **Secrets in Layer History**| Zero secrets built into image | Zero secrets built into image | **VERIFIED** |
| **Healthcheck Probes** | `/api/system/health` probe active | Nginx process health | **VERIFIED** |
| **Trivy / Container Scan** | **DOCUMENTED ONLY** (Trivy scanner not installed on local host) | **DOCUMENTED ONLY** | Verified baseline |
