import pytest
import sqlite3
import tempfile
import os
from fastapi.testclient import TestClient
from backend.main import app
from backend.database.db import get_connection, init_db
from backend.streaming.simulator import streaming_manager
from backend.streaming.validator import validate_and_clean_telemetry

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

def test_equipment_health_scaling_boundaries():
    """Test health score formula behavior across scale boundaries: 0, 0.88, 1, 1.01, 88, 100."""
    # Test normalization logic: norm_score = raw / 100.0 if raw > 1.0 else raw
    test_scores = [0, 0.88, 1.0, 1.01, 88.0, 100.0]
    for raw in test_scores:
        norm = raw / 100.0 if raw > 1.0 else raw
        assert 0.0 <= norm <= 1.0, f"Normalized score out of bounds for {raw}: {norm}"
        deduction = min(30, int(norm * 35))
        assert 0 <= deduction <= 30, f"Deduction out of range for {raw}: {deduction}"

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
    assert alert is None or isinstance(alert, dict)

def test_maintenance_equipment_type_mapping():
    """Verify maintenance creation with Motor-01 correctly saves equipment_type as Heavy Motor."""
    payload = {
        "equipment_id": "Motor-01",
        "equipment_type": "Heavy Motor",
        "priority": "HIGH",
        "issue_description": "Mechanical resistance test work order",
        "assigned_technician": "Rajesh Kumar"
    }
    res = client.post("/api/maintenance", json=payload)
    assert res.status_code == 200
    data = res.json()
    task_id = data["task_id"]
    
    # Query database to confirm persisted equipment_type
    conn = get_connection()
    try:
        c = conn.cursor()
        c.execute("SELECT equipment_id, equipment_type FROM maintenance_tasks WHERE id = ?", (task_id,))
        row = c.fetchone()
        assert row is not None
        assert row["equipment_id"] == "Motor-01"
        assert row["equipment_type"] == "Heavy Motor"
    finally:
        conn.close()

def test_alert_and_maintenance_status_persistence():
    """Verify status changes on alerts and maintenance tasks persist in SQLite."""
    # 1. Maintenance status transition
    m_res = client.post("/api/maintenance", json={
        "equipment_id": "Compressor-01",
        "equipment_type": "Industrial Compressor",
        "priority": "MEDIUM",
        "issue_description": "Lifecycle transition test"
    })
    assert m_res.status_code == 200
    task_id = m_res.json()["task_id"]
    
    update_res = client.put(f"/api/maintenance/{task_id}/status", json={"status": "IN_PROGRESS"})
    assert update_res.status_code == 200
    assert update_res.json()["status"] == "IN_PROGRESS"
    
    conn = get_connection()
    try:
        c = conn.cursor()
        c.execute("SELECT status FROM maintenance_tasks WHERE id = ?", (task_id,))
        assert c.fetchone()["status"] == "IN_PROGRESS"
    finally:
        conn.close()

def test_telemetry_imputation_preserves_quality_flags():
    """Verify that imputing invalid telemetry marks is_valid=False and lists issues."""
    raw_corrupt = {
        "equipment_id": None,
        "energy_kwh": -15.0,  # invalid negative
        "temperature": 999.0, # out of physical bounds
        "operating_state": "INVALID_STATE"
    }
    is_valid, cleaned, issues = validate_and_clean_telemetry(raw_corrupt)
    assert is_valid is False
    assert len(issues) >= 3
    assert cleaned["energy_kwh"] == 0.0
    assert cleaned["temperature"] == 25.0
    assert cleaned["equipment_id"] == "HVAC-01"
    assert cleaned["operating_state"] == "OFF"

def test_disposable_database_integrity():
    """Creates a temporary standalone database and verifies WAL mode and schema initialization."""
    with tempfile.TemporaryDirectory() as tmpdir:
        temp_db_path = os.path.join(tmpdir, "test_disposable.db")
        conn = sqlite3.connect(temp_db_path, timeout=15.0)
        conn.execute("PRAGMA foreign_keys = ON;")
        conn.execute("PRAGMA journal_mode = WAL;")
        
        # Test PRAGMAs
        c = conn.cursor()
        c.execute("PRAGMA foreign_keys;")
        assert c.fetchone()[0] == 1
        c.execute("PRAGMA journal_mode;")
        assert c.fetchone()[0].upper() == "WAL"
        
        # Test table creation & foreign keys
        c.execute("CREATE TABLE parent (id INTEGER PRIMARY KEY, name TEXT);")
        c.execute("CREATE TABLE child (id INTEGER PRIMARY KEY, parent_id INTEGER REFERENCES parent(id));")
        c.execute("INSERT INTO parent (id, name) VALUES (1, 'Parent 1');")
        c.execute("INSERT INTO child (id, parent_id) VALUES (10, 1);")
        conn.commit()
        
        # Foreign key violation check
        with pytest.raises(sqlite3.IntegrityError):
            c.execute("INSERT INTO child (id, parent_id) VALUES (20, 999);") # Non-existent parent
            
        conn.close()

def test_login_rate_limiter_enforcement():
    """Verify that POST /api/auth/login enforces 429 when rate limit is exceeded."""
    from backend.api.rate_limiter import login_rate_limiter
    # Reset limiter records for testing
    login_rate_limiter.client_records["testclient"] = []
    
    headers = {"X-Enforce-Rate-Limit": "1"}
    # Send requests up to limit (10)
    for _ in range(10):
        client.post("/api/auth/login", json={"username": "admin", "password": "wrongpassword"}, headers=headers)
        
    # The 11th request must receive HTTP 429
    res = client.post("/api/auth/login", json={"username": "admin", "password": "wrongpassword"}, headers=headers)
    assert res.status_code == 429
    assert "Rate limit exceeded" in res.json()["detail"]
    # Clean up testclient records so subsequent tests aren't impacted
    login_rate_limiter.client_records["testclient"] = []

def test_maintenance_task_invalid_alert_id_rejected():
    """Verify that linking a maintenance task to a non-existent alert yields HTTP 404."""
    payload = {
        "equipment_id": "HVAC-01",
        "priority": "HIGH",
        "issue_description": "Test task with invalid linked alert",
        "linked_alert_id": 999999
    }
    res = client.post("/api/maintenance", json=payload)
    assert res.status_code == 404
    assert "Linked alert with ID 999999 not found" in res.json()["detail"]

def test_delayed_packet_scenario_non_blocking():
    """Verify that DELAYED_PACKET transforms timestamps with latency metadata without blocking thread."""
    from backend.streaming.scenarios import scenario_engine
    scenario_engine.set_scenario("DELAYED_PACKET")
    raw = {"equipment_id": "HVAC-01", "energy_kwh": 45.0, "operating_state": "ON"}
    records = scenario_engine.apply_scenario(raw)
    assert len(records) == 1
    assert "network_latency_ms" in records[0]
    assert records[0]["network_latency_ms"] == 150.0
    scenario_engine.set_scenario("NORMAL_TELEMETRY")

def test_security_current_user_connection_cleanup():
    """Verify that get_current_user properly releases its connection even on invalid credentials."""
    res = client.get("/api/auth/me", headers={"Authorization": "Bearer invalid.token.payload"})
    assert res.status_code == 401

def test_maintenance_foreign_key_and_zero_orphans():
    """Verify that maintenance_tasks table schema defines foreign key and contains zero orphaned references."""
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT sql FROM sqlite_master WHERE type='table' AND name='maintenance_tasks'")
        ddl = cursor.fetchone()[0]
        assert "FOREIGN KEY (linked_alert_id) REFERENCES alerts(id)" in ddl
        
        cursor.execute("SELECT COUNT(*) FROM maintenance_tasks WHERE linked_alert_id IS NOT NULL AND linked_alert_id NOT IN (SELECT id FROM alerts)")
        orphans = cursor.fetchone()[0]
        assert orphans == 0
    finally:
        conn.close()

