import pytest
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_system_health_endpoint():
    res = client.get("/api/system/health")
    assert res.status_code == 200
    data = res.json()
    assert "overall_status" in data
    assert "version" in data
    assert "components" in data
    assert data["components"]["database"]["status"] == "HEALTHY"
    assert data["components"]["api"]["status"] == "HEALTHY"
    assert data["components"]["ml_engine"]["status"] == "HEALTHY"
