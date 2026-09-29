# ML Model Registry Architecture

## 1. Overview
The EnergyIQ ML Model Registry manages the lifecycle of anomaly detection models. It tracks model metadata, versions, hyperparameter configurations, evaluation metrics, and handles zero-downtime model activation in production.

## 2. Model Inventory
| Model ID | Name | Type | Key Hyperparameters | Status |
| :--- | :--- | :--- | :--- | :--- |
| `mod-cif-v120` | Context-Aware Isolation Forest v1.2 | Tree-based Outlier Ensemble | `n_estimators=150, contamination=0.08, rolling_window=24` | **ACTIVE** |
| `mod-zscore-v100` | Rolling Quantile Z-Score Baseline | Statistical Baseline | `quantile_low=0.05, quantile_high=0.95, z_threshold=3.0` | **STANDBY** |
| `mod-lof-v090` | Local Outlier Factor Detector | Density-based KNN | `n_neighbors=20, contamination=0.08` | **STANDBY** |

## 3. Dynamic Activation API
Models can be switched dynamically via POST `/api/ml/models/{model_id}/activate`. 
When activated:
1. The currently active model status is updated to `VALIDATED`.
2. The target model status is set to `ACTIVE`.
3. An audit log entry is recorded with user attribution.
