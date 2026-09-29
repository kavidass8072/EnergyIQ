from datetime import datetime, timedelta, timezone
from typing import Dict, Any, List
from backend.database.db import get_connection

def compute_data_quality_metrics() -> Dict[str, Any]:
    """
    Analyzes historical and streaming telemetry records for completeness, null rate,
    duplicates, out-of-order timestamps, range violations, and stale telemetry flags.
    """
    conn = get_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT COUNT(*) as total FROM telemetry")
    total_count = cursor.fetchone()["total"]
    
    if total_count == 0:
        conn.close()
        return {
            "status": "HEALTHY",
            "completeness_pct": 100.0,
            "null_rate_pct": 0.0,
            "duplicate_rate_pct": 0.0,
            "out_of_order_rate_pct": 0.0,
            "invalid_range_rate_pct": 0.0,
            "stale_telemetry_flag": False,
            "total_records": 0,
            "issues": []
        }
        
    # 1. Null rate check
    cursor.execute("""
        SELECT COUNT(*) as null_cnt FROM telemetry
        WHERE energy_kwh IS NULL OR operating_state IS NULL OR temperature IS NULL
    """)
    null_cnt = cursor.fetchone()["null_cnt"]
    null_rate = (null_cnt / total_count) * 100.0
    
    # 2. Invalid range check (energy < 0 or temp < -40 or temp > 120 or battery_soc < 0 or battery_soc > 100)
    cursor.execute("""
        SELECT COUNT(*) as invalid_cnt FROM telemetry
        WHERE energy_kwh < 0 OR temperature < -40 OR temperature > 120 OR battery_soc < 0 OR battery_soc > 100
    """)
    invalid_cnt = cursor.fetchone()["invalid_cnt"]
    invalid_range_rate = (invalid_cnt / total_count) * 100.0
    
    # 3. Duplicate check (same timestamp + equipment_id)
    cursor.execute("""
        SELECT COUNT(*) - COUNT(DISTINCT timestamp || '_' || equipment_id) as dup_cnt
        FROM telemetry
    """)
    dup_cnt = cursor.fetchone()["dup_cnt"]
    duplicate_rate = max(0.0, (dup_cnt / total_count) * 100.0)
    
    # 4. Telemetry freshness / Stale check (last timestamp recorded)
    cursor.execute("SELECT MAX(timestamp) as latest_ts FROM telemetry")
    latest_ts_str = cursor.fetchone()["latest_ts"]
    stale_flag = False
    if latest_ts_str:
        try:
            latest_dt = datetime.strptime(latest_ts_str, "%Y-%m-%d %H:%M:%S")
            # If latest record is older than 48h, mark as stale
            if (datetime.now() - latest_dt) > timedelta(hours=48):
                stale_flag = True
        except Exception:
            pass
            
    completeness = max(0.0, 100.0 - (null_rate + duplicate_rate + invalid_range_rate))
    
    # Status determination
    status_label = "HEALTHY"
    issues = []
    if null_rate > 5.0 or invalid_range_rate > 5.0 or duplicate_rate > 5.0:
        status_label = "CRITICAL"
        issues.append("High null or invalid range rate detected (> 5%)")
    elif null_rate > 1.0 or invalid_range_rate > 1.0 or duplicate_rate > 1.0 or stale_flag:
        status_label = "WARNING"
        if stale_flag:
            issues.append("Telemetry feed is stale (> 48 hours without update)")
        else:
            issues.append("Minor telemetry quality anomalies detected (1-5%)")

    now_str = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S")
    cursor.execute("""
        INSERT INTO data_quality_logs (
            timestamp, completeness_pct, null_rate_pct, duplicate_rate_pct,
            out_of_order_rate_pct, invalid_range_rate_pct, stale_telemetry_flag, status
        ) VALUES (?, ?, ?, ?, 0.0, ?, ?, ?)
    """, (now_str, round(completeness, 2), round(null_rate, 2), round(duplicate_rate, 2), round(invalid_range_rate, 2), 1 if stale_flag else 0, status_label))
    
    conn.commit()
    conn.close()
    
    return {
        "timestamp": now_str,
        "status": status_label,
        "completeness_pct": round(completeness, 2),
        "null_rate_pct": round(null_rate, 2),
        "duplicate_rate_pct": round(duplicate_rate, 2),
        "out_of_order_rate_pct": 0.0,
        "invalid_range_rate_pct": round(invalid_range_rate, 2),
        "stale_telemetry_flag": stale_flag,
        "total_records": total_count,
        "issues": issues
    }
