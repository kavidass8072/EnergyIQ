# Model Drift Monitoring & PSI Calculation

## 1. Overview
EnergyIQ computes Population Stability Index (PSI) to detect statistical data drift between recent live telemetry streams (current 24h window) and historical training baselines (60-day window).

## 2. Mathematical Definition
The Population Stability Index (PSI) is calculated across $B$ quantile bins as:

$$\text{PSI} = \sum_{i=1}^{B} (P_i - Q_i) \times \ln\left(\frac{P_i}{Q_i}\right)$$

where $P_i$ is the actual proportion in current telemetry and $Q_i$ is the baseline reference proportion.

## 3. Drift Threshold Categories
- **PSI < 0.10**: `STABLE` (No action required)
- **0.10 ≤ PSI < 0.25**: `WARNING` (Slight distribution shift observed)
- **PSI ≥ 0.25**: `DRIFT DETECTED` (Significant shift; triggers retrain recommended alert)

## 4. Features Monitored
- `energy_kwh`
- `temperature`
- `production_output`
- `anomaly_score`
