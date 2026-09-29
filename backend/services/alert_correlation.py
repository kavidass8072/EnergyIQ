from typing import List, Dict, Any
from backend.database.db import get_connection

def compute_correlated_alerts() -> List[Dict[str, Any]]:
    """
    Analyzes active anomaly alerts across equipment assets to identify co-occurring system-level
    correlated events (e.g. Multiple HVAC over-exertion during high ambient heat).
    """
    conn = get_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT * FROM alerts
        WHERE status IN ('ACTIVE', 'UNDER_INVESTIGATION')
        ORDER BY timestamp DESC LIMIT 50
    """)
    rows = cursor.fetchall()
    conn.close()
    
    if not rows:
        return []
        
    alerts = [dict(r) for r in rows]
    correlated_events = []
    
    # Group HVAC / Cooling alerts
    hvac_alerts = [a for a in alerts if "HVAC" in a["equipment_id"] or "Chiller" in a["equipment_type"]]
    if len(hvac_alerts) >= 2:
        correlated_events.append({
            "correlation_id": "CORR-HVAC-HEATWAVE",
            "title": "Facility Cooling / HVAC Cluster Over-Exertion",
            "combined_severity": "CRITICAL" if any(a["severity"] == "CRITICAL" for a in hvac_alerts) else "HIGH",
            "affected_equipment": [a["equipment_id"] for a in hvac_alerts],
            "related_alert_ids": [a["id"] for a in hvac_alerts],
            "summary_evidence": "Multiple cooling units exhibiting simultaneous power draw surge under elevated ambient temperature.",
            "recommended_action": "Inspect central chilled water loop, check refrigerant pressures, and set temporary setback controls."
        })
        
    # Group Motor / Pump / Compressor alerts
    motor_alerts = [a for a in alerts if a["equipment_type"] in ["Heavy Motor", "Fluid Pump", "Industrial Compressor"]]
    if len(motor_alerts) >= 2:
        correlated_events.append({
            "correlation_id": "CORR-MECHANICAL-CLUSTER",
            "title": "Production Line Mechanical Resistance Group",
            "combined_severity": "HIGH",
            "affected_equipment": [a["equipment_id"] for a in motor_alerts],
            "related_alert_ids": [a["id"] for a in motor_alerts],
            "summary_evidence": "Co-occurring mechanical friction / current draw surge across production line drive motors.",
            "recommended_action": "Inspect drive couplings, lubrication systems, and phase voltage balance across mechanical line."
        })
        
    return correlated_events
