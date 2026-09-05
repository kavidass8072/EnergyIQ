# 🌐 EnergyIQ API Reference Documentation

Base URL: `http://localhost:8000/api`

---

## 1. Dashboard Endpoints

### `GET /api/dashboard/summary`
Returns executive KPI metrics, dynamic system status, and microgrid power snapshot.

**Response Example**:
```json
{
  "total_equipment": 7,
  "active_alerts": 12,
  "high_priority_alerts": 3,
  "critical_alerts": 1,
  "system_status": "DEGRADED",
  "system_status_label": "● System Degraded (Critical Alert Active)",
  "estimated_wasted_kwh_hr": 142.5,
  "estimated_avoided_cost": 106100,
  "currency": "₹",
  "data_quality": {
    "telemetry_completeness": 98.7,
    "imputed_percentage": 0.8,
    "outlier_noise_percentage": 0.5,
    "total_telemetry_records": 10080
  },
  "microgrid": {
    "solar_generation_kwh": 45.0,
    "battery_soc_pct": 65.0,
    "grid_consumption_kwh": 120.0,
    "total_campus_load_kwh": 180.0
  }
}
```

---

### `GET /api/dashboard/data-quality`
Returns telemetry quality completeness, imputation %, and outlier noise %.

---

### `GET /api/dashboard/power-flow?hours=48`
Returns historical solar, battery, grid, and campus load telemetry vectors.

---

## 2. Equipment Endpoints

### `GET /api/equipment`
Returns monitored equipment inventory with health score (0-100), active fault, and severity.

---

### `GET /api/equipment/{equipment_id}/history?hours=72`
Returns hourly energy draw, baseline expected energy, and state history.

---

## 3. Alert Endpoints

### `GET /api/alerts?status={status}&severity={severity}&equipment_id={id}`
Returns alert inbox filtered by status or severity.

---

### `POST /api/alerts/{alert_id}/review`
Updates alert review status (`ACTIVE`, `UNDER_INVESTIGATION`, `REVIEWED`, `RESOLVED`, `FALSE_POSITIVE`).

---

## 4. Maintenance Endpoints

### `GET /api/maintenance`
Returns maintenance tasks categorized into upcoming, overdue, completed, and AI predictive insights.

---

### `POST /api/maintenance`
Creates a new maintenance task.

---

### `PUT /api/maintenance/{task_id}/status`
Updates work order status (`UPCOMING`, `IN_PROGRESS`, `COMPLETED`, `OVERDUE`).

---

## 5. Evaluation & Edge Cases Endpoints

### `GET /api/evaluation/compare`
Returns baseline (rolling Z-score) vs proposed (Contextual Isolation Forest) model evaluation metrics, targets, and cost impact simulations.

---

### `GET /api/edge-cases/run`
Executes automated test runner for all 7 stress test scenarios (Cases A through G).

---

## 6. Demo Control Endpoints

### `POST /api/demo/inject`
Injects controlled fault telemetry (`MECHANICAL_RESISTANCE`, `STANDBY_LEAKAGE`, `PRODUCTION_ANOMALY`, `ELECTRICAL_SPIKE`) for an asset, re-runs ML detection & fault linking, and inserts alert.

---

### `POST /api/demo/reset`
Reseeds SQLite dataset to default baseline state.

---

## 7. System Settings & Search Endpoints

### `GET /api/settings` & `POST /api/settings`
Gets and saves system settings (tariff rate, Z-score thresholds, refresh rate).

---

### `GET /api/search?q={query}`
Global search across equipment, alerts, faults, and maintenance work orders.
