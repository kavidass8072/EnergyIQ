# 🗄️ EnergyIQ Database Schema Documentation

EnergyIQ uses an embedded relational SQLite database (`backend/data/app.db`) for lightweight local persistence and fast sub-millisecond query performance, with an active migration pathway to PostgreSQL via `DATABASE_URL`.

---

## 1. Entity-Relationship Overview

```
 ┌───────────────┐        1:N        ┌───────────────┐
 │     Users     ├──────────────────►│  Audit Logs   │
 └───────┬───────┘                   └───────────────┘
         │ 1:N
         ▼
 ┌───────────────┐        1:N        ┌───────────────┐
 │   Equipment   ├──────────────────►│   Telemetry   │
 └───────┬───────┘                   └───────────────┘
         │ 1:N
         ▼
 ┌───────────────┐        1:N        ┌───────────────────┐
 │    Alerts     ├──────────────────►│ Maintenance Tasks │
 └───────────────┘                   └───────────────────┘

 ┌───────────────┐        1:N        ┌───────────────┐
 │   ML Models   ├──────────────────►│  Drift Logs   │
 └───────────────┘                   └───────────────┘
```

---

## 2. Table Specifications

### 2.1 Table: `users`
- **Purpose**: System user accounts, credentials, and RBAC roles.
- **Primary Key**: `id` (INTEGER AUTOINCREMENT)
- **Columns**:
  - `id`: `INTEGER PRIMARY KEY AUTOINCREMENT`
  - `username`: `TEXT UNIQUE NOT NULL` — Unique account handle
  - `password_hash`: `TEXT NOT NULL` — PBKDF2-HMAC-SHA256 hashed password with 16-byte random salt
  - `role`: `TEXT NOT NULL` — Role enum (`ADMIN`, `FACILITY_OPERATOR`, `TECHNICAL_ENGINEER`)
  - `active_status`: `INTEGER NOT NULL DEFAULT 1` — Active status flag (1 = active, 0 = disabled)
  - `created_at`: `TEXT NOT NULL` — Creation ISO timestamp
  - `last_login`: `TEXT` — Last authentication ISO timestamp

### 2.2 Table: `telemetry`
- **Purpose**: Hourly and streaming energy consumption telemetry across 7 building assets.
- **Primary Key**: `id` (INTEGER AUTOINCREMENT)
- **Indexes**: `idx_telemetry_timestamp` on `timestamp`, `idx_telemetry_equipment_id` on `equipment_id`
- **Columns**:
  - `id`: `INTEGER PRIMARY KEY AUTOINCREMENT`
  - `timestamp`: `TEXT NOT NULL` — Telemetry timestamp (`YYYY-MM-DD HH:MM:SS`)
  - `equipment_id`: `TEXT NOT NULL` — Asset identifier (`HVAC-01`, `Motor-01`, etc.)
  - `equipment_type`: `TEXT NOT NULL` — Equipment category (`HVAC`, `Motor`, `Chiller`, `Transformer`, `AHU`, `Lighting`, `Elevator`)
  - `energy_kwh`: `REAL NOT NULL` — Energy consumption in kilowatt-hours
  - `operating_state`: `TEXT NOT NULL` — Operating state (`ON`, `OFF`, `DEGRADED`)
  - `production_output`: `REAL NOT NULL` — Production context output units
  - `solar_generation_kwh`: `REAL NOT NULL` — Solar generation in kWh
  - `battery_soc`: `REAL NOT NULL` — Battery state of charge percentage (0–100%)
  - `grid_consumption_kwh`: `REAL NOT NULL` — Grid import consumption in kWh
  - `temperature`: `REAL NOT NULL` — Operating temperature in °C
  - `maintenance_days`: `INTEGER NOT NULL` — Days elapsed since last maintenance
  - `maintenance_status`: `TEXT NOT NULL` — Maintenance state (`OK`, `DUE`, `OVERDUE`)
  - `is_anomaly`: `INTEGER NOT NULL` — Synthetic ground truth anomaly flag (0 or 1)
  - `fault_label`: `TEXT NOT NULL` — Assigned fault label string
  - `anomaly_score`: `REAL` — Isolation Forest decision score (0.0–1.0)
  - `severity`: `TEXT` — Severity tier (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`)

### 2.3 Table: `alerts`
- **Purpose**: Anomaly alert inbox, severity classification, and review status.
- **Primary Key**: `id` (INTEGER AUTOINCREMENT)
- **Indexes**: `idx_alerts_status` on `status`, `idx_alerts_equipment_id` on `equipment_id`, `idx_alerts_severity` on `severity`
- **Columns**:
  - `id`: `INTEGER PRIMARY KEY AUTOINCREMENT`
  - `timestamp`: `TEXT NOT NULL` — Detection timestamp
  - `equipment_id`: `TEXT NOT NULL` — Linked asset ID
  - `equipment_type`: `TEXT NOT NULL` — Linked asset category
  - `severity`: `TEXT NOT NULL` — Severity level (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`)
  - `energy_kwh`: `REAL NOT NULL` — Observed energy consumption
  - `expected_kwh`: `REAL NOT NULL` — Contextual baseline expected energy
  - `dev_pct`: `REAL NOT NULL` — Percentage deviation from baseline
  - `operating_state`: `TEXT NOT NULL` — Operating state during anomaly
  - `production_output`: `REAL NOT NULL` — Production context output
  - `maintenance_days`: `INTEGER NOT NULL` — Days elapsed since last maintenance
  - `likely_fault`: `TEXT NOT NULL` — Physical fault category string
  - `fault_confidence`: `REAL NOT NULL` — Fault linkage confidence score (0.0–1.0)
  - `evidence_json`: `TEXT NOT NULL` — Serialized JSON object containing physical evidence telemetry
  - `recommended_action`: `TEXT NOT NULL` — Recommended corrective maintenance action
  - `status`: `TEXT NOT NULL DEFAULT 'ACTIVE'` — Review status (`ACTIVE`, `UNDER_INVESTIGATION`, `RESOLVED`, `FALSE_POSITIVE`)

### 2.4 Table: `maintenance_tasks`
- **Purpose**: Work order scheduling and predictive task management.
- **Primary Key**: `id` (INTEGER AUTOINCREMENT)
- **Indexes**: `idx_maintenance_status` on `status`
- **Columns**:
  - `id`: `INTEGER PRIMARY KEY AUTOINCREMENT`
  - `timestamp`: `TEXT NOT NULL` — Creation timestamp
  - `equipment_id`: `TEXT NOT NULL` — Linked equipment asset
  - `equipment_type`: `TEXT NOT NULL` — Asset category
  - `priority`: `TEXT NOT NULL` — Work order priority (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`)
  - `issue_description`: `TEXT NOT NULL` — Problem description and diagnostic notes
  - `linked_alert_id`: `INTEGER` — Foreign key link to `alerts.id`
  - `status`: `TEXT NOT NULL DEFAULT 'UPCOMING'` — Task status (`UPCOMING`, `IN_PROGRESS`, `COMPLETED`)
  - `assigned_technician`: `TEXT NOT NULL` — Assigned technician name
  - `created_at`: `TEXT NOT NULL` — Creation ISO timestamp
  - `due_date`: `TEXT NOT NULL` — Target completion date

### 2.5 Table: `ml_models`
- **Purpose**: ML Model Registry managing deployed anomaly detection engines.
- **Primary Key**: `model_id` (TEXT PRIMARY KEY)
- **Indexes**: `idx_ml_models_active` on `active`
- **Columns**:
  - `model_id`: `TEXT PRIMARY KEY` — Unique model string identifier (`mod-cif-v120`, `mod-zscore-v100`, `mod-lof-v090`)
  - `model_name`: `TEXT NOT NULL` — Human readable model name
  - `model_type`: `TEXT NOT NULL` — Algorithm type (`IsolationForest`, `QuantileBaseline`, `LOF`)
  - `version`: `TEXT NOT NULL` — Semantic version string (`1.2.0`, `1.0.0`, `0.9.0`)
  - `dataset`: `TEXT NOT NULL` — Training dataset label
  - `trained_at`: `TEXT NOT NULL` — Training completion timestamp
  - `feature_set`: `TEXT NOT NULL` — Comma-separated list of feature names used
  - `parameters_json`: `TEXT NOT NULL` — Serialized JSON model hyperparameters
  - `metrics_json`: `TEXT NOT NULL` — Serialized JSON model evaluation metrics (Precision, Recall, F1)
  - `status`: `TEXT NOT NULL` — Registry status (`ACTIVE`, `REGISTERED`, `ARCHIVED`)
  - `active`: `INTEGER NOT NULL DEFAULT 0` — Active production model flag (1 = active, 0 = inactive)
  - `created_at`: `TEXT NOT NULL` — Registration timestamp

### 2.6 Table: `drift_logs`
- **Purpose**: Population Stability Index (PSI) drift tracking.
- **Primary Key**: `id` (INTEGER AUTOINCREMENT)
- **Columns**:
  - `id`: `INTEGER PRIMARY KEY AUTOINCREMENT`
  - `timestamp`: `TEXT NOT NULL` — Evaluation timestamp
  - `feature_name`: `TEXT NOT NULL` — Telemetry feature name evaluated (`energy_kwh`, `temperature`, etc.)
  - `psi_score`: `REAL NOT NULL` — Population Stability Index score
  - `ks_pvalue`: `REAL NOT NULL` — Kolmogorov-Smirnov test p-value
  - `status`: `TEXT NOT NULL` — Drift severity status (`NO_DRIFT`, `MODERATE_DRIFT`, `SIGNIFICANT_DRIFT`)

### 2.7 Auxiliary Tables
- **`app_settings`**: `key TEXT PRIMARY KEY`, `value TEXT NOT NULL` — Persists global system settings.
- **`notifications`**: `id`, `timestamp`, `title`, `message`, `severity`, `read_status`, `target_role` — Manages real-time UI alerts.
- **`audit_logs`**: `id`, `timestamp`, `user_id`, `username`, `action`, `resource`, `details_json` — Tracks administrative audit logs.
- **`data_quality_logs`**: `id`, `timestamp`, `completeness_pct`, `null_rate_pct`, `duplicate_rate_pct`, `status` — Tracks telemetry completeness.
