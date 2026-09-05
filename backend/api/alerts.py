import json
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from backend.database.db import get_connection

router = APIRouter(prefix="/api/alerts", tags=["alerts"])

class AlertReviewRequest(BaseModel):
    status: str  # REVIEWED or RESOLVED
    resolution_notes: Optional[str] = None

@router.get("")
def get_alerts(status: Optional[str] = None, severity: Optional[str] = None, equipment_id: Optional[str] = None):
    conn = get_connection()
    cursor = conn.cursor()
    
    query = "SELECT * FROM alerts WHERE 1=1"
    params = []
    
    if status:
        query += " AND status = ?"
        params.append(status)
    if severity:
        query += " AND severity = ?"
        params.append(severity)
    if equipment_id:
        query += " AND equipment_id = ?"
        params.append(equipment_id)
        
    query += " ORDER BY timestamp DESC LIMIT 100"
    
    cursor.execute(query, params)
    rows = [dict(r) for r in cursor.fetchall()]
    
    # Parse evidence JSON
    for r in rows:
        try:
            r["evidence"] = json.loads(r["evidence_json"])
        except Exception:
            r["evidence"] = [r["evidence_json"]]
            
    conn.close()
    return {"alerts": rows, "count": len(rows)}

@router.get("/{alert_id}")
def get_alert_detail(alert_id: int):
    conn = get_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM alerts WHERE id = ?", (alert_id,))
    alert_row = cursor.fetchone()
    conn.close()
    
    if not alert_row:
        raise HTTPException(status_code=404, detail="Alert not found")
        
    alert = dict(alert_row)
    try:
        alert["evidence"] = json.loads(alert["evidence_json"])
    except Exception:
        alert["evidence"] = [alert["evidence_json"]]
        
    return alert

@router.post("/{alert_id}/review")
def review_alert(alert_id: int, req: AlertReviewRequest):
    allowed_statuses = ["ACTIVE", "REVIEWED", "UNDER_INVESTIGATION", "RESOLVED", "FALSE_POSITIVE"]
    if req.status not in allowed_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of {allowed_statuses}")
        
    conn = get_connection()
    cursor = conn.cursor()
    
    cursor.execute("UPDATE alerts SET status = ? WHERE id = ?", (req.status, alert_id))
    if cursor.rowcount == 0:
        conn.close()
        raise HTTPException(status_code=404, detail="Alert not found")
        
    conn.commit()
    conn.close()
    
    return {"message": f"Alert {alert_id} status updated to {req.status}", "alert_id": alert_id, "status": req.status}
