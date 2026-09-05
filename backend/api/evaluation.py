import os
import pandas as pd
from fastapi import APIRouter
from backend.database.db import get_connection
from ml.evaluation import evaluate_models
from ml.cost_analysis import calculate_cost_impact

router = APIRouter(prefix="/api/evaluation", tags=["evaluation"])

@router.get("/compare")
def get_model_evaluation_report():
    conn = get_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM telemetry")
    rows = cursor.fetchall()
    
    if not rows:
        conn.close()
        return {"error": "Telemetry database empty. Run data loader seeder first."}
        
    df = pd.DataFrame([dict(r) for r in rows])
    
    # Calculate baseline vs proposed model evaluation metrics
    eval_results = evaluate_models(df)
    
    # Calculate active alerts cost simulation
    cursor.execute("SELECT * FROM alerts WHERE status = 'ACTIVE'")
    alert_rows = [dict(r) for r in cursor.fetchall()]
    df_alerts = pd.DataFrame(alert_rows) if alert_rows else pd.DataFrame()
    
    cost_summary = calculate_cost_impact(df_alerts)
    conn.close()
    
    return {
        "targets": eval_results["targets"],
        "baseline": eval_results["baseline"],
        "proposed": eval_results["proposed"],
        "cost_impact": cost_summary
    }
