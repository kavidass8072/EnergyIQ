from fastapi import APIRouter, HTTPException
from typing import Optional
import datetime
from backend.database.db import get_connection

router = APIRouter(prefix="/api/reports", tags=["reports"])

@router.get("/generate")
def generate_report(type: str = "system_health"):
    conn = get_connection()
    cursor = conn.cursor()
    
    now_str = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    # Common stats
    cursor.execute("SELECT COUNT(DISTINCT equipment_id) FROM telemetry")
    total_equipment = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM alerts WHERE status = 'ACTIVE'")
    active_alerts = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM alerts")
    total_alerts = cursor.fetchone()[0]
    
    cursor.execute("SELECT * FROM alerts ORDER BY timestamp DESC LIMIT 20")
    recent_alerts = [dict(r) for r in cursor.fetchall()]
    
    cursor.execute("SELECT * FROM maintenance_tasks ORDER BY id DESC")
    maint_tasks = [dict(r) for r in cursor.fetchall()]
    
    conn.close()
    
    title = "Campus Energy System Health Report"
    summary = "Comprehensive operational evaluation of commercial campus microgrid assets, energy consumption patterns, and AI anomaly detections."
    
    if type == "anomaly":
        title = "Equipment Energy Anomaly & Fault Link Report"
        summary = f"Detailed audit of {total_alerts} detected energy anomalies across campus equipment including severity breakdown, fault linking, and physical evidence."
    elif type == "evaluation":
        title = "ML Anomaly Detector & Fault Linking Evaluation Report"
        summary = "Performance benchmark comparing proposed Contextual Isolation Forest model against baseline rolling 24h Z-score."
    elif type == "maintenance":
        title = "Campus Predictive Maintenance Plan & Audit"
        summary = "Active maintenance work orders, overdue equipment service schedules, and AI-predicted maintenance recommendations."
    elif type == "cost":
        title = "Energy Waste & Cost Impact Analysis Report"
        summary = "Financial analysis of energy inefficiency, abnormal equipment power draw, grid reliance cost, and potential cost savings."
        
    return {
        "report_id": f"REP-{datetime.datetime.now().strftime('%Y%m%d%H%M%S')}",
        "type": type,
        "title": title,
        "summary": summary,
        "generated_at": now_str,
        "facility": "Commercial Campus Facility #1",
        "author": "EnergyIQ Automated Intelligence Engine",
        "kpis": {
            "total_equipment": total_equipment,
            "active_alerts": active_alerts,
            "total_historical_alerts": total_alerts,
            "maintenance_tasks_count": len(maint_tasks)
        },
        "recent_alerts": recent_alerts[:10],
        "maintenance_tasks": maint_tasks[:10]
    }
