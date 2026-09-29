# 📡 EnergyIQ Real-Time Streaming & WebSocket Architecture

## 1. Overview
EnergyIQ features a local, standalone real-time streaming telemetry simulator that broadcasts microgrid telemetry events over WebSockets (`ws://localhost:8000/api/streaming/ws`) without requiring cloud brokers.

---

## 2. Streaming Processing Pipeline

```text
Synthetic Tick Generator / Telemetry Simulator
                     │
                     ▼
          Telemetry Validation (Range & Schema)
                     │
                     ▼
             SQLite Persistence (telemetry)
                     │
                     ▼
    Feature Engineering & Baseline Calculation
                     │
                     ▼
     Real-Time Anomaly Detection & Fault Linking
                     │
                     ▼
     Alert Deduplication (5-min Cooldown)
                     │
                     ▼
       WebSocket Broadcast to Connected Clients
```

---

## 3. WebSocket Event Schema

```json
{
  "type": "TELEMETRY_TICK",
  "data": {
    "timestamp": "2026-09-29 19:30:00",
    "equipment_id": "HVAC-01",
    "equipment_type": "HVAC",
    "energy_kwh": 42.5,
    "operating_state": "ON",
    "production_output": 82.0,
    "temperature": 28.5
  },
  "alert": null,
  "stats": {
    "is_running": true,
    "events_per_sec": 3.5,
    "connected_clients": 1
  }
}
```
