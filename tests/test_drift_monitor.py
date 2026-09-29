import pytest
import numpy as np
from fastapi.testclient import TestClient
from backend.main import app
from backend.services.drift_monitor import calculate_psi, compute_model_drift_metrics
from backend.auth.security import create_access_token

client = TestClient(app)

def get_admin_headers():
    token = create_access_token({"sub": "admin", "role": "ADMIN", "user_id": 1})
    return {"Authorization": f"Bearer {token}"}

def test_calculate_psi_identical_distributions():
    expected = np.random.normal(50, 10, 1000)
    actual = np.random.normal(50, 10, 1000)
    psi = calculate_psi(expected, actual)
    assert psi < 0.10 # Should be stable

def test_calculate_psi_shifted_distributions():
    expected = np.random.normal(50, 10, 1000)
    actual = np.random.normal(80, 10, 1000)
    psi = calculate_psi(expected, actual)
    assert psi >= 0.10 # Should indicate shift/drift

def test_compute_model_drift_metrics():
    metrics = compute_model_drift_metrics()
    assert "overall_psi" in metrics
    assert "status" in metrics
    assert metrics["status"] in ["STABLE", "WARNING", "DRIFT DETECTED"]
    assert "features" in metrics
    assert len(metrics["features"]) > 0

def test_model_drift_api_endpoint():
    headers = get_admin_headers()
    res = client.get("/api/ml/drift", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert "overall_psi" in data
    assert "status" in data
