from fastapi import APIRouter, Depends
from typing import Dict, Any, List
from backend.services.data_quality import compute_data_quality_metrics
from backend.database.db import get_connection

router = APIRouter(prefix="/api/data-quality", tags=["data-quality"])

@router.get("/summary")
def get_data_quality_summary():
    return compute_data_quality_metrics()

@router.get("/history")
def get_data_quality_history(limit: int = 24):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM data_quality_logs ORDER BY id DESC LIMIT ?", (limit,))
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]
