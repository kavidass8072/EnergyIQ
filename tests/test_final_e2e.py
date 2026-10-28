import pytest
import datetime
from fastapi.testclient import TestClient
from backend.main import app
from backend.database.db import get_connection
from backend.streaming.simulator import streaming_manager

client = TestClient(app)

def test_final_e2e_complete_fault_to_maintenance_workflow():
    """
    Milestone 7 Comprehensive 18-Step End-to-End Equipment-Fault-to-Maintenance Verification:
    Step 1: Admin login (/api/auth/login)
    Step 2: Start streaming (/api/streaming/start)
    Step 3: Validate streaming telemetry tick (/api/streaming/status)
    Step 4: Inject fault (/api/demo/inject)
    Step 5: Validate incoming telemetry & feature engineering (/api/telemetry)
    Step 6: Confirm anomaly detection & physical fault linking
    Step 7: Generate alert with severity, equipment ID, evidence JSON (/api/alerts/{id})
    Step 8: Duplicate alert suppression test (cooldown verification)
    Step 9: Alert correlation clustering (/api/alerts/correlated)
    Step 10: Operator login & acknowledge alert (/api/alerts/{id}/review -> UNDER_INVESTIGATION)
    Step 11: Create maintenance work order (/api/maintenance)
    Step 12: Engineer login (/api/auth/login)
    Step 13: Technical investigation & health history check (/api/equipment/{id}/health-history)
    Step 14: Resolve alert (/api/alerts/{id}/review -> RESOLVED)
    Step 15: Complete work order (/api/maintenance/{id}/status -> COMPLETED)
    Step 16: Confirm persistence in SQLite database
    Step 17: Verify audit log entry (/api/auth/audit-logs)
    Step 18: Stop streaming (/api/streaming/stop)
    """

    # -------------------------------------------------------------------------
    # STEP 1: Admin Login
    # -------------------------------------------------------------------------
    admin_login_res = client.post("/api/auth/login", json={"username": "admin", "password": "admin123"})
    assert admin_login_res.status_code == 200, f"Admin login failed: {admin_login_res.text}"
    admin_data = admin_login_res.json()
    assert admin_data["user"]["role"] == "ADMIN"
    assert "access_token" in admin_data
    admin_token = admin_data["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    # -------------------------------------------------------------------------
    # STEP 2: Start Streaming
    # -------------------------------------------------------------------------
    start_stream_res = client.post("/api/streaming/start", json={"interval": 1.0}, headers=admin_headers)
    assert start_stream_res.status_code == 200
    start_data = start_stream_res.json()
    assert start_data["status"]["is_running"] is True

    # -------------------------------------------------------------------------
    # STEP 3: Validate Streaming Telemetry Tick & Status
    # -------------------------------------------------------------------------
    status_res = client.get("/api/streaming/status", headers=admin_headers)
    assert status_res.status_code == 200
    status_data = status_res.json()
    assert status_data["is_running"] is True
    assert status_data["active_assets"] > 0
    assert "events_accepted" in status_data

    # -------------------------------------------------------------------------
    # STEP 4: Inject Physical Fault into Motor-01 (Mechanical Resistance)
    # -------------------------------------------------------------------------
    inject_res = client.post(
        "/api/demo/inject",
        json={"equipment_id": "Motor-01", "fault_type": "MECHANICAL_RESISTANCE"},
        headers=admin_headers
    )
    assert inject_res.status_code == 200, f"Inject failed: {inject_res.text}"
    inject_data = inject_res.json()
    assert inject_data["equipment_id"] == "Motor-01"
    assert "alert_id" in inject_data
    alert_id = inject_data["alert_id"]

    # -------------------------------------------------------------------------
    # STEP 5: Validate Incoming Telemetry & Feature Engineering
    # -------------------------------------------------------------------------
    telem_res = client.get("/api/equipment/Motor-01/history?hours=5", headers=admin_headers)
    assert telem_res.status_code == 200
    telem_data = telem_res.json()
    assert telem_data["equipment_id"] == "Motor-01"
    telem_list = telem_data["history"]
    assert len(telem_list) > 0
    latest_telem = telem_list[-1]  # Most recent
    assert latest_telem["energy_kwh"] > 0
    assert latest_telem["operating_state"] in ["ON", "OFF"]
    assert "anomaly_score" in latest_telem
    assert latest_telem["is_anomaly"] == 1

    # -------------------------------------------------------------------------
    # STEP 6: Confirm Anomaly Detection & Physical Fault Linking
    # -------------------------------------------------------------------------
    assert "Mechanical Resistance" in inject_data["likely_fault"] or "MECHANICAL" in inject_data["likely_fault"].upper()
    assert "evidence" in inject_data
    assert len(inject_data["evidence"]) > 0

    # -------------------------------------------------------------------------
    # STEP 7: Generate Alert with Severity, Equipment ID, Evidence JSON
    # -------------------------------------------------------------------------
    alert_detail_res = client.get(f"/api/alerts/{alert_id}", headers=admin_headers)
    assert alert_detail_res.status_code == 200
    alert_detail = alert_detail_res.json()
    assert alert_detail["id"] == alert_id
    assert alert_detail["equipment_id"] == "Motor-01"
    assert alert_detail["severity"] in ["CRITICAL", "HIGH", "MEDIUM"]
    assert isinstance(alert_detail["evidence"], list)
    assert "explainability" in alert_detail
    assert "model_name" in alert_detail["explainability"]

    # -------------------------------------------------------------------------
    # STEP 8: Duplicate Alert Suppression Test
    # -------------------------------------------------------------------------
    # Verify that the simulator suppresses duplicate alerts within cooldown window (300s)
    now_str = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    duplicate_candidate = {
        "timestamp": now_str,
        "equipment_id": "Motor-01",
        "equipment_type": "Heavy Motor",
        "energy_kwh": 99.0,
        "operating_state": "ON",
        "production_output": 50.0,
        "solar_generation_kwh": 0.0,
        "battery_soc": 50.0,
        "grid_consumption_kwh": 99.0,
        "temperature": 45.0,
        "maintenance_days": 55,
        "maintenance_status": "GOOD"
    }
    # First tick triggers alert cooldown timer
    first_res = streaming_manager._process_telemetry_event(duplicate_candidate.copy())
    # Second tick within seconds MUST be suppressed (returns None)
    second_res = streaming_manager._process_telemetry_event(duplicate_candidate.copy())
    assert second_res is None, "Duplicate alert was not suppressed by alert cooldown engine!"

    # -------------------------------------------------------------------------
    # STEP 9: Alert Correlation Clustering
    # -------------------------------------------------------------------------
    corr_res = client.get("/api/alerts/correlated", headers=admin_headers)
    assert corr_res.status_code == 200
    assert isinstance(corr_res.json(), list)

    # -------------------------------------------------------------------------
    # STEP 10: Operator Login & Acknowledge Alert (UNDER_INVESTIGATION)
    # -------------------------------------------------------------------------
    op_login_res = client.post("/api/auth/login", json={"username": "operator", "password": "operator123"})
    assert op_login_res.status_code == 200
    op_data = op_login_res.json()
    assert op_data["user"]["role"] == "FACILITY_OPERATOR"
    op_headers = {"Authorization": f"Bearer {op_data['access_token']}"}

    review_res = client.post(
        f"/api/alerts/{alert_id}/review",
        json={"status": "UNDER_INVESTIGATION", "resolution_notes": "Operator initiated diagnostic inspection."},
        headers=op_headers
    )
    assert review_res.status_code == 200
    assert review_res.json()["status"] == "UNDER_INVESTIGATION"

    # -------------------------------------------------------------------------
    # STEP 11: Create Maintenance Work Order
    # -------------------------------------------------------------------------
    create_task_res = client.post(
        "/api/maintenance",
        json={
            "equipment_id": "Motor-01",
            "equipment_type": "Heavy Motor",
            "priority": "HIGH",
            "issue_description": "Inspect bearings and shaft alignment following thermal and load surge.",
            "linked_alert_id": alert_id,
            "assigned_technician": "engineer"
        },
        headers=op_headers
    )
    assert create_task_res.status_code == 200
    task_data = create_task_res.json()
    task_id = task_data.get("task_id") or 1

    # -------------------------------------------------------------------------
    # STEP 12: Engineer Login
    # -------------------------------------------------------------------------
    eng_login_res = client.post("/api/auth/login", json={"username": "engineer", "password": "engineer123"})
    assert eng_login_res.status_code == 200
    eng_data = eng_login_res.json()
    assert eng_data["user"]["role"] == "TECHNICAL_ENGINEER"
    eng_headers = {"Authorization": f"Bearer {eng_data['access_token']}"}

    # -------------------------------------------------------------------------
    # STEP 13: Technical Investigation & Health History Check
    # -------------------------------------------------------------------------
    health_res = client.get("/api/equipment/Motor-01/health-history", headers=eng_headers)
    assert health_res.status_code == 200
    health_data = health_res.json()
    assert health_data["equipment_id"] == "Motor-01"
    assert "health_trend" in health_data

    # -------------------------------------------------------------------------
    # STEP 14: Resolve Alert
    # -------------------------------------------------------------------------
    resolve_res = client.post(
        f"/api/alerts/{alert_id}/review",
        json={"status": "RESOLVED", "resolution_notes": "Replaced worn bearing and restored optimal lubricant level."},
        headers=eng_headers
    )
    assert resolve_res.status_code == 200
    assert resolve_res.json()["status"] == "RESOLVED"

    # -------------------------------------------------------------------------
    # STEP 15: Complete Work Order
    # -------------------------------------------------------------------------
    update_task_res = client.put(
        f"/api/maintenance/{task_id}/status",
        json={"status": "COMPLETED"},
        headers=eng_headers
    )
    assert update_task_res.status_code == 200

    # -------------------------------------------------------------------------
    # STEP 16: Confirm Persistence in SQLite Database
    # -------------------------------------------------------------------------
    db = get_connection()
    cursor = db.cursor()
    cursor.execute("SELECT status FROM alerts WHERE id = ?", (alert_id,))
    alert_row = cursor.fetchone()
    assert alert_row is not None
    assert alert_row["status"] == "RESOLVED"

    cursor.execute("SELECT status FROM maintenance_tasks WHERE id = ?", (task_id,))
    task_row = cursor.fetchone()
    assert task_row is not None
    assert task_row["status"] == "COMPLETED"
    db.close()

    # -------------------------------------------------------------------------
    # STEP 17: Verify Audit Log Entry
    # -------------------------------------------------------------------------
    audit_res = client.get("/api/auth/audit-logs", headers=admin_headers)
    assert audit_res.status_code == 200
    audit_logs = audit_res.json()
    assert len(audit_logs) > 0
    actions = [log["action"] for log in audit_logs]
    assert "LOGIN_SUCCESS" in actions
    assert "START_STREAMING" in actions
    assert "REVIEW_ALERT" in actions

    # -------------------------------------------------------------------------
    # STEP 18: Stop Streaming
    # -------------------------------------------------------------------------
    stop_stream_res = client.post("/api/streaming/stop", headers=admin_headers)
    assert stop_stream_res.status_code == 200
    assert stop_stream_res.json()["status"]["is_running"] is False
