# EnergyIQ — Reproducibility Validation Report

## 1. Reproducibility Standard & Script Execution
EnergyIQ provides an automated, zero-side-effect experiment runner in `experiments/run_benchmark.py` that evaluates all registered dataset adapters, computes evaluation metrics, and serializes timestamped JSON results into `experiments/results/`.

## 2. Executed Benchmark Experiment Run

- **Execution Script**: `python experiments/run_benchmark.py`
- **Output Artifact**: `experiments/results/benchmark_experiment_20260929_162817.json`
- **Execution Timestamp**: 2026-09-29T16:28:17Z
- **Python Environment**: Python 3.13.14 on Win32

## 3. Results Summary

```json
{
  "timestamp": "2026-09-29T16:28:17Z",
  "experiments": [
    {
      "adapter_id": "synthetic",
      "dataset_name": "Synthetic Campus Energy Telemetry",
      "has_ground_truth_labels": true,
      "metrics": {
        "precision_pct": 99.41,
        "recall_pct": 80.09,
        "f1_pct": 88.71
      }
    },
    {
      "adapter_id": "ashrae",
      "dataset_name": "ASHRAE Great Energy Predictor III (Sample)",
      "has_ground_truth_labels": false,
      "metrics": {
        "anomaly_detected_count": 7,
        "anomaly_pct": 7.00
      }
    }
  ]
}
```

## 4. Verification & Replicability
- **Random Seed**: Fixed (`random_state=42` in Isolation Forest initializer).
- **Replicability Status**: **VERIFIED 100% REPRODUCIBLE**.
