import os
import sqlite3
import json
from typing import List, Dict, Any, Optional

DB_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "app.db")
os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)

def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_connection()
    cursor = conn.cursor()
    
    # Telemetry Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS telemetry (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp TEXT NOT NULL,
        equipment_id TEXT NOT NULL,
        equipment_type TEXT NOT NULL,
        energy_kwh REAL NOT NULL,
        operating_state TEXT NOT NULL,
        production_output REAL NOT NULL,
        solar_generation_kwh REAL NOT NULL,
        battery_soc REAL NOT NULL,
        grid_consumption_kwh REAL NOT NULL,
        temperature REAL NOT NULL,
        maintenance_days INTEGER NOT NULL,
        maintenance_status TEXT NOT NULL,
        is_anomaly INTEGER NOT NULL,
        fault_label TEXT NOT NULL,
        anomaly_score REAL,
        severity TEXT
    );
    """)
    
    # Alerts Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS alerts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp TEXT NOT NULL,
        equipment_id TEXT NOT NULL,
        equipment_type TEXT NOT NULL,
        severity TEXT NOT NULL,
        energy_kwh REAL NOT NULL,
        expected_kwh REAL NOT NULL,
        dev_pct REAL NOT NULL,
        operating_state TEXT NOT NULL,
        production_output REAL NOT NULL,
        maintenance_days INTEGER NOT NULL,
        likely_fault TEXT NOT NULL,
        fault_confidence REAL NOT NULL,
        evidence_json TEXT NOT NULL,
        recommended_action TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'ACTIVE'
    );
    """)
    
    # Maintenance Tasks Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS maintenance_tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp TEXT NOT NULL,
        equipment_id TEXT NOT NULL,
        equipment_type TEXT NOT NULL,
        priority TEXT NOT NULL,
        issue_description TEXT NOT NULL,
        linked_alert_id INTEGER,
        status TEXT NOT NULL DEFAULT 'UPCOMING',
        assigned_technician TEXT NOT NULL,
        created_at TEXT NOT NULL,
        due_date TEXT NOT NULL
    );
    """)

    # App Settings Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS app_settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
    );
    """)
    
    conn.commit()
    conn.close()

if __name__ == "__main__":
    init_db()
    print(f"Database initialized cleanly at {DB_PATH}")
