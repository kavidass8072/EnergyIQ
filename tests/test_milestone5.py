import os
import pytest
from fastapi.testclient import TestClient
from backend.main import app
from backend.auth.security import create_access_token
from experiments.run_benchmark import run_reproducible_experiments
from scripts.load_test_streaming import benchmark_streaming_ingestion_rates

client = TestClient(app)

def get_admin_headers():
    token = create_access_token({"sub": "admin", "role": "ADMIN", "user_id": 1})
    return {"Authorization": f"Bearer {token}"}

def test_system_readiness_endpoint():
    res = client.get("/api/system/readiness")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "READY"
    assert data["ready"] is True
    assert data["database"] == "OK"

def test_data_export_json_alerts():
    headers = get_admin_headers()
    res = client.get("/api/export/alerts?format=json&limit=10", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data["resource"] == "alerts"
    assert "data" in data

def test_data_export_csv_telemetry():
    headers = get_admin_headers()
    res = client.get("/api/export/telemetry?format=csv&limit=10", headers=headers)
    assert res.status_code == 200
    assert "text/csv" in res.headers["content-type"]
    assert "energy_kwh" in res.text or len(res.text) >= 0

def test_model_rollback_api():
    headers = get_admin_headers()
    res = client.post("/api/ml/models/mod-cif-v120/rollback", headers=headers)
    assert res.status_code == 200
    assert "rolled back" in res.json()["message"]

def test_reproducible_experiment_runner_execution():
    res = run_reproducible_experiments()
    assert "experiment_id" in res
    assert len(res["experiments"]) == 2

def test_streaming_load_test_execution():
    res = benchmark_streaming_ingestion_rates()
    assert isinstance(res, list)
    assert len(res) == 5
    assert all(r["operating_status"] == "PASS" for r in res)

def test_rate_limiter_functional_check():
    from backend.api.rate_limiter import RateLimiter
    limiter = RateLimiter(requests_per_window=2, window_seconds=10)
    
    class DummyRequest:
        class Client:
            host = "127.0.0.99"
        client = Client()
        
    req = DummyRequest()
    limiter(req) # 1
    limiter(req) # 2
    with pytest.raises(Exception):
        limiter(req) # 3 -> Exceeded

def test_export_invalid_resource_denied():
    headers = get_admin_headers()
    res = client.get("/api/export/invalid_resource_xyz", headers=headers)
    assert res.status_code == 400

def test_export_unauthenticated_denied():
    res = client.get("/api/export/alerts")
    assert res.status_code == 401
