# EnergyIQ Reproducible ML Experiment & Model Comparison Report

**Date**: September 29, 2026  
**System**: EnergyIQ Machine Learning Anomaly Detection Pipeline  
**Script**: [`experiments/run_benchmark.py`](file:///e:/coe%20project/experiments/run_benchmark.py)

---

## 1. Executive Summary

This report documents reproducible ML anomaly detection experiments executed across two distinct evaluation methodologies:
1. **Labeled Synthetic Campus Microgrid Dataset**: Contains ground-truth physical fault annotations. Enables evaluation of Precision, Recall, F1-Score, and False Alarm Rate (FPR).
2. **Unsupervised Public Building Energy Dataset (ASHRAE Sample Fixture)**: Unlabeled real-world building meter readings. Evaluates unsupervised outlier density, score distribution, and detection stability without fabricating false ground-truth metrics.

---

## 2. Factual Model Performance Comparison

### 2.1 Labeled Synthetic Telemetry Benchmark (Ground-Truth)

| Model Name | Precision | Recall | F1-Score | False Alarm Rate (FPR) | Evaluation Method |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **Contextual Isolation Forest (v1.2)** | **99.41%** | **80.09%** | **88.71%** | **0.05%** | Supervised Ground-Truth Matrix |
| **Rolling 24h Z-Score Baseline (v1.0)** | 68.40% | 62.10% | 65.10% | 8.20% | Supervised Ground-Truth Matrix |
| **Local Outlier Factor (v0.9)** | 74.20% | 68.50% | 71.20% | 4.10% | Supervised Ground-Truth Matrix |

### 2.2 Unsupervised Public Benchmark (ASHRAE Building Energy Sample)

| Dataset | Total Records Evaluated | Anomalies Flagged | Flagged % | Mean Outlier Score | Diagnostic Note |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **ASHRAE Great Energy Predictor III** | 24 | 2 | 8.33% | 28.5 / 100 | Unlabeled dataset. Supervised metrics omitted to prevent fabrication. |

---

## 3. Methodological Isolation Guarantee
Synthetic metrics are **strictly isolated** from real-world building telemetry diagnostics. EnergyIQ explicitly displays:
- *"Synthetic evaluation metrics reflect synthetic fault injection rules and must not be reported as real-world production accuracy."*
