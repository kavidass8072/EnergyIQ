from typing import Dict, Any, List

FAULT_CATEGORIES = [
    "Motor Inefficiency",
    "Mechanical Resistance",
    "Sensor Malfunction",
    "Unexpected Standby Consumption",
    "Excessive Operating Duration",
    "Cooling/Heating Inefficiency",
    "Production-Related Abnormality",
    "Maintenance Overdue",
    "Electrical Abnormality",
    "Unknown Anomaly"
]

# 10 Physical Equipment Fault Categories mapped to physical telemetry signals
FAULT_CATEGORIES = [
    "Motor Inefficiency",
    "Mechanical Resistance",
    "Sensor Malfunction",
    "Unexpected Standby Consumption",
    "Excessive Operating Duration",
    "Cooling/Heating Inefficiency",
    "Production-Related Abnormality",
    "Maintenance Overdue",
    "Electrical Abnormality",
    "Unknown Anomaly"
]

def analyze_and_link_fault(row: Dict[str, Any], recent_anomalies_count: int = 1) -> Dict[str, Any]:
    """
    Evaluates telemetry context and links detected energy anomaly to a likely equipment fault,
    assigns confidence score, generates physical evidence JSON, and provides recommended maintenance actions.
    """
    energy = row.get("energy_kwh", 0.0)
    expected = row.get("rolling_mean_24h", energy)
    state = row.get("operating_state", "OFF")
    prod = row.get("production_output", 0.0)
    maint_days = row.get("maintenance_days", 0)
    temp = row.get("temperature", 25.0)
    eq_type = row.get("equipment_type", "Equipment")
    score = row.get("anomaly_score", 0.0)
    is_weekend = row.get("is_weekend", 0)
    hour = row.get("hour_of_day", 12)
    
    dev_pct = ((energy - expected) / expected * 100.0) if expected > 0.01 else 0.0
    
    fault_type = "Unknown Anomaly"
    confidence = round(max(35.0, score * 0.5), 1)  # Low confidence fallback
    evidence: List[str] = []
    action = "Inspect equipment operational parameters and check sensor calibration."
    
    # Base physical telemetry evidence facts
    evidence.append(f"Actual energy: {energy:.2f} kWh (Expected: {expected:.2f} kWh, Deviation: +{dev_pct:.1f}%)")
    evidence.append(f"Operating State: {state} | Production Output: {prod:.1f} units")
    evidence.append(f"Maintenance History: {maint_days} days since last recorded service")
    
    # Rule 1: Standby Leakage / Phantom Power draw while OFF
    if state == "OFF" and energy > 2.0:
        fault_type = "Unexpected Standby Consumption"
        confidence = min(98.0, 75.0 + (energy * 3.0))
        evidence.append(f"Equipment state is OFF, but energy consumption remains at {energy:.2f} kWh.")
        evidence.append("Potential causes: Standby electrical leakage, short circuit, or state sensor failure.")
        action = "Check physical power disconnects, inspect relays, and verify telemetry state sensor wiring."
        
    # Rule 2: Sensor Malfunction (0 kW draw recorded while ON with active output)
    elif energy == 0.0 and state == "ON" and prod > 20.0:
        fault_type = "Sensor Malfunction"
        confidence = 99.0
        evidence.append("Energy consumption reads 0.0 kWh while equipment is reported ON with active production output.")
        action = "Recalibrate or replace current transformer (CT) energy sensor."
        
    # Rule 3: Extreme Electrical Spikes (> 65% energy surge under normal load)
    elif dev_pct > 65.0:
        fault_type = "Electrical Abnormality"
        confidence = min(98.0, 80.0 + min(18.0, dev_pct * 0.1))
        evidence.append(f"Severe short-duration energy spike detected (+{dev_pct:.1f}% above baseline).")
        action = "Inspect electrical distribution panel for voltage sag, power factor issues, or loose connections."

    # Rule 4: Overdue Maintenance degradation
    elif maint_days > 60 and dev_pct > 25.0:
        fault_type = "Maintenance Overdue"
        confidence = min(95.0, 70.0 + (maint_days - 60) * 0.5 + dev_pct * 0.2)
        evidence.append(f"Maintenance interval ({maint_days} days) exceeds threshold limit (60 days).")
        evidence.append(f"Energy usage spiked +{dev_pct:.1f}% above 24-hour baseline.")
        action = "Schedule immediate preventative maintenance (lubrication, filter replacement, belt tightening)."
        
    # Rule 5: Excessive Operating Duration (Running ON during off-peak weekend/overnight without production justification)
    elif state == "ON" and (is_weekend == 1 or hour < 5 or hour > 22) and dev_pct > 20.0 and prod < 20.0:
        fault_type = "Excessive Operating Duration"
        confidence = min(92.0, 70.0 + dev_pct * 0.3)
        evidence.append(f"Equipment operating in active state ON during non-production off-peak hours (Hour {hour:02d}:00).")
        evidence.append(f"Low production output ({prod:.1f} units) indicates unneeded continuous runtime.")
        action = "Check automated timer schedules and verify facility occupancy shutdown controls."
        
    # Rule 6: High Energy + Normal/High Production -> Mechanical Resistance vs Motor Inefficiency
    elif dev_pct > 30.0 and prod >= 50.0 and eq_type in ["Heavy Motor", "Fluid Pump", "HVAC"]:
        if dev_pct > 50.0:
            fault_type = "Mechanical Resistance"
            confidence = min(96.0, 75.0 + dev_pct * 0.3)
            evidence.append(f"Energy draw increased by +{dev_pct:.1f}% while production output remained normal ({prod:.1f} units).")
            evidence.append("Indicates mechanical friction, bearing friction, or pump valve restriction.")
            action = "Inspect bearings, check alignment, measure motor thermal output, and inspect fluid lines."
        else:
            fault_type = "Motor Inefficiency"
            confidence = min(92.0, 70.0 + dev_pct * 0.3)
            evidence.append(f"Gradual or sustained +{dev_pct:.1f}% energy increase under standard production load.")
            action = "Conduct motor winding resistance test, measure current draw per phase, and verify voltage balance."
            
    # Rule 7: High Energy + Low Production -> Production-Related Abnormality
    elif dev_pct > 25.0 and prod < 40.0 and state == "ON":
        fault_type = "Production-Related Abnormality"
        confidence = min(93.0, 72.0 + dev_pct * 0.3)
        evidence.append(f"Energy draw elevated by +{dev_pct:.1f}% despite reduced production output ({prod:.1f} units).")
        evidence.append("Severe efficiency degradation or partial equipment binding detected.")
        action = "Halt production line for emergency mechanical inspection and check drive coupling."
        
    # Rule 8: Chiller/HVAC high load during elevated temperature -> Cooling/Heating Inefficiency
    elif eq_type in ["HVAC", "Chiller"] and temp > 30.0 and dev_pct > 35.0:
        fault_type = "Cooling/Heating Inefficiency"
        confidence = min(94.0, 74.0 + dev_pct * 0.25)
        evidence.append(f"Ambient temperature is high ({temp:.1f}°C), causing compressor over-exertion.")
        evidence.append(f"Cooling unit consuming +{dev_pct:.1f}% excess power to maintain thermal setpoint.")
        action = "Clean condenser coils, verify refrigerant levels, and check airflow dampers."
        
    else:
        fault_type = "Unknown Anomaly"
        confidence = round(max(30.0, score * 0.5), 1)  # Low confidence explicitly assigned
        evidence.append(f"Anomaly score ({score:.1f}) exceeds threshold, but specific fault signature is unclassified.")
        evidence.append("Insufficient diagnostic signature matches known rules.")
        action = "Perform routine diagnostic walk-through and monitor telemetry over next operational cycle."
        
    if recent_anomalies_count > 1:
        evidence.append(f"Similar abnormal readings detected {recent_anomalies_count} times in the last 24 hours.")

    return {
        "likely_fault": fault_type,
        "fault_confidence": round(confidence, 1),
        "evidence": evidence,
        "recommended_action": action
    }
