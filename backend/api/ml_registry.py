from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Dict, Any
from backend.services.model_registry import list_all_models, get_model_by_id, activate_model, rollback_model
from backend.services.drift_monitor import compute_model_drift_metrics
from backend.auth.security import RoleChecker, log_audit_action

router = APIRouter(prefix="/api/ml", tags=["ml-registry"])

@router.get("/models")
def get_registered_models():
    return list_all_models()

@router.get("/models/{model_id}")
def get_model_details(model_id: str):
    model = get_model_by_id(model_id)
    if not model:
        raise HTTPException(status_code=404, detail=f"Model '{model_id}' not found in registry")
    return model

@router.post("/models/{model_id}/activate")
def activate_registered_model(model_id: str, current_user: dict = Depends(RoleChecker(["ADMIN", "TECHNICAL_ENGINEER"]))):
    success = activate_model(model_id)
    if not success:
        raise HTTPException(status_code=404, detail=f"Model '{model_id}' not found in registry")
        
    log_audit_action(current_user["id"], current_user["username"], "ACTIVATE_MODEL", f"/api/ml/models/{model_id}/activate", {"model_id": model_id})
    return {"message": f"Model '{model_id}' activated successfully", "models": list_all_models()}

@router.post("/models/{model_id}/rollback")
def rollback_registered_model(model_id: str, current_user: dict = Depends(RoleChecker(["ADMIN", "TECHNICAL_ENGINEER"]))):
    success = rollback_model(model_id)
    if not success:
        raise HTTPException(status_code=404, detail=f"Target rollback model '{model_id}' not found in registry")
        
    log_audit_action(current_user["id"], current_user["username"], "ROLLBACK_MODEL", f"/api/ml/models/{model_id}/rollback", {"target_model_id": model_id})
    return {"message": f"Model engine rolled back to '{model_id}' successfully", "models": list_all_models()}

@router.get("/drift")
def get_model_drift():
    return compute_model_drift_metrics()
