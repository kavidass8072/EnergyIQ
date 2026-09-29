import time
from fastapi import APIRouter
from backend.database.db import get_connection
from backend.streaming.simulator import streaming_manager

router = APIRouter(prefix="/api/system", tags=["system-health"])

@router.get("/health")
def get_system_health():
    db_status = "DISCONNECTED"
    db_latency_ms = 0.0
    active_alerts_cnt = 0
    total_telemetry_cnt = 0
    
    # 1. Test SQLite DB connection & query speed
    try:
        t0 = time.time()
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) as cnt FROM telemetry")
        total_telemetry_cnt = cursor.fetchone()["cnt"]
        cursor.execute("SELECT COUNT(*) as cnt FROM alerts WHERE status = 'ACTIVE'")
        active_alerts_cnt = cursor.fetchone()["cnt"]
        conn.close()
        db_latency_ms = round((time.time() - t0) * 1000.0, 2)
        db_status = "HEALTHY"
    except Exception as e:
        db_status = f"ERROR: {e}"

    # 2. Check streaming status
    stream_status = streaming_manager.get_status()
    
    # 3. Comprehensive status determination
    overall_status = "HEALTHY"
    if db_status != "HEALTHY":
        overall_status = "CRITICAL"
    elif active_alerts_cnt > 5:
        overall_status = "DEGRADED"
        
    return {
        "overall_status": overall_status,
        "application": "EnergyIQ Intelligence Engine",
        "version": "2.5.0 (Milestone 2 Production-Oriented Prototype)",
        "components": {
            "api": {"status": "HEALTHY", "service": "FastAPI Uvicorn"},
            "database": {"status": db_status, "latency_ms": db_latency_ms, "total_records": total_telemetry_cnt},
            "streaming": stream_status,
            "ml_engine": {"status": "HEALTHY", "model": "Contextual Isolation Forest"}
        },
        "active_alerts_count": active_alerts_cnt
    }

@router.get("/readiness")
def get_system_readiness():
    """Readiness probe endpoint for Docker/Kubernetes container orchestrators."""
    db_ok = False
    try:
        conn = get_connection()
        c = conn.cursor()
        c.execute("SELECT 1")
        conn.close()
        db_ok = True
    except Exception:
        db_ok = False
        
    ready = db_ok and streaming_manager is not None
    return {
        "status": "READY" if ready else "NOT_READY",
        "ready": ready,
        "database": "OK" if db_ok else "UNAVAILABLE",
        "streaming_manager": "OK" if streaming_manager else "UNAVAILABLE"
    }
