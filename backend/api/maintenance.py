from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
import datetime
from backend.database.db import get_connection

router = APIRouter(prefix="/api/maintenance", tags=["maintenance"])

class MaintenanceTaskCreate(BaseModel):
    equipment_id: str
    equipment_type: Optional[str] = "Equipment"
    priority: str = "HIGH" # LOW, MEDIUM, HIGH, CRITICAL
    issue_description: str
    linked_alert_id: Optional[int] = None
    assigned_technician: Optional[str] = "Unassigned"
    due_date: Optional[str] = None

class StatusUpdateRequest(BaseModel):
    status: str # UPCOMING, IN_PROGRESS, COMPLETED, OVERDUE

@router.get("")
def get_maintenance_overview():
    conn = get_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM maintenance_tasks ORDER BY id DESC")
    tasks = [dict(r) for r in cursor.fetchall()]
    
    # Generate AI Maintenance Insights dynamically from active alerts
    cursor.execute("""
        SELECT a.id as alert_id, a.equipment_id, a.equipment_type, a.severity,
               a.likely_fault, a.fault_confidence, a.dev_pct, a.maintenance_days,
               a.recommended_action
        FROM alerts a
        WHERE a.status = 'ACTIVE'
        ORDER BY a.fault_confidence DESC
    """)
    alerts_rows = [dict(r) for r in cursor.fetchall()]
    
    ai_insights = []
    for al in alerts_rows:
        ai_insights.append({
            "equipment_id": al["equipment_id"],
            "equipment_type": al["equipment_type"],
            "risk": al["severity"],
            "likely_issue": al["likely_fault"],
            "confidence": al["fault_confidence"],
            "linked_alert_id": al["alert_id"],
            "reason": f"Energy draw +{al['dev_pct']}% above expected baseline. {al['maintenance_days']} days since last service.",
            "recommended": al["recommended_action"]
        })
        
    conn.close()
    
    upcoming = [t for t in tasks if t["status"] == "UPCOMING"]
    overdue = [t for t in tasks if t["status"] == "OVERDUE"]
    completed = [t for t in tasks if t["status"] == "COMPLETED"]
    in_progress = [t for t in tasks if t["status"] == "IN_PROGRESS"]
    
    return {
        "tasks": tasks,
        "upcoming": upcoming,
        "overdue": overdue,
        "completed": completed,
        "in_progress": in_progress,
        "ai_insights": ai_insights
    }

@router.post("")
def create_maintenance_task(task: MaintenanceTaskCreate):
    conn = get_connection()
    cursor = conn.cursor()
    
    now_str = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    due_str = task.due_date if task.due_date else (datetime.datetime.now() + datetime.timedelta(days=2)).strftime("%Y-%m-%d %H:%M:%S")
    
    cursor.execute("""
        INSERT INTO maintenance_tasks (
            timestamp, equipment_id, equipment_type, priority, issue_description,
            linked_alert_id, status, assigned_technician, created_at, due_date
        ) VALUES (?, ?, ?, ?, ?, ?, 'UPCOMING', ?, ?, ?)
    """, (
        now_str,
        task.equipment_id,
        task.equipment_type,
        task.priority,
        task.issue_description,
        task.linked_alert_id,
        task.assigned_technician,
        now_str,
        due_str
    ))
    task_id = cursor.lastrowid
    
    # If linked alert, mark alert as UNDER_INVESTIGATION
    if task.linked_alert_id:
        cursor.execute("UPDATE alerts SET status = 'UNDER_INVESTIGATION' WHERE id = ?", (task.linked_alert_id,))
        
    conn.commit()
    conn.close()
    
    return {
        "message": "Maintenance task created successfully",
        "task_id": task_id,
        "equipment_id": task.equipment_id,
        "status": "UPCOMING"
    }

@router.put("/{task_id}/status")
def update_task_status(task_id: int, req: StatusUpdateRequest):
    allowed = ["UPCOMING", "IN_PROGRESS", "COMPLETED", "OVERDUE"]
    if req.status not in allowed:
        raise HTTPException(status_code=400, detail=f"Status must be one of {allowed}")
        
    conn = get_connection()
    cursor = conn.cursor()
    
    cursor.execute("UPDATE maintenance_tasks SET status = ? WHERE id = ?", (req.status, task_id))
    if cursor.rowcount == 0:
        conn.close()
        raise HTTPException(status_code=404, detail="Maintenance task not found")
        
    conn.commit()
    conn.close()
    
    return {"message": f"Task {task_id} status updated to {req.status}", "task_id": task_id, "status": req.status}
