import pytest
import time
import jwt
from fastapi.testclient import TestClient
from backend.main import app
from backend.streaming.validator import validate_and_clean_telemetry
from backend.auth.security import JWT_SECRET, ALGORITHM

client = TestClient(app)

def test_failure_invalid_jwt_token():
    res = client.get("/api/auth/me", headers={"Authorization": "Bearer invalid.jwt.token"})
    assert res.status_code == 401

def test_failure_expired_jwt_token():
    payload = {"sub": "admin", "role": "ADMIN", "exp": int(time.time() - 3600)}
    expired_token = jwt.encode(payload, JWT_SECRET, algorithm=ALGORITHM)
    res = client.get("/api/auth/me", headers={"Authorization": f"Bearer {expired_token}"})
    assert res.status_code == 401

def test_failure_malformed_telemetry_payload():
    raw_event = {"equipment_id": "Motor-01", "energy_kwh": "corrupted_str", "temperature": None}
    valid, cleaned, issues = validate_and_clean_telemetry(raw_event)
    assert cleaned["energy_kwh"] >= 0.0 # Gracefully imputed
    assert isinstance(cleaned["temperature"], float)

def test_failure_missing_telemetry_fields():
    raw_event = {}
    valid, cleaned, issues = validate_and_clean_telemetry(raw_event)
    assert cleaned["equipment_id"] is not None
    assert cleaned["energy_kwh"] == 0.0

def test_failure_invalid_model_activation_id():
    payload = jwt.encode({"sub": "admin", "role": "ADMIN", "user_id": 1, "exp": int(time.time() + 3600)}, JWT_SECRET, algorithm=ALGORITHM)
    headers = {"Authorization": f"Bearer {payload}"}
    res = client.post("/api/ml/models/non_existent_model_id_xyz/activate", headers=headers)
    assert res.status_code == 404

def test_failure_invalid_alert_review_status():
    payload = jwt.encode({"sub": "admin", "role": "ADMIN", "user_id": 1, "exp": int(time.time() + 3600)}, JWT_SECRET, algorithm=ALGORITHM)
    headers = {"Authorization": f"Bearer {payload}"}
    res = client.post("/api/alerts/1/review", json={"status": "INVALID_STATUS_NAME"}, headers=headers)
    assert res.status_code == 400

def test_failure_streaming_invalid_scenario():
    payload = jwt.encode({"sub": "admin", "role": "ADMIN", "user_id": 1, "exp": int(time.time() + 3600)}, JWT_SECRET, algorithm=ALGORITHM)
    headers = {"Authorization": f"Bearer {payload}"}
    res = client.post("/api/streaming/scenario", json={"scenario": "NON_EXISTENT_SCENARIO"}, headers=headers)
    assert res.status_code == 400

def test_failure_negative_telemetry_bounds_sanitization():
    raw_event = {"equipment_id": "HVAC-01", "energy_kwh": -150.5, "temperature": -300.0}
    valid, cleaned, issues = validate_and_clean_telemetry(raw_event)
    assert cleaned["energy_kwh"] >= 0.0
    assert cleaned["temperature"] >= 0.0

def test_failure_missing_auth_header_denied():
    res = client.get("/api/auth/me")
    assert res.status_code == 401

def test_failure_invalid_export_resource():
    payload = jwt.encode({"sub": "admin", "role": "ADMIN", "user_id": 1, "exp": int(time.time() + 3600)}, JWT_SECRET, algorithm=ALGORITHM)
    headers = {"Authorization": f"Bearer {payload}"}
    res = client.get("/api/export/unknown_resource_name", headers=headers)
    assert res.status_code == 400

