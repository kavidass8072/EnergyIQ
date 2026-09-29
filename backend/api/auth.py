from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from backend.database.db import get_connection
from backend.auth.security import (
    hash_password, verify_password, create_access_token,
    get_current_user, RoleChecker, log_audit_action
)
from backend.models.user import (
    UserLoginRequest, TokenResponse, UserResponse, UserCreateRequest, AuditLogResponse
)

router = APIRouter(prefix="/api/auth", tags=["authentication"])

@router.post("/login", response_model=TokenResponse)
def login(request: UserLoginRequest):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE username = ?", (request.username,))
    row = cursor.fetchone()
    
    if not row or not verify_password(request.password, row["password_hash"]):
        conn.close()
        log_audit_action(None, request.username, "LOGIN_FAILED", "/api/auth/login", {"reason": "Invalid credentials"})
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password"
        )
        
    if not row["active_status"]:
        conn.close()
        log_audit_action(row["id"], request.username, "LOGIN_FAILED", "/api/auth/login", {"reason": "Account deactivated"})
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account deactivated. Please contact Administrator."
        )
        
    now_str = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S")
    cursor.execute("UPDATE users SET last_login = ? WHERE id = ?", (now_str, row["id"]))
    conn.commit()
    conn.close()
    
    user_data = {
        "id": row["id"],
        "username": row["username"],
        "role": row["role"],
        "active_status": bool(row["active_status"]),
        "created_at": row["created_at"],
        "last_login": now_str
    }
    
    token = create_access_token(data={"sub": row["username"], "role": row["role"], "id": row["id"]})
    log_audit_action(row["id"], row["username"], "LOGIN_SUCCESS", "/api/auth/login")
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user_data
    }

@router.get("/me", response_model=UserResponse)
def get_current_user_profile(user: dict = Depends(get_current_user)):
    return {
        "id": user["id"],
        "username": user["username"],
        "role": user["role"],
        "active_status": bool(user["active_status"]),
        "created_at": user.get("created_at", ""),
        "last_login": user.get("last_login")
    }

@router.get("/users", response_model=List[UserResponse], dependencies=[Depends(RoleChecker(["ADMIN"]))])
def list_all_users():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, username, role, active_status, created_at, last_login FROM users ORDER BY id ASC")
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

@router.post("/users", response_model=UserResponse, dependencies=[Depends(RoleChecker(["ADMIN"]))])
def create_user(request: UserCreateRequest, current_user: dict = Depends(get_current_user)):
    valid_roles = ["ADMIN", "FACILITY_OPERATOR", "TECHNICAL_ENGINEER"]
    if request.role not in valid_roles:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid role. Must be one of {valid_roles}"
        )
        
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM users WHERE username = ?", (request.username,))
    if cursor.fetchone():
        conn.close()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Username '{request.username}' is already taken"
        )
        
    hashed = hash_password(request.password)
    now_str = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S")
    cursor.execute("""
        INSERT INTO users (username, password_hash, role, active_status, created_at)
        VALUES (?, ?, ?, 1, ?)
    """, (request.username, hashed, request.role, now_str))
    conn.commit()
    new_id = cursor.lastrowid
    conn.close()
    
    log_audit_action(current_user["id"], current_user["username"], "CREATE_USER", f"/api/auth/users/{new_id}", {"new_username": request.username, "role": request.role})
    
    return {
        "id": new_id,
        "username": request.username,
        "role": request.role,
        "active_status": True,
        "created_at": now_str,
        "last_login": None
    }

@router.get("/audit-logs", response_model=List[dict], dependencies=[Depends(RoleChecker(["ADMIN"]))])
def get_audit_logs(limit: int = 50):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, timestamp, username, action, resource, details_json FROM audit_logs ORDER BY id DESC LIMIT ?", (limit,))
    rows = cursor.fetchall()
    conn.close()
    
    result = []
    for r in rows:
        d = dict(r)
        if d.get("details_json"):
            import json
            try:
                d["details"] = json.loads(d["details_json"])
            except Exception:
                d["details"] = d["details_json"]
        result.append(d)
    return result
