# EnergyIQ — Public Dataset Validation Report

## 1. Overview
EnergyIQ isolates labeled synthetic ground-truth metrics (used for precision/recall evaluation) from unlabeled public benchmark datasets (used for unsupervised anomaly rate diagnostics).

## 2. Executed Dataset Adapters

### A. ASHRAE Great Energy Predictor III (Sample Fixture)
- **Source**: Kaggle / ASHRAE Great Energy Predictor III competition dataset adapter (`ml/benchmark/adapters.py`).
- **Access Status**: Executed local sample fixture (`sample_size=100` to `1440` hourly building meter readings).
- **Ground Truth Labels**: None (`has_ground_truth_labels = False`).
- **Unsupervised Anomaly Diagnostics**:
  - Total Samples Evaluated: 100
  - Detected Anomalies: 7
  - Anomaly Fraction: 7.00%
  - Average Anomaly Score: 0.642
- **Supervised Precision / Recall**: `N/A` (unlabeled dataset).

### B. Full Kaggle Competition Download
- **Full 20M+ Row Kaggle Dataset Download**: **PUBLIC_DATASET_EXECUTION = NOT EXECUTED** (Local environment lacks active Kaggle API token / internet download bandwidth; 100-row fixture adapter successfully validated).

## 3. Synthetic Campus Microgrid Ground Truth Dataset
- **Sample Count**: 1,440 hourly records (60 days across 7 canonical building assets).
- **Ground Truth Labels**: Present (`has_ground_truth_labels = True`).
- **Metrics**:
  - Precision: **99.41%**
  - Recall: **80.09%**
  - F1 Score: **88.71%**
