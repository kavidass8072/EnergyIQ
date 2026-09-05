from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
import json
import datetime
import pandas as pd

from backend.database.db import get_connection
from backend.services.data_loader import seed_database_pipeline
from backend.fault_linking.engine import analyze_and_link_fault

router = APIRouter(prefix="/api/demo", tags=["demo"])

class FaultInjectRequest(BaseModel):
    equipment_id: str = "Motor-01"
    fault_type: str = "MECHANICAL_RESISTANCE" # MECHANICAL_RESISTANCE, STANDBY_LEAKAGE, PRODUCTION_ANOMALY, ELECTRICAL_SPIKE

@router.post("/inject")
def inject_demo_fault(req: FaultInjectRequest):
    conn = get_connection()
    cursor = conn.cursor()
    
    # Check equipment exists
    cursor.execute("""
        SELECT * FROM telemetry 
        WHERE equipment_id = ? 
        ORDER BY timestamp DESC LIMIT 1
    """, (req.equipment_id,))
    latest_row = cursor.fetchone()
    
    if not latest_row:
        conn.close()
        raise HTTPException(status_code=404, detail=f"Equipment '{req.equipment_id}' not found in telemetry.")
        
    row_dict = dict(latest_row)
    now_str = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    # Calculate baseline expected energy
    cursor.execute("""
        SELECT AVG(energy_kwh) as avg_kw 
        FROM telemetry 
        WHERE equipment_id = ? AND operating_state = 'ON'
    """, (req.equipment_id,))
    avg_res = cursor.fetchone()
    baseline_kw = avg_res["avg_kw"] if (avg_res and avg_res["avg_kw"]) else 15.0
    
    # Modify telemetry features according to fault injection scenario
    fault_type_upper = req.fault_type.upper()
    
    if fault_type_upper == "MECHANICAL_RESISTANCE":
        energy_kwh = round(baseline_kw * 1.62, 2)
        operating_state = "ON"
        production_output = float(row_dict.get("production_output", 50.0) or 50.0)
        severity = "HIGH"
        fault_name = "Mechanical Resistance"
    elif fault_type_upper == "STANDBY_LEAKAGE":
        energy_kwh = round(baseline_kw * 0.45, 2)
        operating_state = "OFF"
        production_output = 0.0
        severity = "CRITICAL"
        fault_name = "Unexpected Standby Consumption"
    elif fault_type_upper == "PRODUCTION_ANOMALY":
        energy_kwh = round(baseline_kw * 1.48, 2)
        operating_state = "ON"
        production_output = 0.0
        severity = "HIGH"
        fault_name = "Production-Related Abnormality"
    elif fault_type_upper == "ELECTRICAL_SPIKE":
        energy_kwh = round(baseline_kw * 2.75, 2)
        operating_state = "ON"
        production_output = float(row_dict.get("production_output", 50.0) or 50.0)
        severity = "CRITICAL"
        fault_name = "Electrical Abnormality"
    else:
        energy_kwh = round(baseline_kw * 1.5, 2)
        operating_state = "ON"
        production_output = 50.0
        severity = "HIGH"
        fault_name = "Unspecified Fault"

    dev_pct = round(((energy_kwh - baseline_kw) / baseline_kw) * 100.0, 1)
    
    # Update latest telemetry record in DB
    cursor.execute("""
        INSERT INTO telemetry (
            timestamp, equipment_id, equipment_type, energy_kwh, operating_state,
            production_output, solar_generation_kwh, battery_soc, grid_consumption_kwh,
            temperature, maintenance_days, maintenance_status, is_anomaly, fault_label,
            anomaly_score, severity
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, 0.88, ?)
    """, (
        now_str,
        req.equipment_id,
        row_dict["equipment_type"],
        energy_kwh,
        operating_state,
        production_output,
        row_dict.get("solar_generation_kwh", 45.0),
        row_dict.get("battery_soc", 60.0),
        row_dict.get("grid_consumption_kwh", 120.0),
        row_dict.get("temperature", 42.0),
        row_dict.get("maintenance_days", 45),
        "NEEDS_INSPECTION",
        fault_name,
        severity
    ))
    
    # Run fault linking engine
    obs_data = {
        "equipment_id": req.equipment_id,
        "equipment_type": row_dict["equipment_type"],
        "energy_kwh": energy_kwh,
        "rolling_mean_24h": baseline_kw,
        "operating_state": operating_state,
        "production_output": production_output,
        "maintenance_days": row_dict.get("maintenance_days", 45),
        "temperature": row_dict.get("temperature", 42.0)
    }
    fault_res = analyze_and_link_fault(obs_data)
    
    # Create new high-priority active alert
    cursor.execute("""
        INSERT INTO alerts (
            timestamp, equipment_id, equipment_type, severity, energy_kwh, expected_kwh,
            dev_pct, operating_state, production_output, maintenance_days, likely_fault,
            fault_confidence, evidence_json, recommended_action, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE')
    """, (
        now_str,
        req.equipment_id,
        row_dict["equipment_type"],
        severity,
        energy_kwh,
        baseline_kw,
        dev_pct,
        operating_state,
        production_output,
        row_dict.get("maintenance_days", 45),
        fault_res["likely_fault"],
        fault_res["fault_confidence"],
        json.dumps(fault_res["evidence"]),
        fault_res["recommended_action"]
    ))
    alert_id = cursor.lastrowid
    
    conn.commit()
    conn.close()
    
    return {
        "message": f"Successfully injected {fault_name} fault into {req.equipment_id}.",
        "alert_id": alert_id,
        "equipment_id": req.equipment_id,
        "fault_type": fault_name,
        "severity": severity,
        "energy_kwh": energy_kwh,
        "expected_kwh": baseline_kw,
        "dev_pct": dev_pct,
        "likely_fault": fault_res["likely_fault"],
        "confidence": fault_res["fault_confidence"],
        "evidence": fault_res["evidence"],
        "recommended_action": fault_res["recommended_action"]
    }

@router.post("/reset")
def reset_demo_data():
    count = seed_database_pipeline(days=60, force_reseed=True)
    return {
        "message": "Demo data successfully reset to clean default baseline state.",
        "records_count": count
    }
