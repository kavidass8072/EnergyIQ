import pytest
from fastapi.testclient import TestClient
from backend.main import app
from backend.services.model_registry import list_all_models, get_model_by_id, activate_model
from backend.auth.security import create_access_token

client = TestClient(app)

def get_admin_headers():
    token = create_access_token({"sub": "admin", "role": "ADMIN", "user_id": 1})
    return {"Authorization": f"Bearer {token}"}

def test_list_all_models():
    models = list_all_models()
    assert isinstance(models, list)
    assert len(models) >= 3
    active_count = sum(1 for m in models if m["is_active"])
    assert active_count == 1

def test_get_model_by_id():
    model = get_model_by_id("mod-cif-v120")
    assert model is not None
    assert "Isolation Forest" in model["name"]
    assert "metrics" in model
    assert "parameters" in model

def test_get_model_by_id_not_found():
    model = get_model_by_id("non-existent-model")
    assert model is None

def test_activate_model():
    success = activate_model("mod-zscore-v100")
    assert success is True
    
    # Check that mod-zscore-v100 is now active
    active = get_model_by_id("mod-zscore-v100")
    assert active["is_active"] is True
    
    # Reset back to mod-cif-v120
    activate_model("mod-cif-v120")
    assert get_model_by_id("mod-cif-v120")["is_active"] is True

def test_model_registry_api_endpoints():
    headers = get_admin_headers()
    
    # GET /api/ml/models
    res = client.get("/api/ml/models", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data, list)
    
    # GET /api/ml/models/mod-cif-v120
    res = client.get("/api/ml/models/mod-cif-v120", headers=headers)
    assert res.status_code == 200
    assert res.json()["id"] == "mod-cif-v120"
    
    # POST /api/ml/models/mod-zscore-v100/activate
    res = client.post("/api/ml/models/mod-zscore-v100/activate", headers=headers)
    assert res.status_code == 200
    assert "activated successfully" in res.json()["message"]
    
    # Reset back
    client.post("/api/ml/models/mod-cif-v120/activate", headers=headers)
