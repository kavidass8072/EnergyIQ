from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List

class UserLoginRequest(BaseModel):
    username: str = Field(..., json_schema_extra={"example": "admin"})
    password: str = Field(..., json_schema_extra={"example": "admin123"})

class UserResponse(BaseModel):
    id: int
    username: str
    role: str
    active_status: bool
    created_at: str
    last_login: Optional[str] = None

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class UserCreateRequest(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=6)
    role: str = Field(..., json_schema_extra={"example": "FACILITY_OPERATOR"})

class AuditLogResponse(BaseModel):
    id: int
    timestamp: str
    username: str
    action: str
    resource: str
    details: Optional[Dict[str, Any]] = None
