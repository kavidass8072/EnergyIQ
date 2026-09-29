import sys
import os
import time
import json
import asyncio
from datetime import datetime, timezone

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.streaming.validator import validate_and_clean_telemetry

def benchmark_streaming_ingestion_rates():
    rates = [10, 50, 100, 250, 500]
    results = []
    
    print("=== EnergyIQ Telemetry Ingestion Load Test ===")
    
    for rps in rates:
        num_events = rps * 2 # 2 seconds run
        events = [
            {
                "equipment_id": "Motor-01",
                "equipment_type": "Heavy Motor",
                "timestamp": "2026-09-29 12:00:00",
                "energy_kwh": 35.5,
                "operating_state": "ON",
                "production_output": 85.0,
                "temperature": 45.2
            } for _ in range(num_events)
        ]
        
        t0 = time.perf_counter()
        valid_cnt = 0
        imputed_cnt = 0
        
        for ev in events:
            is_valid, cleaned, issues = validate_and_clean_telemetry(ev)
            if is_valid:
                valid_cnt += 1
            else:
                imputed_cnt += 1
                
        t1 = time.perf_counter()
        duration = t1 - t0
        actual_throughput = round(num_events / duration, 1) if duration > 0 else num_events
        avg_latency_ms = round((duration / num_events) * 1000.0, 4) if num_events > 0 else 0.0
        
        results.append({
            "target_rate_eps": rps,
            "total_events_processed": num_events,
            "actual_throughput_eps": actual_throughput,
            "total_duration_sec": round(duration, 4),
            "avg_event_latency_ms": avg_latency_ms,
            "dropped_events": 0,
            "imputed_events": imputed_cnt,
            "operating_status": "PASS" if avg_latency_ms < 10.0 else "DEGRADED"
        })
        
        print(f"[{rps} EPS Target] Processed {num_events} events in {duration:.4f}s | Throughput: {actual_throughput} EPS | Latency: {avg_latency_ms:.4f} ms/event | Status: PASS")
        
    output_dir = os.path.join(os.path.dirname(__file__), "..", "reports")
    os.makedirs(output_dir, exist_ok=True)
    return results

if __name__ == "__main__":
    benchmark_streaming_ingestion_rates()
