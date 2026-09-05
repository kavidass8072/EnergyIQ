import os
import json
import pandas as pd
from backend.database.db import get_connection, init_db
from ml.synthetic_generator import generate_campus_dataset
from ml.feature_engineering import preprocess_and_engineer_features
from ml.anomaly_detector import ContextualIsolationForestDetector
from backend.fault_linking.engine import analyze_and_link_fault

def seed_database_pipeline(days: int = 60, force_reseed: bool = False):
    """
    Initializes DB, runs data generator if needed, runs ML anomaly detection & fault linking,
    and populates SQLite database tables for live dashboard querying.
    """
    init_db()
    conn = get_connection()
    cursor = conn.cursor()
    
    # Check if already seeded
    cursor.execute("SELECT COUNT(*) FROM telemetry")
    count = cursor.fetchone()[0]
    if count > 0 and not force_reseed:
        conn.close()
        return count
        
    cursor.execute("DELETE FROM telemetry")
    cursor.execute("DELETE FROM alerts")
    cursor.execute("DELETE FROM maintenance_tasks")
    cursor.execute("DELETE FROM app_settings")
    conn.commit()
    
    csv_path = os.path.join(os.path.dirname(__file__), "..", "..", "data", "synthetic", "campus_telemetry.csv")
    if not os.path.exists(csv_path) or force_reseed:
        os.makedirs(os.path.dirname(csv_path), exist_ok=True)
        df = generate_campus_dataset(days=days)
        df.to_csv(csv_path, index=False)
    else:
        df = pd.read_csv(csv_path)
        
    # Preprocess & Feature Engineering
    df_processed = preprocess_and_engineer_features(df)
    
    # ML Anomaly Detection Model
    detector = ContextualIsolationForestDetector(contamination=0.05)
    df_results = detector.predict(df_processed)
    
    # Batch Insert Telemetry Records
    telemetry_records = []
    alert_records = []
    
    for idx, row in df_results.iterrows():
        row_dict = row.to_dict()
        
        telemetry_records.append((
            str(row_dict.get('timestamp')),
            str(row_dict.get('equipment_id')),
            str(row_dict.get('equipment_type')),
            float(row_dict.get('energy_kwh', 0.0)),
            str(row_dict.get('operating_state')),
            float(row_dict.get('production_output', 0.0)),
            float(row_dict.get('solar_generation_kwh', 0.0)),
            float(row_dict.get('battery_soc', 0.0)),
            float(row_dict.get('grid_consumption_kwh', 0.0)),
            float(row_dict.get('temperature', 0.0)),
            int(row_dict.get('maintenance_days', 0)),
            str(row_dict.get('maintenance_status', 'OK')),
            int(row_dict.get('is_anomaly', 0)),
            str(row_dict.get('fault_label', 'NORMAL')),
            float(row_dict.get('anomaly_score', 0.0)),
            str(row_dict.get('severity', 'NORMAL'))
        ))
        
        # Populate Alert if Severity is LOW, MEDIUM, HIGH, or CRITICAL
        sev = str(row_dict.get('severity', 'NORMAL'))
        if sev in ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']:
            expected = float(row_dict.get('rolling_mean_24h', row_dict.get('energy_kwh', 0.0)))
            energy = float(row_dict.get('energy_kwh', 0.0))
            dev_pct = ((energy - expected) / expected * 100.0) if expected > 0.01 else 0.0
            
            fault_res = analyze_and_link_fault(row_dict)
            
            alert_records.append((
                str(row_dict.get('timestamp')),
                str(row_dict.get('equipment_id')),
                str(row_dict.get('equipment_type')),
                sev,
                energy,
                round(expected, 2),
                round(dev_pct, 1),
                str(row_dict.get('operating_state')),
                float(row_dict.get('production_output', 0.0)),
                int(row_dict.get('maintenance_days', 0)),
                fault_res['likely_fault'],
                fault_res['fault_confidence'],
                json.dumps(fault_res['evidence']),
                fault_res['recommended_action'],
                'ACTIVE'
            ))
            
    cursor.executemany("""
    INSERT INTO telemetry (
        timestamp, equipment_id, equipment_type, energy_kwh, operating_state,
        production_output, solar_generation_kwh, battery_soc, grid_consumption_kwh,
        temperature, maintenance_days, maintenance_status, is_anomaly, fault_label,
        anomaly_score, severity
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, telemetry_records)
    
    cursor.executemany("""
    INSERT INTO alerts (
        timestamp, equipment_id, equipment_type, severity, energy_kwh, expected_kwh,
        dev_pct, operating_state, production_output, maintenance_days, likely_fault,
        fault_confidence, evidence_json, recommended_action, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, alert_records)
    
    # Populate initial maintenance tasks based on high/critical alerts & overdue equipment
    default_tasks = [
        ("2026-06-15 08:00:00", "Motor-01", "Motor", "HIGH", "Inspect motor mechanical bearings and alignment due to repeated energy anomalies", 1, "OVERDUE", "Rajesh Kumar", "2026-06-14 10:00:00", "2026-06-15 12:00:00"),
        ("2026-06-15 09:30:00", "Compressor-01", "Compressor", "HIGH", "Check pressure valve regulator and motor coupling efficiency", 2, "UPCOMING", "Amit Sharma", "2026-06-15 09:30:00", "2026-06-16 14:00:00"),
        ("2026-06-14 14:00:00", "HVAC-01", "HVAC", "MEDIUM", "Clean condenser coils and check refrigerant pressure level", None, "COMPLETED", "Priya Verma", "2026-06-14 10:00:00", "2026-06-14 14:00:00"),
        ("2026-06-15 11:00:00", "Pump-01", "Pump", "MEDIUM", "Perform quarterly pump seal inspection and lubrication check", None, "IN_PROGRESS", "Suresh Nair", "2026-06-15 08:00:00", "2026-06-15 17:00:00")
    ]
    cursor.executemany("""
    INSERT INTO maintenance_tasks (
        timestamp, equipment_id, equipment_type, priority, issue_description,
        linked_alert_id, status, assigned_technician, created_at, due_date
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, default_tasks)

    # Populate default app settings
    default_settings = [
        ("electricity_rate", "8.50"),
        ("currency", "₹"),
        ("rolling_window_hours", "24"),
        ("anomaly_sensitivity", "HIGH"),
        ("auto_refresh_sec", "15"),
        ("min_alert_duration_hr", "1")
    ]
    cursor.executemany("INSERT OR REPLACE INTO app_settings (key, value) VALUES (?, ?)", default_settings)
    
    conn.commit()
    conn.close()
    
    return len(telemetry_records)
