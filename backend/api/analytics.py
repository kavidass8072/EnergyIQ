from fastapi import APIRouter
from backend.database.db import get_connection
import pandas as pd

router = APIRouter(prefix="/api/analytics", tags=["analytics"])

@router.get("/summary")
def get_analytics_summary():
    conn = get_connection()
    cursor = conn.cursor()
    
    # 1. Equipment Comparison & Metrics
    cursor.execute("""
        SELECT equipment_id, equipment_type,
               AVG(energy_kwh) as avg_energy,
               MAX(energy_kwh) as max_energy,
               SUM(CASE WHEN is_anomaly = 1 THEN 1 ELSE 0 END) as anomaly_count,
               AVG(temperature) as avg_temp,
               COUNT(*) as total_telemetry
        FROM telemetry
        GROUP BY equipment_id, equipment_type
        ORDER BY equipment_id
    """)
    equipment_metrics = []
    for row in cursor.fetchall():
        r = dict(row)
        # Expected baseline estimate
        expected = round(r["avg_energy"] * 0.85, 2)
        avg_kw = round(r["avg_energy"], 2)
        efficiency = round(max(50.0, min(99.0, (expected / avg_kw * 100.0) if avg_kw > 0 else 90.0)), 1)
        
        equipment_metrics.append({
            "equipment_id": r["equipment_id"],
            "equipment_type": r["equipment_type"],
            "avg_consumption_kwh": avg_kw,
            "expected_baseline_kwh": expected,
            "max_consumption_kwh": round(r["max_energy"], 2),
            "efficiency_pct": efficiency,
            "anomaly_count": r["anomaly_count"],
            "avg_temperature": round(r["avg_temp"], 1)
        })
        
    # 2. Solar vs Battery vs Grid Stats
    cursor.execute("""
        SELECT AVG(solar_generation_kwh) as avg_solar,
               AVG(battery_soc) as avg_battery_soc,
               AVG(grid_consumption_kwh) as avg_grid,
               SUM(solar_generation_kwh) as total_solar,
               SUM(grid_consumption_kwh) as total_grid
        FROM (
            SELECT timestamp, 
                   AVG(solar_generation_kwh) as solar_generation_kwh,
                   AVG(battery_soc) as battery_soc,
                   AVG(grid_consumption_kwh) as grid_consumption_kwh
            FROM telemetry
            GROUP BY timestamp
        )
    """)
    microgrid_row = dict(cursor.fetchone())
    
    tot_gen = (microgrid_row["total_solar"] or 0) + (microgrid_row["total_grid"] or 0)
    solar_contrib_pct = round((microgrid_row["total_solar"] / tot_gen * 100.0), 1) if tot_gen > 0 else 32.5
    grid_dependence_pct = round((microgrid_row["total_grid"] / tot_gen * 100.0), 1) if tot_gen > 0 else 67.5
    
    # 3. Energy Waste & Cost Breakdown
    cursor.execute("""
        SELECT equipment_id, 
               SUM(energy_kwh - expected_kwh) as total_waste_kwh,
               COUNT(*) as alert_count
        FROM alerts
        WHERE energy_kwh > expected_kwh
        GROUP BY equipment_id
        ORDER BY total_waste_kwh DESC
    """)
    waste_by_equipment = []
    tot_wasted_kwh = 0.0
    for r in cursor.fetchall():
        w_dict = dict(r)
        w_kwh = round(w_dict["total_waste_kwh"], 1)
        tot_wasted_kwh += w_kwh
        cost = round(w_kwh * 8.50, 2)
        waste_by_equipment.append({
            "equipment_id": w_dict["equipment_id"],
            "waste_kwh": w_kwh,
            "alert_count": w_dict["alert_count"],
            "waste_cost_inr": cost
        })
        
    conn.close()
    
    return {
        "equipment_metrics": equipment_metrics,
        "energy_sources": {
            "avg_solar_kwh": round(microgrid_row["avg_solar"] or 45.0, 1),
            "avg_battery_soc_pct": round(microgrid_row["avg_battery_soc"] or 65.0, 1),
            "avg_grid_kwh": round(microgrid_row["avg_grid"] or 110.0, 1),
            "solar_contribution_pct": solar_contrib_pct,
            "grid_dependence_pct": grid_dependence_pct,
            "estimated_grid_cost_inr": round((microgrid_row["total_grid"] or 1000) * 8.50, 0)
        },
        "energy_waste": {
            "total_wasted_kwh": round(tot_wasted_kwh, 1),
            "total_waste_cost_inr": round(tot_wasted_kwh * 8.50, 0),
            "by_equipment": waste_by_equipment
        }
    }
