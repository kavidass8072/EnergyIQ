import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import time
import json
import numpy as np
import pandas as pd
from fastapi.testclient import TestClient
from backend.main import app
from backend.database.db import get_connection
from backend.auth.security import create_access_token
from ml.anomaly_detector import ContextualIsolationForestDetector
from ml.synthetic_generator import generate_campus_dataset

client = TestClient(app)
admin_token = create_access_token({"sub": "admin", "role": "ADMIN", "user_id": 1})
headers = {"Authorization": f"Bearer {admin_token}"}

def measure_api_latencies():
    endpoints = [
        ("/api/system/health", "GET"),
        ("/api/dashboard/summary", "GET"),
        ("/api/equipment", "GET"),
        ("/api/alerts", "GET"),
        ("/api/ml/drift", "GET"),
        ("/api/ml/models", "GET"),
        ("/api/streaming/status", "GET")
    ]
    results = {}
    for path, method in endpoints:
        latencies = []
        for _ in range(20):
            t0 = time.perf_counter()
            if method == "GET":
                res = client.get(path, headers=headers)
            t1 = time.perf_counter()
            latencies.append((t1 - t0) * 1000.0) # ms
        results[path] = {
            "mean_ms": round(float(np.mean(latencies)), 2),
            "p95_ms": round(float(np.percentile(latencies, 95)), 2),
            "min_ms": round(float(np.min(latencies)), 2),
            "max_ms": round(float(np.max(latencies)), 2)
        }
    return results

def measure_db_latencies():
    conn = get_connection()
    cursor = conn.cursor()
    
    # Measure telemetry 24h query
    t0 = time.perf_counter()
    cursor.execute("SELECT * FROM telemetry ORDER BY timestamp DESC LIMIT 168")
    cursor.fetchall()
    t1 = time.perf_counter()
    query_24h_ms = (t1 - t0) * 1000.0
    
    # Measure alerts count query
    t0 = time.perf_counter()
    cursor.execute("SELECT status, severity, COUNT(*) FROM alerts GROUP BY status, severity")
    cursor.fetchall()
    t1 = time.perf_counter()
    query_alerts_ms = (t1 - t0) * 1000.0
    
    conn.close()
    return {
        "telemetry_history_query_ms": round(query_24h_ms, 2),
        "alert_aggregation_query_ms": round(query_alerts_ms, 2)
    }

def measure_ml_inference():
    df = generate_campus_dataset(days=14, seed=42)
    detector = ContextualIsolationForestDetector(contamination=0.08)
    
    t0 = time.perf_counter()
    detector.fit(df)
    t1 = time.perf_counter()
    fit_time_ms = (t1 - t0) * 1000.0
    
    t0 = time.perf_counter()
    detector.predict(df)
    t2 = time.perf_counter()
    predict_time_ms = (t2 - t1) * 1000.0
    
    return {
        "record_count": len(df),
        "fit_time_ms": round(fit_time_ms, 2),
        "predict_time_ms": round(predict_time_ms, 2),
        "per_sample_predict_ms": round(predict_time_ms / len(df), 4)
    }

if __name__ == "__main__":
    print("--- EnergyIQ Performance Measurement Benchmark ---")
    api_bench = measure_api_latencies()
    db_bench = measure_db_latencies()
    ml_bench = measure_ml_inference()
    
    output = {
        "api_latencies": api_bench,
        "database_latencies": db_bench,
        "ml_inference": ml_bench
    }
    print(json.dumps(output, indent=2))
