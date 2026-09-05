import pandas as pd
import numpy as np
from typing import Dict, Any, List

# Standard commercial campus electricity tariff rate
COST_PER_KWH = 12.50  # e.g., ₹12.50 / kWh (or $0.15 equivalent)

def calculate_cost_impact(df_anomalies: pd.DataFrame) -> Dict[str, Any]:
    """
    Simulates business cost impact and potential financial savings
    realized through early anomaly detection and proactive maintenance intervention.
    """
    total_wasted_kwh = 0.0
    total_late_cost = 0.0
    total_early_cost = 0.0
    total_avoided_savings = 0.0
    alert_cost_breakdown: List[Dict[str, Any]] = []
    
    if df_anomalies.empty:
        return {
            "currency": "₹",
            "total_wasted_kwh": 0.0,
            "total_late_cost": 0.0,
            "total_early_cost": 0.0,
            "total_avoided_savings": 0.0,
            "avg_lead_time_hours": 0.0,
            "alert_breakdown": []
        }
        
    for _, row in df_anomalies.iterrows():
        eq_id = row.get("equipment_id", "Unknown")
        fault = row.get("likely_fault", "Unknown Anomaly")
        energy = row.get("energy_kwh", 0.0)
        expected = row.get("rolling_mean_24h", energy * 0.7)
        severity = row.get("severity", "MEDIUM")
        
        excess_kwh_per_hr = max(0.5, energy - expected)
        
        # Scenario simulation:
        # Late detection: fault continues unaddressed for 14 days (336 hours)
        late_duration_hrs = 336
        late_energy_waste = excess_kwh_per_hr * late_duration_hrs
        late_energy_cost = late_energy_waste * COST_PER_KWH
        # Major breakdown emergency repair surcharge
        emergency_repair_cost = 5000.0 if severity == "CRITICAL" else 2500.0
        total_late = late_energy_cost + emergency_repair_cost
        
        # Early detection: caught within 18 hours
        early_lead_hrs = 318  # 336 - 18 hours lead time
        early_energy_waste = excess_kwh_per_hr * 18
        early_energy_cost = early_energy_waste * COST_PER_KWH
        proactive_service_cost = 800.0  # Planned minor maintenance cost
        total_early = early_energy_cost + proactive_service_cost
        
        avoided_savings = max(0.0, total_late - total_early)
        
        total_wasted_kwh += excess_kwh_per_hr
        total_late_cost += total_late
        total_early_cost += total_early
        total_avoided_savings += avoided_savings
        
        alert_cost_breakdown.append({
            "equipment_id": eq_id,
            "fault": fault,
            "severity": severity,
            "excess_kwh_per_hr": round(excess_kwh_per_hr, 2),
            "estimated_late_cost": round(total_late, 2),
            "estimated_early_cost": round(total_early, 2),
            "potential_savings": round(avoided_savings, 2),
            "lead_time_hours": early_lead_hrs
        })
        
    return {
        "disclaimer": "Simulated estimate based on synthetic campus telemetry and configured electricity tariff (₹12.50/kWh) and impact assumptions.",
        "assumptions": {
            "tariff_per_kwh": COST_PER_KWH,
            "late_detection_duration_hours": 336,
            "early_intervention_hours": 18,
            "proactive_service_cost": 800.0,
            "emergency_repair_cost_high": 2500.0,
            "emergency_repair_cost_critical": 5000.0
        },
        "currency": "₹",
        "total_wasted_kwh_per_hr": round(total_wasted_kwh, 2),
        "total_late_cost": round(total_late_cost, 2),
        "total_early_cost": round(total_early_cost, 2),
        "total_avoided_savings": round(total_avoided_savings, 2),
        "avg_lead_time_hours": 318.0,
        "alert_breakdown": alert_cost_breakdown[:10]  # Top 10 sample alerts
    }
