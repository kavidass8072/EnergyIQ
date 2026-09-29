import os
import sqlite3
import json
import hashlib
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional

DB_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "app.db")
os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)

def _hash_password(password: str) -> str:
    """Hashes a password using PBKDF2-HMAC-SHA256 with salt."""
    salt = os.urandom(16)
    key = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt, 100000)
    return salt.hex() + ":" + key.hex()

def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_connection()
    cursor = conn.cursor()
    
    # 1. Telemetry Table
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
    
    # 2. Alerts Table
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
    
    # 3. Maintenance Tasks Table
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

    # 4. App Settings Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS app_settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
    );
    """)

    # 5. Roles Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS roles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        description TEXT NOT NULL
    );
    """)

    # 6. Users Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL,
        active_status INTEGER NOT NULL DEFAULT 1,
        created_at TEXT NOT NULL,
        last_login TEXT
    );
    """)

    # 7. Audit Logs Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS audit_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp TEXT NOT NULL,
        user_id INTEGER,
        username TEXT NOT NULL,
        action TEXT NOT NULL,
        resource TEXT NOT NULL,
        details_json TEXT
    );
    """)

    # 8. Notifications Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp TEXT NOT NULL,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        severity TEXT NOT NULL,
        read_status INTEGER NOT NULL DEFAULT 0,
        target_role TEXT
    );
    """)

    # 9. Data Quality Logs Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS data_quality_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp TEXT NOT NULL,
        completeness_pct REAL NOT NULL,
        null_rate_pct REAL NOT NULL,
        duplicate_rate_pct REAL NOT NULL,
        out_of_order_rate_pct REAL NOT NULL,
        invalid_range_rate_pct REAL NOT NULL,
        stale_telemetry_flag INTEGER NOT NULL,
        status TEXT NOT NULL
    );
    """)

    # 10. ML Model Registry Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS ml_models (
        model_id TEXT PRIMARY KEY,
        model_name TEXT NOT NULL,
        model_type TEXT NOT NULL,
        version TEXT NOT NULL,
        dataset TEXT NOT NULL,
        trained_at TEXT NOT NULL,
        feature_set TEXT NOT NULL,
        parameters_json TEXT NOT NULL,
        metrics_json TEXT NOT NULL,
        status TEXT NOT NULL,
        active INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL
    );
    """)

    # 11. Drift Logs Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS drift_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp TEXT NOT NULL,
        feature_name TEXT NOT NULL,
        psi_score REAL NOT NULL,
        ks_pvalue REAL NOT NULL,
        status TEXT NOT NULL
    );
    """)

    # Indexes
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_telemetry_timestamp ON telemetry(timestamp);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_telemetry_equipment_id ON telemetry(equipment_id);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_alerts_status ON alerts(status);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_alerts_equipment_id ON alerts(equipment_id);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_alerts_severity ON alerts(severity);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_maintenance_status ON maintenance_tasks(status);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_logs(timestamp);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read_status);")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_ml_models_active ON ml_models(active);")

    # Seed Default Roles
    roles_data = [
        ("ADMIN", "Full system administration, user management, demo controls, and settings."),
        ("FACILITY_OPERATOR", "Facility power monitoring, alert processing, work orders, and executive reports."),
        ("TECHNICAL_ENGINEER", "Deep telemetry analytics, AI insights, ML model benchmarks, and edge cases.")
    ]
    for r_name, r_desc in roles_data:
        cursor.execute("INSERT OR IGNORE INTO roles (name, description) VALUES (?, ?)", (r_name, r_desc))

    # Seed Default Users if empty
    cursor.execute("SELECT COUNT(*) as cnt FROM users")
    if cursor.fetchone()["cnt"] == 0:
        now_str = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S")
        default_users = [
            ("admin", _hash_password("admin123"), "ADMIN"),
            ("operator", _hash_password("operator123"), "FACILITY_OPERATOR"),
            ("engineer", _hash_password("engineer123"), "TECHNICAL_ENGINEER")
        ]
        for uname, phash, urole in default_users:
            cursor.execute("""
                INSERT INTO users (username, password_hash, role, active_status, created_at)
                VALUES (?, ?, ?, 1, ?)
            """, (uname, phash, urole, now_str))

    # Seed Default ML Models if empty
    cursor.execute("SELECT COUNT(*) as cnt FROM ml_models")
    if cursor.fetchone()["cnt"] == 0:
        now_str = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S")
        models_seed = [
            (
                "mod-cif-v120",
                "Contextual Isolation Forest Detector",
                "Isolation Forest",
                "1.2.0",
                "Synthetic Campus 60-Day Telemetry",
                now_str,
                "energy_kwh, operating_state, production_output, temperature, historical_dev_pct",
                json.dumps({"n_estimators": 200, "contamination": 0.05, "max_samples": "auto"}),
                json.dumps({"precision": 99.41, "recall": 80.09, "f1": 88.71, "high_priority_precision": 98.80, "fpr": 0.03}),
                "ACTIVE",
                1,
                now_str
            ),
            (
                "mod-zscore-v100",
                "Rolling 24h Z-Score Baseline Detector",
                "Statistical Baseline",
                "1.0.0",
                "Synthetic Campus 60-Day Telemetry",
                now_str,
                "energy_kwh, rolling_mean_24h, rolling_std_24h",
                json.dumps({"window_hours": 24, "z_threshold": 3.0}),
                json.dumps({"precision": 68.40, "recall": 62.10, "f1": 65.10, "high_priority_precision": 72.00, "fpr": 8.20}),
                "VALIDATED",
                0,
                now_str
            ),
            (
                "mod-lof-v090",
                "Local Outlier Factor Density Detector",
                "Density-based Outlier",
                "0.9.0",
                "ASHRAE Great Energy Predictor Benchmark",
                now_str,
                "energy_kwh, temperature, grid_consumption_kwh",
                json.dumps({"n_neighbors": 20, "contamination": 0.05}),
                json.dumps({"unsupervised_anomaly_pct": 5.2, "mean_score": 64.2}),
                "TRAINED",
                0,
                now_str
            )
        ]
        for m in models_seed:
            cursor.execute("""
                INSERT INTO ml_models (
                    model_id, model_name, model_type, version, dataset, trained_at,
                    feature_set, parameters_json, metrics_json, status, active, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, m)

    conn.commit()
    conn.close()

if __name__ == "__main__":
    init_db()
    print(f"Database initialized cleanly at {DB_PATH}")
