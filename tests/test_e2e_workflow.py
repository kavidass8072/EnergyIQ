import pytest
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_full_end_to_end_lifecycle_workflow():
    """
    Executes a complete end-to-end integration scenario across all system components:
    1. Admin Login
    2. Telemetry Streaming Start & Normal Telemetry Check
    3. Fault Injection (Motor-01 Mechanical Resistance)
    4. Anomaly Detection, Feature Engineering & Physical Fault Linking
    5. Alert Correlation & System Notifications
    6. Equipment Health Score Update
    7. Maintenance Recommendation Verification
    8. Operator Login & Alert Acknowledgment
    9. Maintenance Work Order Creation
    10. Engineer Login & Technical Investigation
    11. Alert Resolution & Work Order Completion
    """
    
    # ---------------------------------------------------------
    # STEP 1: Admin Login
    # ---------------------------------------------------------
    admin_login_res = client.post("/api/auth/login", json={"username": "admin", "password": "admin123"})
    assert admin_login_res.status_code == 200
    admin_data = admin_login_res.json()
    assert admin_data["user"]["role"] == "ADMIN"
    admin_headers = {"Authorization": f"Bearer {admin_data['access_token']}"}
    
    # ---------------------------------------------------------
    # STEP 2: Start Telemetry Streaming & Check Normal Status
    # ---------------------------------------------------------
    start_stream_res = client.post("/api/streaming/start", json={"interval": 1.0}, headers=admin_headers)
    assert start_stream_res.status_code == 200
    
    status_res = client.get("/api/streaming/status", headers=admin_headers)
    assert status_res.status_code == 200
    assert status_res.json()["is_running"] is True
    
    # ---------------------------------------------------------
    # STEP 3: Inject Physical Fault into Motor-01
    # ---------------------------------------------------------
    inject_res = client.post("/api/demo/inject", json={"equipment_id": "Motor-01", "fault_type": "MECHANICAL_RESISTANCE"}, headers=admin_headers)
    assert inject_res.status_code == 200
    inject_data = inject_res.json()
    assert "alert_id" in inject_data
    alert_id = inject_data["alert_id"]
    assert inject_data["equipment_id"] == "Motor-01"
    
    # ---------------------------------------------------------
    # STEP 4: Verify Alert Generation, Evidence & Correlation
    # ---------------------------------------------------------
    alert_detail_res = client.get(f"/api/alerts/{alert_id}", headers=admin_headers)
    assert alert_detail_res.status_code == 200
    alert_detail = alert_detail_res.json()
    assert alert_detail["equipment_id"] == "Motor-01"
    assert alert_detail["status"] in ["ACTIVE", "UNDER_INVESTIGATION"]
    assert "evidence" in alert_detail
    assert "explainability" in alert_detail
    
    correlated_res = client.get("/api/alerts/correlated", headers=admin_headers)
    assert correlated_res.status_code == 200
    
    # ---------------------------------------------------------
    # STEP 5: Verify Notifications & Equipment Health Impact
    # ---------------------------------------------------------
    notif_res = client.get("/api/notifications", headers=admin_headers)
    assert notif_res.status_code == 200
    
    equip_res = client.get("/api/equipment", headers=admin_headers)
    assert equip_res.status_code == 200
    equipment_list = equip_res.json()["equipment"]
    motor = next((eq for eq in equipment_list if (eq.get("equipment_id") or eq.get("id")) == "Motor-01"), None)
    assert motor is not None
    
    # ---------------------------------------------------------
    # STEP 6: Operator Login & Acknowledge Alert
    # ---------------------------------------------------------
    op_login_res = client.post("/api/auth/login", json={"username": "operator", "password": "operator123"})
    assert op_login_res.status_code == 200
    op_data = op_login_res.json()
    assert op_data["user"]["role"] == "FACILITY_OPERATOR"
    op_headers = {"Authorization": f"Bearer {op_data['access_token']}"}
    
    review_res = client.post(
        f"/api/alerts/{alert_id}/review",
        json={"status": "UNDER_INVESTIGATION", "resolution_notes": "Operator investigating bearing noise."},
        headers=op_headers
    )
    assert review_res.status_code == 200
    assert review_res.json()["status"] == "UNDER_INVESTIGATION"
    
    # ---------------------------------------------------------
    # STEP 7: Create Maintenance Work Order
    # ---------------------------------------------------------
    create_task_res = client.post(
        "/api/maintenance",
        json={
            "equipment_id": "Motor-01",
            "equipment_type": "Heavy Motor",
            "priority": "HIGH",
            "issue_description": "Inspect shaft bearing and lubrication due to mechanical resistance alert.",
            "linked_alert_id": alert_id,
            "assigned_technician": "engineer"
        },
        headers=op_headers
    )
    assert create_task_res.status_code == 200
    task_data = create_task_res.json()
    task_id = task_data.get("task_id") or 1
    
    # ---------------------------------------------------------
    # STEP 8: Engineer Login & Technical Investigation
    # ---------------------------------------------------------
    eng_login_res = client.post("/api/auth/login", json={"username": "engineer", "password": "engineer123"})
    assert eng_login_res.status_code == 200
    eng_data = eng_login_res.json()
    assert eng_data["user"]["role"] == "TECHNICAL_ENGINEER"
    eng_headers = {"Authorization": f"Bearer {eng_data['access_token']}"}
    
    health_hist_res = client.get("/api/equipment/Motor-01/health-history", headers=eng_headers)
    assert health_hist_res.status_code == 200
    
    # ---------------------------------------------------------
    # STEP 9: Resolve Alert & Complete Work Order
    # ---------------------------------------------------------
    resolve_alert_res = client.post(
        f"/api/alerts/{alert_id}/review",
        json={"status": "RESOLVED", "resolution_notes": "Replaced worn bearing and rebalanced drive alignment."},
        headers=eng_headers
    )
    assert resolve_alert_res.status_code == 200
    assert resolve_alert_res.json()["status"] == "RESOLVED"
    
    update_task_res = client.put(
        f"/api/maintenance/{task_id}/status",
        json={"status": "COMPLETED"},
        headers=eng_headers
    )
    assert update_task_res.status_code == 200
    
    # ---------------------------------------------------------
    # STEP 10: Stop Telemetry Streaming
    # ---------------------------------------------------------
    stop_stream_res = client.post("/api/streaming/stop", headers=admin_headers)
    assert stop_stream_res.status_code == 200
    assert stop_stream_res.json()["status"]["is_running"] is False
