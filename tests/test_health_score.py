import os
import pytest
from fastapi.testclient import TestClient
from backend.main import app
from backend.services.model_registry import list_all_models
from backend.auth.security import create_access_token
from scripts.backup_db import create_backup, restore_backup

client = TestClient(app)

def get_admin_headers():
    token = create_access_token({"sub": "admin", "role": "ADMIN", "user_id": 1})
    return {"Authorization": f"Bearer {token}"}

def test_equipment_health_history_endpoint():
    headers = get_admin_headers()
    res = client.get("/api/equipment/Motor-01/health-history?days=30", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert "equipment_id" in data
    assert "health_trend" in data
    assert len(data["health_trend"]) > 0

def test_maintenance_overview_priority_fields():
    headers = get_admin_headers()
    res = client.get("/api/maintenance", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert "tasks" in data
    assert "ai_insights" in data

def test_system_metrics_observability_endpoint():
    headers = get_admin_headers()
    res = client.get("/api/system/metrics", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert "total_http_requests" in data
    assert "average_http_latency_ms" in data

def test_database_backup_and_restore_script():
    backup_file = create_backup()
    assert backup_file is not False
    assert os.path.exists(backup_file)
    
    restored = restore_backup(backup_file)
    assert restored is True
    
    # Clean up test backup file
    try:
        os.remove(backup_file)
    except Exception:
        pass

def test_historical_model_version_retention():
    models = list_all_models()
    cif = next((m for m in models if m["model_id"] == "mod-cif-v120"), None)
    assert cif is not None
    assert cif["version"] == "1.2.0"
