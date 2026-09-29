import pytest
from backend.services.data_quality import compute_data_quality_metrics
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_compute_data_quality_metrics():
    metrics = compute_data_quality_metrics()
    assert "status" in metrics
    assert "completeness_pct" in metrics
    assert "null_rate_pct" in metrics
    assert metrics["status"] in ["HEALTHY", "WARNING", "CRITICAL"]

def test_data_quality_summary_api():
    res = client.get("/api/data-quality/summary")
    assert res.status_code == 200
    data = res.json()
    assert "completeness_pct" in data
    assert "status" in data

def test_notifications_api():
    # Login as operator
    login_res = client.post("/api/auth/login", json={"username": "operator", "password": "operator123"})
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    
    headers = {"Authorization": f"Bearer {token}"}
    res = client.get("/api/notifications", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert "unread_count" in data
    assert "notifications" in data
