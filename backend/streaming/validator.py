import math
from datetime import datetime
from typing import Dict, Any, Tuple, List

CANONICAL_EQUIPMENT = [
    "HVAC-01", "HVAC-02", "Motor-01", "Compressor-01",
    "Pump-01", "Production-Line-01", "Cooling-Unit-01"
]

VALID_STATES = ["ON", "OFF", "IDLE", "MAINTENANCE", "RUNNING"]

def validate_and_clean_telemetry(raw: Dict[str, Any]) -> Tuple[bool, Dict[str, Any], List[str]]:
    """
    Validates streaming telemetry events against range limits, types, and required schema.
    Performs safe imputation for missing/null fields and returns cleaned record.
    """
    issues = []
    cleaned = dict(raw)
    
    # 1. Equipment ID Validation
    eq_id = cleaned.get("equipment_id") or cleaned.get("asset_id")
    if not eq_id:
        eq_id = "HVAC-01"
        issues.append("Missing equipment_id, defaulted to HVAC-01")
    cleaned["equipment_id"] = str(eq_id)
    
    # 2. Equipment Type Fallback
    eq_type = cleaned.get("equipment_type")
    if not eq_type:
        if "HVAC" in eq_id: eq_type = "HVAC"
        elif "Motor" in eq_id: eq_type = "Heavy Motor"
        elif "Compressor" in eq_id: eq_type = "Industrial Compressor"
        elif "Pump" in eq_id: eq_type = "Fluid Pump"
        elif "Production" in eq_id: eq_type = "Assembly Line"
        elif "Cooling" in eq_id: eq_type = "Chiller"
        else: eq_type = "Equipment"
        issues.append(f"Missing equipment_type, inferred '{eq_type}'")
    cleaned["equipment_type"] = str(eq_type)
    
    # 3. Timestamp Validation
    ts = cleaned.get("timestamp")
    if not ts:
        cleaned["timestamp"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        issues.append("Missing timestamp, generated current timestamp")
    else:
        cleaned["timestamp"] = str(ts)
        
    # 4. Energy kWh (power_kw fallback)
    energy = cleaned.get("energy_kwh")
    if energy is None:
        energy = cleaned.get("power_kw")
    if energy is None or not isinstance(energy, (int, float)) or math.isnan(energy) or energy < 0:
        cleaned["energy_kwh"] = 0.0
        issues.append("Invalid or missing energy_kwh, imputed to 0.0")
    else:
        cleaned["energy_kwh"] = float(energy)
        
    # 5. Operating State
    state = str(cleaned.get("operating_state", "OFF")).upper()
    if state not in VALID_STATES:
        state = "OFF"
        issues.append(f"Invalid operating state, defaulted to OFF")
    if state == "RUNNING":
        state = "ON"
    cleaned["operating_state"] = state
    
    # 6. Production Output
    prod = cleaned.get("production_output")
    if prod is None or not isinstance(prod, (int, float)) or math.isnan(prod) or prod < 0:
        cleaned["production_output"] = 0.0
        issues.append("Invalid production_output, imputed to 0.0")
    else:
        cleaned["production_output"] = float(prod)
        
    # 7. Solar Generation kWh
    solar = cleaned.get("solar_generation_kwh")
    if solar is None or not isinstance(solar, (int, float)) or math.isnan(solar) or solar < 0:
        cleaned["solar_generation_kwh"] = 0.0
    else:
        cleaned["solar_generation_kwh"] = float(solar)
        
    # 8. Battery SoC %
    soc = cleaned.get("battery_soc")
    if soc is None or not isinstance(soc, (int, float)) or math.isnan(soc):
        cleaned["battery_soc"] = 50.0
    else:
        cleaned["battery_soc"] = max(0.0, min(100.0, float(soc)))
        
    # 9. Grid Consumption kWh
    grid = cleaned.get("grid_consumption_kwh")
    if grid is None or not isinstance(grid, (int, float)) or math.isnan(grid) or grid < 0:
        cleaned["grid_consumption_kwh"] = max(0.0, cleaned["energy_kwh"] - cleaned["solar_generation_kwh"])
    else:
        cleaned["grid_consumption_kwh"] = float(grid)
        
    # 10. Temperature °C
    temp = cleaned.get("temperature")
    if temp is None or not isinstance(temp, (int, float)) or math.isnan(temp) or temp < -50 or temp > 150:
        cleaned["temperature"] = 25.0
        issues.append("Invalid temperature, imputed to 25.0°C")
    else:
        cleaned["temperature"] = float(temp)
        
    # 11. Maintenance Days & Status
    maint_days = cleaned.get("maintenance_days")
    cleaned["maintenance_days"] = int(maint_days) if (maint_days is not None and isinstance(maint_days, (int, float))) else 15
    cleaned["maintenance_status"] = str(cleaned.get("maintenance_status", "OK"))
    
    # 12. Model Target Placeholders
    cleaned["is_anomaly"] = int(cleaned.get("is_anomaly", 0))
    cleaned["fault_label"] = str(cleaned.get("fault_label", "NORMAL"))
    cleaned["anomaly_score"] = float(cleaned.get("anomaly_score", 0.0))
    cleaned["severity"] = str(cleaned.get("severity", "NORMAL"))

    is_valid = len(issues) == 0
    return is_valid, cleaned, issues
