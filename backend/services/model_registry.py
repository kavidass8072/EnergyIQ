import json
from typing import List, Dict, Any, Optional
from backend.database.db import get_connection

def list_all_models() -> List[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM ml_models ORDER BY created_at DESC")
    rows = cursor.fetchall()
    conn.close()
    
    result = []
    for r in rows:
        d = dict(r)
        d["active"] = bool(d["active"])
        d["is_active"] = d["active"]
        d["id"] = d.get("model_id")
        d["name"] = d.get("model_name")
        try:
            d["parameters"] = json.loads(d["parameters_json"])
        except Exception:
            d["parameters"] = {}
        try:
            d["metrics"] = json.loads(d["metrics_json"])
        except Exception:
            d["metrics"] = {}
        result.append(d)
    return result

def get_model_by_id(model_id: str) -> Optional[Dict[str, Any]]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM ml_models WHERE model_id = ?", (model_id,))
    row = cursor.fetchone()
    conn.close()
    if not row:
        return None
    d = dict(row)
    d["active"] = bool(d["active"])
    d["is_active"] = d["active"]
    d["id"] = d.get("model_id")
    d["name"] = d.get("model_name")
    try:
        d["parameters"] = json.loads(d["parameters_json"])
    except Exception:
        d["parameters"] = {}
    try:
        d["metrics"] = json.loads(d["metrics_json"])
    except Exception:
        d["metrics"] = {}
    return d

def activate_model(model_id: str) -> bool:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT model_id FROM ml_models WHERE model_id = ?", (model_id,))
    if not cursor.fetchone():
        conn.close()
        return False
        
    cursor.execute("UPDATE ml_models SET active = 0, status = 'VALIDATED' WHERE active = 1")
    cursor.execute("UPDATE ml_models SET active = 1, status = 'ACTIVE' WHERE model_id = ?", (model_id,))
    conn.commit()
    conn.close()
    return True

def rollback_model(target_model_id: str) -> bool:
    """Atomically rolls back the active model engine to a specified previous model version."""
    return activate_model(target_model_id)
