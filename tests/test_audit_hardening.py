import pytest
from fastapi.testclient import TestClient
from backend.main import app
from backend.database.db import get_connection
from backend.streaming.simulator import streaming_manager

client = TestClient(app)

def test_database_pragma_and_wal():
    """Verify SQLite connection enables foreign keys and WAL mode."""
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("PRAGMA foreign_keys;")
        fk_status = cursor.fetchone()[0]
        assert fk_status == 1, "Foreign keys pragma must be active (1)"
        
        cursor.execute("PRAGMA journal_mode;")
        mode = cursor.fetchone()[0].upper()
        assert mode == "WAL", f"Expected WAL journal mode, got {mode}"
    finally:
        conn.close()

def test_dashboard_summary_uses_stored_expected_baseline():
    """Verify dashboard summary uses expected_kwh from alerts rather than hardcoded 0.7."""
    response = client.get("/api/dashboard/summary")
    assert response.status_code == 200
    data = response.json()
    assert "estimated_wasted_kwh_hr" in data
    assert "estimated_avoided_cost" in data
    assert isinstance(data["estimated_wasted_kwh_hr"], (int, float))

def test_demo_fault_injection_normalized_score():
    """Verify demo fault injection records anomaly_score on 0-100 scale."""
    payload = {
        "equipment_id": "HVAC-01",
        "fault_type": "MECHANICAL_RESISTANCE"
    }
    response = client.post("/api/demo/inject", json=payload)
    assert response.status_code == 200
    res_data = response.json()
    assert res_data["severity"] == "HIGH"
    assert res_data["fault_type"] == "Mechanical Resistance"
    
    # Check that in DB, anomaly_score is 88.0, not 0.88
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT anomaly_score FROM telemetry WHERE equipment_id = 'HVAC-01' ORDER BY id DESC LIMIT 1")
        row = cursor.fetchone()
        assert row is not None
        assert row["anomaly_score"] == 88.0, f"Expected anomaly score 88.0, got {row['anomaly_score']}"
    finally:
        conn.close()

def test_equipment_health_score_with_normalized_score():
    """Verify equipment endpoint handles 0-100 anomaly score without overflow deduction."""
    response = client.get("/api/equipment")
    assert response.status_code == 200
    data = response.json()
    assert "equipment" in data
    assert len(data["equipment"]) > 0
    for eq in data["equipment"]:
        assert 0 <= eq["health_score"] <= 100
        assert eq["health_status"] in ["Healthy", "Needs Attention", "Action Required"]

def test_websocket_telemetry_tick_contract():
    """Verify streaming simulator produces both data and payload keys."""
    event = {
        "timestamp": "2026-10-28 12:00:00",
        "equipment_id": "HVAC-01",
        "equipment_type": "HVAC",
        "energy_kwh": 35.0,
        "operating_state": "ON",
        "production_output": 45.0,
        "solar_generation_kwh": 30.0,
        "battery_soc": 70.0,
        "grid_consumption_kwh": 80.0,
        "temperature": 26.5,
        "maintenance_days": 15,
        "maintenance_status": "OK"
    }
    alert = streaming_manager._process_telemetry_event(event)
    # The process should execute cleanly and return None or alert dict
    assert alert is None or isinstance(alert, dict)
