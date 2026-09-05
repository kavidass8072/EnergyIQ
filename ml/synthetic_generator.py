import os
import numpy as np
import pandas as pd
from datetime import datetime, timedelta

def generate_campus_dataset(days=60, seed=42):
    """
    Generates realistic synthetic energy telemetry for a commercial campus
    with solar, battery, grid, and multiple equipment assets.
    Includes controlled ground-truth fault injections for model evaluation.
    """
    np.random.seed(seed)
    
    start_date = datetime(2026, 6, 1, 0, 0, 0)
    hours = days * 24
    timestamps = [start_date + timedelta(hours=i) for i in range(hours)]
    
    equipment_configs = [
        {"id": "HVAC-01", "type": "HVAC", "base_kw": 20.0, "temp_sens": 0.8},
        {"id": "HVAC-02", "type": "HVAC", "base_kw": 18.0, "temp_sens": 0.7},
        {"id": "Motor-01", "type": "Heavy Motor", "base_kw": 35.0, "prod_sens": 0.4},
        {"id": "Compressor-01", "type": "Industrial Compressor", "base_kw": 30.0, "prod_sens": 0.3},
        {"id": "Pump-01", "type": "Fluid Pump", "base_kw": 14.0, "prod_sens": 0.2},
        {"id": "Production-Line-01", "type": "Assembly Line", "base_kw": 65.0, "prod_sens": 0.6},
        {"id": "Cooling-Unit-01", "type": "Chiller", "base_kw": 25.0, "temp_sens": 0.9},
    ]
    
    records = []
    
    # Campus level ambient temp profile (20C to 35C)
    day_indices = np.arange(hours)
    hour_of_day = np.array([ts.hour for ts in timestamps])
    day_of_week = np.array([ts.weekday() for ts in timestamps])
    
    temp_profile = 25.0 + 7.0 * np.sin((hour_of_day - 9) * np.pi / 12) + np.random.normal(0, 1.2, hours)
    
    # Solar profile (peak 11am - 3pm)
    solar_base = np.maximum(0, 120.0 * np.sin((hour_of_day - 6) * np.pi / 12))
    solar_generation = solar_base * (0.8 + 0.4 * np.random.rand(hours))
    solar_generation[hour_of_day < 6] = 0
    solar_generation[hour_of_day > 19] = 0
    
    # Battery state of charge (SoC %)
    battery_soc = 50.0 + 35.0 * np.sin((hour_of_day - 12) * np.pi / 12) + np.random.normal(0, 2, hours)
    battery_soc = np.clip(battery_soc, 20.0, 95.0)
    
    for eq in equipment_configs:
        eq_id = eq["id"]
        eq_type = eq["type"]
        base_kw = eq["base_kw"]
        
        # Track maintenance days counter
        maint_days = 10.0
        
        for i in range(hours):
            ts = timestamps[i]
            hr = hour_of_day[i]
            dow = day_of_week[i]
            temp = temp_profile[i]
            
            # Maintenance increments every 24 hours
            if hr == 0:
                maint_days += 1.0
                if eq_id == "Pump-01" and maint_days > 65:
                    maint_days = 5.0  # Reset after periodic maintenance
            
            # Operating state: 1=ON, 0=OFF, 2=IDLE
            is_weekend = dow >= 5
            is_work_hours = 7 <= hr <= 19
            
            if is_weekend and not is_work_hours:
                state_str = "OFF"
                state_val = 0
                prod_output = 0.0
            elif is_work_hours:
                state_str = "ON"
                state_val = 1
                prod_output = max(0.0, min(100.0, 80.0 + 15.0 * np.random.randn()))
            else:
                state_str = "IDLE"
                state_val = 2
                prod_output = 10.0 if eq_type == "Assembly Line" else 0.0
                
            # Base energy calculation
            if state_val == 0:
                energy_kwh = 0.2 + np.random.normal(0, 0.05)
            elif state_val == 2:
                energy_kwh = base_kw * 0.25 + np.random.normal(0, 0.5)
            else:
                energy_kwh = base_kw
                if "temp_sens" in eq:
                    energy_kwh += (temp - 22.0) * eq["temp_sens"]
                if "prod_sens" in eq:
                    energy_kwh += (prod_output / 100.0) * base_kw * eq["prod_sens"]
                energy_kwh += np.random.normal(0, 1.0)
            
            energy_kwh = max(0.0, energy_kwh)
            
            # Fault Injection Logic (Ground-truth labeling)
            is_anomaly = 0
            fault_label = "NORMAL"
            
            day_num = i // 24
            
            # Fault Scenario 1: HVAC-01 motor degradation drift (Days 20-25, 40-50)
            if eq_id == "HVAC-01" and ((20 <= day_num <= 25) or (day_num >= 40)) and state_val == 1:
                drift_factor = 1.35 + 0.01 * (day_num % 15)  # +35% to +50% increase
                energy_kwh *= drift_factor
                is_anomaly = 1
                fault_label = "MOTOR_EFFICIENCY_DEGRADATION"
                
            # Fault Scenario 2: HVAC-02 Standby Leakage / OFF state energy (Days 2-4, 15-18, 30-33)
            elif eq_id == "HVAC-02" and ((2 <= day_num <= 4) or (15 <= day_num <= 18) or (30 <= day_num <= 33)) and state_val == 0:
                energy_kwh = 8.5 + np.random.normal(0, 0.8) # Abnormally high when OFF
                is_anomaly = 1
                fault_label = "STANDBY_LEAKAGE"
                
            # Fault Scenario 3: Motor-01 Mechanical Resistance (Days 3-5, 25-28, 50-52)
            elif eq_id == "Motor-01" and ((3 <= day_num <= 5) or (25 <= day_num <= 28) or (50 <= day_num <= 52)) and state_val == 1:
                energy_kwh *= 1.55  # +55% surge
                is_anomaly = 1
                fault_label = "MECHANICAL_RESISTANCE"
                
            # Fault Scenario 4: Compressor-01 Inefficiency under normal/low output (Days 4-6, 32-35)
            elif eq_id == "Compressor-01" and ((4 <= day_num <= 6) or (32 <= day_num <= 35)) and state_val == 1:
                energy_kwh *= 1.48
                prod_output = max(10.0, prod_output * 0.5) # High energy, reduced production
                is_anomaly = 1
                fault_label = "EQUIPMENT_INEFFICIENCY"
                
            # Fault Scenario 5: Pump-01 Maintenance Overdue (Days 10-14, 45-55)
            elif eq_id == "Pump-01" and ((10 <= day_num <= 14) or (45 <= day_num <= 55)) and state_val == 1:
                if hr in [9, 14, 18]:
                    energy_kwh *= 1.65  # Spikes due to overdue maintenance
                    is_anomaly = 1
                    fault_label = "MAINTENANCE_OVERDUE"
                    
            # Fault Scenario 6: Production-Line-01 Electrical Spikes (Day 2, Day 10, Day 48)
            elif eq_id == "Production-Line-01" and ((day_num in [2, 10, 48]) and 10 <= hr <= 14):
                energy_kwh *= 1.75
                is_anomaly = 1
                fault_label = "ELECTRICAL_SPIKE"
                
            # Microgrid calculation
            sol = solar_generation[i]
            bat_soc = battery_soc[i]
            grid_kwh = max(0.0, energy_kwh * 1.5 - sol * 0.3)
            
            maint_status = "OVERDUE" if maint_days > 60 else "OK"
            
            records.append({
                "timestamp": ts.strftime("%Y-%m-%d %H:%M:%S"),
                "equipment_id": eq_id,
                "equipment_type": eq_type,
                "energy_kwh": round(energy_kwh, 3),
                "operating_state": state_str,
                "production_output": round(prod_output, 2),
                "solar_generation_kwh": round(sol, 2),
                "battery_soc": round(bat_soc, 1),
                "grid_consumption_kwh": round(grid_kwh, 2),
                "temperature": round(temp, 1),
                "maintenance_days": int(maint_days),
                "maintenance_status": maint_status,
                "is_anomaly": is_anomaly,
                "fault_label": fault_label
            })
            
    df = pd.DataFrame(records)
    return df

if __name__ == "__main__":
    out_dir = os.path.join(os.path.dirname(__file__), "..", "data", "synthetic")
    os.makedirs(out_dir, exist_ok=True)
    out_file = os.path.join(out_dir, "campus_telemetry.csv")
    df = generate_campus_dataset(days=60)
    df.to_csv(out_file, index=False)
    print(f"Dataset generated successfully with {len(df)} records at {out_file}")
    print("Fault breakdown:")
    print(df["fault_label"].value_counts())
