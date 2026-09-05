import json
import os
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from backend.services.data_loader import seed_database_pipeline
from ml.anomaly_detector import load_threshold_config

router = APIRouter(prefix="/api/admin", tags=["admin"])

class ThresholdUpdateRequest(BaseModel):
    LOW: float
    MEDIUM: float
    HIGH: float
    CRITICAL: float

@router.post("/reseed")
def reseed_dataset(days: int = 60):
    count = seed_database_pipeline(days=days, force_reseed=True)
    return {"message": f"Successfully reseeded database with {count} telemetry records and executed ML pipeline.", "records_count": count}

@router.get("/thresholds")
def get_thresholds():
    return load_threshold_config()

@router.post("/thresholds")
def update_thresholds(req: ThresholdUpdateRequest):
    config_path = os.path.join(os.path.dirname(__file__), "..", "config", "thresholds.json")
    cfg = load_threshold_config()
    cfg["LOW"] = req.LOW
    cfg["MEDIUM"] = req.MEDIUM
    cfg["HIGH"] = req.HIGH
    cfg["CRITICAL"] = req.CRITICAL
    
    with open(config_path, "w") as f:
        json.dump(cfg, f, indent=2)
        
    return {"message": "Threshold configuration updated successfully.", "thresholds": cfg}
