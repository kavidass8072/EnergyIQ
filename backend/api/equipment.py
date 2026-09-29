from fastapi import APIRouter, HTTPException
from typing import Optional, List
from backend.database.db import get_connection

router = APIRouter(prefix="/api/equipment", tags=["equipment"])

@router.get("")
def get_all_equipment():
    conn = get_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT t.equipment_id, t.equipment_type, t.operating_state, t.energy_kwh,
               t.production_output, t.temperature, t.maintenance_days, t.maintenance_status,
               t.anomaly_score, t.severity, t.timestamp
        FROM telemetry t
        INNER JOIN (
            SELECT equipment_id, MAX(timestamp) as max_ts
            FROM telemetry
            GROUP BY equipment_id
        ) latest ON t.equipment_id = latest.equipment_id AND t.timestamp = latest.max_ts
        ORDER BY t.equipment_id
    """)
    equipment_rows = [dict(r) for r in cursor.fetchall()]
    
    for eq in equipment_rows:
        cursor.execute("""
            SELECT likely_fault, fault_confidence, severity
            FROM alerts
            WHERE equipment_id = ? AND status = 'ACTIVE'
            ORDER BY timestamp DESC LIMIT 1
        """, (eq["equipment_id"],))
        alert = cursor.fetchone()
        if alert:
            eq["active_fault"] = alert["likely_fault"]
            eq["fault_confidence"] = alert["fault_confidence"]
            eq["alert_severity"] = alert["severity"]
        else:
            eq["active_fault"] = None
            eq["fault_confidence"] = None
            eq["alert_severity"] = "NORMAL"

        sev = eq["alert_severity"]
        anomaly_score = float(eq.get("anomaly_score") or 0.0)
        maint_days = int(eq.get("maintenance_days") or 0)

        deduction = 0
        if sev == "CRITICAL": deduction += 38
        elif sev == "HIGH": deduction += 24
        elif sev == "MEDIUM": deduction += 12

        deduction += min(30, int(anomaly_score * 35))
        if maint_days > 60: deduction += 10

        health_score = max(25, 100 - deduction)
        eq["health_score"] = health_score
        if health_score >= 85:
            eq["health_status"] = "Healthy"
        elif health_score >= 65:
            eq["health_status"] = "Needs Attention"
        else:
            eq["health_status"] = "Action Required"
            
    conn.close()
    return {"equipment": equipment_rows}

@router.get("/{equipment_id}/history")
def get_equipment_history(equipment_id: str, hours: int = 72):
    conn = get_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT timestamp, energy_kwh, operating_state, production_output, 
               temperature, anomaly_score, severity, is_anomaly
        FROM telemetry
        WHERE equipment_id = ?
        ORDER BY timestamp DESC
        LIMIT ?
    """, (equipment_id, hours))
    
    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()
    
    if not rows:
        raise HTTPException(status_code=404, detail="Equipment not found")
        
    rows.reverse()
    
    energies = [r["energy_kwh"] for r in rows]
    for i in range(len(rows)):
        start = max(0, i - 24)
        expected = sum(energies[start:i+1]) / (i - start + 1)
        rows[i]["expected_kwh"] = round(expected, 2)
        
    return {"equipment_id": equipment_id, "history": rows}

@router.get("/{equipment_id}/health-history")
def get_equipment_health_history(equipment_id: str, days: int = 30):
    conn = get_connection()
    cursor = conn.cursor()
    hours = days * 24
    
    cursor.execute("""
        SELECT timestamp, energy_kwh, operating_state, anomaly_score, severity, is_anomaly
        FROM telemetry
        WHERE equipment_id = ?
        ORDER BY timestamp DESC
        LIMIT ?
    """, (equipment_id, hours))
    
    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()
    
    if not rows:
        raise HTTPException(status_code=404, detail="Equipment not found")
        
    rows.reverse()
    
    # Calculate health score trend timeline
    trend = []
    for r in rows[::6]: # 6-hour sampled resolution
        score = float(r.get("anomaly_score") or 0.0)
        sev = r.get("severity") or "NORMAL"
        ded = 30 if sev == "CRITICAL" else (20 if sev == "HIGH" else (10 if sev == "MEDIUM" else 0))
        health = max(20, 100 - int(score * 30) - ded)
        trend.append({
            "timestamp": r["timestamp"],
            "health_score": health,
            "anomaly_score": score,
            "severity": sev
        })
        
    return {"equipment_id": equipment_id, "days": days, "health_trend": trend}
