from fastapi import APIRouter
from backend.database.db import get_connection

router = APIRouter(prefix="/api/search", tags=["search"])

@router.get("")
def search_global(q: str = ""):
    if not q or len(q.strip()) < 1:
        return {"equipment": [], "alerts": [], "maintenance": []}
        
    query_str = f"%{q.strip()}%"
    conn = get_connection()
    cursor = conn.cursor()
    
    # 1. Search equipment
    cursor.execute("""
        SELECT DISTINCT equipment_id, equipment_type 
        FROM telemetry 
        WHERE equipment_id LIKE ? OR equipment_type LIKE ?
        LIMIT 10
    """, (query_str, query_str))
    equipment_matches = [dict(r) for r in cursor.fetchall()]
    
    # 2. Search alerts
    cursor.execute("""
        SELECT id, equipment_id, severity, likely_fault, timestamp, status
        FROM alerts
        WHERE equipment_id LIKE ? OR likely_fault LIKE ? OR severity LIKE ?
        ORDER BY timestamp DESC
        LIMIT 10
    """, (query_str, query_str, query_str))
    alert_matches = [dict(r) for r in cursor.fetchall()]
    
    # 3. Search maintenance
    cursor.execute("""
        SELECT id, equipment_id, priority, issue_description, assigned_technician, status
        FROM maintenance_tasks
        WHERE equipment_id LIKE ? OR issue_description LIKE ? OR assigned_technician LIKE ?
        ORDER BY id DESC
        LIMIT 10
    """, (query_str, query_str, query_str))
    maint_matches = [dict(r) for r in cursor.fetchall()]
    
    conn.close()
    
    return {
        "query": q,
        "equipment": equipment_matches,
        "alerts": alert_matches,
        "maintenance": maint_matches
    }
