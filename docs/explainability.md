# Alert Explainability & Root-Cause Fault Linking

## 1. Overview
EnergyIQ provides deterministic physical evidence and root-cause explanations for every anomaly detected by the ML models.

## 2. Evidence Generation Engine
For each detected anomaly, the fault linking engine calculates:
- **Energy Deviation**: Percent deviation above contextual baseline ($\Delta \text{kWh}$).
- **Power Draw Factor**: Ratio of observed power to expected rated capacity.
- **Physical Signature Match**: Compares temperature surge, power draw, and production output against known physical failure modes.

## 3. Supported Physical Fault Categories
1. `MECHANICAL_RESISTANCE` (Bearing friction, shaft misalignment)
2. `STANDBY_LEAKAGE` (Phantom power draw during OFF state)
3. `PRODUCTION_ANOMALY` (Low yield per kWh consumed)
4. `ELECTRICAL_SPIKE` (Power surge / transient line disturbance)
5. `SHORT_CYCLING` (Rapid ON/OFF cycle frequency)
6. `OVERCOOLING_LEAKAGE` (Excessive chiller runtime under low thermal load)
7. `PHASE_IMBALANCE` (Unbalanced electrical current draw)
8. `BELT_SLIPPAGE` (Fan motor speed drop with high current)
9. `SENSOR_CALIBRATION_DRIFT` (Unrealistic telemetry drift)
10. `THERMAL_RUNAWAY` (Uncontrolled heating under normal load)
