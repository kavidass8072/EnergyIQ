import os
import time
import json
import hashlib
import jwt
from datetime import datetime, timedelta, timezone
from typing import Optional, List, Dict, Any
from fastapi import Depends, HTTPException, status, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from backend.database.db import get_connection

APP_ENV = os.getenv("APP_ENV", "development").lower()
JWT_SECRET = os.getenv("JWT_SECRET", "energyiq-jwt-secret-key-production-prototype-2026")
ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 1440))

if APP_ENV == "production" and ("prototype" in JWT_SECRET.lower() or "change_me" in JWT_SECRET.lower() or len(JWT_SECRET) < 32):
    raise RuntimeError("CRITICAL SECURITY ERROR: Mandatory production secret 'JWT_SECRET' must be explicitly set to a unique 32+ character key in production mode!")

security_bearer = HTTPBearer(auto_error=False)

def hash_password(password: str) -> str:
    """Hashes a password using PBKDF2-HMAC-SHA256 with salt."""
    salt = os.urandom(16)
    key = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt, 100000)
    return salt.hex() + ":" + key.hex()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies a plain password against salt:hash string."""
    try:
        if ":" not in hashed_password:
            return False
        salt_hex, key_hex = hashed_password.split(":")
        salt = bytes.fromhex(salt_hex)
        key = bytes.fromhex(key_hex)
        new_key = hashlib.pbkdf2_hmac('sha256', plain_password.encode('utf-8'), salt, 100000)
        return new_key == key
    except Exception:
        return False

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Generates a signed JWT token."""
    to_encode = data.copy()
    now = datetime.now(timezone.utc)
    if expires_delta:
        expire = now + expires_delta
    else:
        expire = now + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": int(expire.timestamp()), "iat": int(now.timestamp())})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm=ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str) -> Dict[str, Any]:
    """Decodes and validates a JWT token."""
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )

def get_current_user(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_bearer)) -> Dict[str, Any]:
    """FastAPI Dependency: Retrieves current user from JWT token."""
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication credentials missing",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    payload = decode_access_token(credentials.credentials)
    username = payload.get("sub")
    role = payload.get("role")
    
    if not username or not role:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token payload invalid",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, username, role, active_status, last_login FROM users WHERE username = ?", (username,))
    user = cursor.fetchone()
    conn.close()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User no longer exists",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    if not user["active_status"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is deactivated"
        )
        
    return dict(user)

class RoleChecker:
    def __init__(self, allowed_roles: List[str]):
        self.allowed_roles = allowed_roles

    def __call__(self, user: Dict[str, Any] = Depends(get_current_user)) -> Dict[str, Any]:
        user_role = user.get("role")
        if user_role not in self.allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required role in {self.allowed_roles}, but user has role '{user_role}'"
            )
        return user

def log_audit_action(user_id: Optional[int], username: str, action: str, resource: str, details: Optional[Dict[str, Any]] = None):
    """Inserts a record into SQLite audit_logs table."""
    try:
        conn = get_connection()
        cursor = conn.cursor()
        now_str = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S")
        details_json = json.dumps(details) if details else None
        cursor.execute("""
            INSERT INTO audit_logs (timestamp, user_id, username, action, resource, details_json)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (now_str, user_id, username, action, resource, details_json))
        conn.commit()
        conn.close()
    except Exception as e:
        print(f"Audit log failed: {e}")
