# 🗄️ EnergyIQ Database Schema & Data Model Documentation

## 1. Database Specifications
- **Database Engine**: SQLite 3
- **File Location**: `backend/data/app.db`
- **Tables**: `telemetry`, `alerts`, `maintenance_tasks`, `app_settings`

---

## 2. Entity Relationship & Schema Definitions

### Table: `telemetry`
Stores hourly historical telemetry observations and model anomaly scores.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | INTEGER | PRIMARY KEY AUTOINCREMENT | Record unique ID |
| `timestamp` | TEXT | NOT NULL | Observation timestamp (`YYYY-MM-DD HH:MM:SS`) |
| `equipment_id` | TEXT | NOT NULL | Monitored asset identifier (e.g. `Motor-01`) |
| `equipment_type` | TEXT | NOT NULL | Asset type (`Motor`, `Pump`, `HVAC`, etc) |
| `energy_kwh` | REAL | NOT NULL | Measured active power draw in kWh |
| `operating_state` | TEXT | NOT NULL | State (`ON`, `OFF`, `IDLE`) |
| `production_output` | REAL | NOT NULL | Output rate in units/hr |
| `solar_generation_kwh` | REAL | NOT NULL | Microgrid solar generation in kWh |
| `battery_soc` | REAL | NOT NULL | Battery storage State of Charge % |
| `grid_consumption_kwh` | REAL | NOT NULL | Utility grid power import in kWh |
| `temperature` | REAL | NOT NULL | Asset operating temperature °C |
| `maintenance_days` | INTEGER | NOT NULL | Days elapsed since last maintenance |
| `maintenance_status` | TEXT | NOT NULL | Servicing status (`OK`, `NEEDS_INSPECTION`) |
| `is_anomaly` | INTEGER | NOT NULL | Model anomaly flag (0 = Normal, 1 = Anomaly) |
| `fault_label` | TEXT | NOT NULL | Fault category name |
| `anomaly_score` | REAL | NULL | Normalized model anomaly score [0.0 - 1.0] |
| `severity` | TEXT | NULL | Anomaly severity (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`) |

---

### Table: `alerts`
Stores active and historical anomaly alerts with physical evidence and resolution state.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | INTEGER | PRIMARY KEY AUTOINCREMENT | Alert ID |
| `timestamp` | TEXT | NOT NULL | Alert creation timestamp |
| `equipment_id` | TEXT | NOT NULL | Asset ID |
| `equipment_type` | TEXT | NOT NULL | Asset category |
| `severity` | TEXT | NOT NULL | `LOW`, `MEDIUM`, `HIGH`, `CRITICAL` |
| `energy_kwh` | REAL | NOT NULL | Observed active draw |
| `expected_kwh` | REAL | NOT NULL | Baseline expected draw |
| `dev_pct` | REAL | NOT NULL | Deviation percentage |
| `operating_state` | TEXT | NOT NULL | Asset state at alert time |
| `production_output` | REAL | NOT NULL | Output setpoint |
| `maintenance_days` | INTEGER | NOT NULL | Asset service age |
| `likely_fault` | TEXT | NOT NULL | Linked root cause fault name |
| `fault_confidence` | REAL | NOT NULL | Heuristic confidence % |
| `evidence_json` | TEXT | NOT NULL | JSON string array of evidence statements |
| `recommended_action` | TEXT | NOT NULL | Operator action steps |
| `status` | TEXT | NOT NULL DEFAULT 'ACTIVE' | `ACTIVE`, `UNDER_INVESTIGATION`, `REVIEWED`, `RESOLVED`, `FALSE_POSITIVE` |

---

### Table: `maintenance_tasks`
Stores work orders created manually or automatically from anomaly alerts.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | INTEGER | PRIMARY KEY AUTOINCREMENT | Work order ID |
| `timestamp` | TEXT | NOT NULL | Creation timestamp |
| `equipment_id` | TEXT | NOT NULL | Asset ID |
| `equipment_type` | TEXT | NOT NULL | Asset category |
| `priority` | TEXT | NOT NULL | Task priority (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`) |
| `issue_description` | TEXT | NOT NULL | Description of repair required |
| `linked_alert_id` | INTEGER | NULL | Linked alert reference ID |
| `status` | TEXT | NOT NULL DEFAULT 'UPCOMING' | `UPCOMING`, `IN_PROGRESS`, `COMPLETED`, `OVERDUE` |
| `assigned_technician` | TEXT | NOT NULL | Assigned maintenance staff member |
| `created_at` | TEXT | NOT NULL | Creation date |
| `due_date` | TEXT | NOT NULL | Target completion date |

---

### Table: `app_settings`
Stores persistent platform configuration key-value pairs.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `key` | TEXT | PRIMARY KEY | Setting key name |
| `value` | TEXT | NOT NULL | Setting value string |
