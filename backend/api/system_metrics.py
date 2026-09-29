import time
from fastapi import APIRouter
from backend.database.db import get_connection
from backend.streaming.simulator import streaming_manager

router = APIRouter(prefix="/api/system", tags=["system-metrics"])

# Basic request counters for observability
metrics_state = {
    "total_requests": 0,
    "error_requests": 0,
    "latencies_ms": []
}

def record_request_metric(latency_ms: float, is_error: bool = False):
    metrics_state["total_requests"] += 1
    if is_error:
        metrics_state["error_requests"] += 1
    metrics_state["latencies_ms"].append(latency_ms)
    if len(metrics_state["latencies_ms"]) > 500:
        metrics_state["latencies_ms"].pop(0)

@router.get("/metrics")
def get_system_metrics():
    avg_lat = round(sum(metrics_state["latencies_ms"]) / len(metrics_state["latencies_ms"]), 2) if metrics_state["latencies_ms"] else 0.0
    
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) as cnt FROM telemetry")
    total_telemetry = cursor.fetchone()["cnt"]
    cursor.execute("SELECT COUNT(*) as cnt FROM alerts WHERE status = 'ACTIVE'")
    active_alerts = cursor.fetchone()["cnt"]
    cursor.execute("SELECT COUNT(*) as cnt FROM audit_logs")
    total_audits = cursor.fetchone()["cnt"]
    conn.close()
    
    stream_status = streaming_manager.get_status()
    
    return {
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
        "total_http_requests": metrics_state["total_requests"],
        "error_http_requests": metrics_state["error_requests"],
        "average_http_latency_ms": avg_lat,
        "active_websockets": stream_status["connected_clients"],
        "streaming_events_received": stream_status["events_received"],
        "total_telemetry_records": total_telemetry,
        "active_alerts_count": active_alerts,
        "total_audit_logs": total_audits,
        "status": "HEALTHY"
    }
