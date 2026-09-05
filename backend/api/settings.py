from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, Dict, Any
import json
import os
from backend.database.db import get_connection
from ml.anomaly_detector import load_threshold_config

router = APIRouter(prefix="/api/settings", tags=["settings"])

class SettingsPayload(BaseModel):
    electricity_rate: float = 8.50
    currency: str = "₹"
    rolling_window_hours: int = 24
    anomaly_sensitivity: str = "HIGH" # LOW, MEDIUM, HIGH, CRITICAL
    auto_refresh_sec: int = 15
    min_alert_duration_hr: int = 1
    thresholds: Optional[Dict[str, float]] = None

@router.get("")
def get_all_settings():
    conn = get_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT key, value FROM app_settings")
    rows = cursor.fetchall()
    conn.close()
    
    settings_dict = {}
    for r in rows:
        settings_dict[r["key"]] = r["value"]
        
    thresholds = load_threshold_config()
    
    return {
        "electricity_rate": float(settings_dict.get("electricity_rate", 8.50)),
        "currency": settings_dict.get("currency", "₹"),
        "rolling_window_hours": int(settings_dict.get("rolling_window_hours", 24)),
        "anomaly_sensitivity": settings_dict.get("anomaly_sensitivity", "HIGH"),
        "auto_refresh_sec": int(settings_dict.get("auto_refresh_sec", 15)),
        "min_alert_duration_hr": int(settings_dict.get("min_alert_duration_hr", 1)),
        "thresholds": thresholds
    }

@router.post("")
def update_settings(payload: SettingsPayload):
    conn = get_connection()
    cursor = conn.cursor()
    
    settings_items = [
        ("electricity_rate", str(payload.electricity_rate)),
        ("currency", payload.currency),
        ("rolling_window_hours", str(payload.rolling_window_hours)),
        ("anomaly_sensitivity", payload.anomaly_sensitivity),
        ("auto_refresh_sec", str(payload.auto_refresh_sec)),
        ("min_alert_duration_hr", str(payload.min_alert_duration_hr))
    ]
    
    cursor.executemany("INSERT OR REPLACE INTO app_settings (key, value) VALUES (?, ?)", settings_items)
    conn.commit()
    conn.close()
    
    # Update thresholds if provided
    if payload.thresholds:
        config_path = os.path.join(os.path.dirname(__file__), "..", "config", "thresholds.json")
        cfg = load_threshold_config()
        for k in ["LOW", "MEDIUM", "HIGH", "CRITICAL"]:
            if k in payload.thresholds:
                cfg[k] = float(payload.thresholds[k])
        with open(config_path, "w") as f:
            json.dump(cfg, f, indent=2)
            
    return {"message": "System settings updated successfully."}
