import pytest
from fastapi.testclient import TestClient
from backend.main import app

from backend.services.data_loader import seed_database_pipeline

# Seed database before creating TestClient
seed_database_pipeline(days=5, force_reseed=True)
client = TestClient(app)

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "online"

def test_dashboard_summary():
    response = client.get("/api/dashboard/summary")
    assert response.status_code == 200
    data = response.json()
    assert "total_equipment" in data
    assert "active_alerts" in data
    assert "microgrid" in data

def test_get_equipment():
    response = client.get("/api/equipment")
    assert response.status_code == 200
    data = response.json()
    assert "equipment" in data
    assert len(data["equipment"]) > 0

def test_get_alerts():
    response = client.get("/api/alerts")
    assert response.status_code == 200
    data = response.json()
    assert "alerts" in data

def test_edge_cases_api():
    response = client.get("/api/edge-cases/run")
    assert response.status_code == 200
    data = response.json()
    assert data["all_passed"] is True
    assert data["total_cases"] == 7

def test_evaluation_api():
    response = client.get("/api/evaluation/compare")
    assert response.status_code == 200
    data = response.json()
    assert "baseline" in data
    assert "proposed" in data
    assert "targets" in data

def test_demo_fault_inject():
    response = client.post("/api/demo/inject", json={"equipment_id": "Motor-01", "fault_type": "MECHANICAL_RESISTANCE"})
    assert response.status_code == 200
    data = response.json()
    assert data["equipment_id"] == "Motor-01"
    assert "alert_id" in data
    assert data["dev_pct"] > 0

def test_maintenance_api():
    # GET maintenance
    response = client.get("/api/maintenance")
    assert response.status_code == 200
    data = response.json()
    assert "tasks" in data
    assert "ai_insights" in data

    # POST create task
    post_res = client.post("/api/maintenance", json={
        "equipment_id": "Motor-01",
        "priority": "HIGH",
        "issue_description": "Test mechanical bearing repair"
    })
    assert post_res.status_code == 200
    assert post_res.json()["status"] == "UPCOMING"

def test_analytics_api():
    response = client.get("/api/analytics/summary")
    assert response.status_code == 200
    data = response.json()
    assert "equipment_metrics" in data
    assert "energy_sources" in data
    assert "energy_waste" in data

def test_reports_api():
    response = client.get("/api/reports/generate?type=system_health")
    assert response.status_code == 200
    data = response.json()
    assert "report_id" in data
    assert "title" in data

def test_settings_api():
    response = client.get("/api/settings")
    assert response.status_code == 200
    data = response.json()
    assert "electricity_rate" in data

def test_search_api():
    response = client.get("/api/search?q=Motor")
    assert response.status_code == 200
    data = response.json()
    assert "equipment" in data
    assert len(data["equipment"]) > 0
