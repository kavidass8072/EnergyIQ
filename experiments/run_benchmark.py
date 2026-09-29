import sys
import os
import json
import time
from datetime import datetime, timezone

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from ml.benchmark.adapters import SyntheticDatasetAdapter, ASHRAEDatasetAdapter
from ml.benchmark.evaluator import evaluate_benchmark_dataset

def run_reproducible_experiments():
    output_dir = os.path.join(os.path.dirname(__file__), "results")
    os.makedirs(output_dir, exist_ok=True)
    
    print("=== EnergyIQ Reproducible ML Experiment Execution ===")
    
    # Experiment 1: Synthetic Ground-Truth Labeled Dataset
    print("\n[1/2] Running Synthetic Campus Microgrid Experiment...")
    t0 = time.time()
    synth_adapter = SyntheticDatasetAdapter()
    synth_results = evaluate_benchmark_dataset(synth_adapter)
    synth_duration = time.time() - t0
    
    # Experiment 2: Unsupervised Public Benchmark (ASHRAE Sample Fixture)
    print("\n[2/2] Running ASHRAE Public Building Energy Experiment...")
    t0 = time.time()
    ashrae_adapter = ASHRAEDatasetAdapter()
    ashrae_results = evaluate_benchmark_dataset(ashrae_adapter)
    ashrae_duration = time.time() - t0
    
    timestamp_str = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
    experiment_payload = {
        "experiment_id": f"EXP-{timestamp_str}",
        "executed_at": datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC"),
        "experiments": [
            {
                "name": "Synthetic Ground-Truth Labeled Benchmark",
                "execution_duration_sec": round(synth_duration, 3),
                "metrics": synth_results
            },
            {
                "name": "ASHRAE Public Benchmark (Unsupervised)",
                "execution_duration_sec": round(ashrae_duration, 3),
                "metrics": ashrae_results
            }
        ]
    }
    
    result_path = os.path.join(output_dir, f"benchmark_experiment_{timestamp_str}.json")
    latest_path = os.path.join(output_dir, "benchmark_latest.json")
    
    with open(result_path, "w") as f:
        json.dump(experiment_payload, f, indent=2)
    with open(latest_path, "w") as f:
        json.dump(experiment_payload, f, indent=2)
        
    print(f"\n[OK] Experiment execution complete! Saved output to: {result_path}")
    return experiment_payload

if __name__ == "__main__":
    run_reproducible_experiments()
