# 📊 EnergyIQ Benchmark Dataset Evaluation Framework

## 1. Overview
EnergyIQ provides an extensible Dataset Adapter architecture (`BaseDatasetAdapter`) to benchmark anomaly detection models across both internal ground-truth labeled datasets and public real-world building energy datasets (e.g. ASHRAE Great Energy Predictor III).

---

## 2. Supported Dataset Adapters

1. **Synthetic Campus Adapter (`SyntheticDatasetAdapter`)**:
   - Internal 60-day commercial campus telemetry (10,080 hourly records).
   - Contains ground-truth fault labels (`is_anomaly`, `fault_label`).
   - Evaluates Supervised Metrics: Precision %, Recall %, F1-Score %, FPR %, Confusion Matrix.

2. **ASHRAE Benchmark Adapter (`ASHRAEDatasetAdapter`)**:
   - Public building energy meter schema (electricity, weather, ambient temperature).
   - Unsupervised dataset without ground-truth labels.
   - Evaluates Unsupervised Metrics: Anomaly fraction %, Score Density, Mean/Max anomaly scores. Prevents metric fabrication.
