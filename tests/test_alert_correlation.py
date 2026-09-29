import pytest
from fastapi.testclient import TestClient
from backend.main import app
from backend.services.alert_correlation import compute_correlated_alerts
from backend.auth.security import create_access_token

client = TestClient(app)

def get_admin_headers():
    token = create_access_token({"sub": "admin", "role": "ADMIN", "user_id": 1})
    return {"Authorization": f"Bearer {token}"}

def test_compute_correlated_alerts():
    clusters = compute_correlated_alerts()
    assert isinstance(clusters, list)

def test_correlated_alerts_api():
    headers = get_admin_headers()
    res = client.get("/api/alerts/correlated", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert "correlated_events" in data or "correlated_clusters" in data or isinstance(data, list)
