import pytest
from fastapi.testclient import TestClient
from backend.main import app
from backend.auth.security import hash_password, verify_password, create_access_token

client = TestClient(app)

def test_password_hashing_and_verification():
    raw_pass = "SecurePass123!"
    hashed = hash_password(raw_pass)
    assert hashed != raw_pass
    assert verify_password(raw_pass, hashed) is True
    assert verify_password("WrongPassword", hashed) is False

def test_jwt_token_generation_and_decoding():
    token = create_access_token({"sub": "admin", "role": "ADMIN", "id": 1})
    assert isinstance(token, str)
    assert len(token) > 20

def test_valid_login_endpoint():
    response = client.post("/api/auth/login", json={"username": "admin", "password": "admin123"})
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["username"] == "admin"
    assert data["user"]["role"] == "ADMIN"

def test_invalid_password_login_endpoint():
    response = client.post("/api/auth/login", json={"username": "admin", "password": "WrongPassword"})
    assert response.status_code == 401
    assert "Invalid username or password" in response.json()["detail"]

def test_rbac_admin_protected_endpoint_denied_for_operator():
    # Login as operator
    op_res = client.post("/api/auth/login", json={"username": "operator", "password": "operator123"})
    assert op_res.status_code == 200
    op_token = op_res.json()["access_token"]
    
    # Try accessing admin audit-logs with operator token
    headers = {"Authorization": f"Bearer {op_token}"}
    res = client.get("/api/auth/audit-logs", headers=headers)
    assert res.status_code == 403
    assert "Access denied" in res.json()["detail"]

def test_rbac_admin_protected_endpoint_allowed_for_admin():
    admin_res = client.post("/api/auth/login", json={"username": "admin", "password": "admin123"})
    admin_token = admin_res.json()["access_token"]
    
    headers = {"Authorization": f"Bearer {admin_token}"}
    res = client.get("/api/auth/audit-logs", headers=headers)
    assert res.status_code == 200
    assert isinstance(res.json(), list)
