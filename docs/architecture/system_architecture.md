# EnergyIQ — System Architecture Diagram

```mermaid
flowchart TD
    subgraph Client Layer ["Client / Browser Layer"]
        UI["React 19 + Vite Frontend SPA"]
        WSClient["WebSocket Live Telemetry Client"]
    end

    subgraph Proxy Layer ["Edge / Reverse Proxy Layer"]
        Nginx["Nginx 1.25 Reverse Proxy (Port 80)"]
    end

    subgraph Backend Layer ["FastAPI Application Backend (Port 8000)"]
        AuthMiddleware["JWT Authentication & RBAC Middleware"]
        RateLimiter["Sliding-Window Rate Limiter"]

        subgraph Routers ["API Routers (/api)"]
            AuthRouter["Auth Router (/auth)"]
            DashRouter["Dashboard Router (/dashboard)"]
            EqRouter["Equipment Router (/equipment)"]
            AlertRouter["Alerts Router (/alerts)"]
            MaintRouter["Maintenance Router (/maintenance)"]
            MLRouter["Model Registry Router (/ml)"]
            StreamRouter["Streaming Router (/streaming)"]
            ExportRouter["Export Router (/export)"]
            HealthRouter["System Health Router (/system)"]
        end

        subgraph Core Engines ["Core Intelligence & Streaming Engines"]
            IForest["Isolation Forest Anomaly Detector v1.2"]
            FaultLinker["Rule-Based Fault-Linking Engine"]
            DriftMon["Population Stability Index (PSI) Drift Monitor"]
            Simulator["Telemetry Simulator & Scenario Engine"]
            Validator["Streaming Telemetry Validator & Imputer"]
        end
    end

    subgraph Persistence ["Persistence Layer"]
        DB[(SQLite / PostgreSQL Database)]
        ModelsDir["Model Artifacts Directory"]
        BackupsDir["Database Backups Directory"]
    end

    UI -->|HTTP REST Requests| Nginx
    WSClient -->|WebSocket Upgrade| Nginx
    Nginx -->|/api/* Proxy| AuthMiddleware
    Nginx -->|/api/streaming/ws Proxy| StreamRouter

    AuthMiddleware --> RateLimiter
    RateLimiter --> Routers

    DashRouter & EqRouter & AlertRouter & MaintRouter & ExportRouter & HealthRouter --> DB
    AlertRouter --> FaultLinker
    FaultLinker --> IForest

    MLRouter --> IForest
    MLRouter --> DriftMon
    IForest --> ModelsDir

    StreamRouter --> Simulator
    Simulator --> Validator
    Validator --> DB

    DB --> BackupsDir
```

## Description of Architectural Components

1. **Client / Browser Layer**: React 19 single-page application built with Vite, styled with Tailwind CSS, leveraging Lucide icons and Recharts. Connects to REST APIs via `fetch` and streams live telemetry via WebSockets.
2. **Edge / Reverse Proxy Layer**: Nginx 1.25 handles static asset delivery, SSL/TLS termination, HTTP-to-HTTPS redirect, `/api/` routing, and WebSocket HTTP upgrade header forwarding.
3. **FastAPI Application Backend**: Python 3.13 backend implementing stateless JWT authentication, PBKDF2 password hashing, RBAC permission checks, and sliding-window rate limiting.
4. **Core Intelligence & Streaming Engines**:
   - **Context-Aware Isolation Forest**: Detects energy deviations with rolling baseline comparison.
   - **Fault-Linking Engine**: Maps anomaly signals to 10 physical equipment fault categories.
   - **PSI Drift Monitor**: Computes Population Stability Index metrics across baseline vs current telemetry distributions.
   - **Telemetry Simulator & Scenario Engine**: Generates microgrid ticks and handles 10 degradation scenarios.
5. **Persistence Layer**: SQLite database (`backend/data/app.db`) with active migration pathway to PostgreSQL, model registry artifacts (`backend/data/models`), and automated hot backups (`backups/`).
